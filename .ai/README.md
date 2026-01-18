# AI Prompts

Central place for AI agent instructions. For now we keep a single, repo-wide source file at [`./INSTRUCTIONS.md`](./INSTRUCTIONS.md) and generate agent-specific copies at the repo root (e.g., [`../AGENTS.md`](../AGENTS.md), [`../CLAUDE.md`](../CLAUDE.md), [`../GEMINI.md`](../GEMINI.md)) so every tool reads the same guidance.

## Why we generate files (no symlinks)

- Windows symlinks are brittle; Git on Windows disables them by default.
- Cursor currently misbehaves when prompts are symlinked (across OSes).
- Plain files keep tooling predictable everywhere.

## Supported agent outputs

| Agent       | Generated file |
| ----------- | -------------- |
| Claude      | `CLAUDE.md`    |
| Cursor      | `AGENTS.md`    |
| Codex       | `AGENTS.md`    |
| Gemini      | `GEMINI.md`    |
| Antigravity | `GEMINI.md`    |

## Supported sources

- Global (current): [`./INSTRUCTIONS.md`](./INSTRUCTIONS.md) -> repo root
- Service-specific (future): `./<service>/INSTRUCTIONS.md` -> `../<service>/`

## Edit flow

1. Update the source: [`./INSTRUCTIONS.md`](./INSTRUCTIONS.md).
2. Optional: run `make sync-prompts` locally; otherwise just push—CI will regenerate and commit the outputs for you.
3. The script writes the agent files beside the matching target directory with a provenance header.

## CI sync

- On pull requests that touch `.ai/**` or [`scripts/sync_prompts.py`](../scripts/sync_prompts.py), the [`sync-ai-prompts`](../.github/workflows/sync-ai-prompts.yaml) workflow regenerates and commits the outputs to the PR branch.

## Conventions

- Keep instructions concise and actionable; prefer tables/checklists over prose.
- Never hand-edit generated files—always change the source and re-sync.

## Keeping prompts fresh

- If an agent behaves unexpectedly or guidance drifts, update `INSTRUCTIONS.md` here first, then re-sync (or open a PR and let CI regenerate). Treat these docs as living; keeping them current avoids debugging stale prompts.

## Adding a new agent

- Add its filename to `agent_files` in [`scripts/sync_prompts.py`](../scripts/sync_prompts.py).
- Update the table above to document it.
- Re-run sync (or just push a PR) so CI generates the new file.
- Quick tests: ask “Start by loading the repository instructions you ALREADY have and summarize the top 5 rules; if none are loaded, say so before searching.” The agent should answer directly from the loaded prompt without manual file search or extra read calls.
