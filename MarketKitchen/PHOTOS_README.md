# Q&A photos

The 問與答 / Q&A tab has two photo slots. Until you fill them, each shows a dashed "📷 相片稍後補上 / Photo coming soon" box. Use **your own photos taken at the farm or stall**, with the farmer's permission. Don't use pictures from the web.

## What to shoot

| Slot | Shot | Tips |
|---|---|---|
| `holes` | A close-up of **one leaf with insect holes, held in or next to a hand** for scale | Daylight, no flash. Fill most of the frame with the leaf. Plain background (the table or a cloth). Hand at the edge of the frame, not covering the holes. |
| `size` | **A small and a large example of the same vegetable side by side, with a coin next to them** for scale (an HK$1 or HK$5 coin) | Shoot straight down from above. Leave a little space between the two. Keep the coin in the same plane, not in front. |

Landscape or portrait both work. The page shows the photo at full card width (about 330 px on a phone, up to 530 px on a wide screen).

The `holes` photo appears in Q&A question 1 and the `size` photo in question 8 (small or odd-shaped vegetables). Its alt text is that question's wording.

## Recommended size and compression

- **1000 px on the long edge, WebP at quality 70.** That's typically 60–120 KB per photo, about 80–160 KB once embedded.
- Keep both photos together under about 300 KB embedded, so the page stays usable on a slow connection.
- EXIF rotation is applied and then dropped (no GPS or camera data ends up in the page).

## Embed with the helper (recommended)

Needs Python 3 and Pillow (`pip install Pillow`). Run from this folder:

```bash
python3 tools/embed.py photo holes ~/Desktop/leaf-holes.jpg
```

```bash
python3 tools/embed.py photo size ~/Desktop/small-and-large.jpg
```

This resizes to 1000 px, converts to WebP q70, strips metadata and writes it into the `asset-data` block at the end of `index.html`. HEIC from an iPhone only works if Pillow can read it, so export or AirDrop as JPEG first ("Most Compatible" in iPhone camera settings). Check the result:

```bash
python3 tools/embed.py list
```

Remove a photo again:

```bash
python3 tools/embed.py photo holes --clear
```

## Without Python (macOS only)

Resize with the built-in `sips`, then paste a data URI by hand:

```bash
sips -Z 1000 -s format jpeg -s formatOptions 70 ~/Desktop/leaf-holes.jpg --out /tmp/holes.jpg
```

```bash
printf 'data:image/jpeg;base64,%s' "$(base64 -i /tmp/holes.jpg)" | pbcopy
```

Then open `index.html`, find `<script id="asset-data" type="application/json">` near the very end, and put the copied text into the `"photos"` object:

```json
"photos":{"holes":"data:image/jpeg;base64,/9j/4AAQ…"}
```

(Comma between entries, no comma after the last one. JPEG is a little larger than WebP but fine.)

Note: `sips` keeps the photo's metadata. In testing it kept the EXIF orientation tag (which browsers honour, so the photo still shows upright), and it will also keep **GPS location** if the phone recorded it. Either turn off location for the camera before shooting, or use the Python helper, which strips all metadata.

## Check after embedding

Open the page, go to **問與答 / Q&A**, expand question 1 or 4 and confirm the photo shows and is upright. Then re-run the syntax check:

```bash
awk '/^<script>$/{f=1;next}/^<\/script>$/{f=0}f' index.html > /tmp/app.js && node --check /tmp/app.js && echo OK
```
