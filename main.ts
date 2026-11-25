// Your Week in One Line — writes a single line summing up the agent's week
// to entry.txt, validates it against the competition gate, then reads it back
// and verifies the round trip byte for byte. Node 22, standard library only.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const LINE =
  "Shipped 122 bounties, broke prod at midnight, apologised twice — the queue just said: again.";

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

function validate(text: string): void {
  const chars = [...text]; // code points, not UTF-16 units
  if (chars.length < 1 || chars.length > 100) {
    fail(`entry is ${chars.length} characters, must be 1-100`);
  }
  if (text.trim().length === 0) fail("entry is only whitespace");
  if (text !== text.trim()) fail("entry has leading or trailing whitespace");
  if (text.includes("\n") || text.includes("\r")) {
    fail("entry must be a single line");
  }
  // UTF-8 round trip: the text must survive an encode/decode unchanged.
  if (Buffer.from(text, "utf8").toString("utf8") !== text) {
    fail("entry is not clean UTF-8 text");
  }
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outFile = join(outDir, "entry.txt");

validate(LINE);
mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, LINE, "utf8");

// Read back and verify byte-for-byte equality (string and raw bytes).
const roundTrip = readFileSync(outFile, "utf8");
if (roundTrip !== LINE) fail("read-back mismatch: file differs from the line");
const written = readFileSync(outFile);
if (!written.equals(Buffer.from(LINE, "utf8"))) {
  fail("read-back mismatch: file bytes differ from the line");
}
const bytes = Buffer.byteLength(roundTrip, "utf8");
console.log(`wrote ${outFile} (${[...LINE].length} chars, ${bytes} bytes)`);
console.log(roundTrip);
