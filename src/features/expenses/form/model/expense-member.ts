/** 支出フォームで使うメンバー表示用 DTO */
export type ExpenseMember = { user_id: string; label: string };

/** @deprecated ExpenseMember を使用 */
export type PayerPickMember = ExpenseMember;

/** @deprecated ExpenseMember を使用 */
export type ParticipantPickMember = ExpenseMember;

/** @deprecated ExpenseMember を使用 */
export type MemberForExpenseEdit = ExpenseMember;
