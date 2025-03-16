export const FILE_TYPES = {
  // Web Documents
  HTML: {
    extensions: ['.html', '.htm', '.xhtml'],
    folder: 'html',
    mimeTypes: ['text/html', 'application/xhtml+xml']
  },
  
  // Styling
  CSS: {
    extensions: ['.css', '.scss', '.sass', '.less'],
    folder: 'css',
    mimeTypes: ['text/css']
  },
  
  // Scripts
  JAVASCRIPT: {
    extensions: ['.js', '.jsx', '.mjs', '.ts', '.tsx'],
    folder: 'javascript',
    mimeTypes: ['text/javascript', 'application/javascript', 'application/x-javascript']
  },
  
  // Images
  IMAGES: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.bmp'],
    folder: 'images',
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp', 'image/x-icon', 'image/bmp']
  },
  
  // Fonts
  FONTS: {
    extensions: ['.woff', '.woff2', '.ttf', '.eot', '.otf'],
    folder: 'fonts',
    mimeTypes: ['font/woff', 'font/woff2', 'font/ttf', 'application/vnd.ms-fontobject', 'font/otf']
  },
  
  // Media
  MEDIA: {
    extensions: ['.mp4', '.webm', '.ogg', '.mp3', '.wav'],
    folder: 'media',
    mimeTypes: ['video/mp4', 'video/webm', 'audio/ogg', 'audio/mp3', 'audio/wav']
  },
  
  // Documents
  DOCUMENTS: {
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.md'],
    folder: 'documents',
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown']
  },
  
  // Data
  DATA: {
    extensions: ['.json', '.xml', '.csv', '.yaml', '.yml'],
    folder: 'data',
    mimeTypes: ['application/json', 'application/xml', 'text/csv', 'application/yaml']
  }
}; 