import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Shell } from "@/components/layout/shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return <Shell role="ADMIN">{children}</Shell>;
}
