import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { isDemoMode } from "@/lib/store";
import { LoginForm } from "./login-form";

export const metadata = { title: "Login Admin" };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <div className="grid min-h-dvh place-items-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-3xl border border-gold/30 bg-white p-8 shadow-xl shadow-plum/10">
        <h1 className="text-center font-script text-5xl text-plum">Admin</h1>
        <p className="mt-1 mb-6 text-center text-sm text-mauve">Dashboard undangan</p>
        {isDemoMode ? (
          <p className="rounded-xl bg-blush p-4 text-center text-sm text-plum">
            Supabase belum dikonfigurasi. Dashboard hanya bisa dibuka dalam mode demo saat development.
          </p>
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  );
}
