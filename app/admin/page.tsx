import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { COOKIE_NAME, verifyAdminToken } from "@/lib/auth";
import { getProducts } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const store = await cookies();
  if (!verifyAdminToken(store.get(COOKIE_NAME)?.value)) redirect("/admin/login");
  const products = await getProducts();
  const value = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStock = products.filter(p => p.stock < 10).length;
  return <main className="admin-page"><div className="admin-heading"><div><p className="eyebrow">Operations centre</p><h1>Syntra dashboard</h1></div><form action="/api/admin/logout" method="post"><button className="mini-button">Log out</button></form></div><section className="metric-grid"><article><span>Products</span><strong>{products.length}</strong></article><article><span>Units in stock</span><strong>{products.reduce((s,p)=>s+p.stock,0)}</strong></article><article><span>Inventory value</span><strong>£{value.toLocaleString("en-GB",{maximumFractionDigits:0})}</strong></article><article><span>Low stock</span><strong>{lowStock}</strong></article></section><section className="admin-panel"><div><h2>Inventory management</h2><p>Edit prices, availability and featured products from one place.</p></div><Link className="button primary" href="/admin/products">Manage products</Link></section><section className="admin-panel"><div><h2>Production configuration</h2><p>Connect Supabase, Stripe and Resend using the included environment variables and setup guide.</p></div></section></main>;
}
