"use client";

import { useState } from "react";
import { CreditCard, ExternalLink, RefreshCcw, ShoppingBag, Snowflake } from "lucide-react";
import { Button, Toggle, useAction, useToast } from "@/components/ui";
import { Confirm } from "@/components/Confirm";
import { Section, TxRow } from "@/components/talent";
import { useTalent } from "@/lib/talent";
import { activateCard, replaceCard, setCardFrozen, simulateCardPurchase } from "@/lib/actions";

/** Configured per environment; the issuer owns card disputes and support. */
const ISSUER_SUPPORT_URL = process.env.NEXT_PUBLIC_CARD_ISSUER_SUPPORT_URL || "";

export default function CardPage() {
  const { profile, card, txs } = useTalent();
  const toast = useToast();
  const { busy, run } = useAction();
  const [replacing, setReplacing] = useState(false);
  const cardTxs = txs.filter((t) => t.kind === "card");
  const frozen = card?.status === "frozen";

  return (
    <div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Card</h1>
      <p className="mt-1 text-sm text-muted">A virtual debit card that spends your AGNCY balance.</p>

      {!card ? (
        <div className="mt-6 rounded-[28px] border border-dashed border-ink/20 bg-white p-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white">
            <CreditCard className="h-5 w-5" />
          </span>
          <p className="mt-4 text-[15px] font-semibold text-ink">Activate your virtual card</p>
          <p className="mt-1 text-sm text-muted">Free, instant, and usable online right away. Physical cards aren&apos;t part of the beta.</p>
          <Button
            className="mt-5"
            loading={busy === "activate"}
            onClick={() =>
              run("activate", async () => {
                await activateCard(profile.uid);
                toast("Card activated");
              })
            }
          >
            Activate card
          </Button>
        </div>
      ) : (
        <>
          <div
            className={`relative mt-6 aspect-[1.586] w-full overflow-hidden rounded-[22px] p-6 text-white shadow-xl transition-[filter] ${frozen ? "grayscale" : ""}`}
            style={{ background: "linear-gradient(135deg,#101010 0%,#1f2a24 55%,#0f3d2e 100%)" }}
          >
            <div aria-hidden className="absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-emerald-400/20 blur-2xl" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="font-display text-lg font-semibold tracking-[0.2em]">AGNCY</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">{frozen ? "Frozen" : "Virtual"}</span>
              </div>
              <div>
                <p className="font-display tabular text-xl tracking-[0.18em]">•••• •••• •••• {card.last4}</p>
                <div className="mt-3 flex items-end justify-between text-xs text-white/70">
                  <span className="uppercase tracking-wider">{profile.fullName}</span>
                  <span className="tabular">
                    {String(card.expMonth).padStart(2, "0")}/{String(card.expYear).slice(-2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted">Test mode shows display details only — no real card number is issued.</p>

          <ul className="mt-5 divide-y divide-line rounded-2xl border border-line bg-white">
            <li className="flex items-center gap-3 px-4 py-3.5">
              <Snowflake className="h-4 w-4 text-ink/50" />
              <span className="flex-1 text-sm font-medium text-ink">Freeze card</span>
              <Toggle
                label="Freeze card"
                checked={frozen}
                disabled={busy === "freeze"}
                onChange={(next) =>
                  run("freeze", async () => {
                    await setCardFrozen(profile.uid, next);
                    toast(next ? "Card frozen" : "Card unfrozen");
                  })
                }
              />
            </li>
            <li>
              <button onClick={() => setReplacing(true)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-paper">
                <RefreshCcw className="h-4 w-4 text-ink/50" />
                <span className="flex-1 text-sm font-medium text-ink">Replace card</span>
                <span className="text-xs text-muted">Lost or compromised</span>
              </button>
            </li>
            <li>
              {ISSUER_SUPPORT_URL ? (
                <a href={ISSUER_SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3.5 hover:bg-paper">
                  <ExternalLink className="h-4 w-4 text-ink/50" />
                  <span className="flex-1 text-sm font-medium text-ink">Report a problem</span>
                  <span className="text-xs text-muted">Card issuer support</span>
                </a>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <ExternalLink className="h-4 w-4 text-ink/30" />
                  <span className="flex-1 text-sm font-medium text-ink/50">Report a problem</span>
                  <span className="text-xs text-muted">Issuer link set at launch</span>
                </div>
              )}
            </li>
          </ul>

          <Section
            title="Card transactions"
            action={
              <Button
                size="sm"
                variant="ghost"
                icon={<ShoppingBag className="h-3.5 w-3.5" />}
                loading={busy === "buy"}
                onClick={() =>
                  run("buy", async () => {
                    await simulateCardPurchase(profile, card);
                    toast("Test purchase recorded");
                  })
                }
              >
                Test purchase
              </Button>
            }
          >
            {cardTxs.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">No card spending yet. It&apos;s listed here, apart from your creative income.</p>
            ) : (
              <ul className="divide-y divide-line rounded-2xl border border-line bg-white px-4">
                {cardTxs.map((t) => (
                  <TxRow key={t.id} tx={t} />
                ))}
              </ul>
            )}
          </Section>

          <Confirm
            open={replacing}
            danger
            title="Replace your card?"
            confirmLabel="Replace card"
            body={`Card ••${card.last4} stops working immediately and you get new card details. Update any subscriptions that use it.`}
            onConfirm={async () => {
              await replaceCard(card);
              toast("New card issued");
            }}
            onClose={() => setReplacing(false)}
          />
        </>
      )}
    </div>
  );
}
