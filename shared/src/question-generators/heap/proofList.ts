import { BasicMultipleChoiceQuestion } from "@shared/api/BasicMultipleChoiceQuestion.ts"
import { Language } from "@shared/api/Language.ts"
import { Translations } from "@shared/utils/translations.ts"

const heapFrame: Translations = {
  en: {
    taskProofs:
      "Welche der folgenden Beweise zeigt die Korrektheit oder widerlegt diese, der folgenden Aussage?",
  },
  de: {
    taskProofs:
      "Welche der folgenden Beweise zeigt die Korrektheit oder widerlegt diese, der folgenden Aussage?",
  },
}

function addHeapProofFrame(lang: Language, question: string): string {
  const trl = heapFrame[lang]
  if (trl === undefined) throw new Error("Language not supported")
  return `
${trl.taskProofs}
 
> ${question}
`
}

export const heapProofList: BasicMultipleChoiceQuestion[] = [
  {
    frame: addHeapProofFrame,
    translations: {
      en: {
        text: "Die kleinste Priorität wird in einem beliebigen Max-Heap stets von einem Blatt gespeichert.",
        correctAnswers: [
          "Die Aussage ist wahr. Sei v der Knoten mit der kleinsten Priorität. Da die Prioritäten aller Knoten im Teilbaum von v höchsten so groß sein dürfen wie die von v selbst und v die kleinste Priorität hat folgt, dass alle Knoten im Teilbaum von v die gleiche Priorität haben. Das trifft insbesondere auf die Blätter in diesem Teilbaum zu und wenn der v keine Kindknoten hat, ist v selbst das Blatt.",
        ],
        wrongAnswers: [
          "Der Max-Heap ist so definiert, dass höhere Prioritäten stets weiter oben stehen, als kleinere Prioritäten. Daraus folgt, dass wir über einen beliebigen Knoten $v$ und dessen Elternknoten $v'$ wissen, dass $v'$ eine größere Priorität hat als $v$. Dies können wir induktiv bis bis auf die letzte Ebene des Heap fortsetzen, da nur hier Blätter sein können. Dies zeigt, dass die Aussage korrekt ist und die kleinste Priorität in einem Max-Heap von einem Blatt auf der letzten Ebene gespeichert wird.",
          "Die Behauptung ist falsch. Mit dem folgenden Gegenbeispiel können wir zeigen, dass die kleinste Priorität auch in der Wurzel stehen könnte: \n|$5$|$5$|$5$|\n|---|---|---|\n|#div_my-5#| |\n",
          "Die Aussage ist korrekt. In einem Hax-Heap muss die kleinste Priorität stets ganz unten im Heap sein. Da das letzte Element in jedem Heap in einem Blatt ist, folgt, dass die kleinste Priorität in einem Blatt sein muss.",
        ],
      },
      de: {
        text: "Die kleinste Priorität wird in einem beliebigen Max-Heap stets von einem Blatt gespeichert.",
        correctAnswers: [
          "Die Aussage ist wahr. Sei v der Knoten mit der kleinsten Priorität. Da die Prioritäten aller Knoten im Teilbaum von v höchsten so groß sein dürfen wie die von v selbst und v die kleinste Priorität hat folgt, dass alle Knoten im Teilbaum von v die gleiche Priorität haben. Das trifft insbesondere auf die Blätter in diesem Teilbaum zu und wenn der v keine Kindknoten hat, ist v selbst das Blatt.",
        ],
        wrongAnswers: [
          "Der Max-Heap ist so definiert, dass höhere Prioritäten stets weiter oben stehen, als kleinere Prioritäten. Daraus folgt, dass wir über einen beliebigen Knoten $v$ und dessen Elternknoten $v'$ wissen, dass $v'$ eine größere Priorität hat als $v$. Dies können wir induktiv bis bis auf die letzte Ebene des Heap fortsetzen, da nur hier Blätter sein können. Dies zeigt, dass die Aussage korrekt ist und die kleinste Priorität in einem Max-Heap von einem Blatt auf der letzten Ebene gespeichert wird.",
          "Die Behauptung ist falsch. Mit dem folgenden Gegenbeispiel können wir zeigen, dass die kleinste Priorität auch in der Wurzel stehen könnte: \n|$5$|$5$|$5$|\n|---|---|---|\n|#div_my-5#| |\n",
          "Die Aussage ist korrekt. In einem Hax-Heap muss die kleinste Priorität stets ganz unten im Heap sein. Da das letzte Element in jedem Heap in einem Blatt ist, folgt, dass die kleinste Priorität in einem Blatt sein muss.",
        ],
      },
    },
  },
  {
    frame: addHeapProofFrame,
    translations: {
      en: {
        text: `Die Funktion $\\textit{heapify}$, welche ein unsortiertes Feld in einen Heap verwandelt, hat bei Benutzung der $\\textit{Bottom-Up Konstruktion}$ eine Laufzeit von $\\Theta(n)$. Bei der $\\textit{Bottom-Up Konstruktion}$ wo auf alle Knoten in umgekehrter Level Order (Ebene für Ebene von unten nach oben) BUBBLEDOWN angewendet.`,
        correctAnswers: [
          `Die BubbleUp Funktion hat für jeden Knoten eine Laufzeit $O(h)$, wobei $h$ die Höhe des Knoten im Baum ist. Beim Durchlaufen in umgekehrter Level Order folgt: 1 Knoten Höhe $log(n)$, 2 Knoten Höhe $log(n-1)$, $\\dots$, $\\frac{n}{4}$ Knoten Höhe 1 und $\\frac{n}{2}$ Knoten Höhe 0. Sei $S$ die Summe der Laufzeiten: 
          \\[ S = \\frac{n}{4} \\cdot 1 + \\frac{n}{8} \\cdot 2 + \\frac{n}{16} \\cdot 3 + \\dots \\]
> $S - \\frac{S}{2} = \\frac{S}{2}$
          \\[ \\frac{S}{2} = (\\frac{n}{4} \\cdot 1 + \\frac{n}{8} \\cdot 2 + \\dots) - (\\frac{n}{8} \\cdot 1 + \\frac{n}{16} \\cdot 2 + \\dots ) \\]
          \\[ \\frac{S}{2} = \\frac{n}{4} + \\frac{n}{8} + \\dots \\leq \\frac{n}{2} \\]
          Daraus folgt, dass S in $\\Theta(n)$ ist und auch $\\textit{heapify}$ die Laufzeitschranke einhält.`,
        ],
        wrongAnswers: ["1", "2", "3"],
      },
      de: {
        text: `Die Funktion $\\textit{heapify}$, welche ein unsortiertes Feld in einen Heap verwandelt, hat bei Benutzung der $\\textit{Bottom-Up Konstruktion}$ eine Laufzeit von $\\Theta(n)$. Bei der $\\textit{Bottom-Up Konstruktion}$ wo auf alle Knoten in umgekehrter Level Order (Ebene für Ebene von unten nach oben) BUBBLEDOWN angewendet.`,
        correctAnswers: [
          `Die BubbleUp Funktion hat für jeden Knoten eine Laufzeit $O(h)$, wobei $h$ die Höhe des Knoten im Baum ist. Beim Durchlaufen in umgekehrter Level Order folgt: 1 Knoten Höhe $log(n)$, 2 Knoten Höhe $log(n-1)$, $\\dots$, $\\frac{n}{4}$ Knoten Höhe 1 und $\\frac{n}{2}$ Knoten Höhe 0. Sei $S$ die Summe der Laufzeiten: 
          \\[ S = \\frac{n}{4} \\cdot 1 + \\frac{n}{8} \\cdot 2 + \\frac{n}{16} \\cdot 3 + \\dots \\]
> $S - \\frac{S}{2} = \\frac{S}{2}$
          \\[ \\frac{S}{2} = (\\frac{n}{4} \\cdot 1 + \\frac{n}{8} \\cdot 2 + \\dots) - (\\frac{n}{8} \\cdot 1 + \\frac{n}{16} \\cdot 2 + \\dots ) \\]
          \\[ \\frac{S}{2} = \\frac{n}{4} + \\frac{n}{8} + \\dots \\leq \\frac{n}{2} \\]
          Daraus folgt, dass S in $\\Theta(n)$ ist und auch $\\textit{heapify}$ die Laufzeitschranke einhält.`,
        ],
        wrongAnswers: ["Some wrong answer 1", "A second wrong answer", "And also a third one"],
      },
    },
  },
]
