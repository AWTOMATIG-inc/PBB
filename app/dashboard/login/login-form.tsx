"use client";

import { useActionState } from "react";
import { Lock, Mail } from "lucide-react";
import { login } from "../actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink-700">
          Email
        </label>
        <div className="flex items-center gap-2 rounded-md border border-ink-200 px-3 py-2.5 focus-within:border-brand-500">
          <Mail className="size-4 shrink-0 text-ink-400" />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full text-sm text-ink-900 outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-ink-700">
          Password
        </label>
        <div className="flex items-center gap-2 rounded-md border border-ink-200 px-3 py-2.5 focus-within:border-brand-500">
          <Lock className="size-4 shrink-0 text-ink-400" />
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full text-sm text-ink-900 outline-none"
          />
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
