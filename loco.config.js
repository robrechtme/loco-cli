/** @type {import('loco-cli/types').Config} */
module.exports = {
  accessKey: 'RGxcxXtH_yEU__3O3nHTr8xrm_RYJ2I70',
  localesDir: 'public/locales',
  namespaces: true,
  push: {
    'flag-new': 'provisional',
    'tag-new': process.env.npm_package_version,
    'delete-absent': false,
  },
  pull: {
    fallback: 'en',
  },
};
