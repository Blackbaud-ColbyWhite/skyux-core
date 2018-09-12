const glob = require('glob');
const fs = require('fs-extra');

/**
 * During the `skyux build-public-library` step, this function injects
 * the contents of the locales resources file when referenced via
 * a `require` statement in a source file.
 * This is done to prevent a breaking change, since SkyResources fetches
 * the resource string synchronously, and SkyAppResources asynchronously.
 * Once a library can release a breaking change to adopt SkyAppResources,
 * this file should no longer be used.
 */
function injectLocaleResourcesContents() {
  const resourceFileExists = fs.pathExistsSync('./src/assets/locales/resources_en_US.json');

  if (!resourceFileExists) {
    console.log('Aborting script. Locale resource file not found.');
    return;
  }

  const resourceFileContents = fs.readFileSync(
    './src/assets/locales/resources_en_US.json',
    { encoding: 'utf8' }
  );

  // Replace all instances of:
  // `require('!json-loader!.skypageslocales/resources_en_US.json')`
  const regex = /require\(\'\!json-loader\!\.skypageslocales\/resources_en_US\.json\'\)/gi;

  // Looking for JavaScript files since the TypeScript has already been transpiled.
  const files = glob.sync('./dist/**/*.js');

  files.forEach((file) => {
    const fileContents = fs.readFileSync(file, { encoding: 'utf8' });

    if (!regex.test(fileContents)) {
      return;
    }

    const modified = fileContents.replace(
      regex,
      resourceFileContents
    );

    fs.writeFileSync(file, modified, { encoding: 'utf8' });
  });
}

module.exports = {
  injectLocaleResourcesContents
};
