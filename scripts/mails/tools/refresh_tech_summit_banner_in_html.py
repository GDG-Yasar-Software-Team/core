"""Replace embedded JPEG data URI in Tech Summit email with assets/tech-summit-banner-bg.jpg."""
from __future__ import annotations

import base64
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "2026-04-11-tech-summit-26-email.html"
JPG = ROOT / "assets" / "tech-summit-banner-bg.jpg"


def main() -> None:
    jpg = JPG.read_bytes()
    payload = base64.b64encode(jpg).decode("ascii")
    text = HTML.read_text(encoding="utf-8")
    new_text, n = re.subn(
        r"url\('data:image/jpeg;base64,[^']+'\)",
        f"url('data:image/jpeg;base64,{payload}')",
        text,
        count=1,
    )
    if n != 1:
        raise SystemExit(f"expected 1 data URI replace, got {n}")
    HTML.write_text(new_text, encoding="utf-8")
    print(f"Updated {HTML.name} with new banner JPEG ({len(jpg) // 1024} KB file).")


if __name__ == "__main__":
    main()
