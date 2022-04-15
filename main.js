import { readFile } from 'fs/promises';

const text = String(await readFile('trigram.txt')),
    characterText = String(await readFile('characters.txt'));

const chunks = text.split('\n');
const characters = new Map(characterText.split('\n').map(a => a.split('#')));

function* words(text) {
    let [w1, w2] = text.split(/\s/).slice(-2);
    while (true) {
        yield w1 = getWord(w1, w2);
        yield w2 = getWord(w2, w1);
    }
}

function getWord(w1, w2) {
    const text = `${w1} ${w2} `.toLowerCase();
    const index = binarySearch(chunks, text);
    let stop, start;
    for (stop = index + 1; chunks[stop].startsWith(text); stop++);
    for (start = index - 1; chunks[start].startsWith(text); start--);
    return chunks[random(start + 1, stop)].split(' ')[2];
}

function binarySearch(arr, text) {
    let start = 0;
    let end = arr.length - 1;

    while (start <= end) {
        let middle = Math.floor((start + end) / 2);

        if (arr[middle].startsWith(text)) {
            return middle;
        } else if (text.localeCompare(arr[middle]) > 0) {
            start = middle + 1;
        } else {
            end = middle - 1;
        }
    }

    throw new Error('Not found: "' + text + '"');
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

const totalCharacters = [...characters].reduce((acc, [, num]) => acc + +num, 0);

function randomCharacter(exclude) {
    const totalAllowed = [...exclude].reduce((acc, cur) => acc - characters.get(cur), totalCharacters);
    let index = random(0, totalAllowed);
    for (const [character, num] of characters) {
        if (exclude.has(character)) continue;
        index -= num;
        if (index < 0) return character;
    }
}

const gen = words('Act I.');
const onStage = new Set();
let talking;

for (let i = 0; i < 1000; i++) {
    const word = gen.next().value;
    if (word === '#') {
        onStage.delete(talking);
        if (onStage.size === 0) enter();
        const character = [...onStage][random(0, onStage.size)];
        if (talking !== undefined) onStage.add(talking);
        talking = character;
        process.stdout.write('\n' + character);
    } else if (word === '>') {
        enter();
    } else if (word === '<') {
        process.stdout.write('\nExit ');
        let counter = 0;
        for (const num = random(0, onStage.size); counter < num; counter++) {
            const character = [...onStage][random(0, onStage.size)];
            onStage.delete(character);
            process.stdout.write(character.slice(0, -1) + (num === 1 ? ' ' : ', '));
        }
        if (counter) process.stdout.write('and ');
        const character = [...onStage][random(0, onStage.size)];
        onStage.delete(character);
        process.stdout.write(character);
        if (character === talking) talking = undefined;
    } else {
        process.stdout.write(' ' + word);
    }
}

function enter() {
    process.stdout.write('\nEnter ');
    let counter = 0;
    for (const num = random(0, Math.max(5 - onStage.size, 0)); counter < num; counter++) {
        const character = randomCharacter(onStage);
        onStage.add(character);
        process.stdout.write(character.slice(0, -1) + (num === 1 ? ' ' : ', '));
    }
    if (counter) process.stdout.write('and ');
    const character = randomCharacter(onStage);
    onStage.add(character);
    process.stdout.write(character);
}