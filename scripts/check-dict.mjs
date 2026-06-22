import fs from "fs";
import path from "path";

const dir = "src/lib";
for (const f of fs.readdirSync(dir).filter((x) => x.startsWith("dictionary-") && x.endsWith(".ts"))) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  const words = [...t.matchAll(/word: "([^"]+)"/g)].map((m) => m[1]);
  const bad = words.filter((w) => w.length !== 5);
  const seen = new Set();
  const dups = words.filter((w) => (seen.has(w) ? true : (seen.add(w), false)));
  console.log(
    f,
    "entries",
    words.length,
    "valid5",
    words.length - bad.length,
    "bad",
    bad.length,
    bad.slice(0, 8).join(","),
    dups.length ? `dups:${[...new Set(dups)].join(",")}` : "",
  );
}
