# Étape 04 — Page Conférences

**Date :** Avril 2026  
**Statut :** ✅ Complété

---

## Objectif de cette étape

Implémenter la page de liste des conférences disponibles, avec recherche, filtrage et navigation vers la soumission de papier.

---

## Fichier Principal

### `src/app/(app)/conferences/page.tsx`

Page client (`"use client"`) qui :
1. Récupère toutes les conférences via `GET /api/conferences`
2. Affiche des cartes (grid responsive)
3. Permet la recherche textuelle (nom, lieu)
4. Gère les états : chargement, vide, erreur

---

## Fonctionnalités

### Carte de Conférence

Chaque conférence est présentée en carte avec :

| Champ | Affichage |
|---|---|
| `name` | Titre principal de la carte |
| `location` | Icône MapPin + texte |
| `startDate` / `endDate` | Icône Calendar + dates formatées |
| `submissionDeadline` | Badge "Deadline : JJ/MM/AAAA" |
| Bouton | "Soumettre un papier" → `/submissions/new?conferenceId=<id>` |

### Barre de Recherche

- Input textuel filtrant en temps réel sur `name` et `location`
- Icône Search à gauche
- État vide (`EmptyState`) si aucun résultat

### Gestion des États

```typescript
// États possibles de la page
type PageState = 'loading' | 'error' | 'empty' | 'results';
```

---

## Appel API

```typescript
// src/lib/api.ts
export const conferencesApi = {
  list: () => request<Conference[]>('/conferences'),
  getTracks: (id: string) => request<Track[]>(`/conferences/${id}/tracks`),
};
```

---

## Interface TypeScript Utilisée

```typescript
// src/types/index.ts
interface Conference {
  conferenceId: string;
  name: string;
  location: string;
  startDate: string;   // ISO date string
  endDate: string;
  submissionDeadline: string;
}
```

---

## Design de la Page

```
┌─ Page Header ──────────────────────────────────────┐
│ Conférences                    [Rechercher...]      │
│ Parcourez les conférences disponibles              │
└────────────────────────────────────────────────────┘

┌─ Carte ──────┐ ┌─ Carte ──────┐ ┌─ Carte ──────┐
│ Nom conf.    │ │ Nom conf.    │ │ Nom conf.    │
│ 📍 Lieu      │ │ 📍 Lieu      │ │ 📍 Lieu      │
│ 📅 Dates     │ │ 📅 Dates     │ │ 📅 Dates     │
│ ⏰ Deadline  │ │ ⏰ Deadline  │ │ ⏰ Deadline  │
│ [Soumettre]  │ │ [Soumettre]  │ │ [Soumettre]  │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## Navigation Sortante

- Clic "Soumettre un papier" → `/submissions/new?conferenceId=<id>`
- Le wizard de soumission (Étape 05) lit ce paramètre URL pour pré-remplir la conférence

---

## Prochaine Étape

→ [Étape 05 : Wizard de Soumission de Papier](../etape-05_soumissions/README.md)
