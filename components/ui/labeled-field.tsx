import type { LucideIcon } from "lucide-react";

import { FORM_INPUT, FORM_LABEL } from "@/lib/ui/form-styles";
import { PasswordInput } from "./password-input";

export function LabeledField({
  label,
  icon: Icon,
  name,
  type = "text",
  className = "",
  ...rest
}: {
  label: string;
  icon?: LucideIcon;
  name: string;
  type?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className={FORM_LABEL}>
        {Icon && <Icon size={14} className="text-black/30" />}
        {label}
      </span>
      <div className="mt-2">
        {type === "password" ? (
          <PasswordInput name={name} {...rest} />
        ) : (
          <input name={name} type={type} className={`${FORM_INPUT} ${className}`} {...rest} />
        )}
      </div>
    </label>
  );
}
