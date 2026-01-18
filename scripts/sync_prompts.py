#!/usr/bin/env python3
"""
Sync AI instruction files to agent-specific filenames.

Reads INSTRUCTIONS.md files from .ai/ directory and copies them to
corresponding project folders with agent-specific names.

Usage:
    python scripts/sync_prompts.py
"""

from pathlib import Path


class Config:
    # Source filename to look for
    source_filename = "INSTRUCTIONS.md"
    # Agent-specific filenames to generate
    agent_files = ("CLAUDE.md", "GEMINI.md", "AGENTS.md")
    # Header added to generated files
    header = "<!-- AUTO-GENERATED from {source_path}; run `make sync-prompts` to update. -->\n\n"
    # Paths
    root_dir = Path(__file__).parent.parent
    ai_dir = root_dir / ".ai"


def main():
    print("🤖 AI Prompt Sync\n")

    updated = 0

    for source in Config.ai_dir.rglob(Config.source_filename):
        rel_source = source.relative_to(Config.root_dir)
        target_dir = Config.root_dir / source.relative_to(Config.ai_dir).parent

        print(f"📄 {rel_source}")

        base_content = Config.header.format(source_path=rel_source) + source.read_text()

        for agent_file in Config.agent_files:
            target = target_dir / agent_file
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(base_content)
            print(f"   → {target.relative_to(Config.root_dir)}")
            updated += 1

    print(f"\n✓ {updated} file(s) updated")


if __name__ == "__main__":
    main()
