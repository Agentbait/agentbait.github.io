# AgentBait social videos

This folder contains two frame-driven Remotion compositions that reuse the
paper site's visual assets while leaving the website animation unchanged.

- `Landscape35`: 1920x1080, 30 fps, 35 seconds
- `Portrait24`: 1080x1920, 30 fps, 24 seconds

Install and render:

```bash
cd video
npm install
npm run render
```

On macOS, an already-installed Chrome can be used instead of downloading
Chrome Headless Shell:

```bash
npx remotion render src/index.ts Landscape35 output/agentbait-social-16x9.mp4 \
  --codec=h264 --crf=18 --pixel-format=yuv420p --concurrency=1 \
  --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

npx remotion render src/index.ts Portrait24 output/agentbait-social-9x16.mp4 \
  --codec=h264 --crf=18 --pixel-format=yuv420p --concurrency=1 \
  --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

The videos contain no narration or audio track. Generated files in `output/`
are ignored; the public copies live under `public/video/`.
