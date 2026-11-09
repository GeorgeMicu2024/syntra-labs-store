/**
 * Stripe requires Syntra checkout to be restricted to verified institutional
 * email addresses. These public suffixes cover academic/government institutions
 * (including UK institutions); other laboratory domains require explicit
 * manual approval before they are added to the allowlist.
 *
 * Domain eligibility is only one check: the checkout API separately requires
 * an email-confirmed Supabase Auth user retrieved using their access token.
 */
const INSTITUTIONAL_SUFFIXES = [
  "edu",
  "gov",
  "ac.uk",
  "gov.uk",
  "edu.au",
  "gov.au",
  "ac.nz",
  "govt.nz",
  "edu.sg",
  "gov.sg",
  "ac.in",
  "gov.in",
  "ac.za",
  "gov.za",
  "ac.jp",
  "go.jp",
  "nhs.uk",
  "nhs.net",
];

const PUBLIC_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk",
  "outlook.com", "hotmail.com", "hotmail.co.uk", "live.com",
  "icloud.com", "me.com", "aol.com", "proton.me",
  "protonmail.com", "mail.com", "gmx.com", "gmx.co.uk",
  "msn.com", "yandex.com", "qq.com", "163.com",
]);

function matchesDomain(domain: string, allowed: string) {
  return domain === allowed || domain.endsWith(`.${allowed}`);
}

export function isInstitutionalEmail(
  email: string | null | undefined,
  additionalApprovedDomains =
    process.env.NEXT_PUBLIC_APPROVED_INSTITUTION_DOMAINS || ""
): boolean {
  const value = (email || "").trim().toLowerCase();
  if (value.length > 254 || !/^[^\s@]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(value)) {
    return false;
  }

  const domain = value.slice(value.lastIndexOf("@") + 1);
  if (
    domain.includes("..") ||
    domain.split(".").some((part) => !part || part.startsWith("-") || part.endsWith("-"))
  ) {
    return false;
  }

  // Public providers cannot be enabled even by a broad allowlist entry.
  if (PUBLIC_EMAIL_DOMAINS.has(domain)) return false;

  if (INSTITUTIONAL_SUFFIXES.some((suffix) =>
    (suffix === "nhs.net" && domain === suffix) || domain.endsWith(`.${suffix}`)
  )) {
    return true;
  }

  return additionalApprovedDomains
    .split(",")
    .map((entry) => entry.trim().toLowerCase().replace(/^@/, ""))
    .filter((entry) => entry.includes(".") && !entry.includes("@"))
    .some((allowed) => matchesDomain(domain, allowed));
}
