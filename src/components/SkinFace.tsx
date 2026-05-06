import { CSSProperties } from "react";

type Props = {
  src: string;
  className?: string;
  style?: CSSProperties;
  alt?: string;
};

export const SkinFace = ({ src, className, style, alt = "ojisan" }: Props) => (
  <img
    src={src}
    alt={alt}
    draggable={false}
    className={`w-full h-full object-contain select-none pointer-events-none ${className || ""}`}
    style={style}
  />
);
