import sharp from 'sharp';

const input = process.argv[2];
const output = process.argv[3];
if (!input || !output) throw new Error('Usage: node scripts/remove-checkerboard.mjs input.png output.png');

const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const count = width * height;
const seen = new Uint8Array(count);
const queue = new Int32Array(count);
let head = 0, tail = 0;

function backgroundLike(i) {
  const p = i * channels;
  const r = data[p], g = data[p + 1], b = data[p + 2];
  return Math.min(r, g, b) > 205 && Math.max(r, g, b) - Math.min(r, g, b) < 22;
}
function push(i) {
  if (!seen[i] && backgroundLike(i)) { seen[i] = 1; queue[tail++] = i; }
}
for (let x = 0; x < width; x++) { push(x); push((height - 1) * width + x); }
for (let y = 0; y < height; y++) { push(y * width); push(y * width + width - 1); }
while (head < tail) {
  const i = queue[head++], x = i % width, y = (i / width) | 0;
  if (x) push(i - 1); if (x + 1 < width) push(i + 1);
  if (y) push(i - width); if (y + 1 < height) push(i + width);
}

const rgba = Buffer.alloc(count * 4);
for (let i = 0; i < count; i++) {
  const s = i * channels, d = i * 4;
  rgba[d] = data[s]; rgba[d + 1] = data[s + 1]; rgba[d + 2] = data[s + 2];
  rgba[d + 3] = seen[i] ? 0 : 255;
}
await sharp(rgba, { raw: { width, height, channels: 4 } }).png().toFile(output);
