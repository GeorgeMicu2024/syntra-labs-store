export type EvidenceTier =
  | "Clinical literature"
  | "Early clinical literature"
  | "Preclinical literature"
  | "Mechanistic literature"
  | "Laboratory accessory";

export type ResearchReference = {
  label: string;
  journal: string;
  year: number;
  pmid: string;
  note: string;
};

export type ResearchProfile = {
  key: string;
  title: string;
  researchClass: string;
  tier: EvidenceTier;
  mechanism: string;
  focus: string[];
  evidenceSummary: string;
  context: string;
  references: ResearchReference[];
};

const profiles: Record<string, ResearchProfile> = {
  tirzepatide: {
    key: "tirzepatide",
    title: "Tirzepatide",
    researchClass: "Dual incretin receptor agonist",
    tier: "Clinical literature",
    mechanism:
      "A synthetic peptide investigated for combined agonism at glucose-dependent insulinotropic polypeptide (GIP) and glucagon-like peptide-1 (GLP-1) receptors.",
    focus: [
      "GIP and GLP-1 receptor signalling",
      "Glucose-regulated metabolic pathways",
      "Integrated incretin pharmacology",
    ],
    evidenceSummary:
      "Peer-reviewed receptor-signalling work and large randomized clinical programmes have characterised the pharmacology of the tirzepatide molecule. The scientific literature cited here describes the compound; it does not establish the identity, purity, safety or suitability of a catalogue item.",
    context:
      "For laboratory orientation, tirzepatide is useful as a reference point for research into multi-receptor incretin signalling and biased agonism.",
    references: [
      {
        label: "SURPASS-1 randomized phase 3 trial",
        journal: "The Lancet",
        year: 2021,
        pmid: "34186022",
        note: "Human clinical study describing dual GIP/GLP-1 receptor agonism and metabolic endpoints.",
      },
      {
        label: "Receptor pharmacology and biased agonism",
        journal: "Nature Medicine",
        year: 2020,
        pmid: "32730231",
        note: "Mechanistic work characterising differential GIP/GLP-1 receptor signalling.",
      },
    ],
  },

  retatrutide: {
    key: "retatrutide",
    title: "Retatrutide",
    researchClass: "Triple hormone-receptor agonist",
    tier: "Clinical literature",
    mechanism:
      "An investigational peptide designed to activate GIP, GLP-1 and glucagon receptors within a single molecule.",
    focus: [
      "Multi-receptor metabolic signalling",
      "Glucagon / incretin pathway interaction",
      "Dose-response pharmacology",
    ],
    evidenceSummary:
      "A randomized phase 2 study published in 2023 evaluated the retatrutide molecule in adults with obesity and documented its triple-receptor pharmacology. The cited evidence concerns the investigational molecule, not this catalogue material.",
    context:
      "Retatrutide is scientifically notable as a model for studying how simultaneous GIP, GLP-1 and glucagon receptor engagement changes integrated metabolic signalling.",
    references: [
      {
        label: "Triple-Hormone-Receptor Agonist Retatrutide for Obesity",
        journal: "New England Journal of Medicine",
        year: 2023,
        pmid: "37366315",
        note: "Randomized phase 2 clinical trial of the retatrutide molecule.",
      },
    ],
  },

  survodutide: {
    key: "survodutide",
    title: "Survodutide",
    researchClass: "Dual glucagon / GLP-1 receptor agonist",
    tier: "Clinical literature",
    mechanism:
      "An investigational dual agonist combining glucagon-receptor and GLP-1-receptor activity.",
    focus: [
      "Glucagon and GLP-1 receptor co-activation",
      "Hepatic metabolic signalling",
      "Energy-balance pathway research",
    ],
    evidenceSummary:
      "A 48-week randomized phase 2 trial studied survodutide in metabolic dysfunction-associated steatohepatitis (MASH) with fibrosis. This is compound-level scientific context only and is not a therapeutic claim for catalogue material.",
    context:
      "The molecule is of research interest because it combines incretin signalling with glucagon-receptor biology in one investigational scaffold.",
    references: [
      {
        label: "Phase 2 randomized trial of survodutide in MASH",
        journal: "New England Journal of Medicine",
        year: 2024,
        pmid: "38847460",
        note: "Human clinical study of dual glucagon/GLP-1 receptor agonism.",
      },
    ],
  },

  tesamorelin: {
    key: "tesamorelin",
    title: "Tesamorelin",
    researchClass: "Growth hormone-releasing hormone analogue",
    tier: "Clinical literature",
    mechanism:
      "A synthetic analogue of growth hormone-releasing hormone (GHRH), investigated through the pituitary GH / IGF-1 axis.",
    focus: [
      "GHRH receptor biology",
      "GH / IGF-1 axis signalling",
      "Body-composition and hepatic-fat research endpoints",
    ],
    evidenceSummary:
      "Randomized human studies have characterised tesamorelin as a GHRH analogue and measured visceral adipose, liver-fat and endocrine endpoints in defined clinical populations.",
    context:
      "Laboratory research commonly uses GHRH analogues to interrogate endocrine signalling rather than direct growth-hormone receptor activation.",
    references: [
      {
        label: "Visceral and liver fat randomized clinical trial",
        journal: "JAMA",
        year: 2014,
        pmid: "25038357",
        note: "Double-blind randomized study describing GHRH-analogue biology and measured metabolic endpoints.",
      },
    ],
  },

  bpc157: {
    key: "bpc157",
    title: "BPC-157",
    researchClass: "Investigational pentadecapeptide",
    tier: "Preclinical literature",
    mechanism:
      "A 15-amino-acid investigational peptide discussed in experimental tissue-injury and signalling models; a validated clinical mechanism has not been established.",
    focus: [
      "Preclinical tissue-response models",
      "Experimental angiogenic and repair signalling",
      "Translational-development limitations",
    ],
    evidenceSummary:
      "The published literature remains dominated by preclinical models. A 2026 translational review reported no approved formulation, no validated dosing regimen and no completed phase II clinical trial. That limitation is important context for responsible research communication.",
    context:
      "BPC-157 should be presented as an investigational research peptide, not as an established human therapeutic.",
    references: [
      {
        label: "Translational development and biopharmaceutical barriers",
        journal: "PubMed-indexed review",
        year: 2026,
        pmid: "42198317",
        note: "Review emphasising the gap between preclinical activity and validated clinical development.",
      },
    ],
  },

  ghkcu: {
    key: "ghkcu",
    title: "GHK-Cu",
    researchClass: "Copper-binding tripeptide complex",
    tier: "Preclinical literature",
    mechanism:
      "Glycyl-L-histidyl-L-lysine complexed with copper(II), studied in fibroblast and extracellular-matrix models.",
    focus: [
      "Fibroblast biology",
      "Extracellular-matrix remodelling",
      "Collagen and metalloproteinase expression",
    ],
    evidenceSummary:
      "Cell-culture studies have reported changes in collagen synthesis, matrix metalloproteinase expression and fibroblast behaviour after exposure to GHK-Cu. These are laboratory findings and should not be translated directly into clinical claims.",
    context:
      "GHK-Cu is best framed as a copper-peptide tool for studying cell-matrix communication and tissue-remodelling pathways.",
    references: [
      {
        label: "MMP-2 expression in fibroblast cultures",
        journal: "Life Sciences",
        year: 2000,
        pmid: "11045606",
        note: "In-vitro fibroblast study of extracellular-matrix remodelling markers.",
      },
      {
        label: "Collagen synthesis in fibroblast cultures",
        journal: "FEBS Letters",
        year: 1988,
        pmid: "3169264",
        note: "In-vitro study reporting effects on collagen synthesis.",
      },
    ],
  },

  ahkcu: {
    key: "ahkcu",
    title: "AHK-Cu",
    researchClass: "Copper-binding tripeptide complex",
    tier: "Preclinical literature",
    mechanism:
      "L-alanyl-L-histidyl-L-lysine complexed with copper(II), investigated in dermal papilla cell and ex-vivo follicle models.",
    focus: [
      "Dermal papilla cell biology",
      "Ex-vivo follicle models",
      "Cell proliferation and survival signalling",
    ],
    evidenceSummary:
      "Published work includes ex-vivo human hair-follicle and cultured dermal papilla cell experiments. These models are useful for mechanistic research but do not by themselves establish clinical efficacy.",
    context:
      "AHK-Cu belongs to a small class of copper-peptide complexes used to investigate growth-factor signalling in skin and follicular cell systems.",
    references: [
      {
        label: "Tripeptide-copper complex and human hair growth in vitro",
        journal: "Archives of Pharmacal Research",
        year: 2007,
        pmid: "17703734",
        note: "Ex-vivo follicle and cultured dermal papilla cell study.",
      },
    ],
  },

  nad: {
    key: "nad",
    title: "NAD+",
    researchClass: "Cellular redox cofactor",
    tier: "Mechanistic literature",
    mechanism:
      "Nicotinamide adenine dinucleotide (NAD+) is a central redox cofactor used in energy metabolism and as a substrate for multiple enzyme families.",
    focus: [
      "Cellular redox state",
      "NAD-dependent enzyme systems",
      "Metabolic and mitochondrial research",
    ],
    evidenceSummary:
      "NAD+ biology is well established, but most controlled human intervention literature studies NAD+ precursors such as NR or NMN rather than direct use of the catalogue material. The distinction matters when interpreting published evidence.",
    context:
      "For research communication, separate fundamental NAD+ biochemistry from claims about any particular delivery route or preparation.",
    references: [
      {
        label: "Human comparison of NAD+ precursor strategies",
        journal: "Nature Metabolism",
        year: 2026,
        pmid: "41540253",
        note: "Human study comparing effects of NAD+ precursor strategies on circulatory NAD metabolism.",
      },
      {
        label: "Human skeletal-muscle NAD+ metabolome study",
        journal: "Cell Reports",
        year: 2019,
        pmid: "31412242",
        note: "Randomized crossover study of nicotinamide riboside and the muscle NAD+ metabolome.",
      },
    ],
  },

  cerebrolysin: {
    key: "cerebrolysin",
    title: "Cerebrolysin",
    researchClass: "Peptide / amino-acid preparation",
    tier: "Clinical literature",
    mechanism:
      "A complex preparation of low-molecular-weight peptides and amino acids investigated in neurotrophic and neuroprotection research.",
    focus: [
      "Neurotrophic signalling models",
      "Ischaemia and recovery research",
      "Cognition-focused clinical endpoints",
    ],
    evidenceSummary:
      "Cerebrolysin has been investigated in animal models and randomized human studies across several neurological settings. The evidence base is heterogeneous, so a professional research page should present the literature without implying a universal clinical conclusion.",
    context:
      "This material is better described by its study history and proposed neurotrophic research context than by broad efficacy statements.",
    references: [
      {
        label: "CASTA acute ischaemic stroke trial",
        journal: "Stroke",
        year: 2012,
        pmid: "22282884",
        note: "Large randomized placebo-controlled trial in acute ischaemic stroke.",
      },
      {
        label: "Randomized acute stroke neuroprotection study",
        journal: "Journal of Neural Transmission",
        year: 2005,
        pmid: "15583955",
        note: "Randomized placebo-controlled study describing neurotrophic / neuroprotective research context.",
      },
    ],
  },

  melanotan2: {
    key: "melanotan2",
    title: "Melanotan II",
    researchClass: "Synthetic melanocortin analogue",
    tier: "Early clinical literature",
    mechanism:
      "A cyclic analogue of alpha-melanocyte-stimulating hormone investigated through melanocortin receptor pathways.",
    focus: [
      "Melanocortin receptor pharmacology",
      "Pigmentation signalling",
      "Early human pharmacology",
    ],
    evidenceSummary:
      "Small early-phase human studies characterised pharmacological effects and adverse events. The evidence base is limited and does not support presenting the catalogue material as an established therapeutic product.",
    context:
      "Melanotan II is most appropriately framed as an investigational melanocortin-pathway research compound.",
    references: [
      {
        label: "Pilot phase-I clinical study",
        journal: "Life Sciences",
        year: 1996,
        pmid: "8637402",
        note: "Small early human study characterising melanotropic activity and tolerability signals.",
      },
    ],
  },

  selank: {
    key: "selank",
    title: "Selank",
    researchClass: "Synthetic heptapeptide",
    tier: "Early clinical literature",
    mechanism:
      "A synthetic heptapeptide investigated in neuropeptide, enkephalin and GABA-related research models.",
    focus: [
      "Neuropeptide signalling",
      "GABA / enkephalin pathway research",
      "Exploratory anxiety-related clinical endpoints",
    ],
    evidenceSummary:
      "The human literature includes small comparative studies, largely from a limited set of research groups and regions. Those limitations should remain visible when communicating the evidence.",
    context:
      "Selank is suitable for discussion as an exploratory neuropeptide research compound rather than a broadly validated clinical intervention.",
    references: [
      {
        label: "Comparative clinical study in anxiety disorders",
        journal: "PubMed-indexed clinical study",
        year: 2014,
        pmid: "25176261",
        note: "Small comparative human study; interpret within its methodological and regional context.",
      },
      {
        label: "Enkephalin-degrading enzyme mechanism study",
        journal: "Bulletin of Experimental Biology and Medicine",
        year: 2001,
        pmid: "11550013",
        note: "Mechanistic work on enkephalin degradation.",
      },
    ],
  },

  hcg: {
    key: "hcg",
    title: "Human chorionic gonadotropin (hCG)",
    researchClass: "Glycoprotein hormone",
    tier: "Mechanistic literature",
    mechanism:
      "A heterodimeric glycoprotein hormone that signals through the luteinizing hormone / chorionic gonadotropin receptor (LHCGR), a G-protein-coupled receptor.",
    focus: [
      "LHCGR receptor signalling",
      "cAMP and downstream signalling cascades",
      "Reproductive endocrine biology",
    ],
    evidenceSummary:
      "hCG and LHCGR biology are extensively established in endocrine research. Catalogue presentation should nevertheless distinguish basic receptor biology from any intended clinical or veterinary use.",
    context:
      "hCG is a classic ligand for studying LHCGR activation and downstream endocrine signalling pathways.",
    references: [
      {
        label: "Hormonal and allosteric regulation of LHCGR",
        journal: "Frontiers in Bioscience",
        year: 2024,
        pmid: "39344322",
        note: "Modern review of LHCGR signalling and regulation.",
      },
    ],
  },

  aod9604: {
    key: "aod9604",
    title: "AOD9604",
    researchClass: "Growth-hormone C-terminal fragment",
    tier: "Preclinical literature",
    mechanism:
      "A synthetic C-terminal fragment derived from human growth hormone and historically investigated for metabolic signalling separate from full-length GH.",
    focus: [
      "Preclinical lipid-metabolism models",
      "Growth-hormone fragment pharmacology",
      "Beta-adrenergic pathway research",
    ],
    evidenceSummary:
      "Preclinical mouse work investigated lipid-metabolism effects, while historical development literature described early clinical exploration. Human evidence is limited and should not be presented as established efficacy.",
    context:
      "AOD9604 is best positioned as a historical investigational GH-fragment tool for metabolic-pathway research.",
    references: [
      {
        label: "AOD9604 and lipid metabolism in obese mice",
        journal: "Endocrinology",
        year: 2001,
        pmid: "11713213",
        note: "Preclinical study of lipid metabolism and beta-adrenergic signalling.",
      },
      {
        label: "AOD-9604 investigational development overview",
        journal: "Current Opinion in Investigational Drugs",
        year: 2004,
        pmid: "15134286",
        note: "Historical overview of early investigational development.",
      },
    ],
  },

  bacwater: {
    key: "bacwater",
    title: "Bacteriostatic water",
    researchClass: "Laboratory preparation material",
    tier: "Laboratory accessory",
    mechanism:
      "A preparation accessory rather than an active research analyte. Its role in a laboratory workflow depends on validated protocols, compatibility requirements and the specification of the material being prepared.",
    focus: [
      "Laboratory preparation workflows",
      "Protocol compatibility",
      "Controlled handling and labelling",
    ],
    evidenceSummary:
      "No biological efficacy claim is appropriate for a preparation accessory. Laboratory users should follow the validated protocol and material specification relevant to their own work.",
    context:
      "Catalogue information intentionally avoids procedural or administration guidance.",
    references: [],
  },
};

const productProfileMap: Record<string, keyof typeof profiles> = {
  tr5: "tirzepatide",
  tr10: "tirzepatide",
  rt5: "retatrutide",
  rt20: "retatrutide",
  rt30: "retatrutide",
  bpc10: "bpc157",
  bpc20: "bpc157",
  ghk100: "ghkcu",
  ghk1000: "ghkcu",
  ahk100: "ahkcu",
  nad100: "nad",
  nad1000: "nad",
  tesa5: "tesamorelin",
  survo10: "survodutide",
  cere60: "cerebrolysin",
  mt5: "melanotan2",
  selank10: "selank",
  hcg2000: "hcg",
  aod2: "aod9604",
  bac3: "bacwater",
};

export const researchProfiles = Object.values(profiles);

export function getResearchProfile(productId: string) {
  const key = productProfileMap[productId];
  return key ? profiles[key] : undefined;
}

export function getResearchProfileByKey(key: string) {
  return profiles[key];
}
