window.TriviaGame = (() => {
  const { rng, shuffle } = window.GameUtil;
  const COUNT = 4;

  // q: question, a: accepted answers (compared after normalising case, accents and "the").
  const QUESTIONS = [
    { q: "What is the capital of Australia?", a: ["canberra"] },
    { q: "What is the capital of Canada?", a: ["ottawa"] },
    { q: "What is the capital of Brazil?", a: ["brasilia"] },
    { q: "What is the capital of Turkey?", a: ["ankara"] },
    { q: "Which river flows through Cairo?", a: ["nile", "river nile"] },
    { q: "Which river flows through Paris?", a: ["seine", "river seine"] },
    { q: "Which river flows through London?", a: ["thames", "river thames"] },
    { q: "Which river flows through Baghdad?", a: ["tigris", "river tigris"] },
    { q: "What is the longest river in South America?", a: ["amazon", "river amazon"] },
    { q: "What is the longest river in Europe?", a: ["volga", "river volga"] },
    { q: "In which city is the Colosseum?", a: ["rome"] },
    { q: "In which city is the Sagrada Familia?", a: ["barcelona"] },
    { q: "In which country is the Taj Mahal?", a: ["india"] },
    { q: "In which country is the Great Wall?", a: ["china"] },
    { q: "Which civilisation built Machu Picchu?", a: ["inca", "incas", "inca empire"] },
    { q: "Which ancient wonder near Cairo is the only one still standing?", a: ["great pyramid", "great pyramid of giza", "pyramid", "pyramids", "pyramids of giza"] },
    { q: "Which is the largest ocean?", a: ["pacific", "pacific ocean"] },
    { q: "Which is the largest hot desert in the world?", a: ["sahara", "sahara desert"] },
    { q: "What is the smallest country in the world?", a: ["vatican city", "vatican"] },
    { q: "In which country is Mount Kilimanjaro?", a: ["tanzania"] },
    { q: "Which strait separates Spain from Morocco?", a: ["gibraltar", "strait of gibraltar"] },
    { q: "In which country is the city of Marrakech?", a: ["morocco"] },
    { q: "Who was the first President of the United States?", a: ["george washington", "washington"] },
    { q: "In what year did the Berlin Wall fall?", a: ["1989"] },
    { q: "In what year did the Titanic sink?", a: ["1912"] },
    { q: "Who was the first person to walk on the Moon?", a: ["neil armstrong", "armstrong"] },
    { q: "Who painted the Mona Lisa?", a: ["leonardo da vinci", "leonardo", "da vinci"] },
  ];

  function normalise(text) {
    return text
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/^the /, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // `data` is the day's questions from puzzles/*.js. Without it, pick from the bank.
  function render(panel, seed, data) {
    const picks = data || shuffle(QUESTIONS, rng("trivia" + seed)).slice(0, COUNT);

    panel.innerHTML = `
      <h2>Trivia</h2>
      <div class="rows"></div>
      <p class="status" aria-live="polite"></p>
      <div class="actions"><button type="button" class="reveal">Reveal</button></div>
    `;

    const rows = panel.querySelector(".rows");
    const status = panel.querySelector(".status");
    const inputs = [];
    const solved = new Array(picks.length).fill(false);

    picks.forEach((item, i) => {
      const row = document.createElement("div");
      row.className = "trivia-row";
      row.innerHTML = `
        <p class="trivia-q"><span class="num">${i + 1}.</span> <span class="text"></span></p>
        <input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Answer ${i + 1}">
      `;
      row.querySelector(".text").textContent = item.q;
      const input = row.querySelector("input");
      inputs.push(input);

      function check(final) {
        const guess = normalise(input.value);
        row.classList.remove("wrong");
        if (item.a.includes(guess)) {
          markSolved(i);
          const next = inputs.find((el) => !el.readOnly);
          if (next && final) next.focus();
        } else if (final && guess) {
          row.classList.add("wrong");
        }
      }

      input.addEventListener("input", () => check(false));
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") check(true); });
      input.addEventListener("blur", () => check(true));

      rows.appendChild(row);
    });

    function markSolved(i) {
      if (solved[i]) return;
      solved[i] = true;
      inputs[i].readOnly = true;
      inputs[i].closest(".trivia-row").classList.remove("wrong");
      inputs[i].closest(".trivia-row").classList.add("solved");
      updateStatus();
    }

    function updateStatus() {
      const n = solved.filter(Boolean).length;
      status.textContent = n === picks.length ? "Perfect score. See you tomorrow." : "";
    }

    panel.querySelector(".reveal").addEventListener("click", () => {
      picks.forEach((item, i) => {
        inputs[i].value = item.a[0].replace(/\b\w/g, (c) => c.toUpperCase());
        markSolved(i);
      });
      status.textContent = "";
    });

    updateStatus();
  }

  return { render, QUESTIONS, normalise };
})();
