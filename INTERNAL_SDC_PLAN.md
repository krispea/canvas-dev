# Internal SDC Component Library - Implementation Plan

## Executive Summary

This document outlines the plan to create a company-wide, reusable SDC (Single Directory Components) library that can be used across all Drupal 10, Drupal 11, and Canvas projects.

### Key Decisions Made

1. ✅ **Use SDC Components** (not Canvas Code Components) - for portability across all Drupal versions
2. ✅ **Create as a Module** (not theme-dependent) - for reusability across projects
3. ✅ **Include Drupal Recipe inside module** - for easy setup (one package, less confusion)
4. ✅ **Bundle Tailwind CSS + Alpine.js** - self-contained dependencies
5. ✅ **Use Atomic Design** structure - atoms, molecules, organisms

---

## Why This Approach?

### SDC Components vs Code Components

| Feature | SDC Components | Code Components |
|---------|---------------|-----------------|
| Works in Drupal 10 | ✅ Yes | ❌ No (Canvas only) |
| Works in Drupal 11 | ✅ Yes | ✅ Yes (with Canvas) |
| Works in Canvas | ✅ Yes | ✅ Yes |
| Server-side rendering | ✅ Yes | ❌ No (client-side React) |
| Theme independent | ✅ Yes | ❌ Canvas dependent |
| Portability | ✅ High | ❌ Low |
| Performance | ✅ Better (no React bundle) | ⚠️ React overhead |
| **Recommendation** | ✅ **Use for library** | ⚠️ Use for Canvas-only projects |

### Module vs Theme Components

**Canvas discovers components from BOTH modules AND themes** (verified in Canvas source code).

**Advantages of Module-based components:**
- ✅ Reusable across all projects
- ✅ Independent of theme
- ✅ Can be versioned and distributed via Composer
- ✅ Works in projects with different themes
- ✅ Single source of truth for company design system

### Recipe Inside Module (Not Separate)

**Why keep recipe inside the module:**
- ✅ **Less confusion** - developers install ONE package, not two
- ✅ **Version sync** - recipe always matches module version
- ✅ **Simpler distribution** - one repository to maintain
- ✅ **Optional usage** - recipe provides automatic setup but isn't required
- ✅ **Better DX** - clear documentation, single source of truth

---

## Project Structure

```
web/modules/custom/internal_sdc/
├── recipe/                              # Drupal Recipe for easy setup
│   ├── recipe.yml                       # Recipe definition
│   ├── config/                          # Optional default configs
│   │   └── install/
│   │       └── canvas.settings.yml
│   └── README.md                        # Recipe usage documentation
│
├── components/                          # SDC components (Atomic Design)
│   ├── atoms/
│   │   ├── button/
│   │   │   ├── button.component.yml
│   │   │   ├── button.twig
│   │   │   └── button.css
│   │   ├── logo/
│   │   ├── heading/
│   │   ├── link/
│   │   └── icon/
│   ├── molecules/
│   │   ├── card/
│   │   ├── navigation/
│   │   └── search-form/
│   └── organisms/
│       ├── header-basic/
│       │   ├── header-basic.component.yml
│       │   ├── header-basic.twig
│       │   └── header-basic.js        # Alpine.js behaviors
│       ├── header-centered/
│       ├── header-split/
│       ├── footer/
│       └── hero/
│
├── assets/                              # Build system & compiled assets
│   ├── src/
│   │   ├── css/
│   │   │   └── tailwind.css           # Tailwind source
│   │   └── js/
│   │       └── alpine-init.js         # Alpine initialization
│   └── dist/                            # Compiled (gitignored)
│       ├── css/
│       │   └── internal-sdc.css       # Built Tailwind
│       └── js/
│           └── internal-sdc.js        # Built Alpine + bundle
│
├── config/                              # Module configs (optional)
│   └── install/
│       └── internal_sdc.settings.yml
│
├── tests/                               # Component tests (optional)
│   ├── src/
│   └── fixtures/
│
├── docs/                                # Documentation
│   ├── INSTALLATION.md
│   ├── COMPONENTS.md
│   └── DEVELOPMENT.md
│
├── internal_sdc.info.yml               # Module definition
├── internal_sdc.libraries.yml          # Asset libraries (Tailwind + Alpine)
├── composer.json                        # PHP dependencies
├── package.json                         # NPM dependencies (Tailwind, Alpine)
├── tailwind.config.js                   # Tailwind configuration
├── postcss.config.js                    # PostCSS configuration
├── .gitignore                           # Ignore dist/, node_modules/
└── README.md                            # Main documentation
```

---

## Key Configuration Files

### 1. internal_sdc.info.yml

```yaml
name: 'Internal SDC Component Library'
type: module
description: 'Company-wide reusable component library with Tailwind CSS and Alpine.js'
package: Custom
core_version_requirement: ^10 || ^11
dependencies:
  - drupal:sdc

# Optional: Suggest Canvas for visual building
suggests:
  - canvas:canvas
```

### 2. recipe/recipe.yml

```yaml
name: 'Internal SDC Setup'
description: 'Automatically configures Internal SDC component library with Canvas support'
type: 'Component Library'

# Install required modules
install:
  - internal_sdc              # This module
  - canvas                    # Canvas visual builder (if available)

# Configure permissions for Canvas
config:
  actions:
    # Grant content editors access to Canvas
    user.role.content_editor:
      grantPermissions:
        - 'use canvas'
        - 'access canvas ui'

    # Grant administrators full access
    user.role.administrator:
      grantPermissions:
        - 'use canvas'
        - 'access canvas ui'
        - 'administer canvas'
```

### 3. internal_sdc.libraries.yml

```yaml
# Global library - loaded on every page that uses components
global:
  version: 1.x
  css:
    component:
      assets/dist/css/internal-sdc.css: { minified: true }
  js:
    assets/dist/js/internal-sdc.js: { minified: true }
  dependencies:
    - core/drupal
    - core/once

# Optional: Component-specific libraries
# Add these if some components need extra CSS/JS
header-basic:
  css:
    component:
      components/organisms/header-basic/header-basic.css: {}
  js:
    components/organisms/header-basic/header-basic.js: {}
  dependencies:
    - internal_sdc/global
```

### 4. package.json

```json
{
  "name": "@mycompany/internal-sdc",
  "version": "1.0.0",
  "description": "Internal SDC Component Library",
  "scripts": {
    "build": "npm run build:css && npm run build:js",
    "build:css": "tailwindcss -i assets/src/css/tailwind.css -o assets/dist/css/internal-sdc.css --minify",
    "build:js": "esbuild assets/src/js/alpine-init.js --bundle --outfile=assets/dist/js/internal-sdc.js --minify --external:alpinejs",
    "watch": "concurrently \"npm run watch:css\" \"npm run watch:js\"",
    "watch:css": "tailwindcss -i assets/src/css/tailwind.css -o assets/dist/css/internal-sdc.css --watch",
    "watch:js": "esbuild assets/src/js/alpine-init.js --bundle --outfile=assets/dist/js/internal-sdc.js --watch --external:alpinejs"
  },
  "dependencies": {
    "alpinejs": "^3.13.0"
  },
  "devDependencies": {
    "@tailwindcss/forms": "^0.5.7",
    "@tailwindcss/typography": "^0.5.10",
    "autoprefixer": "^10.4.16",
    "concurrently": "^8.2.2",
    "esbuild": "^0.19.8",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0"
  }
}
```

### 5. composer.json

```json
{
  "name": "mycompany/internal-sdc",
  "description": "Internal SDC Component Library for company projects",
  "type": "drupal-custom-module",
  "license": "proprietary",
  "require": {
    "drupal/core": "^10 || ^11"
  },
  "suggest": {
    "drupal/canvas": "Enables visual page building with components"
  }
}
```

### 6. tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.twig',
    './components/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        // Use CSS variables for theme override capability
        primary: 'var(--color-primary, #0066cc)',
        secondary: 'var(--color-secondary, #6c757d)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### 7. postcss.config.js

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 8. assets/src/css/tailwind.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom component styles */
@layer components {
  .btn {
    @apply px-4 py-2 rounded font-medium transition-colors;
  }

  .btn-primary {
    @apply bg-primary text-white hover:bg-primary/90;
  }

  .btn-secondary {
    @apply bg-secondary text-white hover:bg-secondary/90;
  }
}
```

### 9. assets/src/js/alpine-init.js

```javascript
// Initialize Alpine.js
import Alpine from 'alpinejs';

// Make Alpine available globally
window.Alpine = Alpine;

// Start Alpine
Alpine.start();

// Export for use in components
export { Alpine };
```

### 10. .gitignore

```gitignore
# Build artifacts
assets/dist/

# Dependencies
node_modules/
vendor/

# OS files
.DS_Store
Thumbs.db

# IDE
.idea/
.vscode/
*.swp
*.swo
```

---

## Example Component Structure

### Header Basic Component

**components/organisms/header-basic/header-basic.component.yml**

```yaml
$schema: https://git.drupalcode.org/project/drupal/-/raw/HEAD/core/assets/schemas/v1/metadata.schema.json
name: Header Basic
group: Headers
status: stable
description: A responsive header with navigation and Alpine.js interactivity

props:
  type: object
  properties:
    site_name:
      type: string
      title: Site Name
      description: The name of your site

    menu_items:
      type: array
      title: Menu Items
      description: Navigation menu items
      items:
        type: object
        properties:
          title:
            type: string
            title: Menu Item Title
          url:
            type: string
            title: Menu Item URL

libraryOverrides:
  dependencies:
    - internal_sdc/global
```

**components/organisms/header-basic/header-basic.twig**

```twig
{#
/**
 * @file
 * Header Basic component template.
 *
 * Available variables:
 * - site_name: The site name
 * - menu_items: Array of menu items with 'title' and 'url' keys
 */
#}
<header
  class="bg-white border-b border-gray-200 sticky top-0 z-50 transition-all duration-300"
  x-data="{
    mobileMenuOpen: false,
    scrolled: false
  }"
  x-init="window.addEventListener('scroll', () => { scrolled = window.scrollY > 100 })"
  :class="{ 'shadow-md': scrolled }"
>
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-20">

      {# Site Name/Logo #}
      <div class="flex items-center">
        <a href="/" class="text-2xl font-bold text-black">
          {{ site_name|default('My Site') }}
        </a>
      </div>

      {# Desktop Navigation #}
      <nav class="hidden md:flex items-center space-x-6">
        {% for item in menu_items %}
          <a
            href="{{ item.url }}"
            class="text-black hover:text-gray-600 font-medium transition-colors"
          >
            {{ item.title }}
          </a>
        {% endfor %}
      </nav>

      {# Mobile Menu Button #}
      <button
        @click="mobileMenuOpen = !mobileMenuOpen"
        class="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        <svg class="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            x-show="!mobileMenuOpen"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
          <path
            x-show="mobileMenuOpen"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    {# Mobile Navigation #}
    <nav
      x-show="mobileMenuOpen"
      x-transition
      class="md:hidden py-4 border-t border-gray-200"
    >
      <div class="flex flex-col space-y-3">
        {% for item in menu_items %}
          <a
            href="{{ item.url }}"
            @click="mobileMenuOpen = false"
            class="text-black hover:text-gray-600 font-medium py-2 transition-colors"
          >
            {{ item.title }}
          </a>
        {% endfor %}
      </div>
    </nav>
  </div>
</header>
```

---

## Installation & Usage

### For New Projects

#### Step 1: Install via Composer

```bash
composer require mycompany/internal-sdc
```

#### Step 2: Setup (Choose One)

**Option A: Automatic Setup with Recipe (Recommended)**

```bash
php core/scripts/drupal recipe modules/custom/internal_sdc
```

This automatically:
- ✅ Enables internal_sdc module
- ✅ Enables Canvas (if not already enabled)
- ✅ Configures permissions for content editors and admins
- ✅ Makes components available in Canvas UI

**Option B: Manual Setup**

```bash
drush en internal_sdc canvas -y
drush cr
```

Then manually configure permissions at `/admin/people/permissions`.

#### Step 3: Build Assets (First Time Only)

```bash
cd web/modules/custom/internal_sdc
npm install
npm run build
```

#### Step 4: Use Components

**In Twig templates:**

```twig
{% include 'internal_sdc:header-basic' with {
  site_name: 'My Website',
  menu_items: [
    { title: 'Home', url: '/' },
    { title: 'About', url: '/about' },
    { title: 'Services', url: '/services' },
    { title: 'Contact', url: '/contact' }
  ]
} only %}
```

**In Canvas UI:**

1. Open Canvas at `/canvas`
2. Components appear in the left sidebar under "Internal SDC" group
3. Drag and drop to use
4. Configure props in the properties panel

---

## Development Workflow

### Building Assets

```bash
# Development - Build once
cd web/modules/custom/internal_sdc
npm run build

# Development - Watch for changes
npm run watch

# Production
npm run build
```

### Creating New Components

1. Create component directory in appropriate folder (atoms/molecules/organisms)
2. Add `component-name.component.yml` (define props)
3. Add `component-name.twig` (template)
4. Optional: Add `component-name.css` or `component-name.js`
5. Clear Drupal cache: `drush cr`
6. Component appears in Canvas UI automatically

### Component Naming Convention

- **Folder name**: `kebab-case` (e.g., `header-basic`)
- **Files**: `component-name.component.yml`, `component-name.twig`
- **Component ID**: `internal_sdc:component-name` (e.g., `internal_sdc:header-basic`)

### Testing Components

**In Storybook (Optional Future Enhancement):**
- Could integrate Storybook for component documentation
- Visual testing and documentation in one place

**In Drupal:**
- Create test content using components
- Test in Canvas UI
- Test responsive behavior

---

## Distribution Strategy

### Option 1: Private Composer Repository (Recommended)

**Using GitHub/GitLab:**

1. Create private repository: `mycompany/internal-sdc`
2. Add to project's `composer.json`:

```json
{
  "repositories": [
    {
      "type": "vcs",
      "url": "git@github.com:mycompany/internal-sdc.git"
    }
  ],
  "require": {
    "mycompany/internal-sdc": "^1.0"
  }
}
```

### Option 2: Path Repository (Local Development)

```json
{
  "repositories": [
    {
      "type": "path",
      "url": "../internal-sdc"
    }
  ],
  "require": {
    "mycompany/internal-sdc": "^1.0"
  }
}
```

### Option 3: Manual Copy (Simple but not recommended)

```bash
# Copy module to each project
cp -r internal_sdc /path/to/project/web/modules/custom/
```

---

## Versioning Strategy

Use **Semantic Versioning** (SemVer):

- `1.0.0` - Initial release
- `1.0.1` - Bug fixes
- `1.1.0` - New components (backward compatible)
- `2.0.0` - Breaking changes

### Changelog Example

```markdown
## [1.1.0] - 2025-01-15
### Added
- New `card-featured` component
- New `hero-split` component

### Changed
- Updated `header-basic` with better mobile UX

### Fixed
- Fixed Alpine.js initialization timing issue
```

---

## Migration Plan from Current Theme

### Phase 1: Setup (Week 1)
- [ ] Create `internal_sdc` module structure
- [ ] Set up build system (Tailwind + Alpine)
- [ ] Configure libraries.yml
- [ ] Create recipe definition
- [ ] Write documentation

### Phase 2: Migrate One Component (Week 2)
- [ ] Choose one component (e.g., `header-basic`)
- [ ] Copy from theme to module
- [ ] Update component.yml
- [ ] Test in Canvas
- [ ] Verify Tailwind/Alpine work correctly

### Phase 3: Gradual Migration (Weeks 3-6)
- [ ] Migrate atoms (buttons, links, headings, etc.)
- [ ] Migrate molecules (cards, navigation, etc.)
- [ ] Migrate organisms (headers, footers, heroes, etc.)
- [ ] Update theme to use module components
- [ ] Test thoroughly in both Canvas and regular Drupal

### Phase 4: Documentation & Distribution (Week 7)
- [ ] Complete all documentation
- [ ] Set up Composer repository
- [ ] Create version 1.0.0 release
- [ ] Train team on usage

### Phase 5: Rollout (Week 8+)
- [ ] Use in one pilot project
- [ ] Gather feedback
- [ ] Refine and improve
- [ ] Roll out to all projects

---

## Benefits Summary

### For Developers
- ✅ **Reusable** - One library for all projects
- ✅ **Easy to install** - One Composer command + optional recipe
- ✅ **Well documented** - Clear usage examples
- ✅ **Modern tools** - Tailwind CSS + Alpine.js
- ✅ **Type-safe props** - JSON Schema validation

### For Content Editors
- ✅ **Visual building** - Drag and drop in Canvas
- ✅ **Consistent design** - All components match design system
- ✅ **Easy to use** - Well-organized component library
- ✅ **Reliable** - Tested and maintained components

### For the Company
- ✅ **Cost savings** - Build once, use everywhere
- ✅ **Faster development** - No rebuilding common components
- ✅ **Consistent brand** - Same components across all sites
- ✅ **Maintainable** - Single source of truth
- ✅ **Future-proof** - Works in Drupal 10, 11, and beyond

---

## Open Questions to Clarify

### Technical Decisions
1. **Module name**: `internal_sdc` or something else? (e.g., `mycompany_design_system`, `mycompany_components`)
2. **Composer package name**: `mycompany/internal-sdc` or different?
3. **Version 1.0.0 scope**: Which components to include in first release?

### Infrastructure
4. **Repository hosting**: GitHub, GitLab, Bitbucket, or other?
5. **Access control**: Who can commit? Who reviews PRs?
6. **CI/CD**: Automated testing? Automated builds?

### Process
7. **Component request process**: How do developers request new components?
8. **Approval workflow**: Who approves new components or changes?
9. **Breaking changes**: How to handle when needed?

### Documentation
10. **Storybook integration**: Do we want visual component documentation?
11. **Usage analytics**: Track which components are used most?
12. **Support channel**: Slack, email, issue tracker?

### Migration
13. **Timeline**: When should migration start?
14. **Resource allocation**: Who will work on this?
15. **Existing projects**: Update all at once or gradually?

---

## Next Steps

1. **Review and approve this plan** with CTO and team
2. **Answer open questions** listed above
3. **Create timeline** with specific dates and milestones
4. **Assign responsibilities** for each phase
5. **Set up infrastructure** (repository, CI/CD, etc.)
6. **Begin Phase 1** - create module structure

---

## References & Resources

### Drupal Documentation
- [Single Directory Components (SDC)](https://www.drupal.org/docs/develop/theming-drupal/using-single-directory-components)
- [Drupal Recipes](https://www.drupal.org/docs/extending-drupal/drupal-recipes)
- [Canvas Documentation](https://project.pages.drupalcode.org/canvas/)

### Tools & Libraries
- [Tailwind CSS](https://tailwindcss.com/)
- [Alpine.js](https://alpinejs.dev/)
- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/)

### Examples
- [Smithsonian Castle Components](https://github.com/Smithsonian/drupal-castle-components) - Real-world SDC library with Tailwind + Alpine
- [Tailpine Theme](https://www.drupal.org/project/tailpine) - SDC + Tailwind + Alpine example

---

**Document Version**: 1.0
**Last Updated**: 2025-01-06
**Author**: Development Team
**Status**: Draft - Pending Approval
