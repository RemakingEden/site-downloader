import { PageDownloader } from '../ui/PageDownloader.js';

async function initializeComponents() {
  try {
    console.log('Initializing components...');
    
    // Initialize PageDownloader with fixed path
    const downloader = new PageDownloader('#page-downloader');
    downloader.setDownloadPath('website-downloader');
    
    console.log('Components initialized successfully');
  } catch (error) {
    console.error('Failed to initialize components:', error);
    const errorDiv = document.createElement('div');
    errorDiv.style.color = 'red';
    errorDiv.textContent = `Error: ${error.message}`;
    document.body.appendChild(errorDiv);
  }
}

// Initialize components when the popup loads
document.addEventListener('DOMContentLoaded', () => {
  const downloadButton = document.querySelector('.download-button');
  const statusDiv = document.querySelector('.status');
  const progressDiv = document.querySelector('.download-progress');
  
  downloadButton.addEventListener('click', async () => {
    try {
      // Show progress
      downloadButton.disabled = true;
      progressDiv.style.display = 'block';
      statusDiv.textContent = 'Starting download...';

      // Send message to background script to start download
      await browser.runtime.sendMessage({
        action: 'downloadWebsite'
      });

      statusDiv.textContent = 'Download started successfully!';
    } catch (error) {
      console.error('Failed to start download:', error);
      statusDiv.textContent = `Error: ${error.message}`;
    } finally {
      downloadButton.disabled = false;
      progressDiv.style.display = 'none';
    }
  });
}); 