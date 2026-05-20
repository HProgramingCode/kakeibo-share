import type { z } from "zod";

import type { loginSchema } from "@/features/auth/validations/login-schema";

export type LoginFormInput = z.infer<typeof loginSchema>;
