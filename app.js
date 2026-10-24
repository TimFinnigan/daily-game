// Each game exposes render(container, seed). Add new games to this list.
// Four panels, laid out as a 2x2 grid.
const games = [
  window.TriviaGame,
  window.ConnectionGame,
  window.CommonWordGame,
  window.JumbleGame,
];

const today = new Date();
const dayKey = today.toISOString().slice(0, 10);

document.getElementById("date").textContent = today.toLocaleDateString(undefined, {
  weekday: "long", year: "numeric", month: "long", day: "numeric",
});

const root = document.getElementById("panels");
for (const game of games) {
  const panel = document.createElement("section");
  panel.className = "panel";
  root.appendChild(panel);
  game.render(panel, dayKey);
}
