# Website Downloader - Firefox Extension

A Firefox browser extension that allows users to download websites for offline viewing. Built with modern JavaScript and follows Firefox's WebExtensions API standards.

## Installation

### For Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/firefox-download-js.git
cd firefox-download-js
```

2. Install dependencies:
```bash
npm install
```

3. Run the extension locally:
```bash
npm start
```

### For Users

The extension will be available on the Firefox Add-ons store (coming soon).

## Development

### Available Scripts

- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run UI tests
- `npm run test:unit` - Run unit tests
- `npm run test:integration` - Run integration tests
- `npm run test:coverage` - Generate test coverage report
- `npm run build` - Build the extension
- `npm start` - Run the extension locally
- `npm run web-ext-lint` - Lint the extension using web-ext
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically

### Project Structure

```
firefox-download-js/
├── background/         # Background scripts
├── popup/             # Popup UI files
├── ui/                # Shared UI components
├── icons/             # Extension icons
├── tests/             # Test files
├── assets/            # Static assets
└── manifest.json      # Extension manifest
```

### Testing

The project uses Vitest for testing. Tests are categorized into:
- Unit tests
- Integration tests
- UI tests

Run all tests with `npm test` or specific test suites using the appropriate npm script.

### Building

To build the extension:

1. Run `npm run build`
2. The built extension will be available in the `web-ext-artifacts/` directory

### Continuous Integration

The project uses GitHub Actions for CI/CD with the following checks:
- Linting
- Testing
- Building
- Security audit
- Web-ext validation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Security

- The extension follows Firefox's content security policy
- Regular security audits are performed through CI/CD
- Dependencies are regularly updated and monitored

## Support

For support, please open an issue in the GitHub repository. 