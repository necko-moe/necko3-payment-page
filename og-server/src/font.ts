import { readFileSync } from "node:fs";
import { createRequire as fontRequireFactory } from "node:module";

const fontRequire = fontRequireFactory(import.meta.url);

function load(file: string): Buffer {
  return readFileSync(
    fontRequire.resolve(`@fontsource/inter/files/${file}`),
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
