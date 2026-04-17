/** Strip whitespace and optional data:application/pdf;base64, prefix. */
export function normalizePdfBase64Input(input: string): string {
  let s = input.trim().replace(/\s+/g, "");
  const dataPdf = /^data:application\/pdf[^,]*;base64,/i;
  if (dataPdf.test(s)) return s.replace(dataPdf, "");
  const idx = s.indexOf("base64,");
  if (s.startsWith("data:") && idx !== -1) return s.slice(idx + 7);
  return s;
}
