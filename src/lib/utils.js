export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
export function formatCurrency(amount, compact = false) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: compact ? "compact" : "standard",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
export function formatNumber(num) {
  return new Intl.NumberFormat("en-US").format(num);
}
export function getInitials(name) {
  if (!name) return "UI";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
export function formatDate(dateString) {
  if (!dateString) return "\u2014";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });
  } catch {
    return dateString;
  }
}
export function getDaysLeft(expiryDateStr) {
  try {
    const expiry = new Date(expiryDateStr);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return null;
  }
}
