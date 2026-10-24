window.GameUtil = (() => {
  // Small seeded PRNG so everyone gets the same puzzle on the same day.
  function rng(seedStr) {
    let h = 1779033703 ^ seedStr.length;
    for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return () => {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (((h ^= h >>> 16) >>> 0) / 4294967296);
    };
  }

  function shuffle(arr, rand) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }


  // A row of single-letter boxes. Returns the container and helpers.
  function letterBoxes(length, circled, onChange) {
    const wrap = document.createElement("div");
    wrap.className = "boxes";
    const cells = [];

    for (let i = 0; i < length; i++) {
      const cell = document.createElement("input");
      cell.type = "text";
      cell.maxLength = 1;
      cell.autocomplete = "off";
      cell.autocapitalize = "off";
      cell.spellcheck = false;
      if (circled.includes(i)) cell.classList.add("circled");

      cell.addEventListener("input", () => {
        cell.value = cell.value.replace(/[^a-z]/gi, "").toUpperCase();
        if (cell.value && cells[i + 1]) cells[i + 1].focus();
        onChange();
      });
      cell.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !cell.value && cells[i - 1]) {
          cells[i - 1].focus();
          cells[i - 1].select();
        } else if (e.key === "ArrowLeft" && cells[i - 1]) {
          cells[i - 1].focus();
        } else if (e.key === "ArrowRight" && cells[i + 1]) {
          cells[i + 1].focus();
        }
      });
      cell.addEventListener("focus", () => cell.select());

      cells.push(cell);
      wrap.appendChild(cell);
    }

    return {
      el: wrap,
      cells,
      value: () => cells.map((c) => c.value).join("").toLowerCase(),
      set(word) { cells.forEach((c, i) => { c.value = (word[i] || "").toUpperCase(); }); },
      lock() { cells.forEach((c) => { c.readOnly = true; }); },
    };
  }

  return { rng, shuffle, letterBoxes };
})();
