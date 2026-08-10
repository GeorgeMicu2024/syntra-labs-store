"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import { getBrowserSupabase } from "@/lib/supabase/client";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  read_at: string | null;
  created_at: string;
};

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const root = useRef<HTMLDivElement>(null);

  async function load() {
    const supabase = getBrowserSupabase();
    if (!supabase || !user) return setItems([]);
    const { data } = await supabase
      .from("notifications")
      .select("id,type,title,body,href,read_at,created_at")
      .order("created_at", { ascending: false })
      .limit(6);
    setItems((data as Notification[] | null) || []);
  }

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    void load();
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    const channel = supabase
      .channel(`syntra-notifications-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => void load())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    function outside(event: MouseEvent) {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  if (!user) return null;
  const unread = items.filter((item) => !item.read_at).length;

  async function markAllRead() {
    const supabase = getBrowserSupabase();
    if (!supabase || !user || unread === 0) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
    setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })));
  }

  return (
    <div className="v10-notification-root" ref={root}>
      <button type="button" className={`v10-notification-button ${open ? "active" : ""}`} aria-label="Notifications" onClick={() => setOpen((value) => !value)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>
        {unread > 0 && <span>{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <section className="v10-notification-popover">
          <div className="v10-popover-head"><div><small>ACCOUNT ACTIVITY</small><strong>Notifications</strong></div>{unread > 0 && <button type="button" onClick={() => void markAllRead()}>Mark all read</button>}</div>
          <div className="v10-notification-list">
            {items.length === 0 && <div className="v10-empty-mini">No notifications yet.</div>}
            {items.map((item) => {
              const content = <><i className={item.read_at ? "" : "unread"} /><div><strong>{item.title}</strong><p>{item.body}</p><small>{new Date(item.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</small></div></>;
              return item.href ? <Link key={item.id} href={item.href} className="v10-notification-item" onClick={() => setOpen(false)}>{content}</Link> : <div key={item.id} className="v10-notification-item">{content}</div>;
            })}
          </div>
          <Link href="/account?tab=notifications" className="v10-popover-foot" onClick={() => setOpen(false)}>Open notification centre <span>→</span></Link>
        </section>
      )}
    </div>
  );
}
