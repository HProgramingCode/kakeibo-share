import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "正しいメールアドレスを入力してください" }),

  password: z
    .string()
    .min(8, { message: "パスワードは8文字以上で入力してください" }),
});

export type LoginSchemaInput = z.infer<typeof loginSchema>;
