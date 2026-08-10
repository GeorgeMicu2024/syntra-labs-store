export const metadata = { title: "Shipping" };

export default function Shipping() {
  return (
    <div className="info-page">
      <section className="info-page-hero"><span className="kicker">FULFILMENT · UNITED KINGDOM</span><h1>Free UK shipping, with a clear dispatch cutoff.</h1><p>Signed-in and guest orders use the same UK shipping standard. Dispatch timing is based on the time the paid order is successfully completed and verified.</p></section>
      <section className="info-cards-grid">
        <article><span>01</span><h2>Free UK shipping</h2><p>Standard UK shipping is currently provided at £0 and is shown as Free UK shipping in Stripe Checkout.</p></article>
        <article><span>02</span><h2>Before 12:00</h2><p>Orders completed before 12:00 UK time, Monday–Friday, are scheduled for same-day dispatch, subject to successful payment and order verification.</p></article>
        <article><span>03</span><h2>After 12:00</h2><p>Orders completed after the 12:00 cutoff, or during weekends, are scheduled for next working-day dispatch.</p></article>
        <article><span>04</span><h2>Saved addresses</h2><p>Registered customers can save a default UK delivery address in My Account. When available, it is used to prefill the Stripe customer record before secure checkout.</p></article>
        <article><span>05</span><h2>Address verification</h2><p>Please confirm the address shown in Stripe Checkout before payment. Address corrections after dispatch may not be possible.</p></article>
        <article><span>06</span><h2>Order support</h2><p>Your confirmation email contains the Stripe order reference, member-pricing summary and dispatch status. Reply to that email if assistance is required.</p></article>
      </section>
    </div>
  );
}
