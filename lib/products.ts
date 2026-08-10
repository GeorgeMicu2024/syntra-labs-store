export type ProductCategory =
  | "Metabolic"
  | "Peptide"
  | "Cellular"
  | "Hormone"
  | "Lab Supplies";

export type Product = {
  id: string;
  slug: string;
  name: string;
  code: string;
  strength: string;
  category: ProductCategory;

  price: number;
  stock: number;

  featured?: boolean;

  image: string;

  short: string;
  description: string;
};

const researchNotice =
  "This catalogue item is presented for laboratory research use only and is not intended for human or veterinary use.";

export const products: Product[] = [
  {
    id: "tr5",
    slug: "tirzepatide-mounjaro-5mg",
    name: "Tirzepatide (Mounjaro)",
    code: "TR5",
    strength: "5 mg",
    category: "Metabolic",

    price: 39,
    stock: 17,
    featured: true,

    image: "/products/tr5.png",

    short:
      "Dual-pathway research material supplied in a clearly labelled 5 mg vial.",

    description:
      "Dual-pathway research material supplied in a clearly labelled 5 mg vial. " +
      researchNotice,
  },

  {
    id: "tr10",
    slug: "tirzepatide-mounjaro-10mg",
    name: "Tirzepatide (Mounjaro)",
    code: "TR10",
    strength: "10 mg",
    category: "Metabolic",

    price: 69,
    stock: 21,
    featured: true,

    image: "/products/tr10.png",

    short:
      "Dual-pathway research material supplied in a clearly labelled 10 mg vial.",

    description:
      "Dual-pathway research material supplied in a clearly labelled 10 mg vial. " +
      researchNotice,
  },

  {
    id: "rt5",
    slug: "retatrutide-reta-5mg",
    name: "Retatrutide (RETA)",
    code: "RETA5",
    strength: "5 mg",
    category: "Metabolic",

    price: 45,
    stock: 14,
    featured: false,

    image: "/products/rt5.png",

    short:
      "Triple-receptor research compound supplied in a 5 mg single-vial format.",

    description:
      "Triple-receptor research compound supplied in a 5 mg single-vial format. " +
      researchNotice,
  },

  {
    id: "rt20",
    slug: "retatrutide-reta-20mg",
    name: "Retatrutide (RETA)",
    code: "RETA20",
    strength: "20 mg",
    category: "Metabolic",

    price: 105,
    stock: 22,
    featured: true,

    image: "/products/rt20.png",

    short:
      "Triple-receptor research compound supplied in a 20 mg single-vial format.",

    description:
      "Triple-receptor research compound supplied in a 20 mg single-vial format. " +
      researchNotice,
  },

  {
    id: "rt30",
    slug: "retatrutide-reta-30mg",
    name: "Retatrutide (RETA)",
    code: "RETA30",
    strength: "30 mg",
    category: "Metabolic",

    price: 125,
    stock: 18,
    featured: true,

    image: "/products/rt30.png",

    short:
      "Triple-receptor research compound supplied in a premium 30 mg vial.",

    description:
      "Triple-receptor research compound supplied in a premium 30 mg vial. " +
      researchNotice,
  },

  {
    id: "bpc10",
    slug: "bpc-157-10mg",
    name: "BPC-157",
    code: "BPC10",
    strength: "10 mg",
    category: "Peptide",

    price: 48,
    stock: 28,
    featured: true,

    image: "/products/bpc10.png",

    short:
      "Peptide research material supplied for controlled non-clinical laboratory analysis.",

    description:
      "Peptide research material supplied for controlled non-clinical laboratory analysis. " +
      researchNotice,
  },

  {
    id: "bpc20",
    slug: "bpc-157-20mg",
    name: "BPC-157",
    code: "BPC20",
    strength: "20 mg",
    category: "Peptide",

    price: 75,
    stock: 18,

    image: "/products/bpc20.png",

    short:
      "Higher-capacity BPC-157 research material in a clearly coded 20 mg vial.",

    description:
      "Higher-capacity BPC-157 research material in a clearly coded 20 mg vial. " +
      researchNotice,
  },

  {
    id: "ghk100",
    slug: "ghk-cu-100mg",
    name: "GHK-Cu",
    code: "GHK100",
    strength: "100 mg",
    category: "Peptide",

    price: 45,
    stock: 24,
    featured: true,

    image: "/products/ghk100.png",

    short:
      "Copper peptide research material supplied in a 100 mg laboratory vial.",

    description:
      "Copper peptide research material supplied in a 100 mg laboratory vial. " +
      researchNotice,
  },

  {
    id: "ghk1000",
    slug: "ghk-cu-1000mg",
    name: "GHK-Cu",
    code: "GHK1000",
    strength: "1000 mg",
    category: "Peptide",

    price: 120,
    stock: 7,

    image: "/products/ghk1000.png",

    short:
      "High-capacity copper peptide research material in a 1000 mg format.",

    description:
      "High-capacity copper peptide research material in a 1000 mg format. " +
      researchNotice,
  },

  {
    id: "ahk100",
    slug: "ahk-cu-100mg",
    name: "AHK-Cu",
    code: "AHK100",
    strength: "100 mg",
    category: "Peptide",

    price: 50,
    stock: 13,

    image: "/products/ahk100.png",

    short:
      "Laboratory peptide material with secure and clearly coded presentation.",

    description:
      "Laboratory peptide material with secure and clearly coded presentation. " +
      researchNotice,
  },

  {
    id: "nad100",
    slug: "nad-plus-100mg",
    name: "NAD+",
    code: "NAD100",
    strength: "100 mg",
    category: "Cellular",

    price: 35,
    stock: 31,
    featured: true,

    image: "/products/nad100.png",

    short:
      "Cellular research material supplied in a protected 100 mg vial.",

    description:
      "Cellular research material supplied in a protected 100 mg vial. " +
      researchNotice,
  },

  {
    id: "nad1000",
    slug: "nad-plus-1000mg",
    name: "NAD+",
    code: "NAD1000",
    strength: "1000 mg",
    category: "Cellular",

    price: 98,
    stock: 8,

    image: "/products/nad1000.png",

    short:
      "High-capacity NAD+ research material supplied in a 1000 mg vial.",

    description:
      "High-capacity NAD+ research material supplied in a 1000 mg vial. " +
      researchNotice,
  },

  {
    id: "tesa5",
    slug: "tesamorelin-5mg",
    name: "Tesamorelin",
    code: "TESA5",
    strength: "5 mg",
    category: "Hormone",

    price: 48,
    stock: 12,

    image: "/products/tesa5.png",

    short:
      "Hormone-pathway research compound in a compact 5 mg laboratory format.",

    description:
      "Hormone-pathway research compound in a compact 5 mg laboratory format. " +
      researchNotice,
  },

  {
    id: "survo10",
    slug: "survodutide-10mg",
    name: "Survodutide",
    code: "SURVO10",
    strength: "10 mg",
    category: "Metabolic",

    price: 65,
    stock: 8,

    image: "/products/survo10.png",

    short:
      "Dual-action research peptide supplied for controlled laboratory investigation.",

    description:
      "Dual-action research peptide supplied for controlled laboratory investigation. " +
      researchNotice,
  },

  {
    id: "cere60",
    slug: "cerebrolysin-60mg",
    name: "Cerebrolysin",
    code: "CERE60",
    strength: "60 mg",
    category: "Cellular",

    price: 62,
    stock: 10,

    image: "/products/cere60.png",

    short:
      "Peptide-complex research material with clear 60 mg product coding.",

    description:
      "Peptide-complex research material with clear 60 mg product coding. " +
      researchNotice,
  },

  {
    id: "mt5",
    slug: "melanotan-ii-mt2-5mg",
    name: "Melanotan II (MT-2)",
    code: "MT2-5",
    strength: "5 mg",
    category: "Peptide",

    price: 45,
    stock: 18,

    image: "/products/mt5.png",

    short:
      "Synthetic peptide research compound presented in a protected 5 mg vial.",

    description:
      "Synthetic peptide research compound presented in a protected 5 mg vial. " +
      researchNotice,
  },

  {
    id: "selank10",
    slug: "selank-sk10-10mg",
    name: "Selank (SK10)",
    code: "SK10",
    strength: "10 mg",
    category: "Peptide",

    price: 48,
    stock: 12,

    image: "/products/selank10.png",

    short:
      "Synthetic peptide research material supplied in a 10 mg vial.",

    description:
      "Synthetic peptide research material supplied in a 10 mg vial. " +
      researchNotice,
  },

  {
    id: "hcg2000",
    slug: "hcg-g2k-2000iu",
    name: "HCG (G2K)",
    code: "G2K",
    strength: "2000 IU",
    category: "Hormone",

    price: 55,
    stock: 10,

    image: "/products/hcg2000.png",

    short:
      "Hormone research material supplied in a clearly labelled 2000 IU format.",

    description:
      "Hormone research material supplied in a clearly labelled 2000 IU format. " +
      researchNotice,
  },

  {
    id: "aod2",
    slug: "aod9604-2ad-2mg",
    name: "AOD9604 (2AD)",
    code: "2AD",
    strength: "2 mg",
    category: "Peptide",

    price: 39,
    stock: 15,

    image: "/products/aod2.png",

    short:
      "Peptide-fragment research material supplied in a compact 2 mg vial.",

    description:
      "Peptide-fragment research material supplied in a compact 2 mg vial. " +
      researchNotice,
  },

  {
    id: "bac3",
    slug: "bac-water-3ml",
    name: "BAC Water",
    code: "BAC3",
    strength: "3 ml",
    category: "Lab Supplies",

    price: 1,
    stock: 45,

    image: "/products/bac3.png",

    short:
      "Bacteriostatic water supplied as a 3 ml laboratory preparation material.",

    description:
      "Bacteriostatic water supplied as a 3 ml laboratory preparation material. " +
      researchNotice,
  },
];

export const getProduct = (slug: string) =>
  products.find((product) => product.slug === slug);

export const getProductById = (id: string) =>
  products.find((product) => product.id === id);

export const getFeaturedProducts = () =>
  products.filter((product) => product.featured);

export const getProductsByCategory = (
  category: ProductCategory
) =>
  products.filter(
    (product) => product.category === category
  );