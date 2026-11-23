# Make your head talk

The template keeps the original cut-paper animation: one image is repeated in layers, the chin drops, the glasses lift, and links fly from the mouth.

1. Create a front-facing cut-out of **your own** head on a transparent 768 × 768 canvas. Export PNG or WebP. Keep your source photograph outside the repository if you do not want to share it.
2. Use `head-placeholder.svg` as an alignment reference. Place your closed mouth around **y = 632 px**, spanning roughly **x = 300–492 px**. The chin must continue below that seam. This placement matters: the mask is not automatic face detection.
3. Add the file next to `index.html` and set `about.head.src` in `portfolio-content.js`.
4. If you wear glasses, position them within approximately x = 130–637 and y = 323–538. Without glasses, remove `faceGlasses` from the animated layers in the template or adjust its mask so a second copy of your eyes does not lift.
5. Rebuild, open About, hover or tap the head, and inspect the mouth seam. Adjust `.face-upper`, `.face-chin`, `.mouth-gap` and the `chinOutline` SVG in `portfolio.template.html` if your face needs a different crop.

The percentages in the CSS use the full 768-pixel square; 82.2% is approximately 632 pixels. Keep the image square with transparency, rather than cropping the canvas tightly around your face.

Links live in `about.elsewhere`. Keep to four for the supplied composition; longer lists need layout testing. Only use normal `https://` links. The email contact uses `mailto:`.

The original sample head and geometric project SVGs are included under the MIT license. Moushette’s photographic head cut-out is deliberately absent.
