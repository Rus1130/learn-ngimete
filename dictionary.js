import { Dictionary, Word } from "./lib.js";

let setNames = ["Pronouns", "Basic Verbs", "Tenses", "Grammar", "Numerals", "Adjectives", "Nouns", "Verbs", "Irregular Plural Nouns", "Nouns about Bones, Limbs, Body Parts, and Death", "Interjections and Miscellaneous", "Interrogatives", "Cannibals and Mutants", "Religious Terms"];

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


let url = `https://rus1130.github.io/learn-ngimete/words.txt`;

dict.bulkAddFromUrl(url, "\n", "\t", "/");

export { dict }