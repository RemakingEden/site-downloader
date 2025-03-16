export class WebDownloader {
  sanitizeName(name) {
    // Remove invalid filesystem characters and spaces
    return name
      .replace(/[<>:"/\\|?*\s]/g, '_') // Replace invalid chars with underscore
      .replace(/_+/g, '_')             // Replace multiple underscores with single
      .replace(/^_|_$/g, '')           // Remove leading/trailing underscores
      .toLowerCase();                   // Convert to lowercase
  }

  getWebsiteRoot(url) {
    try {
      const urlObj = new URL(url);
      // Get hostname and remove all TLDs and subdomains
      const hostname = urlObj.hostname
        .replace(/^www\./, '')                // Remove www.
        .replace(/\.[^.]+$/, '')             // Remove last TLD
        .split('.')                          // Split remaining parts
        .pop();                              // Take the last part
      
      return this.sanitizeName(hostname);
    } catch (error) {
      console.error('Invalid URL:', error);
      return 'unknown_site';
    }
  }

  getPathName(url) {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      if (!path || path === '/') {
        return 'home';
      }
      // Sanitize the path
      return this.sanitizeName(
        path
          .replace(/^\/+|\/+$/g, '')  // Remove leading/trailing slashes
          .replace(/\//g, '_')        // Replace remaining slashes with underscore
      );
    } catch (error) {
      console.error('Invalid URL:', error);
      return 'home';
    }
  }

  createFolderPath(basePath, url) {
    const websiteRoot = this.getWebsiteRoot(url);
    const pathName = this.getPathName(url);
    return `${basePath}/${websiteRoot}/${pathName}`;
  }

  async getPageResources(html, baseUrl) {
    const resources = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Get current path for relative URLs
    const baseUrlObj = new URL(baseUrl);
    const rootPath = `${baseUrlObj.protocol}//${baseUrlObj.host}/`;

    // Helper function to resolve URLs
    const resolveUrl = (url) => {
      try {
        // If the URL starts with a protocol or //, it's absolute
        if (/^[a-z]+:\/\/|^\/\//.test(url)) {
          return new URL(url).href;
        }
        
        // If the URL starts with /, it's relative to the domain root
        if (url.startsWith('/')) {
          return new URL(url.substring(1), rootPath).href;
        }
        
        // Otherwise, it's also relative to the domain root
        return new URL(url, rootPath).href;
      } catch (error) {
        console.error('Failed to resolve URL:', error);
        return url;
      }
    };

    // Helper function to get filename from URL
    const getFilename = (url) => {
      try {
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split('/');
        return parts[parts.length - 1] || 'index.html';
      } catch (error) {
        console.error('Invalid URL:', error);
        return 'unknown';
      }
    };

    // Get stylesheets
    doc.querySelectorAll('link[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (!link.getAttribute('rel') || link.getAttribute('rel') === 'stylesheet')) {
        const url = resolveUrl(href);
        if (url) {
          resources.push({
            url,
            filename: getFilename(url),
            type: 'css'
          });
        }
      }
    });

    // Get scripts
    doc.querySelectorAll('script[src]').forEach(script => {
      const src = script.getAttribute('src');
      if (src) {
        const url = resolveUrl(src);
        if (url) {
          resources.push({
            url,
            filename: getFilename(url),
            type: 'js'
          });
        }
      }
    });

    // Get images
    doc.querySelectorAll('img[src]').forEach(img => {
      const src = img.getAttribute('src');
      if (src) {
        const url = resolveUrl(src);
        if (url) {
          resources.push({
            url,
            filename: getFilename(url),
            type: 'image'
          });
        }
      }
    });

    // Get HTML files
    doc.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.endsWith('.html')) {
        const url = resolveUrl(href);
        if (url) {
          resources.push({
            url,
            filename: getFilename(url),
            type: 'html'
          });
        }
      }
    });

    return resources;
  }

  async downloadResources(resources, basePath, pageUrl) {
    const results = {
      succeeded: [],
      failed: []
    };

    const folderPath = this.createFolderPath(basePath, pageUrl);

    for (const resource of resources) {
      try {
        await browser.downloads.download({
          url: resource.url,
          filename: `${folderPath}/${resource.filename}`
        });
        results.succeeded.push(resource);
      } catch (error) {
        console.error(`Failed to download ${resource.url}:`, error);
        results.failed.push(resource);
      }
    }

    return results;
  }
} 