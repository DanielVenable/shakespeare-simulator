import { readFile } from 'fs/promises';
import { createWriteStream } from 'fs';

const text = String(await readFile('plays.txt'));
const reg = /(?<=\n)(?!SCENE|ACT|EPILOGUE|PROLOGUE|M\.)[A-Z ]+\./g;

{
    console.log('Loading trigram...');
    const words = text
        .replace(reg, '#')
        .replace(/(?<=\n)(Enter|Re-enter) .+?(?=\n#)/gs, '>')
        .replace(/\[?<?(Exit|Exeunt).+?(?=\n[#>])/gs, '<')
        .split(/\s/);
    const chunks = [];

    for (let i = 0; i <= words.length - 3; i++) {
        chunks.push(`${words[i].toLowerCase()} ${words[i + 1].toLowerCase()} ${words[i + 2]}\n`);
    }

    chunks.sort((a, b) => a.localeCompare(b));

    const stream = createWriteStream('trigram.txt');

    for (const chunk of chunks) {
        stream.write(chunk);
    }
}

{
    console.log('Loading characters...');
    const characters = new Map;
    for (const character of text.match(reg)) {
        characters.set(character, (characters.get(character) ?? 0) + 1);
    }

    const stream = createWriteStream('characters.txt');
    
    let isFirst = true;
    for (const [character, num] of characters) {
        if (isFirst) {
            isFirst = false;
            stream.write(`${character}#${num}`);
            continue;
        }
        stream.write(`\n${character}#${num}`);
    }
}
console.log('Done!');