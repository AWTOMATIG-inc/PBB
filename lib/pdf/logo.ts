import fs from "fs";
import path from "path";

// The PBB logo as a data URI for @react-pdf/renderer (header + watermark).
// Read once per server process.
function readLogoDataUri(): string {
  try {
    const cleanLogoPath = path.join(process.cwd(), "public", "logo.png");
    const fallbackPath = path.join(process.cwd(), "public", "pbb-logo.png");
    const targetPath = fs.existsSync(cleanLogoPath) ? cleanLogoPath : fallbackPath;
    if (fs.existsSync(targetPath)) {
      const buffer = fs.readFileSync(targetPath);
      return `data:image/png;base64,${buffer.toString("base64")}`;
    }
  } catch (err) {
    console.error("Error reading PBB logo for PDF:", err);
  }
  return "";
}

export const pdfLogoDataUri = readLogoDataUri();

export type PdfBrandLogo = { name: string; src: string; aspect: number };

// Footer brand strip, in display order. Files live in public/brands.
const FOOTER_BRANDS = [
  "Caterpillar",
  "Doosan",
  "Cummins",
  "Perkins",
  "Ricardo",
  "Volvo Penta",
  "John Deere",
  "Deutz",
];

function readBrandLogos(): PdfBrandLogo[] {
  const logos: PdfBrandLogo[] = [];
  for (const name of FOOTER_BRANDS) {
    try {
      const buffer = fs.readFileSync(path.join(process.cwd(), "public", "brands", `${name}.png`));
      // PNG IHDR: width at byte 16, height at byte 20.
      const aspect = buffer.readUInt32BE(16) / buffer.readUInt32BE(20);
      logos.push({ name, src: `data:image/png;base64,${buffer.toString("base64")}`, aspect });
    } catch (err) {
      console.error(`Error reading brand logo "${name}" for PDF:`, err);
    }
  }
  return logos;
}

export const pdfBrandLogos = readBrandLogos();

export async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk: Buffer | Uint8Array) =>
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    );
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err: Error) => reject(err));
  });
}
