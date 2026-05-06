import { CSSProperties } from "react";

type Props = {
  variant?: "normal" | "angry" | "silhouette" | "tiny";
  hair?: boolean;
  className?: string;
  style?: CSSProperties;
  triple?: boolean;
};

export const OjisanFace = ({ variant = "normal", hair = true, className, style, triple }: Props) => {
  if (variant === "silhouette") {
    return (
      <svg viewBox="0 0 100 100" className={className} style={style}>
        <ellipse cx="50" cy="55" rx="36" ry="40" fill="hsl(var(--ink))" />
        {hair && <path d="M18 45 Q22 22 50 20 Q78 22 82 45 Q72 32 50 33 Q28 32 18 45 Z" fill="hsl(var(--ink))" />}
      </svg>
    );
  }

  if (variant === "tiny") {
    return (
      <svg viewBox="0 0 100 100" className={className} style={style}>
        <ellipse cx="50" cy="55" rx="34" ry="38" fill="hsl(var(--peach-shade))" stroke="hsl(var(--ink))" strokeWidth="3" />
        <path d="M28 42 Q35 25 50 24 Q65 25 72 42" stroke="hsl(var(--ink))" strokeWidth="3" fill="none" />
        <circle cx="40" cy="55" r="2.5" fill="hsl(var(--ink))" />
        <circle cx="60" cy="55" r="2.5" fill="hsl(var(--ink))" />
        <path d="M38 70 Q50 74 62 70" stroke="hsl(var(--ink))" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (variant === "angry") {
    return (
      <svg viewBox="0 0 100 100" className={className} style={style}>
        <ellipse cx="50" cy="56" rx="38" ry="42" fill="hsl(var(--angry))" stroke="hsl(var(--ink))" strokeWidth="3.5" />
        {hair && (
          <>
            <path d="M16 46 Q18 22 50 18 Q82 22 84 46 Q74 30 60 32 Q50 28 40 32 Q26 30 16 46 Z" fill="hsl(var(--hair))" stroke="hsl(var(--ink))" strokeWidth="3" />
          </>
        )}
        {/* Angry brows */}
        <path d="M22 44 L46 52 L42 56 L20 50 Z" fill="hsl(var(--ink))" />
        <path d="M78 44 L54 52 L58 56 L80 50 Z" fill="hsl(var(--ink))" />
        {/* Eyes squinted */}
        <path d="M30 56 Q36 60 42 56" stroke="hsl(var(--ink))" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M58 56 Q64 60 70 56" stroke="hsl(var(--ink))" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Stress mark */}
        <g stroke="hsl(var(--ink))" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M76 22 L82 26 M86 24 L82 26 L84 32 M82 26 L78 30" />
        </g>
        {/* Wrinkles */}
        <path d="M14 60 Q20 62 24 60" stroke="hsl(var(--angry-dark))" strokeWidth="2" fill="none" />
        <path d="M76 60 Q82 62 86 60" stroke="hsl(var(--angry-dark))" strokeWidth="2" fill="none" />
        {/* Mustache */}
        <path d="M30 72 Q40 70 50 74 Q60 70 70 72 Q60 78 50 76 Q40 78 30 72 Z" fill="hsl(var(--hair))" stroke="hsl(var(--ink))" strokeWidth="2" />
        {/* Open mouth with teeth */}
        <path d="M36 80 Q50 92 64 80 Q50 86 36 80 Z" fill="hsl(var(--ink))" stroke="hsl(var(--ink))" strokeWidth="2" />
        <rect x="44" y="80" width="5" height="6" fill="hsl(var(--cream))" />
        <rect x="51" y="80" width="5" height="6" fill="hsl(var(--cream))" />
        {/* Stubble */}
        <g fill="hsl(var(--ink))">
          <circle cx="32" cy="84" r="0.8" />
          <circle cx="36" cy="88" r="0.8" />
          <circle cx="64" cy="88" r="0.8" />
          <circle cx="68" cy="84" r="0.8" />
          <circle cx="50" cy="92" r="0.8" />
        </g>
      </svg>
    );
  }

  // normal sleepy ojisan
  const Face = ({ x = 0, scale = 1 }: { x?: number; scale?: number }) => (
    <g transform={`translate(${x} 0) scale(${scale})`} transform-origin="50 50">
      <ellipse cx="50" cy="56" rx="36" ry="40" fill="hsl(var(--peach))" stroke="hsl(var(--ink))" strokeWidth="3.5" />
      {hair && (
        <path d="M18 46 Q22 24 50 22 Q78 24 82 46 Q72 32 60 34 Q50 30 40 34 Q28 32 18 46 Z" fill="hsl(var(--hair))" stroke="hsl(var(--ink))" strokeWidth="3" />
      )}
      {/* Sleepy brows */}
      <path d="M26 50 Q34 47 42 50" stroke="hsl(var(--ink))" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M58 50 Q66 47 74 50" stroke="hsl(var(--ink))" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Sleepy eyes (lines) */}
      <path d="M28 60 Q34 63 42 60" stroke="hsl(var(--ink))" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M58 60 Q66 63 72 60" stroke="hsl(var(--ink))" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Cheeks */}
      <ellipse cx="28" cy="70" rx="5" ry="3" fill="hsl(var(--peach-shade))" opacity="0.7" />
      <ellipse cx="72" cy="70" rx="5" ry="3" fill="hsl(var(--peach-shade))" opacity="0.7" />
      {/* Mustache */}
      <path d="M30 74 Q40 72 50 76 Q60 72 70 74 Q60 80 50 78 Q40 80 30 74 Z" fill="hsl(var(--hair))" stroke="hsl(var(--ink))" strokeWidth="2" />
      {/* Mouth */}
      <path d="M44 84 Q50 86 56 84" stroke="hsl(var(--ink))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  );

  if (triple) {
    return (
      <svg viewBox="0 0 100 100" className={className} style={style}>
        <g transform="translate(50 50) scale(0.55) translate(-50 -50)">
          <g transform="translate(-30 -10)"><Face /></g>
          <g transform="translate(30 -10)"><Face /></g>
          <g transform="translate(0 25)"><Face /></g>
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" className={className} style={style}>
      <Face />
    </svg>
  );
};
