"""Download Tech Summit speaker images, remove background (rembg), flatten to white.

Writes JPEG (no alpha) so e-mail clients never show a transparency “checkerboard”.
Also writes RGB PNG without alpha channel as fallback.

Upload the .jpg files to mail-assets tech-summit/ and point the HTML at those URLs.

  py export_tech_summit_speakers_white_bg.py
"""

from __future__ import annotations

import io
import sys
import urllib.request
from pathlib import Path

from PIL import Image
from rembg import remove

BASE = "https://raw.githubusercontent.com/GDG-Yasar-Software-Team/mail-assets/main/tech-summit"
FILES = [
    "melih.png",
    "izzet.png",
    "tunga.png",
    "sabahat%20(2).png",
    "atakan.png",
]

OUT = Path(__file__).resolve().parent.parent / "output" / "tech-summit-white-bg"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for fname in FILES:
        url = f"{BASE}/{fname}"
        print("fetch", url)
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=120) as resp:
            raw = resp.read()
        try:
            cut = remove(raw, alpha_matting=True)
        except TypeError:
            cut = remove(raw)
        rgba = Image.open(io.BytesIO(cut)).convert("RGBA")
        white = Image.new("RGB", rgba.size, (255, 255, 255))
        white.paste(rgba, mask=rgba.split()[3])
        base = Path(fname.replace("%20", " ")).stem
        jpg = OUT / f"{base}.jpg"
        white.save(jpg, "JPEG", quality=92, optimize=True, subsampling=0)
        print(" ->", jpg)
        png_flat = OUT / f"{base}-flat.png"
        white.save(png_flat, "PNG", optimize=True)
        print(" ->", png_flat)
    print("Done. Upload *.jpg (or *-flat.png) to mail-assets/tech-summit/ — use .jpg in mail HTML.")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(e, file=sys.stderr)
        sys.exit(1)
