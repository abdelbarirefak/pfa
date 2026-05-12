# 🎓 AcademicConf — Guide de Lancement Complet

> **Plateforme de gestion de conférences académiques et soumissions de papiers**  
> Next.js 16 · TypeScript · Tailwind CSS · API Java/Jakarta EE

---

## Table des Matières

1. [Prérequis Système](#1-prérequis-système)
2. [Installation du Projet Frontend](#2-installation-du-projet-frontend)
3. [Configuration de l'Environnement](#3-configuration-de-lenvironnement)
4. [Lancement du Backend (Java EE)](#4-lancement-du-backend-java-ee)
5. [Lancement du Frontend (Next.js)](#5-lancement-du-frontend-nextjs)
6. [Accès à l'Application](#6-accès-à-lapplication)
7. [Comptes de Test](#7-comptes-de-test)
8. [Commandes Disponibles](#8-commandes-disponibles)
9. [Résolution des Problèmes Courants](#9-résolution-des-problèmes-courants)
10. [Architecture Résumée](#10-architecture-résumée)

---

## 1. Prérequis Système

Avant de lancer le projet, assurez-vous d'avoir installé les outils suivants :

### Frontend (Next.js)

| Outil | Version minimale | Vérification |
|---|---|---|
| **Node.js** | ≥ 18.x | `node --version` |
| **npm** | ≥ 9.x | `npm --version` |
| **Git** | toute version récente | `git --version` |

### Backend (Java EE)

| Outil | Version minimale | Vérification |
|---|---|---|
| **Java JDK** | 17 ou 21 | `java -version` |
| **Apache Maven** | ≥ 3.8 | `mvn --version` |
| **Serveur d'application** | WildFly / GlassFish / Payara | — |
| **Base de données** | MySQL 8 / PostgreSQL 15 | — |

---

## 2. Installation du Projet Frontend

### 2.1 Cloner / Ouvrir le projet

```bash
# Si vous avez déjà le projet localement :
cd "c:\Users\Admin\Documents\Downloads\pfa\app"

# Sinon, cloner depuis Git :
git clone <url-du-repo>
cd app
```

### 2.2 Installer les dépendances

```bash
npm install
```

> ✅ Cette commande installe toutes les dépendances listées dans `package.json` :
> Next.js, React, Tailwind CSS, Lucide, React Hook Form, Sonner, etc.

---

## 3. Configuration de l'Environnement

### 3.1 Créer le fichier `.env.local`

```bash
# Copier le fichier d'exemple
copy .env.example .env.local
```

### 3.2 Éditer `.env.local`

Ouvrez le fichier `.env.local` et configurez l'URL de votre API backend :

```env
# URL de base de l'API Java/Jakarta EE
# Remplacez le port si votre serveur tourne sur un port différent
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

> ⚠️ **Important** : Ne mettez **jamais** de secret dans une variable `NEXT_PUBLIC_*`, car elle est exposée dans le navigateur.

### 3.3 Tableau des Variables d'Environnement

| Variable | Obligatoire | Valeur par défaut | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ Oui | `http://localhost:8080/api` | URL de base de l'API REST backend |

---

## 4. Lancement du Backend (Java EE)

> Cette section dépend de la configuration de votre backend. Voici les étapes générales.

### 4.1 Configurer la base de données

1. Créez une base de données (ex. `academicconf_db`)
2. Exécutez les scripts SQL de création des tables (`users`, `conferences`, `tracks`, `paper_submissions`, `authorships`, `reviews`)
3. Configurez le `datasource` dans votre serveur d'application

### 4.2 Déployer l'application Java EE

```bash
# Avec Maven (WildFly par exemple)
cd chemin/vers/backend
mvn clean package
# Copier le .war dans le dossier deployments de WildFly
# OU
mvn wildfly:deploy
```

### 4.3 Vérifier que le backend tourne

Ouvrez votre navigateur ou utilisez `curl` :

```bash
curl http://localhost:8080/api/conferences
# Doit retourner une liste JSON (ou tableau vide [])
```

---

## 5. Lancement du Frontend (Next.js)

### 5.1 Mode Développement (recommandé pour le dev)

```bash
npm run dev
```

Le serveur démarre sur **http://localhost:3000** avec le rechargement à chaud (Hot Reload).

```
▲ Next.js 16.2.4
- Local:        http://localhost:3000
- Network:      http://0.0.0.0:3000
✓ Ready in ~2s
```

### 5.2 Mode Production (pour la démonstration finale)

```bash
# Étape 1 : Construire le bundle optimisé
npm run build

# Étape 2 : Lancer le serveur de production
npm run start
```

> Le build vérifie également les erreurs TypeScript. Un build réussi signifie que le code est propre.

---

## 6. Accès à l'Application

Une fois les deux serveurs démarrés :

| URL | Description |
|---|---|
| `http://localhost:3000` | Page d'accueil → redirige vers `/dashboard` |
| `http://localhost:3000/login` | Page de connexion |
| `http://localhost:3000/register` | Page d'inscription |
| `http://localhost:3000/dashboard` | Tableau de bord principal |
| `http://localhost:3000/conferences` | Liste des conférences |
| `http://localhost:3000/submissions/new` | Assistant de soumission de papier |
| `http://localhost:3000/reviews` | Mes évaluations (rôle Reviewer) |

---

## 7. Comptes de Test

> Créez des comptes via la page `/register` ou directement en base de données.

### Exemple de compte Auteur

```
Email    : auteur@test.com
Password : Test1234!
Rôle     : Author (soumet des papiers)
```

### Exemple de compte Reviewer

```
Email    : reviewer@test.com
Password : Test1234!
Rôle     : Reviewer (évalue des papiers)
```

### Exemple de compte PC Chair

```
Email    : chair@test.com
Password : Test1234!
Rôle     : PC Chair (gère la conférence)
```

> Les rôles sont déterminés côté backend (JWT claims). Assurez-vous que votre API renvoie bien le champ `role` dans l'objet `user`.

---

## 8. Commandes Disponibles

```bash
# Lancer le serveur de développement
npm run dev

# Construire pour la production
npm run build

# Lancer le serveur de production (après build)
npm run start

# Vérifier les types TypeScript sans compiler
npx tsc --noEmit

# Lister les dépendances obsolètes
npm outdated
```

---

## 9. Résolution des Problèmes Courants

### ❌ `Error: NEXT_PUBLIC_API_URL is not defined`

**Cause** : Le fichier `.env.local` est absent ou mal nommé.  
**Solution** :
```bash
copy .env.example .env.local
# Puis relancer npm run dev
```

### ❌ Erreur CORS sur les appels API

**Cause** : Le backend Java EE n'autorise pas les requêtes depuis `localhost:3000`.  
**Solution** : Ajoutez un filtre CORS dans votre backend :
```java
@Provider
public class CorsFilter implements ContainerResponseFilter {
    public void filter(ContainerRequestContext req, ContainerResponseContext res) {
        res.getHeaders().add("Access-Control-Allow-Origin", "http://localhost:3000");
        res.getHeaders().add("Access-Control-Allow-Headers", "Authorization, Content-Type");
        res.getHeaders().add("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
    }
}
```

### ❌ Page blanche sur `/dashboard` sans connexion

**Cause** : Il n'y a pas encore de garde de route côté serveur (connue comme limitation v0.1.0).  
**Solution** : Connectez-vous via `/login` avant d'accéder aux pages protégées.

### ❌ `npm install` échoue

**Cause** : Version de Node.js trop ancienne.  
**Solution** : Mettez à jour Node.js vers la version 18 LTS minimum.
```bash
node --version  # Doit afficher v18.x ou supérieur
```

### ❌ Port 3000 déjà utilisé

```bash
# Windows : trouver et tuer le processus sur le port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Ou lancer sur un port différent
npm run dev -- --port 3001
```

### ❌ `Module not found` après un `git pull`

```bash
# Réinstaller les dépendances
npm install
```

---

## 10. Architecture Résumée

```
┌─────────────────────────────────────────────────────────┐
│                    NAVIGATEUR WEB                       │
│              http://localhost:3000                      │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────────────────┐
│              FRONTEND — Next.js 16                      │
│  TypeScript · Tailwind CSS · React Hook Form · Sonner  │
│                                                         │
│  Pages :                                                │
│  /login  /register  /dashboard  /conferences           │
│  /submissions/new  /reviews                            │
│                                                         │
│  Auth : JWT stocké dans localStorage                   │
│         clé : acconf_token / acconf_user               │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP REST + Bearer Token
                       │ Authorization: Bearer <JWT>
┌──────────────────────▼──────────────────────────────────┐
│          BACKEND — Java/Jakarta EE REST API             │
│              http://localhost:8080/api                  │
│                                                         │
│  Endpoints clés :                                       │
│  POST  /auth/login           GET  /conferences          │
│  POST  /auth/register        GET  /submissions          │
│  POST  /submissions          PATCH /reviews/:id         │
└──────────────────────┬──────────────────────────────────┘
                       │ JDBC
┌──────────────────────▼──────────────────────────────────┐
│              BASE DE DONNÉES (MySQL / PostgreSQL)       │
│  Tables : users · conferences · tracks                 │
│           paper_submissions · authorships · reviews    │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Structure des Fichiers Clés

```
app/
├── .env.local              ← ⚠️ À configurer avant de lancer
├── .env.example            ← Modèle pour .env.local
├── package.json            ← Scripts et dépendances
├── next.config.ts          ← Configuration Next.js
├── src/
│   ├── app/                ← Pages et layouts (App Router)
│   ├── components/         ← Composants réutilisables (UI + Layout)
│   ├── features/           ← Logique métier (auth, wizard de soumission)
│   ├── lib/                ← API client, auth helpers, utilitaires
│   └── types/              ← Interfaces TypeScript du domaine
└── docs/                   ← 📚 Documentation du projet
    ├── GUIDE_LANCEMENT.md         ← Ce fichier
    ├── etape-01_initialisation/   ← Snapshot étape 1
    ├── etape-02_authentification/ ← Snapshot étape 2
    ├── etape-03_dashboard/        ← Snapshot étape 3
    ├── etape-04_conferences/      ← Snapshot étape 4
    ├── etape-05_soumissions/      ← Snapshot étape 5
    └── etape-06_evaluations/      ← Snapshot étape 6
```

---

*Dernière mise à jour : Avril 2026 — Version du projet : 0.1.0*
