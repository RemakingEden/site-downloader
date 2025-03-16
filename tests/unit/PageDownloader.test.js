import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { PageDownloader } from '../../ui/PageDownloader.js';

describe('PageDownloader', () => {
  let pageDownloader;
  let mockElements;

  beforeEach(() => {
    // Set up fake timers
    vi.useFakeTimers();

    // Create mock elements
    mockElements = {
      downloadButton: document.createElement('button'),
      cancelButton: document.createElement('button'),
      progressBar: document.createElement('div'),
      progressFill: document.createElement('div'),
      progressText: document.createElement('div'),
      statusMessage: document.createElement('div'),
      includeImages: document.createElement('input'),
      includeCSS: document.createElement('input'),
      includeJS: document.createElement('input')
    };

    // Set up checkboxes
    mockElements.includeImages.type = 'checkbox';
    mockElements.includeCSS.type = 'checkbox';
    mockElements.includeJS.type = 'checkbox';
    mockElements.includeImages.checked = true;
    mockElements.includeCSS.checked = true;
    mockElements.includeJS.checked = true;

    // Mock browser API
    global.browser = {
      tabs: {
        query: vi.fn().mockResolvedValue([{
          id: 1,
          url: 'https://example.com'
        }]),
        executeScript: vi.fn().mockResolvedValue([{
          html: '<html><body>Test content</body></html>'
        }])
      },
      downloads: {
        download: vi.fn().mockResolvedValue(1)
      }
    };

    pageDownloader = new PageDownloader(mockElements);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test('constructor should initialize correctly', () => {
    expect(pageDownloader.downloadButton).toBe(mockElements.downloadButton);
    expect(pageDownloader.cancelButton).toBe(mockElements.cancelButton);
    expect(pageDownloader.progressBar).toBe(mockElements.progressBar);
    expect(pageDownloader.progressFill).toBe(mockElements.progressFill);
    expect(pageDownloader.progressText).toBe(mockElements.progressText);
    expect(pageDownloader.statusMessage).toBe(mockElements.statusMessage);
    expect(pageDownloader.includeImages).toBe(mockElements.includeImages);
    expect(pageDownloader.includeCSS).toBe(mockElements.includeCSS);
    expect(pageDownloader.includeJS).toBe(mockElements.includeJS);
  });

  test('constructor should throw error if required elements are missing', () => {
    const incompleteConfig = { ...mockElements };
    delete incompleteConfig.downloadButton;

    expect(() => new PageDownloader(incompleteConfig)).toThrow('Missing required elements in configuration');
  });

  test('should handle successful download', async () => {
    // Set up download resources
    const resources = [
      { url: 'https://example.com/style.css', filename: 'style.css', type: 'css' },
      { url: 'https://example.com/script.js', filename: 'script.js', type: 'js' },
      { url: 'https://example.com/image.jpg', filename: 'image.jpg', type: 'image' }
    ];

    // Mock getPageResources to return our test resources
    pageDownloader.downloader.getPageResources = vi.fn().mockResolvedValue(resources);

    // Start download
    const downloadPromise = pageDownloader.handleDownload();

    // Check initial state
    expect(pageDownloader.isDownloading).toBe(true);
    expect(pageDownloader.downloadButton.style.display).toBe('none');
    expect(pageDownloader.cancelButton.style.display).toBe('block');
    expect(pageDownloader.progressBar.style.display).toBe('block');
    expect(pageDownloader.progressText.textContent).toBe('Preparing download...');

    // Wait for download to complete
    await downloadPromise;

    // Check final state
    expect(pageDownloader.isDownloading).toBe(false);
    expect(pageDownloader.downloadButton.style.display).toBe('block');
    expect(pageDownloader.cancelButton.style.display).toBe('none');
    expect(pageDownloader.progressBar.style.display).toBe('none');
    expect(pageDownloader.statusMessage.textContent).toBe('Download completed successfully');

    // Verify browser API calls
    expect(browser.tabs.query).toHaveBeenCalledWith({ active: true, currentWindow: true });
    expect(browser.tabs.executeScript).toHaveBeenCalled();
    expect(browser.downloads.download).toHaveBeenCalledTimes(3);
  });

  test('should handle download failure', async () => {
    // Mock tab query to fail
    browser.tabs.query.mockRejectedValueOnce(new Error('Failed to get tab'));

    try {
      await pageDownloader.handleDownload();
    } catch (error) {
      expect(error.message).toBe('Failed to get tab');
    }

    expect(pageDownloader.isDownloading).toBe(false);
    expect(pageDownloader.downloadButton.style.display).toBe('block');
    expect(pageDownloader.cancelButton.style.display).toBe('none');
    expect(pageDownloader.progressBar.style.display).toBe('none');
    expect(pageDownloader.statusMessage.textContent).toBe('Download failed: Failed to get tab');
  });

  test('should handle download cancellation', async () => {
    // Set up a long-running download
    const resources = Array(5).fill({ url: 'https://example.com/file.txt', filename: 'file.txt', type: 'text' });
    pageDownloader.downloader.getPageResources = vi.fn().mockResolvedValue(resources);
    browser.downloads.download = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    // Start download
    const downloadPromise = pageDownloader.handleDownload();

    // Cancel download
    pageDownloader.handleCancel();

    try {
      await downloadPromise;
    } catch (error) {
      expect(error.message).toBe('Download cancelled');
    }

    expect(pageDownloader.isDownloading).toBe(false);
    expect(pageDownloader.statusMessage.textContent).toBe('Download cancelled');
    expect(pageDownloader.downloadButton.style.display).toBe('block');
    expect(pageDownloader.cancelButton.style.display).toBe('none');
    expect(pageDownloader.progressBar.style.display).toBe('none');
  });

  test('should respect resource type filters', async () => {
    const resources = [
      { url: 'https://example.com/style.css', filename: 'style.css', type: 'css' },
      { url: 'https://example.com/script.js', filename: 'script.js', type: 'js' },
      { url: 'https://example.com/image.jpg', filename: 'image.jpg', type: 'image' }
    ];

    pageDownloader.downloader.getPageResources = vi.fn().mockResolvedValue(resources);

    // Disable images and JS
    mockElements.includeImages.checked = false;
    mockElements.includeJS.checked = false;

    await pageDownloader.handleDownload();

    // Should only download CSS
    expect(browser.downloads.download).toHaveBeenCalledTimes(1);
    expect(browser.downloads.download).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://example.com/style.css' })
    );
  });

  test('should update download path correctly', () => {
    pageDownloader.setDownloadPath('test-path');
    expect(pageDownloader.downloadPath).toBe('test-path');
  });

  test('should handle empty download path', () => {
    pageDownloader.setDownloadPath('');
    expect(pageDownloader.downloadPath).toBe('');
  });
}); 