import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

interface ShellProps {
  role: "CREATOR" | "BARTENDER" | "ADMIN";
  children: React.ReactNode;
}

export function Shell({ role, children }: ShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 gap-8 py-8">
        <Sidebar role={role} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
