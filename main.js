import { readFile } from 'fs/promises';

const text = String(await readFile('trigram.txt'));

const chunks = text.split(/\n/);

function* words(text) {
    let [w1, w2] = text.split(/\s/).slice(-2);
    while (true) {
        yield w1 = getWord(w1, w2);
        yield w2 = getWord(w2, w1);
    }
}

function getWord(w1, w2) {
    const text = `${w1} ${w2} `;
    const index = binarySearch(chunks, text);
    let stop, start;
    for (stop = index + 1; chunks[stop].startsWith(text); stop++);
    for (start = index - 1; chunks[start].startsWith(text); start--);
    return chunks[random(start + 1, stop)].split(' ')[2];
}

function binarySearch(arr, text) {
    text = text.toLowerCase();
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

const gen = words('THE END');

for (let i = 0; i < 1000; i++) {
    const word = gen.next().value;
    if (/[A-Z]+[.]/.test(word)) {
        process.stdout.write('\n');
    } else {
        process.stdout.write(' ');
    }
    process.stdout.write(word);
}