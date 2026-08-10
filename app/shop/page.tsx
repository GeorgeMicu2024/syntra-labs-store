import ShopClient from "@/components/ShopClient";
import { getProducts } from "@/lib/supabase-rest";

export const metadata = {
  title: "Shop",
};

export const dynamic = "force-dynamic";

export default async function Shop() {
  const products = await getProducts();

  return (
    <>
      <section className="page-hero">
        <span className="kicker">
          COMPLETE STOCK LIST
        </span>

        <h1>
          Shop all <em>products.</em>
        </h1>

        <p>
          One catalogue, one cart and one secure checkout.
          Prices shown per vial in GBP.
        </p>
      </section>

      <ShopClient products={products} />
    </>
  );
}