# Fitness API

API REST pour la gestion d'entraînements sportifs, construite avec Node.js, Express et TypeScript.

## Stack

- Node.js + Express + TypeScript
- SQLite (better-sqlite3)
- JWT — access token (15 min) + refresh token (7 jours) avec rotation
- Jest — 67 tests (48 unitaires + 19 intégration)

## Installation

```bash
npm install
```

Créer un fichier `.env` :

```
PORT=3000
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
```

```bash
npm run dev    # développement
npm test       # tests
npm run build  # compilation
```

## Architecture

```
src/
├── models/       # interfaces TypeScript
├── dao/          # accès base de données
├── services/     # logique métier
├── routes/       # endpoints Express
├── middlewares/  # auth et permissions
└── utils/        # database, JWT

tests/
├── unit/         # 48 tests unitaires
└── integration/  # 19 tests d'intégration
```

## Endpoints

### Auth
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/auth/login` | Connexion — retourne accessToken + refreshToken |
| POST | `/auth/refresh` | Renouveler l'access token |
| POST | `/auth/logout` | Révocation du refresh token |
| GET | `/auth/me` | Infos utilisateur connecté |

### Users
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/users` | Inscription |
| GET | `/users/:id` | Profil (owner ou admin) |
| DELETE | `/users/:id` | Suppression (admin) |

### Exercises
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/exercises` | Liste |
| GET | `/exercises/:id` | Détails |
| POST | `/exercises` | Création (admin) |
| PUT | `/exercises/:id` | Modification (admin) |
| DELETE | `/exercises/:id` | Suppression (admin) |

### Workouts
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/workouts` | Mes workouts (ou tous si admin) |
| GET | `/workouts/:id` | Détails |
| POST | `/workouts` | Création |
| PUT | `/workouts/:id` | Modification (owner ou admin) |
| DELETE | `/workouts/:id` | Suppression (owner ou admin) |

### Workout Exercises
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/workout-exercises/workout/:workoutId` | Exercices d'un workout |
| POST | `/workout-exercises` | Ajouter un exercice |
| PUT | `/workout-exercises/:id` | Modifier |
| DELETE | `/workout-exercises/:id` | Supprimer |

## Exemple

```bash
# Inscription
POST /users
{ "email": "teo@example.com", "password": "pass123", "first_name": "Téo", "last_name": "Mathiaud" }

# Connexion
POST /auth/login
{ "email": "teo@example.com", "password": "pass123" }
# → { accessToken, refreshToken }

# Créer un workout
POST /workouts
Authorization: Bearer <accessToken>
{ "name": "Routine du matin", "date": "2026-01-07", "duration_minutes": 45 }

# Renouveler le token
POST /auth/refresh
{ "refreshToken": "..." }
# → nouveaux tokens
```

## Sécurité

- Mots de passe hachés avec bcrypt
- Refresh tokens stockés en base et révocables (rotation à chaque renouvellement)
- Permissions vérifiées par middleware sur chaque route
- Foreign keys SQLite activées
