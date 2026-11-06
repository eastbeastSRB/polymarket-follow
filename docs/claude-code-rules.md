# Code rules — how code is written here, and the gotchas

READ BEFORE writing code. Append when a rule is set or something bites, with
its date and where it came from. Seeded 2026-11-06 with polymarket-lab's
rules that apply to any project; the skeleton build adds this project's own.
The supervisor owns this file (CLAUDE.md, WHO EDITS WHICH DOC).

## The basics

- **TypeScript strict;** no `any`. Zod schemas are the types (`z.infer`) and
  the database's schema (MongoDB's native driver, no ORM).
- **Parse at the boundary:** every external reply and every stored document
  is Zod-parsed where it enters; a failure is logged and dropped, never
  guessed (Iron Rule 3).
- **Logs through pino,** structured; no `console.log` in app code.
- **Configuration from the environment only** (`.env`, never committed, its
  template `.env.example` committed); no key in code or docs.
- **Pure functions for what a test must pin;** I/O at the edges. One client
  per external API holds its rate budget and back-off in one place (Iron
  Rule 5).
- **No speculative abstraction:** no second copy of something that exists, no
  fallback nothing needs, no parameter no caller passes; names say what a
  thing is.
- **Comments: the delete-the-line test.** If deleting a comment loses nothing
  the code does not already say, delete it. A number in a comment carries its
  date; a pointer to the docs names its anchor (a dated decisions entry or a
  section), so a reader opens one entry, not a whole file.

## Tests

- **Assert every output a branch sets,** not only its summary: a mutant
  survives a test that checks a category but not the numbers behind it.
- **A guard tested only on its happy path is untested:** delete it, run the
  suite, see a test fail.
- **Mutation-check what decides something:** break each rule on purpose and
  see a test fail; a crash or a timeout counts as killed.
- **Build the world a rare rule needs:** a synthetic search finds one
  cheaply; when a search finds none, build it from the rule's algebra.
- **A rule that fixes an instant is read at that instant,** never at the
  caller's later time (polymarket-lab, 2026-11-06: a re-read read late took in
  data that arrived after it).
- **Tests use synthetic data;** a real reply saved as a fixture is trimmed to
  what the test needs and dated.

## This machine (Windows, Git Bash)

- **`pnpm verify` = build + lint + test + format:check, in CI's order;**
  running fewer is how a green session still breaks CI.
- **Git normalises line endings to LF** (`.gitattributes`); Prettier expects
  LF.
- **Write scripts to a file** (`.mjs` or `.cjs`) — `node -e` breaks on
  backticks and quotes in Bash.
- **Use absolute paths;** batched shell calls share one working directory.
- **Run checks with `< /dev/null`, to a file, under `timeout`;** stop a server
  by its port, never by a process name.
