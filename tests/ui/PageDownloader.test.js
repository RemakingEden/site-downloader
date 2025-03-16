// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PageDownloader } from '../../ui/PageDownloader.js';

describe('PageDownloader UI Tests', () => {
  let container;
  let downloader;
  let mockDownloader;
  let button;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'page-downloader';
    document.body.appendChild(container);

    mockDownloader = {
      getPageResources: vi.fn(),
      downloadResources: vi.fn()
    };

    downloader = new PageDownloader('#page-downloader', mockDownloader);
    button = container.querySelector('button');
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  it('should render with all UI elements present', () => {
    expect(container.querySelector('button')).toBeTruthy();
    expect(container.querySelector('.status')).toBeTruthy();
  });

  it('should start download when button is clicked', async () => {
    mockDownloader.getPageResources.mockResolvedValueOnce(['resource1', 'resource2']);
    mockDownloader.downloadResources.mockResolvedValueOnce();

    await downloader.handleDownload();

    expect(mockDownloader.getPageResources).toHaveBeenCalled();
    expect(mockDownloader.downloadResources).toHaveBeenCalledWith(
      ['resource1', 'resource2'],
      '',
      'http://localhost/'
    );
    expect(document.querySelector('.status').textContent).toBe('Download complete');
  });

  it('should handle download errors', async () => {
    const error = new Error('Download failed');
    mockDownloader.getPageResources.mockRejectedValueOnce(error);
    
    // Click the download button and wait for the error to be handled
    try {
      await downloader.handleDownload();
    } catch (e) {
      // Expected error
    }

    // Verify error message is displayed
    expect(document.querySelector('.status').textContent).toBe('Download failed: Download failed');
  });

  it('should update status during download', async () => {
    mockDownloader.getPageResources.mockResolvedValueOnce(['resource1', 'resource2']);
    mockDownloader.downloadResources.mockResolvedValueOnce();

    await downloader.handleDownload();

    expect(document.querySelector('.status').textContent).toBe('Download complete');
  });
}); 