import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { COOKIE_NAME, verifyAdminToken } from "@/lib/auth";
import { getProducts } from "@/lib/supabase-rest";
import AdminNav from "@/components/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminOffersPage() {
  const store = await cookies();
  if (!verifyAdminToken(store.get(COOKIE_NAME)?.value)) redirect("/admin/login");
  const products = await getProducts();
  const offers = products.filter((product) => product.compareAtPrice && product.compareAtPrice > product.price).sort((a, b) => ((b.compareAtPrice || b.price) - b.price) - ((a.compareAtPrice || a.price) - a.price));
  return <main className="admin-page v10-admin-page"><p className="eyebrow">MERCHANDISING</p><h1>Current catalogue offers</h1><p className="lead">Offers shown here are derived from the live product price and compare-at price. This keeps storefront discount messaging tied to real catalogue data.</p><AdminNav /><section className="v10-admin-offers">{offers.map((product) => { const save = (product.compareAtPrice || product.price) - product.price; const pct = Math.round(save / (product.compareAtPrice || product.price) * 100); return <article key={product.id}><span><small>{product.code} · {product.strength}</small><strong>{product.name}</strong><p>{product.badge || "Catalogue offer"}</p></span><span><del>£{product.compareAtPrice?.toFixed(2)}</del><strong>£{product.price.toFixed(2)}</strong><b>{pct}% OFF</b></span></article>; })}{offers.length === 0 && <p className="v10-admin-empty">No compare-at offers are currently active.</p>}</section><div className="v10-admin-offer-foot"><Link className="button primary" href="/admin/products">Edit prices & offers</Link></div></main>;
}
