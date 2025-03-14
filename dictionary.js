import { Dictionary, Word } from "./lib.js";

let dict = new Dictionary("Pronouns", "Basic Nouns", "Basic Verbs", "Tenses", "Grammar", "Numerals", "Adjectives", "Nouns", "Verbs", "Irregular Plural Nouns", "Nouns about Bones, Limbs, Body Parts, and Death", "Interjections and Miscellaneous", "Interrogatives", "Cannibals and Mutants", "Religious Terms", "Phrases");

Word.setDialects(["Standard", "A'atsilwi"])

dict.addWord("Pronouns", 
    new Word("first person singular non-possesive",   "yë"),
    new Word("first person singular possesive",       "yo"),
    new Word("first person singular reflexive",       "oyë",   "he"),
    new Word("first person plural non-possesive",     "vë"),
    new Word("first person plural possesive",         "vo"),
    new Word("first person plural reflexive",         "ovë",   "ve"),
    new Word("second person singular non-possesive",  "'a"),
    new Word("second person singular possesive",      "ao"),
    new Word("second person singular reflexive",      "o'a",   "na"),
    new Word("second person plural non-possesive",    "am",    "nga"),
    new Word("second person plural possesive",        "amo",   "ngo"),
    new Word("second person plural reflexive",        "o'am",  "nge"),
    new Word("third person singular non-possesive",   "ite",   "iti"),
    new Word("third person singular possesive",       "ito",   "ikyo"),
    new Word("third person singular reflexive",       "oite",  "ni"),
    new Word("third person plural non-possesive",     "item",  "ki"),
    new Word("third person plural possesive",         "itom",  "gyo"),
    new Word("third person plural reflexive",         "oitem", "si")
)

let nouns = fetch("./nouns.txt")
    .then(response => response.text())
    .then(text => {
        dict.bulkAddWords("Basic Nouns", "\n", "#", "/", text);
    })
    .catch(error => console.error('Error:', error));

//dict.bulkAddWords("Basic Nouns", "\n", "#", "/", ``);

export { dict }