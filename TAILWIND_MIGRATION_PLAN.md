# Tailwind Migration Plan

## Current Status
- ✅ 3 components using Bootstrap (unordered-list, ordered-list, table)
- ✅ Webpack build system in place
- ✅ PostCSS configured
- ❌ Tailwind not installed yet

## Migration Steps

### Step 1: Install Tailwind CSS
```bash
cd web/themes/custom/appf
yarn add -D tailwindcss @tailwindcss/forms
```

### Step 2: Create Tailwind Config
```bash
npx tailwindcss init
```

### Step 3: Configure tailwind.config.js
```javascript
module.exports = {
  content: [
    './components/**/*.{twig,html,js}',
    './templates/**/*.{twig,html}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

### Step 4: Create Tailwind Base File
Create `components/_tailwind.scss`:
```scss
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 5: Update Webpack Config
Add Tailwind to PostCSS plugins in `webpack.config.components.js`:
```javascript
postcssOptions: {
  plugins: [
    require('tailwindcss'),  // ADD THIS
    autoprefixer(),
    // ... rest
  ],
},
```

### Step 6: Migrate Components
1. Unordered List
2. Ordered List
3. Table

### Step 7: Remove Bootstrap Dependencies
After migration is complete and tested:
```bash
yarn remove bootstrap bootstrap-borders-utilities bootstrap-ratio-utilities
```

## Component Migration Checklist

### Unordered List
- [ ] Update .component.yml (no changes needed)
- [ ] Rewrite .scss with Tailwind
- [ ] Update .twig with Tailwind classes
- [ ] Test all variants (styles, colors, spacing)

### Ordered List
- [ ] Update .component.yml (no changes needed)
- [ ] Rewrite .scss with Tailwind
- [ ] Update .twig with Tailwind classes
- [ ] Test all variants (types, colors, spacing)

### Table
- [ ] Update .component.yml (no changes needed)
- [ ] Rewrite .scss with Tailwind
- [ ] Update .twig with Tailwind classes
- [ ] Test all variants (styles, colors, responsive)

## Testing Matrix

For each component test:
- ✓ All style variants
- ✓ All color options
- ✓ All size options
- ✓ Spacing variants
- ✓ Responsive behavior
- ✓ Canvas editor preview
- ✓ Published page render

## Rollback Plan
If issues arise:
1. Git revert to pre-migration commit
2. Rebuild with Bootstrap
3. Clear Drupal caches

## Estimated Time
- Setup: 30 minutes
- Unordered List: 1 hour
- Ordered List: 1 hour
- Table: 2 hours
- Testing: 1 hour
- **Total: 5.5 hours**
