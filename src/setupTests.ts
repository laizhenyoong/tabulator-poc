// Jest setup file for testing configuration
import '@testing-library/jest-dom';

// Mock Tabulator for testing
jest.mock('tabulator-tables', () => ({
  TabulatorFull: jest.fn().mockImplementation(() => ({
    setData: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    getSelectedRows: jest.fn(() => []),
    getRows: jest.fn(() => []),
    clearFilter: jest.fn(),
    setFilter: jest.fn(),
    setSort: jest.fn(),
    clearSort: jest.fn(),
  }))
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve('')),
  },
});