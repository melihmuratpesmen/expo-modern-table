// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';

const repo = 'https://github.com/melihmuratpesmen/expo-modern-table';
const site = 'https://melihmuratpesmen.github.io';
const base = '/expo-modern-table';

export default defineConfig({
  site,
  base,
  integrations: [
    starlight({
      title: 'expo-modern-table',
      plugins: [
        // Fails the build on broken internal links. The demo is a separate static app.
        starlightLinksValidator({ exclude: [`${base}/demo/`, `${base}/demo/**`] }),
      ],
      description:
        'A feature-rich data table for Expo & React Native: sticky columns, sorting, filters, server-side data, selection, inline editing and more — built on FlashList.',
      logo: { src: './src/assets/logo.svg' },
      favicon: '/favicon.svg',
      social: [
        { icon: 'github', label: 'GitHub', href: repo },
        { icon: 'npm', label: 'npm', href: 'https://www.npmjs.com/package/expo-modern-table' },
      ],
      editLink: { baseUrl: `${repo}/edit/main/website/` },
      customCss: [
        '@fontsource-variable/inter',
        '@fontsource-variable/jetbrains-mono',
        './src/styles/docs.css',
      ],
      head: [
        { tag: 'meta', attrs: { property: 'og:image', content: `${site}${base}/og.png` } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: `${site}${base}/og.png` } },
      ],
      sidebar: [
        {
          label: 'Start here',
          items: [
            'getting-started/introduction',
            'getting-started/installation',
            'getting-started/quick-start',
          ],
        },
        { label: 'Guides', items: [{ autogenerate: { directory: 'guides' } }] },
        { label: 'Recipes', items: [{ autogenerate: { directory: 'recipes' } }] },
        { label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }] },
        {
          label: 'More',
          items: [
            'comparison',
            { label: 'Live demo', link: `${base}/demo/`, attrs: { target: '_blank' } },
            { label: 'Changelog', link: `${repo}/blob/main/CHANGELOG.md` },
          ],
        },
      ],
    }),
  ],
});
