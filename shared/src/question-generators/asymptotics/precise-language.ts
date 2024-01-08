import { QuestionGenerator } from "../../api/QuestionGenerator"
import { tFunctional } from "../../utils/translations"
import {
  BasicMCQuestion,
  PreciseLanguageMeta,
} from "../meta/PreciseLanguageMeta"

const questions: BasicMCQuestion[] = [
  {
    ////////////////////////////////////////////
    parameters: {
      f: "fgh",
      g: "fgh",
      n: "mnktpqxyMNKTQPXY",
    },
    translations: {
      en: {
        text: "Let ${{f}},{{g}}\\colon\\mathbb{N}\\to\\mathbb{N}$ be functions with ${{f}}({{n}}) = O({{g}}({{n}}))$.",
        correctAnswers: [
          "As ${{n}}$ grows large, the upper bound on ${{f}}({{n}})$ is at most a constant times ${{g}}({{n}})$",
        ],
        wrongAnswers: [
          "${{g}}({{n}})$ is always larger than ${{f}}({{n}})$",
          "${{f}}({{n}})$ grows at the same rate as ${{g}}({{n}})$",
          "${{f}}({{n}})$ equals ${{g}}({{n}})$ for all ${{n}}$",
          "${{f}}({{n}})$ is the same function as ${{g}}({{n}})$",
        ],
      },
      de: {
        text: "Seien ${{f}},{{g}}\\colon\\mathbb{N}\\to\\mathbb{N}$ Funktionen mit ${{f}}({{n}}) = O({{g}}({{n}}))$.",
        correctAnswers: [
          "Wenn ${{n}}$ groß wird, ist ${{f}}({{n}})$ höchstens so groß wie ein konstantes Vielfaches von ${{g}}({{n}})$",
        ],
        wrongAnswers: [
          "${{g}}({{n}})$ ist immer größer als ${{f}}({{n}})$",
          "${{f}}({{n}})$ wächst in der gleichen Rate wie ${{g}}({{n}})$",
          "${{f}}({{n}})$ ist gleich ${{g}}({{n}})$ für alle ${{n}}$",
          "${{f}}({{n}})$ ist die gleiche Funktion wie ${{g}}({{n}})$",
        ],
      },
    },
  },
  {
    ////////////////////////////////////////////
    parameters: {
      n: "mnktpqxyMN",
    },
    translations: {
      en: {
        text: "The algorithm operates in $O({{n}} \\log {{n}})$ time complexity.",
        correctAnswers: [
          "As ${{n}}$ grows, the algorithm's running time grows in the order of ${{n}}$ times the logarithm of ${{n}}$",
        ],
        wrongAnswers: [
          "The algorithm will take exactly ${{n}} \\log {{n}}$ milliseconds to run",
          "The algorithm's running time will increase linearly with ${{n}}$",
          "The algorithm's running time will increase logarithmically with ${{n}}$",
          "The algorithm will take exactly ${{n}} \\log {{n}}$ steps to complete",
          "The algorithm will take exactly $\\Theta({{n}} \\log {{n}})$ steps to complete",
        ],
      },
      de: {
        text: "Der Algorithmus arbeitet mit einer Zeitkomplexität von $O({{n}} \\log {{n}})$.",
        correctAnswers: [
          "Mit zunehmendem ${{n}}$ wächst die Laufzeit des Algorithmus in der Größenordnung von ${{n}}$ mal dem Logarithmus von ${{n}}$",
        ],
        wrongAnswers: [
          "Der Algorithmus benötigt genau ${{n}} \\log {{n}}$ Millisekunden zur Ausführung",
          "Die Laufzeit des Algorithmus steigt linear mit ${{n}}$",
          "Die Laufzeit des Algorithmus steigt logarithmisch mit ${{n}}$",
          "Der Algorithmus benötigt genau ${{n}} \\log {{n}}$ Schritte zur Vollendung",
          "Der Algorithmus wird genau $\\Theta({{n}} \\log {{n}})$ Schritte zur Vollendung benötigen",
        ],
      },
    },
  },
  {
    ////////////////////////////////////////////
    parameters: {
      f: "fgh",
      g: "fgh",
      n: "mnktpqxyMNKTQPXY",
    },
    translations: {
      en: {
        text: "Let ${{f}},{{g}}\\colon\\mathbb{N}\\to\\mathbb{N}$ be functions with ${{f}}({{n}}) = \\Omega({{g}}({{n}}))$.",
        correctAnswers: [
          "As ${{n}}$ grows large, the lower bound on ${{f}}({{n}})$ is at least a constant times ${{g}}({{n}})$",
        ],
        wrongAnswers: [
          "${{f}}({{n}})$ is always less than ${{g}}({{n}})$",
          "${{f}}({{n}})$ grows at the same rate as ${{g}}({{n}})$",
          "${{f}}({{n}})$ equals ${{g}}({{n}})$ for all ${{n}}$",
          "${{f}}({{n}})$ is the same function as ${{g}}({{n}})$",
        ],
      },
      de: {
        text: "Seien ${{f}},{{g}}\\colon\\mathbb{N}\\to\\mathbb{N}$ Funktionen mit ${{f}}({{n}}) = \\Omega({{g}}({{n}}))$.",
        correctAnswers: [
          "Wenn ${{n}}$ groß wird, ist ${{f}}({{n}})$ mindestens so groß wie ein konstantes Vielfaches von ${{g}}({{n}})$",
        ],
        wrongAnswers: [
          "${{f}}({{n}})$ ist immer kleiner als ${{g}}({{n}})$",
          "${{f}}({{n}})$ wächst in der gleichen Rate wie ${{g}}({{n}})$",
          "${{f}}({{n}})$ ist gleich ${{g}}({{n}})$ für alle ${{n}}$",
          "${{f}}({{n}})$ ist die gleiche Funktion wie ${{g}}({{n}})$",
        ],
      },
    },
  },
  {
    ////////////////////////////////////////////
    parameters: {
      f: "fgh",
      g: "fgh",
      n: "mnktpqxyMNKTQPXY",
    },
    translations: {
      en: {
        text: "Let ${{f}},{{g}}\\colon\\mathbb{N}\\to\\mathbb{N}$ be functions with ${{f}}({{n}}) = \\Theta({{g}}({{n}}))$.",
        correctAnswers: [
          "As ${{n}}$ grows large, ${{f}}({{n}})$ has both an upper and a lower bound that are proportional to ${{g}}({{n}})$",
        ],
        wrongAnswers: [
          "${{g}}({{n}})$ is always larger than ${{f}}({{n}})$",
          "${{f}}({{n}})$ grows at a different rate than ${{g}}({{n}})$",
          "${{f}}({{n}})$ equals ${{g}}({{n}})$ for all ${{n}}$",
          "${{f}}({{n}})$ is the same function as ${{g}}({{n}})$",
        ],
      },
      de: {
        text: "Seien ${{f}},{{g}}\\colon\\mathbb{N}\\to\\mathbb{N}$ Funktionen mit ${{f}}({{n}}) = \\Theta({{g}}({{n}}))$.",
        correctAnswers: [
          "Wenn ${{n}}$ groß wird, hat ${{f}}({{n}})$ sowohl eine obere als auch eine untere Schranke, die proportional zu ${{g}}({{n}})$ ist",
        ],
        wrongAnswers: [
          "${{g}}({{n}})$ ist immer größer als ${{f}}({{n}})$",
          "${{f}}({{n}})$ wächst mit einer anderen Rate als ${{g}}({{n}})$",
          "${{f}}({{n}})$ ist gleich ${{g}}({{n}})$ für alle ${{n}}$",
          "${{f}}({{n}})$ ist die gleiche Funktion wie ${{g}}({{n}})$",
        ],
      },
    },
  },
  {
    ////////////////////////////////////////////
    parameters: {
      n: "mnktpqxyMNKTQPXY",
    },
    translations: {
      en: {
        text: "An algorithm has a best-case running time of $O(1)$ and a worst-case running time of $O({{n}}^2)$.",
        correctAnswers: [
          "In the best case scenario, the running time of the algorithm is constant",
          "In the best case scenario, the running time of the algorithm is at most linear with respect to {{n}}",
          "In the worst case scenario, the running time of the algorithm is at most quadratic with respect to {{n}}",
        ],
        wrongAnswers: [
          "In the best case scenario, the running time of the algorithm grows linearly with {{n}}",
          "In the worst case scenario, the running time of the algorithm is exactly quadratic with respect to {{n}}",
          "The average running time of the algorithm is $O({{n}})$",
        ],
      },
      de: {
        text: "Ein Algorithmus hat eine *best-case* Laufzeit von $O(1)$ und eine *worst-case* Laufzeit von $O({{n}}^2)$.",
        correctAnswers: [
          "Im besten Fall hat der Algorithmus konstante Laufzeit",
          "Im besten Fall ist die Laufzeit des Algorithmus höchstens linear in {{n}}",
          "Im schlimmsten Fall ist die Laufzeit des Algorithmus höchstens quadratisch in {{n}}",
        ],
        wrongAnswers: [
          "Im besten Fall ist die Laufzeit des Algorithmus mindestens linear in {{n}}",
          "Im schlimmsten Fall ist die Laufzeit des Algorithmus genau quadratisch in {{n}}",
          "Die durchschnittliche Laufzeit des Algorithmus ist $O({{n}})$",
        ],
      },
    },
  },

  {
    ////////////////////////////////////////////
    parameters: {
      n: "mnktpqxyMNKTQPXY",
    },
    translations: {
      en: {
        text: "An algorithm has a best-case running time of $\\Omega(1)$ and a worst-case running time of $\\Theta({{n}}^2)$.",
        correctAnswers: [
          "In the best case scenario, the running time of the algorithm is at most quadratic with respect to {{n}}",
          "In the worst case scenario, the running time of the algorithm is at most quadratic with respect to {{n}}",
          "In the worst case scenario, the running time of the algorithm is exactly quadratic with respect to {{n}}",
        ],
        wrongAnswers: [
          "In the best case scenario, the running time of the algorithm is constant",
          "In the best case scenario, the running time of the algorithm grows linearly with {{n}}",
          "The average running time of the algorithm is $O({{n}})$",
        ],
      },
      de: {
        text: "Ein Algorithmus hat eine *best-case* Laufzeit von $\\Omega(1)$ und eine *worst-case* Laufzeit von $\\Theta({{n}}^2)$.",
        correctAnswers: [
          "Im besten Fall wächst die Laufzeit des Algorithmus höchstens quadratisch mit {{n}}",
          "Im schlimmsten Fall wächst die Laufzeit des Algorithmus höchstens quadratisch mit {{n}}",
          "Im schlimmsten Fall wächst die Laufzeit des Algorithmus genau quadratisch mit {{n}}",
        ],
        wrongAnswers: [
          "Im besten Fall hat der Algorithmus konstante Laufzeit",
          "Im besten Fall wächst die Laufzeit des Algorithmus linear mit {{n}}",
          "Die durchschnittliche Laufzeit des Algorithmus ist $O({{n}})$",
        ],
      },
    },
  },
]

const translations = {
  en: { title: "Precise phrasing: Oh-Notation" },
  de: { title: "Präzises Formulieren: Oh-Notation" },
}

export const AsymptoticsPreciseLanguage: QuestionGenerator =
  PreciseLanguageMeta(
    tFunctional(translations, "title"),
    questions,
  )
