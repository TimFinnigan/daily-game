// Checks every puzzle file in puzzles/. Run with: node scripts/validate.js
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const dir = path.join(__dirname, "..", "puzzles");
const errors = [];
const warnings = [];
const err = (day, msg) => errors.push(`${day}: ${msg}`);
const warn = (day, msg) => warnings.push(`${day}: ${msg}`);

// Same matching rules as the games, so an answer that can never match is caught here.
const normaliseTrivia = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9 ]/g, "").replace(/^the /, "").replace(/\s+/g, " ").trim();
const normaliseLink = (t) => t.toLowerCase().replace(/[^a-z ]/g, "").replace(/^(a|an|the) /, "").trim();

let dictionary = null;
try {
  dictionary = new Set(fs.readFileSync("/usr/share/dict/words", "utf8").split("\n").map((w) => w.toLowerCase()));
} catch {}
const inDict = (w) => !dictionary || dictionary.has(w);

const seen = { question: new Map(), jumble: new Map(), link: new Map(), prefix: new Map() };
function dupe(kind, key, day) {
  if (seen[kind].has(key)) warn(day, `${kind} "${key}" was already used on ${seen[kind].get(key)}`);
  else seen[kind].set(key, day);
}

const files = fs.readdirSync(dir).filter((f) => /^\d{4}-\d{2}\.js$/.test(f)).sort();
if (!files.length) err("puzzles", "no puzzle files found");

for (const file of files) {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(dir, file), "utf8"), ctx);
  const days = ctx.window.PUZZLES || {};
  const month = file.slice(0, 7);
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();

  // Only warn about gaps after the first day in the file (earlier days are in the past).
  const firstDay = Math.min(...Object.keys(days).map((k) => Number(k.slice(8))));
  for (let d = firstDay; d <= daysInMonth; d++) {
    const key = `${month}-${String(d).padStart(2, "0")}`;
    if (!days[key]) warn(key, "no puzzle for this day (the site will use the fallback bank)");
  }

  for (const [day, p] of Object.entries(days)) {
    if (!day.startsWith(month) || Number.isNaN(Date.parse(day))) { err(day, `bad date key in ${file}`); continue; }

    // Trivia
    if (!Array.isArray(p.trivia) || p.trivia.length !== 4) err(day, "trivia needs exactly 4 questions");
    else p.trivia.forEach((t, i) => {
      if (!t.q || !t.q.endsWith("?")) err(day, `trivia ${i + 1}: question should end with "?"`);
      if (!Array.isArray(t.a) || !t.a.length) err(day, `trivia ${i + 1}: needs accepted answers`);
      else t.a.forEach((a) => {
        if (normaliseTrivia(a) !== a) err(day, `trivia ${i + 1}: answer "${a}" can never match (use lowercase, no punctuation)`);
      });
      dupe("question", t.q, day);
    });

    // Jumble
    if (!Array.isArray(p.jumble) || p.jumble.length !== 4) err(day, "jumble needs exactly 4 words");
    else {
      const sorted = new Set();
      p.jumble.forEach((w) => {
        if (!/^[a-z]{4,8}$/.test(w)) err(day, `jumble "${w}" should be 4 to 8 lowercase letters`);
        const letters = [...w].sort().join("");
        if (sorted.has(letters)) err(day, `jumble "${w}" is an anagram of another word that day`);
        sorted.add(letters);
        if (!inDict(w)) warn(day, `jumble "${w}" is not in the dictionary`);
        dupe("jumble", w, day);
      });
    }

    // Connection
    const c = p.connection;
    if (!c || !Array.isArray(c.words) || c.words.length !== 4) err(day, "connection needs 4 words");
    else {
      if (new Set(c.words).size !== 4) err(day, "connection words must be different");
      if (!Array.isArray(c.a) || !c.a.length) err(day, "connection needs accepted answers");
      else {
        c.a.forEach((a) => {
          if (normaliseLink(a) !== a) err(day, `connection answer "${a}" can never match`);
          if (c.words.includes(a)) err(day, `connection answer "${a}" is one of the words`);
        });
        dupe("link", c.a[0], day);
      }
    }

    // Prefix
    const f = p.prefix;
    if (!f || !/^[a-z]+$/.test(f.answer || "") || !Array.isArray(f.items) || f.items.length !== 4) err(day, "prefix needs an answer and 4 items");
    else {
      if (new Set(f.items).size !== 4) err(day, "prefix items must be different");
      f.items.forEach((item) => {
        if (!/^[a-z]+$/.test(item)) err(day, `prefix item "${item}" should be lowercase letters`);
        else if (!inDict(f.answer + item)) warn(day, `"${f.answer + item}" is not in the dictionary, check it is a real word`);
      });
      dupe("prefix", f.answer, day);
    }
  }
  console.log(`${file}: ${Object.keys(days).length} days checked`);
}

warnings.forEach((w) => console.log("warning:", w));
errors.forEach((e) => console.log("ERROR:", e));
console.log(`${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
