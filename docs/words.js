export default class {
    onStage = new Set;

    constructor(chunks, characters, text) {
        this.chunks = chunks;
        this.characters = characters;
        [this.w1, this.w2] = text.split(/\s/).slice(-2);
        this.totalCharacters = [...characters].reduce((acc, [, num]) => acc + +num, 0);
    }

    sentence(text) {
        this.words = text;
        this.w2 = '#';
    }

    say(word) {
        this.words = undefined;
        this.w1 = this.w2;
        this.w2 = word;
        return word;
    }

    next() {
        return { value: this.say(this.#getWord()), done: false };
    }

    [Symbol.iterator]() {
        return this;
    }

    enter() {
        const characters = [];
        let text = '\nEnter ';
        let counter = 0;
        for (const num = random(0, Math.max(5 - this.onStage.size, 0)); counter < num; counter++) {
            const character = this.#randomCharacter(this.onStage);
            characters.push(character);
            this.onStage.add(character);
            text += character.slice(0, -1) + (num === 1 ? ' ' : ', ');
        }
        if (counter) text += 'and ';
        const character = this.#randomCharacter(this.onStage);
        this.onStage.add(character);
        characters.push(character);
        return { prompt: text + character, characters };
    }

    exit() {
        const characters = [];
        let text = '\nExit ';
        let counter = 0;
        for (const num = random(0, this.onStage.size); counter < num; counter++) {
            const character = this.randomOnStage();
            characters.push(character);
            this.onStage.delete(character);
            text += character.slice(0, -1) + (num === 1 ? ' ' : ', ');
        }
        if (counter) text += 'and ';
        const character = this.randomOnStage();
        this.onStage.delete(character);
        characters.push(character);
        if (character === this.talking) this.talking = undefined;
        return { prompt: text + character, characters };
    }

    speaker() {
        let text = '';
        this.onStage.delete(this.talking);
        let characters = [];
        if (this.onStage.size === 0) ({ prompt: text, characters } = this.enter());
        const character = this.randomOnStage();
        if (this.talking !== undefined) this.onStage.add(this.talking);
        this.talking = character;
        return { prompt: text + '\n' + character, characters };
    }

    randomOnStage() {
        return [...this.onStage][random(0, this.onStage.size)];
    }

    #getWord() {
        if (this.words === undefined) {
            return this.#findWord(`${this.w1} ${this.w2} `);
        }

        for (let word of this.words.split(' ').reverse()) {
            if (/[.,!?]$/.test(word)) {
                word = word.slice(0, -1);
            }
            for (const punctuation of ['', '.', '?', '!']) {
                const next = this.#findWord(word.slice(0, -1) + punctuation + ' # ');
                if (next !== undefined) return next;
            }
        }

        return this.#findWord(`# `, 1);
    }

    #findWord(text, num = 2) {
        text = text.toLowerCase();
        const index = binarySearch(this.chunks, text);
        if (index === undefined) return undefined;
        let stop, start;
        for (stop = index + 1; this.chunks[stop].startsWith(text); stop++);
        for (start = index - 1; this.chunks[start].startsWith(text); start--);
        return this.chunks[random(start + 1, stop)].split(' ')[num];
    }

    #randomCharacter(exclude) {
        const totalAllowed = [...exclude].reduce(
            (acc, cur) => acc - (this.characters.get(cur) || 0), this.totalCharacters);
        let index = random(0, totalAllowed);
        for (const [character, num] of this.characters) {
            if (exclude.has(character)) continue;
            index -= num;
            if (index < 0) return character;
        }
    }
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
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}