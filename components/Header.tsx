"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartProvider";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const pathname = usePathname();
  const links = [["/shop","Shop"],["/standards","Standards"],["/about","About"],["/contact","Contact"]];
  return <>
    <div className="notice premium-notice"><span>🇬🇧 &nbsp; UK BASED &nbsp; • &nbsp; DISCREET SHIPPING &nbsp; • &nbsp; PREMIUM QUALITY</span><b>LABORATORY RESEARCH MATERIALS ONLY — NOT FOR HUMAN OR VETERINARY USE</b><span>2026 CATALOGUE &nbsp; ✉ CONTACT</span></div>
    <header className="site-header premium-header">
      <Link className="brand" href="/"><span className="brandmark">SL</span><span>SYNTRA<small>LABS</small></span></Link>
      <button className="menu" aria-label="Toggle menu" onClick={() => setOpen(!open)}>☰</button>
      <nav className={open ? "open" : ""}>
        {links.map(([href,label]) => <Link key={href} className={pathname===href?"active":""} href={href} onClick={()=>setOpen(false)}>{label}</Link>)}
        <span className="header-icon" aria-hidden="true">⌕</span><span className="header-icon" aria-hidden="true">♙</span>
        <Link className="cartlink" href="/shop#cart">🛒 &nbsp; Cart <b>{count}</b></Link>
      </nav>
    </header>
  </>;
}
