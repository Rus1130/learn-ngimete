export class Dictionary {
    dict = [];
    constructor(categories) {
        for(let i = 0; i < arguments.length; i++){
            this.dict.push({name: arguments[i], words: []})
        }
    }

    addWord(category, word) {
        for(let i = 1; i < arguments.length; i++){
            this.dict.find(x => x.name === category).words.push(arguments[i]);
        }
    }

    bulkAddWords(category, entryDelimiter, definitionDelimiter, dialectDelimiter, string) {
        let words = string.split(entryDelimiter);
        for(let i = 0; i < words.length; i++){
            let word = words[i];
            let definition = word.split(definitionDelimiter);

            let englishWord = definition[1];
            let dialectSeparatedDefinition = definition[0].split(dialectDelimiter);

            this.addWord(category, new Word(englishWord, ...dialectSeparatedDefinition));
        }
    }

    get categories() {
        return this.dict.map(x => x.name);
    }
}

export class Word {
    static setDialects(dialects) {
        Word.dialects = dialects;
    }

    constructor(word, definition) {
        this.word = word;
        this.definition = {};

        if(arguments.length - 1 < Word.dialects.length){
            this.definition[Word.dialects[0]] = definition;
        } else {
            for(let i = 1; i < arguments.length; i++){
                this.definition[Word.dialects[i-1]] = arguments[i];
            }
        }
    }

    toArray() {
        return [this.word, this.definition];
    }
}