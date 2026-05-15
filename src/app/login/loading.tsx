import { AuthPageShell } from "@/features/auth/ui/AuthPageShell";
import { AuthRouteLoadingContent } from "@/features/auth/ui/AuthRouteLoadingContent";

export default function LoginLoading() {
  return (
    <AuthPageShell>
      <AuthRouteLoadingContent />
    </AuthPageShell>
  );
}
