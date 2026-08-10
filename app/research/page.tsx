import Link from "next/link";
import { researchProfiles } from "@/lib/research";

export const metadata = {
  title: "Research Library",
  description: "Compound-level research context and selected peer-reviewed literature references for the Syntra Labs catalogue.",
};

const tierOrder = [
  "Clinical literature",
  "Early clinical literature",
  "Preclinical literature",
  "Mechanistic literature",
  "Laboratory accessory",
];

export default function ResearchPage() {
  const sorted = [...researchProfiles].sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier));

  return (
    <div className="research-library-page">
      <section className="research-library-hero">
        <div>
          <span className="kicker">SYNTRA RESEARCH LIBRARY</span>
          <h1>Evidence context.<br /><em>Without overclaiming.</em></h1>
          <p>
            A scientific orientation layer for the catalogue: mechanism summaries, evidence-stage labels and selected peer-reviewed references.
            No dosing instructions, therapeutic promises or substitution for primary literature.
          </p>
        </div>
        <aside className="research-method-card">
          <span>HOW TO READ THIS LIBRARY</span>
          <div><b>Clinical</b><p>Human clinical literature exists for the compound.</p></div>
          <div><b>Early clinical</b><p>Human evidence exists but is limited in scale or maturity.</p></div>
          <div><b>Preclinical</b><p>Evidence is predominantly cell, ex-vivo or animal research.</p></div>
          <div><b>Mechanistic</b><p>Biological pathway knowledge is established, but the catalogue format should not be conflated with a clinical intervention.</p></div>
        </aside>
      </section>

      <section className="research-library-grid">
        {sorted.map((profile) => (
          <article className="research-library-card" id={profile.key} key={profile.key}>
            <div className="research-library-card-head">
              <span>{profile.tier}</span>
              <small>{profile.researchClass}</small>
            </div>
            <h2>{profile.title}</h2>
            <p className="research-library-mechanism">{profile.mechanism}</p>
            <div className="research-library-focus">
              {profile.focus.map((item) => <span key={item}>{item}</span>)}
            </div>
            <p>{profile.evidenceSummary}</p>

            {!!profile.references.length && (
              <div className="research-library-refs">
                {profile.references.map((reference) => (
                  <a
                    key={reference.pmid}
                    href={`https://pubmed.ncbi.nlm.nih.gov/${reference.pmid}/`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>PMID {reference.pmid}</span>
                    <b>{reference.label}</b>
                    <small>{reference.journal} · {reference.year}</small>
                    <i>↗</i>
                  </a>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>

      <section className="research-library-footer-note">
        <div>
          <span className="kicker">IMPORTANT CONTEXT</span>
          <h2>Research literature and catalogue quality are separate questions.</h2>
          <p>
            A published paper about a compound cannot validate a supplier&apos;s vial. Identity, purity, sterility, concentration and suitability require their own validated analytical and quality systems.
          </p>
        </div>
        <Link href="/standards" className="button-secondary">Catalogue standards</Link>
      </section>
    </div>
  );
}
