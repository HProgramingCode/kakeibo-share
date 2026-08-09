import { AuthPageShell } from "@/features/auth/common/AuthPageShell";
import { SignupForm } from "@/features/auth/signup/SignupForm";
import { Suspense } from "react";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <AuthPageShell>
          <p className="text-center text-sm text-slate-500">読み込み中…</p>
        </AuthPageShell>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
