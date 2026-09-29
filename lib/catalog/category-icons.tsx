import { createElement } from "react";
import {
  Archive,
  Briefcase,
  BookA,
  BookCopy,
  BookMarked,
  BookOpen,
  CalendarDays,
  Fish,
  Flag,
  FolderOpen,
  GraduationCap,
  HeartHandshake,
  Landmark,
  Layers,
  Mail,
  NotebookText,
  Package,
  Palette,
  PartyPopper,
  PenLine,
  Scissors,
  School,
  Send,
  SpellCheck,
  Sparkles,
  Sprout,
  Stethoscope,
  Wheat,
  type LucideIcon,
} from "lucide-react";

/**
 * Visual "thumbnail" shown next to each category (header mega-menu, category
 * page banner). We don't have curated category cover photos yet — most of
 * the client's per-category image folders are empty (see the import dry-run
 * report) — so an icon stands in for a photo for now. Swap a slug's entry
 * here for a real image once one exists; nothing else needs to change.
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "papeterie-tracarchi": Archive,
  "papeterie-classement": FolderOpen,
  "papeterie-courrier": Mail,
  "papeterie-cahiers": NotebookText,
  "papeterie-papiers": PartyPopper,
  "papeterie-dessin": Palette,
  "papeterie-imprimes": CalendarDays,
  "papeterie-rouleaux": Flag,
  "papeterie-bureau": Briefcase,
  "papeterie-assemblage": Scissors,
  "papeterie-ecriture": PenLine,
  "papeterie-produits-divers": Package,
  "papeterie-peche": Fish,

  "librairie-scolaire-secondaire": GraduationCap,
  "librairie-medecine": Stethoscope,
  "librairie-litterature": BookOpen,
  "librairie-esoterisme": Sparkles,
  "librairie-biblique": BookMarked,
  "librairie-romans-scolaires": BookCopy,
  "librairie-developpement-personnel": Sprout,
  "librairie-dictionnaires": SpellCheck,
  "librairie-correspondance": Send,
  "librairie-agriculture": Wheat,
  "librairie-alphabetisation": BookA,
  "librairie-vie-de-couple": HeartHandshake,
  "librairie-scolaire-primaire": School,
  "librairie-parascolaire": Layers,
  "librairie-superieur": Landmark,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? BookOpen;
}

/**
 * Prefer this over calling `getCategoryIcon` and rendering the result via a
 * `<Icon />` JSX tag in a component body — assigning a lookup's result to a
 * capitalized local variable and using it as a tag trips the
 * `react-hooks/static-components` lint rule (it can't tell that apart from
 * actually defining a new component inline on every render). `createElement`
 * sidesteps the JSX-tag pattern the rule looks for.
 */
export function CategoryIcon({
  slug,
  size,
  className,
}: {
  slug: string;
  size?: number;
  className?: string;
}) {
  return createElement(getCategoryIcon(slug), { size, className });
}
