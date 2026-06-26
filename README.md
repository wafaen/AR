# Kivicube-style Image Target Video AR

Static WebAR app for this workflow:

1. Upload/choose a target image.
2. Convert it in the browser to `target.mind`.
3. Upload `target.mind` and your video to any host that gives direct HTTPS URLs.
4. Generate a viewer link.
5. Scan the image: the video appears on the image frame, autoplaying and looping.

## Files

- `index.html` — builder + target image to `.mind` converter.
- `viewer.html` — AR camera viewer.

## Hosting

Upload both files to GitHub Pages, Netlify, or any HTTPS static host.

## Important

- The app must run on HTTPS for camera access.
- Video URL and `.mind` URL must be direct file URLs.
- The host must allow CORS.
- Mobile autoplay generally requires the video to be muted.
- For perfect frame matching, export the video in the same aspect ratio as the scanned target image.

## Libraries

Uses MindAR image tracking + A-Frame from CDN.
