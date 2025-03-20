import { Dictionary, Word } from "./lib.js";

let setNames = [
    "Pronouns",
    "Tenses",
    "Grammar", 
    "Numerals",
    "Nouns",
    "Verbs",
    "Adjectives",
    "'An Verbs",
    "Irregular Plural Nouns",
    "Nouns about Bones, Limbs, Body Parts, and Death",
    "Miscellaneous",
    "Interrogatives",
    "Cannibals and Mutants",
    "Religious Terms",
    "Phrases"];

let dict = new Dictionary(...setNames);

Word.setDialects(["Standard", "A'atsilwi"])

dict.addWord("Pronouns", 
    new Word("first person singular non-possesive pronoun",   "yë"),
    new Word("first person singular possesive pronoun",       "yo"),
    new Word("first person singular reflexive pronoun",       "oyë",   "he"),
    new Word("first person plural non-possesive pronoun",     "vë"),
    new Word("first person plural possesive pronoun",         "vo"),
    new Word("first person plural reflexive pronoun",         "ovë",   "ve"),
    new Word("second person singular non-possesive pronoun",  "'a"),
    new Word("second person singular possesive pronoun",      "ao"),
    new Word("second person singular reflexive pronoun",      "o'a",   "na"),
    new Word("second person plural non-possesive pronoun",    "am",    "nga"),
    new Word("second person plural possesive pronoun",        "amo",   "ngo"),
    new Word("second person plural reflexive pronoun",        "o'am",  "nge"),
    new Word("third person singular non-possesive pronoun",   "ite",   "iti"),
    new Word("third person singular possesive pronoun",       "ito",   "ikyo"),
    new Word("third person singular reflexive pronoun",       "oite",  "ni"),
    new Word("third person plural non-possesive pronoun",     "item",  "ki"),
    new Word("third person plural possesive pronoun",         "itom",  "gyo"),
    new Word("third person plural reflexive pronoun",         "oitem", "si")
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