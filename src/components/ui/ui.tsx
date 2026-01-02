"use client";

import React from "react";
import Link from "next/link";

/* ───────────────────────── Utils ───────────────────────── */

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2";

/* ───────────────────────── Button ───────────────────────── */

type ButtonProps = {
  children: React.ReactNode;
  ready?: boolean; // si false => disabled
  variant?: "primary" | "secondary";
  size?: "md" | "lg";
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled">;

export function Button({
  children,
  ready = true,
  variant = "primary",
  size = "lg",
  className,
  type = "button",
  onClick,
  ...rest
}: ButtonProps) {
  const base =
    "select-none rounded-2xl font-semibold border transition-all duration-150 ease-out " +
    focusRing;

  const sizes = size === "md" ? "px-4 py-3 text-sm" : "px-6 py-4 text-base";

  const primaryReady =
    "bg-blue-600 text-white border-blue-600 cursor-pointer " +
    "hover:bg-blue-700 hover:shadow-lg hover:-translate-y-[1px] " +
    "active:scale-[0.97] active:shadow-md";

  const primaryNotReady =
    "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed";

  const secondaryReady =
    "bg-white text-gray-900 border-gray-300 cursor-pointer " +
    "hover:bg-gray-50 hover:shadow-md active:scale-[0.99]";

  const secondaryNotReady =
    "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed";

  const variantClass =
    variant === "primary"
      ? ready
        ? primaryReady
        : primaryNotReady
      : ready
      ? secondaryReady
      : secondaryNotReady;

  const disabled = !ready;

  return (
    <button
      type={type}
      disabled={disabled}
      aria-disabled={disabled}
      onClick={(e) => {
        if (disabled) return;
        onClick?.(e);
      }}
      className={cx(base, sizes, variantClass, className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ───────────────────────── Card ───────────────────────── */

type CardProps = {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
};

export function Card({ children, hover = false, className }: CardProps) {
  return (
    <div
      className={cx(
        "rounded-2xl border bg-white p-6",
        hover &&
          "transition hover:-translate-y-0.5 hover:shadow-lg hover:border-black/30",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ───────────────────────── Notice ───────────────────────── */

type NoticeProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

export function Notice({ label, children, className }: NoticeProps) {
  return (
    <div
      className={cx(
        "rounded-2xl border bg-gray-50 p-4 text-sm text-gray-700",
        className
      )}
    >
      <span className="font-semibold">{label} :</span> {children}
    </div>
  );
}

/* ─────────────────────── LinkButton ─────────────────────── */

type LinkButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function LinkButton({ href, children, className }: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cx(
        "shrink-0 rounded-xl border bg-white px-3 py-2 text-sm transition",
        "hover:bg-gray-50",
        focusRing,
        className
      )}
    >
      {children}
    </Link>
  );
}

/* ───────────────────────── TextInput ─────────────────────────
   ✅ API simple : value string + onChange(string)
   ✅ forwardRef => usage propre (ref optional)
*/

type TextInputProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  onFocus?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    { label, value, onChange, placeholder, className, onFocus, onKeyDown },
    ref
  ) {
    return (
      <div className={cx("relative", className)}>
        <label className="block text-sm font-semibold mb-2">{label}</label>

        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={cx(
            "w-full rounded-2xl border bg-white",
            "px-4 py-4 text-base",
            "placeholder:text-gray-400",
            "focus:placeholder:opacity-0",
            "focus:outline-none",
            "focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          )}
        />
      </div>
    );
  }
);

/* ─────────────────────── ActionCard ─────────────────────── */

type ActionCardProps = {
  href: string;
  title: string;
  description: string;
  example: React.ReactNode;
  hint?: string;
  className?: string;
};

export function ActionCard({
  href,
  title,
  description,
  example,
  hint = "Cliquer pour ouvrir",
  className,
}: ActionCardProps) {
  return (
    <Link
      href={href}
      className={cx(
        "group block rounded-2xl border bg-white p-6 transition cursor-pointer",
        "hover:-translate-y-0.5 hover:shadow-lg hover:border-black/30",
        focusRing,
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <div className="text-sm text-gray-600 mt-1">{description}</div>
        </div>

        <div className="shrink-0">
          <div className="h-10 w-10 rounded-xl border flex items-center justify-center text-gray-600 transition group-hover:bg-black group-hover:text-white group-hover:border-black">
            →
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <span className="font-semibold text-gray-700">Exemple :</span>{" "}
        <span className="font-mono">
          {typeof example === "string" ? example : example}
        </span>
      </div>

      <div className="mt-3 text-xs text-gray-500 opacity-0 transition group-hover:opacity-100">
        {hint}
      </div>
    </Link>
  );
}

/* ─────────────────────── SuggestionCard ─────────────────────── */

type SuggestionCardProps = {
  onClick: () => void;
  nom: string;
  nomPere?: string | null;
  nomGrandPere?: string | null;
  clan?: string | null;
  className?: string;
};

export function SuggestionCard({
  onClick,
  nom,
  nomPere,
  nomGrandPere,
  clan,
  className,
}: SuggestionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "group w-full text-left rounded-2xl border bg-white p-4 transition",
        "hover:-translate-y-0.5 hover:shadow-lg hover:border-black/30",
        focusRing,
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold">{nom}</div>
          <div className="mt-1 text-sm text-gray-600">
            Père: {nomPere ?? "?"} • Grand-père: {nomGrandPere ?? "?"} • Clan:{" "}
            {clan ?? "?"}
          </div>
        </div>

        <div className="shrink-0">
          <div className="h-10 w-10 rounded-xl border flex items-center justify-center text-gray-600 transition group-hover:bg-black group-hover:text-white group-hover:border-black">
            →
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 opacity-0 transition group-hover:opacity-100">
        Cliquer pour ouvrir
      </div>
    </button>
  );
}
