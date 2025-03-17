/**
 * Initializes the download options functionality
 * @param {string} containerSelector - The selector for the container element
 */
export async function initializeDownloadOptions(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    throw new Error(`Container not found: ${containerSelector}`);
  }

  const imageCheckbox = container.querySelector('#include-images');
  const cssCheckbox = container.querySelector('#include-css');
  const jsCheckbox = container.querySelector('#include-js');

  if (!imageCheckbox || !cssCheckbox || !jsCheckbox) {
    throw new Error('One or more checkboxes not found');
  }

  // Load saved states from storage
  try {
    const result = await browser.storage.local.get('downloadOptions');
    if (result.downloadOptions) {
      imageCheckbox.checked = result.downloadOptions.includeImages ?? true;
      cssCheckbox.checked = result.downloadOptions.includeCss ?? true;
      jsCheckbox.checked = result.downloadOptions.includeJs ?? true;
    }
  } catch (error) {
    console.error('Failed to load download options:', error);
  }

  // Save states when changed
  const saveOptions = async () => {
    try {
      const options = {
        downloadOptions: {
          includeImages: imageCheckbox.checked,
          includeCss: cssCheckbox.checked,
          includeJs: jsCheckbox.checked
        }
      };
      await browser.storage.local.set(options);
    } catch (error) {
      console.error('Failed to save download options:', error);
    }
  };

  // Add change event listeners
  [imageCheckbox, cssCheckbox, jsCheckbox].forEach(checkbox => {
    checkbox.addEventListener('change', saveOptions);
  });

  return {
    getOptions() {
      return {
        includeImages: imageCheckbox.checked,
        includeCss: cssCheckbox.checked,
        includeJs: jsCheckbox.checked
      };
    }
  };
} 