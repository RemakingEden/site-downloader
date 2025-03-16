import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Background Script', () => {
  let consoleSpy;
  
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Clear module cache
    vi.resetModules();
    // Spy on console.log
    consoleSpy = vi.spyOn(console, 'log');
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should log when background script is loaded', async () => {
    // Import the module to trigger the initial console.log
    await import('../../background.js');
    
    // Verify the loading message was logged
    expect(consoleSpy).toHaveBeenCalledWith('Background script loaded');
  });

  it('should initialize the extension correctly', async () => {
    // Import the module
    await import('../../background.js');
    
    // Verify both messages were logged in correct order
    expect(consoleSpy).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Background script loaded');
    expect(consoleSpy).toHaveBeenNthCalledWith(2, 'Website downloader extension initialized');
  });
}); 