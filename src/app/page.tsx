import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { GlassWater, BookOpen, Users, ListOrdered, ArrowRight } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Craft Your Recipes",
    description:
      "Build from classic cocktails, clone existing recipes, track multiple versions, and write step-by-step instructions.",
  },
  {
    icon: ListOrdered,
    title: "Curate Your Menus",
    description:
      "Create multiple menus, assign recipes to them, and share a beautiful patron-facing menu page for your bar.",
  },
  {
    icon: Users,
    title: "Empower Your Team",
    description:
      "Give bartenders quick access to every recipe with clear instructions, so anyone behind the bar can nail it.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-6">
            <GlassWater className="w-4 h-4" />
            Your bar. Your recipes. Your menu.
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-stone-900 mb-6">
            Build the perfect{" "}
            <span className="text-amber-500">cocktail menu</span>{" "}
            for your bar
          </h1>
          <p className="text-xl text-stone-500 mb-10 max-w-2xl mx-auto">
            HomeBarMenu lets you create and version your cocktail recipes,
            assemble them into beautiful menus, and share them with patrons —
            all in one place.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg">
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="secondary" size="lg">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-t border-stone-200 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-stone-900 mb-12">
            Everything your bar needs
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-stone-900">{f.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-stone-400">
          <div className="flex items-center gap-1.5">
            <GlassWater className="w-4 h-4 text-amber-400" />
            <span>HomeBarMenu</span>
          </div>
          <span>Built for bartenders and creators</span>
        </div>
      </footer>
    </div>
  );
}
