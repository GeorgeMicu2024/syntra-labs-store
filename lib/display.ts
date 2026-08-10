export function displayProductName(name: string) {
  return name.replace(/\s*\(Mounjaro\)\s*/gi, "").trim();
}
