"""Legacy: embed generated JPEG as data URI. Güncel şablon harici görsel kullanıyorsa: patch_banner_to_github_png.py."""
from __future__ import annotations

import base64
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "2026-04-11-tech-summit-26-email.html"
JPG = ROOT / "assets" / "tech-summit-banner-bg.jpg"
CDN = "https://cdn.jsdelivr.net/gh/GDG-Yasar-Software-Team/mail-assets@main/tech-summit-white-bg/banner-bg.jpg"


def main() -> None:
    jpg = JPG.read_bytes()
    data_uri = "data:image/jpeg;base64," + base64.b64encode(jpg).decode("ascii")
    html = HTML.read_text(encoding="utf-8")

    pattern = r'<td class="banner" style="[^"]+">\s*<div class="grid-lines"></div>\s*<svg class="banner-waves"[^>]*>.*?</svg>\s*'

    replacement = (
        f'<td class="banner" bgcolor="#050e24" '
        f'style="position: relative; background-color: #050e24; '
        f"background-image: url('{data_uri}'), url('{CDN}'); "
        f'background-repeat: no-repeat; background-position: center top; '
        f'background-size: 100% 100%; padding: 30px 30px 35px 30px; '
        f'text-align: center; border-bottom: 2px solid #0b2a5c;">\n              '
    )

    new_html, n = re.subn(pattern, replacement, html, count=1, flags=re.DOTALL)
    if n != 1:
        raise SystemExit(f"banner replace failed: {n}")

    HTML.write_text(new_html, encoding="utf-8")
    print(f"Patched {HTML.name} (+{len(data_uri)} chars data URI); upload assets/tech-summit-banner-bg.jpg to mail-assets as tech-summit-white-bg/banner-bg.jpg for CDN fallback.")


if __name__ == "__main__":
    main()
