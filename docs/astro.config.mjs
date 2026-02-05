import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://loco-cli.robrecht.me',
  integrations: [
    starlight({
      title: 'loco-cli',
      logo: {
        src: './public/logo.svg',
        replacesTitle: true
      },
      customCss: ['./src/styles/custom.css'],
      social: {
        github: 'https://github.com/robrechtme/loco-cli'
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: '' },
            { label: 'Installation', slug: 'installation' },
            { label: 'Configuration', slug: 'configuration' }
          ]
        },
        {
          label: 'Commands',
          items: [
            { label: 'pull', slug: 'commands/pull' },
            { label: 'push', slug: 'commands/push' },
            { label: 'status', slug: 'commands/status' }
          ]
        },
        { label: 'Contributing', slug: 'contributing' }
      ]
    })
  ]
});
