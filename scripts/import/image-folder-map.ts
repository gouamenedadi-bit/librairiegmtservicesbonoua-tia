/**
 * Maps each category slug to its image folder(s) under
 * "IMAGES DOSSIER BOUTIQUE EN LIGNE/", verified by listing the real folder
 * names on disk (they have irregular spacing/punctuation, e.g. double
 * spaces or a trailing "-", so this must be exact, not derived).
 *
 * Folders deliberately left out (and why):
 * - "DOCUMENT SCOLAIRES PRIX": files are named by PRICE ("12500.jpg"), not by
 *   product — matching against these would produce confident-looking but
 *   wrong matches.
 * - "IMAGE HUBERT GMT SERVICES LIBRAIRIE": no category correspondence.
 * - The loose photos at the root of "IMAGES DOSSIER BOUTIQUE EN LIGNE/"
 *   (IMG_*.jpg, "WhatsApp Image *.jpeg"): not organized by category at all.
 * - The other 4 root-level asset dumps (raw phone photos, AI-generated
 *   marketing visuals) are out of scope for this first pass — see the plan's
 *   note that automatic image matching only covers well-structured folders;
 *   the rest is for manual attribution via the admin panel.
 * - "papeterie imprime" has no matching image folder at all.
 */
export const IMAGE_FOLDER_MAP: Record<string, string> = {
  "papeterie-assemblage": "IMAGES  ASSEMBLA PRIX",
  "papeterie-bureau": "IMAGES  BUREAU",
  "papeterie-cahiers": "IMAGES  CACHIERS C",
  "papeterie-courrier": "IMAGES  COURRIERS -",
  "papeterie-dessin": "IMAGES  DESSIN",
  "papeterie-ecriture": "IMAGES  ECRITURE",
  "librairie-medecine": "IMAGES  MEDECINE",
  "papeterie-papiers": "IMAGES  PAPIER -",
  "papeterie-peche": "IMAGES  PECHE",
  "papeterie-produits-divers": "IMAGES  PRODUITS 1",
  "papeterie-rouleaux": "IMAGES  ROULEAUX",
  "librairie-scolaire-secondaire": "IMAGES  SCOLAIRE S",
  "librairie-agriculture": "IMAGES AGRICULTURE",
  "librairie-alphabetisation": "IMAGES ALPHABETISATION",
  "librairie-biblique": "IMAGES BIBLE",
  "papeterie-classement": "IMAGES CLASSARC",
  "librairie-correspondance": "IMAGES CORRESPO",
  "librairie-dictionnaires": "IMAGES DICTIONNAIRE",
  "librairie-esoterisme": "IMAGES ESOTHERIS",
  "librairie-litterature": "IMAGES LITTERATURE",
  "librairie-parascolaire": "IMAGES PARA SCOLAIRE",
  "librairie-developpement-personnel": "IMAGES ROMAN DEVELOPPEMENT PERSONNEL",
  "librairie-romans-scolaires": "IMAGES ROMAN SCOLAIRE",
  "librairie-scolaire-primaire": "IMAGES SCOLAIRE PRIMAIRE",
  "librairie-superieur": "IMAGES SUPERIEURE",
  "papeterie-tracarchi": "IMAGES TRACARCHI",
  "librairie-vie-de-couple": "IMAGES VIE DE COU",
};

export const IMAGES_ROOT_FOLDER = "IMAGES DOSSIER BOUTIQUE EN LIGNE";
