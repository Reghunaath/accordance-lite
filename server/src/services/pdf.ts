import fs from "fs";
import pdfParse from "pdf-parse";

export async function extractPdfText(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const result = await pdfParse(dataBuffer);

  if (!result.text.trim()) {
    throw new Error(
      `Could not extract text from ${filePath}. PDF may be scanned or image-based.`
    );
  }

  return result.text;
}
