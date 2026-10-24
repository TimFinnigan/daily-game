# Daily Game

A minimal newspaper-style page of four daily puzzles: Trivia, Connections, Prefixes and Jumble. It is a static site, so open `index.html` or host it anywhere.

## Daily puzzles

Each month has one file, `puzzles/YYYY-MM.js`, with an entry per date:

```js
"2026-11-01": {
  trivia: [{"q": "What is the capital of Spain?", "a": ["madrid"]}, ...],  // 4 questions
  jumble: ["apple", "brave", "chair", "dream"],                              // 4 words
  connection: {"words": ["stack", "deck", "shuffle", "trump"], "a": ["cards", "card"]},
  prefix: {"answer": "star", "items": ["fish", "light", "ship", "board"]},
},
```

If a date has no entry, each game falls back to a small built-in bank, so the page always works.

Trivia answers must be lowercase with no punctuation and no leading "the" (the game normalises what people type the same way).

## Checking puzzles

```
node scripts/validate.js
```

It fails on structural problems (wrong counts, answers that can never match, anagram clashes) and warns about missing days, repeats and compound words not in the system dictionary.

## Previewing or printing another day

Add `?date=2026-11-05` to the URL.
