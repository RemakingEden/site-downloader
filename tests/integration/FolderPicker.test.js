// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FolderPicker } from '../../popup/folderPicker.js';

describe('FolderPicker Integration Tests', () => {
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

  it('should persist selected path across component instances', async () => {
    const testPath1 = '/test/path1';
    mockBrowser.storage.local.get.mockResolvedValue({ downloadPath: testPath1 });

    // Create first instance
    const picker1 = new FolderPicker('#folder-picker');
    await vi.runAllTimersAsync();

    // Verify path is loaded
    const pathDisplay1 = container.querySelector('.folder-path');
    expect(pathDisplay1.textContent).toBe(`Downloads will be saved to: ${testPath1}`);

    // Create second instance
    const picker2 = new FolderPicker('#folder-picker');
    await vi.runAllTimersAsync();

    // Verify path persists
    const pathDisplay2 = container.querySelector('.folder-path');
    expect(pathDisplay2.textContent).toBe(`Downloads will be saved to: ${testPath1}`);
  });

  it('should handle the complete folder selection flow', async () => {
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

    // Click the button
    const button = container.querySelector('.select-folder-btn');
    button.click();
    await vi.runAllTimersAsync();

    // Simulate file selection
    const selectedPath = 'selected-folder';
    const event = new Event('change');
    Object.defineProperty(event, 'target', {
      value: {
        files: [{ 
          webkitRelativePath: `${selectedPath}/file.txt`,
          name: 'file.txt'
        }]
      }
    });

    await mockFileInput.onchange(event);
    await vi.runAllTimersAsync();

    // Verify UI and storage updates
    const pathDisplay = container.querySelector('.folder-path');
    expect(pathDisplay.textContent).toBe(`Downloads will be saved to: ${selectedPath}`);
    expect(mockBrowser.storage.local.set).toHaveBeenCalledWith({ downloadPath: selectedPath });

    // Restore original createElement
    document.createElement = originalCreateElement;
  });

  it('should maintain component state during popup lifecycle', async () => {
    const initialPath = '/initial/path';
    mockBrowser.storage.local.get.mockResolvedValue({ downloadPath: initialPath });

    // Create first instance
    const picker1 = new FolderPicker('#folder-picker');
    await vi.runAllTimersAsync();

    // Simulate popup close and reopen
    document.body.removeChild(container);
    container = document.createElement('div');
    container.id = 'folder-picker';
    document.body.appendChild(container);

    // Create new instance
    const picker2 = new FolderPicker('#folder-picker');
    await vi.runAllTimersAsync();

    // Verify state is maintained
    const pathDisplay = container.querySelector('.folder-path');
    expect(pathDisplay.textContent).toBe(`Downloads will be saved to: ${initialPath}`);
  });

  it('should handle rapid folder selections', async () => {
    const picker = new FolderPicker('#folder-picker');
    await vi.runAllTimersAsync();

    const paths = ['path1', 'path2', 'path3'];

    // Simulate multiple rapid folder selections
    for (const path of paths) {
      await picker.updateSelectedPath(path);
      await vi.runAllTimersAsync();
    }

    // Check final state
    const pathDisplay = container.querySelector('.folder-path');
    expect(pathDisplay.textContent).toBe(`Downloads will be saved to: ${paths[paths.length - 1]}`);

    // Verify storage was called with final value
    expect(mockBrowser.storage.local.set).toHaveBeenLastCalledWith({ 
      downloadPath: paths[paths.length - 1] 
    });
  });
}); 