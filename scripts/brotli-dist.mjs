import { readdir, readFile, writeFile } from 'node:fs/promises';
import { brotliCompress } from 'node:zlib';
import { promisify } from 'node:util';

const brotli = promisify(brotliCompress);
const distDir = new URL('../dist/', import.meta.url);
const files = await readdir(distDir);

await Promise.all(
  files
    .filter((file) => file.endsWith('.js'))
    .map(async (file) => {
      const source = await readFile(new URL(file, distDir));
      const compressed = await brotli(source);
      await writeFile(new URL(`${file}.br`, distDir), compressed);
    })
);
