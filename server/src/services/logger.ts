import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, '..', '..', 'perplexity.log');

interface LogEntry {
  timestamp: string;
  query: string;
  response: string;
  citations: string[];
}

export function logPerplexityResponse(
  query: string,
  response: string,
  citations: string[]
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    query,
    response,
    citations,
  };

  const line = JSON.stringify(entry) + '\n';
  fs.appendFileSync(LOG_FILE, line, 'utf-8');
}
