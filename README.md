# Kivicube-style Static WebAR Video Overlay

A no-server WebAR app for the classic AR poster workflow:

- scan an image target
- display an MP4 video exactly on top of the scanned image frame
- autoplay + loop
- pause when the image is lost
- hosted as plain static files on GitHub Pages, Netlify, etc.

## Files

- `index.html` — builder page
- `viewer.html` — AR viewer page
- `builder.js` — creates viewer links
- `viewer.js` — MindAR/A-Frame video overlay logic
- `style.css` — UI styles

## Workflow

1. Prepare your poster/image target.
2. Compile it into a `.mind` file using the MindAR Image Target Compiler.
3. Host the `.mind` file and your `.mp4` video online.
4. Open `index.html`, paste both direct URLs, and generate the viewer link.
5. Put the viewer link behind a QR code.

## Important hosting rules

Your files must be loaded from:

- HTTPS URLs
- direct file links, not preview pages
- hosts that allow CORS

For the video, use MP4/H.264 for the best mobile compatibility.

## Notes

Mobile browsers usually require one user tap before video playback. This app uses a Start AR button to satisfy that rule, then the video plays automatically when the target is detected.
