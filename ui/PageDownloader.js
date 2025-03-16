import { WebDownloader } from '../background/downloader.js';

export class PageDownloader {
  constructor(selector, downloader) {
    this.container = document.querySelector(selector);
    if (!this.container) {
      throw new Error(`Element not found: ${selector}`);
    }
    
    this.downloader = downloader || new WebDownloader();
    this.downloadPath = '';
    
    this.render();
    this.attachEventListeners();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="page-downloader">
        <button class="download-button">Download Page</button>
        <div class="status"></div>
      </div>
    `;
  }
  
  attachEventListeners() {
    const button = this.container.querySelector('.download-button');
    if (button) {
      button.addEventListener('click', () => this.handleDownload());
    }
  }
  
  async handleDownload() {
    const status = this.container.querySelector('.status');
    const button = this.container.querySelector('.download-button');
    
    if (!status || !button) {
      console.error('Required elements not found');
      return;
    }
    
    try {
      // Disable button and show progress
      button.disabled = true;
      status.innerHTML = '<div class="progress">Downloading...</div>';
      
      // Get the active tab
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      
      if (!activeTab) {
        throw new Error('No active tab found');
      }
      
      // Execute script in the active tab to get the page content
      const [{ html }] = await browser.tabs.executeScript(activeTab.id, {
        code: `({
          html: document.documentElement.innerHTML
        })`
      });
      
      // Get all resources from the page
      const resources = await this.downloader.getPageResources(html, activeTab.url);
      
      // Download all resources
      const result = await this.downloader.downloadResources(
        resources,
        this.downloadPath,
        activeTab.url
      );
      
      // Show success message
      status.textContent = 'Download complete';
      setTimeout(() => {
        if (status) {
          status.textContent = '';
        }
      }, 3000);
      
      return result;
      
    } catch (error) {
      // Show error message
      status.textContent = `Download failed: ${error.message}`;
      throw error;
      
    } finally {
      // Re-enable button
      button.disabled = false;
    }
  }
  
  setDownloadPath(path) {
    console.log('PageDownloader: Setting download path to:', path);
    this.downloadPath = path || '';
  }
} 