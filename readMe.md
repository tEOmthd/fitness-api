# 🏋️ Fitness API

API REST pour la gestion d'entraînements sportifs - Projet R5.L.02

---

## 📚 Technologies

- **Node.js** + **Express** + **TypeScript**
- **SQLite** (better-sqlite3)
- **JWT** (authentification avec refresh tokens)
- **Jest** (67 tests : 48 unitaires + 19 intégration)

---

## 🚀 Installation & Lancement

```bash
# Installation
npm install

# Configuration (créer un fichier .env)
PORT=3000
ACCESS_TOKEN_SECRET=votre_secret_access
REFRESH_TOKEN_SECRET=votre_secret_refresh

# Lancement
npm run dev    # Développement
npm test       # Tests
npm run build  # Compilation
```

---

## 🛣️ Endpoints

### Authentication
- `POST /auth/login` - Connexion (retourne accessToken + refreshToken)
- `POST /auth/refresh` - Renouveler l'access token
- `POST /auth/logout` - Déconnexion (révoque le refresh token)
- `GET /auth/me` - Infos utilisateur connecté

### Users
- `POST /users` - Inscription
- `GET /users/:id` - Profil (owner ou admin)
- `DELETE /users/:id` - Suppression (admin uniquement)

### Exercises
- `GET /exercises` - Liste
- `GET /exercises/:id` - Détails
- `POST /exercises` - Création (admin)
- `PUT /exercises/:id` - Modification (admin)
- `DELETE /exercises/:id` - Suppression (admin)

### Workouts
- `GET /workouts` - Mes workouts (ou tous si admin)
- `GET /workouts/:id` - Détails
- `POST /workouts` - Création
- `PUT /workouts/:id` - Modification (owner ou admin)
- `DELETE /workouts/:id` - Suppression (owner ou admin)

### Workout Exercises
- `GET /workout-exercises/workout/:workoutId` - Exercices d'un workout
- `POST /workout-exercises` - Ajouter un exercice
- `PUT /workout-exercises/:id` - Modifier
- `DELETE /workout-exercises/:id` - Supprimer

---

## 📁 Architecture

```
src/
├── models/       # Interfaces TypeScript
├── dao/          # Accès base de données (CRUD)
├── services/     # Logique métier (AuthService)
├── routes/       # Endpoints Express
├── middlewares/  # Authentification et permissions
└── utils/        # Database, JWT

tests/
├── unit/         # Tests unitaires (48)
└── integration/  # Tests d'intégration (19)
```

---

## 🎯 Fonctionnalités

✅ CRUD complet sur toutes les entités  
✅ Authentification JWT avec access token (15min) + refresh token (7 jours)  
✅ Gestion des permissions (admin/user)  
✅ Tokens révocables avec rotation  
✅ 67 tests (tous passent ✅)  

---

## ⭐ Extensions implémentées

- **Refresh Token** (3★) : Gestion complète avec rotation et révocation
- **Tests d'intégration** (4★) : 19 tests couvrant tous les endpoints

**Total : 7 étoiles**

---

## 🔒 Sécurité

- Mots de passe hashés (bcrypt)
- Tokens JWT signés avec expiration
- Refresh tokens stockés en base et révocables
- Contrôle des permissions sur chaque route
- Foreign keys activées

---

## 📝 Exemple d'utilisation

```bash
# 1. Inscription
POST /users
{"email": "user@test.com", "password": "pass123", "first_name": "Mathiaud", "last_name": "Téo"}

# 2. Connexion
POST /auth/login
{"email": "user@test.com", "password": "pass123"}


# 3. Créer un workout
POST /workouts
Authorization: Bearer {accessToken}
{"name": "Routine du matin", "date": "2026-01-07", "duration_minutes": 45}

# 4. Renouveler le token (après 15min)
POST /auth/refresh
{"refreshToken": "..."}

→ Retourne de nouveaux tokens
```

---

**Projet réalisé par Mathiaud Téo - IUT BUT Informatique S5**