'use client';
import Image from 'next/image'; import Link from 'next/link'; import type { Product } from '@/lib/products'; import { useCart } from './CartProvider';
export default function ProductCard({product}:{product:Product}){const {add}=useCart();return <article className="product-card">
<Link href={`/product/${product.slug}`} className="product-image"><span>RESEARCH USE ONLY</span><Image src={product.image} alt={`${product.name} ${product.strength}`} width={900} height={900}/></Link>
<div className="product-body"><div className="eyebrow">{product.category}<em>{product.code}</em></div><Link href={`/product/${product.slug}`}><h3>{product.name}</h3></Link><p>{product.short}</p><div className="product-meta"><b>£{product.price.toFixed(2)}</b><span>{product.strength}</span></div><button onClick={()=>add(product)}>Add to cart</button></div></article>}
