"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { FORM_INPUT } from "@/lib/ui/form-styles";

/** Password input with a show/hide toggle — lets the person typing check
 * they didn't mistype it, instead of trusting dots blind. */
export function PasswordInput({
  className = "",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...rest}
        type={visible ? "text" : "password"}
        className={`${FORM_INPUT} pr-10 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        tabIndex={-1}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-brand-navy"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
