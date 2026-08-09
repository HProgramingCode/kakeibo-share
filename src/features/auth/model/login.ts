import type { z } from "zod";

import type { loginSchema } from "@/features/auth/model/login-schema";

export type LoginFormInput = z.infer<typeof loginSchema>;
