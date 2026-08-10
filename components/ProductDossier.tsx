"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/products";
import type { EvidenceTier, ResearchProfile } from "@/lib/research";
import { displayProductName } from "@/lib/display";

const tabs = ["Executive summary", "Mechanism & focus", "Specifications", "Literature"] as const;
type Tab = (typeof tabs)[number];

const tierScore: Record<EvidenceTier, number> = {
  "Clinical literature": 4,
  "Early clinical literature": 3,
  "Preclinical literature": 2,
  "Mechanistic literature": 1,
  "Laboratory accessory": 0,
};

const tierLabels = ["Mechanistic", "Preclinical", "Early clinical", "Clinical"];

export default function ProductDossier({ product, research }: { product: Product; research?: ResearchProfile }) {
  const [tab, setTab] = useState<Tab>("Executive summary");
  const [copied, setCopied] = useState(false);
  const name = displayProductName(product.name);
  const references = useMemo(() => research?.references || [], [research]);
  const score = research ? tierScore[research.tier] : 0;
  const years = references.map((reference) => reference.year).sort((a, b) => a - b);

  async function copyReference() {
    const text = `Syntra Labs catalogue reference SL-${product.code} · ${name} · ${product.strength}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function printDossier() {
    window.print();
  }

  return (
    <section className="v8-dossier" id="research-dossier">
      <div className="v8-dossier-head">
        <div>
          <span className="kicker">RESEARCH DOSSIER · SL-{product.code}</span>
          <h2>{name}: compound context & catalogue record.</h2>
          <p>Compound-level literature, catalogue specifications and availability are deliberately separated so scientific context is not confused with product validation.</p>
        </div>

        <div className="v8-dossier-actions">
          <span className="v8-evidence-chip">{research?.tier || "Catalogue reference"}</span>
          <button type="button" onClick={copyReference}>{copied ? "Copied ✓" : "Copy reference"}</button>
          <button type="button" onClick={printDossier}>Print dossier</button>
        </div>
      </div>

      <div className="v8-dossier-snapshot">
        <article><small>CATALOGUE ID</small><strong>SL-{product.code}</strong><span>{product.category}</span></article>
        <article><small>PRESENTATION</small><strong>{product.strength}</strong><span>Research vial</span></article>
        <article><small>FOCUS AREAS</small><strong>{research?.focus.length || 0}</strong><span>Mapped themes</span></article>
        <article><small>REFERENCES</small><strong>{references.length}</strong><span>Selected literature</span></article>
      </div>

      <div className="v8-dossier-layout">
        <aside className="v8-evidence-ladder" aria-label="Evidence orientation">
          <span className="kicker">EVIDENCE ORIENTATION</span>
          <h3>{research?.tier || "Catalogue reference"}</h3>
          <p>This scale describes the attached compound literature only. It is not a quality, purity, safety or product-validation score.</p>

          <div className="v8-evidence-scale">
            {tierLabels.map((label, index) => {
              const level = index + 1;
              return (
                <div key={label} className={score >= level ? "active" : ""}>
                  <i />
                  <span>{label}</span>
                </div>
              );
            })}
          </div>

          <div className="v8-dossier-boundary">
            <small>SCIENTIFIC BOUNDARY</small>
            <b>Compound evidence ≠ catalogue-item validation</b>
          </div>
        </aside>

        <div className="v8-dossier-main">
          <div className="v8-dossier-tabs" role="tablist" aria-label="Product dossier sections">
            {tabs.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={tab === item}
                className={tab === item ? "active" : ""}
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="v8-dossier-panel">
            {tab === "Executive summary" && (
              <div className="v8-executive-grid">
                <article>
                  <small>COMPOUND CLASS</small>
                  <h3>{research?.researchClass || product.category}</h3>
                  <p>{research?.mechanism || product.description}</p>
                </article>

                <article>
                  <small>EVIDENCE SUMMARY</small>
                  <h3>{research?.tier || "Catalogue reference"}</h3>
                  <p>{research?.evidenceSummary || "No compound-specific research summary is attached to this catalogue item."}</p>
                </article>

                <article className="wide">
                  <small>INTERPRETATION</small>
                  <p>{research?.context || "Catalogue content describes the named material for reference and laboratory research workflows only."}</p>
                </article>
              </div>
            )}

            {tab === "Mechanism & focus" && (
              <div className="v8-mechanism-grid">
                <article className="v8-mechanism-copy">
                  <small>MECHANISTIC ORIENTATION</small>
                  <h3>{research?.researchClass || product.category}</h3>
                  <p>{research?.mechanism || product.description}</p>
                  <div className="v8-mechanism-note">Literature context is descriptive and does not provide dosing, administration or treatment guidance.</div>
                </article>

                <article>
                  <small>RESEARCH THEMES</small>
                  <h3>Commonly examined areas</h3>
                  <div className="v8-focus-list">
                    {(research?.focus || [product.category, product.strength, product.code]).map((item, index) => (
                      <span key={item}><b>0{index + 1}</b><i />{item}</span>
                    ))}
                  </div>
                </article>
              </div>
            )}

            {tab === "Specifications" && (
              <div className="v8-spec-table">
                <div><span>Catalogue reference</span><b>SL-{product.code}</b></div>
                <div><span>Product name</span><b>{name}</b></div>
                <div><span>Presentation</span><b>{product.strength} research vial</b></div>
                <div><span>Category</span><b>{product.category}</b></div>
                <div><span>Catalogue status</span><b>{product.stock > 0 ? "Available" : "Unavailable"}</b></div>
                <div><span>Current stock</span><b>{Math.max(0, product.stock)} unit{product.stock === 1 ? "" : "s"}</b></div>
                <div><span>Intended use</span><b>Laboratory research only</b></div>
                <div><span>Human / veterinary use</span><b>Not intended</b></div>
              </div>
            )}

            {tab === "Literature" && (
              <div className="v8-literature-panel">
                {references.length > 0 && (
                  <div className="v8-literature-timeline">
                    <span>SELECTED LITERATURE WINDOW</span>
                    <div><b>{years[0]}</b><i /><b>{years[years.length - 1]}</b></div>
                  </div>
                )}

                <div className="v8-reference-list">
                  {references.length ? references.map((reference, index) => (
                    <a key={reference.pmid} href={`https://pubmed.ncbi.nlm.nih.gov/${reference.pmid}/`} target="_blank" rel="noreferrer">
                      <span className="v8-reference-index">0{index + 1}</span>
                      <div>
                        <small>PMID {reference.pmid} · {reference.journal} · {reference.year}</small>
                        <h3>{reference.label}</h3>
                        <p>{reference.note}</p>
                      </div>
                      <b>↗</b>
                    </a>
                  )) : (
                    <div className="v8-no-references">
                      <b>No external compound references attached</b>
                      <span>This catalogue entry is presented as a laboratory accessory / reference item.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="v8-dossier-disclaimer">
        <b>Research-use information only.</b>
        <span>No section of this dossier provides medical advice, dosing, administration instructions or veterinary guidance; selected references describe the named compound or pathway and do not independently validate this catalogue item.</span>
      </div>
    </section>
  );
}
