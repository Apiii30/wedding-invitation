"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  const field = "w-full rounded-xl border border-petal px-4 py-3 text-sm outline-none focus:border-rose focus:ring-2 focus:ring-rose/20";
  return (
    <form action={action} className="space-y-3">
      <input name="email" type="email" required autoComplete="email" placeholder="Email" className={field} />
      <input name="password" type="password" required autoComplete="current-password" placeholder="Password" className={field} />
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-full bg-plum py-3 text-sm font-medium text-cream transition hover:bg-mauve disabled:opacity-60"
      >
        {pending ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
