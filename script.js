
"use strict";

// ============================================
// AXEL STORE - CONFIGURATION
// ============================================

// Remplacer par le numéro WhatsApp de la boutique
// Format : indicatif + numéro, sans + ni espace
const WHATSAPP_NUMBER = "2250700000000";


const PRODUCTS = [
  {
    id: 1,
    name: "Bonnet nike",
    category: "Mode",
    price: 3000,
    image: "bONNETNIKE.jpeg",
    description: "Bonnet Nike.",
    badge: "Nouveau"
  },
  {
    id: 2,
    name: "Cagoule",
    category: "Mode",
    price: 15000,
    image: "Cagoule.jpeg",
    description: "Cagoule swagg.",
    badge: "Populaire"
  },
  {
    id: 3,
    name: "Sac pochette",
    category: "Accessoires",
    price: 3500,
    image: "pochetteH.jpeg",
    description: "Sac pratique au design raffiné.",
    badge: "Populaire"
  },
  {
    id: 4,
    name: "Durag wave",
    category: "Accessoires",
    price: 1500,
    image: "duragS.jpeg",
    description: "foulard pour homme utile pour les waves sur les cheveux",
    badge: ""
  },
  {
    id: 5,
    name: "Chrome hearts",
    category: "Mode",
    price: 22000,
    image: "chromeH.jpeg",
    description: "pantalon swagg .",
    badge: ""
  },
  {
    id: 6,
    name: "Lunettes Cartier",
    category: "Accessoires",
    price: 7000,
    image: "lunettesC.jpeg",
    description: "Un accessoire tendance.",
    badge: ""
  },
  {
    id: 7,
    name: "Zara Man",
    category: "Lifestyle",
    price: 18000,
    image: "zara man.jpg",
    description: "Parfun Collection Zara.",
    badge: ""
  },
  {
    id: 8,
    name: "sweater",
    category: "Lifestyle",
    price: 7500,
    image: "sweater.jpeg",
    description: "Un style simple et intemporel.",
    badge: ""
  }
];

// ============================================
// ÉLÉMENTS HTML
// ============================================

const $ = (selector) => document.querySelector(selector);

const elements = {
  menuBtn: $("#menuBtn"),
  nav: $("#nav"),
  searchToggle: $("#searchToggle"),
  searchBar: $("#searchBar"),
  globalSearch: $("#globalSearch"),
  favToggle: $("#favToggle"),
  favCount: $("#favCount"),
  cartToggle: $("#cartToggle"),
  cartCount: $("#cartCount"),
  products: $("#products"),
  filters: $("#filters"),
  sort: $("#sort"),
  resultCount: $("#resultCount"),
  empty: $("#empty"),
  overlay: $("#overlay"),
  drawer: $("#drawer"),
  closeDrawer: $("#closeDrawer"),
  drawerTitle: $("#drawerTitle"),
  drawerItems: $("#drawerItems"),
  drawerFooter: $("#drawerFooter"),
  cartTotal: $("#cartTotal"),
  checkout: $("#checkout"),
  clearCart: $("#clearCart"),
  toast: $("#toast"),
  year: $("#year")
};

// ============================================
// STOCKAGE LOCAL
// ============================================

function loadStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

let cart = loadStorage("axel_cart", []);
let favorites = loadStorage("axel_favorites", []);

if (!Array.isArray(cart)) cart = [];
if (!Array.isArray(favorites)) favorites = [];

let activeCategory = "Tous";
let searchQuery = "";
let sortMode = "featured";
let showFavoritesOnly = false;
let drawerMode = "cart";

function saveData() {
  localStorage.setItem("axel_cart", JSON.stringify(cart));
  localStorage.setItem(
    "axel_favorites",
    JSON.stringify(favorites)
  );
}

// ============================================
// FORMAT DES PRIX
// ============================================

function formatPrice(price) {
  return (
    new Intl.NumberFormat("fr-FR").format(price) +
    " FCFA"
  );
}

function getProduct(id) {
  return PRODUCTS.find(product => product.id === Number(id));
}

// ============================================
// NOTIFICATIONS
// ============================================

let toastTimeout;

function showToast(message) {
  if (!elements.toast) return;

  elements.toast.textContent = message;
  elements.toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2800);
}

// ============================================
// MENU MOBILE
// ============================================

function closeMenu() {
  elements.nav?.classList.remove("open");
  elements.menuBtn?.classList.remove("active");
  elements.menuBtn?.setAttribute("aria-expanded", "false");
}

elements.menuBtn?.addEventListener("click", () => {
  const isOpen = elements.nav.classList.toggle("open");

  elements.menuBtn.classList.toggle("active", isOpen);
  elements.menuBtn.setAttribute(
    "aria-expanded",
    String(isOpen)
  );
});

elements.nav?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", closeMenu);
});

// ============================================
// RECHERCHE
// ============================================

elements.searchToggle?.addEventListener("click", () => {
  const isHidden = elements.searchBar.hidden;

  elements.searchBar.hidden = !isHidden;

  if (isHidden) {
    elements.globalSearch.focus();
  } else {
    elements.globalSearch.value = "";
    searchQuery = "";
    renderProducts();
  }
});

elements.globalSearch?.addEventListener("input", event => {
  searchQuery = event.target.value
    .toLowerCase()
    .trim();

  renderProducts();
});

// ============================================
// FILTRES
// ============================================

elements.filters?.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");

  if (!button) return;

  activeCategory = button.dataset.category;

  elements.filters.querySelectorAll(".chip").forEach(chip => {
    chip.classList.toggle("active", chip === button);
  });

  renderProducts();
});

// ============================================
// TRI
// ============================================

elements.sort?.addEventListener("change", event => {
  sortMode = event.target.value;
  renderProducts();
});

// ============================================
// FAVORIS
// ============================================

function isFavorite(id) {
  return favorites.includes(Number(id));
}

function toggleFavorite(id) {
  id = Number(id);

  if (isFavorite(id)) {
    favorites = favorites.filter(item => item !== id);
    showToast("Produit retiré des favoris");
  } else {
    favorites.push(id);
    showToast("Produit ajouté aux favoris");
  }

  saveData();
  updateCounters();
  renderProducts();

  if (drawerMode === "favorites") {
    renderDrawer();
  }
}

elements.favToggle?.addEventListener("click", () => {
  showFavoritesOnly = !showFavoritesOnly;

  elements.favToggle.classList.toggle(
    "active",
    showFavoritesOnly
  );

  renderProducts();

  document.querySelector("#boutique")?.scrollIntoView({
    behavior: "smooth"
  });

  showToast(
    showFavoritesOnly
      ? "Affichage de vos favoris"
      : "Tous les produits"
  );
});

// ============================================
// AFFICHAGE DES PRODUITS
// ============================================

function getFilteredProducts() {
  let result = [...PRODUCTS];

  if (activeCategory !== "Tous") {
    result = result.filter(
      product => product.category === activeCategory
    );
  }

  if (searchQuery) {
    result = result.filter(product => {
      const text = (
        product.name + " " +
        product.category + " " +
        product.description
      ).toLowerCase();

      return text.includes(searchQuery);
    });
  }

  if (showFavoritesOnly) {
    result = result.filter(product =>
      isFavorite(product.id)
    );
  }

  switch (sortMode) {
    case "asc":
      result.sort((a, b) => a.price - b.price);
      break;

    case "desc":
      result.sort((a, b) => b.price - a.price);
      break;

    case "name":
      result.sort((a, b) =>
        a.name.localeCompare(b.name, "fr")
      );
      break;
  }

  return result;
}

function renderProducts() {
  if (!elements.products) return;

  const products = getFilteredProducts();

  elements.products.innerHTML = "";

  if (elements.resultCount) {
    elements.resultCount.textContent =
      `${products.length} article(s)`;
  }

  if (elements.empty) {
    elements.empty.hidden = products.length > 0;
  }

  products.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <div class="product-image">
        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
        >

        ${product.badge
          ? `<span class="product-badge">${product.badge}</span>`
          : ""
        }

        <button
          class="favorite-btn ${isFavorite(product.id) ? "active" : ""}"
          data-favorite="${product.id}"
          aria-label="Ajouter aux favoris"
          aria-pressed="${isFavorite(product.id)}"
        >
          ${isFavorite(product.id) ? "♥" : "♡"}
        </button>
      </div>

      <div class="product-info">
        <span class="product-category">
          ${product.category}
        </span>

        <h3>${product.name}</h3>

        <p>${product.description}</p>

        <div class="product-bottom">
          <strong class="product-price">
            ${formatPrice(product.price)}
          </strong>

          <button
            class="btn primary add-cart"
            data-add="${product.id}"
          >
            Ajouter +
          </button>
        </div>
      </div>
    `;

    elements.products.appendChild(card);
  });
}

// Délégation des événements
elements.products?.addEventListener("click", event => {
  const favoriteButton = event.target.closest("[data-favorite]");
  const addButton = event.target.closest("[data-add]");

  if (favoriteButton) {
    toggleFavorite(favoriteButton.dataset.favorite);
  }

  if (addButton) {
    addToCart(addButton.dataset.add);
  }
});

// ============================================
// PANIER
// ============================================

function addToCart(id) {
  id = Number(id);

  const product = getProduct(id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id,
      quantity: 1
    });
  }

  saveData();
  updateCounters();
  renderDrawer();

  showToast(`${product.name} ajouté au panier`);
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== Number(id));

  saveData();
  updateCounters();
  renderDrawer();

  showToast("Produit retiré du panier");
}

function changeQuantity(id, amount) {
  const item = cart.find(item => item.id === Number(id));

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }

  saveData();
  updateCounters();
  renderDrawer();
}

function getCartTotal() {
  return cart.reduce((total, item) => {
    const product = getProduct(item.id);

    return total +
      (product ? product.price * item.quantity : 0);
  }, 0);
}

function updateCounters() {
  const count = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (elements.cartCount) {
    elements.cartCount.textContent = count;
  }

  if (elements.favCount) {
    elements.favCount.textContent = favorites.length;
  }
}

// ============================================
// PANIER LATÉRAL
// ============================================

function openDrawer() {
  drawerMode = "cart";

  elements.drawer?.classList.add("open");
  elements.overlay.hidden = false;

  elements.drawer?.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  renderDrawer();
}

function closeDrawer() {
  elements.drawer?.classList.remove("open");

  if (elements.overlay) {
    elements.overlay.hidden = true;
  }

  elements.drawer?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

elements.cartToggle?.addEventListener("click", openDrawer);
elements.closeDrawer?.addEventListener("click", closeDrawer);
elements.overlay?.addEventListener("click", closeDrawer);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeDrawer();
    closeMenu();
  }
});

// ============================================
// CONTENU DU PANIER
// ============================================

function renderDrawer() {
  if (!elements.drawerItems) return;

  elements.drawerItems.innerHTML = "";

  if (elements.drawerTitle) {
    elements.drawerTitle.textContent = "Mon panier";
  }

  if (cart.length === 0) {
    elements.drawerItems.innerHTML = `
      <div class="cart-empty">
        <div style="font-size:48px">🛍</div>
        <h3>Votre panier est vide</h3>
        <p>Découvrez notre collection AXEL.</p>
      </div>
    `;
  } else {
    cart.forEach(item => {
      const product = getProduct(item.id);
      if (!product) return;

      const row = document.createElement("div");
      row.className = "cart-item";

      row.innerHTML = `
        <img
          src="${product.image}"
          alt="${product.name}"
          class="cart-item-image"
        >

        <div class="cart-item-info">
          <h4>${product.name}</h4>

          <strong>
            ${formatPrice(product.price)}
          </strong>

          <div class="quantity-controls">
            <button data-minus="${item.id}">−</button>
            <span>${item.quantity}</span>
            <button data-plus="${item.id}">+</button>
          </div>

          <button
            class="remove-item"
            data-remove="${item.id}"
          >
            Supprimer
          </button>
        </div>
      `;

      elements.drawerItems.appendChild(row);
    });
  }

  if (elements.cartTotal) {
    elements.cartTotal.textContent =
      formatPrice(getCartTotal());
  }

  if (elements.checkout) {
    elements.checkout.disabled = cart.length === 0;
  }

  if (elements.clearCart) {
    elements.clearCart.disabled = cart.length === 0;
  }
}

elements.drawerItems?.addEventListener("click", event => {
  const plus = event.target.closest("[data-plus]");
  const minus = event.target.closest("[data-minus]");
  const remove = event.target.closest("[data-remove]");

  if (plus) changeQuantity(plus.dataset.plus, 1);
  if (minus) changeQuantity(minus.dataset.minus, -1);
  if (remove) removeFromCart(remove.dataset.remove);
});

// ============================================
// VIDER LE PANIER
// ============================================

elements.clearCart?.addEventListener("click", () => {
  if (cart.length === 0) return;

  if (confirm("Voulez-vous vider votre panier ?")) {
    cart = [];

    saveData();
    updateCounters();
    renderDrawer();

    showToast("Panier vidé avec succès");
  }
});

// ============================================
// COMMANDE WHATSAPP
// ============================================

elements.checkout?.addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Votre panier est vide");
    return;
  }

  if (!WHATSAPP_NUMBER || WHATSAPP_NUMBER === "2250700000000") {
    showToast("Configurez le numéro WhatsApp de la boutique");
    return;
  }

  let message = "Bonjour AXEL Store !\n\n";
  message += "Je souhaite commander :\n\n";

  cart.forEach(item => {
    const product = getProduct(item.id);
    if (!product) return;

    message += `• ${product.name}\n`;
    message += `Quantité : ${item.quantity}\n`;
    message += `Prix : ${formatPrice(product.price * item.quantity)}\n\n`;
  });

  message += "-------------------------\n";
  message += `TOTAL : ${formatPrice(getCartTotal())}\n\n`;
  message += "Merci de confirmer la disponibilité et la livraison.";

  const url =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank", "noopener,noreferrer");
});

// ============================================
// ANNÉE AUTOMATIQUE
// ============================================

if (elements.year) {
  elements.year.textContent = new Date().getFullYear();
}

// ============================================
// INITIALISATION
// ============================================

function init() {
  updateCounters();
  renderProducts();
  renderDrawer();

  console.log("AXEL Store initialisé avec succès !");
}

init();
