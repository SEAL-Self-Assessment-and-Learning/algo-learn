# algo-learn

This is the prototype of a modern learning platform for a typical algorithms and data structures course.

## Design philosophy

- We prefer quality to quantity: It is important to make the user experience as smooth as possible, before expanding the content.
- We are incorporating the principles of [constructive alignment](https://en.wikipedia.org/wiki/Constructive_alignment), [active learning](https://en.wikipedia.org/wiki/Active_learning), [spaced repetition](https://en.wikipedia.org/wiki/Spaced_repetition), and [gamification](https://en.wikipedia.org/wiki/Gamification_of_learning).

## Development

### Install modern yarn

[Install yarn](https://yarnpkg.com/getting-started/install) (v3+):

```bash
corepack enable
corepack prepare yarn@stable --activate
```

Run yarn to install the project's dependencies:

```bash
yarn
```

This command will start a local HTTP server for development:

```bash
yarn dev
```

### Configure your IDE

In principle, you're now in position to start development. However, we strongly recommend you use VS Code as your IDE and install the following extensions:

- [Visual Studio Code](https://code.visualstudio.com/)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Auto Rename Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-rename-tag)
- [i18n Ally](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally)
- [ZipFS - a zip file system](https://marketplace.visualstudio.com/items?itemName=arcanis.vscode-zipfs)
- optional: [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)
- optional: [Atom One Dark Theme](https://marketplace.visualstudio.com/items?itemName=akamud.vscode-theme-onedark)

Then follow [these instructions](https://yarnpkg.com/getting-started/editor-sdks#vscode) to allow VS Code to use the project's PnP SDK.

### Run tests

Run all tests (format checker, unit tests, linter, type checker):
```bash
yarn test
```

### Build for production

```bash
yarn build
```

### Major libraries used

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [i18next](https://www.i18next.com/)

### Staging and Deployment

Continuous integration is provided by GitHub Actions, see [`.github/workflows`](.github/workflows). In short:

- Push events to the `main` branch and pull requests trigger the staging build, the result is deployed in the staging area at <https://tcs.uni-frankfurt.de/algo-learn-testing/>.
- Push events to the `stable` branch trigger the production build, the result is deployed at <https://tcs.uni-frankfurt.de/algo-learn/>.

## License

[MIT](LICENSE)
