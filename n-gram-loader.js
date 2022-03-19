import { readFile } from 'fs/promises';
import { createWriteStream } from 'fs';

const text = String(await readFile('plays.txt'));
const words = text.split(/\s\s?/);
const chunks = [];

for (let i = 0; i <= words.length - 3; i++) {
    chunks.push(`${words[i].toLowerCase()} ${words[i + 1].toLowerCase()} ${words[i + 2]}\n`);
}

chunks.sort((a, b) => a.localeCompare(b));

const stream = createWriteStream('trigram.txt');

for (const chunk of chunks) {
    stream.write(chunk);
}