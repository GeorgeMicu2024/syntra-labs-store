import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AddButton from "./AddButton";
import { getProducts } from "@/lib/supabase-rest";
import { displayProductName } from "@/lib/display";
import { getResearchProfile } from "@/lib/research";
import {
  getAvailabilityMessage,
  getCommerceHighlights,
  getSavings,
  getStockLabel,
  getStockState,
  hasDiscount,
} from "@/lib/commerce";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();

  const name = displayProductName(product.name);
  const research = getResearchProfile(product.id);
  const savings = getSavings(product);
  const stockState = getStockState(product.stock);
  const highlights = getCommerceHighlights(product);

  return (
    <>
      <section className="product-detail-shell v6-product-detail">
        <div className="product-detail-visual v6-detail-visual">
          <div className="product-detail-badges">
            <span>{product.category.toUpperCase()}</span>
            <span>SL-{product.code}</span>
          </div>

          {hasDiscount(product) && savings && (
            <div className="v6-detail-offer-badge">
              <small>CURRENT OFFER</small>
              <strong>{savings.percent}% OFF</strong>
            </div>
          )}

          <Image src={product.image} alt={`${name} ${product.strength}`} width={900} height={900} priority />
          <div className="product-detail-glow" />
        </div>

        <div className="product-detail-info">
          <Link href="/shop" className="back-link">← Back to catalogue</Link>
          <span className="kicker">{product.category} · {product.code}</span>
          <h1>{name}</h1>
          <div className="product-detail-strength">{product.strength}</div>

          <p className="product-detail-lead">
            {research?.researchClass || product.short}. Presented as a catalogue material for controlled laboratory research workflows.
          </p>

          <div className="v6-detail-highlights">
            {highlights.map((item, index) => (
              <span key={item}><i>0{index + 1}</i>{item}</span>
            ))}
          </div>

          <div className="product-detail-commerce v6-detail-commerce">
            <div className="v6-detail-price">
              <small>{hasDiscount(product) ? "CURRENT OFFER" : "CATALOGUE PRICE"}</small>
              <div>
                <strong>£{product.price.toFixed(2)}</strong>
                {hasDiscount(product) && product.compareAtPrice && <del>£{product.compareAtPrice.toFixed(2)}</del>}
              </div>
              {savings && <span>Save £{savings.amount.toFixed(2)} · {savings.percent}%</span>}
            </div>

            <div className={`v6-detail-stock ${stockState}`}>
              <b><i />{getStockLabel(product.stock)}</b>
              <small>{getAvailabilityMessage(product.stock)}</small>
            </div>
          </div>

          <AddButton product={product} />

          <div className="product-trust-inline">
            <span>Server-verified price</span>
            <span>Secure Stripe checkout</span>
            <span>Live catalogue stock</span>
            <span>UK support</span>
          </div>

          <div className="product-spec-grid">
            <div><span>Reference</span><b>SL-{product.code}</b></div>
            <div><span>Format</span><b>{product.strength} research vial</b></div>
            <div><span>Classification</span><b>{research?.researchClass || product.category}</b></div>
            <div><span>Intended use</span><b>Laboratory research only</b></div>
          </div>
        </div>
      </section>

      {research && (
        <section className="product-research-section">
          <div className="product-research-heading">
            <div>
              <span className="kicker">COMPOUND RESEARCH CONTEXT</span>
              <h2>What the published literature studies.</h2>
            </div>
            <span className="evidence-tier-badge">{research.tier}</span>
          </div>

          <div className="product-research-grid">
            <article className="research-mechanism-card">
              <small>MECHANISM ORIENTATION</small>
              <h3>{research.title}</h3>
              <p>{research.mechanism}</p>
              <div className="research-focus-list">
                {research.focus.map((item) => <span key={item}>{item}</span>)}
              </div>
            </article>

            <article className="research-evidence-card">
              <small>EVIDENCE SNAPSHOT</small>
              <h3>Research interpretation</h3>
              <p>{research.evidenceSummary}</p>
              <p className="research-context-note">{research.context}</p>
            </article>
          </div>

          {!!research.references.length && (
            <div className="reference-panel">
              <div className="reference-panel-title">
                <span>SELECTED REFERENCES</span>
                <small>External PubMed records</small>
              </div>
              <div className="reference-list">
                {research.references.map((reference) => (
                  <a
                    key={reference.pmid}
                    href={`https://pubmed.ncbi.nlm.nih.gov/${reference.pmid}/`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>PMID {reference.pmid}</span>
                    <h4>{reference.label}</h4>
                    <p>{reference.journal} · {reference.year}</p>
                    <small>{reference.note}</small>
                    <b>↗</b>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="research-disclaimer">
            <b>Scientific context, not a product efficacy claim.</b>
            <p>
              Literature references describe research on the named compound or biological pathway. They do not verify the identity,
              purity, safety, quality or suitability of any catalogue item and do not provide medical, dosing or veterinary guidance.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
