# AcademicConf — Backend API

> REST API pour la plateforme de gestion de conférences et soumissions académiques.  
> Construit avec **Node.js / Express / Prisma / SQLite**.

---

## Table des Matières

1. [Stack Technique](#1-stack-technique)
2. [Architecture du Projet](#2-architecture-du-projet)
3. [Modèle de Données (ERD)](#3-modèle-de-données-erd)
4. [Démarrage Rapide](#4-démarrage-rapide)
5. [Scripts Disponibles](#5-scripts-disponibles)
6. [Endpoints API](#6-endpoints-api)
7. [Authentification JWT](#7-authentification-jwt)
8. [Gestion des Fichiers](#8-gestion-des-fichiers)
9. [Variables d'Environnement](#9-variables-denvironnement)
10. [Données de Test (Seed)](#10-données-de-test-seed)

---

## 1. Stack Technique

| Couche | Technologie | Version |
|---|---|---|
| Runtime | Node.js | ≥ 20.x |
| Framework | Express.js | 4.x |
| ORM | Prisma | 5.x |
| Base de données | SQLite | (fichier local, sans serveur) |
| Auth | JSON Web Token (JWT) | 9.x |
| Hashing | bcryptjs | 2.x |
| Upload | Multer | 1.x |
| Validation | Zod | 3.x |
| Language | TypeScript | 5.x |
| Dev server | Nodemon + ts-node | — |

---

## 2. Architecture du Projet

```
backend/
├── prisma/
│   ├── schema.prisma        ← Modèles de données Prisma
│   ├── seed.ts              ← Données de démonstration
│   └── dev.db               ← Fichier SQLite (généré automatiquement)
│
├── src/
│   ├── index.ts             ← Point d'entrée — Express app
│   ├── config.ts            ← Variables d'environnement typées
│   │
│   ├── lib/
│   │   └── prisma.ts        ← Client Prisma singleton
│   │
│   ├── middleware/
│   │   ├── auth.ts          ← JWT Bearer verification + requireRole()
│   │   ├── errorHandler.ts  ← Handler d'erreurs global
│   │   └── validate.ts      ← Validation Zod des requêtes
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── conferences.routes.ts
│   │   ├── users.routes.ts
│   │   ├── submissions.routes.ts
│   │   └── reviews.routes.ts
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── conferences.controller.ts
│   │   ├── users.controller.ts
│   │   ├── submissions.controller.ts
│   │   └── reviews.controller.ts
│   │
│   └── services/
│       ├── auth.service.ts
│       ├── conferences.service.ts
│       ├── users.service.ts
│       ├── submissions.service.ts
│       └── reviews.service.ts
│
├── uploads/                 ← Manuscrits PDF uploadés (auto-créé)
├── .env                     ← Variables d'environnement (ne pas committer)
├── .env.example             ← Template des variables d'environnement
├── package.json
├── tsconfig.json
└── nodemon.json
```

### Pattern architectural : Routes → Controller → Service → Prisma

```
Requête HTTP
    ↓
Route (validation Zod, middleware auth)
    ↓
Controller (parsing HTTP, gestion réponse)
    ↓
Service (logique métier, règles d'accès)
    ↓
Prisma Client (requêtes SQL typées)
    ↓
SQLite (fichier dev.db)
```

---

## 3. Modèle de Données (ERD)

```
┌──────────┐     ┌────────────────┐     ┌──────────────────────┐
│  users   │────<│  authorships   │>────│   paper_submissions  │
│          │     └────────────────┘     │                      │
│ id (PK)  │                            │ id (PK)              │
│ firstName│     ┌──────────┐           │ title                │
│ lastName │     │  reviews │>──────────│ abstract             │
│ email    │────<│          │           │ manuscriptFileUrl    │
│ passHash │     │ id (PK)  │           │ status               │
│ affil.   │     │ paperId  │           │ trackId (FK)         │
│ country  │     │ reviewer │           └──────────────────────┘
│ bio      │     │ comments │                    │
│ metaLink │     │ evalComm │           ┌────────┘
│ role     │     │ status   │           │
└──────────┘     └──────────┘    ┌──────────────┐
                                  │    tracks    │
                                  │              │
                                  │ id (PK)      │
                                  │ name         │
                                  │ conferenceId │
                                  └──────────────┘
                                         │
                                  ┌──────────────┐
                                  │ conferences  │
                                  │              │
                                  │ id (PK)      │
                                  │ name         │
                                  │ location     │
                                  │ startDate    │
                                  │ endDate      │
                                  │ subDeadline  │
                                  │ status       │
                                  └──────────────┘
```

### Statuts des entités

| Entité | Statuts possibles |
|---|---|
| User | `AUTHOR` \| `REVIEWER` \| `PC_CHAIR` \| `ADMIN` |
| Conference | `UPCOMING` \| `OPEN` \| `CLOSED` \| `ARCHIVED` |
| PaperSubmission | `DRAFT` \| `SUBMITTED` \| `UNDER_REVIEW` \| `ACCEPTED` \| `REJECTED` |
| Review | `PENDING` \| `IN_PROGRESS` \| `COMPLETED` |

---

## 4. Démarrage Rapide

### Prérequis
- Node.js ≥ 20.x installé
- npm installé

### Installation

```bash
# 1. Se placer dans le dossier backend
cd pfa/backend

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
copy .env.example .env
# (les valeurs par défaut fonctionnent directement)

# 4. Générer le client Prisma
npx prisma generate

# 5. Créer la base de données et appliquer les migrations
npx prisma migrate dev --name init

# 6. Alimenter la base avec des données de test
npm run db:seed

# 7. Lancer le serveur de développement
npm run dev
```

Le serveur démarre sur **http://localhost:8080/api** ✅

### Vérification

```bash
# Health check
curl http://localhost:8080/health

# Se connecter (données seed)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"amine.tazi@student.ensa.ma","password":"Password123!"}'
```

---

## 5. Scripts Disponibles

| Script | Description |
|---|---|
| `npm run dev` | Démarre le serveur avec hot-reload (nodemon) |
| `npm run build` | Compile TypeScript → JavaScript (`dist/`) |
| `npm start` | Démarre le serveur compilé (production) |
| `npm run db:migrate` | Crée et applique une migration Prisma |
| `npm run db:generate` | Régénère le client Prisma |
| `npm run db:seed` | Alimente la DB avec les données de test |
| `npm run db:studio` | Ouvre Prisma Studio (UI de la DB) |
| `npm run db:reset` | Remet à zéro la DB et re-seed |

---

## 6. Endpoints API

**Base URL:** `http://localhost:8080/api`

### Auth (public)

| Méthode | Endpoint | Description | Corps |
|---|---|---|---|
| `POST` | `/auth/register` | Créer un compte | `{ firstName, lastName, email, password, academicAffiliation }` |
| `POST` | `/auth/login` | Se connecter, obtenir JWT | `{ email, password }` |

**Exemple register:**
```json
POST /api/auth/register
{
  "firstName": "Ahmed",
  "lastName": "Zouaoui",
  "email": "a.zouaoui@example.com",
  "password": "MonPassword123!",
  "academicAffiliation": "ENSIAS Rabat",
  "country": "Morocco"
}
```

**Réponse login:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx...",
    "firstName": "Ahmed",
    "email": "a.zouaoui@example.com",
    "role": "AUTHOR"
  }
}
```

---

### Conferences (🔒 JWT requis)

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/conferences` | Lister toutes les conférences |
| `GET` | `/conferences?status=OPEN` | Filtrer par statut |
| `GET` | `/conferences?search=AI` | Rechercher par nom/lieu |
| `GET` | `/conferences/:id` | Détail d'une conférence |
| `GET` | `/conferences/:id/tracks` | Tracks d'une conférence |
| `POST` | `/conferences` | Créer (🛡️ PC_CHAIR/ADMIN) |
| `POST` | `/conferences/:id/tracks` | Ajouter track (🛡️ PC_CHAIR/ADMIN) |

---

### Users (🔒 JWT requis)

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/users?email=partial` | Rechercher co-auteurs par email |
| `GET` | `/users/:id` | Profil utilisateur |
| `PATCH` | `/users/:id` | Modifier son profil |

---

### Submissions (🔒 JWT requis)

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/submissions` | Créer soumission (DRAFT) |
| `GET` | `/submissions` | Mes soumissions |
| `GET` | `/submissions?userId=xxx` | Soumissions d'un utilisateur |
| `GET` | `/submissions/:id` | Détail complet |
| `PATCH` | `/submissions/:id` | Modifier titre/abstract/status |
| `PATCH` | `/submissions/:id/authors` | Mettre à jour les auteurs |
| `POST` | `/submissions/:id/manuscript` | Uploader PDF (multipart/form-data) |

**Exemple création:**
```json
POST /api/submissions
Authorization: Bearer <token>
{
  "trackId": "clxxx...",
  "conferenceId": "clyyy...",
  "title": "A Novel Approach to Federated Learning",
  "abstract": "This paper presents... (min 100 chars)"
}
```

---

### Reviews (🔒 JWT requis)

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/reviews` | Mes revues assignées |
| `GET` | `/reviews?reviewerId=xxx` | Revues d'un reviewer |
| `GET` | `/reviews/:id` | Détail d'une revue |
| `PATCH` | `/reviews/:id` | Soumettre/modifier une revue |
| `POST` | `/reviews/assign` | Assigner (🛡️ PC_CHAIR/ADMIN) |

---

## 7. Authentification JWT

Toutes les routes (sauf `/auth/*`) nécessitent un **Bearer Token** dans le header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Le token contient:
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "AUTHOR",
  "iat": 1714000000,
  "exp": 1714604800
}
```

**Durée de validité:** 7 jours (configurable via `JWT_EXPIRES_IN`)

---

## 8. Gestion des Fichiers

Les manuscrits PDF sont stockés dans le dossier `uploads/`:
- Créé automatiquement au démarrage du serveur
- Servi statiquement à `http://localhost:8080/uploads/<filename>`
- Taille max: **20 MB**
- Format accepté: **PDF uniquement**

Le champ `manuscriptFileUrl` retourné dans les soumissions pointe vers cette URL.

---

## 9. Variables d'Environnement

| Variable | Valeur par défaut | Description |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | Chemin du fichier SQLite |
| `JWT_SECRET` | (voir .env.example) | Clé secrète JWT — **à changer en prod** |
| `JWT_EXPIRES_IN` | `7d` | Durée de validité du token |
| `PORT` | `8080` | Port du serveur |
| `CORS_ORIGIN` | `http://localhost:3000` | Origine autorisée (frontend) |
| `UPLOAD_DIR` | `./uploads` | Dossier de stockage des fichiers |
| `MAX_FILE_SIZE` | `20971520` | Taille max upload (20 MB en bytes) |

---

## 10. Données de Test (Seed)

Après `npm run db:seed`, les comptes suivants sont disponibles:

| Email | Mot de passe | Rôle |
|---|---|---|
| `admin@academicconf.io` | `Password123!` | ADMIN |
| `fatima.benali@um5.ac.ma` | `Password123!` | PC_CHAIR |
| `y.elmansouri@uca.ac.ma` | `Password123!` | REVIEWER |
| `amine.tazi@student.ensa.ma` | `Password123!` | AUTHOR |

**Données créées:**
- 5 conférences (OPEN, UPCOMING ×2, CLOSED, ARCHIVED)
- 12 tracks répartis sur les 5 conférences
- 3 soumissions de papiers (UNDER_REVIEW, SUBMITTED, DRAFT)
- 2 revues (COMPLETED, PENDING)

---

## Développement

Pour visualiser et modifier la base de données graphiquement:

```bash
npm run db:studio
# Ouvre Prisma Studio sur http://localhost:5555
```

Pour réinitialiser complètement la base:

```bash
npm run db:reset
```
