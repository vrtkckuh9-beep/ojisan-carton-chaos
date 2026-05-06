import { OjisanFace } from "./OjisanFace";

export const FaceBorder = ({ rows = 2 }: { rows?: number }) => {
  const cells = Array.from({ length: 12 * rows });
  return (
    <div
      className="grid w-full opacity-90"
      style={{
        gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
        background: "hsl(0 0% 12%)",
      }}
    >
      {cells.map((_, i) => (
        <div key={i} className="aspect-square p-[2px]">
          <OjisanFace
            variant="angry"
            className="w-full h-full"
            style={{ filter: "grayscale(1) contrast(1.1) brightness(0.85)" }}
          />
        </div>
      ))}
    </div>
  );
};
