# Kivicube-style Image Target Video AR

Static WebAR app: no backend. It does one thing:

**Scan an image target → display a looping autoplay video exactly on the image frame.**

## Files

- `index.html` — builder + target compiler
- `viewer.html` — mobile AR viewer

## Workflow

1. Open `index.html`.
2. Upload the exact poster/image people will scan.
3. Compile and download `target.mind`.
4. Upload `target.mind` and your `video.mp4` to a public HTTPS host.
5. Paste both direct URLs in the builder.
6. Generate the viewer link.
7. Open the viewer link on mobile and scan the image.

## Important

The target image must be converted into `.mind` format first. A normal JPG/PNG URL is not enough for MindAR image tracking.

## Video settings

Use MP4 H.264 if possible.
The viewer sets the video to:

- autoplay after tap/start
- loop
- muted
- playsinline

Mobile browsers require the first tap before camera/video playback.

## Hosting

GitHub Pages works for the app.
For assets, use direct HTTPS links that allow CORS. GitHub Releases direct download links usually work better than Google Drive/Mega.
