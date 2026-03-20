# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. D'abord lancer le backend pour voir si sa fonctionne bien :

   '''bash
   cd foodiespot-backend
   npm install
   npm run dev
   '''

4. Start the app

   ```bash
   npx expo start ```
 
 Mais avant de faire npx expo start, il faut d'abord aller dans constants/config.ts : 
 API_URL: 'http://192.168.1.91:4000/', tu remplace 92.168.1.91 par ton IP locale.
 Pour trouver ton IP locale, tu dois chercher avec 'ipconfig' sur Windows ou 'ifconfig' sur Mac.

5. Ce que j'ai corrigé:


5.1. Voici les bugs que j'ai trouvés et corrigés : 


- 'resurantId' dans types/index.ts devait etre 'restaurantId'.

- 'deliveryTime' mal typé alors j'ai ajouté '{ min: number; max: number } | number'.

- 'reviewsCount' est mal typé alors j'ai modifié reviewsCount => reviewCount.

- Les imports '../../services/api' dans 'profile.tsx furent remplacer par '@/services/api. 

- Ajout des status manquant dans Order : 'ready', 'picked-up', 'delivering'.

- 'toggleFavorite' dans api.ts était vide alors j'ai implenté l'appel API: implémentation avec 'POST /user/favorites/:id'.

- 'use-notification.ts' : il y'avait 3 appels mais on essait de récupérer 4 valeurs, donc 'badge' : recevait la mauvaise valeur. J'ai décommenté 'getBadge()' et réordonné les variables.

- 'notifications.txs' : 'useEffects' sans '[]' donne boucle infini donc ajout de '[]'.

- 'auth-context.tsx': J'ai du supprimer 'setTimeout(100)' car il causait une boucle de redirection aprés login.

- Dans'dish/[id].tsx' les IDs 'r1' et 'r2' étaient hardcodés ce qui faisait que ça ne marché pas alors j'ai passé le 'restaurantId' en parametre de navigation.

- Correction du bouton Share dans 'restaurant/[id].tsx' car il appelait 'handleToggleFavorite' par erreur, les boutons Itinéraire et Appeler n'avaient pas de 'onPress'.

- 'getCurrentUser()' lisait dans AsyncStorage mais 'auth.ts' sauvegardait dans SecureStore, deux stockages différents donc le user était toujours null et le profil chargeait indéfiniment.

- Dans 'contentContainerStyle' de la FlatList, 'flex: 1' bloquait le scroll, alors je l'ai remplacé par 'paddingBottom: 16'.

- 'CategoryList' : les catégories s'affichaient mais cliquer dessus ne filtrait rien car les 'onSelectCategory' n'étaient pas passées.

- 'order-card.tsx' : crashé car 'item.dish.name' était undefined, le backend renvoiyais donc 'item.menuItem.name' pour les nouvelles commandes. J'ai ajouté '(item: any) dish?.name || menuItem?.name'.

- 'tracking/[orderId].tsx' : crashait aussi car 'deliveryAddress' est un objet mais était affiché directement dans un '<Text>'. J'ai extrait 'street' et 'city' avec 'as any'.

- 'DishCard' : le bouton '+' n'avait pas de 'onAddToCart`, il naviguait vers l'écran dish au lieu d'ajouter au panier directement

- Code promo : crashait avec '.toFixed()' car le backend renvoyait 'discount: "free_delivery"' (une string) pour les codes livraison gratuite au lieu d'un number. J'ai ajouté une vérification 'typeof result.discount === 'number''

- Favoris erreur 403 : l'URL était '/users/favorites' avec un s' mais le backend attend '/user/favorites' sans 's'. J'ai corrigé l'URL dans 'api.ts'

- Le compteur de favoris affichait toujours 0 même après avoir sélectionné des restaurants — 'user.favoriteRestaurants' était toujours vide car les favoris sont stockés séparément côté backend. J'ai ajouté 'userAPI.getFavorites()' pour récupérer le vrai nombre

- Le compteur d'adresses affichait 0 dans le profil même après en avoir ajouté — le user stocké localement n'était pas mis à jour. J'ai corrigé en appelant 'userAPI.getAddresses()' directement depuis l'API

- 'login.tsx' : la validation email utilisait juste '.includes('@')' ce qui était trop basique. J'ai ajouté une regex complète et une vérification de la longueur minimum du mot de passe


- 'register.tsx' : même correction pour l'email

5.2 Les écrans : cart.tsx, checkout.tsx et review/[orderId] étaient déja déclaré dans le layout mais étant donné que ces fichiers n'existaient pas, je les ai créer.


- 'cart.tsx' : contient les listes des plats avec modification des quantités et cacul des frais de livraison.

- 'checkout.tsx' : contient la fconfirmation de commande avec adresse, mode de paiement et code de paiement.

- 'review/[orderId].tsx' : écran ou page pour qui permet de laisser un avis apres la livraison.

- 'addresses.tsx' : c'est ici qu'on gère les adresses depuis le profil (par exemple : ajouter ou supprimer une adresse).

- 'onboarding.tsx' : slides au premier lancement.


6. Voici les fonctionalités que j'ai implémenté : 

Parmis les 10 fonctionnalité donnée, j'en ai choisis 7 à impé=lémenté :

6.A Dark Mode :

J'ai créé un 'ThemeContext' avec 3 modes : clair, sombre et automatique (suit le téléphone). Le choix est sauvegardé dans AsyncStorage donc gardé même après fermeture de l'app. Toggle disponible dans le profil avec les boutons ☀️ 📱 🌙. Appliqué sur tous les écrans.
 

- Pourquoi : une app de livraison s'utilise souvent le soir, le mode sombre est plus agréable et c'est une fonctionnalité attendue sur mobile en 2025.

- Difficulté rencontrée : passer les couleurs à tous les écrans sans tout dupliquer. J'ai utilisé 'colors.background", 'colors.text', 'colors.card' depuis le contexte et je les ai appliqués écran par écran.


6.B Système de panier :

'CartContext' global avec ajout, suppression et modification de quantité. Si on ajoute un plat d'un autre restaurant le panier se vide automatiquement avec une alerte. Livraison gratuite au dessus de 25€.

- Pourquoi : le panier est au cœur d'une app de livraison. Sans contexte global, chaque écran aurait dû gérer son propre état ce qui aurait causé des problèmes de synchronisation.

- Difficulté rencontrée : au début j'avais essayé avec 'useState' dans chaque écran mais c'était impossible à synchroniser. J'ai donc utilisé un contexte global pour que le panier soit accessible partout dans l'app.


6.D Avis avec photos et notes par critère: 

L'écran review permet une note globale en étoiles, trois sous-notes par critère (qualité, rapidité, présentation), un commentaire et jusqu'à 3 photos via 'expo-image-picker'. Les avis s'affichent ensuite sur la page du restaurant.

- Pourquoi : les avis détaillés donnent plus d'informations aux autres utilisateurs et permettent aux restaurants de savoir ce qu'ils doivent améliorer.

- Difficulté rencontrée : l'upload de photos nécessitait de gérer les permissions de l'appareil et convertir l'image en 'FormData' pour l'envoyer à l'API. J'ai aussi eu une erreur 403 au moment de publier car le token avait expiré.


6.F Historique des recherches récentes :

Les 5 dernières recherches sont sauvegardées dans AsyncStorage. Elles s'affichent sous la barre de recherche quand le champ est vide pour pouvoir les relancer rapidement.

- Pourquoi : améliore l'UX en permettant de retrouver rapidement un restaurant qu'on a déjà cherché sans avoir à retaper.

- Difficulté rencontrée : pas grand chose de compliqué ici, la clé 'RECENT_SEARCHES' était déjà déclarée dans 'storage.ts' mais jamais utilisée. J'ai juste eu à l'utiliser et à gérer la limite de 5 recherches avec '.slice(0, 5)'.

6.G Code promo :

Dans le checkout, validation du code promo en temps réel via 'POST /promos/validate'. La réduction s'affiche dynamiquement avant confirmation. Les codes qui marchent : 'BIENVENUE30', 'FOODIE10', 'LIVRAISON'.

- 'Pourquoi' : les codes promo sont un levier marketing classique. La validation en temps réel évite une mauvaise surprise au moment de confirmer la commande.

- Difficulté rencontrée : le backend renvoyait 'discount: "free_delivery"' (une string) pour les codes de type livraison gratuite au lieu d'un nombre. Ça faisait crasher '.toFixed()'. J'ai ajouté une vérification 'typeof result.discount === 'number'' pour gérer les deux cas.


6.H Onboarding au premier lancement!

3 slides qui s'affichent uniquement au premier lancement de l'app. J'utilise AsyncStorage pour sauvegarder le flag 'onboarding_done'. Les slides présentent rapidement les fonctionnalités principales de FoodieSpot.

- Pourquoi : l'onboarding aide les nouveaux utilisateurs à comprendre les fonctionnalités de l'app dès le départ sans avoir à les découvrir par hasard.

- Difficulté rencontrée : s'assurer que l'onboarding ne s'affiche qu'une seule fois et ne bloque pas la navigation après. J'ai mis la vérification dans '_layout.tsx' au chargement de l'app.

6.I Gestion des adresses de livaison :

Depuis le profil on peut ajouter, supprimer et définir une adresse par défaut. Dans le checkout on peut choisir l'adresse de livraison parmi toutes ses adresses. J'utilise les endpoints '/users/addresses' du backend.

- Pourquoi : indispensable pour la livraison. Sans adresse enregistrée le checkout affichait un message d'erreur et on ne pouvait pas commander.

- Difficulté rencontrée : le compteur d'adresses dans le profil affichait toujours 0 car le user stocké localement n'était pas mis à jour quand on ajoutait une adresse. J'ai corrigé en chargeant les adresses directement depuis l'API avec 'userAPI.getAddresses()'.

6.1 Multilangue EN/FR :

Contexte de langue avec les traductions FR et EN dans 'constants/i18n.ts'. Toggle 🇫🇷 🇬🇧 dans le profil. La langue est sauvegardée dans AsyncStorage. Appliqué sur tous les écrans.

- Pourquoi : la consigne demandait explicitement le multilangue. C'est aussi utile pour une app utilisée par des touristes à Paris.

- Difficulté rencontrée : il fallait remplacer tous les textes hardcodés dans tous les écrans un par un. J'ai créé toutes les traductions dans un seul fichier 'i18n.ts' et utilisé 'const { t } = useLanguage()' dans chaque écran.

6.2 Mode de paiement: 

Dans le checkout, j'ai ajouté une sélection visuelle du mode de paiement : Carte bancaire 💳, PayPal 🅿️ et Apple Pay 🍎. Le choix est envoyé au backend avec la commande.

- Pourquoi : sans sélection de paiement le checkout semblait incomplet. Ça rend l'app plus réaliste même si le paiement est simulé côté backend.

6.3 Ecran Mes Favoris : 

- Pourquoi : avant ce bouton affichait juste "Cette fonctionnalité arrive bientôt". C'est une fonctionnalité de base pour une app de livraison.

- Difficulté rencontrée : les favoris sont stockés séparément dans 'favorites.json' côté backend et non dans le profil utilisateur. Il fallait appeler 'GET /user/favorites' et non lire 'user.favoriteRestaurants' qui était toujours vide.


7. Tests

J'ai essayé d'écrire quelques tests avec Jest mais j'ai eu du mal à configurer l'environnement avec Expo SDK 54 et React 19 qui ont des conflits de dépendances. Après plusieurs essais j'ai réussi à faire tourner des tests simples sur les fonctions les plus importantes.

Le fichier '__tests__/app.test.ts' teste :
- La validation email et mot de passe utilisée dans login et register
- Le calcul du total du panier
- Les frais de livraison (gratuit au dessus de 25€)
- La validation des codes promo

Pour lancer les tests :
```bash
npx jest 
```

8. Limite connues :

- fonctionnalité ( C et J ) due au carte intercative. 


- E - Recherche vocale 

- Mode de paiement : un véritable mode de paiement étant donné que celui-ci est simulé.

9. Choix techniques : 

- 

- AsyncStorage pour les préférences légères (thème, langue, recherches récentes, onboarding).

- SecureStore pour les tokens d'authentification : plus sécurisé qu'AsyncStorage pour des données sensibles. 

- useFocusEffect au lieu de 'useEffect' dans le profil : pour recharger les données à chaque visite de l'écran, pas seulement au premier montage.

- Debounce 400ms dans Search : évite d'appeler l'API à chaque lettre tapée ce qui surchargerait le backend

- Context API plutôt que Redux : suffisant pour ce projet et moins de complexité à apprendre

- Axios avec intercepteurs : le token JWT est ajouté automatiquement à chaque requête sans avoir à le faire manuellement partout


In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
