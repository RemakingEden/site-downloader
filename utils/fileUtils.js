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
 * Converts a URL path to snake case format
 * @param {string} path - The URL path to convert
 * @returns {string} - The path in snake case format
 */
function pathToSnakeCase(path) {
  if (!path || path === '/') return 'root';
  return path
    .split('/')
    .filter(Boolean)
    .join('-')
    .toLowerCase();
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
  const urlObj = new URL(url);
  const path = pathToSnakeCase(urlObj.pathname);
  const baseDir = `website-downloader/${domain}/${path}`;
  
  if (isMainPage) {
    return `${baseDir}/pages/index.html`;
  }

  const folder = determineFileType(filename, mimeType);
  return `${baseDir}/${folder}/${filename}`;
}

/**
 * Ensures the download path is properly structured
 * @param {browser.downloads.DownloadItem} downloadItem - The download item
 * @returns {Promise<string>} The prepared download path
 */
export async function ensureDirectoryStructure(downloadItem) {
  const folder = determineFileType(downloadItem.filename, downloadItem.mime);
  
  // Firefox doesn't support direct directory creation
  // Instead, we'll return the folder path to be used when saving the file
  return folder;
} 