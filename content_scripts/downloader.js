// Function to download resources
/* eslint-disable no-unused-vars */
async function downloadResource(url) {
/* eslint-enable no-unused-vars */
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return { url, blob };
  } catch (error) {
    console.error(`Failed to download ${url}:`, error);
    return null;
  }
}

// Function to get all resources from the page
function getPageResources() {
  const resources = {
    scripts: [],
    styles: [],
    images: [],
    fonts: [],
    other: []
  };

  // Get all script sources
  document.querySelectorAll('script[src]').forEach(script => {
    resources.scripts.push(script.src);
  });

  // Get all stylesheet links
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    resources.styles.push(link.href);
  });

  // Get all images
  document.querySelectorAll('img[src]').forEach(img => {
    resources.images.push(img.src);
  });

  // Get font files
  document.querySelectorAll('link[rel="preload"][as="font"]').forEach(font => {
    resources.fonts.push(font.href);
  });

  return resources;
}

// Listen for messages from the extension
/* eslint-disable no-unused-vars */
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
/* eslint-enable no-unused-vars */
  if (message.action === 'getPageContent') {
    // Get the HTML content
    const htmlContent = document.documentElement.outerHTML;
    
    // Get all resources
    const resources = getPageResources();

    // Send back the page content and resources
    return {
      html: htmlContent,
      resources: resources,
      url: window.location.href
    };
  }
}); 