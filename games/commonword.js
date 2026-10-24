window.CommonWordGame = (() => {
  // One word that can go in front of each of the four words below it (SUN + LIGHT).
  const PUZZLES = [
    { answer: "sun", items: ["light", "flower", "burn", "rise"] },
    { answer: "fire", items: ["fly", "work", "place", "man"] },
    { answer: "rain", items: ["bow", "coat", "drop", "fall"] },
    { answer: "hand", items: ["bag", "shake", "writing", "made"] },
    { answer: "book", items: ["mark", "worm", "shelf", "store"] },
    { answer: "snow", items: ["man", "flake", "ball", "storm"] },
    { answer: "water", items: ["fall", "melon", "color", "proof"] },
    { answer: "time", items: ["line", "table", "zone", "keeper"] },
    { answer: "back", items: ["pack", "bone", "yard", "fire"] },
    { answer: "moon", items: ["light", "walk", "shine", "beam"] },
    { answer: "house", items: ["fly", "hold", "work", "boat"] },
    { answer: "black", items: ["board", "bird", "berry", "smith"] },
  ];

  const normalise = (text) => text.toLowerCase().replace(/[^a-z]/g, "");

  // `data` is the day's puzzle from puzzles/*.js. Without it, rotate through the bank.
  function render(panel, seed, data) {
    const dayNumber = Math.floor(Date.parse(seed) / 864e5);
    const puzzle = data || PUZZLES[((dayNumber % PUZZLES.length) + PUZZLES.length) % PUZZLES.length];

    panel.innerHTML = `
      <h2>Prefixes</h2>
      <div class="common-rows"></div>
      <label class="link-guess">
        <input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="The common word">
      </label>
      <p class="status" aria-live="polite"></p>
      <div class="actions">
        <button type="button" class="hint">Hint</button>
        <button type="button" class="reveal">Reveal</button>
      </div>
    `;

    const blanks = [];
    const rowsEl = panel.querySelector(".common-rows");
    puzzle.items.forEach((word) => {
      const row = document.createElement("p");
      row.className = "common-row";
      const blank = document.createElement("span");
      blank.className = "blank";
      blanks.push(blank);
      const text = document.createElement("span");
      text.textContent = word;
      row.append(blank, text);
      rowsEl.appendChild(row);
    });

    const input = panel.querySelector(".link-guess input");
    const status = panel.querySelector(".status");
    let tries = 0;

    function solved(message) {
      panel.classList.remove("link-wrong");
      panel.classList.add("link-solved");
      input.readOnly = true;
      blanks.forEach((b) => { b.textContent = puzzle.answer; });
      status.textContent = message;
    }

    function submit() {
      const guess = normalise(input.value);
      if (!guess || input.readOnly) return;
      if (guess === puzzle.answer) {
        solved("Correct. See you tomorrow.");
      } else {
        tries++;
        panel.classList.add("link-wrong");
        status.textContent = `Not quite. ${tries} ${tries === 1 ? "try" : "tries"} so far.`;
      }
    }

    input.addEventListener("input", () => panel.classList.remove("link-wrong"));
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });

    panel.querySelector(".hint").addEventListener("click", () => {
      status.textContent = `Hint: it starts with "${puzzle.answer[0].toUpperCase()}" and has ${puzzle.answer.length} letters.`;
    });

    panel.querySelector(".reveal").addEventListener("click", () => {
      input.value = puzzle.answer;
      solved("");
    });
  }

  return { render, PUZZLES };
})();
