#!/usr/bin/env python3
"""Bundle the academy into one self-contained HTML file.

Usage:
    python3 tools/build_single.py            # writes dist/ai-agents-academy.html
    python3 tools/build_single.py --fragment # also writes dist/artifact.html (no <html>/<head> wrapper)

The single file works offline (fonts fall back to system fonts) and can be
emailed, opened from a USB stick, or previewed without a web server.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"


def main() -> None:
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    css = (ROOT / "assets/css/academy.css").read_text(encoding="utf-8")
    html = html.replace('<link rel="stylesheet" href="assets/css/academy.css">', f"<style>\n{css}\n</style>")
    icon = (ROOT / "assets/img/favicon.svg").read_text(encoding="utf-8")
    import base64
    html = html.replace('href="assets/img/favicon.svg"', 'href="data:image/svg+xml;base64,' + base64.b64encode(icon.encode()).decode() + '"')

    start, end = "<!-- BUNDLE:START", "<!-- BUNDLE:END -->"
    a, b = html.index(start), html.index(end) + len(end)
    block = html[a:b]
    scripts = re.findall(r'<script src="([^"]+)"></script>', block)
    js = "\n".join(
        f"/* ---- {s} ---- */\n" + (ROOT / s).read_text(encoding="utf-8").replace("</script", "<\\/script")
        for s in scripts
    )
    html = html[:a] + f"<script>\n{js}\n</script>" + html[b:]

    # Inline lesson screenshots (assets/img/shots/*) as data: URIs. Pages serves them as files instead.
    mime = {"webp": "image/webp", "png": "image/png", "jpg": "image/jpeg", "svg": "image/svg+xml"}
    def inline_shot(m):
        f = ROOT / m.group(0)
        return f"data:{mime[f.suffix[1:]]};base64," + base64.b64encode(f.read_bytes()).decode()
    html = re.sub(r"assets/img/shots/[A-Za-z0-9_.-]+\.(?:webp|png|jpg|svg)", inline_shot, html)

    DIST.mkdir(exist_ok=True)
    out = DIST / "ai-agents-academy.html"
    out.write_text(html, encoding="utf-8")
    print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB, {len(scripts)} scripts inlined)")

    if "--fragment" in sys.argv:
        head = re.search(r"<head>(.*?)</head>", html, re.S).group(1)
        body = re.search(r"<body>(.*)</body>", html, re.S).group(1)
        keep = "\n".join(
            line for line in head.splitlines()
            if not re.search(r'<meta charset|name="viewport"', line)
        )
        frag = DIST / "artifact.html"
        frag.write_text(keep + "\n" + body, encoding="utf-8")
        print(f"wrote {frag.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
