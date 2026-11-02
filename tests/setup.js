import '@testing-library/jest-dom/vitest'

// jsdom не реализует scrollIntoView — заглушка для компонентов чата
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || (() => {})
