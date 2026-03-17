export function getDateParams() {
  const now = new Date();
  const yyyymm =
    now.getFullYear() + String(now.getMonth() + 1).padStart(2, "0");
  const today =
    now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  return { yyyymm, today };
}
