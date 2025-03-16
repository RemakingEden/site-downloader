# Hello World Firefox Extension

A basic Firefox extension template.

## Development

1. Install dependencies:
```bash
npm install
```

2. Run tests:
```bash
npm test
```

3. Start the extension in Firefox:
```bash
npm start
```

## Building

To build the extension:
```bash
npm run build
```

The built extension will be in the `web-ext-artifacts` directory.

## Installing in Firefox

1. Go to `about:debugging` in Firefox
2. Click "This Firefox" on the left sidebar
3. Click "Load Temporary Add-on"
4. Navigate to the extension's manifest.json file and select it

The extension will now be loaded in Firefox. You can see the "Hello World" popup by clicking the extension icon in the toolbar. 