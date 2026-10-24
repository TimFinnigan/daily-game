window.ConnectionGame = (() => {
  // Four words that look unrelated but share one link. `a` lists accepted answers.
  const PUZZLES = [
    { words: ["crown", "root", "filling", "cap"], a: ["tooth", "teeth", "dental", "dentist", "dentistry"] },
    { words: ["bark", "ring", "trunk", "sap"], a: ["tree"] },
    { words: ["bank", "mouth", "bed", "source"], a: ["river"] },
    { words: ["neck", "bridge", "fret", "pick"], a: ["guitar"] },
    { words: ["spine", "jacket", "cover", "index"], a: ["book"] },
    { words: ["tongue", "sole", "heel", "lace"], a: ["shoe", "footwear", "boot"] },
    { words: ["hull", "deck", "bow", "keel"], a: ["ship", "boat", "vessel"] },
    { words: ["iris", "lid", "lash", "pupil"], a: ["eye"] },
    { words: ["lens", "shutter", "flash", "tripod"], a: ["camera", "photography"] },
    { words: ["hood", "trunk", "bumper", "dashboard"], a: ["car", "vehicle", "automobile"] },
    { words: ["court", "net", "serve", "racket"], a: ["tennis"] },
    { words: ["face", "hands", "pendulum", "chime"], a: ["clock", "watch"] },
  ];

  function normalise(text) {
    return text.toLowerCase().replace(/[^a-z ]/g, "").replace(/^(a|an|the) /, "").trim();
  }

  const matches = (puzzle, guess) => {
    const g = normalise(guess);
    return puzzle.a.some((ans) => g === ans || g.replace(/s$/, "") === ans);
  };

  function render(panel, seed) {
    const dayNumber = Math.floor(Date.parse(seed) / 864e5);
    const puzzle = PUZZLES[((dayNumber % PUZZLES.length) + PUZZLES.length) % PUZZLES.length];

    panel.innerHTML = `
      <h2>Connections</h2>
      <div class="link-words"></div>
      <label class="link-guess">
        <input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="What links the four words">
      </label>
      <p class="status" aria-live="polite"></p>
      <div class="actions">
        <button type="button" class="hint">Hint</button>
        <button type="button" class="reveal">Reveal</button>
      </div>
    `;

    const wordsEl = panel.querySelector(".link-words");
    puzzle.words.forEach((w) => {
      const el = document.createElement("div");
      el.className = "link-word";
      el.textContent = w;
      wordsEl.appendChild(el);
    });

    const input = panel.querySelector(".link-guess input");
    const status = panel.querySelector(".status");
    let tries = 0;

    function solved(message) {
      panel.classList.remove("link-wrong");
      panel.classList.add("link-solved");
      input.readOnly = true;
      status.textContent = message;
    }

    function submit() {
      const guess = input.value.trim();
      if (!guess || input.readOnly) return;
      if (matches(puzzle, guess)) {
        solved(`Yes, they're all ${puzzle.a[0]} words. See you tomorrow.`);
      } else {
        tries++;
        panel.classList.add("link-wrong");
        status.textContent = `Not quite. ${tries} ${tries === 1 ? "try" : "tries"} so far.`;
      }
    }

    input.addEventListener("input", () => panel.classList.remove("link-wrong"));
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });

    panel.querySelector(".hint").addEventListener("click", () => {
      const answer = puzzle.a[0];
      status.textContent = `Hint: it starts with "${answer[0].toUpperCase()}" and has ${answer.length} letters.`;
    });

    panel.querySelector(".reveal").addEventListener("click", () => {
      input.value = puzzle.a[0];
      solved("");
    });
  }

  return { render, PUZZLES, matches };
})();
