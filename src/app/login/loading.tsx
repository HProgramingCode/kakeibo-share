import { AuthPageShell } from "@/features/auth/common/AuthPageShell";
import { AuthRouteLoadingContent } from "@/features/auth/signup/AuthRouteLoadingContent";

export default function LoginLoading() {
  return (
    <AuthPageShell>
      <AuthRouteLoadingContent />
    </AuthPageShell>
  );
}
