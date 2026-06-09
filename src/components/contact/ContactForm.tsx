"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Introduceți cel puțin 2 caractere").max(100),
  email: z.string().email("Adresă email invalidă"),
  message: z
    .string()
    .min(10, "Mesajul trebuie să aibă cel puțin 10 caractere")
    .max(2000, "Mesajul nu poate depăși 2000 caractere"),
  website: z.string().max(0).optional(), // honeypot
});

type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("success");
        reset();
      } else {
        const json = await res.json();
        setStatus("error");
        setErrorMessage(json.error ?? "A apărut o eroare. Vă rugăm să încercați din nou.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Eroare de conexiune. Vă rugăm să încercați din nou.");
    }
  };

  if (status === "success") {
    return (
      <div className="border border-accent/40 bg-accent/5 p-8">
        <p className="font-body text-sm text-text-primary">
          Mesajul dvs. a fost trimis cu succes. Vă vom contacta în curând.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Honeypot — hidden from real users */}
      <input {...register("website")} type="text" className="hidden" tabIndex={-1} aria-hidden="true" />

      <div>
        <label htmlFor="name" className="admin-label">
          Nume *
        </label>
        <input
          id="name"
          {...register("name")}
          className={cn("admin-input", errors.name && "border-red-800")}
          placeholder="Numele dvs."
        />
        {errors.name && (
          <p className="mt-1 font-body text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="admin-label">
          Email *
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className={cn("admin-input", errors.email && "border-red-800")}
          placeholder="email@exemplu.ro"
        />
        {errors.email && (
          <p className="mt-1 font-body text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="admin-label">
          Mesaj *
        </label>
        <textarea
          id="message"
          rows={6}
          {...register("message")}
          className={cn("admin-input resize-none", errors.message && "border-red-800")}
          placeholder="Descrieți proiectul dvs..."
        />
        {errors.message && (
          <p className="mt-1 font-body text-xs text-red-600">{errors.message.message}</p>
        )}
      </div>

      {status === "error" && (
        <p className="font-body text-xs text-red-600">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Se trimite..." : "Trimite mesajul"}
      </button>
    </form>
  );
}
