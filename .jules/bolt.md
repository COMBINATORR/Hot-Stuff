## 2024-06-23 - Avoid JSX in Vitest Mock Configurations
**Learning:** When using `vi.mock` inside configuration files like `vitest.setup.js` (which may be loaded and parsed before standard Babel/JSX transformers run or outside their scope), including raw JSX (e.g., `<div>{children}</div>`) can cause parsing errors (`Unexpected JSX expression`).
**Action:** Use `React.createElement` instead of JSX within setup file mocks (e.g., `React.createElement('div', props, children)`) to ensure the file can be parsed correctly by Vite's import analyzer across the entire test suite.
