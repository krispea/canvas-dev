# Drupal Canvas Architecture Reference

> **Purpose**: This document explains how Drupal Canvas works internally, specifically how it integrates with Drupal blocks, SDC components, and code components. Read this if you need to understand Canvas component sources, block integration, or data fetching.

## Table of Contents

1. [Component Sources Overview](#component-sources-overview)
2. [Block Component Integration](#block-component-integration)
3. [Code Components & Data Fetching](#code-components--data-fetching)
4. [SDC Components](#sdc-components)
5. [How to Include Components in Each Other](#how-to-include-components-in-each-other)
6. [Canvas CLI Tool](#canvas-cli-tool)
7. [Passing SDC Props Through Drupal Blocks](#passing-sdc-props-through-drupal-blocks)
8. [Canvas Component Tree Structure](#canvas-component-tree-structure)
9. [Common Patterns & Solutions](#common-patterns--solutions)
10. [Key Takeaways](#key-takeaways)
11. [Testing TODO](#testing-todo)
12. [Quick Reference](#quick-reference)

---

## Component Sources Overview

Canvas has a **ComponentSource** plugin system that makes different types of components available in the Canvas UI library panel.

### Three Main Component Sources:

| Source Type | Plugin ID | What It Wraps | Example |
|------------|-----------|---------------|---------|
| **SingleDirectoryComponent** | `sdc` | Drupal SDC components | `appf:logo`, `appf:header-basic` |
| **JsComponent** | `js` | React/Preact code components | Custom React components created in Canvas UI |
| **BlockComponent** | `block` | Drupal block plugins | `block.system_branding_block`, `block.system_menu_block.main` |

**Key Files:**
- `/web/modules/contrib/canvas/src/Plugin/Canvas/ComponentSource/SingleDirectoryComponent.php`
- `/web/modules/contrib/canvas/src/Plugin/Canvas/ComponentSource/JsComponent.php`
- `/web/modules/contrib/canvas/src/Plugin/Canvas/ComponentSource/BlockComponent.php`

---

## Block Component Integration

### How Drupal Blocks Become Canvas Components

#### 1. Automatic Discovery Process

When Drupal rebuilds caches or modules are installed:

```php
// Hook: hook_rebuild() and hook_modules_installed()
// File: /web/modules/contrib/canvas/src/Hook/ComponentSourceHooks.php

public function rebuild(): void {
  // Triggers block discovery
  \Drupal::service(BlockManagerInterface::class)->getDefinitions();
  // Also triggers SDC discovery
  \Drupal::service(ComponentPluginManager::class)->getDefinitions();
}
```

#### 2. Block Manager Creates Canvas Components

The Canvas `BlockManager` (decorator of core `BlockManager`):

**File**: `/web/modules/contrib/canvas/src/Plugin/BlockManager.php`

```php
// For EACH block plugin definition:
foreach ($definitions as $id => $definition) {
  // Create Canvas component ID: block.{plugin_id}
  $component_id = BlockComponent::componentIdFromBlockPluginId($id);
  // Example: 'system_menu_block:main' → 'block.system_menu_block.main'

  // Create Canvas Component config entity
  $component = Component::create([
    'id' => $component_id,
    'provider' => $definition['provider'],
    'source' => BlockComponent::SOURCE_PLUGIN_ID,
    'status' => $status, // enabled or disabled
    'settings' => [...],
  ]);

  $component->save();
}
```

#### 3. Default Enabled Blocks

**File**: `/web/modules/contrib/canvas/src/Plugin/BlockManager.php:36-43`

```php
const array BLOCKS_TO_KEEP_ENABLED = [
  'system_powered_by_block',
  'system_branding_block',
  'system_breadcrumb_block',
  'system_messages_block',
  'system_menu_block:main',      // Main navigation menu
  'system_menu_block:footer',     // Footer menu
];
```

**All other core blocks are disabled by default** to avoid cluttering Canvas UI.

#### 4. Block Rendering in Canvas

**File**: `/web/modules/contrib/canvas/src/Plugin/Canvas/ComponentSource/BlockComponent.php:187-266`

When a block component is placed on a Canvas page:

```php
public function renderComponent(array $inputs, ...): array {
  // 1. Get the block plugin instance
  $block = $this->getBlockPlugin();

  // 2. Apply settings from Canvas UI
  foreach ($inputs[self::EXPLICIT_INPUT_NAME] ?? [] as $key => $value) {
    $block->setConfigurationValue($key, $value);
  }

  // 3. Check access
  $build = ['#access' => $block->access($this->currentUser, TRUE)];

  // 4. Build the block
  $build['content'] = $block->build();

  // 5. Wrap in standard block render array
  $build += [
    '#theme' => 'block',
    '#configuration' => $block->getConfiguration(),
    '#plugin_id' => $block->getPluginId(),
    '#id' => $componentUuid,
  ];

  return $build;
}
```

#### 5. Block Configuration UI

Blocks with settings (like menu block's "Select menu") automatically get a configuration form in Canvas:

```php
// Extracts block's config schema
$config_schema_type_definition = $this->typedConfigManager
  ->getDefinition('block.settings.' . $plugin_id);

// Builds form using block's buildConfigurationForm()
$form = $this->getPluginForm($blockPlugin)
  ->buildConfigurationForm($form, $subform_state);
```

This is why when you add a Menu block in Canvas, you see a dropdown to select which menu!

### Summary: Block Integration Flow

```
1. Module installed/cache rebuild
   ↓
2. Canvas BlockManager scans all block plugin definitions
   ↓
3. Creates Component config entity for each block
   - ID: block.{plugin_id}
   - Stores default configuration
   - Sets enabled/disabled status
   ↓
4. Block appears in Canvas Library panel
   ↓
5. User drags block into page/slot
   ↓
6. Canvas renders block using BlockComponent::renderComponent()
   - Creates block plugin instance
   - Applies settings
   - Calls $block->build()
   - Returns render array
```

---

## Code Components & Data Fetching

### What Are Code Components?

Canvas code components are **React/Preact components** written directly in the browser using the Canvas code editor.

**Key Features:**
- Written in JavaScript/JSX with React syntax
- Supports Tailwind CSS
- Can fetch Drupal data (menus, nodes, taxonomy, etc.)
- Compiled in-browser with SWC compiler
- Auto-saved and available immediately

### Creating Code Components

**In Canvas UI:**
1. Go to Canvas Library panel
2. Click **+ Add new** → Code component
3. Write React/Preact component
4. Click "Add to components"

**Basic Structure:**

```javascript
// Simple component with props
const MyComponent = ({ text = 'Hello' }) => {
  return <div className="text-3xl">{text}</div>;
};

export default MyComponent;
```

**Important**: Component must have a `default export`.

### Data Fetching in Code Components

Canvas provides utilities for fetching Drupal data.

#### Option 1: Core Linkset Endpoint (Built into Drupal 10+)

**Best for menus** - No additional modules required.

```javascript
import useSWR from 'swr';
import { sortMenu } from '@/lib/drupal-utils';

const MainNav = () => {
  const { data, error, isLoading } = useSWR(
    '/system/menu/main/linkset',
    async (url) => {
      const response = await fetch(url);
      return response.json();
    }
  );

  if (error) return <div>Failed to load menu</div>;
  if (isLoading) return <div>Loading...</div>;

  const menu = sortMenu(data); // Transforms to tree with _children

  return (
    <nav>
      {menu.map(item => (
        <a key={item.href} href={item.href}>{item.title}</a>
      ))}
    </nav>
  );
};

export default MainNav;
```

**What `sortMenu()` does:**
- Transforms flat menu data into hierarchical tree structure
- Adds `_children` property for nested items
- Adds `_hasSubmenu` boolean flag

#### Option 2: JSON:API Client

**Best for content (nodes, taxonomy, etc.)** - Requires `jsonapi` module (core).

```javascript
import useSWR from 'swr';
import { JsonApiClient } from '@drupal-api-client/json-api-client';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';

const client = new JsonApiClient();

const ArticleList = () => {
  const { data, error, isLoading } = useSWR(
    ['node--article', {
      queryString: new DrupalJsonApiParams()
        .addInclude(['field_tags'])
        .addPageLimit(10)
        .getQueryString()
    }],
    ([type, options]) => client.getCollection(type, options)
  );

  if (error) return 'An error has occurred.';
  if (isLoading) return 'Loading...';

  return (
    <ul>
      {data.map((article) => (
        <li key={article.id}>{article.title}</li>
      ))}
    </ul>
  );
};

export default ArticleList;
```

#### Option 3: Page & Site Context Data

Access current page and site information:

```javascript
import { getPageData, getSiteData } from '@/lib/drupal-utils';

const BrandedHeader = () => {
  const { pageTitle, breadcrumbs } = getPageData();
  const { siteName, slogan } = getSiteData().branding;

  return (
    <header>
      <h1>{siteName}</h1>
      <p>{slogan}</p>
      <h2>{pageTitle}</h2>
    </header>
  );
};

export default BrandedHeader;
```

### Available Utility Functions

#### From `@/lib/drupal-utils`:
- `getPageData()` - Current page title, breadcrumbs
- `getSiteData()` - Site name, logo, slogan, base URL
- `sortMenu(data)` - Transform menu data to tree structure

#### From `@/lib/jsonapi-utils`:
- `getNodePath(node)` - Get node's path alias or fallback
- `sortMenu(data)` - Same as drupal-utils version

### Data Fetching Best Practices

1. **Use SWR for all async data** - Automatic caching, revalidation, error handling
2. **Check loading and error states** - Always handle `isLoading` and `error`
3. **Data appears in Canvas UI** - Results show in "Data Fetch" pane for debugging
4. **Use linkset endpoint for menus** - Faster, no extra modules needed
5. **Use JSON:API for content** - When you need nodes, taxonomy, media, etc.

---

## SDC Components

### What Are SDC Components?

**Single Directory Components** - Drupal's standard component system.

**Structure:**
```
components/
  atoms/
    logo/
      logo.component.yml    # Metadata, props, slots
      logo.twig            # Template
      logo.css             # Optional styles
```

### Key Characteristics:

- ✅ **Portable** - Work across any Drupal site
- ✅ **Data-agnostic** - Cannot directly access Drupal APIs
- ✅ **Theme-independent** - Can be in modules or themes
- ✅ **Canvas-compatible** - Automatically discovered

### SDC Components in Canvas

Canvas automatically discovers all SDC components:

**File**: `/web/modules/contrib/canvas/src/Hook/ComponentSourceHooks.php:73`

```php
// Triggers SDC discovery
\Drupal::service(ComponentPluginManager::class)->getDefinitions();
```

Each SDC component becomes a Canvas component with ID: `{namespace}:{component_id}`

Examples:
- `appf:logo` → `web/themes/custom/appf/components/atoms/logo/`
- `appf:header-basic` → `web/themes/custom/appf/components/layout/header/header-basic/`

### Props vs Slots in SDC

**Props** = Configuration (strings, booleans, enums, numbers)
**Slots** = Content injection (HTML, other components)

```yaml
# component.yml
props:
  type: object
  properties:
    logoSize:
      type: string
      enum: [small, medium, large]

slots:
  navigation:
    title: Navigation
    description: Main menu goes here
```

**In Twig:**

```twig
{# Access props #}
<div class="{{ sizeClasses[logoSize] }}">

  {# Render slots #}
  {% block navigation %}{{ navigation }}{% endblock %}
</div>
```

---

## How to Include Components in Each Other

### SDC Component Including Another SDC Component

Use `{% include %}` with namespace syntax:

```twig
{# In header-basic.twig #}
{% include 'appf:logo' with {
  colorMode: 'white',
  size: 'large'
} only %}
```

### SDC Component Including Code Component

**Question**: Can you `{% include %}` a Canvas code component from an SDC template?

**Answer**: **Theoretically YES, but needs testing**

#### Investigation Summary (2025-01-06)

Canvas code components are **internally converted to SDC plugin instances**, which means they should be includable in Twig templates.

**How it works**:

**File**: `/web/modules/contrib/canvas/src/Entity/JavaScriptComponent.php:271-310`

```php
public function toSdcDefinition(): array {
  $definition = [
    'machineName' => (string) $this->id(),
    'extension_type' => 'module',
    'id' => 'canvas:' . $this->id(),  // ← Gets SDC-style ID!
    'provider' => 'canvas',
    'name' => (string) $this->label(),
    'props' => ['type' => 'object', 'properties' => $this->props ?? []],
    'slots' => $this->slots,
    'template' => 'phony',
  ];
  return $definition;
}
```

**Key insight**: Code components get SDC-compatible IDs like `canvas:main_nav`.

**File**: `/web/modules/contrib/canvas/src/Plugin/Canvas/ComponentSource/JsComponent.php:399-409`

```php
private static function buildEphemeralSdcPluginInstance(JavaScriptComponent $component): ComponentPlugin {
  $definition = $component->toSdcDefinition();
  return new ComponentPlugin(
    ['app_root' => '', 'enforce_schemas' => TRUE],
    $definition['id'],
    $definition,
  );
}
```

**This creates an actual SDC `ComponentPlugin` instance** from the code component!

#### Hypothesis: Should Work

**Why it SHOULD work:**
- ✅ Code components get SDC-compatible IDs (`canvas:component_name`)
- ✅ They're converted to `ComponentPlugin` instances (same as SDC)
- ✅ Canvas registers them in the component plugin manager
- ✅ Twig's `{% include %}` uses the component plugin manager to resolve `namespace:component`

**Example usage (hypothetical)**:

```twig
{# header-basic.twig - SDC component #}
<header>
  <div class="logo">
    {% include 'appf:logo' with { colorMode: 'white', size: 'large' } only %}
  </div>

  <nav>
    {# Include code component! #}
    {% include 'canvas:main_nav' with {
      alignment: 'right',
      colorScheme: 'dark'
    } only %}
  </nav>
</header>
```

**Potential issues**:
- ❓ Code components have no Twig template (they're React)
- ❓ Unclear if Twig include can handle React rendering
- ❓ May require special hydration setup

**Status**: **Needs practical testing** to confirm whether Twig can render React components via include.

**Alternative approach**: Use code components in slots (guaranteed to work):

```yaml
# header-basic.component.yml
slots:
  navigation:
    title: Navigation
```

Then in Canvas UI, drag `canvas:main_nav` code component into the navigation slot.

### Code Component Importing Another Code Component

Use `@/components` prefix:

```javascript
import Heading from '@/components/my_heading';
import Logo from '@/components/logo';

const Header = () => {
  return (
    <header>
      <Logo size="large" />
      <Heading text="Welcome" />
    </header>
  );
};

export default Header;
```

---

## Canvas CLI Tool

### Overview

Canvas provides a command-line tool for managing code components outside the browser-based editor.

**Location**: `/web/modules/contrib/canvas/cli/`
**NPM Package**: `@drupal-canvas/cli`
**Documentation**: https://www.npmjs.com/package/@drupal-canvas/cli

### Installation

```bash
npm install @drupal-canvas/cli
```

### Setup

1. Install `canvas_oauth` module (submodule of Canvas)
2. Configure OAuth client with ID and secret
3. Configure CLI using command-line args, environment variables, `.env` file, or global `.canvasrc`

**Configuration options**:

| CLI argument      | Environment variable   | Description                                |
| ----------------- | ---------------------- | ------------------------------------------ |
| `--site-url`      | `CANVAS_SITE_URL`      | Base URL of your Drupal site               |
| `--client-id`     | `CANVAS_CLIENT_ID`     | OAuth client ID                            |
| `--client-secret` | `CANVAS_CLIENT_SECRET` | OAuth client secret                        |
| `--dir`           | `CANVAS_COMPONENT_DIR` | Directory where components are stored      |
| `--verbose`       | `CANVAS_VERBOSE`       | Verbose output (default: false)            |
| `--scope`         | `CANVAS_SCOPE`         | OAuth scopes (default: canvas:js_component canvas:asset_library) |

### Commands

#### `scaffold` - Create new component

```bash
npx canvas scaffold --name main-nav
```

**Creates**:
```
main-nav/
├── component.yml  # Props, slots, metadata
├── index.jsx      # React component code
└── index.css      # Styles
```

**Template file**: `/web/modules/contrib/canvas/cli/assets/templates/hello-world/`

#### `build` - Compile locally

```bash
npx canvas build --all
npx canvas build --no-tailwind  # Skip Tailwind CSS build
```

Compiles JSX/React and Tailwind CSS. Creates `dist/` directory with compiled output.

#### `upload` - Push to Drupal

```bash
npx canvas upload --all
npx canvas upload --no-tailwind  # Skip global CSS upload
```

Builds and uploads components to Drupal site. Creates/updates `canvas.js_component.*` config entities.

#### `download` - Pull from Drupal

```bash
npx canvas download --all
npx canvas download --component main_nav
```

Downloads code components from Drupal to local filesystem.

### Important Notes

**Code components are stored as config entities, NOT as SDC files**:

- ✅ Stored in database: `canvas.js_component.*` config entities
- ✅ CLI manages: Files in `CANVAS_COMPONENT_DIR` location
- ❌ NOT exported to: `/web/themes/custom/appf/components/`

**Code components are NOT converted to SDC files on disk**. They remain as React/JS code components managed by Canvas.

---

## Passing SDC Props Through Drupal Blocks

### The Question

Can you include SDC components inside Drupal block templates and have Canvas pass props through?

**Example scenario**:
```twig
{# block--system-branding-block.html.twig #}
{% block content %}
  {% include 'appf:site-branding' with {
    logoUrl: site_logo,
    siteName: site_name
  } only %}
{% endblock %}
```

### The Answer: NO

This is **architecturally impossible** by design.

### Why It Doesn't Work

**The rendering boundary**:

```
Canvas Component Layer (manages props, component tree)
    ↓
BlockComponent::renderComponent()
    ↓ calls $block->build()
Drupal Block Plugin (returns render array)
    ↓
Drupal Theme System (processes block--*.html.twig)
    ↓
Twig Template
    ↓ {{ include('appf:component') }} happens HERE
SDC Include (Canvas can't see this!)
```

**The problem**: When you do `{{ include('appf:component') }}` inside a block template, it happens **after Canvas has finished** managing the component. Canvas tracks components in its component tree at the **page level**, not inside arbitrary Twig templates.

### What Would Be Needed (But Doesn't Exist)

To make this work, you'd need:

1. A preprocessor that scans block templates for SDC includes
2. A prop mapping system to map block variables → SDC props
3. Canvas tracking of nested components inside blocks
4. A new ComponentSource that wraps blocks WITH SDC composition

**None of this exists**, and there's no contrib module providing it.

### Available Related Modules

#### SDC Block Module

**URL**: https://www.drupal.org/project/sdc_block
**Status**: Drupal 10.3+ (requires patch for D11)

**What it does**: Converts SDC components **into** blocks (opposite direction!)

- Auto-generates blocks from SDC components
- Creates configuration forms for SDC props
- Supports slots in generated blocks

**Does NOT help**: Embedding SDC inside existing Drupal blocks.

**BUT**: This is actually the **recommended approach**! Turn your SDC into blocks that work everywhere.

### Recommended Solutions

Instead of trying to pass SDC props through blocks, use these approaches:

#### Solution 1: Use Code Components (Canvas's Approach)

Create a code component that fetches Drupal data and replaces the block entirely.

See: [Pattern 3: Menu as Code Component](#pattern-3-menu-as-code-component)

#### Solution 2: Use SDC Block Module

Turn your SDC components into blocks.

```yaml
# components/atoms/custom-branding/custom-branding.component.yml
name: Custom Branding
props:
  logoUrl:
    type: string
  siteName:
    type: string
tags:
  - block  # Makes sdc_block generate a block!
```

Result: `custom_branding_block` appears in Canvas, Layout Builder, etc.

#### Solution 3: Custom Block Template (Manual Mapping)

Override block template and manually map variables to SDC props.

```twig
{# block--system-branding-block.html.twig #}
{% block content %}
  {% if content.site_logo or content.site_name %}
    {% include 'appf:custom-branding' with {
      logoUrl: content.site_logo ? content.site_logo['#uri'] : null,
      siteName: content.site_name ? content.site_name['#markup'] : null
    } only %}
  {% else %}
    {{ content }}
  {% endif %}
{% endblock %}
```

**Disadvantages**:
- Props are NOT configurable in Canvas UI
- Canvas doesn't track the included SDC
- Fragile - depends on block render array structure

#### Solution 4: Just Use Slots (Recommended)

Don't try to merge blocks and SDC - use Canvas's slot system!

```yaml
# header-basic.component.yml
slots:
  branding:
    title: Branding Area
  navigation:
    title: Navigation Menu
```

In Canvas UI, users drag components into slots. Clean, tracked, configurable.

---

## Canvas Component Tree Structure

When you build a page in Canvas, it creates a **component tree**:

```
Page (canvas_page entity)
└── components (field_components)
    └── Region: header
        └── Component: appf:header-basic (layout with slots)
            └── Slot: navigation
                └── Component: block.system_menu_block.main
    └── Region: content
        └── Component: appf:hero
    └── Region: footer
        └── Component: appf:footer
```

This tree is stored as JSON in the `canvas_page` entity and rendered by Canvas's display variant.

---

## Common Patterns & Solutions

### Pattern 1: Header with Auto-Included Logo

**Problem**: Want logo to always show in header (not via slot).

**Solution**: Include logo directly in header template:

```twig
{# header-basic.twig #}
<header>
  <div class="branding">
    {% include 'appf:logo' with {
      colorMode: logoColorMode,
      size: logoSize
    } only %}
  </div>

  <div class="navigation">
    {% block navigation %}{{ navigation }}{% endblock %}
  </div>
</header>
```

### Pattern 2: Header with Menu Block

**Problem**: Menu block HTML doesn't match header design.

**Solution**: Create custom block template:

```twig
{# templates/block/block--system-menu-block--main.html.twig #}
<nav class="flex gap-4">
  {{ content }}
</nav>
```

Or override menu template:

```twig
{# templates/menu/menu--main.html.twig #}
<ul class="flex gap-4">
  {% for item in items %}
    <li>
      <a href="{{ item.url }}" class="hover:text-primary">
        {{ item.title }}
      </a>
    </li>
  {% endfor %}
</ul>
```

### Pattern 3: Menu as Code Component

**Problem**: Need custom menu logic/styling with data fetching.

**Solution**: Create code component:

```javascript
import useSWR from 'swr';
import { sortMenu } from '@/lib/drupal-utils';

const MainNav = ({ alignment = 'left' }) => {
  const { data, error, isLoading } = useSWR(
    '/system/menu/main/linkset',
    async (url) => {
      const response = await fetch(url);
      return response.json();
    }
  );

  if (error) return null;
  if (isLoading) return <div>Loading...</div>;

  const menu = sortMenu(data);

  return (
    <nav className={`flex gap-4 justify-${alignment}`}>
      {menu.map(item => (
        <a
          key={item.href}
          href={item.href}
          className="hover:text-primary transition"
        >
          {item.title}
        </a>
      ))}
    </nav>
  );
};

export default MainNav;
```

Then add this code component to the header's navigation slot in Canvas.

---

## Key Takeaways

1. **Canvas auto-discovers** all blocks and SDC components
2. **Blocks become Canvas components** with ID `block.{plugin_id}`
3. **Main menu block is enabled by default** as `block.system_menu_block.main`
4. **Code components can fetch Drupal data** using SWR + linkset endpoint or JSON:API
5. **SDC components are data-agnostic** - they receive data via props/slots
6. **Use slots for flexibility** - Let users choose what goes in a region
7. **Include components directly** when you always want them (like logo in header)

---

## Testing TODO

### Code Component Inclusion Test

**Objective**: Test if SDC Twig templates can include Canvas code components using `{% include 'canvas:component_name' %}`.

**Test Plan**:

1. **Create simple test code component** in Canvas UI:
   - Name: `test_text`
   - Code: Simple React component that outputs text with a prop
   - Save to Canvas

2. **Try to include in SDC template**:
   ```twig
   {# header-basic.twig #}
   {% include 'canvas:test_text' with {
     message: 'Testing code component inclusion!'
   } only %}
   ```

3. **Expected outcomes**:
   - **Success**: Text appears, props work → Create menu code component!
   - **Failure**: Error message or nothing renders → Use slot approach instead

**Status**: **Pending test** (scheduled for next session)

**Fallback**: If direct inclusion doesn't work, use navigation slot + code component (guaranteed to work).

---

## Quick Reference

### File Paths

| What | Path |
|------|------|
| Block integration | `/web/modules/contrib/canvas/src/Plugin/Canvas/ComponentSource/BlockComponent.php` |
| Block manager | `/web/modules/contrib/canvas/src/Plugin/BlockManager.php` |
| Component discovery hooks | `/web/modules/contrib/canvas/src/Hook/ComponentSourceHooks.php` |
| SDC integration | `/web/modules/contrib/canvas/src/Plugin/Canvas/ComponentSource/SingleDirectoryComponent.php` |
| Code component integration | `/web/modules/contrib/canvas/src/Plugin/Canvas/ComponentSource/JsComponent.php` |

### Canvas Documentation

- Code components: https://project.pages.drupalcode.org/canvas/code-components/
- Data fetching: https://project.pages.drupalcode.org/canvas/code-components/data-fetching/
- Canvas CLI: https://www.npmjs.com/package/@drupal-canvas/cli
- SDC components: https://project.pages.drupalcode.org/canvas/sdc-components/

### Related Modules

- SDC Block: https://www.drupal.org/project/sdc_block
- UI Patterns: https://www.drupal.org/project/ui_patterns
- SDC Display: https://www.drupal.org/project/sdc_display

---

## Document History

**Last Updated**: 2025-01-06
**Project**: canvas-dev (Drupal 11 + Canvas beta)

**Changelog**:
- **2025-01-06**: Added Canvas CLI documentation, investigation of code component → SDC conversion, documentation about passing SDC props through blocks
- **2025-01-05**: Initial document creation with block integration, code components, and data fetching
