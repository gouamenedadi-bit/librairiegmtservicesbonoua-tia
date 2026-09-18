/**
 * Mapping written by hand from the raw Excel sheet names (FICHIER PRODUITS
 * BOUTIQUE EN LIGNE.xlsx) to a clean display name + slug. Deliberately not
 * auto-slugified — the raw sheet names are too inconsistent
 * ("papeterie cachiers C", "LIbrairie ESOTHERIS"...) to trust a naive
 * transform. Two sheets can share a slug (e.g. the two medicine sheets):
 * they will be merged into the same category by the import script.
 *
 * `null` marks a sheet intentionally excluded from import — "Table 1" is the
 * client's global catalog export, but it is 6037 rows with almost no prices
 * filled in and is not kept in sync with the 29 category sheets, so the
 * per-category sheets are the source of truth (see plan for details).
 */
export type CategoryMapping = { name: string; slug: string };

export const CATEGORY_MAP: Record<string, CategoryMapping | null> = {
  "Table 1": null,

  "papeterie tracarchi": { name: "Tracarchi & Rangement", slug: "papeterie-tracarchi" },
  "papeterie classarc": { name: "Classement & Archivage", slug: "papeterie-classement" },
  "papeterie couriers": { name: "Courrier & Tampons", slug: "papeterie-courrier" },
  "papeterie cachiers C": { name: "Cahiers", slug: "papeterie-cahiers" },
  "Papeterie papiers": { name: "Papiers & Fêtes", slug: "papeterie-papiers" },
  "papeterie dessin": { name: "Dessin & Beaux-Arts", slug: "papeterie-dessin" },
  "papeterie imprime": { name: "Imprimés & Agendas", slug: "papeterie-imprimes" },
  "papeterie rouleaux": { name: "Rouleaux & Banderoles", slug: "papeterie-rouleaux" },
  "papeterie bureau": { name: "Fournitures de Bureau", slug: "papeterie-bureau" },
  "papeterie Assembla": { name: "Assemblage (Agrafes, Ciseaux…)", slug: "papeterie-assemblage" },
  "papeterie Ecriture": { name: "Écriture", slug: "papeterie-ecriture" },
  "papeterie produits 1": { name: "Papeterie — Autres produits", slug: "papeterie-produits-divers" },
  "Papeterie peche": { name: "Pêche & Loisirs", slug: "papeterie-peche" },

  "LIBRAIRIE SCOLAIRE S": { name: "Scolaire — Secondaire", slug: "librairie-scolaire-secondaire" },
  "PAPETERIE MEDECINE": { name: "Médecine", slug: "librairie-medecine" },
  "Librairie Medecine": { name: "Médecine", slug: "librairie-medecine" },
  "LIbrairie Litterature": { name: "Littérature", slug: "librairie-litterature" },
  "LIbrairie ESOTHERIS": { name: "Ésotérisme", slug: "librairie-esoterisme" },
  "LIBRAIRIE LITTERATURE BIBLIQUE": { name: "Littérature Biblique", slug: "librairie-biblique" },
  "LIBRAIRIE ROMANS SCOLAIRES": { name: "Romans Scolaires", slug: "librairie-romans-scolaires" },
  "LIBRAIRIE DEVELOPPEMENT P": { name: "Développement Personnel", slug: "librairie-developpement-personnel" },
  "LIBRAIRIE LES DICTIONNAIRES": { name: "Dictionnaires", slug: "librairie-dictionnaires" },
  "LIBRAIRIE CORRESPO": { name: "Correspondance", slug: "librairie-correspondance" },
  "LIBRAIRIE AGRICULTURE": { name: "Agriculture", slug: "librairie-agriculture" },
  "LIBRAIRIE ALPHABETISATION": { name: "Alphabétisation", slug: "librairie-alphabetisation" },
  "LIBRAIRIE VIE DE COUPLE": { name: "Vie de Couple", slug: "librairie-vie-de-couple" },
  "LIBRAIRIE SCOLAIRE PRIMAIRE": { name: "Scolaire — Primaire", slug: "librairie-scolaire-primaire" },
  "LIBRAIRIE PARA SCOLAIRES": { name: "Parascolaire", slug: "librairie-parascolaire" },
  "LIBRAIRIE SUPERIEURE": { name: "Enseignement Supérieur", slug: "librairie-superieur" },
};
