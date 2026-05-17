export function formatCardNumberInput(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

export function formatCardExpiryInput(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function maskCardNumber(value) {
  const digits = value.replace(/\D/g, "");
  const suffix = digits.slice(-4) || "0000";
  return `•••• ${suffix}`;
}
