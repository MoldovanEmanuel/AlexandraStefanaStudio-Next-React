"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/admin";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Email invalid"),
  password: z.string().min(1, "Parola este obligatorie"),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { setUser } = useAdminStore();
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const json = await res.json();
        setUser(json.data);
        router.push("/admin/dashboard");
      } else {
        const json = await res.json();
        setError(json.error ?? "Autentificare eșuată");
      }
    } catch {
      setError("Eroare de conexiune");
    }
  };

  return (
    <div className="w-full max-w-md p-8 border border-border bg-bg-lighter">
      <div className="mb-8">
        <p className="font-display text-2xl tracking-widest text-text-primary mb-1">AS STUDIO</p>
        <p className="font-body text-xs uppercase tracking-widest text-accent">Admin Panel</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="admin-label">Email</label>
          <input
            type="email"
            {...register("email")}
            className={cn("admin-input", errors.email && "border-red-800")}
            autoComplete="email"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="admin-label">Parolă</label>
          <input
            type="password"
            {...register("password")}
            className={cn("admin-input", errors.password && "border-red-800")}
            autoComplete="current-password"
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register("remember")} className="accent-accent" />
          <span className="font-body text-xs text-text-muted">Ține-mă minte</span>
        </label>

        {error && <p className="font-body text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full justify-center disabled:opacity-50"
        >
          {isSubmitting ? "Se autentifică..." : "Autentificare"}
        </button>
      </form>
    </div>
  );
}
