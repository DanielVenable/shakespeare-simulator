export default class {
    onStage = new Set;

    constructor(chunks, characters, text) {
        this.chunks = chunks;
        this.characters = characters;
        this.sentence(text);
        this.totalCharacters = [...characters].reduce((acc, [, num]) => acc + +num, 0);
    }

    sentence(text) {
        [this.w1, this.w2] = text.split(/\s/).slice(-2);
    }

    say(word) {
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
        let text = '\nEnter ';
        let counter = 0;
        for (const num = random(0, Math.max(5 - this.onStage.size, 0)); counter < num; counter++) {
            const character = this.#randomCharacter(this.onStage);
            this.onStage.add(character);
            text += character.slice(0, -1) + (num === 1 ? ' ' : ', ');
        }
        if (counter) text += 'and ';
        const character = this.#randomCharacter(this.onStage);
        this.onStage.add(character);
        return text + character;
    }

    exit() {
        let text = '\nExit ';
        let counter = 0;
        for (const num = random(0, this.onStage.size); counter < num; counter++) {
            const character = this.randomOnStage();
            this.onStage.delete(character);
            text += character.slice(0, -1) + (num === 1 ? ' ' : ', ');
        }
        if (counter) text += 'and ';
        const character = this.randomOnStage();
        this.onStage.delete(character);
        if (character === this.talking) this.talking = undefined;
        return text + character;
    }

    speaker() {
        let text = '';
        this.onStage.delete(this.talking);
        if (this.onStage.size === 0) text = this.enter();
        const character = this.randomOnStage();
        if (this.talking !== undefined) this.onStage.add(this.talking);
        this.talking = character;
        return text + '\n' + character;
    }

    randomOnStage() {
        return [...this.onStage][random(0, this.onStage.size)];
    }

    #getWord() {
        const text = `${this.w1} ${this.w2} `.toLowerCase();
        const index = binarySearch(this.chunks, text);
        let stop, start;
        for (stop = index + 1; this.chunks[stop].startsWith(text); stop++);
        for (start = index - 1; this.chunks[start].startsWith(text); start--);
        return this.chunks[random(start + 1, stop)].split(' ')[2];
    }

    #randomCharacter(exclude) {
        const totalAllowed = [...exclude].reduce(
            (acc, cur) => acc - this.characters.get(cur), this.totalCharacters);
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

    throw new Error('Not found: "' + text + '"');
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}