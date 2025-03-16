// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FolderPicker } from '../../popup/folderPicker.js';

describe('FolderPicker UI Tests', () => {
  let container;
  let mockBrowser;

  beforeEach(() => {
    // Setup DOM
    container = document.createElement('div');
    container.id = 'download-location';
    document.body.appendChild(container);

    // Mock browser API
    mockBrowser = {
      storage: {
        local: {
          get: vi.fn(),
          set: vi.fn()
        }
      }
    };

    global.browser = mockBrowser;
    mockBrowser.storage.local.get.mockResolvedValue({});
    mockBrowser.storage.local.set.mockResolvedValue();

    // Mock timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should render initial state correctly', async () => {
    const picker = new FolderPicker('#folder-picker');
    await vi.runAllTimersAsync();

    const pathDisplay = container.querySelector('.folder-path');
    const button = container.querySelector('.select-folder-btn');
    
    expect(pathDisplay).toBeTruthy();
    expect(button).toBeTruthy();
    expect(pathDisplay.textContent).toBe('Downloads will be saved to: Downloads/firefox-downloads');
    expect(button.textContent).toBe('Choose Download Location');
  });

  it('should show error message when storage fails', async () => {
    mockBrowser.storage.local.get.mockRejectedValueOnce(new Error('Storage error'));
    
    const picker = new FolderPicker('#folder-picker');
    await vi.runAllTimersAsync();
    
    const errorElement = container.querySelector('.error-message');
    expect(errorElement.textContent).toBe('Failed to load saved download path');
  });

  it('should update path when folder is selected', async () => {
    const picker = new FolderPicker('#folder-picker');
    await vi.runAllTimersAsync();

    const button = container.querySelector('.select-folder-btn');
    
    // Mock file input
    const mockFileInput = document.createElement('input');
    mockFileInput.type = 'file';
    mockFileInput.webkitdirectory = true;
    mockFileInput.directory = true;
    mockFileInput.setAttribute = vi.fn();
    mockFileInput.click = vi.fn();

    // Mock document.createElement
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn((tagName) => {
      if (tagName === 'input') {
        return mockFileInput;
      }
      return originalCreateElement.call(document, tagName);
    });

    // Trigger folder selection
    button.click();
    await vi.runAllTimersAsync();

    // Simulate file selection
    const event = new Event('change');
    Object.defineProperty(event, 'target', {
      value: {
        files: [{ 
          webkitRelativePath: 'selected-folder/file.txt',
          name: 'file.txt'
        }]
      }
    });

    await mockFileInput.onchange(event);
    await vi.runAllTimersAsync();

    const pathDisplay = container.querySelector('.folder-path');
    expect(pathDisplay.textContent).toBe('Downloads will be saved to: selected-folder');

    // Restore original createElement
    document.createElement = originalCreateElement;
  });

  it('should load saved path from storage', async () => {
    mockBrowser.storage.local.get.mockResolvedValueOnce({ downloadPath: 'saved-folder' });
    
    const picker = new FolderPicker('#folder-picker');
    await vi.runAllTimersAsync();
    
    const pathDisplay = container.querySelector('.folder-path');
    expect(pathDisplay.textContent).toBe('Downloads will be saved to: saved-folder');
  });

  it('should render with all UI elements present', async () => {
    const picker = new FolderPicker('#folder-picker');
    await vi.runAllTimersAsync();
    
    // Check path display
    const pathDisplay = container.querySelector('.folder-path');
    expect(pathDisplay).toBeTruthy();
    expect(pathDisplay.textContent).toBe('Downloads will be saved to: Downloads/firefox-downloads');
    
    // Check button
    const button = container.querySelector('.select-folder-btn');
    expect(button).toBeTruthy();
    expect(button.textContent).toBe('Choose Download Location');
    
    // Check error message container exists
    const errorMessage = container.querySelector('.error-message');
    expect(errorMessage).toBeTruthy();
  });

  it('should show error message when storage save fails', async () => {
    const picker = new FolderPicker('#folder-picker');
    await vi.runAllTimersAsync();

    // Trigger error
    mockBrowser.storage.local.set.mockRejectedValueOnce(new Error('Storage error'));
    await picker.updateSelectedPath('/test/path');
    await vi.runAllTimersAsync();

    // Check error message content
    const errorMessage = container.querySelector('.error-message');
    expect(errorMessage.textContent).toBe('Failed to save folder path');
  });

  it('should update UI when folder is selected', async () => {
    const picker = new FolderPicker('#folder-picker');
    await vi.runAllTimersAsync();

    // Mock file input
    const mockFileInput = document.createElement('input');
    mockFileInput.type = 'file';
    mockFileInput.webkitdirectory = true;
    mockFileInput.directory = true;
    mockFileInput.setAttribute = vi.fn();
    mockFileInput.click = vi.fn();

    // Mock document.createElement
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn((tagName) => {
      if (tagName === 'input') {
        return mockFileInput;
      }
      return originalCreateElement.call(document, tagName);
    });

    // Trigger folder selection
    const button = container.querySelector('.select-folder-btn');
    button.click();
    await vi.runAllTimersAsync();

    // Simulate file selection
    const event = new Event('change');
    Object.defineProperty(event, 'target', {
      value: {
        files: [{ 
          webkitRelativePath: 'selected-folder/file.txt',
          name: 'file.txt'
        }]
      }
    });

    await mockFileInput.onchange(event);
    await vi.runAllTimersAsync();

    // Check if path is updated
    const pathDisplay = container.querySelector('.folder-path');
    expect(pathDisplay.textContent).toBe('Downloads will be saved to: selected-folder');

    // Restore original createElement
    document.createElement = originalCreateElement;
  });

  it('should maintain UI state after window resize', async () => {
    const picker = new FolderPicker('#folder-picker');
    await vi.runAllTimersAsync();
    
    // Set initial path
    const savedPath = '/test/path';
    await picker.updateSelectedPath(savedPath);
    await vi.runAllTimersAsync();

    // Simulate window resize
    window.dispatchEvent(new Event('resize'));
    await vi.runAllTimersAsync();

    // Check if path is maintained
    const pathDisplay = container.querySelector('.folder-path');
    expect(pathDisplay.textContent).toBe(`Downloads will be saved to: ${savedPath}`);
  });
}); 