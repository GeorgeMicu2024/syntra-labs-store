const AUTUMN_START = Date.UTC(2026, 10, 9);
const AUTUMN_END = Date.UTC(2026, 11, 1);

/** A visual-only seasonal edition. Existing catalogue prices remain unchanged. */
export function isAutumnCampaignActive(now = new Date()): boolean {
  return (
    process.env.AUTUMN_CAMPAIGN_ENABLED !== "false" &&
    now.getTime() >= AUTUMN_START &&
    now.getTime() < AUTUMN_END
  );
}
