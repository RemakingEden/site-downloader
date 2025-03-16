export class FolderPicker {
  constructor(selector) {
    console.log('FolderPicker constructor called with selector:', selector);
    this.element = document.querySelector(selector);
    if (!this.element) {
      throw new Error(`Element not found: ${selector}`);
    }
    this.pathChangeListeners = [];
    this.render();
    this.initialize();
  }

  async initialize() {
    try {
      const result = await browser.storage.local.get('downloadPath');
      if (result && result.downloadPath) {
        // When loading from storage, we want to notify listeners
        await this.updateSelectedPath(result.downloadPath, false);
      } else {
        // Set a default download path if none exists
        const defaultPath = "Downloads/firefox-downloads";
        // When setting default, we want to save to storage and notify listeners
        await this.updateSelectedPath(defaultPath, true);
      }
    } catch (error) {
      console.error('Failed to load saved download path:', error);
      this.showError('Failed to load saved download path');
    }
  }

  render() {
    this.element.innerHTML = `
      <style>
        .folder-picker {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
          width: 100%;
        }
        .folder-path {
          padding: 8px;
          background: #f9f9f9;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
          color: #2b2b2b;
          line-height: 1.4;
        }
        .select-folder-btn {
          padding: 8px 12px;
          background-color: #0060df;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        .select-folder-btn:hover {
          background-color: #0250bb;
        }
        .select-folder-btn:active {
          background-color: #054096;
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
      <div class="folder-picker">
        <div class="folder-path">Downloads will be saved to: Downloads/firefox-downloads</div>
        <button type="button" class="select-folder-btn">Choose Download Location</button>
      </div>
      <div class="error-message"></div>
    `;

    const button = this.element.querySelector('.select-folder-btn');
    button.addEventListener('click', () => this.openFolderPicker());
  }

  showError(message) {
    const errorElement = this.element.querySelector('.error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    }, 3000);
  }

  async openFolderPicker() {
    try {
      console.log('Opening folder picker...');
      
      // Create a file input element
      const input = document.createElement('input');
      input.type = 'file';
      
      // Set directory picking attributes
      input.setAttribute('webkitdirectory', '');
      input.setAttribute('directory', '');
      
      // Add to document but hide it
      input.style.position = 'fixed';
      input.style.top = '-100px';
      input.style.opacity = '0';
      document.body.appendChild(input);
      
      const path = await new Promise((resolve) => {
        const handleChange = (event) => {
          console.log('File input change event triggered');
          const files = event.target.files;
          console.log('Number of files:', files?.length);
          
          let selectedPath = '';
          
          if (files && files.length > 0) {
            // Log all available properties of the first file
            const firstFile = files[0];
            console.log('First file properties:', Object.keys(firstFile));
            console.log('First file details:', {
              name: firstFile.name,
              webkitRelativePath: firstFile.webkitRelativePath,
              path: firstFile.path,
              type: firstFile.type,
              size: firstFile.size
            });
            
            // Get the directory path from webkitRelativePath
            if (firstFile.webkitRelativePath) {
              selectedPath = firstFile.webkitRelativePath.split('/')[0];
              console.log('Directory from webkitRelativePath:', selectedPath);
            }
            
            // If we couldn't get the path, try to extract it from the file name
            if (!selectedPath && firstFile.name) {
              // On macOS, the file name might include the directory path
              const parts = firstFile.name.split('/');
              if (parts.length > 1) {
                selectedPath = parts[0];
                console.log('Directory from file name:', selectedPath);
              }
            }
          }
          
          // Clean up
          document.body.removeChild(input);
          
          console.log('Final selected path:', selectedPath);
          resolve(selectedPath || null);
        };
        
        // Add change listener
        input.addEventListener('change', handleChange, { once: true });
        
        // Add click listener to handle cancellation
        window.addEventListener('focus', () => {
          setTimeout(() => {
            if (!input.files || input.files.length === 0) {
              console.log('No folder selected (cancelled)');
              document.body.removeChild(input);
              resolve(null);
            }
          }, 1000);
        }, { once: true });
        
        // Show the file picker
        console.log('Triggering file picker...');
        input.click();
      });
      
      if (path) {
        console.log('Updating path to:', path);
        await this.updateSelectedPath(path);
      } else {
        console.log('No path was selected');
      }
      
    } catch (error) {
      console.error('Failed to select folder:', error);
      this.showError('Failed to select folder. Please try again.');
    }
  }

  async updateSelectedPath(path, saveToStorage = true) {
    console.log('Updating selected path:', path);
    const pathElement = this.element.querySelector('.folder-path');
    if (pathElement) {
      pathElement.textContent = `Downloads will be saved to: ${path}`;
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
        this.showError('Failed to save folder path');
      }
    }

    // Notify listeners of path change
    this.pathChangeListeners.forEach(listener => listener(path));
  }

  onPathChange(listener) {
    this.pathChangeListeners.push(listener);
  }
} 