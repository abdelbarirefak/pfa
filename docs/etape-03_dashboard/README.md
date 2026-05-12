# Étape 03 — Dashboard & Layout Principal (AppShell)

**Date :** Avril 2026  
**Statut :** ✅ Complété

---

## Objectif de cette étape

Construire le shell applicatif (sidebar + topbar + zone de contenu) qui enveloppe toutes les pages authentifiées, et implémenter le tableau de bord principal.

---

## Composants Créés

### `src/components/layout/sidebar.tsx`

Sidebar gauche fixe avec :
- Logo "AcademicConf" en haut
- Navigation principale (liens actifs mis en surbrillance)
- Bouton collapse/expand (icône chevron)
- Fond navy `#0F1B2D`
- Transition CSS smooth sur la largeur

**Routes de navigation :**

| Icône | Label | Lien |
|---|---|---|
| LayoutDashboard | Tableau de bord | `/dashboard` |
| Building2 | Conférences | `/conferences` |
| FileText | Mes soumissions | `/submissions` |
| Star | Mes évaluations | `/reviews` |

### `src/components/layout/topbar.tsx`

Barre supérieure avec :
- Fil d'Ariane dynamique (breadcrumb)
- Affichage du nom de l'utilisateur connecté
- Bouton "Se déconnecter" (`clearAuth()` + redirect)

### `src/components/layout/app-shell.tsx`

Composant assembleur qui :
- Compose Sidebar + Topbar + `{children}`
- Gère l'état collapsed de la sidebar
- Layout `flex` horizontal

### `src/app/(app)/layout.tsx`

- Enveloppe `AuthGuard` (vérification connexion)
- Puis `AppShell` pour le layout visuel

### `src/app/(app)/dashboard/page.tsx`

Tableau de bord avec :
- En-tête personnalisé "Bonjour, {prénom}"
- Statistiques en cartes (Total soumissions, En attente, Acceptées, Évaluations)
- Tableau des soumissions récentes avec `StatusBadge`
- Chargement des données : `submissionsApi.list()` + `reviewsApi.list()`

---

## Composants UI Génériques Créés

### `src/components/ui/status-badge.tsx`

Badges colorés pour les statuts :

| Statut | Couleur |
|---|---|
| DRAFT | Gris |
| SUBMITTED | Bleu |
| UNDER_REVIEW | Jaune |
| ACCEPTED | Vert |
| REJECTED | Rouge |
| PENDING | Orange |
| COMPLETED | Vert |

### `src/components/ui/page-header.tsx`

```tsx
<PageHeader
  title="Tableau de bord"
  subtitle="Vue d'ensemble de votre activité"
  action={<Button>Nouvelle soumission</Button>}
/>
```

### `src/components/ui/empty-state.tsx`

Composant d'état vide (aucun résultat) avec icône, titre et description.

---

## Design Tokens Appliqués

```css
/* Sidebar */
background: #0F1B2D;
color: white;
width: 240px (expanded) / 64px (collapsed);

/* Topbar */
background: white;
border-bottom: 1px solid #e2e8f0;
height: 64px;

/* Page content */
background: #f8fafc;
padding: 2rem;
```

---

## Structure du Layout `(app)`

```
AppShell
├── Sidebar (240px fixe)
│   ├── Logo
│   ├── NavItem (Dashboard)
│   ├── NavItem (Conférences)
│   ├── NavItem (Soumissions)
│   └── NavItem (Évaluations)
└── Main area (flex-1)
    ├── TopBar
    │   ├── Breadcrumb
    │   └── User info + Logout
    └── Content (children)
        └── Page spécifique
```

---

## Prochaine Étape

→ [Étape 04 : Page Conférences](../etape-04_conferences/README.md)
