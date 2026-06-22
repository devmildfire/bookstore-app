// Registers @testing-library/jest-dom matchers (toBeInTheDocument, toHaveClass,
// toBeDisabled, …) on Vitest's expect. Harmless for node-env tests; required for
// component (.test.tsx, jsdom) tests.
import '@testing-library/jest-dom/vitest'
