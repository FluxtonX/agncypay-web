/**
 * Builds links that other people open: pay links, reminders, receipts and invitations in emails,
 * and the "copy link" buttons.
 *
 * They must point at the public site even when an agency is working on localhost, so the base comes
 * from NEXT_PUBLIC_LINK_BASE_URL when it is set (e.g. https://agncypay-web.vercel.app). Without it,
 * the current site's own address is used, which is already right on a deployed site.
 *
 * Kept separate from NEXT_PUBLIC_APP_URL, which the QuickBooks/Xero sign-in routes use for their
 * OAuth redirects and must stay pointing at wherever the app is actually running.
 */
export function publicUrl(path = ""): string {
  const configured = (process.env.NEXT_PUBLIC_LINK_BASE_URL ?? "").trim().replace(/\/+$/, "");
  const base = configured || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${path}`;
}
