/** @type {import('loco-cli/types').Config} */
module.exports = {
  accessKey: '<access-key>',
  localesDir: 'public/locales',
  namespaces: true,
  push: {
    'flag-new': 'provisional',
    'tag-new': process.env.npm_package_version,
    'delete-absent': false
  },
  pull: {
    fallback: 'en'
  }
};
