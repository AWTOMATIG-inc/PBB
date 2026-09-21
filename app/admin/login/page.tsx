import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Admin Login | Power Bank Bangladesh",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-ink-100 bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-lg font-bold text-ink-900">
            Power Bank Bangladesh
          </p>
          <p className="mt-1 text-sm text-ink-400">Admin sign in</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
