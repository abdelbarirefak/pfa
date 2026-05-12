# Étape 05 — Wizard de Soumission de Papier

**Date :** Avril 2026  
**Statut :** ✅ Complété

---

## Objectif de cette étape

Implémenter l'assistant de soumission de papier en 4 étapes (multi-step wizard) permettant aux auteurs de soumettre leurs articles de recherche de manière guidée.

---

## Architecture du Wizard

```
src/features/submissions/
├── submission-wizard.tsx      ← Orchestrateur (state global du wizard)
├── step-track-details.tsx     ← Étape 1 : Détails du papier
├── step-manage-authors.tsx    ← Étape 2 : Gestion des auteurs
├── step-file-upload.tsx       ← Étape 3 : Upload du manuscrit
└── step-review-submit.tsx     ← Étape 4 : Résumé et soumission finale
```

---

## Étape 1 : Détails du Papier (`step-track-details.tsx`)

**Formulaire :**

| Champ | Validation | API |
|---|---|---|
| Conférence | Requis (pré-rempli si `?conferenceId`) | GET /conferences |
| Track / Piste | Requis (chargé dynamiquement) | GET /conferences/:id/tracks |
| Titre | Requis, min 10 caractères | — |
| Résumé | Requis, min 100 caractères | — |

**Action :**
- Clic "Enregistrer comme brouillon" → `POST /api/submissions { status: "DRAFT" }`
- Retourne un `paperId` utilisé par les étapes suivantes
- Passage à l'étape 2

---

## Étape 2 : Gestion des Auteurs (`step-manage-authors.tsx`)

**Fonctionnalités :**
- L'auteur connecté est pré-ajouté en position 1 (Auteur Correspondant)
- Recherche de co-auteurs par email : `GET /api/users?email=...`
- Ajout de co-auteurs depuis les résultats de recherche
- **Drag-and-drop** pour réordonner (`@hello-pangea/dnd`)
- Suppression d'auteurs (sauf l'auteur principal)

**Action :**
- `PATCH /api/submissions/:id/authors` avec le tableau ordonné des `{ userId, isCorrespondingAuthor, authorSequenceOrder }`

---

## Étape 3 : Upload du Manuscrit (`step-file-upload.tsx`)

**Zone de dépôt :**
- Drag-and-drop ou clic pour sélectionner un fichier
- Formats acceptés : **PDF uniquement**
- Taille maximale : **20 MB**
- Barre de progression pendant l'upload

**Action :**
- `POST /api/submissions/:id/manuscript` (multipart/form-data)
- Retourne `{ manuscriptFileUrl: string }`

---

## Étape 4 : Résumé et Soumission (`step-review-submit.tsx`)

**Affichage en lecture seule :**
- Conférence + Track sélectionnés
- Titre et résumé du papier
- Liste des auteurs (ordre, correspondant)
- Lien vers le fichier manuscrit uploadé

**Action finale :**
- `PATCH /api/submissions/:id { status: "SUBMITTED" }`
- Toast "Papier soumis avec succès !"
- Redirection vers `/dashboard`

---

## Composant Stepper (`src/components/ui/stepper.tsx`)

Indicateur de progression horizontal :

```
● Détails  ──  ● Auteurs  ──  ○ Fichier  ──  ○ Soumettre
  (done)          (active)       (pending)      (pending)
```

```typescript
<Stepper
  steps={['Détails', 'Auteurs', 'Fichier', 'Soumettre']}
  currentStep={currentStep}
/>
```

---

## État Global du Wizard (`submission-wizard.tsx`)

```typescript
interface WizardState {
  currentStep: number;          // 0 à 3
  paperId: string | null;       // Créé à l'étape 1
  selectedConferenceId: string;
  selectedTrackId: string;
  title: string;
  abstract: string;
  authors: AuthorEntry[];
  manuscriptUrl: string | null;
}
```

---

## Flux Complet

```
/submissions/new?conferenceId=<id>
    │
    ▼ Étape 1
    POST /submissions { status: DRAFT }
    → paperId = "abc123"
    │
    ▼ Étape 2
    PATCH /submissions/abc123/authors [...]
    │
    ▼ Étape 3
    POST /submissions/abc123/manuscript (FormData)
    │
    ▼ Étape 4 (lecture seule)
    PATCH /submissions/abc123 { status: SUBMITTED }
    → Toast succès
    → /dashboard
```

---

## Validation des Formulaires

React Hook Form est utilisé avec validation inline :

```typescript
register('title', {
  required: 'Le titre est obligatoire',
  minLength: { value: 10, message: 'Minimum 10 caractères' }
})

register('abstract', {
  required: "L'abstract est obligatoire",
  minLength: { value: 100, message: 'Minimum 100 caractères' }
})
```

---

## Prochaine Étape

→ [Étape 06 : Page Évaluations (Reviewer)](../etape-06_evaluations/README.md)
