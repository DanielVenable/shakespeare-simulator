import { readFile } from 'fs/promises';
import Words from './docs/words.js';

const gen = new Words(
    String(await readFile('docs/trigram.txt')).split('\n'),
    new Map(String(await readFile('docs/characters.txt')).split('\n').map(a => a.split('#'))),
    'Act I.'
);

for (let i = 0; i < 1000; i++) {
    const word = gen.next().value;
    if (word === '#') {
        process.stdout.write(gen.speaker().prompt);
    } else if (word === '>') {
        process.stdout.write(gen.enter().prompt);
    } else if (word === '<') {
        process.stdout.write(gen.exit().prompt);
    } else {
        process.stdout.write(' ' + word);
    }
}