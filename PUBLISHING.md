# Publishing neokex-ica to npm

This guide will help you publish the neokex-ica package to npm.

## Prerequisites

1. **npm account**: Create an account at [npmjs.com](https://www.npmjs.com/)
2. **Git repository**: Push your code to GitHub
3. **Node.js installed**: Version 16 or higher

## Step-by-Step Guide

### 1. Update Package Information

Edit `package.json` and update the following fields:

```json
{
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/neokex-ica.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/neokex-ica/issues"
  },
  "homepage": "https://github.com/yourusername/neokex-ica#readme"
}
```

### 2. Test Your Package Locally

Run the verification script to ensure everything works:

```bash
npm install
node verify.js
```

You should see a list of 40 available methods.

### 3. Login to npm

```bash
npm login
```

Enter your npm username, password, and email when prompted.

### 4. Publish to npm

```bash
npm publish
```

**Note:** The package name `neokex-ica` must be available on npm. If it's already taken, you'll need to:
- Choose a different name and update `package.json`
- Or use a scoped package: `@yourusername/neokex-ica`

### 5. Verify Publication

After publishing, verify your package is live:

```bash
npm info neokex-ica
```

You can also visit: `https://www.npmjs.com/package/neokex-ica`

## Updating Your Package

When you make changes and want to publish a new version:

### 1. Update Version Number

Use npm's version command:

```bash
# For bug fixes (1.0.0 -> 1.0.1)
npm version patch

# For new features (1.0.0 -> 1.1.0)
npm version minor

# For breaking changes (1.0.0 -> 2.0.0)
npm version major
```

### 2. Publish the Update

```bash
npm publish
```

## Files Included in Package

The `.npmignore` file ensures only necessary files are published:

**Included:**
- `src/` - All source code
- `README.md` - Documentation
- `LICENSE` - MIT license
- `IMPLEMENTATION_NOTES.md` - Technical implementation guide
- `package.json` - Package configuration

**Excluded:**
- Development files (test.js, verify.js)
- Replit configuration files
- Git files
- Editor/IDE files
- Logs and temporary files

## Scoped Packages (Alternative)

If `neokex-ica` is unavailable, you can publish as a scoped package:

### 1. Update package.json

```json
{
  "name": "@yourusername/neokex-ica"
}
```

### 2. Publish as Public

```bash
npm publish --access public
```

Users will then install with:

```bash
npm install @yourusername/neokex-ica
```

## Best Practices

1. **Test before publishing**: Always run tests and verify the package works
2. **Semantic versioning**: Follow semver (MAJOR.MINOR.PATCH)
3. **Changelog**: Keep a CHANGELOG.md file documenting changes
4. **Git tags**: Tag releases in Git to match npm versions
5. **README updates**: Keep documentation current with features

## Troubleshooting

### Package name already exists
- Choose a different name
- Use a scoped package (@username/package)

### Permission denied
- Run `npm login` again
- Check your npm account has publish permissions

### Version already published
- You cannot republish the same version
- Increment version number with `npm version patch`

## After Publishing

Share your package:
- Add npm badge to README: `[![npm version](https://badge.fury.io/js/neokex-ica.svg)](https://www.npmjs.com/package/neokex-ica)`
- Share on social media and developer communities
- Create examples and tutorials
- Respond to issues and pull requests

---

**Need help?** Visit [npm documentation](https://docs.npmjs.com/cli/v9/commands/npm-publish)
