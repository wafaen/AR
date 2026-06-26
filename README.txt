IMAGE TARGET VIDEO AR APP

WHAT IT DOES
- Scans one image target.
- Places a video exactly over the target frame.
- Video is muted, autoplayed, plays inline on mobile, and loops.
- Start camera button uses a real user tap, which is important for iPhone/Android browser permission rules.

HOW TO USE
1) Open setup.html on HTTPS hosting or local server.
2) Upload your target image and click Compile target.
3) Download targets.mind.
4) Put targets.mind in the assets folder.
5) Put your video in the assets folder and rename it video.mp4.
6) Open config.js and set targetWidth / targetHeight using the values shown by setup.html.
7) Upload the whole folder to HTTPS hosting: GitHub Pages, Netlify, Vercel, etc.
8) Open index.html on your phone, tap Start camera, allow camera, scan the image.

IMPORTANT
- Camera will NOT work from a normal file:// path. Use HTTPS hosting or localhost.
- Mobile autoplay normally requires muted video. This app forces muted autoplay for reliability.
- Keep the target file name exactly: assets/targets.mind
- Keep the video file name exactly: assets/video.mp4
- For iPhone compatibility, export MP4 H.264, AAC audio, web optimized/fast start.

IF CAMERA IS BLACK
- Make sure the site is HTTPS.
- Make sure browser camera permission is allowed.
- Close other apps using the camera.
- On iPhone, test in Safari first.

IF VIDEO DOES NOT COVER TARGET CORRECTLY
- Open config.js.
- Put the real image size/aspect from setup.html.
- Example: targetWidth: 297, targetHeight: 420 for A3 portrait.
