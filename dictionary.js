import { Dictionary, Word } from "./lib.js";

let setNames = [
    "Consonant Sounds",
    "Vowel Sounds",
    "Connecting Letters",
    "Pronouns",
    "Tenses",
    "Grammar", 
    "Numerals",
    "Nouns",
    "Verbs",
    "Adjectives",
    "'An Verbs",
    "yo/so Verbs",
    "Irregular Plural Nouns",
    "Nouns about Bones, Limbs, Body Parts, and Death",
    "Miscellaneous",
    "Interrogatives",
    "Cannibals and Mutants",
    "Religious Terms",
    "Phrases"];

let dict = new Dictionary(...setNames);

Word.setDialects(["Standard", "A'atsilwi"])

dict.addWord("Consonant Sounds", 
    new Word("p", "/p/"),
    new Word("b", "/b/"),
    new Word("t", "/t/"),
    new Word("d", "/d/"),
    new Word("gy or ky", "/c/"),
    new Word("k", "/k/"),
    new Word("g", "/ɡ/"),
    new Word("'", "/ʔ/"),
    new Word("mb", "/ᵐb/"),
    new Word("nd", "/ⁿd/"),
    new Word("ngg", "/ᵑɡ/"),
    new Word("m", "/m/"),
    new Word("n", "/n̪/"),
    new Word("ng", "/ŋ/"),
    new Word("f", "/f/"),
    new Word("v", "/v/"),
    new Word("s", "/s/"),
    new Word("h", "/h~x~χ/"),
    new Word("ts", "/t͡s/"),
    new Word("w", "/w/"),
    new Word("y", "/j/"),
    new Word("l", "/l/"),
)

dict.addWord("Vowel Sounds",
    new Word("i", "/i/"),
    new Word("ü", "/y~ʏ~ɤ~ʌ/"),
    new Word("í", "/iː/"),
    new Word("u", "/u/"),
    new Word("ú", "/uː/"),
    new Word("e", "/ɛ~e/"),
    new Word("é", "/ɛː~eː/"),
    new Word("ë", "/ə~ɘ̹/"),
    new Word("o", "/ɔ~o/"),
    new Word("ó", "/ɔː~oː/"),
    new Word("a", "/a/"),
    new Word("á", "/aː/"),
    new Word("ä", "/ɑ/"),
    new Word("är", "/ɑː/"),
)

dict.addWord("Connecting Letters",
    new Word("letter group V", "a, e, i, o, u, á, é, í, ó, ú, ä, ë, ü"),
    new Word("letter group C", "b, d, f, g, h, k, l, m, n, p, s, t, v, w, y, r"),
    new Word("letter group C1", "m, n, s, v, w, r"),
    new Word("letter group A", "b, d, f, h, k, l, t"),
    new Word("letter group D", "g, p, y"),
    new Word("letter group P", "o, i, u"),
    new Word("ā", "break between the letter <a> and group C, the <a> gets replaced with <ā>"),
    new Word("ə", "break between groups P, C and group C"),
    new Word("c", "break between group V and groups V, D"),
    new Word("z", "break between group V and groups C1, A"),
)

dict.addWord("Pronouns", 
    new Word("first person singular non-possesive pronoun",   "yë"),
    new Word("first person singular possesive pronoun",       "yo"),
    new Word("first person singular reflexive pronoun",       "mo"),
    new Word("first person plural non-possesive pronoun",     "vë"),
    new Word("first person plural possesive pronoun",         "vo"),
    new Word("first person plural reflexive pronoun",         "ve"),
    new Word("second person singular non-possesive pronoun",  "'a"),
    new Word("second person singular possesive pronoun",      "ao", "'ao"),
    new Word("second person singular reflexive pronoun",      "na"),
    new Word("second person plural non-possesive pronoun",    "'ama",    "nga"),
    new Word("second person plural possesive pronoun",        "'ame",   "ngo"),
    new Word("second person plural reflexive pronoun",        "nge"),
    new Word("third person singular non-possesive pronoun",   "ite",   "iti"),
    new Word("third person singular possesive pronoun",       "ito",   "ikyo"),
    new Word("third person singular reflexive pronoun",       "ni"),
    new Word("third person plural non-possesive pronoun",     "ikyi",  "ki"),
    new Word("third person plural possesive pronoun",         "igyo",  "gyo"),
    new Word("third person plural reflexive pronoun",         "si")
)

dict.bulkAddFromUrl(`https://rus1130.github.io/learn-ngimete/tenses-and-grammar.txt`, "\n", "\t", "/")
dict.bulkAddFromUrl(`https://rus1130.github.io/learn-ngimete/words.txt`, "\n", "\t", "/");

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

    s = s.replaceAll("aā", "ā");
    return s;
}

dict.waitForDictLoad().then(() => {
    for(let i = 0; i < dict.practiceOrder.length; i++){
        let cat = dict.practiceOrder[i];
        dict.dict[cat].forEach(word => {
            for(let j = 0; j < Object.keys(word.value).length; j++){
                if(cat != "Grammar") word.value[Object.keys(word.value)[j]] = ortho(word.value[Object.keys(word.value)[j]]).replaceAll("-", "")
            }
        })
    }
})

export { dict }