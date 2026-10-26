# Règles métier — Mon-Foyer

Ces règles gouvernent le modèle de données et les contrôles d'accès. Toute évolution du code doit les respecter ; toute exception doit être documentée ici d'abord.

Mon-Foyer est un outil de **suivi** financier. Il ne déplace jamais d'argent réel.

## Foyers et membres

1. **Création et invitation** — Un utilisateur peut créer un foyer ; il en devient `OWNER`. Un `OWNER` ou un `ADMIN` peut inviter une personne (son conjoint, par exemple). L'invité rejoint le foyer avec le rôle prévu par l'invitation (`MEMBER` ou `ADMIN`, jamais `OWNER`).
2. **Plusieurs foyers** — Un utilisateur peut appartenir à plusieurs foyers (`HouseholdMember` unique sur le couple foyer + utilisateur). Les données de deux foyers ne sont jamais agrégées ensemble : chaque requête porte sur **un seul contexte**, soit l'espace personnel, soit un foyer précis.

## Visibilité

3. **Transaction personnelle** (`scope = PERSONAL`) — Visible uniquement par son propriétaire (`ownerId`). Elle n'est rattachée à aucun foyer (`householdId` nul, imposé par une contrainte `CHECK` en base). Le fait que le propriétaire soit membre d'un foyer ne la rend **jamais** visible aux autres membres. Un partage explicite avec d'autres personnes nécessitera une table d'autorisation dédiée ; il n'est pas implémenté.
4. **Transaction commune** (`scope = HOUSEHOLD`) — Visible par les membres du foyer concerné, et uniquement par eux.

## Transactions

5. **Auteur et membre concerné sont distincts** — `authorId` désigne qui a saisi la transaction (audit). `memberId` désigne, de façon optionnelle, le membre du foyer qu'elle concerne. Exemple : Alice saisit le salaire de Bob.
6. **Revenus et dépenses, personnels ou communs** — `type` (`EXPENSE` / `INCOME`) et `scope` (`PERSONAL` / `HOUSEHOLD`) sont deux axes indépendants.
   - Un montant est toujours strictement positif : c'est `type` qui donne le sens.
   - Une transaction commune n'est **pas** répartie automatiquement entre les membres.

## Bilans

7. **Contenu du bilan mensuel** — Il distingue les revenus, les dépenses et le solde net (revenus − dépenses).
8. **Calcul côté serveur** — Les totaux sont calculés par PostgreSQL (`SUM` sur `DECIMAL(15,2)`) à partir des données persistées, jamais côté client. Les montants circulent en chaînes décimales et ne passent jamais par un nombre flottant.
   - Un bilan ne porte que sur la **devise de référence** du contexte : la devise du foyer, ou la devise par défaut de l'utilisateur pour l'espace personnel. Initialement, c'est `MGA`.
   - Des montants de devises différentes ne sont jamais additionnés.
9. **Dates et fuseau horaire** — `occurredOn` est une **date calendaire** (type `DATE`), saisie dans le fuseau du foyer (par défaut `Indian/Antananarivo`).
   - Un mois `AAAA-MM` correspond à l'intervalle `[1er du mois ; 1er du mois suivant[`, sans conversion horaire.
   - Le fuseau sert uniquement à déterminer « aujourd'hui » et le « mois courant ».

## Sécurité

10. **Autorisation côté serveur** — Chaque requête est authentifiée par une garde globale (jeton de session Clerk : signature, expiration et origine vérifiées). Chaque accès à un foyer passe par `HouseholdMembersService.requireMembership`.
    - Un non-membre reçoit une erreur `404`, qui ne révèle pas l'existence du foyer.
    - Un rôle insuffisant reçoit une erreur `403`.
- **Invitations**
  - Token de 256 bits aléatoires. Seul son hash SHA-256 est stocké, et le token brut n'est affiché qu'une fois.
  - Expiration configurable (`INVITATION_TTL_HOURS`, 72 h par défaut), usage unique (transition atomique `PENDING` → `ACCEPTED`).
  - Restriction optionnelle à une adresse e-mail.
  - Débit limité à 10 requêtes par minute.
- **Images** — Validées d'après leur signature binaire (JPEG, PNG ou WebP ; 2 Mo maximum). Le SVG est refusé.
