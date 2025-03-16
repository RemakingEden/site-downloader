export class DownloadLocation {
  constructor(selector) {
    console.log('DownloadLocation constructor called with selector:', selector);
    this.element = document.querySelector(selector);
    if (!this.element) {
      throw new Error(`Element not found: ${selector}`);
    }
    
    this.pathChangeListeners = [];
    this.render();
  }

  render() {
    this.element.innerHTML = `
      <style>
        .download-location {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
          width: 100%;
        }
        .download-path {
          padding: 8px;
          background: #f9f9f9;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
          color: #2b2b2b;
          line-height: 1.4;
        }
        .error-message {
          display: none;
          font-size: 14px;
          padding: 8px;
          border-radius: 4px;
          background-color: #ffd7d7;
          border: 1px solid #ffb3b3;
          margin-top: 8px;
        }
      </style>
      <div class="download-location">
        <div class="download-path">Downloads will be saved to: website-downloader</div>
      </div>
      <div class="error-message"></div>
    `;
  }

  async initialize() {
    try {
      // Always use website-downloader as the fixed path
      const fixedPath = "website-downloader";
      await this.updateSelectedPath(fixedPath, true);
    } catch (error) {
      console.error('Failed to initialize download path:', error);
      this.showError('Failed to save download path');
    }
  }

  async updateSelectedPath(path, saveToStorage = true) {
    console.log('Updating selected path:', path);
    const pathElement = this.element.querySelector('.download-path');
    if (pathElement) {
      pathElement.textContent = `Downloads will be saved to: ~/Downloads/${path}`;
      console.log('Updated path display:', pathElement.textContent);
    } else {
      console.error('Path element not found');
    }
    
    if (saveToStorage) {
      try {
        await browser.storage.local.set({ downloadPath: path });
        console.log('Saved path to storage:', path);
      } catch (error) {
        console.error('Failed to save download path:', error);
        this.showError('Failed to save download path');
      }
    }

    // Notify listeners of path change
    this.pathChangeListeners.forEach(listener => listener(path));
  }

  showError(message) {
    const errorElement = this.element.querySelector('.error-message');
    if (errorElement) {
      errorElement.style.display = 'block';
      errorElement.textContent = message;
    }
  }

  onPathChange(listener) {
    this.pathChangeListeners.push(listener);
  }
} 