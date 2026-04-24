import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Shell } from "@/components/layout/shell";

export default async function BartenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "BARTENDER" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <Shell role="BARTENDER">{children}</Shell>;
}
