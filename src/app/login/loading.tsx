import { AuthPageShell } from "@/features/auth/ui/components/AuthPageShell";
import { AuthRouteLoadingContent } from "@/features/auth/ui/components/AuthRouteLoadingContent";

export default function LoginLoading() {
  return (
    <AuthPageShell>
      <AuthRouteLoadingContent />
    </AuthPageShell>
  );
}
