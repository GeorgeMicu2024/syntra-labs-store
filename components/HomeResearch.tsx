import Link from "next/link";
import { researchProfiles } from "@/lib/research";

const featuredKeys = ["retatrutide", "ghkcu", "nad"];

export default function HomeResearch() {
  const featured = featuredKeys
    .map((key) => researchProfiles.find((profile) => profile.key === key))
    .filter((profile): profile is NonNullable<typeof profile> => Boolean(profile));

  return (
    <section className="home-section research-home-section">
      <div className="research-home-intro">
        <span className="kicker">RESEARCH INTELLIGENCE</span>
        <h2>Compound context without the hype.</h2>
        <p>
          Product pages include concise mechanism notes, evidence-stage labels and PubMed references.
          Scientific literature is presented as compound-level context — never as dosing guidance or a claim about catalogue-item efficacy.
        </p>
        <Link href="/research" className="button-secondary">Open research library</Link>
      </div>

      <div className="research-home-grid">
        {featured.map((profile, index) => (
          <article className="research-feature-card" key={profile.key}>
            <div className="research-card-head"><span>0{index + 1}</span><b>{profile.tier}</b></div>
            <small>{profile.researchClass}</small>
            <h3>{profile.title}</h3>
            <p>{profile.mechanism}</p>
            <div className="research-keywords">
              {profile.focus.slice(0, 2).map((item) => <span key={item}>{item}</span>)}
            </div>
            <Link href={`/research#${profile.key}`}>View evidence notes <span>→</span></Link>
          </article>
        ))}
      </div>
    </section>
  );
}
