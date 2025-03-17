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
    scripts: new Set(), // Using Set to avoid duplicates
    styles: new Set(),
    images: new Set(),
    fonts: new Set(),
    other: new Set()
  };

  // Get all script sources from script tags
  document.querySelectorAll('script[src]').forEach(script => {
    resources.scripts.add(script.src);
  });

  // Get all stylesheet links
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    resources.styles.add(link.href);
  });

  // Get all images
  document.querySelectorAll('img[src]').forEach(img => {
    resources.images.add(img.src);
  });

  // Get font files
  document.querySelectorAll('link[rel="preload"][as="font"]').forEach(font => {
    resources.fonts.add(font.href);
  });

  // Get dynamically loaded scripts
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'SCRIPT' && node.src) {
          resources.scripts.add(node.src);
        }
      });
    });
  });

  // Start observing the document with the configured parameters
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Get resources from Performance API
  if (window.performance && window.performance.getEntriesByType) {
    const entries = window.performance.getEntriesByType('resource');
    entries.forEach(entry => {
      if (entry.initiatorType === 'script') {
        resources.scripts.add(entry.name);
      } else if (entry.initiatorType === 'css') {
        resources.styles.add(entry.name);
      } else if (entry.initiatorType === 'img') {
        resources.images.add(entry.name);
      } else if (entry.initiatorType === 'font') {
        resources.fonts.add(entry.name);
      } else {
        resources.other.add(entry.name);
      }
    });
  }

  // Intercept network requests
  const originalFetch = window.fetch;
  window.fetch = async function(url, options) {
    const response = await originalFetch(url, options);
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('javascript')) {
      resources.scripts.add(url);
    } else if (contentType && contentType.includes('css')) {
      resources.styles.add(url);
    } else if (contentType && contentType.includes('image')) {
      resources.images.add(url);
    } else if (contentType && contentType.includes('font')) {
      resources.fonts.add(url);
    } else {
      resources.other.add(url);
    }
    
    return response;
  };

  // Intercept XHR requests
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    const xhr = this;
    xhr.addEventListener('load', function() {
      const contentType = xhr.getResponseHeader('content-type');
      if (contentType && contentType.includes('javascript')) {
        resources.scripts.add(url);
      } else if (contentType && contentType.includes('css')) {
        resources.styles.add(url);
      } else if (contentType && contentType.includes('image')) {
        resources.images.add(url);
      } else if (contentType && contentType.includes('font')) {
        resources.fonts.add(url);
      } else {
        resources.other.add(url);
      }
    });
    return originalXHROpen.apply(this, arguments);
  };

  // Convert Sets to Arrays for return
  return {
    scripts: Array.from(resources.scripts),
    styles: Array.from(resources.styles),
    images: Array.from(resources.images),
    fonts: Array.from(resources.fonts),
    other: Array.from(resources.other)
  };
}

// Listen for messages from the background script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getPageContent') {
    const resources = getPageResources();
    sendResponse({
      html: document.documentElement.outerHTML,
      resources,
      url: window.location.href
    });
  }
  return true;
}); 