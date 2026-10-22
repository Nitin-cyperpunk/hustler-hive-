# Hustlers Hive website assets

Theme: dark cinematic navy/black, electric cyan, vibrant yellow, with warm amber Nashik heritage imagery.

## Included generated assets

- `public/images/nashik/kalaram-temple-cinematic-ai.png` — AI-generated cinematic temple-inspired visual. Use as a decorative hero/feature background; it is not documentary evidence or an exact photograph of the real temple.
- `public/images/nashik/godavari-ghats-cinematic-ai.png` — AI-generated riverside-ghat visual. Use as a decorative background/section image; not an exact documentary photograph of Nashik.
- `public/images/textures/tech-grain-cyan-yellow.png` — AI-generated abstract texture for overlays, section backgrounds, or decorative panels.

These three generated files are provided for use in the Hustlers Hive website. Check the image dimensions and optimize for web delivery before production; prefer WebP/AVIF derivatives for large backgrounds.

## Real Nashik photography (download separately)

The build environment could not fetch Wikimedia Commons image binaries, so these are links to the original file pages rather than falsely claiming the photos are included in this ZIP:

1. **Kalaram Temple, Panchavati, Nashik** — photographer K. Venkataramana; CC0 1.0. Commercial use and modification permitted; attribution not required but appreciated.
   - File page: https://commons.wikimedia.org/wiki/File:Kalaram_Temple,_Panchavati,_Nashik.jpg
   - Original download: https://commons.wikimedia.org/wiki/Special:FilePath/Kalaram_Temple%2C_Panchavati%2C_Nashik.jpg
   - Suggested filename: `public/images/nashik/kalaram-temple-real-cc0.jpg`

2. **Kalaram Temple, Nashik** — photographer Arpita Tripathy; CC BY-SA 4.0. Provide attribution, link the license, note changes, and follow ShareAlike terms if distributing an adapted image.
   - File page: https://commons.wikimedia.org/wiki/File:Kalaram_Temple,_Nashik.jpg
   - License: https://creativecommons.org/licenses/by-sa/4.0/
   - Suggested filename: `public/images/nashik/kalaram-temple-vertical-cc-by-sa.jpg`

3. **Panchavati–Ramkund** — Wikimedia Commons file page/category. Confirm the specific file's license before production use; licenses vary by image.
   - Category: https://commons.wikimedia.org/wiki/Category:Panchavati,_Nashik
   - Suggested filename after verifying license: `public/images/nashik/ramkund-ghats-photo.jpg`

## Suggested folder layout

```text
public/images/
  nashik/
    kalaram-temple-cinematic-ai.png
    godavari-ghats-cinematic-ai.png
    kalaram-temple-real-cc0.jpg       # download from linked source
    kalaram-temple-vertical-cc-by-sa.jpg # optional, obey CC BY-SA
    ramkund-ghats-photo.jpg           # optional, verify exact license
  backgrounds/
  textures/
    tech-grain-cyan-yellow.png
```

## Suggested use

- Hero: `nashik/godavari-ghats-cinematic-ai.png` with a dark CSS gradient overlay.
- Local identity / story section: prefer the real Kalaram Temple photograph once downloaded; use the generated temple visual only as an atmospheric alternate.
- Decorative overlays: `textures/tech-grain-cyan-yellow.png`, with low opacity and `pointer-events: none`.

## Credits to keep with the project

See the source links above. If you use the CC BY-SA photograph, include a visible or accessible credits page and indicate any crop/color edits. Do not label AI-generated images as real photographs.
