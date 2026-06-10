"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Please enter at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message cannot exceed 2000 characters"),
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
        setErrorMessage(json.error ?? "An error occurred. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Connection error. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="border border-accent/40 bg-accent/5 p-8">
        <p className="font-body text-sm text-text-primary">
          Your message has been sent successfully. We will contact you shortly.
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
          Name *
        </label>
        <input
          id="name"
          {...register("name")}
          className={cn("admin-input", errors.name && "border-red-800")}
          placeholder="Your name"
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
          placeholder="email@example.com"
        />
        {errors.email && (
          <p className="mt-1 font-body text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="admin-label">
          Message *
        </label>
        <textarea
          id="message"
          rows={6}
          {...register("message")}
          className={cn("admin-input resize-none", errors.message && "border-red-800")}
          placeholder="Describe your project..."
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
        {status === "loading" ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
