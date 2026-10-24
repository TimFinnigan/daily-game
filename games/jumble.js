window.JumbleGame = (() => {
  const { rng, shuffle, letterBoxes } = window.GameUtil;
  const COUNT = 4;

  const WORDS = [
    "planet", "garden", "bridge", "candle", "orange", "pocket", "silver", "winter",
    "monkey", "rocket", "basket", "button", "castle", "dinner", "forest", "guitar",
    "hammer", "island", "jungle", "kitten", "ladder", "magnet", "napkin", "pepper",
    "ribbon", "spider", "tunnel", "violin", "window", "yellow", "zipper", "anchor",
    "breeze", "cactus", "dragon", "engine", "falcon", "harbor", "jacket", "market",
  ];

  function scramble(word, rand) {
    for (let tries = 0; tries < 20; tries++) {
      const s = shuffle(word.split(""), rand).join("");
      if (s !== word) return s;
    }
    return word.split("").reverse().join("");
  }

  // `data` is the day's word list from puzzles/*.js. Without it, pick from the bank.
  function render(panel, seed, data) {
    const rand = rng("jumble" + seed);
    const words = data || shuffle(WORDS, rand).slice(0, COUNT);
    const puzzles = words.map((word) => ({
      word,
      scrambled: scramble(word, rand),
    }));

    panel.innerHTML = `
      <h2>Jumbles</h2>
      <div class="rows"></div>
      <p class="status" aria-live="polite"></p>
      <div class="actions"><button type="button" class="reveal">Reveal</button></div>
    `;

    const rows = panel.querySelector(".rows");
    const status = panel.querySelector(".status");
    const solved = new Array(words.length).fill(false);

    const items = puzzles.map((p, i) => {
      const row = document.createElement("div");
      row.className = "jumble-row";

      const scrambled = document.createElement("span");
      scrambled.className = "scramble";
      scrambled.textContent = p.scrambled;

      const boxes = letterBoxes(p.word.length, [], () => check(i));
      row.append(scrambled, boxes.el);
      rows.appendChild(row);
      return { ...p, row, boxes };
    });

    function markSolved(i) {
      solved[i] = true;
      items[i].row.classList.remove("wrong");
      items[i].row.classList.add("solved");
      items[i].boxes.lock();
      updateStatus();
    }

    function check(i) {
      const item = items[i];
      const guess = item.boxes.value();
      item.row.classList.remove("wrong");
      if (guess === item.word) {
        markSolved(i);
        const next = items.find((_, j) => !solved[j]);
        if (next) next.boxes.cells[0].focus();
      } else if (guess.length === item.word.length) {
        item.row.classList.add("wrong");
      }
    }

    function updateStatus() {
      const n = solved.filter(Boolean).length;
      status.textContent = n === words.length ? "All solved. See you tomorrow." : "";
    }

    panel.querySelector(".reveal").addEventListener("click", () => {
      items.forEach((item, i) => { item.boxes.set(item.word); markSolved(i); });
      status.textContent = "";
    });

    updateStatus();
  }

  return { render };
})();
