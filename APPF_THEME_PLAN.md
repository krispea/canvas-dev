# APPF Theme - Strategic Plan

## 🎯 Project Overview

**Goal:** Create a modern, reusable Drupal 11 theme with Tailwind CSS and Vite for production-ready projects.

---

## 📛 Theme Name

**Selected:** **`appf`** (APP Frontend)
- Clean, simple naming
- Example: `cheppers/appf`
- Machine name: `appf`

---

## 🏗️ Architecture Plan

### Tech Stack
```
✅ Drupal 11
✅ Tailwind CSS 4.x (latest)
✅ Vite 6.x (modern, fast builds)
✅ Single Directory Components (SDC)
✅ PostCSS
✅ TypeScript (for component logic if needed)
✅ Alpine.js (lightweight JS for interactivity)
```

### Why Vite over Webpack?
1. **Much faster** (10-100x faster HMR)
2. **Simpler configuration**
3. **Better dev experience**
4. **Smaller production bundles**
5. **Modern and growing ecosystem**

---

## 📁 Project Structure

```
appf/
├── .git/
├── .github/
│   └── workflows/
│       └── ci.yml                    # Automated testing
├── components/
│   ├── _defaults.css                 # Tailwind base
│   ├── atoms/
│   │   ├── button/
│   │   │   ├── button.component.yml
│   │   │   ├── button.twig
│   │   │   └── button.css
│   │   ├── unordered-list/
│   │   ├── ordered-list/
│   │   ├── table/
│   │   ├── avatar/
│   │   ├── badge/
│   │   ├── icon/
│   │   └── ...
│   ├── molecules/
│   │   ├── card/
│   │   ├── button-group/
│   │   ├── navbar/
│   │   └── ...
│   └── organisms/
│       ├── header/
│       ├── footer/
│       └── ...
├── config/
│   └── schema/
│       └── appf.schema.yml           # Theme settings
├── dist/
│   ├── css/
│   │   └── style.css                 # Compiled CSS
│   └── js/
│       └── main.js                   # Compiled JS
├── src/
│   ├── css/
│   │   └── main.css                  # Tailwind entry
│   └── js/
│       └── main.js                   # JS entry
├── templates/
│   ├── block/
│   ├── field/
│   ├── layout/
│   ├── node/
│   ├── page/
│   └── views/
├── .gitignore
├── .npmrc
├── appf.info.yml                     # Theme info
├── appf.libraries.yml                # Asset libraries
├── appf.theme                        # Theme hooks
├── composer.json                     # Composer metadata
├── logo.svg
├── package.json
├── postcss.config.js
├── README.md
├── screenshot.png
├── tailwind.config.js
├── vite.config.js                    # Vite configuration
└── yarn.lock / package-lock.json
```

---

## 🔧 Installation Methods

### Method 1: Composer (Recommended for Production)

**Packagist Package:**
```bash
composer require cheppers/appf
```

**Setup after install:**
```bash
cd web/themes/contrib/appf
npm install
npm run build
drush theme:enable appf
```

### Method 2: Recipe (Canvas-Friendly)

**Create `recipes/appf-recipe/recipe.yml`:**
```yaml
name: 'APPF Theme'
description: 'Install and configure APPF theme with Tailwind CSS'
type: 'Theme'
recipes:
  - core/recipes/standard_performance

install:
  # Required modules for Canvas + theme
  - components
  - canvas
  - canvas_dev_mode

config:
  actions:
    system.theme:
      simple_config_update:
        default: appf
        admin: claro
```

**Usage:**
```bash
composer require cheppers/appf
php core/scripts/drupal recipe recipes/appf-recipe
```

### Method 3: Git Submodule (Development)

```bash
cd web/themes/custom
git submodule add git@github.com:cheppers/appf.git
cd appf
npm install
npm run dev  # Development mode with HMR
```

---

## 📦 Repository Setup

### GitHub Repository
- **Name:** `cheppers/appf`
- **URL:** `https://github.com/cheppers/appf`
- **Visibility:** Private (initially) → Public when ready

### Composer Integration

**composer.json:**
```json
{
  "name": "cheppers/appf",
  "type": "drupal-theme",
  "description": "A modern Drupal 11 theme with Tailwind CSS and Canvas integration",
  "keywords": ["drupal", "theme", "tailwind", "canvas", "vite"],
  "license": "GPL-2.0-or-later",
  "require": {
    "drupal/core": "^11",
    "drupal/components": "^3.0"
  },
  "require-dev": {
    "drupal/canvas": "^1.0@RC"
  }
}
```

**Register on Packagist.org:**
1. Connect GitHub repo
2. Enable auto-updates
3. Tag releases (v1.0.0, v1.1.0, etc.)

---

## 🎨 Component Library Strategy

### Phase 1: Core Components (Week 1-2)
**Atoms:**
- Button, Button Group
- Badge
- Icon
- Avatar
- Divider
- Image
- Video
- Link
- Heading
- Paragraph

**Lists:**
- Unordered List ✅ (migrate from current)
- Ordered List ✅ (migrate from current)

**Tables:**
- Table ✅ (migrate from current)

### Phase 2: Molecules (Week 3-4)
- Card
- Alert
- Breadcrumb
- Pagination
- Tabs
- Accordion
- Modal
- Dropdown

### Phase 3: Organisms (Week 5-6)
- Header
- Footer
- Navigation
- Hero Section
- Form

### Phase 4: Templates (Week 7-8)
- Page layouts
- Node templates
- Block templates
- View templates

---

## ⚙️ Vite Configuration

**vite.config.js:**
```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/js/main.js'),
        style: resolve(__dirname, 'src/css/main.css'),
      },
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'css/[name][extname]';
          }
          return 'assets/[name][extname]';
        },
      },
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
});
```

**package.json scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "components:watch": "vite build --watch",
    "lint:css": "stylelint 'src/**/*.css'",
    "lint:js": "eslint 'src/**/*.js'"
  }
}
```

---

## 🎨 Tailwind Configuration

**tailwind.config.js:**
```javascript
module.exports = {
  content: [
    './components/**/*.{twig,html,js}',
    './templates/**/*.{twig,html}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // APPF brand colors
        primary: '#...',
        secondary: '#...',
        accent: '#...',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
```

---

## 🧪 Testing Strategy

### Automated Tests
- **Component validation:** All SDC components have valid schemas
- **Build tests:** Vite builds successfully
- **Linting:** CSS and JS pass linting
- **Canvas compatibility:** Components work in Canvas

### CI/CD Pipeline (.github/workflows/ci.yml)
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run lint:css
      - run: npm run lint:js
      - run: npm run build
```

---

## 📚 Documentation Plan

### README.md Sections
1. **Overview** - What is APPF theme
2. **Installation** - Composer, Recipe, Git methods
3. **Quick Start** - Basic setup guide
4. **Development** - How to contribute
5. **Component Library** - List of all components
6. **Customization** - Tailwind config, colors, fonts
7. **Canvas Integration** - How to use with Canvas
8. **Changelog** - Version history

### Storybook (Optional Future)
- Visual component documentation
- Interactive playground
- Props explorer

---

## 🚀 Launch Checklist

### Pre-Launch
- [ ] Create GitHub repository
- [ ] Set up basic theme structure
- [ ] Configure Vite
- [ ] Configure Tailwind
- [ ] Migrate 3 existing components
- [ ] Create 5 new core components
- [ ] Write comprehensive README
- [ ] Add screenshots
- [ ] Set up CI/CD

### Launch
- [ ] Tag v1.0.0 release
- [ ] Publish to Packagist
- [ ] Create installation recipe
- [ ] Write blog post announcement
- [ ] Share with Cheppers team

### Post-Launch
- [ ] Monitor issues
- [ ] Add more components
- [ ] Improve documentation
- [ ] Gather user feedback
- [ ] Plan v1.1.0

---

## 📅 Timeline Estimate

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Setup** | 2 days | Repo, Vite, Tailwind config |
| **Core Components** | 1 week | 10-15 basic components |
| **Testing & Docs** | 3 days | CI/CD, README, examples |
| **Recipe Creation** | 1 day | Installation recipe |
| **Polish & Launch** | 2 days | Screenshots, announcement |
| **Total** | **2-3 weeks** | |

---

## 💰 Maintenance Plan

### Versioning Strategy
- **Semantic Versioning:** v1.0.0, v1.1.0, v2.0.0
- **LTS Support:** Support last 2 major versions
- **Update Frequency:** Monthly minor releases

### Support Channels
- **GitHub Issues:** Bug reports, feature requests
- **GitHub Discussions:** Q&A, community
- **Internal Slack:** Cheppers team support

---

## 🎯 Success Metrics

### Short-term (3 months)
- ✅ 30+ SDC components
- ✅ Used in 3+ Cheppers projects
- ✅ 90%+ Canvas compatibility

### Long-term (1 year)
- ✅ 100+ SDC components
- ✅ 10+ Cheppers projects
- ✅ Open source with community contributors
- ✅ Drupal.org featured theme

---

## 🔄 Migration Path (Current Project → New APPF)

### For This Project
1. Keep current `appf-bs` theme (Bootstrap/Webpack version)
2. Create new `appf` theme alongside (Tailwind/Vite version)
3. Gradually migrate pages to use new `appf`
4. Eventually deprecate `appf-bs`

### For New Projects
1. `composer create-project drupal/recommended-project my-project`
2. `composer require cheppers/appf`
3. `drush recipe recipes/appf-recipe`
4. Start building!

---

## ❓ Open Questions

1. **Branding Colors?**
   - What are the official brand colors for APPF theme?

2. **License?**
   - GPL-2.0 (Drupal standard)
   - MIT (more permissive)
   - Proprietary (Cheppers only)

3. **Repository Visibility?**
   - Private initially, public later?
   - Private permanently?
   - Public from start?

4. **Component Naming Convention?**
   - `appf:button`
   - Just component name?
   - Other prefix?

---

## 🎬 Next Steps

### Immediate (This Week)
1. **Create GitHub repository for `appf`**
2. **Set up basic theme structure**
3. **Configure Vite + Tailwind**
4. **Initialize with basic appf.info.yml**

### Week 2
1. **Migrate components from appf-bs (if needed)**
2. **Create core atomic components**
3. **Write basic documentation**

### Week 3
1. **Create installation recipe**
2. **Set up CI/CD pipeline**
3. **Test integration with Canvas**

### Week 4
1. **Polish and screenshots**
2. **Tag v1.0.0**
3. **Deploy to production**

---

## 🤔 Recommendation

**Start small, grow organically:**

1. Create the repo with minimal structure
2. Build 5-10 essential atomic components (button, badge, icon, etc.)
3. Create key molecular components (card, navbar)
4. Release v1.0.0 when stable
5. Use in production projects
6. Iterate based on feedback
7. Expand component library over time

This approach minimizes risk and ensures the theme solves real problems!

---

**Ready to proceed?** Next steps:
1. Create the initial repository structure
2. Set up Vite and Tailwind configuration
3. Create first set of components
4. Integrate with Canvas module
