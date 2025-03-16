import { beforeAll, afterAll, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import '@testing-library/jest-dom';

// Create a new JSDOM instance
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});

// Set up global variables that would be available in a browser
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Mock console methods to catch errors
const originalConsoleError = console.error;
console.error = (...args) => {
  originalConsoleError(...args);
  // Log to vitest
  if (args[0] instanceof Error) {
    console.log('Error in test:', args[0].message);
  }
};

// Mock browser API
global.browser = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn()
    }
  },
  runtime: {
    onMessage: {
      addListener: vi.fn()
    }
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn()
  },
  downloads: {
    download: vi.fn(),
    cancel: vi.fn(),
    resume: vi.fn(),
    onCreated: {
      addListener: vi.fn()
    },
    onChanged: {
      addListener: vi.fn()
    }
  }
};

// Mock window.getComputedStyle
global.getComputedStyle = vi.fn().mockReturnValue({
  display: 'none',
  visibility: 'visible',
  // Add other CSS properties as needed
});

beforeAll(() => {
  // Any additional setup before all tests
});

afterAll(() => {
  // Cleanup
}); 