import { readFileSync } from "node:fs";

// `require` is provided by the esbuild banner (createRequire shim)
declare const require: NodeRequire;

function load(file: string): Buffer {
  return readFileSync(
    require.resolve(`@fontsource/inter/files/${file}`),
  );
}

export const FONTS = [
  {
    name: "Inter",
    data: load("inter-latin-400-normal.woff"),
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    name: "Inter",
    data: load("inter-latin-700-normal.woff"),
    weight: 700 as const,
    style: "normal" as const,
  },
];
