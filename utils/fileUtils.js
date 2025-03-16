import { FILE_TYPES } from './constants.js';

/**
 * Determines the file type based on file extension and mime type
 * @param {string} filename - The name of the file
 * @param {string} mimeType - The MIME type of the file
 * @returns {string} - The folder name where the file should be stored
 */
export function determineFileType(filename, mimeType) {
  // Get file extension
  const extension = filename.toLowerCase().split('.').pop();
  const fullExtension = `.${extension}`;

  // Check each file type category
  for (const [, typeInfo] of Object.entries(FILE_TYPES)) {
    // Check if extension matches
    if (typeInfo.extensions.includes(fullExtension)) {
      return typeInfo.folder;
    }
    
    // Check if mime type matches
    if (typeInfo.mimeTypes.includes(mimeType)) {
      return typeInfo.folder;
    }
  }

  // Default to 'other' if no match found
  return 'other';
}

/**
 * Extracts domain name from URL
 * @param {string} url - The URL to process
 * @returns {string} - Sanitized domain name
 */
export function getDomainFromUrl(url) {
  try {
    const urlObj = new URL(url);
    // Remove protocol, www, and any special characters
    return urlObj.hostname
      .replace(/^www\./, '')
      .replace(/[^a-zA-Z0-9-]/g, '-');
  } catch (error) {
    console.error('Error parsing URL:', error);
    return 'website';
  }
}

/**
 * Generates the download path for a file
 * @param {string} filename - The original filename
 * @param {string} mimeType - The MIME type of the file
 * @param {string} url - The URL of the file
 * @param {boolean} isMainPage - Whether this is the main HTML page
 * @returns {string} - The full path where the file should be downloaded
 */
export function generateDownloadPath(filename, mimeType, url, isMainPage = false) {
  const domain = getDomainFromUrl(url);
  const baseDir = `website-downloader/${domain}`;
  
  if (isMainPage) {
    return `${baseDir}/index.html`;
  }

  const folder = determineFileType(filename, mimeType);
  return `${baseDir}/${folder}/${filename}`;
}

/**
 * Creates necessary directories for file organization
 * @param {browser.downloads.DownloadItem} downloadItem - The download item
 * @returns {Promise<void>}
 */
export async function ensureDirectoryStructure(downloadItem) {
  const folder = determineFileType(downloadItem.filename, downloadItem.mime);
  
  try {
    // Create directory if it doesn't exist
    await browser.downloads.createDirectory(folder);
  } catch (error) {
    console.error(`Error creating directory ${folder}:`, error);
  }
} 