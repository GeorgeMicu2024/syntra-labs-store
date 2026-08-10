export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <section className="content-page policy">
      <span className="kicker">LEGAL · CUSTOMER DATA</span>
      <h1>Privacy policy</h1>
      <p>This site template describes the customer-platform data flows implemented in Syntra Labs V9. It should be reviewed against your actual business processes and by an appropriately qualified UK privacy professional before production launch.</p>
      <h2>Account information</h2>
      <p>Registered accounts may store email address, name, phone number, marketing preference and authentication records. Password handling is provided through Supabase Auth; the storefront does not store plaintext customer passwords.</p>
      <h2>Saved addresses</h2>
      <p>Signed-in customers may save UK delivery addresses to their account. Database row-level access controls are configured so authenticated customers can access their own saved address records.</p>
      <h2>Orders and payments</h2>
      <p>Order history may include order reference, amounts, member-pricing status, dispatch status and customer identifier. Payment collection is handled by Stripe Checkout. The storefront does not store full payment-card details.</p>
      <h2>Email communications</h2>
      <p>Transactional order emails may be delivered through Resend. Optional catalogue or stock updates should only be sent where the customer has made the appropriate marketing choice.</p>
      <h2>Contact</h2>
      <p>Privacy questions should be sent to support@syntralabs.co.uk.</p>
    </section>
  );
}
