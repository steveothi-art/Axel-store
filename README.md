AXEL STORE 🛍️
L'essentiel du style. Sans compromis.
AXEL STORE est une boutique en ligne responsive développée avec HTML5, CSS3 et JavaScript (Vanilla JS). Elle présente une sélection d'articles de mode, d'accessoires et de lifestyle, avec un panier interactif et une préparation des commandes sur WhatsApp.
✨ Fonctionnalités
- Catalogue dynamique de huit produits, affichés depuis le tableau PRODUCTS du fichier JavaScript.
- Recherche instantanée par nom, catégorie ou description.
- Filtres : Tous, Mode, Accessoires et Lifestyle.
- Tri : mise en avant, prix croissant, prix décroissant et nom de A à Z.
- Favoris : ajout et retrait de produits, avec compteur.
- Panier : ajout, suppression, changement de quantité et calcul automatique du total.
- Sauvegarde locale du panier et des favoris grâce à localStorage.
- Commande WhatsApp : création d'un message récapitulatif avec le prix unitaire, la quantité, le sous-total par article et le total général.
- Interface responsive avec menu mobile et panneau latéral pour le panier.
🎨 Identité visuelle
Le site privilégie un fond blanc, des textes sombres et des accents rouges. Les principales couleurs déclarées en CSS sont :
Variable	Couleur	Usage
--white	#fff	Fond principal
--ink	#151515	Texte et boutons
--red	#c91f32	Accents et interactions
--soft	#f7f7f7	Surfaces secondaires


🧰 Technologies
Technologie	Rôle
HTML5	Structure et contenu
CSS3	Mise en page, styles et responsive
JavaScript	Catalogue, filtres, favoris, panier et commande
localStorage	Conservation locale du panier et des favoris
WhatsApp (wa.me)	Préparation du message de commande


Aucun framework ni serveur backend n'est requis pour cette version.
📁 Structure du projet
Les noms de fichiers ci-dessous correspondent aux références présentes dans le HTML. Le nom du fichier HTML peut être index.html pour l'hébergement.
AXEL-STORE/
├── index.html
├── style.css
├── sript.js
├── AXELlogo.jpeg
├── bONNETNIKE.jpeg
├── Cagoule.jpeg
├── pochetteH.jpeg
├── duragS.jpeg
├── chromeH.jpeg
├── lunettesC.jpeg
├── zara man.jpg
├── sweater.jpeg
└── README.md
Les images doivent se trouver aux chemins indiqués dans Axel.js. Respectez la casse et les espaces des noms de fichiers.

🚀 Installation et lancement
1. Téléchargez ou clonez le dépôt.
2. Ouvrez le dossier du projet dans Visual Studio Code.
3. Vérifiez que index.html référence bien styleA.css et Axel.js.
4. Lancez index.html avec Live Server (recommandé) ou ouvrez-le dans votre navigateur.
Pour cloner un dépôt publié sur GitHub :
git clone https://github.com/steveothi-art/AXEL-STORE.git
cd AXEL-STORE

🛒 Utiliser la boutique
1. Parcourez les articles ou utilisez la recherche et les filtres.
2. Cliquez sur Ajouter + pour placer un article dans le panier.
3. Ouvrez le panier, puis ajustez les quantités avec les boutons + et −.
4. Cliquez sur Commander sur WhatsApp.
5. Vérifiez le message préparé et appuyez sur Envoyer dans WhatsApp.
Le message comprend les articles, leurs prix unitaires, les quantités, les sous-totaux et le total de la commande. Les frais de livraison ne sont pas inclus : ils doivent être confirmés avec le vendeur. L'ouverture de WhatsApp ne signifie pas que la commande a été envoyée automatiquement.
⚙️ Personnalisation
Ajouter ou modifier un produit
Dans Axel.js, modifiez le tableau PRODUCTS en respectant la structure suivante :
{
  id: 9,
  name: "Nouvel article",
  category: "Mode",
  price: 5000,
  image: "nouvel-article.jpeg",
  description: "Description du produit.",
  badge: "Nouveau"
}
Chaque produit doit avoir un identifiant unique. Les catégories doivent correspondre aux valeurs des filtres HTML : Mode, Accessoires ou Lifestyle. Ajoutez aussi le fichier image correspondant.
Configurer WhatsApp
Dans script.js, la constante de configuration est :
const WHATSAPP_NUMBER = "2250152348458";
Le numéro doit être au format international, sans +, espaces ni tirets. Vérifiez qu'il correspond bien au numéro WhatsApp du vendeur avant de mettre le site en ligne.
Modifier le style
Modifiez les variables CSS dans style.css pour adapter les couleurs, les espacements et les composants à l'identité visuelle de la boutique.
📱 Responsive
La feuille de style prévoit des adaptations pour les écrans de largeur inférieure à 900 px, 650 px et 360 px. Il reste recommandé de tester les pages sur différents téléphones, tablettes et navigateurs avant publication.
🌐 Déploiement
Cette version statique peut être publiée sur GitHub Pages, Netlify ou Vercel. Assurez-vous que le fichier d'accueil se nomme index.html et que toutes les images et ressources sont bien présentes dans le dépôt.
⚠️ Limites de cette version
- Les produits et leurs prix sont définis directement dans le JavaScript.
- Le panier et les favoris sont conservés dans le navigateur de chaque visiteur, et non dans une base de données centrale.
- Il n'existe pas encore d'espace administrateur, de gestion des stocks ou de suivi des commandes.
- La commande est préparée dans WhatsApp : le client doit l'envoyer lui-même.
- Aucun paiement en ligne n'est intégré.
🔭 Évolutions possibles
- Tableau de bord administrateur pour gérer les produits.
- Backend Node.js / Express et base de données.
- Gestion des stocks et des commandes.
- Comptes clients et historique d'achats.
- Paiement Mobile Money et suivi des livraisons.
👨‍💻 Développement
Développement web : Maewen'Steve
© 2026 AXEL STORE — Tous droits réservés.
