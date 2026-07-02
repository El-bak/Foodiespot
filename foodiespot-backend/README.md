# 🍔 FoodieSpot Mock Backend

Backend API mock pour l'application FoodieSpot - Cours React Native ESTIAM E4.

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Lancer le serveur
npm start

# Ou en mode développement (auto-reload)
npm run dev
```

Le serveur démarre sur `http://localhost:4000`

## 📡 Endpoints API

### 🔐 Authentification

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/auth/register` | Inscription | ❌ |
| POST | `/auth/login` | Connexion | ❌ |
| POST | `/auth/refresh` | Rafraîchir le token | ❌ |
| POST | `/auth/logout` | Déconnexion | ✅ |
| POST | `/auth/forgot-password` | Mot de passe oublié | ❌ |

### 👤 Utilisateur

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/users/profile` | Profil utilisateur | ✅ |
| PUT | `/users/profile` | Modifier profil | ✅ |
| POST | `/users/avatar` | Upload avatar | ✅ |
| GET | `/users/addresses` | Liste adresses | ✅ |
| POST | `/users/addresses` | Ajouter adresse | ✅ |
| DELETE | `/users/addresses/:id` | Supprimer adresse | ✅ |

### 🍽️ Restaurants

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/categories` | Liste catégories | ❌ |
| GET | `/restaurants` | Liste restaurants | ❌* |
| GET | `/restaurants/nearby` | Restaurants proches | ❌* |
| GET | `/restaurants/:id` | Détail restaurant | ❌* |
| GET | `/restaurants/:id/menu` | Menu du restaurant | ❌ |
| GET | `/restaurants/:id/reviews` | Avis du restaurant | ❌ |

*Auth optionnelle pour afficher les favoris

### ❤️ Favoris

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/favorites` | Liste favoris | ✅ |
| POST | `/favorites` | Ajouter favori | ✅ |
| DELETE | `/favorites/:restaurantId` | Retirer favori | ✅ |

### 🛒 Commandes

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/orders` | Historique commandes | ✅ |
| GET | `/orders/:id` | Détail commande | ✅ |
| POST | `/orders` | Créer commande | ✅ |
| POST | `/orders/:id/cancel` | Annuler commande | ✅ |
| POST | `/cart/validate` | Valider panier | ✅ |

### ⭐ Avis

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/reviews` | Créer un avis (+ images) | ✅ |

### 📤 Upload

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/uploads` | Upload fichier | ✅ |

### 🔔 Notifications

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/notifications/register-token` | Enregistrer token push | ✅ |
| GET | `/notifications` | Liste notifications | ✅ |

### 🎟️ Promotions

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/promos/validate` | Valider code promo | ✅ |

## 📝 Exemples de requêtes

### Inscription
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","firstName":"John","lastName":"Doe"}'
```

### Connexion
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### Liste des restaurants
```bash
curl http://localhost:4000/restaurants
```

### Restaurants par catégorie
```bash
curl "http://localhost:4000/restaurants?category=pizza"
```

### Restaurants à proximité
```bash
curl "http://localhost:4000/restaurants/nearby?lat=48.8566&lng=2.3522&radius=5"
```

### Créer une commande (avec token)
```bash
curl -X POST http://localhost:4000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "restaurantId": "rest-001",
    "items": [{"menuItemId": "item-001", "quantity": 2}],
    "deliveryAddress": {"street": "123 Rue Test", "city": "Paris", "postalCode": "75001"},
    "paymentMethod": "card"
  }'
```

## 🎯 Codes promo disponibles

| Code | Réduction | Commande min |
|------|-----------|--------------|
| `BIENVENUE30` | 30% (max 15€) | 20€ |
| `FOODIE10` | 10% (max 10€) | 15€ |
| `LIVRAISON` | Livraison gratuite | 25€ |

## 📂 Structure des données

```
data/
├── restaurants.json   # Liste des restaurants
├── menus.json         # Menus par restaurant
├── categories.json    # Catégories
├── users.json         # Utilisateurs
├── orders.json        # Commandes
├── reviews.json       # Avis
├── favorites.json     # Favoris par user
└── push-tokens.json   # Tokens push
```

## 🔧 Configuration

Variables d'environnement (.env):

```env
PORT=4000
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d
```

## 🔄 Pipeline CI/CD

Le projet dispose d'un pipeline Jenkins complet (`Jenkinsfile` à la racine du repo) qui automatise
le build, les tests, l'analyse qualité, le scan de sécurité, la publication de l'image Docker et le
déploiement en environnement de staging.

### Vue d'ensemble — 9 stages

| # | Stage | Outil | Ce qu'il fait |
|---|-------|-------|----------------|
| 1 | Checkout | Git | Clone le repo, récupère le SHA du commit |
| 2 | Lint | ESLint | Vérifie le style et la syntaxe du code |
| 3 | Build & Test | Docker + Jest | Build l'image (`--target runtime`), lance les tests avec coverage |
| 4 | SonarQube Analysis | sonar-scanner | Envoie l'analyse de qualité de code à SonarQube |
| 5 | Quality Gate | SonarQube | Bloque le pipeline si le Quality Gate est rouge |
| 6 | Security Scan | Trivy | Scanne l'image pour les CVEs (HIGH/CRITICAL) |
| 7 | Push to Registry | Docker | Publie l'image sur `ghcr.io/el-bak/foodiespot-backend` |
| 8 | IaC Apply | Terraform | Provisionne/met à jour le conteneur de staging |
| 9 | Smoke Test | curl | Vérifie que `/health` répond 200 sur l'environnement de staging |

### Prérequis pour lancer le pipeline

- Un agent Jenkins avec Docker, Terraform et accès au socket Docker (`/var/run/docker.sock`)
- Un réseau Docker externe nommé `cicd-network` (partagé par l'app, Jenkins, SonarQube, Prometheus/Grafana)
- Credentials configurés dans Jenkins :
  - `sonar-token-foodiespot` — token d'authentification SonarQube
  - `github-token` — token GitHub avec les scopes `repo`, `write:packages`, `read:packages` (pour push sur ghcr.io)
- Un serveur SonarQube accessible, configuré dans Jenkins sous le nom `sonarqube`

### Lancer le pipeline

Le job Jenkins `foodiespot-pipeline` est configuré sur la branche `devops-pipeline`.

1. Déclenchement manuel via l'interface Jenkins (bouton "Build Now"), ou automatique sur push
2. Le pipeline build l'image, lance les tests, analyse la qualité et la sécurité du code
3. Si tout est vert, l'image est poussée sur GHCR puis déployée en staging via Terraform
4. Le staging est accessible sur `http://localhost:4001` une fois déployé

### Infrastructure as Code (Terraform)

Le dossier `infra/` contient la configuration Terraform (provider `kreuzwerker/docker`) qui provisionne
le conteneur de staging `foodiespot-staging` sur le réseau `cicd-network`, port externe `4001`.

\`\`\`bash
cd infra
terraform init
terraform apply -var="image_name=foodiespot-backend:latest"
terraform output   # affiche l'URL du staging
\`\`\`

### Monitoring (Prometheus + Grafana)

L'application expose ses métriques sur `/metrics` (format Prometheus, via `prom-client`).
Le dossier `monitoring/` contient la stack de supervision :

\`\`\`bash
cd monitoring
docker compose up -d
\`\`\`

- Prometheus : http://localhost:9090 — cible `foodiespot-backend:4000/metrics`, vérifiable sur
  http://localhost:9090/targets
- Grafana : http://localhost:3001 (identifiants par défaut `admin` / `admin`) — dashboard
  `FoodieSpot Monitoring` avec le statut du service et le taux de requêtes HTTP
  (`rate(foodiespot_http_requests_total[5m])`)

### Registre d'images

Les images buildées par le pipeline sont publiées sur GitHub Container Registry :
\`ghcr.io/el-bak/foodiespot-backend\` (tags par SHA de commit et `latest`).


## 🎓 Pour les étudiants

Ce backend est conçu pour le cours React Native. Il simule:
- Authentification JWT complète
- CRUD restaurants/commandes
- Upload de fichiers
- Progression automatique des commandes
- Géolocalisation (calcul de distance)

**Note:** En production, utilisez bcrypt pour hasher les mots de passe et une vraie base de données!

---
*ESTIAM E4 - React Native / FoodieSpot*
