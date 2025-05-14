# Contributing

## General

### Coding Style

We use prettier with the given config file. Just run it before checking in or configure your IDE to run it on save.

### Naming Conventions

- Variables, keys, etc.: camelCase
- Classes, Interfaces, Types, etc.: PascalCase
- Folders: dash-case
- Files
  - Containing Types, Interfaces, etc.: PascalCase
  - Other: camelCase
  - Tests have the extension `.test.ts`

### Git Workflow

New features should be developed in extra branches named `feat*`. These branches will be deployed on the testing page.

Bigger refactorings should be discussed first.

Please write meaningful commit messages. Commit messages can also have more than just a short title if needed.

### Adding a New Generator

To add a new generator to the website, follow these steps:

1. **Determine the Type**  
   Decide whether the generator is for:
  - **Demo**: Showcases a feature.  
    -  Add it to `packages/settings/questionSelection.demo.ts`.
  - **Stable**: Tests the student's knowledge on a specific topic.  
    - Add it to `packages/settings/questionSelection.stable.ts`.

2. **Choose or Create a Topic**  
   If the generator fits an existing topic (`slug`), simply add it to that topic’s `contents` list.  
   If not, create a new topic entry like this:

   ```typescript
   {
     slug: "example-slug",
     name: { de: "Beispiel Generator", en: "Example Generator" },
     contents: [Example1, Example2],
   }
   ```