import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AddButton from "./AddButton";
import ProductDossier from "@/components/ProductDossier";
import ProductVisitTracker from "@/components/ProductVisitTracker";
import RelatedProducts from "@/components/RelatedProducts";
import RecentlyViewed from "@/components/RecentlyViewed";
import MobileProductBar from "@/components/MobileProductBar";
import WishlistButton from "@/components/WishlistButton";
import { getProducts } from "@/lib/supabase-rest";
import { displayProductName } from "@/lib/display";
import { getResearchProfile } from "@/lib/research";
import { getAvailabilityMessage, getCommerceHighlights, getSavings, getStockLabel, getStockState, hasDiscount } from "@/lib/commerce";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((item) => item.slug === slug);
  if (!product) return { title: "Catalogue item" };
  const name = displayProductName(product.name);
  return {
    title: `${name} ${product.strength}`,
    description: `${name} ${product.strength} · ${product.category} research catalogue material. Laboratory research use only.`,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${name} ${product.strength} | Syntra Labs`,
      description: `${product.category} research catalogue material · ${product.strength}.`,
      images: [{ url: product.image, alt: `${name} ${product.strength}` }],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();

  const name = displayProductName(product.name);
  const research = getResearchProfile(product.id);
  const savings = getSavings(product);
  const stockState = getStockState(product.stock);
  const highlights = getCommerceHighlights(product);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${name} ${product.strength}`,
    sku: `SL-${product.code}`,
    category: product.category,
    image: [product.image],
    description: product.short,
    offers: {
      "@type": "Offer",
      priceCurrency: "GBP",
      price: product.price.toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `/product/${product.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <ProductVisitTracker productId={product.id} />

      <section className="product-detail-shell v6-product-detail v7-product-detail v8-product-detail">
        <div className="product-detail-visual v6-detail-visual v7-detail-visual v8-detail-visual">
          <div className="product-detail-badges"><span>{product.category.toUpperCase()}</span><span>SL-{product.code}</span></div>
          {hasDiscount(product) && savings && <div className="v6-detail-offer-badge"><small>CURRENT OFFER</small><strong>{savings.percent}% OFF</strong></div>}
          <Image src={product.image} alt={`${name} ${product.strength}`} width={900} height={900} priority />
          <div className="product-detail-glow" />
          <div className="v7-detail-visual-caption"><span>CATALOGUE IMAGE</span><small>Research-use presentation</small></div>
        </div>

        <div className="product-detail-info v7-detail-info v8-detail-info">
          <div className="v7-detail-breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/shop">Catalogue</Link><span>/</span><b>{product.code}</b></div>
          <span className="kicker">{product.category} · {product.code}</span>
          <h1>{name}</h1>
          <div className="product-detail-strength">{product.strength}</div>
          <p className="product-detail-lead">{research?.researchClass || product.short}. Presented as a catalogue material for controlled laboratory research workflows.</p>

          <div className="v6-detail-highlights">{highlights.map((item, index) => <span key={item}><i>0{index + 1}</i>{item}</span>)}</div>

          <div className="product-detail-commerce v6-detail-commerce v7-detail-commerce">
            <div className="v6-detail-price"><small>{hasDiscount(product) ? "CURRENT OFFER" : "CATALOGUE PRICE"}</small><div><strong>£{product.price.toFixed(2)}</strong>{hasDiscount(product) && product.compareAtPrice && <del>£{product.compareAtPrice.toFixed(2)}</del>}</div>{savings && <span>Save £{savings.amount.toFixed(2)} · {savings.percent}%</span>}</div>
            <div className={`v6-detail-stock ${stockState}`}><b><i />{getStockLabel(product.stock)}</b><small>{getAvailabilityMessage(product.stock)}</small></div>
          </div>

          <div className="v10-detail-actions"><AddButton product={product} /><WishlistButton product={product} /></div>

          <div className="product-trust-inline v7-trust-inline"><span>Server-verified price</span><span>Secure Stripe checkout</span><span>Live catalogue stock</span><span>UK support</span></div>
          <div className="v7-detail-research-summary"><small>EVIDENCE ORIENTATION</small><b>{research?.tier || "Catalogue reference"}</b><p>{research?.context || "Laboratory catalogue information only."}</p></div>
        </div>
      </section>

      <ProductDossier product={product} research={research} />
      <RelatedProducts products={products} current={product} />
      <RecentlyViewed products={products} excludeId={product.id} compact />
      <MobileProductBar product={product} />
    </>
  );
}
