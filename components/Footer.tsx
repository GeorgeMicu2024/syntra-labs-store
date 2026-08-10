import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-topline">
        <div className="brand footer-brand"><span className="brandmark">SL</span><span className="brand-text">SYNTRA<small>LABS</small></span></div>
        <p>Research catalogue · Evidence-oriented compound notes · United Kingdom</p>
      </div>

      <div className="footer-grid">
        <div className="footer-intro">
          <h3>Scientific context. Clear commerce.</h3>
          <p>
            Catalogue materials are presented for laboratory research use only and are not intended for human or veterinary use.
            Published literature references describe compounds or biological pathways and do not validate catalogue-item identity, purity or suitability.
          </p>
        </div>
        <div><h3>Navigate</h3><Link href="/">Home</Link><Link href="/shop">Catalogue</Link><Link href="/offers">Current offers</Link><Link href="/research">Research library</Link><Link href="/standards">Standards</Link></div>
        <div><h3>Company</h3><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/shipping">Shipping</Link><Link href="/faq">FAQ</Link></div>
        <div><h3>Support</h3><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a><a href="tel:+447490544199">+44 7490 544199</a><p>Monday–Friday<br />09:00–17:00 UK</p></div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Syntra Labs</span>
        <div><Link href="/policies/privacy">Privacy</Link><Link href="/policies/terms">Terms</Link><Link href="/policies/refund">Refunds</Link></div>
      </div>
    </footer>
  );
}
