import type { ExpenseSplitMode } from "@/features/expenses/form/model/split-mode";
import { parseSplitMode } from "@/features/expenses/form/model/split-mode";
import {
  validateParticipantShares,
  type ParticipantShareInput,
} from "@/features/expenses/form/model/validate-participant-shares";

const PARTICIPANT_SHARE_PREFIX = "participant_share_";

export function parseParticipantIds(formData: FormData): string[] {
  return [
    ...new Set(
      formData
        .getAll("participant")
        .map((v) => String(v).trim())
        .filter(Boolean),
    ),
  ];
}

export function parseSplitModeFromForm(formData: FormData): ExpenseSplitMode | null {
  return parseSplitMode(String(formData.get("split_mode") ?? ""));
}

export function parseParticipantShareInputs(
  formData: FormData,
  participantIds: string[],
): ParticipantShareInput[] {
  return participantIds.map((userId) => {
    const raw = String(
      formData.get(`${PARTICIPANT_SHARE_PREFIX}${userId}`) ?? "",
    ).trim();
    if (!raw) {
      return { userId, shareAmount: null };
    }
    const v = Number.parseInt(raw, 10);
    return {
      userId,
      shareAmount: Number.isFinite(v) ? v : null,
    };
  });
}

export function participantShareFieldName(userId: string): string {
  return `${PARTICIPANT_SHARE_PREFIX}${userId}`;
}

export function validateExpenseParticipantSharesFromForm(
  amount: number,
  splitMode: ExpenseSplitMode,
  participantIds: string[],
  formData: FormData,
): ReturnType<typeof validateParticipantShares> {
  const inputs = parseParticipantShareInputs(formData, participantIds);
  return validateParticipantShares(amount, splitMode, inputs);
}
