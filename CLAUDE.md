@AGENTS.md

# TIA Librairie — GMT Services Bonoua

Boutique en ligne (Next.js 16 App Router + Supabase + Wave). Voir le plan
d'origine : `C:\Users\HP\.claude\plans\adaptive-hopping-kite.md`.

## Règles de sécurité — ne jamais contourner

- Le prix d'une commande n'est **jamais** accepté depuis le client. Toute
  création de commande passe par `create_order()` (SQL, `SECURITY DEFINER`,
  voir `supabase/migrations/0003_create_order_function.sql`) qui relit les
  prix dans `products`. Il n'y a aucune policy RLS `INSERT` sur
  `orders`/`order_items` pour `anon`/`authenticated`, et ça doit rester ainsi.
- Toute écriture qui doit contourner RLS (attacher un `wave_checkout_session_id`,
  l'import du catalogue, l'upload d'images) passe par
  `lib/supabase/admin.ts` (clé service-role, serveur uniquement, jamais
  importé depuis un Client Component).
- Les montants XOF sont des **entiers** (`price`, `total_amount`…), jamais de
  décimales — le franc CFA n'a pas de subdivision utilisée en pratique.

## Catalogue produit — ce qui est réel, pas supposé

- Le fichier source (`FICHIER PRODUITS BOUTIQUE EN LIGNE.xlsx`, hors du repo,
  un niveau au-dessus de `web/`) a 30 feuilles. `Table 1` est exclue de
  l'import (quasi aucun prix rempli, non synchronisée avec les 29 feuilles
  catégorie) — voir `lib/catalog/category-map.ts` pour le detail et le
  mapping feuille → catégorie, écrit à la main (les noms de feuilles bruts
  sont trop irréguliers pour un slugify automatique).
- La quasi-totalité des produits n'ont pas de prix dans le fichier source :
  `price_status = 'on_request'` est l'état normal, pas une anomalie. Ne
  jamais inventer un prix.
- Les dossiers d'images sont très inégalement remplis : certains dossiers
  catégorie ("IMAGES BIBLE", "IMAGES CACHIERS C"...) sont vides sur le
  disque, d'autres (tracarchi, rouleaux, assemblage) contiennent de vraies
  photos. Le matching automatique nom-de-fichier ↔ libellé produit
  (`scripts/import/match-images.ts`) ne couvre qu'une fraction du catalogue
  par construction (seuil de confiance élevé, volontairement) — voir
  `npm run import:catalog` (dry-run par défaut) pour les chiffres réels.
  L'attribution manuelle via le futur panel admin est le chemin principal,
  pas un fallback secondaire.
- Le re-import (`npm run import:catalog -- --apply`) est non-destructif :
  `upsert_imported_product()` ne resynchronise les champs venant d'Excel que
  si `manually_edited_at is null` sur la fiche produit.

## Next.js 16 — ne pas coder comme en 15

Ce projet a été scaffoldé avec Next.js 16 (React 19.2, Turbopack par défaut).
Avant de toucher aux routes, lire `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`.
Points qui cassent le code écrit "à l'ancienne" :

- `params`, `searchParams`, `cookies()`, `headers()` sont **async** partout
  (page, layout, route handler, generateMetadata). Toujours `await`.
  Utiliser les helpers générés `PageProps<"/route/[slug]">` /
  `LayoutProps<"/...">` plutôt que retaper les types à la main.
- Le fichier `middleware.ts` n'existe plus : c'est `proxy.ts` (export
  `proxy`, pas `middleware`).
- `next/image` : utiliser `images.remotePatterns` (jamais `domains`,
  déprécié) — voir `next.config.ts` pour le pattern Supabase Storage.
- Après tout ajout de route dynamique, lancer `npx next typegen` avant `tsc`
  ou le build, sinon `PageProps<"/nouvelle-route">` n'existe pas encore côté
  types.

## Base de données

`types/database.types.ts` est écrit à la main tant que les clés Supabase du
projet ne sont pas connectées. Une fois `supabase link` fait :
`npx supabase gen types typescript --linked > types/database.types.ts`.
Attention : `@supabase/postgrest-js` exige `Relationships: []` (ou la vraie
liste de FK) sur chaque table du type `Database`, sinon tout le générique
s'effondre silencieusement en `never` (RPC/`select()` deviennent
intypables) — vécu en pratique sur ce projet, voir le commentaire en tête de
`database.types.ts`.
