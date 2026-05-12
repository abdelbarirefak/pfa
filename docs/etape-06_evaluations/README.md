# Étape 06 — Page Évaluations (Reviewer)

**Date :** Avril 2026  
**Statut :** ✅ Complété

---

## Objectif de cette étape

Implémenter la page permettant aux évaluateurs (Reviewers) de consulter les papiers qui leur sont assignés et de soumettre leurs évaluations.

---

## Fichier Principal

### `src/app/(app)/reviews/page.tsx`

Page client qui :
1. Récupère les évaluations assignées via `GET /api/reviews?reviewerId=<userId>`
2. Affiche un tableau de bord d'évaluation
3. Permet l'ouverture d'un formulaire d'évaluation en modal/drawer

---

## Fonctionnalités

### Tableau des Papiers Assignés

| Colonne | Source | Affichage |
|---|---|---|
| Titre du papier | `review.paper.title` | Lien cliquable |
| Conférence | `review.paper.track.conference.name` | Texte |
| Track | `review.paper.track.name` | Badge |
| Statut | `review.status` | `<StatusBadge>` (PENDING / COMPLETED) |
| Action | — | Bouton "Évaluer" (si PENDING) |

### Formulaire d'Évaluation

Champs du formulaire :

| Champ | Type | Validation |
|---|---|---|
| Commentaires | Textarea | Requis, min 50 caractères |
| Commentaires d'évaluation | Textarea | Requis, min 30 caractères |
| Décision | Select (ACCEPT / REJECT / REVISION) | Requis |

**Action :**
```typescript
PATCH /api/reviews/:reviewId {
  comments: string,
  evaluationComments: string,
  status: "COMPLETED"
}
```

---

## Appel API

```typescript
// src/lib/api.ts
export const reviewsApi = {
  list: (reviewerId: string) =>
    request<Review[]>(`/reviews?reviewerId=${reviewerId}`),
  submit: (id: string, data: SubmitReviewPayload) =>
    request<Review>(`/reviews/${id}`, { method: 'PATCH', body: data }),
};
```

---

## Interface TypeScript

```typescript
// src/types/index.ts
interface Review {
  reviewId: string;
  paper: PaperSubmission;    // papier assigné (nested)
  reviewer: User;
  comments: string | null;
  evaluationComments: string | null;
  status: 'PENDING' | 'COMPLETED';
}
```

---

## États de la Page

```
Loading → Skeleton / Spinner
Vide    → EmptyState "Aucune évaluation assignée"
Données → Tableau avec filtres PENDING / COMPLETED
Erreur  → Message d'erreur + bouton réessayer
```

---

## Design de la Page

```
┌─ Page Header ──────────────────────────────────────┐
│ Mes Évaluations                                    │
│ Papiers qui vous sont assignés pour évaluation    │
└────────────────────────────────────────────────────┘

┌─ Filtres ────────────────────────────────────────┐
│  [Tous]  [En attente (3)]  [Complétés (5)]       │
└────────────────────────────────────────────────────┘

┌─ Tableau ──────────────────────────────────────────┐
│ Titre                │ Conférence │ Statut │ Action│
├──────────────────────┼────────────┼────────┼───────┤
│ Deep Learning for... │ IEEE 2026  │PENDING │[Éval.]│
│ Quantum Computing... │ ICML 2026  │COMPLET.│  —    │
└────────────────────────────────────────────────────┘
```

---

## Formulaire d'Évaluation (Modal)

```
┌─ Évaluation du papier ─────────────────────────────┐
│ "Deep Learning for Automated Code Review"          │
│                                                    │
│ Commentaires généraux :                            │
│ ┌──────────────────────────────────────────────┐  │
│ │                                              │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ Commentaires d'évaluation :                        │
│ ┌──────────────────────────────────────────────┐  │
│ │                                              │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ [Annuler]                     [Soumettre l'avis]   │
└────────────────────────────────────────────────────┘
```

---

## Retour Utilisateur

- ✅ Toast "Évaluation soumise avec succès !" (Sonner)
- 🔄 Le statut du papier passe à `COMPLETED` immédiatement dans l'UI (optimistic update)
- Le bouton "Évaluer" disparaît pour ce papier

---

## Fin du Cycle de Développement v0.1.0

Cette étape complète les 6 flux principaux de la plateforme :

1. ✅ Initialisation et structure
2. ✅ Authentification (Login / Register)
3. ✅ Dashboard & Layout AppShell
4. ✅ Liste des conférences
5. ✅ Wizard de soumission de papier
6. ✅ Interface d'évaluation (Reviewer)

### Limitations Connues v0.1.0

| # | Limitation | Priorité |
|---|---|---|
| 1 | Pas de garde de route (middleware) | Haute |
| 2 | JWT sans gestion d'expiration | Haute |
| 3 | Pas de pagination | Moyenne |
| 4 | État de la sidebar non persisté | Basse |
| 5 | Pas de mise à jour optimiste (sauf reviews) | Basse |

---

← [Étape 05 : Wizard de Soumission](../etape-05_soumissions/README.md)
