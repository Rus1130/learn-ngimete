export class Dictionary {
    dict = {};
    dictLoadedFromLink = "not loaded";


    constructor(categories) {
        for(let i = 0; i < arguments.length; i++){
            this.dict[arguments[i]] = [];
        }

        this.practiceOrder = Object.keys(this.dict)
    }

    async waitForDictLoad() {
        if(this.dictLoadedFromLink == "not loaded") return false;
        while(this.dictLoadedFromLink != "loaded") {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }


    async bulkAddFromUrl(url, entryDelimiter, definitionDelimiter, dialectDelimiter) {
        try {
            this.dictLoadedFromLink = "loading";
            let response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
            let data = await response.text()
        
            data = data.split(entryDelimiter)
        
            data.forEach(entry => {
                entry = entry.split(definitionDelimiter);
        

                let other = entry[0].split(dialectDelimiter);
                let english = entry[1].trim();
                let category = entry[2].trim();
        
                if(!(category == "Grammar" || category == "Tenses" || category == "Phrases")){
                    other = other.map(x => x.replaceAll(" ", "-").trim())
                }
                this.addWord(category, new Word(english, ...other));
            })
            this.dictLoadedFromLink = "loaded";
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
            if(!arguments[i] instanceof Word) throw new Error("All arguments must be of type Word");
            if(this.dict[category] === undefined){
                this.dict[category] = [];
            }
            arguments[i].category = category;
            this.dict[category].push(arguments[i]);
        }
    }

    /**
     * 
     * @param {string} searchTerm the english term to search by
     * @param {Object} [options] an object that can have the following properties:
     * @param {string} [options.dialect=undefined] the dialect to return the word in, if not specified, all dialects will return
     * @param {string} [options.category=undefined] the category to search in, if not specified, all categories will be searched
     * @param {boolean} [options.swap=false] if true, the term input should be in the language other than english
     * @param {Object} [options.excludedCategories=[]] an array of categories to exclude from the search
     * @returns {WordSearchResult} an array of Word objects that match the search term, optionally filtered by category and dialect
     * @example 
     *  dict.waitForDictLoad().then(() => {
     *      let wordSearchResult = dict.wordSearch("a", {
     *          dialect: "Standard",
     *          category: "Religious Terms",
     *          swap: false,
     *          excludedCategories: ["Cannibals and Mutants"]
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
        let excludedCategories = options?.excludedCategories || [];
        let regexSearch = options?.regexSearch || false;

        if(["not loaded", "loading"].includes(this.dictLoadedFromLink)) throw new Error("Dictionary not loaded yet. Please wait for the dictionary to load before searching.");

        let results = [];

        if(swap == false){
            if(category == undefined) {
                for(let i = 0; i < this.practiceOrder.length; i++){
                    let cat = this.practiceOrder[i];
                    this.dict[cat].forEach(word => {
                        if (regexSearch ? new RegExp(searchTerm, "i").test(word.key) : word.key.includes(searchTerm)) {
                            let word_ = new Word(word.key, ...Object.values(word.value));
                            word_.category = cat;
                            results.push(word_);
                        }
                    })
                }
            } else {
                if(this.dict[category] == undefined) return new WordSearchResult(searchTerm, []);
                this.dict[category].forEach(word => {
                    if (regexSearch ? new RegExp(searchTerm, "i").test(word.key) : word.key.includes(searchTerm)) {
                        let word_ = new Word(word.key, ...Object.values(word.value))
                        word_.category = category;
                        results.push(word_);
                    }
                })
            }
        } else {
            if (!category) {
                for (let i = 0; i < this.practiceOrder.length; i++) {
                    let cat = this.practiceOrder[i];
                    this.dict[cat].forEach(word => {
                        if (dialect == undefined 
                            ? regexSearch 
                                ? Object.values(word.value).some(value => new RegExp(searchTerm, "i").test(value)) 
                                : Object.values(word.value).some(value => value.includes(searchTerm)) 
                            : regexSearch
                                ? new RegExp(searchTerm, "i").test(word.value[dialect])
                                : word.value[dialect].includes(searchTerm)
                        ) {
                            let word_ = new Word(word.key, ...Object.values(word.value));
                            word_.category = cat;
                            results.push(word_);
                        }
                    });
                }
            } else {
                if (!this.dict[category]) return new WordSearchResult(searchTerm, []);
                this.dict[category].forEach(word => {
                    if (dialect == undefined
                        ? regexSearch
                            ? Object.values(word.value).some(value => new RegExp(searchTerm, "i").test(value))
                            : Object.values(word.value).some(value => value.includes(searchTerm))
                        : regexSearch
                            ? new RegExp(searchTerm, "i").test(word.value[dialect])
                            : word.value[dialect].includes(searchTerm)
                        ) {
                        let word_ = new Word(word.key, ...Object.values(word.value));
                        word_.category = category;
                        results.push(word_);
                    }
                });
            }
        }

        if(dialect != undefined){
            for(let i = 0; i < results.length; i++){
                let term = results[i];
                for(let j = 0; j < Object.keys(term.value).length; j++){
                    if(Object.keys(term.value)[j] != dialect){
                        delete term.value[Object.keys(term.value)[j]];
                    }
                }
            }
        }

        results = results.filter(x => !excludedCategories.includes(x.category));

        return new WordSearchResult(searchTerm, results, excludedCategories);
    }

    /**
     * 
     * @param {string} location the location to open the dictionary to. 
     * @param {Object} [options] an object that can have the following properties:
     * @param {number} [options.width=850] the width of the dictionary window (element, window)
     * @param {number} [options.height=950] the height of the dictionary window (element, window)
     * @param {HTMLElement} [options.element=undefined] the element to open the dictionary in (element)
     * @param {string[]} [options.exclude=[]] an array of categories to exclude from the dictionary. The categories will be the index they are in the this.practiceOrder array (element, window, tab)
     * @param {string} [options.removeNav=false] remove search, dialect changing, swap (element, window, tab)
     * @param {string} [options.removeCategoryColumn=false] remove the category column (element, window, tab)
     * @param {string} [options.dialect=undefined] the dialect to open the dictionary in (element, window, tab)
     */

    //width, height, element, exclude
    openDictionary(type, options) {
        let width = options?.width || 850;
        let height = options?.height || 950;
        let element = options?.element || undefined;
        let exclude = options?.exclude || [];
        let removeNav = options?.removeNav || false;
        let removeCategoryColumn = options?.removeCategoryColumn || false;
        let dialect = options?.dialect || undefined;

        switch(type) {
            case "element":
                let urlParams = [
                    "b=false",
                    `e=${exclude.join(",")}`,
                    `n=${removeNav}`,
                    `c=${removeCategoryColumn}`,
                    `d=${dialect}`
                ]
                let elem = element;
                elem.src = `https://rus1130.github.io/learn-ngimete/dictionary.html?${urlParams.join("&")}`;
                elem.style.height = height;
                elem.style.width = width;
                elem.style.border = "none";
            break;
            case "window":
                // open it in a new window
                window.open(`https://rus1130.github.io/learn-ngimete/dictionary.html?b=false`, "_blank", `height=${width},width=${width}`);
            break;
            default:
            case "tab":
                window.open("https://rus1130.github.io/learn-ngimete/dictionary.html");
            break;

        }
    }

    // 850, 950

    get categories() {
        return this.dict.map(x => x.name);
    }
}

function ortho(s){
    const V = ["a", "e", "i", "o", "u", "á", "é", "í", "ó", "ú", "ä", "ë", "ü"]
    const C = ["b", "d", "f", "g", "h", "k", "l", "m", "n", "p", "s", "t", "v", "w", "y", "r"]
    const C1 = ["m", "n", "s", "v", "w", "r"]
    const A = ["b", "d", "f", "h", "k", "l", "t"]
    const D = ["g", "p", "y"]
    const P = ["o", "i", "u"]


    for(let i = 0; i < s.length; i++){

        if(s[i] == "-"){
            let left = s[i-1]
            let right = s[i+1]
            
            // C-C = ə
            // P-C = ə
            // V-V = c
            // V-C1 = z
            // V-D = c
            // V-A = z
            // a-C = ā

            if(left == "a" && C.includes(right)) {
                s = s.substring(0, i) + "ā" + s.substring(i+1)
                continue
            }
            if(V.includes(left) && D.includes(right)) {
                s = s.substring(0, i) + "c" + s.substring(i+1)
                continue
            }
            if(P.includes(left) && C.includes(right)) {
                s = s.substring(0, i) + "ə" + s.substring(i+1)
                continue
            }
            if(C.includes(left) && C.includes(right)) {
                s = s.substring(0, i) + "ə" + s.substring(i+1)
                continue
            }
            if(V.includes(left) && V.includes(right)) {
                s = s.substring(0, i) + "c" + s.substring(i+1)
                continue
            }
            if(V.includes(left) && C1.includes(right)) {
                s = s.substring(0, i) + "z" + s.substring(i+1)
                continue
            }
            if(V.includes(left) && A.includes(right)) {
                s = s.substring(0, i) + "z" + s.substring(i+1)
                continue
            }
        }
    }

    s = s.replaceAll("aā", "ā")
    return s;
}

function ipa(s){
    s = ortho(s);
    const r = [
        [   
            // replace combining vowels with their combined counterparts
            { pattern: "á", value: "á" },
            { pattern: "é", value: "é" },
            { pattern: "í", value: "í" },
            { pattern: "ó", value: "ó" },
            { pattern: "ú", value: "ú" },
            { pattern: "ä", value: "ä" },
            { pattern: "ë", value: "ë" },
            { pattern: "ü", value: "ü" },

            { pattern: "ngg", value: "ᵑg" },
            { pattern: "mbb", value: "m.b" },
            { pattern: "ndd", value: "n.d" },
            { pattern: ".", value: " ||"},
            { pattern: ",", value: " |"}
        ],
        [
            // delimiters 
            { pattern: "ā", value: "a‿"},
            { pattern: "c", value: "‿"},
            { pattern: "ə", value: "‿"},
            { pattern: "z", value: "‿"},

            // consonants
            { pattern: 'ng', value: "ŋ" },
            { pattern: 'y', value: "j" },
            { pattern: "gy", value: "c"},
            { pattern: "ky", value: "c"},
            { pattern: "'", value: "ʔ" },
            { pattern: "nd", value: "ⁿd" },
            { pattern: "mb", value: "ᵐb" },
            { pattern: "ts", value: "t͡s" },

            // vowels
            { pattern: 'a', value: "a." },
            { pattern: 'e', value: "e." },
            { pattern: 'i', value: "i." },
            { pattern: 'o', value: "o." },
            { pattern: 'u', value: "u." },
            { pattern: 'á', value: "aː." },
            { pattern: 'é', value: "eː." },
            { pattern: 'í', value: "iː." },
            { pattern: 'ó', value: "oː." },
            { pattern: 'ú', value: "uː." },
            { pattern: 'är', value: "ɑː." },
            { pattern: 'ä', value: "ɑ." },
            { pattern: 'ë', value: "ə." },
            { pattern: 'ü', value: "y." },
        ],
        [
            { pattern: ".‿", value: "‿"},
            { pattern: "a.o", value: "ao̯"},
            { pattern: "e.o", value: "eo̯"},
        ]
    ]

    let result = s;
    const map = m => Object.fromEntries(m.map(({ pattern, value }) => [pattern, value]))

    for(let i = 0; i < r.length; i++){
        result = result.replace(new RegExp(Object.keys(map(r[i])).join("|"), "g"), match => map(r[i])[match] || match)
    }

    result = result.split(" ")
    result.forEach((index, i) => {
        if(result[i][result[i].length - 1] == ".") {
            result[i] = result[i].substring(0, result[i].length - 1)
        }
    });

    const V = "[aeiouːɑəy]";
    const C = "[bdfghklmnpstvwjcŋʔ]";

    result.forEach((index, i) => {            
        // fix delimited syllable boundaries 
        result[i] = index.replaceAll(new RegExp(`(${C+V}ː?)(\.)(${C})(‿)`, "g"), "$1$3$4")   

        // fix non-delimited syllable boundaries
        result[i] = result[i].replaceAll(new RegExp(`(${C+V}ː?)(\.)(${C})$`, "g"), "$1$3") 

        // fix nasal syllable boundaries le.ŋki -> leŋ.ki
        result[i] = result[i].replaceAll(new RegExp(`(\.)([mnŋ])(${C})`, "g"), "$2.$3")

        // fix w/l syllable boundaries
        result[i] = result[i].replaceAll(new RegExp(`(\.)([wl])(${C})`, "g"), "$2.$3")
        result[i] = result[i].replaceAll(new RegExp(`(\.)([wl])$`, "g"), "$2")

        // fix s syllable boundaries
        result[i] = result[i].replaceAll(new RegExp(`(${V})\.s$`, "g"), "$1s.")
        result[i] = result[i].replaceAll(new RegExp(`(${V}).s‿`, "g"), "$1s‿")

        // fix .m.b and .n.d
        result[i] = result[i].replaceAll(".m.b", "m.b")
        result[i] = result[i].replaceAll(".n.d", "n.d")

        // fix velar prenasalized syllable boundaries
        //result[i] = result[i].replaceAll(new RegExp(`\.ŋg`, "g"), "ᵑg\.");
    })

    result = "[" + result.join(" ") + "]"

    return result = result
    .replaceAll("n", "n̪")
    .replaceAll("g", "ɡ")
    .replaceAll("./","/")
    .replaceAll(".​", "")
    .replaceAll(". ", " ")
    .replaceAll("‿", ".")
    .replaceAll(/.$/g, "")
}

export class Writer {
    constructor(text){
        this.text = text
    }

    ipa(){
        return ipa(this.text)
    }

    ortho(){
        return ortho(this.text)
    }

    both(){
        return ortho(this.text) + "\n" + ipa(this.text);
    }
}

export class Word {
    static setDialects(dialects) {
        Word.dialects = dialects;
    }
    
    constructor(key, value) {
        this.key = key;
        this.value = {};
        this.category = undefined;

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

        // for each dialect that isnt the standard one
        Word.dialects.forEach(dialect => {
            if(dialect != "Standard"){
                if((this.value[dialect] == undefined)){
                    this.value[dialect] = this.value["Standard"];
                }
            }
        });
    }

    toArray() {
        return [this.key, this.value, this.category];
    }
}

export class WordSearchResult {
    constructor(searchTerm, results, excludedCategories) {
        this.searchTerm = searchTerm;
        this.results = results;
        this.excludedCategories = excludedCategories;
    }
}