const test = require("node:test");
const assert = require("node:assert/strict");
const { isInstitutionalEmail } = require("../lib/institutional-email.ts");

test("accepts official institutional email domains", () => {
  for (const email of [
    "researcher@uni.edu",
    "team@dept.university.edu",
    "scientist@agency.gov",
    "lecturer@leeds.ac.uk",
    "research@dept.uni.ac.uk",
    "researcher@agency.gov.uk",
    "lab@trust.nhs.uk",
    "doctor@nhs.net",
  ]) {
    assert.equal(isInstitutionalEmail(email, ""), true, email);
  }
});

test("rejects public addresses and lookalike domains", () => {
  for (const email of [
    "name@gmail.com",
    "name@yahoo.co.uk",
    "name@outlook.com",
    "name@proton.me",
    "name@mycompany.com",
    "name@university.edu.evil.com",
    "name@ac.uk.evil.net",
    "name@gov.uk.attacker.org",
    "name@college..edu",
    "name@-college.edu",
    "name@@college.edu",
    "no-email-at-all",
  ]) {
    assert.equal(isInstitutionalEmail(email, ""), false, email);
  }
});

test("uses manually reviewed exact domains and subdomains without widening access", () => {
  const allowlist = "approved-laboratory.org.uk,partner-research.com";
  assert.equal(isInstitutionalEmail("lab@approved-laboratory.org.uk", allowlist), true);
  assert.equal(isInstitutionalEmail("lab@unit.approved-laboratory.org.uk", allowlist), true);
  assert.equal(isInstitutionalEmail("lab@other-laboratory.org.uk", allowlist), false);
  assert.equal(isInstitutionalEmail("lab@approved-laboratory.org.uk.attacker.net", allowlist), false);
  assert.equal(isInstitutionalEmail("name@gmail.com", "gmail.com"), false);
});
