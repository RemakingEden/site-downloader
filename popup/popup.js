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
document.addEventListener('DOMContentLoaded', initializeComponents); 