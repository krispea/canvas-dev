# Drupal Canvas Component Library Guide

**Project:** canvas-dev  
**Theme:** appf (Tailwind CSS 3.4 + Alpine.js)  
**Drupal Version:** 11.x  
**Last Updated:** October 2024

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Types](#component-types)
3. [Technology Stack](#technology-stack)
4. [Directory Structure](#directory-structure)
5. [SDC Components (Twig + Alpine.js)](#sdc-components-twig--alpinejs)
6. [Canvas Code Components (React)](#canvas-code-components-react)
7. [Canvas CLI Setup](#canvas-cli-setup)
8. [Development Workflows](#development-workflows)
9. [Quick Command Reference](#quick-command-reference)

---

## Architecture Overview

### The Big Picture

This project uses **TWO complementary component systems**:

1. **SDC Components (Twig)** - Static and semi-interactive UI components
2. **Canvas Code Components (React)** - Dynamic data-driven components

```
Canvas Editor (React UI - Admin only)
    ↓
Component Library (Mixed: Twig + React)
    ↓
Frontend Output (Server + Client rendered)
```

### Why Two Systems?

| Aspect | SDC (Twig) | Code Components (React) |
|--------|-----------|------------------------|
| **Rendering** | Server-side | Client-side |
| **Performance** | Fast (~0kb JS) | Slower (~130kb React) |
| **SEO** | Excellent | Requires hydration |
| **Data** | Static props | Dynamic JSON:API |
| **Use Case** | UI components | Data-driven features |

**Strategy:** Use Twig for 90% of components, React for complex data needs.

---

## Component Types

### 1. SDC Components (Twig + Tailwind + Alpine.js)

**Location:** `web/themes/custom/appf/components/`  
**Managed:** File system (Git)  
**Rendered:** Server-side

**Best For:**
- ✅ Buttons, badges, icons, headings
- ✅ Dropdowns, modals, accordions, tabs
- ✅ Cards, hero banners, layouts
- ✅ Any static or semi-interactive UI

**Not For:**
- ❌ Fetching Drupal content dynamically
- ❌ Complex real-time data updates

### 2. Canvas Code Components (React + JSON:API)

**Location:** `web/themes/custom/appf/components/organisms/`  
**Managed:** Drupal database + CLI for local dev  
**Rendered:** Client-side

**Best For:**
- ✅ Article lists (fetch via JSON:API)
- ✅ Product grids (dynamic filtering)
- ✅ User dashboards (personalized data)
- ✅ Search interfaces

**Not For:**
- ❌ Simple UI components (overkill)
- ❌ SEO-critical static content

---

## Technology Stack

### Frontend

- **Tailwind CSS 3.4** - Utility-first CSS
- **Alpine.js 3.x** - Lightweight JavaScript (15kb)
- **Vite 6.x** - Build tool
- **PostCSS 8.x** - CSS processing

### Canvas Code Components

- **React 18.x** - UI library
- **SWR** - Data fetching/caching
- **@drupal-api-client** - JSON:API client
- **Canvas CLI** - Local development tool

### Drupal Modules

- **Canvas** - Page builder
- **Canvas OAuth** - CLI authentication
- **Components** - SDC support

---

## Directory Structure

```
canvas-dev/
├── .canvasrc                    # Canvas CLI config
├── COMPONENT_LIBRARY_GUIDE.md   # This file
│
└── web/themes/custom/appf/
    ├── components/              # ALL components
    │   ├── atoms/               # Simple Twig (button, icon, badge)
    │   ├── molecules/           # Medium Twig (card, dropdown, modal)
    │   └── organisms/           # Complex React (article-list, etc.)
    │       └── article-list/
    │           ├── component.yml
    │           ├── index.jsx    # React code
    │           └── dist/        # Compiled
    │
    ├── src/css/
    │   └── main.css
    ├── dist/                    # Compiled CSS/JS
    ├── tailwind.config.js
    └── package.json
```

**Key:** Atoms/Molecules = Twig, Organisms = React (for dynamic data)

---

## SDC Components (Twig + Alpine.js)

### What is Alpine.js?

Alpine.js adds interactivity **directly in HTML** - no separate JS files needed!

**Core Directives:**

| Directive | Purpose | Example |
|-----------|---------|---------|
| `x-data` | Component state | `x-data="{ open: false }"` |
| `x-show` | Show/hide | `x-show="open"` |
| `@click` | Click handler | `@click="open = true"` |
| `@click.away` | Click outside | `@click.away="open = false"` |
| `x-transition` | Animations | `x-transition` |

### Example: Dropdown Component

**dropdown.component.yml:**
```yaml
name: Dropdown
group: Molecules
props:
  type: object
  properties:
    label:
      type: string
      default: Menu
    items:
      type: array
```

**dropdown.twig:**
```twig
<div x-data="{ open: false }" class="relative">
  <button @click="open = !open" class="px-4 py-2 bg-primary text-white rounded-md">
    {{ label }}
  </button>
  
  <div x-show="open" @click.away="open = false" 
       class="absolute mt-2 bg-white shadow-lg rounded-md">
    {% for item in items %}
      <a href="{{ item.url }}" class="block px-4 py-2 hover:bg-gray-100">
        {{ item.text }}
      </a>
    {% endfor %}
  </div>
</div>
```

**That's it!** Alpine.js handles all the JavaScript automatically.

### Development Workflow

```bash
# 1. Create component files
mkdir -p web/themes/custom/appf/components/molecules/my-component

# 2. Create component.yml and .twig files

# 3. Build CSS
cd web/themes/custom/appf
yarn build

# 4. Clear cache
ddev drush cr

# 5. Test in Canvas editor
```

---

## Canvas Code Components (React)

### When to Use React Components

Use React when you need:
- ✅ Dynamic data from Drupal (JSON:API)
- ✅ Real-time filtering/sorting
- ✅ Complex client-side state
- ✅ Interactive dashboards

### Example: Article List

**component.yml:**
```yaml
name: Article List
group: Organisms
props:
  type: object
  properties:
    limit:
      type: number
      default: 6
    showTags:
      type: boolean
      default: true
```

**index.jsx:**
```jsx
import useSWR from 'swr';
import { JsonApiClient } from '@drupal-api-client/json-api-client';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';

const client = new JsonApiClient();

export default function ArticleList({ limit = 6, showTags = true }) {
  const params = new DrupalJsonApiParams()
    .addInclude(['field_tags', 'field_image'])
    .addPageLimit(limit);

  const { data, error, isLoading } = useSWR(
    ['node--article', { queryString: params.getQueryString() }],
    ([type, options]) => client.getCollection(type, options),
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading articles</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {data.map((article) => (
        <article key={article.id} className="border rounded-lg p-4">
          <h3 className="text-xl font-bold">{article.title}</h3>
          {showTags && article.field_tags?.map(tag => (
            <span key={tag.id} className="px-2 py-1 bg-primary text-white rounded">
              {tag.name}
            </span>
          ))}
          <a href={article.path.alias}>Read more</a>
        </article>
      ))}
    </div>
  );
}
```

---

## Canvas CLI Setup

### Prerequisites

1. Canvas OAuth module enabled
2. OAuth client configured
3. Node.js 20+

### Installation

```bash
npm install -g @drupal-canvas/cli
```

### Configuration

Create `.canvasrc` in project root:

```bash
CANVAS_SITE_URL=https://canvas-dev.ddev.site
CANVAS_CLIENT_ID=canvas-cli
CANVAS_CLIENT_SECRET=your-secret-here
CANVAS_COMPONENT_DIR=./web/themes/custom/appf/components/organisms
```

### OAuth Setup in Drupal

1. Enable module:
   ```bash
   ddev drush en canvas_oauth -y
   ```

2. Create OAuth client at `/admin/config/services/consumer/add`:
   - **Label:** Canvas CLI
   - **Client ID:** canvas-cli
   - **Client Secret:** [generate secure secret]
   - **Scopes:** `canvas:js_component canvas:asset_library`
   - **Grant types:** Client Credentials

3. Copy Client ID and Secret to `.canvasrc`

### Available Commands

```bash
# Download all components from Drupal
canvas download --all

# Download specific component
canvas download --component article-list

# Create new component scaffold
canvas scaffold --name my-component

# Build components locally
canvas build --all

# Upload to Drupal
canvas upload --all
```

---

## Development Workflows

### Creating a Twig Component

```bash
# 1. Create directory
mkdir -p web/themes/custom/appf/components/molecules/card

# 2. Create component.yml
# 3. Create card.twig

# 4. Build CSS
cd web/themes/custom/appf && yarn build

# 5. Clear cache
ddev drush cr

# 6. Test in Canvas
```

### Creating a React Component

```bash
# 1. Create in Canvas UI (browser editor)

# 2. Download with CLI
canvas download --component my-component

# 3. Edit component.yml - add group: Organisms

# 4. Edit index.jsx in VS Code

# 5. Build and upload
canvas build --component my-component
canvas upload --component my-component

# 6. Clear cache
ddev drush cr
```

### Editing React Component

```bash
# 1. Download latest
canvas download --component article-list

# 2. Edit locally
code web/themes/custom/appf/components/organisms/article-list/index.jsx

# 3. Build and upload
canvas build --component article-list
canvas upload --component article-list

# 4. Test
ddev drush cr
```

---

## Quick Command Reference

### Theme Development

```bash
# Build Tailwind CSS
cd web/themes/custom/appf
yarn build

# Watch mode
yarn dev

# Clear cache
ddev drush cr
```

### Canvas CLI

```bash
# Download all
canvas download --all

# Download one
canvas download --component article-list

# Create new
canvas scaffold --name my-component

# Build
canvas build --all

# Upload
canvas upload --all
```

### Common Tasks

```bash
# Fresh rebuild everything
cd web/themes/custom/appf
yarn build
ddev drush cr

# Download, edit, upload React component
canvas download --component article-list
# ... edit files ...
canvas build --component article-list
canvas upload --component article-list
ddev drush cr
```

---

## Best Practices

### Component Organization

1. **Atomic Design:** atoms → molecules → organisms
2. **Technology by complexity:** Twig (simple), React (dynamic)
3. **One responsibility per component**

### Twig Best Practices

- Always set defaults: `{% set label = label|default('Default') %}`
- Document props in comments
- Use Tailwind utilities, avoid custom CSS
- Add dynamic classes to safelist

### Alpine.js Best Practices

- Keep state in `x-data`
- Use `@click.away` for dropdowns/modals
- Add `x-transition` for smooth UX
- One Alpine component per Twig component

### React Best Practices

- Use SWR for data fetching
- Always handle loading/error states
- Keep components focused (single responsibility)
- Use TypeScript for complex components

### Performance

- **Use Twig for static content** (faster, better SEO)
- **Use React only when needed** (dynamic data)
- Optimize images
- Lazy load heavy components

---

## Troubleshooting

### Tailwind classes not working

**Solution:** Add to safelist in `tailwind.config.js`:
```javascript
safelist: ['text-bg-primary', 'bg-yellow-500']
```

Then rebuild: `yarn build && ddev drush cr`

### Alpine.js not working

**Check:**
1. Alpine.js library loaded in `appf.libraries.yml`
2. Library attached in `appf.info.yml`
3. Browser console for errors

### Canvas CLI auth fails

**Check:**
1. OAuth client configured correctly
2. Client ID/Secret in `.canvasrc`
3. Scopes: `canvas:js_component canvas:asset_library`

### Code component not appearing

**Check:**
1. `component.yml` has `group` property
2. Clear cache: `ddev drush cr`
3. Status is `stable` not `experimental`

---

## Resources

- **Drupal Canvas:** https://www.drupal.org/project/canvas
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Alpine.js:** https://alpinejs.dev/
- **Drupal SDC:** https://www.drupal.org/docs/develop/theming-drupal/using-single-directory-components

---

## Summary

**Component Strategy:**
- 📁 **All components** in `components/` folder
- 🎨 **Atoms/Molecules** = Twig + Alpine.js (static/simple)
- 🚀 **Organisms** = React + JSON:API (dynamic/complex)
- 🛠️ **Canvas CLI** for managing React components
- 💨 **Tailwind CSS** for all styling
- ⚡ **Alpine.js** for simple interactivity (15kb!)

**Remember:** Use Twig by default, React only when you need dynamic data!

---

**Need help?** Re-read this guide or check troubleshooting section.
