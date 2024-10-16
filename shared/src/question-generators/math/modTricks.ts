import { Language } from "../../api/Language";
import {
    FreeTextFeedbackFunction,
    FreeTextQuestion,
    QuestionGenerator,
} from "../../api/QuestionGenerator";
import { serializeGeneratorCall } from "../../api/QuestionRouter";
import Random from "../../utils/random";
import { t, tFunctional, Translations } from "../../utils/translations";
import {
    gcd,
    calculateModularInverse,
    modularExponentiation } from "@shared/question-generators/math/utils.ts";

const translations: Translations = {
    en: {
        name: "Modular Arithmetic Tricks",
        description: "Answer questions involving modular arithmetic.",
        reductionQuestion: "Reduce ${{x}}$ modulo ${{n}}$.",
        inverseQuestion: "Find the modular inverse of ${{a}}$ modulo ${{n}}$.",
        expQuestion: "Calculate ${{a}}^{{{b}}} \\pmod{ {{n}} }$.",
        simpleQuestion: "Find an integer $x$ such that $x ≡ {{a}} \\pmod{ {{b}} }$.",
        feedbackInvalid: "Your answer is not valid.",
        feedbackCorrect: "Correct!",
        feedbackIncorrect: "Incorrect.",
    },
    de: {
        name: "Modulare Arithmetik Tricks",
        description: "Beantworten Sie Fragen zur modularen Arithmetik.",
        reductionQuestion: "Reduzieren Sie ${{x}}$ modulo ${{n}}$.",
        inverseQuestion: "Finden Sie das Inverse von ${{a}}$ modulo ${{n}}$.",
        expQuestion: "Berechnen Sie ${{a}}^{{{b}}} \\pmod{ {{n}} }$.",
        simpleQuestion: "Finden Sie eine ganze Zahl $x$, so dass $x ≡ {{a}} \\pmod{ {{b}} }$.",
        feedbackInvalid: "Ihre Antwort ist ungültig.",
        feedbackCorrect: "Richtig!",
        feedbackIncorrect: "Falsch.",
    }
};

export const ModTricks: QuestionGenerator = {
    id: "modtricks",
    name: tFunctional(translations, "name"),
    description: tFunctional(translations, "description"),
    tags: ["basic math", "modular arithmetic", "modulus", "mod", "arithmetic"],
    languages: ["en", "de"],
    author: "Janette Welker",
    license: "MIT",
    expectedParameters: [
        {
            type: "string",
            name: "variant",
            allowedValues: ["reduction", "inverse", "exponentiation", "simple"],
        },
    ],

    generate: (lang, parameters, seed) => {
        const path = serializeGeneratorCall({
            generator: ModTricks,
            lang,
            parameters,
            seed,
        });

        const random = new Random(seed);
        const variant = parameters.variant as "reduction" | "inverse" | "exponentiation" | "simple";
        
        switch (variant) {
            case "reduction":
                return { question: generateReductionQuestion(lang, path, random) };
            case "inverse":
                return { question: generateInverseQuestion(lang, path, random) };
            case "exponentiation":
                return { question: generateExponentiationQuestion(lang, path, random) };
            case "simple":
                return { question: generateSimpleQuestion(lang, path, random) };
        }
    },
};

// Reduction
function generateReductionQuestion(lang: Language, path: string, random: Random): FreeTextQuestion {
    const x = random.int(100, 999);
    const n = random.int(2, 20);

    return {
        type: "FreeTextQuestion",
        name: ModTricks.name(lang),
        path: path,
        text: t(translations, lang, "reductionQuestion", { x: String(x), n: String(n) }),
        feedback: getReductionFeedbackFunction(lang, x, n),
    };
}

function getReductionFeedbackFunction(lang: Language, x: number, n: number): FreeTextFeedbackFunction {
    return ({ text }) => {
        const userAnswer = parseInt(text.trim(), 10);
        const correctAnswer = x % n;
        if (isNaN(userAnswer)) {
            return { correct: false, feedbackText: t(translations, lang, "feedbackInvalid") };
        }
        return userAnswer === correctAnswer
            ? { correct: true, feedbackText: t(translations, lang, "feedbackCorrect") }
            : { correct: false, feedbackText: t(translations, lang, "feedbackIncorrect") };
    };
}

// Inverse
function generateInverseQuestion(lang: Language, path: string, random: Random): FreeTextQuestion {
    let a, n;
    do {
        a = random.int(2, 15);
        n = random.int(2, 20);
    } while (gcd(a, n) !== 1);

    const inverse = calculateModularInverse(a, n);

    return {
        type: "FreeTextQuestion",
        name: ModTricks.name(lang),
        path: path,
        text: t(translations, lang, "inverseQuestion", { a: String(a), n: String(n) }),
        feedback: getInverseFeedbackFunction(lang, inverse),
    };
}

function getInverseFeedbackFunction(lang: Language, inverse: number | null): FreeTextFeedbackFunction {
    return ({ text }) => {
        const userAnswer = parseInt(text.trim(), 10);
        if (isNaN(userAnswer)) {
            return { correct: false, feedbackText: t(translations, lang, "feedbackInvalid") };
        }
        return userAnswer === inverse
            ? { correct: true, feedbackText: t(translations, lang, "feedbackCorrect") }
            : { correct: false, feedbackText: t(translations, lang, "feedbackIncorrect") };
    };
}

// Exponentiation
function generateExponentiationQuestion(lang: Language, path: string, random: Random): FreeTextQuestion {
    const a = random.int(2, 10);
    const b = random.int(2, 10);
    const n = random.int(2, 20);
    const result = modularExponentiation(a, b, n);

    return {
        type: "FreeTextQuestion",
        name: ModTricks.name(lang),
        path: path,
        text: t(translations, lang, "expQuestion", { a: String(a), b: String(b), n: String(n) }),
        feedback: getExponentiationFeedbackFunction(lang, result),
    };
}

function getExponentiationFeedbackFunction(lang: Language, correctAnswer: number): FreeTextFeedbackFunction {
    return ({ text }) => {
        const userAnswer = parseInt(text.trim(), 10);
        return userAnswer === correctAnswer
            ? { correct: true, feedbackText: t(translations, lang, "feedbackCorrect") }
            : { correct: false, feedbackText: t(translations, lang, "feedbackIncorrect") };
    };
}

// Simple
function generateSimpleQuestion(lang: Language, path: string, random: Random): FreeTextQuestion {
    const a = random.int(0, 19);
    const b = random.int(2, 20);

    return {
        type: "FreeTextQuestion",
        name: ModTricks.name(lang),
        path: path,
        text: t(translations, lang, "simpleQuestion", { a: String(a), b: String(b) }),
        feedback: getSimpleFeedbackFunction(lang, a, b),
    };
}

function getSimpleFeedbackFunction(lang: Language, a: number, b: number): FreeTextFeedbackFunction {
    return ({ text }) => {
        const userAnswer = parseFloat(text.trim());
        if (isNaN(userAnswer) || !Number.isInteger(userAnswer)) {
            return { correct: false, feedbackText: t(translations, lang, "feedbackInvalid") };
        }

        if ((userAnswer - a) % b === 0) {
            return { correct: true, feedbackText: t(translations, lang, "feedbackCorrect") };
        } else {
            return { correct: false, feedbackText: t(translations, lang, "feedbackIncorrect") };
        }
    };
}
