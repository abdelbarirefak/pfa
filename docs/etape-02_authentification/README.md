# Étape 02 — Authentification (Login / Register)

**Date :** Avril 2026  
**Statut :** ✅ Complété

---

## Objectif de cette étape

Mettre en place un système d'authentification simple basé sur JWT stocké en `localStorage`, sans NextAuth ni cookies httpOnly.

---

## Stratégie d'Authentification

```
1. L'utilisateur saisit Email + Mot de passe
2. POST /api/auth/login → Retourne { token: string, user: User }
3. Le token est stocké dans localStorage["acconf_token"]
4. L'objet user est stocké dans localStorage["acconf_user"]
5. Chaque appel API suivant inclut : Authorization: Bearer <token>
6. Déconnexion → suppression des clés + redirection vers /login
```

---

## Fichiers Créés / Modifiés

### `src/lib/auth.ts` — Helpers JWT localStorage

```typescript
const TOKEN_KEY = 'acconf_token';
const USER_KEY  = 'acconf_user';

export function persistAuth(token: string, user: User): void
export function clearAuth(): void
export function getToken(): string | null
export function getStoredUser(): User | null
export function isAuthenticated(): boolean
```

### `src/lib/api.ts` — Client API typé

- Wrapper `request<T>()` qui injecte automatiquement le Bearer token
- Groupes d'endpoints : `authApi`, `conferencesApi`, `submissionsApi`, `reviewsApi`, `usersApi`

### `src/types/index.ts` — Interfaces TypeScript

```typescript
interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  academicAffiliation?: string;
  country?: string;
  biography?: string;
  metaLink?: string;
}
```

### `src/features/auth/login-form.tsx`

- Formulaire avec React Hook Form
- Validation : email requis, password requis (min 6 chars)
- Appel `authApi.login()` → `persistAuth()` → redirection `/dashboard`
- Toasts Sonner pour succès/erreur

### `src/features/auth/register-form.tsx`

- Champs : FirstName, LastName, Email, Password, AcademicAffiliation
- Appel `authApi.register()` → redirection `/login`
- Toast de confirmation

### `src/app/(auth)/layout.tsx`

- Layout centré (flex + min-h-screen)
- Fond dégradé navy → slate
- Aucune sidebar, aucun topbar

### `src/app/(auth)/login/page.tsx` & `register/page.tsx`

- Pages utilisant les composants feature/auth
- Métadonnées SEO (`metadata.title`)

### `src/components/layout/auth-guard.tsx`

- Composant client qui vérifie `isAuthenticated()`
- Redirige vers `/login` si non connecté
- Enveloppe le layout `(app)`

---

## Flux Login Complet

```
/login
  → LoginForm (react-hook-form)
  → POST /api/auth/login
  → { token, user } reçu
  → persistAuth(token, user)  ← localStorage
  → router.push('/dashboard')
  → Toast "Connexion réussie"
```

## Flux Logout

```
TopBar → clic "Se déconnecter"
  → clearAuth()  ← vide localStorage
  → router.push('/login')
```

---

## Limitations Connues à cette Étape

| Limitation | Impact | Solution future |
|---|---|---|
| JWT en localStorage | Vulnérable XSS | Migrer vers cookies httpOnly |
| Pas de refresh token | Expiration silencieuse | Intercepteur 401 + refresh |
| Pas de middleware Next.js | Accès direct aux pages protégées | `src/middleware.ts` avec cookies |

---

## Prochaine Étape

→ [Étape 03 : Dashboard & Layout Principal](../etape-03_dashboard/README.md)
