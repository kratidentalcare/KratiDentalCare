import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-teal-50/30 px-4 py-12">
      {children}
    </main>
  );
}
