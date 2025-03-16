// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FolderPicker } from '../../popup/folderPicker.js';

describe('FolderPicker Unit Tests', () => {
  let mockElement;
  let mockBrowser;

  beforeEach(() => {
    // Setup DOM
    mockElement = document.createElement('div');
    mockElement.id = 'test';
    document.body.appendChild(mockElement);

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
    document.body.removeChild(mockElement);
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should initialize with correct default state', async () => {
    const picker = new FolderPicker('#test');
    await vi.runAllTimersAsync();

    const pathDisplay = mockElement.querySelector('.folder-path');
    expect(pathDisplay.textContent).toBe('Downloads will be saved to: Downloads/firefox-downloads');
  });

  it('should throw error when element not found', () => {
    expect(() => new FolderPicker('#nonexistent')).toThrow('Element not found: #nonexistent');
  });

  it('should load path from storage on initialization', async () => {
    const testPath = '/test/path';
    mockBrowser.storage.local.get.mockResolvedValueOnce({ downloadPath: testPath });

    const picker = new FolderPicker('#test');
    await vi.runAllTimersAsync();

    expect(mockBrowser.storage.local.get).toHaveBeenCalledWith('downloadPath');
    const pathDisplay = mockElement.querySelector('.folder-path');
    expect(pathDisplay.textContent).toBe(`Downloads will be saved to: ${testPath}`);
  });

  it('should show error message on storage initialization failure', async () => {
    mockBrowser.storage.local.get.mockRejectedValueOnce(new Error('Storage error'));

    const picker = new FolderPicker('#test');
    await vi.runAllTimersAsync();

    const errorElement = mockElement.querySelector('.error-message');
    expect(errorElement.textContent).toBe('Failed to load saved download path');
  });

  it('should update path in storage when new path is set', async () => {
    const picker = new FolderPicker('#test');
    await vi.runAllTimersAsync();
    
    const newPath = '/new/path';
    await picker.updateSelectedPath(newPath);
    await vi.runAllTimersAsync();

    expect(mockBrowser.storage.local.set).toHaveBeenCalledWith({ downloadPath: newPath });
    const pathDisplay = mockElement.querySelector('.folder-path');
    expect(pathDisplay.textContent).toBe(`Downloads will be saved to: ${newPath}`);
  });

  it('should show error message on storage update failure', async () => {
    const picker = new FolderPicker('#test');
    await vi.runAllTimersAsync();

    mockBrowser.storage.local.set.mockRejectedValueOnce(new Error('Storage error'));
    await picker.updateSelectedPath('/test/path');
    await vi.runAllTimersAsync();

    const errorElement = mockElement.querySelector('.error-message');
    expect(errorElement.textContent).toBe('Failed to save folder path');
  });

  it('should extract folder name correctly from file path', async () => {
    const picker = new FolderPicker('#test');
    await vi.runAllTimersAsync();

    // Create a mock file input
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
    const button = mockElement.querySelector('.select-folder-btn');
    button.click();
    await vi.runAllTimersAsync();

    // Simulate file selection
    const event = new Event('change');
    Object.defineProperty(event, 'target', {
      value: {
        files: [{ 
          webkitRelativePath: 'folder-name/file.txt',
          name: 'file.txt'
        }]
      }
    });

    await mockFileInput.onchange(event);
    await vi.runAllTimersAsync();

    const pathDisplay = mockElement.querySelector('.folder-path');
    expect(pathDisplay.textContent).toBe('Downloads will be saved to: folder-name');

    // Restore original createElement
    document.createElement = originalCreateElement;
  });
}); 