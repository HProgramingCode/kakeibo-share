"use client";

import type { ExpenseFeedItemData } from "@/features/expenses/feed/model/expense-feed-item";
import type { MemberForExpenseEdit } from "@/features/expenses/form/model/expense-member";
import { ExpenseEditSheet } from "@/features/expenses/feed/components/ExpenseEditSheet";
import { ExpenseFeedRow } from "@/features/expenses/feed/components/ExpenseFeedRow";
import { SettledExpenseDetailSheet } from "@/features/expenses/feed/components/SettledExpenseDetailSheet";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

export type { ExpenseFeedItemData } from "@/features/expenses/feed/model/expense-feed-item";

type Props = {
  items: ExpenseFeedItemData[];
  groupId?: string;
  membersForEdit?: MemberForExpenseEdit[];
};

export function ExpenseFeed({ items, groupId, membersForEdit }: Props) {
  const reduceMotion = useReducedMotion();
  const [editing, setEditing] = useState<ExpenseFeedItemData | null>(null);
  const [viewing, setViewing] = useState<ExpenseFeedItemData | null>(null);
  const canEdit = Boolean(groupId && membersForEdit?.length);

  if (reduceMotion) {
    return (
      <>
        <ul className="flex flex-col gap-3">
          {items.map((e) => (
            <li key={e.id}>
              <ExpenseFeedRow
                item={e}
                canEdit={canEdit}
                onEdit={() => setEditing(e)}
                onView={() => setViewing(e)}
              />
            </li>
          ))}
        </ul>
        {editing && groupId && membersForEdit ? (
          <ExpenseEditSheet
            groupId={groupId}
            members={membersForEdit}
            item={editing}
            onClose={() => setEditing(null)}
          />
        ) : null}
        {viewing ? <SettledExpenseDetailSheet item={viewing} onClose={() => setViewing(null)} /> : null}
      </>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.02 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 380, damping: 28 },
    },
  };

  return (
    <>
      <motion.ul
        className="flex flex-col gap-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {items.map((e) => (
          <motion.li key={e.id} variants={itemVariants}>
            <ExpenseFeedRow
              item={e}
              canEdit={canEdit}
              onEdit={() => setEditing(e)}
              onView={() => setViewing(e)}
            />
          </motion.li>
        ))}
      </motion.ul>
      {editing && groupId && membersForEdit ? (
        <ExpenseEditSheet
          groupId={groupId}
          members={membersForEdit}
          item={editing}
          onClose={() => setEditing(null)}
        />
      ) : null}
      {viewing ? <SettledExpenseDetailSheet item={viewing} onClose={() => setViewing(null)} /> : null}
    </>
  );
}
