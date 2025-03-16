import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { DownloadLocation } from '../../popup/DownloadLocation.js';

describe('DownloadLocation', () => {
  let dom;
  let document;
  let downloadLocation;
  let container;

  beforeEach(() => {
    // Set up a DOM environment
    dom = new JSDOM('<!DOCTYPE html><div id="download-location"></div>');
    document = dom.window.document;
    global.document = document;
    
    // Mock browser.storage.local
    global.browser = {
      storage: {
        local: {
          set: vi.fn().mockResolvedValue(),
          get: vi.fn().mockResolvedValue({ downloadPath: 'test-path' })
        }
      }
    };

    container = document.getElementById('download-location');
    downloadLocation = new DownloadLocation('#download-location');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('constructor initializes correctly', () => {
    expect(downloadLocation.element).toBe(container);
    expect(downloadLocation.pathChangeListeners).toEqual([]);
  });

  test('constructor throws error for invalid selector', () => {
    expect(() => {
      new DownloadLocation('#non-existent');
    }).toThrow('Element not found: #non-existent');
  });

  test('render creates expected DOM structure', () => {
    const downloadPathElement = container.querySelector('.download-path');
    expect(downloadPathElement).toBeTruthy();
    expect(downloadPathElement.textContent).toContain('Downloads will be saved to:');
  });

  test('initialize sets fixed path', async () => {
    await downloadLocation.initialize();
    const downloadPathElement = container.querySelector('.download-path');
    expect(downloadPathElement.textContent).toContain('website-downloader');
    expect(browser.storage.local.set).toHaveBeenCalledWith({
      downloadPath: 'website-downloader'
    });
  });

  test('updateSelectedPath updates display and storage', async () => {
    await downloadLocation.updateSelectedPath('new-path');
    const downloadPathElement = container.querySelector('.download-path');
    expect(downloadPathElement.textContent).toBe('Downloads will be saved to: ~/Downloads/new-path');
    expect(browser.storage.local.set).toHaveBeenCalledWith({
      downloadPath: 'new-path'
    });
  });

  test('updateSelectedPath notifies listeners', async () => {
    const listener = vi.fn();
    downloadLocation.onPathChange(listener);
    await downloadLocation.updateSelectedPath('test-path');
    expect(listener).toHaveBeenCalledWith('test-path');
  });

  test('showError displays error message', () => {
    const errorMessage = 'Test error message';
    downloadLocation.showError(errorMessage);
    const errorElement = container.querySelector('.error-message');
    expect(errorElement.textContent).toBe(errorMessage);
    expect(errorElement.style.display).toBe('block');
  });

  test('error handling in initialize', async () => {
    browser.storage.local.set.mockRejectedValue(new Error('Storage error'));
    await downloadLocation.initialize();
    const errorElement = container.querySelector('.error-message');
    expect(errorElement.textContent).toBe('Failed to save download path');
    expect(errorElement.style.display).toBe('block');
  });

  test('error handling in updateSelectedPath', async () => {
    browser.storage.local.set.mockRejectedValue(new Error('Storage error'));
    await downloadLocation.updateSelectedPath('test-path');
    const errorElement = container.querySelector('.error-message');
    expect(errorElement.textContent).toBe('Failed to save download path');
    expect(errorElement.style.display).toBe('block');
  });
}); 