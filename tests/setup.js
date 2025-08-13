// Test setup file for vitest
import '@testing-library/dom';
import { vi } from 'vitest';

// Mock crypto API globally
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    subtle: {
      digest: vi.fn((algorithm, data) => {
        // Mock hash results based on algorithm
        const mockHashes = {
          'SHA-1': new Uint8Array([0x2a, 0xae, 0x6c, 0x35, 0xc9, 0x4f, 0xcf, 0xb4, 0x15, 0xdb, 0xe9, 0x5f, 0x40, 0x8b, 0x9c, 0xe9, 0x1e, 0xe8, 0x46, 0xed]).buffer,
          'SHA-256': new Uint8Array(32).fill(0xab).buffer,
          'SHA-384': new Uint8Array(48).fill(0xcd).buffer,
          'SHA-512': new Uint8Array(64).fill(0xef).buffer
        };
        return Promise.resolve(mockHashes[algorithm] || new Uint8Array(32).fill(0).buffer);
      })
    }
  }
});

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    clipboard: {
      writeText: vi.fn().mockResolvedValue()
    }
  }
});

// Mock Worker
global.Worker = vi.fn(() => ({
  postMessage: vi.fn(),
  addEventListener: vi.fn(),
  terminate: vi.fn()
}));

// Mock document.execCommand
Object.defineProperty(document, 'execCommand', {
  value: vi.fn().mockReturnValue(true)
});

// Mock fetch for tests
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock window.location
delete window.location;
window.location = { 
  href: 'http://localhost:8081/',
  hash: '',
  pathname: '/',
  search: '',
  reload: vi.fn(),
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock console.log for cleaner test output
global.console.log = vi.fn();