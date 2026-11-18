import type { BodyType } from "@/lib/api/contracts";
import { cn } from "@/lib/cn";

interface Shape {
  body: string;
  windows: string;
  wheels: [number, number];
}

/** Silhuetas ilustrativas (não representam o modelo exato do veículo). */
const SHAPES: Record<BodyType, Shape> = {
  HATCH: {
    body: "M22 64 L22 51 Q23 45 31 43 L60 39 L80 23 Q84 20 92 20 L134 20 Q142 20 147 26 L166 41 Q178 43 181 50 L182 64 Z",
    windows: "M66 39 L84 25 Q86 24 90 24 L110 24 L110 39 Z M115 24 L133 24 Q139 24 143 28 L155 39 L115 39 Z",
    wheels: [56, 150],
  },
  SEDAN: {
    body: "M12 64 L12 52 Q13 45 24 43 L56 39 L78 23 Q82 20 90 20 L126 20 Q134 20 140 26 L154 38 L178 41 Q188 43 188 52 L188 64 Z",
    windows: "M62 39 L82 25 Q84 24 88 24 L106 24 L106 39 Z M111 24 L125 24 Q131 24 135 28 L146 39 L111 39 Z",
    wheels: [50, 156],
  },
  SUV: {
    body: "M16 66 L16 46 Q17 39 27 37 L50 34 L67 16 Q71 13 79 13 L150 13 Q158 13 162 18 L174 34 Q184 36 186 44 L186 66 Z",
    windows: "M57 34 L71 19 Q73 17 77 17 L108 17 L108 34 Z M113 17 L148 17 Q154 17 157 21 L166 34 L113 34 Z",
    wheels: [54, 152],
  },
  MINIVAN: {
    body: "M12 66 L12 42 Q13 33 24 31 L42 15 Q46 11 54 11 L170 11 Q180 11 183 19 L188 36 L188 66 Z",
    windows: "M32 31 L47 17 Q49 15 53 15 L86 15 L86 31 Z M91 15 L130 15 L130 31 L91 31 Z M135 15 L168 15 Q174 15 176 20 L180 31 L135 31 Z",
    wheels: [50, 154],
  },
};

export function VehicleIllustration({ bodyType, accentColor, className }: { bodyType: BodyType; accentColor?: string; className?: string }) {
  const shape = SHAPES[bodyType];
  return (
    <svg viewBox="0 0 200 84" className={cn("w-full", className)} role="img" aria-label="Imagem ilustrativa do veículo">
      <ellipse cx="100" cy="78" rx="88" ry="4" fill="rgb(13 27 58 / 0.08)" />
      <path d={shape.body} fill={accentColor ?? "var(--color-navy-700)"} opacity="0.92" />
      <path d={shape.windows} fill="white" opacity="0.75" />
      {shape.wheels.map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="66" r="13" fill="#1e293b" />
          <circle cx={cx} cy="66" r="5.5" fill="#cbd5e1" />
        </g>
      ))}
    </svg>
  );
}
