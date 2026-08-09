import { ROUTES } from "@/shared/navigation/routes";
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect(ROUTES.groups);
}
