# Contributing

## General

### Coding Style

We use prettier with the given config file. Just run it before checking in or configure your IDE to run it on save.

Variables, keys, etc. are named in camelCase.  
Classes, Interfaces, Types, etc. are named in PascalCase.


### Git Workflow

New features should be developed in extra branches named `feat*`. These branches will be deployed on the testing page.

Bigger refactorings should be discussed first.

## Writing generators

Question generators are located in `shared/src/question-generators`.
Each generator should have its own folder containing the generator as well as unit tests. You can find an example in `example/example`

To access a new generator though the website you need to set a path to the generator in `settings/questionSelections.ts`. If the chosen path has no common prefix path with the other generators, you can add human-readable names for the new generator group in `settings/generator-locales` and an image in `settings/questionSelections.ts`