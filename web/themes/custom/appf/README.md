# DRUPAL 10 THEME WHAT BASE ON SDC (SINGLE DIRECTORY COMPONENTS).

### Description
- Pre-configured Drupal 10 theme template.
- Bootstrap 5 ready.
- More features/configurations to come later on.

## Requirements
* `nvm --version` = 0.39.7
  * To install nvm run `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash`
* `node --version` = 20.14.0
* `yarn --version` = 4.0.2
  * To enable corepack run `enable corepack`
  * To change yarn version run `yarn set version 4.0.2`

### For development
1. Run `cd docroot/themes/custom/appf`
2. Run `nvm install`
3. Run `nvm use`
4. Run `corepack enable`
5. Run `yarn set version 4.0.2`
6. Run `yarn install`
7. Run `yarn theme:full-build`

### Scripts
- Run `yarn theme:full-build` - for full theme build (theme and components - SDC)
- Run `yarn theme:build` - for build just the theme
- Run `yarn components:build` - for build just the components (SDC)
- Run `yarn theme:watch` - for watch the modifications
- Run `yarn lint:scss` - for run the css linter
- Run `yarn lint:js` - for run the js linter
- Run `yarn lint:yml` - for run the yml linter
