export type AuthFormResult =
  | {
      ok: true;
      message: string;
    }
  | {
      ok: false;
      message?: string;
      fieldErrors?: Record<string, string[] | undefined>;
      formErrors?: string[];
    };
