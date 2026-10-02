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
