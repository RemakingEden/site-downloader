import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { initializeDownloadOptions } from '../../popup/downloadOptions.js';

describe('Download Options UI', () => {
  let document;
  let window;
  let container;

  beforeEach(() => {
    // Create a fresh DOM for each test
    const dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="page-downloader">
            <div class="download-options">
              <label>
                <input type="checkbox" id="include-images" checked>
                Download images
              </label>
              <label>
                <input type="checkbox" id="include-css" checked>
                Download CSS files
              </label>
              <label>
                <input type="checkbox" id="include-js" checked>
                Download JavaScript files
              </label>
            </div>
            <button class="download-button">Download Website</button>
          </div>
        </body>
      </html>
    `);
    
    window = dom.window;
    document = window.document;
    container = document.getElementById('page-downloader');

    // Set up global document for tests
    global.document = document;
    global.window = window;
  });

  it('should have all checkboxes checked by default', () => {
    const imageCheckbox = document.getElementById('include-images');
    const cssCheckbox = document.getElementById('include-css');
    const jsCheckbox = document.getElementById('include-js');

    expect(imageCheckbox.checked).toBe(true);
    expect(cssCheckbox.checked).toBe(true);
    expect(jsCheckbox.checked).toBe(true);
  });

  it('should allow toggling checkboxes', () => {
    const imageCheckbox = document.getElementById('include-images');
    const cssCheckbox = document.getElementById('include-css');
    const jsCheckbox = document.getElementById('include-js');

    imageCheckbox.click();
    cssCheckbox.click();
    jsCheckbox.click();

    expect(imageCheckbox.checked).toBe(false);
    expect(cssCheckbox.checked).toBe(false);
    expect(jsCheckbox.checked).toBe(false);
  });

  it('should store checkbox states in local storage', async () => {
    // Initialize download options
    await initializeDownloadOptions('#page-downloader');

    // Mock browser.storage.local
    global.browser.storage.local.set = vi.fn().mockResolvedValue(undefined);
    
    const imageCheckbox = document.getElementById('include-images');
    const cssCheckbox = document.getElementById('include-css');
    const jsCheckbox = document.getElementById('include-js');

    // Simulate user unchecking boxes
    imageCheckbox.click();
    cssCheckbox.click();

    // Create and dispatch change events
    const event = new window.Event('change');
    imageCheckbox.dispatchEvent(event);
    cssCheckbox.dispatchEvent(event);

    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(global.browser.storage.local.set).toHaveBeenCalledWith({
      downloadOptions: {
        includeImages: false,
        includeCss: false,
        includeJs: true
      }
    });
  });

  it('should load checkbox states from local storage', async () => {
    // Mock browser.storage.local.get to return saved states
    global.browser.storage.local.get = vi.fn().mockResolvedValue({
      downloadOptions: {
        includeImages: false,
        includeCss: true,
        includeJs: false
      }
    });

    // Initialize the download options
    await initializeDownloadOptions('#page-downloader');

    // Check if checkboxes reflect the stored state
    const imageCheckbox = document.getElementById('include-images');
    const cssCheckbox = document.getElementById('include-css');
    const jsCheckbox = document.getElementById('include-js');

    expect(imageCheckbox.checked).toBe(false);
    expect(cssCheckbox.checked).toBe(true);
    expect(jsCheckbox.checked).toBe(false);
  });
}); 