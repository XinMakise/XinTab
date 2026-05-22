import type { SurfaceMaterial } from "@/shared/types/surfaceMaterial";

export const SURFACE_MATERIAL_OPTIONS: Array<{
  value: SurfaceMaterial;
  label: string;
}> = [
  { value: "transparent", label: "透明" },
  { value: "blur", label: "模糊" },
  { value: "acrylic", label: "亚克力" },
];

const SURFACE_MATERIAL_TOKENS: Record<
  SurfaceMaterial,
  {
    filter: string;
    overlay: string;
  }
> = {
  transparent: {
    filter: "none",
    overlay: "none",
  },
  blur: {
    filter: "blur(12px) saturate(120%)",
    overlay: "none",
  },
  acrylic: {
    filter: "blur(18px) saturate(180%)",
    overlay: "linear-gradient(135deg, hsl(var(--background) / 0.18), hsl(var(--foreground) / 0.05))",
  },
};

export function normalizeSurfaceMaterial(
  value: unknown,
  fallback: SurfaceMaterial = "transparent",
): SurfaceMaterial {
  if (value === "transparent" || value === "blur" || value === "acrylic") {
    return value;
  }

  return fallback;
}

export function getSurfaceMaterialTokens(material: SurfaceMaterial) {
  return SURFACE_MATERIAL_TOKENS[material];
}
