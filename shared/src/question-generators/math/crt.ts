import { Language } from "@shared/api/Language";
import {
  FreeTextFeedbackFunction,
  FreeTextQuestion,
  FreeTextFormatFunction,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator";
import { serializeGeneratorCall } from "@shared/api/QuestionRouter";
import {
    areCoprime,
    solveCRT
} from "@shared/question-generators/math/utils";
import Random from "@shared/utils/random";
import { t, tFunctional, Translations } from "@shared/utils/translations";

const translations: Translations = {
  en: {
    name: "Chinese Remainder Theorem",
    description: "Solve systems of congruences using the Chinese Remainder Theorem.",
    crtQuestion: "Solve the system of congruences: \\[ {{text}} \\text{.}\\]",
    crtBottomText: "Provide your answer in the form: $y\\pmod{z}$.",
    feedbackInvalid: "Your answer is not valid.",
    feedbackCorrect: "Correct!",
    feedbackIncorrect: "Incorrect.",
    feedbackIncomplete: "Incomplete or too complex",
  },
  de: {
    name: "Chinesischer Restsatz",
    description: "Lösen Sie Systeme von Kongruenzen mit dem Chinesischen Restsatz.",
    crtQuestion: "Löse das System von Kongruenzen: \\[ {{text}} \\text{.}\\]",
    crtBottomText: "Gib deine Antwort in der Form $y\\pmod{z}$ an.",
    feedbackInvalid: "Deine Antwort ist ungültig.",
    feedbackCorrect: "Richtig!",
    feedbackIncorrect: "Falsch.",
    feedbackIncomplete: "Nicht vollständig oder zu komplex",
  },
};

export const CRT: QuestionGenerator = {
  id: "crt",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["modular arithmetic", "Chinese Remainder Theorem", "crt"],
  languages: ["en", "de"],
  author: "Janette Welker",
  license: "MIT",
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["crt"],
    },
  ],

  generate: (lang, parameters, seed) => {
    const path = serializeGeneratorCall({
      generator: CRT,
      lang,
      parameters,
      seed,
    });

    const random = new Random(seed);
    return generateCRTQuestion(lang, path, random);
  },
};

function generateCRTQuestion(lang: Language, path: string, random: Random) {
  //determine number of congruences
  const numCongruences = random.int(2, 4)
  // congruence with a as remainder within (1, 20) and n as modulus within (2, 20)
  const congruences: { a: number; n: number }[] = []
  const text: string[] = []

  // generate system of congruences
  for (let i = 0; i < numCongruences; i++) {
    const a = random.int(1, 20)
    let n: number

    // find new modulus that is coprime to preceding moduli
    do {
      n = random.int(2, 20)
    } while (congruences.some(({ n: precedingModulus }) => !areCoprime(n, precedingModulus)))

    congruences.push({ a, n })
    text.push(`x \\equiv ${a} \\pmod{ ${n} }`)
  }

  const crtValue = solveCRT(congruences)
  const commonModulus = congruences.reduce((acc, { n }) => acc * n, 1)

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: CRT.name(lang),
    path: path,
    text: t(translations, lang, "crtQuestion", { text: text.join(", \\\\") }),
    prompt: `$x \\equiv $`,
    bottomText: t(translations, lang, "crtBottomText"),
    feedback: getCRTFeedbackFunction(lang, crtValue, commonModulus),
    checkFormat: getCRTCheckFormatFunction(lang),
  };

  return { question, testing: { crtValue, commonModulus } };
}

function getCRTCheckFormatFunction(lang: Language): FreeTextFormatFunction {
  return ({ text }) => {
    if (text.trim() === "") {
      return { valid: false, message: t(translations, lang, "feedbackIncomplete") };
    }

    // ensure format "$value (mod $modulus)" and inform user
    const pattern = /^(\d+)\s*\(\s*mod\s*(\d+)\s*\)$/i;
    const match = text.trim().match(pattern);
    if (!match) {
      return { valid: false, message: t(translations, lang, "feedbackIncomplete") };
    }

    return { valid: true };
  };
}

function getCRTFeedbackFunction(
  lang: Language,
  crtValue: number,
  commonModulus: number
): FreeTextFeedbackFunction {
  return ({ text }) => {
    // match "y (mod z)" (optional whitespaces) and capture y and z
    const pattern = /^(\d+)\s*\(\s*mod\s*(\d+)\s*\)$/i
    const match = text.trim().match(pattern)

    // dismiss incorrectly formatted answers
    if (!match) {
      return { correct: false, feedbackText: t(translations, lang, "feedbackInvalid") }
    }

    // y: userValue and z: userModulus
    let userValue = parseInt(match[1], 10)
    let userModulus = parseInt(match[2], 10)

    // normalize to range [0, commonModulus]
    userValue = ((userValue % commonModulus) + commonModulus) % commonModulus
    crtValue = ((crtValue % commonModulus) + commonModulus) % commonModulus

    return userModulus !== commonModulus || userValue !== crtValue
      ? { correct: false, feedbackText: t(translations, lang, "feedbackIncorrect") }
      : { correct: true, feedbackText: t(translations, lang, "feedbackCorrect") }
  };
}
