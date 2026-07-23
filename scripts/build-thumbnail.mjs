import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(projectRoot, "public");

const card = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f0eee8"/>
  <rect width="1200" height="9" fill="#17344f"/>
  <rect x="699" y="39" width="457" height="546" fill="#e9e5dd"/>
  <line x1="676" y1="39" x2="676" y2="585" stroke="#9b9992" stroke-width="1"/>

  <text x="96" y="70" fill="#17344f" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" letter-spacing="2.6">AGENTBAIT</text>
  <text x="96" y="91" fill="#6f6d68" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="600" letter-spacing="1.8">RESEARCH PROJECT</text>

  <text x="56" y="168" fill="#17344f" font-family="Georgia, 'Times New Roman', serif" font-size="62" font-weight="600" letter-spacing="-2.2">You Won't Believe</text>
  <text x="56" y="231" fill="#17344f" font-family="Georgia, 'Times New Roman', serif" font-size="62" font-weight="600" letter-spacing="-2.2">This Click</text>
  <text x="58" y="270" fill="#4f718a" font-family="Georgia, 'Times New Roman', serif" font-size="23" font-style="italic">Content rewriting for agentic choice</text>

  <line x1="56" y1="307" x2="625" y2="307" stroke="#9b9992" stroke-width="1"/>
  <text x="56" y="340" fill="#bc493f" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" letter-spacing="2.1">SAME SLATE · ONE REWRITE</text>
  <text x="56" y="373" fill="#17344f" font-family="Georgia, 'Times New Roman', serif" font-size="24" font-weight="600">When AI agents decide what people see,</text>
  <text x="56" y="403" fill="#17344f" font-family="Georgia, 'Times New Roman', serif" font-size="24" font-weight="600">presentation becomes an optimization target.</text>

  <text x="56" y="440" fill="#6f6d68" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" letter-spacing="1.6">TARGET SELECTION</text>
  <text x="56" y="492" fill="#6f6d68" font-family="Georgia, 'Times New Roman', serif" font-size="54" font-weight="600">17.1%</text>
  <line x1="240" y1="472" x2="335" y2="472" stroke="#bc493f" stroke-width="3"/>
  <path d="M335 472 L319 463 M335 472 L319 481" fill="none" stroke="#bc493f" stroke-width="3" stroke-linecap="square"/>
  <text x="359" y="492" fill="#17344f" font-family="Georgia, 'Times New Roman', serif" font-size="54" font-weight="600">98.5%</text>

  <line x1="56" y1="535" x2="625" y2="535" stroke="#d3cfc6" stroke-width="1"/>
  <text x="56" y="568" fill="#17344f" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="600">Tianyi Jin · Zirui Wang · David M. Chan</text>
  <text x="56" y="590" fill="#6f6d68" font-family="Arial, Helvetica, sans-serif" font-size="11" letter-spacing="1.2">UNIVERSITY OF CALIFORNIA, BERKELEY</text>

  <text x="727" y="79" fill="#17344f" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" letter-spacing="1.8">FIXED CANDIDATE SLATE</text>
  <text x="1128" y="79" fill="#6f6d68" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="700" letter-spacing="1.4" text-anchor="end">TARGET AGENT</text>

  <rect x="727" y="103" width="402" height="104" fill="#f0eee8" stroke="#9b9992"/>
  <text x="748" y="133" fill="#17344f" font-family="Georgia, 'Times New Roman', serif" font-size="25" font-weight="600">A</text>
  <text x="790" y="130" fill="#6f6d68" font-family="Arial, Helvetica, sans-serif" font-size="9" font-weight="700" letter-spacing="1.4">CANDIDATE</text>
  <rect x="790" y="145" width="280" height="8" fill="#4f718a" opacity=".62"/>
  <rect x="790" y="163" width="237" height="6" fill="#9b9992" opacity=".46"/>
  <rect x="790" y="178" width="185" height="6" fill="#9b9992" opacity=".35"/>

  <rect x="727" y="222" width="402" height="145" fill="#ecddd9" stroke="#bc493f" stroke-width="2"/>
  <rect x="727" y="222" width="6" height="145" fill="#bc493f"/>
  <text x="748" y="254" fill="#bc493f" font-family="Georgia, 'Times New Roman', serif" font-size="25" font-weight="600">B</text>
  <text x="790" y="251" fill="#bc493f" font-family="Arial, Helvetica, sans-serif" font-size="9" font-weight="700" letter-spacing="1.4">TARGET · REWRITTEN</text>
  <rect x="790" y="268" width="294" height="9" fill="#17344f" opacity=".82"/>
  <rect x="790" y="287" width="255" height="7" fill="#4f718a" opacity=".55"/>
  <rect x="790" y="304" width="211" height="7" fill="#4f718a" opacity=".4"/>
  <circle cx="796" cy="339" r="7" fill="#bc493f"/>
  <text x="814" y="343" fill="#bc493f" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" letter-spacing="1.7">SELECTED</text>

  <rect x="727" y="382" width="402" height="104" fill="#f0eee8" stroke="#9b9992"/>
  <text x="748" y="412" fill="#17344f" font-family="Georgia, 'Times New Roman', serif" font-size="25" font-weight="600">C</text>
  <text x="790" y="409" fill="#6f6d68" font-family="Arial, Helvetica, sans-serif" font-size="9" font-weight="700" letter-spacing="1.4">CANDIDATE</text>
  <rect x="790" y="424" width="266" height="8" fill="#4f718a" opacity=".62"/>
  <rect x="790" y="442" width="226" height="6" fill="#9b9992" opacity=".46"/>
  <rect x="790" y="457" width="174" height="6" fill="#9b9992" opacity=".35"/>

  <line x1="727" y1="512" x2="1129" y2="512" stroke="#9b9992" stroke-width="1"/>
  <text x="727" y="540" fill="#17344f" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="700" letter-spacing="1.3">ONLY B'S PRESENTATION CHANGES</text>
  <text x="727" y="562" fill="#6f6d68" font-family="Arial, Helvetica, sans-serif" font-size="10">Same identities · order · chooser</text>
  <circle cx="1113" cy="545" r="10" fill="#bc493f"/>
  <path d="M1108 545 L1112 549 L1119 540" fill="none" stroke="#f0eee8" stroke-width="2" stroke-linecap="square"/>
</svg>`;

const mark = await sharp(await readFile(path.join(publicDir, "agentbait-mark.png")))
  .trim()
  .resize({ height: 52 })
  .png()
  .toBuffer();

const ogBuffer = await sharp(Buffer.from(card))
  .composite([{ input: mark, left: 57, top: 38 }])
  .png({ compressionLevel: 9, palette: true })
  .toBuffer();

await sharp(ogBuffer).toFile(path.join(publicDir, "og.png"));
await sharp(ogBuffer)
  .flatten({ background: "#f0eee8" })
  .jpeg({ quality: 91, chromaSubsampling: "4:4:4" })
  .toFile(path.join(publicDir, "screenshot.jpeg"));

console.log("Built public/og.png and public/screenshot.jpeg at 1200×630.");
