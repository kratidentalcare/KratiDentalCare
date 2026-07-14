# Learning Notes

Engineering notes written alongside implementation of Krati Dental Care. They capture **why** we made certain decisions—not how to learn a technology from scratch.

These are **not** tutorials. Prefer the docs under `docs/` and `docs/api/` for product/system specs; use this folder to understand trade-offs and patterns actually used in the codebase.

## Purpose

- Explain engineering concepts as they appear in this project.
- Help another developer (or future you) grasp architectural and implementation choices quickly.
- Stay tied to real code: decisions, constraints, and examples from Krati Dental Care only.

## How to write a learning note

- Keep each note to **1–2 pages**. Concise and practical beats exhaustive.
- Cover **only** concepts we actually use here. Skip general theory that does not apply.
- Prefer project language and file paths over abstract pseudocode.
- Update or add a note when a meaningful decision lands in the implementation—not as a separate course.

Every note should include these sections (in order):

1. **Concept** — What the idea is, in a few sentences.
2. **Why we use it in this project** — The problem it solves for this clinic system.
3. **Real project example** — A short, concrete example from our codebase.
4. **Best practices** — What to do when extending or changing related code.
5. **Common mistakes** — Pitfalls that would break conventions or introduce bugs here.
6. **References** — Paths to related project files (and only those).

## Naming convention

Use a zero-padded numeric prefix, then a short kebab-case topic:

```text
NN-topic-name.md
```

Examples:

- `01-mongoose-basics.md`
- `02-schema-vs-model.md`
- `03-indexes.md`
- `04-server-actions.md`
- `05-clerk-auth.md`

Rules:

- Numbers reflect **learning / discovery order**, not priority.
- Topic names should match what someone would search for in this repo.
- One concept (or tight cluster) per file. Split if a note grows past ~2 pages.
