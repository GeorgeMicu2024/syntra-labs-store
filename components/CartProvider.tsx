'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/products';
type Item = { product: Product; quantity: number };
type Ctx = { items: Item[]; count: number; total: number; add: (p: Product)=>void; remove:(id:string)=>void; setQty:(id:string,q:number)=>void; clear:()=>void };
const CartContext=createContext<Ctx|null>(null);
export function CartProvider({children}:{children:React.ReactNode}){
 const [items,setItems]=useState<Item[]>([]);
 useEffect(()=>{try{const v=localStorage.getItem('syntra-cart');if(v)setItems(JSON.parse(v));}catch{}},[]);
 useEffect(()=>{localStorage.setItem('syntra-cart',JSON.stringify(items));},[items]);
 const value=useMemo(()=>({items,count:items.reduce((a,i)=>a+i.quantity,0),total:items.reduce((a,i)=>a+i.product.price*i.quantity,0),
 add:(p:Product)=>setItems(s=>{const x=s.find(i=>i.product.id===p.id);return x?s.map(i=>i.product.id===p.id?{...i,quantity:i.quantity+1}:i):[...s,{product:p,quantity:1}]}),
 remove:(id:string)=>setItems(s=>s.filter(i=>i.product.id!==id)),setQty:(id:string,q:number)=>setItems(s=>q<1?s.filter(i=>i.product.id!==id):s.map(i=>i.product.id===id?{...i,quantity:q}:i)),clear:()=>setItems([])}),[items]);
 return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
export const useCart=()=>{const c=useContext(CartContext);if(!c)throw new Error('CartProvider missing');return c};
