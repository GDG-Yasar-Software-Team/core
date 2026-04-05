"""Generate email-safe Tech Summit banner background (no grid — soft wave glows only)."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

W, H = 1200, 520
BG = (5, 14, 36, 255)


def _blob(w: int, h: int, cx: float, cy: float, rx: float, ry: float, rgba: tuple[int, int, int, int], blur: int) -> Image.Image:
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(layer).ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=rgba)
    return layer.filter(ImageFilter.GaussianBlur(blur))


def main() -> None:
    out_dir = Path(__file__).resolve().parent.parent / "assets"
    out_dir.mkdir(parents=True, exist_ok=True)
    png_path = out_dir / "tech-summit-banner-bg.png"
    jpg_path = out_dir / "tech-summit-banner-bg.jpg"

    img = Image.new("RGBA", (W, H), BG)

    # Orta üst: yumuşak spot (metin alanı)
    spot = _blob(W, H, W * 0.5, H * 0.35, W * 0.55, H * 0.55, (26, 95, 212, 38), 95)
    img = Image.alpha_composite(img, spot)

    # Sol kenar: dikey “dalga” hissi — üst üste binecek büyük bulanık lekeler
    left_specs = [
        (-120, H * 0.12, 380, 220, (30, 110, 255, 72), 55),
        (40, H * 0.42, 280, 200, (20, 85, 230, 55), 48),
        (-60, H * 0.72, 320, 180, (45, 140, 255, 48), 52),
    ]
    for cx, cy, rx, ry, col, bl in left_specs:
        layer = _blob(W, H, cx, cy, rx, ry, col, bl)
        img = Image.alpha_composite(img, layer)

    # Sağ kenar: ayna dalgalar
    right_specs = [
        (W + 120, H * 0.12, 380, 220, (30, 110, 255, 72), 55),
        (W - 40, H * 0.42, 280, 200, (20, 85, 230, 55), 48),
        (W + 60, H * 0.72, 320, 180, (45, 140, 255, 48), 52),
    ]
    for cx, cy, rx, ry, col, bl in right_specs:
        layer = _blob(W, H, cx, cy, rx, ry, col, bl)
        img = Image.alpha_composite(img, layer)

    # İnce üst şerit parıltısı (kare değil, geniş yatay yay)
    ribbon = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ribbon)
    rd.ellipse((W * 0.05, -H * 0.35, W * 0.95, H * 0.45), fill=(80, 150, 255, 35))
    ribbon = ribbon.filter(ImageFilter.GaussianBlur(70))
    img = Image.alpha_composite(img, ribbon)

    img.save(png_path, "PNG", optimize=True)
    rgb = img.convert("RGB")
    rgb.save(jpg_path, "JPEG", quality=84, optimize=True)
    print(f"Wrote {png_path} ({png_path.stat().st_size // 1024} KB)")
    print(f"Wrote {jpg_path} ({jpg_path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
