import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebDownloader } from '../../background/downloader.js';

describe('WebDownloader', () => {
  let downloader;

  beforeEach(() => {
    downloader = new WebDownloader();
    // Mock browser.downloads API
    global.browser = {
      downloads: {
        download: vi.fn().mockResolvedValue(1)
      }
    };
  });

  describe('sanitizeName', () => {
    it('should remove invalid characters and convert to lowercase', () => {
      const tests = [
        { input: 'Hello World', expected: 'hello_world' },
        { input: 'File/With\\Invalid:Chars', expected: 'file_with_invalid_chars' },
        { input: '  Multiple   Spaces  ', expected: 'multiple_spaces' },
        { input: '_leading_trailing_', expected: 'leading_trailing' },
        { input: 'UPPERCASE', expected: 'uppercase' }
      ];

      tests.forEach(({ input, expected }) => {
        const result = downloader.sanitizeName(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe('getWebsiteRoot', () => {
    it('should extract website root correctly', () => {
      const tests = [
        { input: 'https://www.example.com', expected: 'example' },
        { input: 'https://subdomain.example.com', expected: 'example' },
        { input: 'http://test-site.com/path', expected: 'test-site' },
        { input: 'invalid-url', expected: 'unknown_site' }
      ];

      tests.forEach(({ input, expected }) => {
        const result = downloader.getWebsiteRoot(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe('getPathName', () => {
    it('should extract and sanitize path correctly', () => {
      const tests = [
        { input: 'https://example.com/', expected: 'home' },
        { input: 'https://example.com/page', expected: 'page' },
        { input: 'https://example.com/path/to/page', expected: 'path_to_page' },
        { input: 'https://example.com/UPPER/case/PATH', expected: 'upper_case_path' },
        { input: 'invalid-url', expected: 'home' }
      ];

      tests.forEach(({ input, expected }) => {
        const result = downloader.getPathName(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe('createFolderPath', () => {
    it('should create correct folder path structure', () => {
      const tests = [
        {
          basePath: 'website-downloader',
          url: 'https://example.com',
          expected: 'website-downloader/example/home'
        },
        {
          basePath: 'website-downloader',
          url: 'https://test.com/blog/post',
          expected: 'website-downloader/test/blog_post'
        }
      ];

      tests.forEach(({ basePath, url, expected }) => {
        const result = downloader.createFolderPath(basePath, url);
        expect(result).toBe(expected);
      });
    });
  });

  describe('getPageResources', () => {
    it('should extract all resources from HTML', async () => {
      const html = `
        <html>
          <head>
            <link href="styles.css" rel="stylesheet">
            <script src="script.js"></script>
          </head>
          <body>
            <img src="image.jpg">
            <a href="page.html">Link</a>
          </body>
        </html>
      `;
      const baseUrl = 'https://example.com';
      
      const resources = await downloader.getPageResources(html, baseUrl);
      
      expect(resources).toEqual([
        { url: 'https://example.com/styles.css', filename: 'styles.css', type: 'css' },
        { url: 'https://example.com/script.js', filename: 'script.js', type: 'js' },
        { url: 'https://example.com/image.jpg', filename: 'image.jpg', type: 'image' },
        { url: 'https://example.com/page.html', filename: 'page.html', type: 'html' }
      ]);
    });

    it('should handle absolute and relative URLs correctly', async () => {
      const html = `
        <html>
          <head>
            <link href="https://cdn.example.com/styles.css" rel="stylesheet">
            <link href="https://cdn.example.com/main.css" rel="stylesheet">
            <link href="/assets/theme.css" rel="stylesheet">
            <link href="css/local.css" rel="stylesheet">
          </head>
        </html>
      `;
      const baseUrl = 'https://example.com/page';
      
      const resources = await downloader.getPageResources(html, baseUrl);
      
      expect(resources).toEqual([
        { url: 'https://cdn.example.com/styles.css', filename: 'styles.css', type: 'css' },
        { url: 'https://cdn.example.com/main.css', filename: 'main.css', type: 'css' },
        { url: 'https://example.com/assets/theme.css', filename: 'theme.css', type: 'css' },
        { url: 'https://example.com/css/local.css', filename: 'local.css', type: 'css' }
      ]);
    });
  });

  describe('downloadResources', () => {
    it('should download all resources successfully', async () => {
      const resources = [
        { url: 'https://example.com/style.css', filename: 'style.css', type: 'css' },
        { url: 'https://example.com/script.js', filename: 'script.js', type: 'js' }
      ];
      
      const result = await downloader.downloadResources(
        resources,
        'website-downloader',
        'https://example.com'
      );
      
      expect(result.succeeded).toHaveLength(2);
      expect(result.failed).toHaveLength(0);
      expect(browser.downloads.download).toHaveBeenCalledTimes(2);
    });

    it('should handle download failures gracefully', async () => {
      const resources = [
        { url: 'https://example.com/style.css', filename: 'style.css', type: 'css' },
        { url: 'https://example.com/fail.js', filename: 'fail.js', type: 'js' }
      ];
      
      // Make the second download fail
      browser.downloads.download
        .mockImplementationOnce(() => Promise.resolve(1))
        .mockImplementationOnce(() => Promise.reject(new Error('Download failed')));
      
      const result = await downloader.downloadResources(
        resources,
        'website-downloader',
        'https://example.com'
      );
      
      expect(result.succeeded).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
      expect(browser.downloads.download).toHaveBeenCalledTimes(2);
    });
  });
}); 