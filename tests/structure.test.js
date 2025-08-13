import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

describe('HTML Structure', () => {
  let dom;
  let document;

  beforeEach(() => {
    const html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
    dom = new JSDOM(html);
    document = dom.window.document;
  });

  describe('Document Setup', () => {
    it('should have proper DOCTYPE', () => {
      const htmlContent = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
      expect(htmlContent).toMatch(/^<!DOCTYPE html>/i);
    });

    it('should have viewport meta tag', () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport).toBeTruthy();
      expect(viewport.getAttribute('content')).toContain('width=device-width');
      expect(viewport.getAttribute('content')).toContain('initial-scale=1.0');
    });

    it('should have proper title', () => {
      const title = document.querySelector('title');
      expect(title).toBeTruthy();
      expect(title.textContent).toBe('DevToolbox - Fast Developer Utilities');
    });

    it('should have meta description', () => {
      const description = document.querySelector('meta[name="description"]');
      expect(description).toBeTruthy();
      expect(description.getAttribute('content')).toContain('developer utilities');
    });
  });

  describe('Semantic Structure', () => {
    it('should have header element', () => {
      const header = document.querySelector('header');
      expect(header).toBeTruthy();
      expect(header.getAttribute('role')).toBe('banner');
    });

    it('should have nav element in sidebar', () => {
      const nav = document.querySelector('nav');
      expect(nav).toBeTruthy();
      expect(nav.getAttribute('role')).toBe('navigation');
      expect(nav.getAttribute('aria-label')).toBe('Main navigation');
    });

    it('should have main element', () => {
      const main = document.querySelector('main');
      expect(main).toBeTruthy();
      expect(main.getAttribute('role')).toBe('main');
    });

    it('should have aside element for sidebar', () => {
      const aside = document.querySelector('aside');
      expect(aside).toBeTruthy();
      expect(aside.getAttribute('aria-label')).toBe('Tools sidebar');
    });
  });

  describe('Required Components', () => {
    it('should have logo in header', () => {
      const header = document.querySelector('header');
      expect(header).toBeTruthy();
      expect(header.textContent).toContain('DevToolbox');
    });

    it('should have search input', () => {
      const search = document.querySelector('input[type="search"]');
      expect(search).toBeTruthy();
      expect(search.getAttribute('placeholder')).toContain('Search');
      expect(search.getAttribute('aria-label')).toBe('Search tools');
    });

    it('should have theme toggle button', () => {
      const themeToggle = document.querySelector('[data-theme-toggle]');
      expect(themeToggle).toBeTruthy();
      expect(themeToggle.getAttribute('aria-label')).toMatch(/theme/i);
    });

    it('should have mobile menu toggle', () => {
      const menuToggle = document.querySelector('[data-menu-toggle]');
      expect(menuToggle).toBeTruthy();
      expect(menuToggle.getAttribute('aria-label')).toBe('Toggle menu');
    });
  });

  describe('CSS Setup', () => {
    it('should have Tailwind CSS script', () => {
      const tailwindScript = document.querySelector('script[src*="tailwindcss"]');
      expect(tailwindScript).toBeTruthy();
    });

    it('should have inline styles for critical layouts', () => {
      const styleTag = document.querySelector('style');
      expect(styleTag).toBeTruthy();
      expect(styleTag.textContent).toContain('[data-theme="dark"]');
    });
  });

  describe('Accessibility', () => {
    it('should have skip to main content link', () => {
      const skipLink = document.querySelector('a[href="#main"]');
      expect(skipLink).toBeTruthy();
      expect(skipLink.classList.contains('sr-only')).toBe(true);
    });

    it('should have proper ARIA labels on interactive elements', () => {
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        const hasAriaLabel = button.hasAttribute('aria-label');
        const hasTextContent = button.textContent.trim().length > 0;
        expect(hasAriaLabel || hasTextContent).toBe(true);
      });
    });

    it('should have lang attribute on html element', () => {
      const htmlElement = document.documentElement;
      expect(htmlElement.getAttribute('lang')).toBe('en');
    });
  });
});