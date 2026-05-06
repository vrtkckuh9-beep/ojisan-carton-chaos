import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "wood" | "yellow";
};

export const WoodButton = ({ className, variant = "wood", children, ...props }: Props) => {
  return (
    <button
      {...props}
      className={cn(
        "btn-press relative w-full py-3 px-6 ink-outline rounded-md font-black text-lg tracking-wide",
        variant === "wood" ? "wood-plank text-white text-shadow-hard" : "bg-[hsl(var(--yellow))] text-[hsl(var(--ink))]",
        className
      )}
      style={{ boxShadow: "0 5px 0 hsl(var(--ink))" }}
    >
      {children}
    </button>
  );
};
