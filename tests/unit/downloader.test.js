// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebDownloader } from '../../background/downloader.js';

describe('WebDownloader Tests', () => {
  let mockBrowser;
  let mockDownloads;

  beforeEach(() => {
    // Mock browser API
    mockDownloads = {
      download: vi.fn().mockResolvedValue(1), // Return download id
    };

    mockBrowser = {
      downloads: mockDownloads,
      runtime: {
        lastError: null
      }
    };

    global.browser = mockBrowser;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should extract website root name from URL', () => {
    const downloader = new WebDownloader();
    expect(downloader.getWebsiteRoot('https://example.com/path/page')).toBe('example.com');
    expect(downloader.getWebsiteRoot('http://sub.example.com/path')).toBe('sub.example.com');
    expect(downloader.getWebsiteRoot('https://example.com')).toBe('example.com');
  });

  it('should extract path name from URL', () => {
    const downloader = new WebDownloader();
    expect(downloader.getPathName('https://example.com/path/page')).toBe('path_page');
    expect(downloader.getPathName('https://example.com/path/')).toBe('path');
    expect(downloader.getPathName('https://example.com')).toBe('root');
  });

  it('should create valid folder path', () => {
    const downloader = new WebDownloader();
    const basePath = '/downloads';
    const url = 'https://example.com/blog/post';
    
    const expectedPath = '/downloads/example.com/blog_post';
    expect(downloader.createFolderPath(basePath, url)).toBe(expectedPath);
  });

  it('should get all resources from a webpage', async () => {
    const downloader = new WebDownloader();
    const html = `
      <html>
        <head>
          <link rel="stylesheet" href="styles.css">
          <script src="script.js"></script>
        </head>
        <body>
          <img src="image.jpg">
          <a href="page.html">Link</a>
        </body>
      </html>
    `;
    
    const resources = await downloader.getPageResources(html, 'https://example.com/page');
    
    expect(resources).toContainEqual({
      url: 'https://example.com/styles.css',
      filename: 'styles.css',
      type: 'css'
    });
    expect(resources).toContainEqual({
      url: 'https://example.com/script.js',
      filename: 'script.js',
      type: 'js'
    });
    expect(resources).toContainEqual({
      url: 'https://example.com/image.jpg',
      filename: 'image.jpg',
      type: 'image'
    });
    expect(resources).toContainEqual({
      url: 'https://example.com/page.html',
      filename: 'page.html',
      type: 'html'
    });
  });

  it('should download resources to correct folders', async () => {
    const downloader = new WebDownloader();
    const resources = [
      { url: 'https://example.com/styles.css', filename: 'styles.css', type: 'css' },
      { url: 'https://example.com/script.js', filename: 'script.js', type: 'js' },
      { url: 'https://example.com/image.jpg', filename: 'image.jpg', type: 'image' }
    ];
    
    const basePath = '/downloads';
    const pageUrl = 'https://example.com/page';
    
    await downloader.downloadResources(resources, basePath, pageUrl);
    
    expect(mockDownloads.download).toHaveBeenCalledTimes(3);
    expect(mockDownloads.download).toHaveBeenCalledWith({
      url: 'https://example.com/styles.css',
      filename: '/downloads/example.com/page/styles.css'
    });
    expect(mockDownloads.download).toHaveBeenCalledWith({
      url: 'https://example.com/script.js',
      filename: '/downloads/example.com/page/script.js'
    });
    expect(mockDownloads.download).toHaveBeenCalledWith({
      url: 'https://example.com/image.jpg',
      filename: '/downloads/example.com/page/image.jpg'
    });
  });

  it('should handle download errors gracefully', async () => {
    const downloader = new WebDownloader();
    mockDownloads.download.mockRejectedValueOnce(new Error('Download failed'));
    
    const resources = [
      { url: 'https://example.com/fail.css', filename: 'fail.css', type: 'css' },
      { url: 'https://example.com/success.js', filename: 'success.js', type: 'js' }
    ];
    
    const result = await downloader.downloadResources(resources, '/downloads', 'https://example.com/page');
    
    expect(result.failed).toHaveLength(1);
    expect(result.succeeded).toHaveLength(1);
    expect(result.failed[0].url).toBe('https://example.com/fail.css');
    expect(result.succeeded[0].url).toBe('https://example.com/success.js');
  });
}); 