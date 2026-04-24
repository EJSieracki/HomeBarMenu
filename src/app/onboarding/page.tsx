import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { GlassWater } from "lucide-react";
import Link from "next/link";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "CREATOR") redirect("/bartender");

  // If they already have a bar, skip onboarding
  const bar = await prisma.bar.findUnique({
    where: { ownerId: session.user.id },
  });
  if (bar) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-stone-900">
            <GlassWater className="w-7 h-7 text-amber-500" />
            <span className="text-xl font-bold">HomeBarMenu</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-stone-900">
            Set up your bar
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Give your bar a name — this is what patrons will see.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
