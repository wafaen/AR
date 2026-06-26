# Image Video AR

Static WebAR app for one job:

**Scan an image target → show a video exactly on top of that image → autoplay and loop.**

No backend. No VR UI. No server code.

## Files

- `index.html` — builder + image to `.mind` compiler + AR link generator
- `viewer.html` — camera/image tracking viewer

## Workflow

1. Open `index.html` on HTTPS hosting.
2. Upload your target image.
3. Click **Compile .mind target**.
4. Download `target.mind`.
5. Upload `target.mind` to a host that gives a direct HTTPS URL with CORS.
6. Upload your MP4 video to a host with a direct HTTPS URL.
7. Paste both URLs in the builder.
8. Keep **Autoplay** and **Loop** checked.
9. Generate the viewer link.
10. Open the viewer link on mobile, tap **Start camera**, allow camera, scan the image.

## Important

The `.mind` target is not the same thing as a JPG/PNG. The target image must be compiled first.

Video should be MP4/H.264, muted for autoplay compatibility on mobile.

GitHub Pages works for the app, but large video files are better hosted elsewhere.

## Requirements

- HTTPS is required for camera access.
- Direct file URLs are required.
- CORS must be enabled for `.mind` target files.
