/* ==========================================================
   AXEL Store : logique de la boutique
   ========================================================== */
(() => {
    "use strict";

    /* ---------- CONFIGURATION ---------- */
    const WHATSAPP_NUMBER = "2250152348458";
    const CURRENCY = "FCFA";

    const SUPABASE_URL = "https://snmezmufubfprpkeketw.supabase.co";
    const SUPABASE_KEY = "sb_publishable_Hg9RT3YQWrlxM8HGGEUklA_Ln8csLiU";

    let PRODUCTS = [];

    /* Liste de secours, utilisée seulement si la base est injoignable */
    const FALLBACK_PRODUCTS = [
        { id: 1, name: "Cagoule", category: "Mode",        price: 18000, image: "Cagoule.jpeg", badge: "Nouveau" },
        { id: 2, name: "Pantalon Chrome", category: "Mode",        price: 3000, image: "chromeH.jpeg" },
        { id: 3, name: "Sweater",        category: "Mode",        price: 9000, image: "sweater.jpeg" },
        { id: 4, name: "Zara Man",    category: "Accessoires", price: 10000, image: "zara man.jpg",  },
        { id: 5, name: "Durag Wave",    category: "Accessoires", price: 1500, image: "duragS.jpeg" },
        { id: 6, name: "Lunettes Cartier",  category: "Accessoires", price: 7000, image: "lunettesC.jpeg", badge: "Populaire" },
        { id: 7, name: "Sac Pochette",    category: "Lifestyle",   price: 5000, image: "pochetteH.jpeg" },
        { id: 8, name: "Bonnet Nike",    category: "Lifestyle",   price: 3000,  image: "bONNETNIKE.jpeg" }
    ];

    /* ---------- OUTILS ---------- */
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

    const formatPrice = n => `${new Intl.NumberFormat("fr-FR").format(n).replace(/\u202f|\u00a0/g, " ")} ${CURRENCY}`;

    const escapeHTML = s => String(s).replace(/[&<>"']/g, c =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    const store = {
        get(key, fallback) {
            try {
                const raw = localStorage.getItem(key);
                return raw ? JSON.parse(raw) : fallback;
            } catch { return fallback; }
        },
        set(key, value) {
            try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* stockage indisponible */ }
        }
    };

    /* ---------- ÉTAT ---------- */
    const state = {
        category: "Tous",
        sort: "featured",
        query: "",
        cart: store.get("axel_cart", []),      // [{ id, qty }]
        favs: store.get("axel_favs", []),      // [id]
        drawerMode: "cart"                     // "cart" | "favs"
    };

    const productById = id => PRODUCTS.find(p => p.id === id);

    /* ---------- ÉLÉMENTS ---------- */
    const el = {
        header: $("#header"),
        menuBtn: $("#menuBtn"),
        nav: $("#nav"),
        navOverlay: $("#navOverlay"),
        searchToggle: $("#searchToggle"),
        searchBar: $("#searchBar"),
        search: $("#globalSearch"),
        favToggle: $("#favToggle"),
        cartToggle: $("#cartToggle"),
        favCount: $("#favCount"),
        cartCount: $("#cartCount"),
        filters: $("#filters"),
        sort: $("#sort"),
        products: $("#products"),
        empty: $("#empty"),
        resetFilters: $("#resetFilters"),
        resultCount: $("#resultCount"),
        overlay: $("#overlay"),
        drawer: $("#drawer"),
        drawerTitle: $("#drawerTitle"),
        drawerItems: $("#drawerItems"),
        drawerFooter: $("#drawerFooter"),
        closeDrawer: $("#closeDrawer"),
        cartTotal: $("#cartTotal"),
        checkout: $("#checkout"),
        clearCart: $("#clearCart"),
        toast: $("#toast"),
        year: $("#year")
    };

    /* ---------- NOTIFICATION ---------- */
    let toastTimer;
    function toast(message) {
        el.toast.textContent = message;
        el.toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2200);
    }

    /* ---------- IMAGES ---------- */
    function mediaHTML(p) {
        return p.image
            ? `<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" loading="lazy">`
            : `<div class="product-placeholder" aria-hidden="true">${escapeHTML(p.name.charAt(0))}</div>`;
    }

    /* ---------- CATALOGUE ---------- */
    function visibleProducts() {
        const q = state.query.trim().toLowerCase();
        let list = PRODUCTS.filter(p =>
            (state.category === "Tous" || p.category === state.category) &&
            (!q || `${p.name} ${p.category}`.toLowerCase().includes(q))
        );

        if (state.sort === "asc") list.sort((a, b) => a.price - b.price);
        if (state.sort === "desc") list.sort((a, b) => b.price - a.price);
        if (state.sort === "name") list.sort((a, b) => a.name.localeCompare(b.name, "fr"));
        return list;
    }

    function renderProducts() {
        const list = visibleProducts();

        el.products.innerHTML = list.map(p => {
            const isFav = state.favs.includes(p.id);
            return `
            <article class="product">
                <div class="product-media">
                    ${mediaHTML(p)}
                    ${p.badge ? `<span class="product-badge">${escapeHTML(p.badge)}</span>` : ""}
                    <button class="fav-btn ${isFav ? "active" : ""}" type="button"
                            data-fav="${p.id}"
                            aria-pressed="${isFav}"
                            aria-label="${isFav ? "Retirer des favoris" : "Ajouter aux favoris"} : ${escapeHTML(p.name)}">
                        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                            <path d="M12 21s-7-4.6-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12C19 16.4 12 21 12 21z"/>
                        </svg>
                    </button>
                </div>
                <div class="product-info">
                    <div class="product-cat">${escapeHTML(p.category)}</div>
                    <h3 class="product-name">${escapeHTML(p.name)}</h3>
                    <div class="product-price">${formatPrice(p.price)}</div>
                </div>
                <button class="add-btn" type="button" data-add="${p.id}">Ajouter au panier</button>
            </article>`;
        }).join("");

        el.empty.hidden = list.length > 0;
        el.resultCount.textContent = `${list.length} article${list.length > 1 ? "s" : ""}`;
    }

    /* ---------- FAVORIS ---------- */
    function toggleFav(id) {
        const i = state.favs.indexOf(id);
        if (i === -1) {
            state.favs.push(id);
            toast("Ajouté aux favoris");
        } else {
            state.favs.splice(i, 1);
            toast("Retiré des favoris");
        }
        store.set("axel_favs", state.favs);
        renderProducts();
        renderCounts(true);
        if (isDrawerOpen() && state.drawerMode === "favs") renderDrawer();
    }

    /* ---------- PANIER ---------- */
    function addToCart(id, qty = 1) {
        const line = state.cart.find(l => l.id === id);
        if (line) line.qty += qty;
        else state.cart.push({ id, qty });
        persistCart();
        toast(`${productById(id).name} ajouté au panier`);
    }

    function changeQty(id, delta) {
        const line = state.cart.find(l => l.id === id);
        if (!line) return;
        line.qty += delta;
        if (line.qty <= 0) state.cart = state.cart.filter(l => l.id !== id);
        persistCart();
    }

    function removeLine(id) {
        state.cart = state.cart.filter(l => l.id !== id);
        persistCart();
    }

    function cartTotal() {
        return state.cart.reduce((sum, l) => sum + productById(l.id).price * l.qty, 0);
    }

    function persistCart() {
        store.set("axel_cart", state.cart);
        renderCounts(true);
        if (isDrawerOpen() && state.drawerMode === "cart") renderDrawer();
    }

    function renderCounts(animate = false) {
        const cartQty = state.cart.reduce((n, l) => n + l.qty, 0);
        const favQty = state.favs.length;

        [[el.cartCount, cartQty], [el.favCount, favQty]].forEach(([node, value]) => {
            const changed = node.textContent !== String(value);
            node.textContent = value;
            node.hidden = value === 0;
            if (animate && changed && value > 0) {
                node.classList.remove("bump");
                void node.offsetWidth;
                node.classList.add("bump");
            }
        });
    }

    /* ---------- PANNEAU LATÉRAL ---------- */
    const isDrawerOpen = () => el.drawer.classList.contains("open");
    let lastFocus = null;

    function renderDrawer() {
        const isCart = state.drawerMode === "cart";
        el.drawerTitle.textContent = isCart ? "Mon panier" : "Mes favoris";
        el.drawerFooter.hidden = !isCart || state.cart.length === 0;

        if (isCart) {
            if (state.cart.length === 0) {
                el.drawerItems.innerHTML = `
                    <div class="drawer-empty">
                        <strong>Votre panier est vide</strong>
                        Ajoutez un article depuis la boutique pour commencer.
                    </div>`;
                return;
            }

            el.drawerItems.innerHTML = state.cart.map(l => {
                const p = productById(l.id);
                return `
                <div class="line">
                    <div class="line-media">${mediaHTML(p)}</div>
                    <div class="line-body">
                        <div class="line-name">${escapeHTML(p.name)}</div>
                        <div class="line-price">${formatPrice(p.price)}</div>
                        <div class="line-actions">
                            <div class="qty" role="group" aria-label="Quantité de ${escapeHTML(p.name)}">
                                <button type="button" data-dec="${p.id}" aria-label="Retirer une unité">−</button>
                                <span aria-live="polite">${l.qty}</span>
                                <button type="button" data-inc="${p.id}" aria-label="Ajouter une unité">+</button>
                            </div>
                            <button class="remove-btn" type="button" data-remove="${p.id}">Supprimer</button>
                        </div>
                    </div>
                </div>`;
            }).join("");

            el.cartTotal.textContent = formatPrice(cartTotal());
        } else {
            if (state.favs.length === 0) {
                el.drawerItems.innerHTML = `
                    <div class="drawer-empty">
                        <strong>Aucun favori pour l'instant</strong>
                        Touchez le cœur sur un article pour le retrouver ici.
                    </div>`;
                return;
            }

            el.drawerItems.innerHTML = state.favs.map(id => {
                const p = productById(id);
                return `
                <div class="line">
                    <div class="line-media">${mediaHTML(p)}</div>
                    <div class="line-body">
                        <div class="line-name">${escapeHTML(p.name)}</div>
                        <div class="line-price">${formatPrice(p.price)}</div>
                        <div class="line-actions">
                            <button class="line-add" type="button" data-add="${p.id}">Ajouter au panier</button>
                            <button class="remove-btn" type="button" data-unfav="${p.id}">Retirer</button>
                        </div>
                    </div>
                </div>`;
            }).join("");
        }
    }

    function openDrawer(mode) {
        closeMenu();
        state.drawerMode = mode;
        renderDrawer();
        lastFocus = document.activeElement;

        el.overlay.hidden = false;
        requestAnimationFrame(() => {
            el.overlay.classList.add("open");
            el.drawer.classList.add("open");
        });
        el.drawer.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        setTimeout(() => el.closeDrawer.focus(), 50);
    }

    function closeDrawer() {
        if (!isDrawerOpen()) return;
        el.overlay.classList.remove("open");
        el.drawer.classList.remove("open");
        el.drawer.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        setTimeout(() => { el.overlay.hidden = true; }, 300);
        if (lastFocus) lastFocus.focus();
    }

    /* ---------- MENU HAMBURGER ---------- */
    function openMenu() { setMenu(true); }
    function closeMenu() { setMenu(false); }

    function setMenu(open) {
        el.menuBtn.setAttribute("aria-expanded", String(open));
        el.menuBtn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
        el.nav.classList.toggle("open", open);
        el.navOverlay.classList.toggle("open", open);
        if (!isDrawerOpen()) document.body.style.overflow = open ? "hidden" : "";
    }

    /* ---------- RECHERCHE ---------- */
    function toggleSearch() {
        const open = el.searchBar.hidden;
        el.searchBar.hidden = !open;
        el.searchToggle.setAttribute("aria-expanded", String(open));
        if (open) el.search.focus();
        else if (state.query) {
            el.search.value = "";
            state.query = "";
            renderProducts();
        }
    }

    /* ---------- COMMANDE WHATSAPP ---------- */

    /* Enregistre la commande et renvoie son numéro (ou null en cas d'échec) */
    async function saveOrder() {
        const items = state.cart.map(l => ({ id: l.id, qty: l.qty }));
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/create_order`, {
                method: "POST",
                headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
                body: JSON.stringify({ p_items: items })
            });
            if (!res.ok) throw new Error(`Supabase ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error("Commande non enregistrée :", err);
            return null;
        }
    }

    async function checkout() {
        if (state.cart.length === 0 || el.checkout.disabled) return;

        // On ouvre l'onglet tout de suite (sinon le navigateur le bloque), puis on le redirige
        const win = window.open("", "_blank");
        el.checkout.disabled = true;

        const orderId = await Promise.race([
            saveOrder(),
            new Promise(resolve => setTimeout(() => resolve(null), 4000))
        ]);

        const lines = state.cart.map(l => {
            const p = productById(l.id);
            return `• ${l.qty} x ${p.name} : ${formatPrice(p.price * l.qty)}`;
        });

        const message = [
            "Bonjour AXEL, je souhaite commander :",
            ...(orderId ? ["", `Commande n° ${orderId}`] : []),
            "",
            ...lines,
            "",
            `Total : ${formatPrice(cartTotal())}`,
            "",
            "Pouvez-vous confirmer la disponibilité et les frais de livraison ? Merci."
        ].join("\n");

        const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        if (win) { win.opener = null; win.location.href = link; }
        else { window.location.href = link; }

        el.checkout.disabled = false;
    }

    /* ---------- ÉVÉNEMENTS ---------- */
    // Menu
    el.menuBtn.addEventListener("click", () =>
        setMenu(el.menuBtn.getAttribute("aria-expanded") !== "true"));
    el.navOverlay.addEventListener("click", closeMenu);
    $$("a", el.nav).forEach(a => a.addEventListener("click", closeMenu));

    // Recherche
    el.searchToggle.addEventListener("click", toggleSearch);
    el.search.addEventListener("input", () => {
        state.query = el.search.value;
        renderProducts();
    });

    // Filtres et tri
    el.filters.addEventListener("click", e => {
        const chip = e.target.closest(".chip");
        if (!chip) return;
        state.category = chip.dataset.category;
        $$(".chip", el.filters).forEach(c => c.classList.toggle("active", c === chip));
        renderProducts();
    });

    el.sort.addEventListener("change", () => {
        state.sort = el.sort.value;
        renderProducts();
    });

    el.resetFilters.addEventListener("click", () => {
        state.category = "Tous";
        state.query = "";
        state.sort = "featured";
        el.search.value = "";
        el.sort.value = "featured";
        $$(".chip", el.filters).forEach(c => c.classList.toggle("active", c.dataset.category === "Tous"));
        renderProducts();
    });

    // Grille de produits
    el.products.addEventListener("click", e => {
        const fav = e.target.closest("[data-fav]");
        if (fav) return toggleFav(Number(fav.dataset.fav));

        const add = e.target.closest("[data-add]");
        if (add) addToCart(Number(add.dataset.add));
    });

    // Panneau latéral
    el.favToggle.addEventListener("click", () => openDrawer("favs"));
    el.cartToggle.addEventListener("click", () => openDrawer("cart"));
    el.closeDrawer.addEventListener("click", closeDrawer);
    el.overlay.addEventListener("click", closeDrawer);

    el.drawerItems.addEventListener("click", e => {
        const t = e.target.closest("button");
        if (!t) return;
        if (t.dataset.inc) changeQty(Number(t.dataset.inc), 1);
        else if (t.dataset.dec) changeQty(Number(t.dataset.dec), -1);
        else if (t.dataset.remove) removeLine(Number(t.dataset.remove));
        else if (t.dataset.add) addToCart(Number(t.dataset.add));
        else if (t.dataset.unfav) toggleFav(Number(t.dataset.unfav));
    });

    el.clearCart.addEventListener("click", () => {
        state.cart = [];
        persistCart();
        toast("Panier vidé");
    });

    el.checkout.addEventListener("click", checkout);

    // Clavier
    document.addEventListener("keydown", e => {
        if (e.key !== "Escape") return;
        closeMenu();
        closeDrawer();
    });

    // Synchronise plusieurs onglets ouverts
    window.addEventListener("storage", e => {
        if (e.key === "axel_cart") state.cart = store.get("axel_cart", []);
        if (e.key === "axel_favs") state.favs = store.get("axel_favs", []);
        renderCounts();
        renderProducts();
        if (isDrawerOpen()) renderDrawer();
    });

    /* ---------- DÉMARRAGE ---------- */
    async function loadProducts() {
        const url = `${SUPABASE_URL}/rest/v1/products`
            + `?select=id,name,price,image_url,badge,category:categories(name)`
            + `&is_active=eq.true&order=id.asc`;

        const res = await fetch(url, { headers: { apikey: SUPABASE_KEY } });
        if (!res.ok) throw new Error(`Supabase ${res.status}`);

        const rows = await res.json();
        return rows.map(r => ({
            id: r.id,
            name: r.name,
            category: r.category ? r.category.name : "Autre",
            price: r.price,
            image: r.image_url || "",
            badge: r.badge || ""
        }));
    }

    async function start() {
        el.year.textContent = new Date().getFullYear();
        el.products.innerHTML = `<p class="loading">Chargement des articles…</p>`;
        renderCounts();

        try {
            PRODUCTS = await loadProducts();
        } catch (err) {
            console.error("Chargement des produits impossible :", err);
            PRODUCTS = FALLBACK_PRODUCTS;
            toast("Connexion à la base impossible, affichage hors ligne");
        }

        // Nettoie panier et favoris si un produit a disparu
        state.cart = state.cart.filter(l => productById(l.id) && l.qty > 0);
        state.favs = state.favs.filter(id => productById(id));

        renderCounts();
        renderProducts();
    }

    start();
})();
