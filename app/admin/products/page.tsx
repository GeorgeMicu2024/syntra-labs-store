import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifyAdminToken } from "@/lib/auth";
import { getProducts } from "@/lib/supabase-rest";
import AdminProductTable from "@/components/AdminProductTable";
export const dynamic = "force-dynamic";
export default async function ProductsAdmin() { const store=await cookies(); if(!verifyAdminToken(store.get(COOKIE_NAME)?.value)) redirect("/admin/login"); const products=await getProducts(); return <main className="admin-page"><p className="eyebrow">Catalogue administration</p><h1>Products and stock</h1><p className="lead">Changes are stored in Supabase when the database environment variables are configured.</p><AdminProductTable initialProducts={products}/></main>; }
