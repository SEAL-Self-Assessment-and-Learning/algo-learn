
// TODO: add the options that more than one question can be generated

import {t, tFunctional, Translations} from "@shared/utils/translations.ts";
import Random from "@shared/utils/random.ts";
import {
    FreeTextFeedbackFunction,
    FreeTextFormatFunction,
    minimalMultipleChoiceFeedback,
    Question,
    QuestionGenerator
} from "@shared/api/QuestionGenerator.ts";
import {huffmanCodingAlgorithm, TreeNode} from "@shared/question-generators/huffman-coding/huffmanCodingAlgorithm.ts";
import {serializeGeneratorCall} from "@shared/api/QuestionRouter.ts";
import {validateParameters} from "@shared/api/Parameters.ts";


/**
 * All text displayed text goes into the translations object.
 * Include at least english and german.
 */
const translations: Translations = {
    en: {
        name: "Compute a Huffman-Coding",
        description: "Compute the Huffman-Coding of a given string",
        text: "Let ${{0}}$ be string. What is the **Huffman-Coding** of this string ${{0}}$?",
    },
    de: {
        name: "Berechne eine Hufmann-Codierung",
        description: "Bestimme die Huffman-Codierung eines gegebenen Strings",
        text: "Sei ${{0}}$ eine Zeichenkette. Was ist die **Huffman-Codierung** dieser Zeichenkette ${{0}}$?",
    },
}

/**
 * This function generates very obvious wrong answers.
 * @param random
 * @param correctAnswer
 */
function generateObviousWrongAnswers(
    random: Random,
    correctAnswer: string,
): Array<string> {
    const wrongAnswers = [
        '000',
        '001',
        '010',
        '011',
        '100',
        '101',
        correctAnswer + '0',
    ]

    return random.subset(wrongAnswers, 3)
}

/**
 * This function generates a random string of a given length and difficulty
 * @param length the length of the string
 * @param difficulty the difficulty of the string
 *                   if the string should be more difficult, it's probably also longer
 *                   it has 3 stages
 *                   1 - very easy - no choosing between characters
 *                   2 - medium - choosing between characters but not too many
 *                   3 - hard - choosing often between characters
 * @param random the random object
 */
function generateString(length: number, difficulty: number, random: Random): string {
    if (difficulty === 0) {
        return ''
    }

    const chosenFrequency = [1,3,5]

    const word = generateWordBasedOnFrequency(chosenFrequency, random)
    console.log("Length: " + length)
    console.log("word: " + word)

    return word
}

function generateWordBasedOnFrequency(chosenFrequency : number[], random : Random) {

    let word = ''

    let possibleChars :string = "abcdefghijklmnopqrstuvwxyz"

    // create the word based on the chosen frequencies
    for (let i = 0; i < chosenFrequency.length; i++) {
        const char = possibleChars[random.int(0, possibleChars.length - 1)]
        possibleChars = possibleChars.replace(char, "")
        for (let j = 0; j < chosenFrequency[i]; j++) {
            word += char
        }
    }
    return word
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getAllFrequencies(currentnode : TreeNode) {

    let frequencies : number[] = []

    if (currentnode.left) {
        frequencies = frequencies.concat(getAllFrequencies(currentnode.left))
    }
    if (currentnode.right) {
        frequencies = frequencies.concat(getAllFrequencies(currentnode.right))
    }
    if (currentnode.value.length === 1) {
        frequencies.push(currentnode.frequency)
    }
    return frequencies

}



/**
 * This question generator generates a multiple choice question for Huffman-Coding
 */

export const HuffmanCodingMultipleChoice: QuestionGenerator = {
    name: tFunctional(translations, "name"),
    description: tFunctional(translations, "description"),
    languages: ["en", "de"],
    expectedParameters: [
        {
            type: "string",
            name: "variant",
            allowedValues: ["choice", "input"],
        },
    ],

    /**
     * Generates a new question (currently only MultipleChoiceQuestion)
     * @param generatorPath
     * @param lang
     * @param parameters
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
        const wordlength = random.int(15,20)
        const word = generateString(wordlength, 1, random)

        const correctAnswer = huffmanCodingAlgorithm(word, 0)["result"]
        console.log(correctAnswer)
        // get a set of obvious wrong answers
        const answers = generateObviousWrongAnswers(random, correctAnswer)

        answers.push(correctAnswer)
        random.shuffle(answers)
        const correctAnswerIndex = answers.indexOf(correctAnswer)

        const checkFormat: FreeTextFormatFunction = ({ text }) => {
            // TODO check if the text only consists of 0 and 1
            if (text.trim() === "") return { valid: false }
            try {
                return { valid: true, message: text }
            } catch (e) {
                // TODO correct feedback incomplete
                return { valid: false, message: "t(feedback.incomplete)" }
            }
        }

        const feedback: FreeTextFeedbackFunction = ({ text }) => {

            if (text == correctAnswer) {
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

        const variant = parameters.variant as "choice" | "input"
        let question: Question

        if (variant === "choice") {
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
                prompt: `What is the Huffman-Coding of the string ${word}?`,
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