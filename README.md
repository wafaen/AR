# No-Server WebAR Builder

A static WebAR app for image-target AR. It needs no backend/server code. Host these files on GitHub Pages, Netlify, Vercel static hosting, or any HTTPS static host.

## What it does

- `index.html` is the builder.
- `viewer.html` is the AR experience.
- Assets are loaded from external direct HTTPS URLs.
- Supports image overlays, MP4 video overlays, and GLB/GLTF 3D models.

## Workflow

1. Prepare your poster/image marker.
2. Compile it to `targets.mind` using the MindAR Image Target Compiler.
3. Host `targets.mind` online.
4. Host your overlay asset online: PNG/JPG/WebP, MP4, or GLB.
5. Open `index.html`, paste both URLs, and generate an AR viewer link.
6. Turn the viewer link into a QR code.

## Important limits

- Camera access requires HTTPS, except on localhost.
- External asset links must be direct file links, not Google Drive preview pages.
- The file host should allow CORS. GitHub Pages, Netlify, Firebase Storage, Cloudinary, and many CDNs usually work.
- iPhone often blocks video with sound until the user taps. This template starts AR after a tap and uses muted video by default for reliability.
- This is image-target AR, not full world tracking like 8th Wall.

## Best asset formats

- Transparent video: WebM with alpha works in many browsers, but iPhone support is weak. For universal mobile use, use MP4 with normal rectangular video or PNG sequences/GIF-style animation alternatives.
- Normal video: MP4 H.264 is safest.
- 3D: GLB with compressed textures.
