
// TODO: add the options that more than one question can be generated

import {t, tFunction, tFunctional, Translations} from "@shared/utils/translations.ts";
import Random from "@shared/utils/random.ts";
import {
    FreeTextFeedbackFunction,
    FreeTextFormatFunction,
    minimalMultipleChoiceFeedback,
    Question,
    QuestionGenerator
} from "@shared/api/QuestionGenerator.ts";
import {
    huffmanCodingAlgorithm,
    TreeNode
} from "@shared/question-generators/huffman-coding/huffmanCodingAlgorithm.ts";
import {serializeGeneratorCall} from "@shared/api/QuestionRouter.ts";
import {validateParameters} from "@shared/api/Parameters.ts";
import {
    generateRandomWrongAnswer,
    generateWrongAnswerSwitchLetters,
    generateWrongAnswerShuffleWord,
    generateWrongAnswerChangeWord,
    generateWrongAnswerFalseTreeConstrution,
    generateWrongAnswerReduceCodeOfLetter
}
    from "@shared/question-generators/huffman-coding/huffmanCodingGenerateWrongAnswers.ts";

import { generateString } from "@shared/question-generators/huffman-coding/huffManCodingGenerateWords.ts"

/**
 * All text displayed text goes into the translations object.
 * Include at least english and german.
 */
const translations: Translations = {
    en: {
        name: "Compute a Huffman-Coding",
        description: "Compute the Huffman-Coding of a given string",
        text: "Let \"*{{0}}*\" be string. What is a correct **Huffman-Coding** of this string \"*{{0}}*\"?",
        "feedback.invalid": "Can only contain 1 and 0",
    },
    de: {
        name: "Berechne eine Hufmann-Codierung",
        description: "Bestimme die Huffman-Codierung eines gegebenen Strings",
        text: "Sei \"*{{0}}*\" eine Zeichenkette. Was ist eine korrekte **Huffman-Codierung** dieser Zeichenkette \"*{{0}}*\"?",
        "feedback.invalid": "Darf nur 1 und 0 enthalten",
    },
}

/**
 * This function generates very obvious wrong answers.
 * @param random
 * @param correctAnswer
 * @param correctTree
 * @param word
 */
function generateObviousWrongAnswers(
    random: Random,
    correctAnswer: string,
    correctTree: TreeNode,
    word: string): Array<string> {
    const wrongAnswers : string[] = []
    const w1 = generateRandomWrongAnswer(random, correctAnswer);
    const otherCorrectAnswer = switchAllOneZero(correctAnswer);
    if (wrongAnswers.indexOf(w1) === -1 && w1 !== correctAnswer && w1 !== otherCorrectAnswer) {
        wrongAnswers.push(w1)
    }
    const w2 = generateWrongAnswerSwitchLetters(random, correctTree, word);
    if (wrongAnswers.indexOf(w2) === -1 && w2 !== correctAnswer && w2 !== otherCorrectAnswer) {
        wrongAnswers.push(w2)
    }

    // Only chose one, because they are both quite easy and identically
    const random_uniform = random.uniform();
    if (random_uniform < 0.5) {
        const w3 = generateWrongAnswerShuffleWord(random, word);
        if (wrongAnswers.indexOf(w3) === -1 && w3 !== correctAnswer && w3 !== otherCorrectAnswer) {
            wrongAnswers.push(w3)
        }
    }
    else {
        const w4 = generateWrongAnswerChangeWord(random, word);
        if (wrongAnswers.indexOf(w4) === -1 && w4 !== correctAnswer && w4 !== otherCorrectAnswer) {
            wrongAnswers.push(w4)
        }
    }
    // This has a higher difficulty, so when want more of those answers
    for (let i = 0; i < 3; i++) {
        const w5 = generateWrongAnswerFalseTreeConstrution(random, word, correctTree);
        if (wrongAnswers.indexOf(w5) === -1 && w5 !== correctAnswer && w5 !== otherCorrectAnswer) {
            wrongAnswers.push(w5)
        }
        const w6 = generateWrongAnswerReduceCodeOfLetter(word, correctTree);
        if (wrongAnswers.indexOf(w6) === -1 && w6 !== correctAnswer && w6 !== otherCorrectAnswer) {
            wrongAnswers.push(w6)
        }
    }

    let subset_size = 4;
    if (wrongAnswers.length < 4) {
        subset_size = wrongAnswers.length
    }
    return random.subset(wrongAnswers, subset_size)
}

/**
 * This function switches all zeros and ones, because this will still be a correct Huffman-Coding
 * @param correctword
 */
export function switchAllOneZero (correctword : string) {
    const correctWordArray : string[] = correctword.split('');
    for (let i = 0; i<correctWordArray.length; i++) {
        if (correctWordArray[i] === '1') {
            correctWordArray[i] = '0';
        }
        else {
            correctWordArray[i] = '1';
        }
    }
    return correctWordArray.join('')
}


export const HuffmanCodingMultipleChoice: QuestionGenerator = {
    name: tFunctional(translations, "name"),
    description: tFunctional(translations, "description"),
    languages: ["en", "de"],
    expectedParameters: [
        {
            type: "string",
            name: "variant",
            // Still need to change the choice to choice1 and input to input1
            allowedValues: ["choice", "input", "choice2"],
        },
    ],

    /**
     * Generates a new question (currently only MultipleChoiceQuestion)
     * @param generatorPath
     * @param lang provided language
     * @param parameters the following options are possible
     *                      - choice-1: this displays are "real" word maximum length of 13 chars, it has a unique coding
     *                                  only the 1 and 0 can be flipped. The goal is to find the correct Huffman Coding
     *                                  of the String
     *                      - input-1:  this has the same base as choice-1, but instead of options, the user has to
     *                                  provide an input
     *                      - choice-2: Here the user does not get a word anymore (instead a table or an array), but
     *                                  here the user has to find the correct coding of the letters and do not concat
     *                                  those
     * @param seed
     */
    generate: (generatorPath, lang , parameters, seed) => {

        // first create a permalink for the question
        const permalink = serializeGeneratorCall({
            generator: HuffmanCodingMultipleChoice,
            lang,
            parameters,
            seed,
            generatorPath,
        })

        // throw an error if the variant is unknown
        if (!validateParameters(parameters, HuffmanCodingMultipleChoice.expectedParameters)) {
            throw new Error(
                `Unknown variant ${parameters.variant.toString()}. 
                Valid variants are: ${HuffmanCodingMultipleChoice.expectedParameters.join(
                    ", ",
                )}`,
            )
        }

        /*
        Generate the random word and get the correct answer
         */
        const random = new Random(seed)
        let wordlength = 8;
        const probLength = random.uniform();
        // if P > 0.75 --> length = 13, > 0.5 length --> 12 > rest 0.125 steps
        if (probLength > 0.75) wordlength = 13;
        else if (probLength > 0.5) wordlength = 12;
        else if (probLength > 0.375) wordlength = 11;
        else if (probLength > 0.25) wordlength = 10;
        else if (probLength > 0.125) wordlength = 9;

        let word = generateString(wordlength, 1, random)
        word = random.shuffle(word.split('')).join('')

        const correctAnswer_list = huffmanCodingAlgorithm(word, 0)
        const correctAnswer = correctAnswer_list["result"]
        const correctTree = correctAnswer_list["main_node"]
        // get a set of obvious wrong answers
        const answers = generateObviousWrongAnswers(random, correctAnswer, correctTree, word)

        answers.push(correctAnswer)
        random.shuffle(answers)
        const correctAnswerIndex = answers.indexOf(correctAnswer)

        const checkFormat: FreeTextFormatFunction = ({ text }) => {
            if (text.trim() === "") return { valid: false }
            try {
                // iterate over each letter to check if either 0 or 1
                for (let i = 0; i < text.length; i++) {
                    if (text[i] !== '0' && text[i] !== '1') {
                        return  { valid: false, message: tFunction(translations, lang).t("feedback.invalid") };
                    }
                }
            } catch (e) {
                return { valid: false, message: tFunction(translations, lang).t("feedback.invalid") };
            }

            // no format error
            return { valid: true, message: text };
        }

        const feedback: FreeTextFeedbackFunction = ({ text }) => {

            // also switch 1 and 0 to keep a correct solution
            const switched_correctAnswer = switchAllOneZero(correctAnswer);
            if (text == correctAnswer || text === switched_correctAnswer) {
                return {
                    correct: true,
                    message: "t(feedback.correct)",
                }
            }
            return {
                correct: false,
                message: "t(feedback.incomplete)",
                correctAnswer,
            }
        }

        const variant = parameters.variant as "choice" | "input" | "choice2"
        let question: Question

        if (variant === "choice" || variant === "choice2") {
            question = {
                type: "MultipleChoiceQuestion",
                name: HuffmanCodingMultipleChoice.name(lang),
                path: permalink,
                text: t(translations, lang, "text", [word]),
                answers: answers,
                feedback: minimalMultipleChoiceFeedback({correctAnswerIndex}),
            }
        }
        else {
            question = {
                type: "FreeTextQuestion",
                name: HuffmanCodingMultipleChoice.name(lang),
                path: permalink,
                text: t(translations, lang, "text", [word]),
                prompt: `What is a possible Huffman-Coding?`,
                bottomText: "Please enter the Huffman-Coding of the given string",
                feedback,
                checkFormat,
            }
        }

        return {
            question
        }

    }
}