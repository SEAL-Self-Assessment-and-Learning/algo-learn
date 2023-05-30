import { OldQuestionGenerator } from "../../hooks/useSkills"
import {
  BasicMCQuestion,
  PreciseLanguageMeta,
} from "../../utils/PreciseLanguageMeta"

const questions: BasicMCQuestion[] = [
  {
    ////////////////////////////////////////////
    parameters: {
      m: "mnktpqxyMNKTQPXY",
      n: "mnktpqxyMNKTQPXY",
    },
    translations: {
      en_US: {
        text: "Let ${{m}}$ and ${{n}}$ be integers such that $0 < {{m}} < {{n}}$ holds.",
        correctAnswers: [
          "${{m}}$ and ${{n}}$ are both positive",
          "${{m}}$ is less than ${{n}}$",
          "it is possible that ${{m}}=7$ and ${{n}}=9$",
        ],
        wrongAnswers: [
          "${{m}}$ is greater than ${{n}}$",
          "${{m}}$ and ${{n}}$ can both be equal to zero",
          "${{m}}$ can be a negative number",
          "${{m}}$ is equal to ${{n}}$",
        ],
      },
      de_DE: {
        text: "Seien ${{m}}$ und ${{n}}$ ganze Zahlen, so dass $0 < {{m}} < {{n}}$ gilt.",
        correctAnswers: [
          "${{m}}$ und ${{n}}$ sind beide positiv",
          "${{m}}$ ist kleiner als ${{n}}$",
          "es ist möglich, dass ${{m}}=7$ und ${{n}}=9$ ist",
        ],
        wrongAnswers: [
          "${{m}}$ ist größer als ${{n}}$",
          "${{m}}$ und ${{n}}$ können beide Null sein",
          "${{m}}$ kann eine negative Zahl sein",
          "${{m}}$ ist gleich ${{n}}$",
        ],
      },
    },
  },
  {
    ////////////////////////////////////////////
    parameters: {
      x: "xyznXYZN",
      S: "STUVWXY",
    },
    translations: {
      en_US: {
        text: "Let ${{x}}$ be an element of a set ${{S}}$ such that ${{S}}$ is a subset of the integers and ${{x}} > 0$.",
        correctAnswers: [
          "${{x}}$ is a positive integer",
          "${{x}}$ is an element of ${{S}}$",
          "${{x}}$ cannot be equal to $-8$",
          "${{x}}$ cannot be equal to $0$",
          "${{S}}$ cannot be the empty set",
        ],
        wrongAnswers: [
          "${{x}}$ cannot be equal to $7$",
          "${{x}}$ can be any integer",
          "${{x}}$ is a negative integer",
          "${{S}}$ may contain negative numbers",
        ],
      },
      de_DE: {
        text: "Sei ${{x}}$ ein Element einer Menge ${{S}}$, so dass ${{S}}$ eine Teilmenge der ganzen Zahlen ist und ${{x}} > 0$.",
        correctAnswers: [
          "${{x}}$ ist eine positive ganze Zahl",
          "${{x}}$ ist ein Element von ${{S}}$",
          "${{x}}$ kann nicht gleich $-8$ sein",
          "${{x}}$ kann nicht gleich $0$ sein",
          "${{S}}$ kann nicht die leere Menge sein",
        ],
        wrongAnswers: [
          "${{x}}$ kann nicht gleich $7$ sein",
          "${{x}}$ kann eine beliebige ganze Zahl sein",
          "${{x}}$ ist eine negative ganze Zahl",
          "${{S}}$ kann negative Zahlen enthalten",
        ],
      },
    },
  },
  {
    ////////////////////////////////////////////
    parameters: {
      x: "xyznXYZN",
      y: "xyznXYZN",
    },
    translations: {
      en_US: {
        text: "Let ${{x}}$ be an even integer between $5$ and $9$, and let ${{y}}={{x}}/2$.",
        correctAnswers: [
          "${{x}}$ is an even integer",
          "${{y}}$ is a positive integer",
          "${{y}}$ can be equal to $3$",
          "${{y}}$ is at least $2$",
          "${{x}}$ is at most $9$",
        ],
        wrongAnswers: [
          "${{y}}$ can be equal to $2$",
          "${{y}}$ is an odd integer",
          "${{x}}$ is equal to $6$",
          "${{y}}$ is equal to $3$",
          "${{x}}$ can be any even integer",
        ],
      },
      de_DE: {
        text: "Sei ${{x}}$ eine gerade natürliche Zahl zwischen $5$ und $9$, und sei ${{y}}={{x}}/2$.",
        correctAnswers: [
          "${{x}}$ ist eine gerade Zahl",
          "${{y}}$ ist eine positive natürliche Zahl",
          "${{y}}$ kann gleich $3$ sein",
          "${{y}}$ ist mindestens $2$",
          "${{x}}$ ist höchstens $9$",
        ],
        wrongAnswers: [
          "${{y}}$ kann gleich $2$ sein",
          "${{y}}$ ist eine ungerade Zahl",
          "${{x}}$ ist gleich $6$",
          "${{y}}$ ist gleich $3$",
          "${{x}}$ kann jede gerade Zahl sein",
        ],
      },
    },
  },
  {
    ////////////////////////////////////////////
    parameters: {
      A: "ABCDSTUVW",
      B: "ABCDSTUVW",
      y: "abcdxyznmktspqr",
    },
    translations: {
      en_US: {
        text: "Let ${{A}}$ and ${{B}}$ be two sets such that every element of ${{A}}$ is also an element of ${{B}}$. Let ${{y}}$ be an element of ${{A}}$.",
        correctAnswers: [
          "${{A}}$ is a subset of ${{B}}$",
          "${{B}}$ could be a subset of ${{A}}$",
          "${{y}}$ is an element of ${{B}}$",
          "${{y}}$ could be any element of set ${{A}}$",
        ],
        wrongAnswers: [
          "${{A}}$ is a superset of ${{B}}$",
          "${{B}}$ is a subset of ${{A}}$",
          "${{A}}$ and ${{B}}$ must have the same number of elements",
          "${{y}}$ must be the only element of ${{A}}$",
        ],
      },
      de_DE: {
        text: "Seien ${{A}}$ und ${{B}}$ zwei Mengen, so dass jedes Element von ${{A}}$ auch ein Element von ${{B}}$ ist. Sei ${{y}}$ ein Element von ${{A}}$.",
        correctAnswers: [
          "${{A}}$ ist eine Teilmenge von ${{B}}$",
          "${{B}}$ könnte eine Teilmenge von ${{A}} sein$",
          "${{y}}$ ist ein Element von ${{B}}$",
          "${{y}}$ könnte jedes Element der Menge ${{A}}$ sein",
        ],
        wrongAnswers: [
          "${{A}}$ ist eine Obermenge von ${{B}}$",
          "${{B}}$ ist eine Teilmenge von ${{A}}$",
          "${{A}}$ und ${{B}}$ müssen die gleiche Anzahl von Elementen haben",
          "${{y}}$ muss das einzige Element von ${{A}}$ sein",
        ],
      },
    },
  },
]

export const MathPreciseLanguage: OldQuestionGenerator = PreciseLanguageMeta(
  "math/precise-language",
  "math.precise-language.title",
  questions
)