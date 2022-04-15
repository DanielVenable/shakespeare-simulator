import { readFile } from 'fs/promises';
import Words from './words.js';

const gen = new Words(
    String(await readFile('trigram.txt')).split('\n'),
    new Map(String(await readFile('characters.txt')).split('\n').map(a => a.split('#'))),
    'Act I.'
);

for (let i = 0; i < 1000; i++) {
    const word = gen.next().value;
    if (word === '#') {
        process.stdout.write(gen.speaker());
    } else if (word === '>') {
        process.stdout.write(gen.enter());
    } else if (word === '<') {
        process.stdout.write(gen.exit());
    } else {
        process.stdout.write(' ' + word);
    }
}