"""Tech Summit e-posta banner görsel URL'sini güncelle (tek <img>, raw GitHub)."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "2026-04-11-tech-summit-26-email.html"

# Varsayılan: mail-assets kökündeki JPG
BANNER_SRC = (
    "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/"
    "main/7ca42f59-9529-4b81-b03b-4bbadb5db9aa.jpg"
)


def main() -> None:
    text = HTML.read_text(encoding="utf-8")
    # Güncel: class="banner-hero-img" src='...'
    pat_img = (
        r'(<img class="banner-hero-img" src=")'
        r"https://raw\.githubusercontent\.com/[^\"]+"
        r'(" alt=")'
    )
    new_text, n1 = re.subn(pat_img, rf"\1{BANNER_SRC}\2", text, count=1)

    # Eski: td üzerinde background-image çifti
    pat_bg = (
        r"background-image: url\('https://raw\.githubusercontent\.com/[^']+'\), "
        r"url\('https://cdn\.jsdelivr\.net/[^']+'\);"
    )
    if n1 == 0:
        new_text, n2 = re.subn(
            pat_bg,
            f"background-image: url('{BANNER_SRC}'), url('{BANNER_SRC}');",
            text,
            count=1,
        )
        if n2 != 1:
            raise SystemExit("banner replace failed (no banner-hero-img or background-image match)")

    HTML.write_text(new_text, encoding="utf-8")
    print(f"Patched {HTML.name}: banner src (or legacy background).")


if __name__ == "__main__":
    main()
