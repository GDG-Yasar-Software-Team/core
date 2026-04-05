from pathlib import Path
import re

p = Path(__file__).resolve().parent.parent / "2026-04-11-tech-summit-26-email.html"
t = p.read_text(encoding="utf-8")

def swap(m: re.Match) -> str:
    a, b = m.group(1), m.group(2)
    return f"background-image: url('{b}'), url('{a}');"

t2, n = re.subn(
    r"background-image: url\('([^']+)'\), url\('([^']+)'\);",
    swap,
    t,
    count=1,
)
if n != 1:
    raise SystemExit(f"swap failed {n}")
p.write_text(t2, encoding="utf-8")
print("ok")
