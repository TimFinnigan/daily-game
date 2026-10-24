// Each game exposes render(container, seed, data). `data` is that game's puzzle for
// the day from puzzles/YYYY-MM.js. If a day has no entry the game falls back to its bank.
const games = [
  ["jumble", window.JumbleGame],
  ["trivia", window.TriviaGame],
  ["connection", window.ConnectionGame],
  ["prefix", window.CommonWordGame],
];

const pad = (n) => String(n).padStart(2, "0");

// Local date as YYYY-MM-DD. Add ?date=2026-11-05 to the URL to preview another day.
function pickDay() {
  const asked = new URLSearchParams(location.search).get("date");
  if (/^\d{4}-\d{2}-\d{2}$/.test(asked || "") && !Number.isNaN(Date.parse(asked))) return asked;
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const dayKey = pickDay();
const [year, month, day] = dayKey.split("-").map(Number);

document.getElementById("date").textContent = new Date(year, month - 1, day)
  .toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

function start() {
  const scheduled = (window.PUZZLES || {})[dayKey];
  const data = scheduled || {};
  const root = document.getElementById("panels");

  // Nothing scheduled for this day, so the games use their backup banks. Say so.
  if (!scheduled) {
    const notice = document.createElement("p");
    notice.className = "notice";
    notice.textContent = "No puzzles are scheduled for today. Remind Tim to update the page!";
    root.before(notice);
  }

  for (const [key, game] of games) {
    const panel = document.createElement("section");
    panel.className = "panel";
    root.appendChild(panel);
    game.render(panel, dayKey, data[key]);
  }
}

// Load the month's puzzle file with a script tag so it also works from file://.
const monthFile = document.createElement("script");
monthFile.src = `puzzles/${year}-${pad(month)}.js`;
monthFile.onload = start;
monthFile.onerror = start;
document.body.appendChild(monthFile);
