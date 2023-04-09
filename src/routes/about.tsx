import { useTranslation } from "react-i18next"
import { AiFillGithub } from "react-icons/ai"
import { SiDuolingo, SiReact } from "react-icons/si"
import { Link } from "react-router-dom"

export function About() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto mb-16 max-w-lg p-3">
      <h1>{t("About")}</h1>
      <p>
        This application helps you practice some of the skills that are relevant
        for the exam of a typical algorithms and data structures course. The
        site is supposed to be both useful and fun!
      </p>
      <h2 className="mt-5">Active learning</h2>
      <p>
        This site is supposed to complement lectures, videos, and textbooks by
        providing you with a set of interactive exercises that will help you to
        practice the skills that you have seen in class. You get instant
        feedback and can try as often as you like.
      </p>
      <h2 className="mt-5">Spaced repetition</h2>
      <p>
        Our brains forget things rather quickly if we do not repeatedly try to
        remember them. For this reason,{" "}
        <Link to="https://en.wikipedia.org/wiki/Spaced_repetition">
          spaced repetition
        </Link>{" "}
        is an absolutely essential learning technique! On this site, you will be
        asked to solve the same type of problem multiple times, but with
        increasing intervals between the repetitions. This way, you will be able
        to remember the skill for a much longer time.
      </p>
      <h2 className="mt-5">Individually adaptive</h2>
      <p>
        To implement spaced repetition, we use{" "}
        <Link to="https://doi.org/10.18653/v1/p16-1174">
          half-life regression
        </Link>{" "}
        as the model for how your memory works. We employ a simple artificial
        intelligence algorithm to identify which problems you tend to struggle
        with, and present them to you more often. Over time, the algorithm
        adapts to your demonstrated skill strength.
      </p>
      <h2 className="mt-5">Development</h2>
      <p>
        This site is under heavy development, utterly incomplete, and things
        might break without notice! Our plan for this site is to provide
        exam-level questions for as many intended learning outcomes of the
        algorithms and data structures courses. This should be possible for all
        learning outcomes at levels &ldquo;remember/understand/apply&rdquo;
        according to{" "}
        <Link to="https://cft.vanderbilt.edu/guides-sub-pages/blooms-taxonomy/">
          Bloom&apos;s taxonomy
        </Link>
        .
      </p>
      <h2 className="mt-5">Source Code</h2>
      <p>
        This site is built in{" "}
        <Link to="https://reactjs.org/">
          <SiReact className="inline" />
          React
        </Link>{" "}
        and is available as open source software on{" "}
        <a href="https://github.com/holgerdell/algo-learn/">
          <AiFillGithub className="inline" />
          github
        </a>
        . Pull requests are welcome, feel free to contribute!
      </p>
      <h2 className="mt-5">Inspiration</h2>
      <p>
        This site is heavily inspired by the popular language learning tool{" "}
        <Link to="https://duolingo.com/">
          <SiDuolingo className="inline" />
          duolingo
        </Link>{" "}
        and its research division{" "}
        <Link to="https://research.duolingo.com/">duolingo research</Link>.
      </p>{" "}
      <h2 className="mt-5">Authors</h2>
      <p>
        Created by <a href="https://holgerdell.com">Holger Dell</a> (2023).
      </p>
    </div>
  )
}