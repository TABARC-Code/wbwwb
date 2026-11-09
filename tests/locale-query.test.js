// Author: TABARC-Code
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

for (const locale of ['en', 'de', 'es', 'fa', 'pt', 'tr']) {
  test(`explicit ${locale} selection overrides a saved language`, () => {
    const saved = new Map([['wbwwb.locale', 'en']]);
    const context = {URLSearchParams, location: {search: `?lang=${locale}`}, navigator: {languages: ['en']},
      localStorage: {getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value)}};
    context.window = context;
    for (const path of ['js/textStrings.js', 'js/locale.js', 'js/locale-tr.js', 'js/locale-query.js']) {
      vm.runInNewContext(fs.readFileSync(path, 'utf8'), context);
    }
    assert.equal(context.WBWWB_LOCALE, locale);
    assert.equal(saved.get('wbwwb.locale'), locale);
  });
}
