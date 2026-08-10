"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/admin", "Dashboard"],
  ["/admin/orders", "Orders"],
  ["/admin/products", "Products"],
  ["/admin/customers", "Customers"],
  ["/admin/offers", "Offers"],
] as const;

export default function AdminNav() {
  const pathname = usePathname();
  return <nav className="v10-admin-nav">{items.map(([href, label]) => <Link key={href} href={href} className={pathname === href ? "active" : ""}>{label}</Link>)}</nav>;
}
