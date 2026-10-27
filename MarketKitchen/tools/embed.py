#!/usr/bin/env python3
"""Embed images into index.html's <script id="asset-data"> block as WebP data URIs.

Needs Python 3 and Pillow (pip install Pillow).

  # Ultra Secret Rare art -> art/<id>.webp (one file per card, loaded on demand)
  python3 tools/embed.py ultra path/to/ITSPROJECT/src/assets

  # A Q&A photo slot ("holes" or "size")
  python3 tools/embed.py photo holes ~/Desktop/leaf-holes.jpg

  # Remove a Q&A photo again
  python3 tools/embed.py photo holes --clear

  # Show what is embedded and how big it is
  python3 tools/embed.py list
"""
import base64, io, json, os, re, sys

from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
INDEX = os.path.join(HERE, "..", "index.html")
PHOTO_SLOTS = ["holes", "size"]
ULTRA_SIZE = (560, 784)   # 1280x1792 source, same 5:7 ratio; ~1.8x the 310 pt card width
ULTRA_Q = 62
PHOTO_MAX = 1000          # longest edge in px
PHOTO_Q = 70
BLOCK = re.compile(r'(<script id="asset-data" type="application/json">)(.*?)(</script>)', re.S)


def read():
    html = open(INDEX, encoding="utf-8").read()
    m = BLOCK.search(html)
    if not m:
        sys.exit("asset-data block not found in index.html")
    return html, m, json.loads(m.group(2))


def write(html, m, data):
    payload = json.dumps(data, separators=(",", ":"))
    out = html[: m.start(2)] + payload + html[m.end(2):]
    open(INDEX, "w", encoding="utf-8").write(out)
    print("index.html: %d bytes" % len(out.encode("utf-8")))


def webp_uri(im, quality):
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=quality, method=6)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode("ascii"), buf.tell()


def ultra(src):
    """Write art/<id>.webp for every *_secret image in a folder (any depth), e.g. the repo's src/assets.
    The page loads these files on demand; they are no longer embedded in index.html."""
    out_dir = os.path.join(HERE, "..", "art")
    os.makedirs(out_dir, exist_ok=True)
    src = os.path.expanduser(src)
    n = 0
    for root, _, files in os.walk(src):
        for f in files:
            m = re.match(r"(.+?)(_secret)?\.(jpe?g|png)$", f, re.I)
            if not m:
                continue
            vid = m.group(1).lower()
            im = ImageOps.exif_transpose(Image.open(os.path.join(root, f))).convert("RGB")
            im = ImageOps.fit(im, ULTRA_SIZE, Image.LANCZOS)
            out = os.path.join(out_dir, vid + ".webp")
            im.save(out, "WEBP", quality=ULTRA_Q, method=6)
            n += 1
            print("%-18s -> art/%s.webp (%d bytes)" % (f, vid, os.path.getsize(out)))
    print("%d images written. Check each file name matches a VEG id in index.html." % n)


def photo(slot, path):
    if slot not in PHOTO_SLOTS:
        sys.exit("slot must be one of: " + ", ".join(PHOTO_SLOTS))
    html, m, data = read()
    data.setdefault("photos", {})
    if path == "--clear":
        data["photos"].pop(slot, None)
    else:
        im = ImageOps.exif_transpose(Image.open(os.path.expanduser(path))).convert("RGB")
        im.thumbnail((PHOTO_MAX, PHOTO_MAX), Image.LANCZOS)
        data["photos"][slot], n = webp_uri(im, PHOTO_Q)
        print("%s: %dx%d, %d bytes" % (slot, im.width, im.height, n))
    write(html, m, data)


def show():
    html, m, data = read()
    for group in ("ultra", "photos"):
        for k, v in sorted(data.get(group, {}).items()):
            print("%-7s %-12s %7d chars" % (group, k, len(v)))
    print("index.html: %d bytes (asset block %d)" % (len(html.encode("utf-8")), len(m.group(2))))


if __name__ == "__main__":
    a = sys.argv[1:]
    if a[:1] == ["ultra"] and len(a) == 2:
        ultra(a[1])
    elif a[:1] == ["photo"] and len(a) == 3:
        photo(a[1], a[2])
    elif a[:1] == ["list"]:
        show()
    else:
        print(__doc__)
        sys.exit(1)
