# Canvas CLI Setup Guide

This guide walks through setting up the Canvas CLI tool for local development of Canvas code components.

## Prerequisites

- Drupal 11 with Canvas module installed
- DDEV local environment running
- Node.js installed on host machine

## Installation Steps

### 1. Install Required Modules

```bash
ddev composer require drupal/simple_oauth
ddev drush en simple_oauth canvas_oauth -y
ddev drush cr
```

### 2. Generate OAuth Keys

```bash
mkdir -p oauth-keys
ddev drush simple-oauth:generate-keys ../oauth-keys
```

### 3. Configure Simple OAuth Module

1. Go to: `/admin/config/people/simple_oauth`
2. Set the key paths:
   - **Public Key Path**: `../oauth-keys/public.key`
   - **Private Key Path**: `../oauth-keys/private.key`
3. **Save configuration**

### 4. Create OAuth Consumer

1. Go to: `/admin/config/services/consumer/add`
2. Fill in the form:
   - **Label**: `Canvas CLI` (human-readable name)
   - **User**: Select your admin user
   - **Is this consumer 3rd party?**: ❌ Leave unchecked
   - **Is Confidential?**: ✅ Check this
   - **Access token expiration time**: `300` (default is fine)
   - **Grant types**: ✅ Check **Client Credentials**
   - **Client Credentials settings**:
     - ✅ Check `canvas:js_component`
     - ✅ Check `canvas:asset_library`
   - **New Secret**: Click "Generate" or enter your own (e.g., `secret123`)
3. **Save**
4. **Copy the UUID** from the consumer edit page - this is your actual Client ID

### 5. Install Canvas CLI

In your project root:

```bash
npm install @drupal-canvas/cli
```

### 6. Create .env Configuration File

Create `.env` file in project root:

```bash
##
# Canvas CLI Configuration
##

CANVAS_SITE_URL=http://canvas-dev.ddev.site

# OAuth credentials - replace with your actual UUID and secret
CANVAS_CLIENT_ID=12345678-1234-1234-1234-123456789abc
CANVAS_CLIENT_SECRET=your-generated-secret-here

# Component directory
CANVAS_COMPONENT_DIR=./web/themes/custom/appf/components/code-components

# Verbose output for debugging
CANVAS_VERBOSE=false

# Default scopes (only change if needed)
# CANVAS_SCOPE="canvas:js_component canvas:asset_library"
```

**Important**:
- Use **HTTP** not HTTPS for `CANVAS_SITE_URL` (DDEV internal routing)
- The **Client ID** is the **UUID** from the consumer, NOT the label
- Replace `CANVAS_CLIENT_SECRET` with the secret you generated

### 7. Create Component Directory

```bash
mkdir -p web/themes/custom/appf/components/code-components
```

## Project Structure

```
canvas-dev/
├── .env                                    # Canvas CLI configuration
├── oauth-keys/                             # OAuth encryption keys
│   ├── private.key
│   └── public.key
└── web/
    └── themes/
        └── custom/
            └── appf/
                └── components/
                    ├── atoms/              # SDC components (Twig-based)
                    ├── molecules/
                    ├── layout/
                    ├── organisms/
                    └── code-components/    # Canvas code components (React-based)
                        └── featured_text/
                            ├── component.yml
                            └── index.jsx
```

## Canvas CLI Commands

All commands should be run from the **project root** on your **host machine** (not inside DDEV).

### Download Component from Canvas

Download a component from Canvas to your local filesystem:

```bash
npx canvas download --component featured_text
```

Download all components:

```bash
npx canvas download --all
```

### Upload Component to Canvas

Upload local changes back to Canvas:

```bash
npx canvas upload --component featured_text
```

Upload all components:

```bash
npx canvas upload --all
```

### Create New Component (Scaffold)

Generate a new component from template:

```bash
npx canvas scaffold --name my_new_component
```

This creates:
```
my_new_component/
├── component.yml    # Props, slots, metadata
├── index.jsx        # React component code
└── index.css        # Styles (optional)
```

### Build Components Locally

Compile JSX/React and Tailwind CSS locally:

```bash
npx canvas build --all
```

Build without Tailwind:

```bash
npx canvas build --no-tailwind
```

### Other Options

View help:

```bash
npx canvas --help
npx canvas download --help
```

Verbose output for debugging:

```bash
npx canvas download --component featured_text --verbose
```

Or set in `.env`:
```bash
CANVAS_VERBOSE=true
```

## Development Workflow

### Option 1: Canvas UI (Browser)

1. Open Canvas UI: `https://canvas-dev.ddev.site/canvas`
2. Create/edit code components in browser editor
3. Download to local: `npx canvas download --component my_component`
4. Continue editing locally

### Option 2: Local Development (CLI)

1. Create component: `npx canvas scaffold --name my_component`
2. Edit files in `code-components/my_component/`
3. Upload to Canvas: `npx canvas upload --component my_component`
4. Test in Canvas UI

### Recommended Workflow

1. **Prototype** in Canvas UI (fast iteration)
2. **Download** to local when ready for version control
3. **Edit locally** in your IDE with proper tooling
4. **Upload** changes back to Canvas
5. **Commit** to Git for version control

## Troubleshooting

### Error: Authentication failed

- Verify `CANVAS_CLIENT_ID` is the **UUID** from consumer (not the label)
- Verify `CANVAS_CLIENT_SECRET` matches what's in Drupal
- Check both scopes are enabled in consumer settings

### Error: You need to set the OAuth2 private key

- Generate keys: `ddev drush simple-oauth:generate-keys ../oauth-keys`
- Configure paths in Simple OAuth settings
- Verify file permissions on key files

### Error: Network error / No response from DDEV site

- Change `CANVAS_SITE_URL` from HTTPS to HTTP
- Verify DDEV is running: `ddev status`
- Try: `ddev restart`

### Error: Cannot find module lightningcss

- Run on **host machine**, not inside DDEV container
- If still fails, try: `npm install` to rebuild dependencies

### Component not appearing in Canvas UI after upload

- Clear Drupal cache: `ddev drush cr`
- Refresh Canvas UI in browser
- Check component status in `component.yml` is `true`

## Additional Resources

- **Canvas Documentation**: https://project.pages.drupalcode.org/canvas/
- **Canvas CLI NPM Package**: https://www.npmjs.com/package/@drupal-canvas/cli
- **Canvas Code Components Guide**: https://project.pages.drupalcode.org/canvas/code-components/
- **Canvas Data Fetching**: https://project.pages.drupalcode.org/canvas/code-components/data-fetching/

## Security Notes

- **Never commit** `.env` file to Git (add to `.gitignore`)
- **Never commit** `oauth-keys/` directory to Git (add to `.gitignore`)
- Keep OAuth secrets secure
- Regenerate secrets if compromised

Add to `.gitignore`:
```
.env
oauth-keys/
```

## Summary

You now have:
- ✅ OAuth authentication configured
- ✅ Canvas CLI installed and working
- ✅ Local development environment for code components
- ✅ Ability to sync components between Canvas UI and local filesystem

Happy coding! 🚀
