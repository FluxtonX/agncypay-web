import { redirect } from "next/navigation";

export default async function GuestCheckoutPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;

  redirect(`/request/${invoiceId}?mode=guest`);
}
