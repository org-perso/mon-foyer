# Mon-Foyer

Mon-Foyer est une application web mobile-first pour suivre les dépenses et revenus, personnels et communs, d'un foyer.

| Partie | Stack |
| --- | --- |
| `apps/web` | Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4, Recharts, client Better Auth |
| `apps/api` | NestJS 12 (ESM), Prisma 7 (`@prisma/adapter-pg`), Better Auth, class-validator, Vitest, oxlint |
| `packages/shared` | Types et constantes partagés (énumérations, devise, formats d'API) |
| Infra | PostgreSQL 17 (Docker Compose), Yarn 4 workspaces, TypeScript 6.0 |

Les règles métier sont décrites dans [docs/business-rules.md](docs/business-rules.md).

## Prérequis

- Node.js ≥ 22.12 (testé avec la 24, voir `.nvmrc`)
- Corepack activé : `corepack enable` (il fournit Yarn 4.18.1, épinglé dans `package.json`)
- Docker Desktop

## Démarrage

```bash
corepack enable
yarn install

# 1. Variables d'environnement (un seul .env à la racine)
cp .env.example .env
#    puis remplacer BETTER_AUTH_SECRET :  openssl rand -base64 32
#    et choisir un POSTGRES_PASSWORD (le reporter dans DATABASE_URL)

# 2. Base de données
yarn db:up                 # PostgreSQL sur 127.0.0.1:5432
yarn db:migrate            # applique les migrations Prisma
yarn db:generate           # génère le client Prisma (apps/api/src/generated)

# 3. Lancer l'API et le web
yarn dev                   # API : http://localhost:3001/api · Web : http://localhost:3000
```

Pour lancer les applications séparément : `yarn dev:api` et `yarn dev:web`. Lancez d'abord `yarn build:shared` une fois.

### Vérifier que tout communique

```bash
curl http://localhost:3001/api/health    # API directe
curl http://localhost:3000/api/health    # via le proxy Next.js
```

La page d'accueil http://localhost:3000 affiche « API opérationnelle · base de données connectée ».

## Commandes

| Commande | Rôle |
| --- | --- |
| `yarn dev` | API + web en mode développement |
| `yarn build` | Build de production de tous les workspaces |
| `yarn typecheck` | Contrôle TypeScript de tous les workspaces |
| `yarn lint` | ESLint (web), oxlint (api) |
| `yarn test` | Tests unitaires (Vitest pour l'API) |
| `yarn check` | typecheck + lint + test |
| `yarn db:up` / `yarn db:down` | Démarrer / arrêter PostgreSQL |
| `yarn db:migrate` | Créer / appliquer une migration (`prisma migrate dev`) |
| `yarn db:generate` | Régénérer le client Prisma |
| `yarn db:studio` | Ouvrir Prisma Studio |
| `yarn workspace @mon-foyer/api test:watch` | Tests de l'API en continu |

Pour créer une nouvelle migration après une modification de `apps/api/prisma/schema.prisma` :

```bash
yarn db:migrate --name description_courte
yarn db:generate
```

## Architecture

```text
mon-foyer/
├── apps/
│   ├── api/                       NestJS — préfixe /api
│   │   ├── prisma/                schéma + migrations (contraintes CHECK incluses)
│   │   └── src/
│   │       ├── auth/              Better Auth + garde globale (@Public pour exempter)
│   │       ├── users/             GET /users/me
│   │       ├── households/        POST/GET /households, GET /households/:id(/members)
│   │       ├── household-members/ requireMembership() : contrôle d'accès inter-foyers
│   │       ├── invitations/       POST /households/:id/invitations, POST /invitations/accept
│   │       ├── categories/        GET /categories
│   │       ├── transactions/      GET /transactions (filtre de visibilité)
│   │       ├── reports/           GET /reports/monthly
│   │       ├── health/            GET /health (public)
│   │       └── common/            argent (Decimal), mois/fuseau, images, filtre d'erreurs
│   └── web/                       Next.js
│       └── src/
│           ├── app/(auth)/        /login, /register
│           ├── app/(app)/         /dashboard, /transactions(/new), /reports, /household, /settings
│           ├── components/        ui, navigation, dashboard, transactions, charts, forms, auth
│           ├── lib/               client auth, appels API serveur, formatage
│           └── proxy.ts           redirection vers /login sans cookie de session
├── packages/shared/
├── docs/business-rules.md
└── docker-compose.yml
```

### Flux d'authentification

Le navigateur ne parle qu'à Next.js (port 3000). Les requêtes `/api/*` sont relayées vers NestJS par un *rewrite*. Les cookies de session sont donc first-party, et le navigateur n'a pas besoin de CORS.

Better Auth (dans NestJS) gère `/api/auth/*` : inscription, connexion, sessions en base, limitation de débit.

Toutes les autres routes passent par `AuthGuard`, qui valide la session côté serveur. Le `proxy.ts` de Next.js n'est qu'une redirection de confort.

## Décisions techniques

- **Better Auth** plutôt qu'une authentification maison :
  - mots de passe hachés et sessions révocables stockées en base ;
  - rate limiting intégré ;
  - fonctionne avec Next.js comme avec NestJS.
- **Versions** : Prisma 7.10.1 plutôt que la 8.0, encore en release candidate. TypeScript 6.0.3 plutôt que la 7, trop récente pour l'outillage (typescript-eslint exige < 6.1).
- **Templates officiels conservés** :
  - NestJS 12 : ESM, Vitest, oxlint ;
  - Next 16 : Turbopack, Cache Components ;
  - pas de Turbo ni de microservices.
- **Yarn 4** avec `nodeLinker: node-modules` : compatible avec Next, Nest et Prisma. Les scripts d'installation ne sont autorisés que pour Prisma et unrs-resolver (`dependenciesMeta`).
- **Argent** : `DECIMAL(15,2)` en base et `Prisma.Decimal` côté API. Les montants circulent en chaînes JSON : aucun calcul en flottant.
- **Dates** : `occurredOn` est de type `DATE`, ce qui évite les décalages de fuseau sur les bornes de mois.
- **Invariants en base** : des contraintes `CHECK` garantissent la séparation personnel/commun, des montants positifs et un propriétaire unique par catégorie. Des index uniques partiels portent sur le nom de catégorie.
- **Identifiants** : UUID v7 pour le domaine (triables chronologiquement). Les tables d'identité gardent les identifiants générés par Better Auth.
- **Validation de la configuration** : l'API refuse de démarrer si le `.env` est invalide (class-validator).
- **Requêtes entrantes** : `whitelist` et `forbidNonWhitelisted` rejettent tout champ inattendu. Helmet est activé, le corps JSON est limité à 100 ko, et le débit global est limité.

## Prochaines étapes

1. CRUD des transactions avec DTO (montant en chaîne, contrôle catégorie/foyer, `memberId` appartenant au foyer), suppression avec confirmation.
2. Catégories par défaut créées avec un foyer et pour chaque utilisateur, plus leur CRUD.
3. Upload de la photo du foyer : multer en mémoire, puis `assertValidImage`, puis stockage (disque local, ensuite S3 ou équivalent).
4. Interface d'invitation : génération du lien, page `/invite/[token]`, révocation.
5. Bilans par catégorie et par membre, et graphique sur plusieurs mois (`MonthlyChart` est prêt).
6. Sélecteur de contexte (personnel / foyer) dans l'interface.
7. Tests e2e de l'API contre une base de test (Supertest), et tests de composants côté web.
8. CI : `yarn check` et `prisma migrate deploy` sur une base éphémère.
9. Avant la mise en production :
   - vérification de l'e-mail et réinitialisation du mot de passe ;
   - stockage Redis pour le rate limiting ;
   - procédure de suppression de compte (les saisies communes bloquent la suppression via `onDelete: Restrict`).
