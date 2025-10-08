# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Drupal 11 development environment focused on the **Drupal Canvas** module and **Workspaces Extra (WSE)** module development. The project uses:

- **Drupal 11.x** (latest dev)
- **PHP 8.3** via DDEV
- **MariaDB 10.11**
- **DDEV** for local development environment (v1.24+)
- **Composer 2** for PHP dependencies
- **Drush 13.6+** for Drupal CLI operations
- **Node.js 20+** for frontend builds

The two primary modules being developed:
1. **Canvas** (`web/modules/contrib/canvas`) - A component-based page builder enabling content creators to compose pages using Single Directory Components (SDC) without writing code
2. **Workspaces Extra** (`web/modules/contrib/wse`) - Extends core Workspaces with features like workspace status, cloning, rollback, and configuration staging

## Project Structure

```
/
├── .ddev/                      # DDEV configuration and custom commands
│   ├── config.yaml            # Main DDEV config (canvas-dev project)
│   └── commands/              # Custom DDEV commands (xb-* commands)
│       ├── web/               # Commands run inside web container
│       └── host/              # Commands run on host machine
├── composer.json              # Root composer dependencies
├── recipes/                   # Drupal recipes (type:drupal-recipe)
├── vendor/                    # PHP dependencies (not committed)
└── web/                       # Drupal docroot
    ├── core/                  # Drupal core (managed by Composer)
    ├── modules/contrib/       # Contributed modules
    │   ├── canvas/           # Canvas module (git clone for development)
    │   │   ├── ui/           # React app (Vite + TypeScript)
    │   │   ├── src/          # PHP source
    │   │   └── tests/        # PHPUnit tests
    │   └── wse/              # Workspaces Extra module
    ├── themes/contrib/        # Contributed themes
    │   └── civictheme/       # CivicTheme base theme
    └── sites/default/         # Site configuration
```

## Development Commands

All commands should be run with `ddev` prefix to execute inside the container.

### Initial Setup

```bash
ddev xb-setup              # Complete environment setup (clones Canvas, installs dependencies)
ddev xb-setup --force      # Reset and rebuild entire environment
ddev xb-site-install       # (Re)install Drupal + enable Canvas modules
```

### Development Workflow

```bash
# Drupal site management
ddev drush cr                    # Clear cache
ddev drush uli                   # Generate one-time login link
ddev drush pm:install MODULE     # Install module
ddev drush pm:uninstall MODULE   # Uninstall module

# Frontend builds (Canvas UI - React/Vite app)
ddev xb-ui-build            # Build Canvas UI (required after Canvas updates)
ddev xb-ui-dev              # Start Vite dev server with HMR

# Workspaces development
ddev xb-workspaces-dev      # Install and configure WSE modules
```

### Testing & Quality

```bash
# PHP code quality
ddev xb-phpcs              # Run PHPCS on Canvas module
ddev xb-phpcs fix          # Auto-fix PHPCS issues
ddev xb-phpstan            # Run PHPStan static analysis

# PHP testing
ddev xb-phpunit                        # Run all Canvas PHPUnit tests
ddev xb-phpunit tests/src/Unit/...     # Run specific test (path relative to canvas/)

# JavaScript quality
ddev xb-eslint             # Lint Canvas UI JavaScript/TypeScript
ddev xb-eslint fix         # Auto-fix ESLint issues
ddev xb-stylelint          # Lint CSS files

# JavaScript testing
cd web/modules/contrib/canvas/ui
npm run test               # Run vitest tests
npm run cy:run             # Run Cypress E2E tests
npm run cy:open            # Open Cypress UI
```

### Composer Operations

```bash
ddev composer require drupal/MODULE_NAME
ddev composer update
ddev composer install
```

## Architecture & Key Concepts

### Canvas Module

**Purpose**: Enable site builders and content creators to build pages using Single Directory Components (SDC) without writing code beyond HTML/CSS/Twig.

**Key architectural elements**:
- **Components**: Based on Drupal's SDC (Single Directory Components) standard
- **Canvas Pages**: Entities that compose components with configurable props
- **Page Templates**: Integral part of Canvas, requires block plugins (main content, title, messages)
- **JSON Schema Interpretation**: Components define their prop shapes via JSON schema, which Canvas maps to Drupal field types
- **React UI**: Full-featured UI (`canvas/ui/`) for visual page composition using React + TypeScript + Vite

**Dependencies**: Requires numerous core modules (block, editor, ckeditor5, filter, text, datetime, image, link, media_library, options, path)

**Frontend tech stack** (in `ui/`):
- React 18 + TypeScript
- Vite for builds and HMR
- Redux Toolkit for state management
- Radix UI components
- Cypress for E2E testing
- Vitest for unit tests

### Workspaces Extra (WSE)

**Purpose**: Extends Drupal core Workspaces module with production-ready features.

**Key features**:
- Workspace status field (open/closed)
- Clone workspace metadata on publish
- Rollback changes from closed workspaces
- Move content between workspaces
- Revision squashing on publish
- Workspace-aware forms allowlist

**Sub-modules**:
- `wse_config`: Stage configuration changes
- `wse_deploy`: Import/export workspace content
- `wse_group_access`: Restrict workspaces to user groups
- `wse_layout_builder`: Layout Builder integration
- `wse_menu`: Stage menu hierarchies
- `wse_preview`: Generate shareable preview links
- `wse_scheduler`: Schedule workspace publishing
- `wse_task_monitor`: Real-time UI monitoring

## Drupal Core Commands

### PHPUnit (Drupal core tests)

```bash
cd web
../vendor/bin/phpunit -c core/phpunit.xml.dist [path]
../vendor/bin/phpunit -c core/phpunit.xml.dist --group group_name
../vendor/bin/phpunit -c core/phpunit.xml.dist --testsuite unit,kernel
```

**Important**: For functional-javascript tests, start chromedriver first:
```bash
/path/to/chromedriver --port=4444
```

### Frontend (Drupal core)

```bash
cd web/core
yarn install            # Install dependencies
yarn build              # Build all assets (CSS + CKEditor5)
yarn watch              # Watch mode for development
yarn build:css          # Build CSS only
yarn build:ckeditor5    # Build CKEditor5 plugins
yarn lint:core-js       # Lint JavaScript
yarn lint:css           # Lint CSS with stylelint
```

## Testing Configuration

### Canvas Module Tests

**PHPUnit config**: Uses `web/core/phpunit.xml.dist` with paths relative to `modules/contrib/canvas/`

**Test dependencies** (installed via `canvas.info.yml` test_dependencies):
- `cl_editorial` - For test component `cl_editorial:component-card`
- `sdc_test` - Provides 5 test components
- `sdc_examples` - Additional examples with various prop types

**JavaScript tests**: Located in `web/modules/contrib/canvas/ui/tests/`
- E2E: Cypress tests in `tests/e2e/`
- Component: Cypress component tests
- Unit: Vitest tests

### Running Canvas Tests Manually

From Drupal root (`web/`):
```bash
# PHP tests
../vendor/bin/phpunit -c core/phpunit.xml.dist modules/contrib/canvas/

# JS tests (from canvas/ui/ directory)
npm run test          # Vitest
npm run cy:run        # Cypress E2E
```

## Important Files & Locations

- `.ddev/config.yaml` - DDEV project configuration
- `composer.json` (root) - PHP dependencies, installer paths
- `web/modules/contrib/canvas/canvas.info.yml` - Canvas module definition
- `web/modules/contrib/canvas/ui/package.json` - Canvas UI dependencies
- `web/modules/contrib/canvas/phpcs.xml` - PHPCS standards for Canvas
- `web/modules/contrib/canvas/phpstan.neon` - PHPStan config for Canvas
- `web/core/package.json` - Drupal core frontend tooling
- `web/sites/default/settings.php` - Drupal configuration
- `web/sites/default/settings.ddev.php` - DDEV-managed settings

## Common Development Tasks

### Working on Canvas Module (PHP)

1. Make changes in `web/modules/contrib/canvas/src/`
2. Clear cache: `ddev drush cr`
3. Run code quality checks:
   - `ddev xb-phpcs` (and fix with `ddev xb-phpcs fix`)
   - `ddev xb-phpstan`
4. Run tests: `ddev xb-phpunit`
5. Test manually in browser at `/canvas`

### Working on Canvas UI (JavaScript/React)

1. Make changes in `web/modules/contrib/canvas/ui/src/`
2. For quick iteration: `ddev xb-ui-dev` (starts Vite HMR server)
3. For production build: `ddev xb-ui-build`
4. Run linting: `ddev xb-eslint` (fix with `ddev xb-eslint fix`)
5. Run tests:
   - Unit: `cd web/modules/contrib/canvas/ui && npm run test`
   - E2E: `cd web/modules/contrib/canvas/ui && npm run cy:run`

### Working on Workspaces Extra (WSE)

1. Enable for development: `ddev xb-workspaces-dev`
2. Make changes in `web/modules/contrib/wse/src/`
3. Clear cache: `ddev drush cr`
4. Test workspace features through Drupal UI

## Extension Discovery

**Important**: Test modules need to be discoverable. Add to `sites/default/settings.ddev.php`:
```php
$settings['extension_discovery_scan_tests'] = TRUE;
```

This is required for Canvas test modules like `canvas_dev_mode` and `sdc_test_all_props`.

## Known Development Patterns

### Composer Installer Paths

Custom paths defined in root `composer.json`:
- Drupal core → `web/core`
- Contrib modules → `web/modules/contrib/{$name}`
- Custom modules → `web/modules/custom/{$name}`
- Contrib themes → `web/themes/contrib/{$name}`
- Custom themes → `web/themes/custom/{$name}`
- Recipes → `recipes/{$name}`

### DDEV Commands Convention

All custom DDEV commands use `xb-` prefix:
- `xb-setup` - Initial setup
- `xb-site-install` - Site installation
- `xb-phpunit`, `xb-phpcs`, `xb-phpstan` - Testing/QA
- `xb-ui-build`, `xb-ui-dev` - Frontend builds
- `xb-workspaces-dev` - Workspace development setup

Run `ddev help <command>` for detailed usage.

## URLs

- Local site: https://canvas-dev.ddev.site
- Canvas UI: https://canvas-dev.ddev.site/canvas
- Mailpit: https://canvas-dev.ddev.site:8026

## Additional Resources

- Canvas issue queue: https://www.drupal.org/project/issues/canvas
- Canvas source: https://git.drupalcode.org/project/canvas
- WSE module: https://www.drupal.org/project/wse
- DDEV docs: https://ddev.readthedocs.io
