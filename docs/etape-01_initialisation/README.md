# Étape 01 — Initialisation du Projet

**Date :** Avril 2026  
**Statut :** ✅ Complété

---

## Objectif de cette étape

Mise en place de la structure de base du projet Next.js avec TypeScript, Tailwind CSS et les dépendances principales.

---

## Ce qui a été fait

### 1. Création du projet Next.js

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
# Puis réorganisation avec dossier src/
```

### 2. Installation des dépendances

```bash
npm install lucide-react react-hook-form sonner @hello-pangea/dnd clsx tailwind-merge
```

### 3. Structure de dossiers créée

```
src/
├── app/
│   ├── layout.tsx         ← Layout racine (Inter font + Sonner toaster)
│   ├── page.tsx           ← Redirection → /dashboard
│   ├── globals.css        ← Tailwind v4 + styles globaux
│   ├── (auth)/            ← Groupe de routes non authentifiées
│   └── (app)/             ← Groupe de routes authentifiées
├── components/
├── features/
├── lib/
└── types/
```

### 4. Configuration TypeScript (`tsconfig.json`)

- Mode strict activé
- Alias `@/` configuré vers `./src`

### 5. Configuration Tailwind CSS v4

- Import via `@import "tailwindcss"` dans `globals.css`
- Plugin PostCSS configuré dans `postcss.config.mjs`

---

## Fichiers Clés Créés

| Fichier | Description |
|---|---|
| `next.config.ts` | Configuration Next.js (App Router) |
| `tsconfig.json` | TypeScript strict mode + alias @/ |
| `postcss.config.mjs` | Plugin Tailwind CSS v4 |
| `src/app/globals.css` | Styles globaux + variables CSS |
| `src/app/layout.tsx` | Layout racine avec police Inter |
| `.env.example` | Modèle de variables d'environnement |

---

## Dépendances Installées

| Package | Version | Usage |
|---|---|---|
| `next` | 16.2.4 | Framework principal |
| `react` | 19.2.4 | Bibliothèque UI |
| `typescript` | ^5 | Typage statique |
| `tailwindcss` | ^4 | Styles utilitaires |
| `lucide-react` | ^1.8.0 | Icônes |
| `react-hook-form` | ^7.73.1 | Gestion des formulaires |
| `@hello-pangea/dnd` | ^18.0.1 | Drag-and-drop |
| `sonner` | ^2.0.7 | Notifications toast |
| `clsx` | ^2.1.1 | Classes conditionnelles |
| `tailwind-merge` | ^3.5.0 | Fusion classes Tailwind |

---

## Palette de Couleurs Définie

| Rôle | Hex | Description |
|---|---|---|
| Primary (Navy) | `#0F1B2D` | Couleur principale (sidebar, boutons) |
| Primary Hover | `#1E3A5F` | État hover des éléments navy |
| Accent (Gold) | `#B8860B` | Appels à l'action, highlights |
| Page Background | `#f8fafc` | Fond des pages |
| Card Background | `#ffffff` | Fond des cartes |
| Border | `#e2e8f0` | Bordures |

---

## Points de Vigilance

- Tailwind CSS v4 utilise `@import "tailwindcss"` au lieu de `@tailwind base/components/utilities`
- Next.js 16 avec App Router : les composants sont **Server Components** par défaut, utiliser `"use client"` explicitement
- L'alias `@/` doit être configuré dans `tsconfig.json` et dans les imports

---

## Prochaine Étape

→ [Étape 02 : Authentification](../etape-02_authentification/README.md)
