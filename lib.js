export class Dictionary {
    dict = {};

    static dictLoadedFromLink = null;


    constructor(categories) {
        for(let i = 0; i < arguments.length; i++){
            this.dict[arguments[i]] = [];
        }

        this.practiceOrder = Object.keys(this.dict)
    }

    async waitForDictLoad() {
        if(Dictionary.dictLoadedFromLink == null) return false;
        while(Dictionary.dictLoadedFromLink != true) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }



    async bulkAddFromUrl(url, entryDelimiter, definitionDelimiter, dialectDelimiter) {
        try {
            Dictionary.dictLoadedFromLink = false;
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
            Dictionary.dictLoadedFromLink = true;
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
            this.dict[category].push(arguments[i]);
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

    /**
     * 
     * @param {string} searchTerm the english term to search by
     * @param {Object} [options] an object that can have the following properties:
     * @param {string} [options.dialect=undefined] the dialect to return the word in, if not specified, all dialects will return
     * @param {string} [options.category=undefined] the category to search in, if not specified, all categories will be searched
     * @param {boolean} [options.swap=false] if true, the term input should be in the language other than english
     * @returns {WordSearchResult} an array of Word objects that match the search term, optionally filtered by category and dialect
     * @example 
     *  dict.waitForDictLoad().then(() => {
     *      let wordSearchResult = dict.wordSearch("a", {
     *          dialect: "Standard",
     *          category: "Religious Terms"
     *      })
     *
     *      console.log(wordSearchResult)
     *  })
     */
    wordSearch(searchTerm, options) {
        searchTerm = searchTerm.toLowerCase();

        let category = options?.category || undefined;
        let dialect = options?.dialect || undefined;
        let swap = options?.swap || false;

        let results = [];

        if(swap == false){
            if(category == undefined) {
                for(let i = 0; i < this.practiceOrder.length; i++){
                    let cat = this.practiceOrder[i];
                    this.dict[cat].forEach(word => {
                        if (word.key.includes(searchTerm)) {
                            if (dialect == undefined) {
                                results.push(word);
                            } else {
                                results.push(new Word(word.key, word.value[dialect], word.category));
                            }
                        }
                    })
                }
            } else {
                if(this.dict[category] == undefined) return new WordSearchResult(searchTerm, []);
                this.dict[category].forEach(word => {
                    if (word.key.includes(searchTerm)) {
                        if (dialect == undefined) {
                            results.push(word);
                        } else {
                            results.push(new Word(word.key, word.value[dialect], word.category));
                        }
                    }
                })
            }
        } else {
            if(category == undefined) {
                for(let i = 0; i < this.practiceOrder.length; i++){
                    let cat = this.practiceOrder[i];
                    this.dict[cat].forEach(word => {
                        if (word.value[dialect].includes(searchTerm)) {
                            results.push(word);
                        }
                    })
                }
            } else {
                this.dict[category].forEach(word => {
                    if (word.value[dialect].includes(searchTerm)) {
                        results.push(word);
                    }
                })
            }
        }

        return new WordSearchResult(searchTerm, results);
    }

    get categories() {
        return this.dict.map(x => x.name);
    }
}

export class Word {
    static setDialects(dialects) {
        Word.dialects = dialects;
    }
    
    constructor(key, value, category) {
        this.key = key;
        this.value = {};

        if(category != undefined) this.category = category;

        if(Word.dialects == undefined){
            console.warn("Dialects not set. Defaulting to \"Standard\" dialect.")
            Word.dialects = ["Standard"];
        }

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

export class WordSearchResult {
    constructor(searchTerm, results) {
        this._searchTerm = searchTerm;
        this._results = results;
    }

    get searchTerm() {
        return this._searchTerm;
    }

    get results() {
        return this._results;
    }
}