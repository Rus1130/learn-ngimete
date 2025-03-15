export class Dictionary {
    dict = {};
    constructor(categories) {
        for(let i = 0; i < arguments.length; i++){
            this.dict[arguments[i]] = [];
        }

        this.practiceOrder = Object.keys(this.dict)
    }

    async addWordsFromGoogleSheetsCopiedText(url, entryDelimiter, definitionDelimiter, dialectDelimiter) {
        try {
            let response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
            let data = await response.text()
        
            data = data.split(entryDelimiter)
        
            data.forEach(entry => {
                entry = entry.split(definitionDelimiter);
        

                let other = entry[0].split(dialectDelimiter)
                let english = entry[1];
                let category = entry[2];
        
                if(!(category == "dont add" || category == "Phrases")){
                    if(!(category == "Grammar" || category == "Tenses")){
                        other = other.map(x => x.replaceAll(" ", "-"))
                    }
                    this.addWord(category, new Word(english, ...other));
                }
            })
        
        
        } catch (error) {}
    }

    setPracticeOrder(args) {
        this.practiceOrder = [];
        for(let i = 0; i < arguments.length; i++){
            this.practiceOrder.push(arguments[i]);
        }
    }

    addWord(category, word) {
        for(let i = 1; i < arguments.length; i++){
            if(this.dict[category] === undefined){
                this.dict[category] = [];
            }
            if(word instanceof Word){
                this.dict[category].push(word);
            } else {
                this.dict[category].push(arguments[i]);
            }
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
    
    constructor(key, value) {
        this.key = key;
        this.value = {};

        if(arguments.length - 1 < Word.dialects.length){
            this.value[Word.dialects[0]] = value;
        } else {
            for(let i = 1; i < arguments.length; i++){
                this.value[Word.dialects[i-1]] = arguments[i];
            }
        }
    }

    toArray() {
        return [this.key, this.value];
    }
}