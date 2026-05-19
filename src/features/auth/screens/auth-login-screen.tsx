import { LoginForm } from "@/features/auth/ui/LoginForm";
import { AuthPageShell } from "@/features/auth/ui/AuthPageShell";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthPageShell>
          <p className="text-center text-sm text-slate-500">読み込み中…</p>
        </AuthPageShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
