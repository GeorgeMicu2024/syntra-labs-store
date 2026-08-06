export type Product = {
  id: string; slug: string; name: string; code: string; strength: string;
  category: 'Metabolic' | 'Peptide' | 'Cellular' | 'Hormone' | 'Lab Supplies';
  price: number; stock: number; featured?: boolean; image: string; short: string; description: string;
};

export const products: Product[] = [
  ['tr5','tirzepatide-mounjaro-5mg','Tirzepatide (Mounjaro)','TR5','5 mg','Metabolic',49,17,true,'Dual-pathway research material in a clearly labelled 5 mg vial.'],
  ['tr10','tirzepatide-mounjaro-10mg','Tirzepatide (Mounjaro)','TR10','10 mg','Metabolic',79,21,true,'Dual-pathway research material in a clearly labelled 10 mg vial.'],
  ['rt5','retatrutide-reta-5mg','Retatrutide (RETA)','RETA5','5 mg','Metabolic',55,14,false,'Triple-receptor research compound supplied in a 5 mg single-vial format.'],
  ['rt30','retatrutide-reta-30mg','Retatrutide (RETA)','RETA30','30 mg','Metabolic',155,18,true,'Triple-receptor research compound supplied in a premium 30 mg vial.'],
  ['rt20','retatrutide-reta-20mg','Retatrutide (RETA)','RETA20','20 mg','Metabolic',125,22,true,'Triple-receptor research compound supplied in a 20 mg single-vial format.'],
  ['bpc10','bpc-157-10mg','BPC-157','BPC10','10 mg','Peptide',58,28,true,'Peptide research material supplied for controlled non-clinical laboratory analysis.'],
  ['bpc20','bpc-157-20mg','BPC-157','BPC20','20 mg','Peptide',85,18,false,'Higher-capacity BPC-157 research material in a clearly coded 20 mg vial.'],
  ['ghk100','ghk-cu-100mg','GHK-Cu','GHK100','100 mg','Peptide',55,24,true,'Copper peptide research material supplied in a 100 mg laboratory vial.'],
  ['ghk1000','ghk-cu-1000mg','GHK-Cu','GHK1000','1000 mg','Peptide',180,7,false,'High-capacity copper peptide research material in a 1000 mg format.'],
  ['ahk100','ahk-cu-100mg','AHK-Cu','AHK100','100 mg','Peptide',55,13,false,'Laboratory peptide material with secure and clearly coded presentation.'],
  ['nad100','nad-plus-100mg','NAD+','NAD100','100 mg','Cellular',43,31,true,'Cellular research material supplied in a protected 100 mg vial.'],
  ['nad1000','nad-plus-1000mg','NAD+','NAD1000','1000 mg','Cellular',145,8,false,'High-capacity NAD+ research material supplied in a 1000 mg vial.'],
  ['tesa5','tesamorelin-5mg','Tesamorelin','TESA5','5 mg','Hormone',79,12,false,'Hormone-pathway research compound in a compact 5 mg laboratory format.'],
  ['survo10','survodutide-10mg','Survodutide','SURVO10','10 mg','Metabolic',95,8,false,'Dual-action research peptide supplied for controlled laboratory investigation.'],
  ['cere60','cerebrolysin-60mg','Cerebrolysin','CERE60','60 mg','Cellular',72,10,false,'Peptide-complex research material with clear 60 mg product coding.'],
  ['mt5','melanotan-ii-mt2-5mg','Melanotan II (MT-2)','MT2-5','5 mg','Peptide',45,18,false,'Synthetic peptide research compound presented in a protected 5 mg vial.'],
  ['selank10','selank-sk10-10mg','Selank (SK10)','SK10','10 mg','Peptide',58,12,false,'Synthetic peptide research material supplied in a 10 mg vial.'],
  ['hcg2000','hcg-g2k-2000iu','HCG (G2K)','G2K','2000 IU','Hormone',65,10,false,'Hormone research material supplied in a clearly labelled 2000 IU format.'],
  ['aod2','aod9604-2ad-2mg','AOD9604 (2AD)','2AD','2 mg','Peptide',49,15,false,'Peptide-fragment research material supplied in a compact 2 mg vial.'],
  ['bac3','bac-water-3ml','BAC Water','BAC3','3 ml','Lab Supplies',12,45,false,'Bacteriostatic water supplied as a 3 ml laboratory preparation material.']
].map(([id,slug,name,code,strength,category,price,stock,featured,short]) => ({
  id: String(id), slug: String(slug), name: String(name), code: String(code), strength: String(strength),
  category: category as Product['category'], price: Number(price), stock: Number(stock), featured: Boolean(featured),
  image: `/products/${id}.png`, short: String(short),
  description: `${short} This catalogue item is presented for laboratory research use only and is not intended for human or veterinary use.`
}));

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
