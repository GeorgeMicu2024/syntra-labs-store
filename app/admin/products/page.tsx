import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifyAdminToken } from "@/lib/auth";
import { getProducts } from "@/lib/supabase-rest";
import AdminProductTable from "@/components/AdminProductTable";
import AdminNav from "@/components/AdminNav";
export const dynamic = "force-dynamic";
export default async function ProductsAdmin() {
  const store = await cookies();
  if (!verifyAdminToken(store.get(COOKIE_NAME)?.value)) redirect("/admin/login");
  const products = await getProducts();
  return <main className="admin-page v10-admin-page"><p className="eyebrow">CATALOGUE ADMINISTRATION</p><h1>Products, stock & offers</h1><p className="lead">Changes are stored in Supabase. Stock returns and qualifying price drops automatically check saved-product alert subscriptions.</p><AdminNav /><AdminProductTable initialProducts={products}/></main>;
}
