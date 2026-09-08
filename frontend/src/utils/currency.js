/**
 * Product prices are stored in the database (`products.price`) as
 * approximate list prices with no currency field — there is no `price_inr`
 * column in the schema today. This is therefore a **display-only**
 * conversion using a fixed illustrative rate, clearly isolated to this one
 * function so it's the only place that decision is made.
 *
 * If the backend is ever extended with a real INR price (e.g. a
 * `price_inr` column), this function already prefers it over converting —
 * no caller needs to change.
 */
const USD_TO_INR_RATE = 83; // approximate — for display purposes only

/**
 * @param {{price?: number|string|null, price_inr?: number|string|null}} product
 * @returns {string|null} formatted INR string (e.g. "₹1,660"), or null if
 *   no usable price is available on the product at all.
 */
export function formatPriceINR(product) {
  if (!product) return null;

  const rawInr = product.price_inr;
  const rawUsd = product.price;

  let amount = null;
  if (rawInr != null && rawInr !== '') {
    amount = Number(rawInr);
  } else if (rawUsd != null && rawUsd !== '') {
    amount = Number(rawUsd) * USD_TO_INR_RATE;
  }

  if (amount == null || Number.isNaN(amount)) return null;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
