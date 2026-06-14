"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type"
> & {
  inputClassName?: string;
};

export function PasswordInput({
  className,
  inputClassName,
  id,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <Input
        id={id}
        type={visible ? "text" : "password"}
        className={cn("rounded-xl pr-10", inputClassName)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-brand-navy dark:hover:text-foreground"
        aria-label={visible ? "Şifreyi gizle" : "Şifreyi göster"}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
