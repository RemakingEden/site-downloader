// Background script for Firefox extension
console.log('Background script loaded');

import { generateDownloadPath, getDomainFromUrl } from './utils/fileUtils.js';

// Keep track of website downloads
const websiteDownloads = new Map();

// Listen for messages from popup
/* eslint-disable no-unused-vars */
browser.runtime.onMessage.addListener(async (message, sender) => {
/* eslint-enable no-unused-vars */
  if (message.action === 'downloadWebsite') {
    try {
      // Get the active tab
      const tabs = await browser.tabs.query({active: true, currentWindow: true});
      const tab = tabs[0];
      
      // Get page content from content script
      const response = await browser.tabs.sendMessage(tab.id, {
        action: 'getPageContent'
      });

      const { html, resources, url } = response;
      const domain = getDomainFromUrl(url);
      
      console.log('Found resources:', {
        scripts: resources.scripts.length,
        styles: resources.styles.length,
        images: resources.images.length,
        fonts: resources.fonts.length,
        other: resources.other.length
      });
      
      // Create a blob from the HTML content
      const htmlBlob = new Blob([html], { type: 'text/html' });
      
      // Download main HTML file
      const mainDownloadId = await browser.downloads.download({
        url: URL.createObjectURL(htmlBlob),
        filename: `website-downloader/${domain}/index.html`,
        conflictAction: 'uniquify'
      });
      
      // Store download info
      websiteDownloads.set(mainDownloadId, {
        url,
        isMainPage: true
      });

      // Download resources
      /* eslint-disable no-unused-vars */
      for (const [type, urls] of Object.entries(resources)) {
      /* eslint-enable no-unused-vars */
        console.log(`Processing ${type} resources...`);
        for (const resourceUrl of urls) {
          try {
            const filename = new URL(resourceUrl).pathname.split('/').pop();
            if (!filename) continue;

            console.log(`Downloading ${type}: ${resourceUrl}`);
            const downloadId = await browser.downloads.download({
              url: resourceUrl,
              filename: generateDownloadPath(filename, '', url, false),
              conflictAction: 'uniquify'
            });

            websiteDownloads.set(downloadId, {
              url: resourceUrl,
              isMainPage: false
            });
          } catch (error) {
            console.error(`Failed to download ${type} resource ${resourceUrl}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error downloading website:', error);
    }
  }
  return true;
});

// Listen for download events
browser.downloads.onCreated.addListener(async (downloadItem) => {
  try {
    // Only process if we have the necessary information
    if (!downloadItem.url || !downloadItem.filename) {
      return;
    }

    // Check if this is part of a website download
    let isWebsiteAsset = false;
    let websiteUrl = '';
    
    for (const [, url] of websiteDownloads) {
      if (downloadItem.url.includes(new URL(url).hostname)) {
        isWebsiteAsset = true;
        websiteUrl = url;
        break;
      }
    }

    if (!isWebsiteAsset) {
      return; // Not part of a website download
    }

    // Generate new path for the asset
    const newPath = generateDownloadPath(
      downloadItem.filename,
      downloadItem.mime || 'application/octet-stream',
      websiteUrl,
      false
    );

    // Cancel the original download
    await browser.downloads.cancel(downloadItem.id);

    // Start new download with organized path
    await browser.downloads.download({
      url: downloadItem.url,
      filename: newPath,
      conflictAction: 'uniquify'
    });

  } catch (error) {
    console.error('Error organizing download:', error);
    // If there's an error, let the original download continue
    browser.downloads.resume(downloadItem.id);
  }
});

// Clean up website downloads map when downloads complete
browser.downloads.onChanged.addListener((delta) => {
  if (delta.state && delta.state.current === 'complete') {
    websiteDownloads.delete(delta.id);
  }
});

/**
 * Initialize extension
 * @returns {void}
 */
function init() {
  console.log('Website downloader extension initialized');
}

init(); 