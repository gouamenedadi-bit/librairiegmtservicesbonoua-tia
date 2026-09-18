# TIA Librairie — GMT Services Bonoua

Boutique en ligne (librairie + papeterie) à Bonoua, Côte d'Ivoire.
Next.js 16 (App Router) + Supabase (Postgres, Auth, Storage) + Wave (paiement).

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis renseigner les valeurs, voir ci-dessous
npm run dev
```

## Configuration Supabase

1. Dans le projet Supabase existant (supabase.com), ouvrir **Project Settings
   → API** et copier `Project URL`, `anon public key` et `service_role key`
   dans `.env.local`.
2. Appliquer les migrations SQL dans l'ordre, via le **SQL Editor** de
   Supabase (ou `supabase db push` si le CLI est lié) :
   `supabase/migrations/0001_init_schema.sql` → `0005_upsert_product_function.sql`.
3. Régénérer les types une fois le projet lié :
   ```bash
   npx supabase gen types typescript --linked > types/database.types.ts
   ```
4. Créer un premier compte admin : s'inscrire normalement via Supabase Auth,
   puis dans la table `profiles`, passer son `role` à `'admin'`.

## Import du catalogue

Le fichier `FICHIER PRODUITS BOUTIQUE EN LIGNE.xlsx` et les dossiers d'images
restent **hors du dépôt**, un niveau au-dessus de `web/` (voir le dossier
parent). Le script les lit directement, ils ne sont jamais copiés.

```bash
npm run import:catalog            # dry-run : rapport seulement, aucune écriture
npm run import:catalog -- --apply # écrit réellement dans Supabase (clés requises)
```

Le dry-run écrit un rapport détaillé dans `scripts/import/report/` (ignoré
par git) et affiche un résumé : nombre de produits, taux de prix connu vs
« sur demande », et taux d'images liées automatiquement par catégorie.
**Le matching automatique d'images ne couvre qu'une petite partie du
catalogue par conception** (seuil de confiance volontairement élevé) —
l'essentiel de l'attribution photo se fait à la main, via le futur panel
admin, catégorie par catégorie.

## Configuration Wave

`WAVE_API_KEY` et `WAVE_WEBHOOK_SECRET` viennent du compte marchand Wave
Business du client. En développement local, Wave exige des URLs HTTPS pour
`success_url`/`error_url` : utiliser un tunnel (ngrok) ou tester depuis un
déploiement Vercel preview.

## Commandes utiles

```bash
npm run dev             # serveur de développement
npm run build            # build de production
npm run lint              # ESLint
npx tsc --noEmit           # vérification des types
npx next typegen            # à relancer après tout ajout de route dynamique
```
