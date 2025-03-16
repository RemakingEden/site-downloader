import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Browser API Integration', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('should be able to access browser storage API', () => {
    expect(browser.storage.local.get).toBeDefined();
    expect(browser.storage.local.set).toBeDefined();
  });

  it('should handle storage operations correctly', async () => {
    const testData = { key: 'value' };
    
    // Mock storage.local.get to return test data
    browser.storage.local.get.mockResolvedValue(testData);
    
    // Test getting data
    const result = await browser.storage.local.get();
    expect(result).toEqual(testData);
    expect(browser.storage.local.get).toHaveBeenCalled();

    // Test setting data
    await browser.storage.local.set(testData);
    expect(browser.storage.local.set).toHaveBeenCalledWith(testData);
  });

  it('should handle storage errors gracefully', async () => {
    // Mock storage.local.get to throw an error
    const errorMessage = 'Storage error';
    browser.storage.local.get.mockRejectedValue(new Error(errorMessage));
    
    // Test error handling
    await expect(browser.storage.local.get()).rejects.toThrow(errorMessage);
  });
}); 