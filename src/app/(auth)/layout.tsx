import { AuthBackdrop } from "@/components/auth/AuthBackdrop";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen relative bg-bg overflow-hidden">
      <AuthBackdrop />
      <div className="relative z-10 min-h-screen grid place-items-center px-4 py-10">
        <div className="w-full max-w-[460px]">
          {children}
        </div>
      </div>
    </main>
  );
}
