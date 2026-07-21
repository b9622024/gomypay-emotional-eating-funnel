import fs from "node:fs";
import path from "node:path";
import { Scene02CharacterPreview } from "@/components/dev/Scene02CharacterPreview";
import { scene02Characters } from "@/content/scene02Characters";

export const metadata = {
  title: "Scene 02 Characters Preview",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-static";

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "未知大小";
  const units = ["B", "KB", "MB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function getPublicFileSize(publicPath: string) {
  const fullPath = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));

  try {
    return fs.statSync(fullPath).size;
  } catch {
    return 0;
  }
}

export default function Scene02CharactersPage() {
  const charactersWithMeta = scene02Characters.map((character) => ({
    ...character,
    pngSizeLabel: formatBytes(getPublicFileSize(character.image)),
    webpSizeLabel: formatBytes(getPublicFileSize(character.webpImage)),
    originalSizeLabel: formatBytes(getPublicFileSize(character.originalImage)),
  }));

  return <Scene02CharacterPreview characters={charactersWithMeta} />;
}
