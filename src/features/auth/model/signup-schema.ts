import { z } from "zod";

import { OAUTH_SIGNUP_DISPLAY_NAME_MAX } from "@/features/auth/model/oauth-display-name-cookie";

export const signupSchema = z.object({
  displayName: z
    .string()
    .min(1, { message: "名前は入力必須です" })
    .max(OAUTH_SIGNUP_DISPLAY_NAME_MAX, {
      message: "名前は40文字以内で入力してください",
    }),

  email: z
    .string()
    .email({ message: "正しいメールアドレスを入力してください" }),

  password: z
    .string()
    .min(8, { message: "パスワードは8文字以上で入力してください" }),
});

export type SignupFormInput = z.infer<typeof signupSchema>;
