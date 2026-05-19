import { ROUTES } from "@/lib/routes";
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect(ROUTES.groups);
}
