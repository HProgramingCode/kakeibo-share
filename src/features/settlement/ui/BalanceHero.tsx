"use client";

import type { TransferPreview } from "@/features/settlement/lib/settlement-transfers-preview";
import { formatYen } from "@/lib/format-yen";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowRightLeft } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

type Props = {
  currentUserId: string;
  transfers: TransferPreview[];
  nameByUserId: Record<string, string>;
};

/** 未精算ベースの送金ペア一覧のみを表示するダッシュボード用カード */
export function BalanceHero({ currentUserId, transfers, nameByUserId }: Props) {
  const reduceMotion = useReducedMotion();

  const containerVariants: Variants = reduceMotion
    ? { hidden: {}, show: {} }
    : {
        hidden: { opacity: 0, y: 20 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
        },
      };

  function partyLabel(userId: string): string {
    return nameByUserId[userId] ?? userId;
  }

  function partyClass(userId: string): string {
    return cn(
      "max-w-[42%] truncate font-medium sm:max-w-none",
      userId === currentUserId ? "font-black text-white" : "text-white/95",
    );
  }

  return (
    <motion.section
      layoutId="balance-card"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden rounded-[32px] bg-indigo-600 p-8 text-white shadow-2xl transition-all"
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-black/10 blur-2xl"
        aria-hidden
      />

      <div className="relative z-10 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-base font-bold leading-snug text-white">
            支払状況
          </p>
          <ArrowRightLeft
            className="mt-0.5 h-6 w-6 shrink-0 opacity-60"
            aria-hidden
          />
        </div>

        {transfers.length === 0 ? (
          <p className="rounded-2xl border border-white/15 bg-white/10 px-4 py-5 text-sm leading-relaxed text-white/85 backdrop-blur-[2px]">
            いまは送金不要です。メンバー間の貸し借りがちょうど合っています。
          </p>
        ) : (
          <ul className="flex flex-col gap-3" aria-label="送金ペアの一覧">
            {transfers.map((t, i) => (
              <li
                key={`${t.from_user_id}-${t.to_user_id}-${i}`}
                className="flex flex-wrap items-center gap-x-2 gap-y-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-sm backdrop-blur-[2px] sm:flex-nowrap sm:justify-between"
              >
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                  <span
                    className={partyClass(t.from_user_id)}
                    title={partyLabel(t.from_user_id)}
                  >
                    {partyLabel(t.from_user_id)}
                  </span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-white/55"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span
                    className={partyClass(t.to_user_id)}
                    title={partyLabel(t.to_user_id)}
                  >
                    {partyLabel(t.to_user_id)}
                  </span>
                </div>
                <span className="shrink-0 font-mono text-lg font-black tabular-nums tracking-tight text-white sm:pl-2">
                  {formatYen(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className="border-t border-white/15 pt-4 text-[11px] leading-relaxed text-white/50">
          未精算の支出のみ・均等割り（端数は支払者）。試算です。「月次精算の確定」後の記録が正となります。
        </p>
      </div>
    </motion.section>
  );
}
