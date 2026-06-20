# Gemini agent notes

**All project guidance — architecture, conventions, commands, invariants — lives in
[AGENTS.md](AGENTS.md).** Read it first. This file is a thin pointer; AGENTS.md is the
single source of truth and is kept up to date.

## code-review-graph plugin

This project has a knowledge graph maintained by the **code-review-graph plugin**
(a lifecycle-hook plugin in this opencode install — not an MCP server). It keeps
a SQLite graph at `.code-review-graph/graph.db` updated on file edits and exposes
a `code-review-graph` CLI.

**Use the graph before Grep/Glob/Read for structural questions** — it's faster and
gives caller/dependent/callee context that file scanning cannot. Drive it via the
`code-review-graph` CLI (`status`, `detect-changes`, `visualize`) or by querying
`.code-review-graph/graph.db` directly with `sqlite3`/`python3 -c "import sqlite3"`.

Note: this project has **no test suite** (no test framework, zero test-flagged nodes
in the graph) — do not rely on test-coverage tooling here.
