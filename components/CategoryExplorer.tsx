import Link from "next/link";

const categories = [
  { name: "Metabolic", note: "Multi-receptor and incretin pathway research", code: "MET" },
  { name: "Peptide", note: "Peptide signalling and cell-response models", code: "PEP" },
  { name: "Cellular", note: "Cellular metabolism and neurobiology research", code: "CEL" },
  { name: "Hormone", note: "Endocrine receptor and hormone-axis research", code: "HOR" },
  { name: "Lab Supplies", note: "Preparation and laboratory workflow materials", code: "LAB" },
];

export default function CategoryExplorer() {
  return (
    <section className="home-section category-section">
      <div className="section-heading-row compact">
        <div>
          <span className="kicker">EXPLORE BY FIELD</span>
          <h2>Navigate the catalogue by research class.</h2>
        </div>
      </div>
      <div className="category-grid">
        {categories.map((category, index) => (
          <Link href={`/shop?category=${encodeURIComponent(category.name)}`} className="category-card" key={category.name}>
            <span className="category-index">0{index + 1}</span>
            <div>
              <small>{category.code}</small>
              <h3>{category.name}</h3>
              <p>{category.note}</p>
            </div>
            <b>↗</b>
          </Link>
        ))}
      </div>
    </section>
  );
}
