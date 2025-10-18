# APPF Theme

Modern Drupal 11 theme with Tailwind CSS, Vite, and Canvas integration.

## Features

- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Vite 6.x** - Fast build tool with HMR (Hot Module Replacement)
- **Alpine.js** - Lightweight JavaScript framework for interactivity
- **Node.js 24** - Latest LTS version
- **Yarn 4** - Modern package manager
- **Single Directory Components (SDC)** - Canvas-ready components

## Requirements

- Node.js >= 24.0.0
- Yarn 4.10.3 (configured via packageManager)
- Drupal 10.2+ or 11

## Installation

### 1. Install Node.js 24

Using nvm:

```bash
nvm install 24
nvm use 24
```

### 2. Install Dependencies

```bash
cd web/themes/custom/appf
yarn install
```

### 3. Build Assets

**Production build:**
```bash
yarn build
```

**Development mode with file watching:**
```bash
yarn watch
```

**Development server with HMR:**
```bash
yarn dev
```

### 4. Enable Theme in Drupal

```bash
drush theme:enable appf
drush config-set system.theme default appf
drush cr
```

## Development

### Available Scripts

- `yarn dev` - Start Vite dev server with HMR (Hot Module Replacement)
- `yarn build` - Build production assets
- `yarn watch` - Build and watch for changes
- `yarn preview` - Preview production build
- `yarn lint:css` - Lint CSS files
- `yarn lint:js` - Lint JavaScript files

### Folder Structure

```
appf/
├── src/                    # Source files (edit these)
│   ├── css/
│   │   └── main.css       # Tailwind CSS entry point
│   └── js/
│       └── main.js        # JavaScript entry point
│
├── dist/                   # Build output (auto-generated, don't edit)
│   ├── css/
│   │   └── style.css      # Compiled CSS
│   └── js/
│       └── main.js        # Bundled JavaScript
│
├── components/             # Single Directory Components (SDC)
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
│
├── templates/              # Twig templates
│   ├── block/
│   ├── field/
│   ├── layout/
│   ├── node/
│   ├── page/
│   └── views/
│
└── config/
    └── schema/
        └── appf.schema.yml
```

## Customization

### Adding Custom Colors

Edit [tailwind.config.js](tailwind.config.js):

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#your-color',
        // Add more shades...
      },
    },
  },
}
```

### Adding Custom CSS

Edit [src/css/main.css](src/css/main.css):

```css
@layer components {
  .your-component {
    @apply /* tailwind utilities */;
  }
}
```

### Adding Custom JavaScript

Edit [src/js/main.js](src/js/main.js):

```javascript
Drupal.behaviors.yourBehavior = {
  attach: function (context, settings) {
    // Your code here
  }
};
```

## Canvas Integration

This theme is designed to work seamlessly with Drupal Canvas module. Components follow the Single Directory Component (SDC) standard.

### Creating Components

Place components in the `components/` directory following atomic design principles:

```
components/
├── atoms/button/
│   ├── button.component.yml
│   ├── button.twig
│   └── button.css
```

## Troubleshooting

### Build fails

1. Ensure Node.js 24 is installed: `node --version`
2. Clear cache: `rm -rf node_modules && yarn install`
3. Rebuild: `yarn build`

### Styles not updating

1. Clear Drupal cache: `drush cr`
2. Rebuild assets: `yarn build`
3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)

## License

GPL-2.0-or-later
