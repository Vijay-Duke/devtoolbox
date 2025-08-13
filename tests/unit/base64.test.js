import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { Base64Tool } from '../../js/tools/base64.js';

// Mock the feedback utility
vi.mock('../../js/utils/feedback.js', () => ({
  feedback: {
    showToast: vi.fn(),
    copyToClipboard: vi.fn()
  }
}));

describe('Base64Tool', () => {
  let dom;
  let document;
  let container;
  let base64Tool;

  beforeEach(() => {
    // Create a DOM environment
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html><body>
        <div id="test-container"></div>
      </body></html>
    `);
    
    global.window = dom.window;
    global.document = dom.window.document;
    
    document = dom.window.document;
    container = document.getElementById('test-container');
    
    base64Tool = new Base64Tool();
    base64Tool.init('test-container');
  });

  describe('Initialization', () => {
    it('should initialize with encode mode by default', () => {
      expect(base64Tool.mode).toBe('encode');
    });

    it('should render the UI correctly', () => {
      expect(container.querySelector('#base64-input')).toBeTruthy();
      expect(container.querySelector('#base64-output')).toBeTruthy();
      expect(container.querySelector('[data-mode="encode"]')).toBeTruthy();
      expect(container.querySelector('[data-mode="decode"]')).toBeTruthy();
    });
  });

  describe('Base64 Encoding', () => {
    it('should encode simple text correctly', () => {
      const result = base64Tool.encode('Hello, World!');
      expect(result).toBe('SGVsbG8sIFdvcmxkIQ==');
    });

    it('should encode UTF-8 characters correctly', () => {
      const result = base64Tool.encode('Hello 世界');
      // btoa(unescape(encodeURIComponent('Hello 世界')))
      expect(result).toBe('SGVsbG8g5LiW55WM');
    });

    it('should create URL-safe encoding when requested', () => {
      const input = 'This is a test string with special characters: +/=';
      const result = base64Tool.encode(input, true);
      expect(result).not.toContain('+');
      expect(result).not.toContain('/');
      expect(result).not.toContain('=');
    });
  });

  describe('Base64 Decoding', () => {
    it('should decode simple base64 correctly', () => {
      const result = base64Tool.decode('SGVsbG8sIFdvcmxkIQ==');
      expect(result).toBe('Hello, World!');
    });

    it('should decode UTF-8 base64 correctly', () => {
      const result = base64Tool.decode('SGVsbG8g5LiW55WM');
      expect(result).toBe('Hello 世界');
    });

    it('should decode URL-safe base64 correctly', () => {
      const urlSafeBase64 = 'VGhpcyBpcyBhIHRlc3Qgc3RyaW5nIHdpdGggc3BlY2lhbCBjaGFyYWN0ZXJzOiArLz0';
      const result = base64Tool.decode(urlSafeBase64, true);
      expect(result).toBe('This is a test string with special characters: +/=');
    });

    it('should handle invalid base64 gracefully', () => {
      expect(() => base64Tool.decode('invalid base64!')).toThrow();
    });
  });

  describe('Mode switching', () => {
    it('should switch to decode mode correctly', () => {
      base64Tool.setMode('decode');
      expect(base64Tool.mode).toBe('decode');
      
      const encodeBtn = container.querySelector('[data-mode="encode"]');
      const decodeBtn = container.querySelector('[data-mode="decode"]');
      
      expect(encodeBtn.classList.contains('btn-secondary')).toBe(true);
      expect(decodeBtn.classList.contains('btn-primary')).toBe(true);
    });

    it('should update placeholders when switching modes', () => {
      const input = container.querySelector('#base64-input');
      const output = container.querySelector('#base64-output');
      
      base64Tool.setMode('decode');
      expect(input.placeholder).toContain('Base64 to decode');
      expect(output.placeholder).toContain('Decoded text');
    });
  });

  describe('Processing', () => {
    it('should process input in encode mode', () => {
      const input = container.querySelector('#base64-input');
      const output = container.querySelector('#base64-output');
      
      input.value = 'Hello, World!';
      base64Tool.process();
      
      expect(output.value).toBe('SGVsbG8sIFdvcmxkIQ==');
    });

    it('should process input in decode mode', () => {
      const input = container.querySelector('#base64-input');
      const output = container.querySelector('#base64-output');
      
      base64Tool.setMode('decode');
      input.value = 'SGVsbG8sIFdvcmxkIQ==';
      base64Tool.process();
      
      expect(output.value).toBe('Hello, World!');
    });

    it('should clear output when input is empty', () => {
      const input = container.querySelector('#base64-input');
      const output = container.querySelector('#base64-output');
      
      input.value = '';
      base64Tool.process();
      
      expect(output.value).toBe('');
    });
  });

  describe('Utility functions', () => {
    it('should have a swap method', () => {
      expect(typeof base64Tool.swap).toBe('function');
    });

    it('should have a clear method', () => {
      expect(typeof base64Tool.clear).toBe('function');
    });

    it('should have an updateStats method', () => {
      expect(typeof base64Tool.updateStats).toBe('function');
    });
  });
});