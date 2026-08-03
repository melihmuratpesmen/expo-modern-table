# Launch copy (0.1.1)

Use with `docs/media/demo-mobile.gif` or `docs/media/demo.gif` as the visual.

Links:
- npm: https://www.npmjs.com/package/expo-modern-table
- GitHub: https://github.com/melihmuratpesmen/expo-modern-table
- Example: https://github.com/melihmuratpesmen/expo-modern-table/tree/main/example

---

## English — Reddit (r/reactnative / r/expo)

**Title:** expo-modern-table — FlashList data table for Expo & React Native (sort, filter, sticky cols)

**Body:**

We extracted the data table we use in production (MyExamy) into an open-source library.

**expo-modern-table** is a controlled table UI + `useTable` hook for client-side search / sort / filter / pagination, built on FlashList.

Highlights:
- Sticky columns + selection column
- Column filters (text / select / boolean / range)
- Column & row reorder
- Light / dark theming + i18n
- Works with Expo and bare RN (Expo Go example targets store SDK 54)

```bash
npx expo install expo-modern-table @shopify/flash-list react-native-gesture-handler react-native-reanimated react-native-svg
npm install lucide-react-native
```

```tsx
const table = useTable(data, columns, 20);
return <ModernTable columns={columns} {...table.getTableProps()} />;
```

- npm: https://www.npmjs.com/package/expo-modern-table
- GitHub: https://github.com/melihmuratpesmen/expo-modern-table

Feedback and issues welcome — early `0.x`.

*(Attach demo GIF)*

---

## English — Expo Discord / Reactiflux

Shipped **expo-modern-table** — a FlashList-based data table for Expo & React Native (sticky columns, filters, sort, selection, reorder, theming).

Extracted from our production app. Example runs on Expo Go SDK 54.

npm: https://www.npmjs.com/package/expo-modern-table  
GitHub: https://github.com/melihmuratpesmen/expo-modern-table  

Would love feedback from anyone building dense data UIs on mobile.

*(Attach demo-mobile.gif)*

---

## English — X / LinkedIn

Just open-sourced **expo-modern-table** — a performance-minded data table for Expo & React Native.

FlashList · sticky columns · sort/filter/search · selection · reorder · light/dark · i18n

Born in production at MyExamy. Early 0.x — feedback welcome.

npm → https://www.npmjs.com/package/expo-modern-table  
GitHub → https://github.com/melihmuratpesmen/expo-modern-table

*(Attach GIF)*

---

## Turkish — LinkedIn / X

Üretimde kullandığımız tabloyu açık kaynağa taşıdık: **expo-modern-table**

Expo & React Native için FlashList tabanlı data table:
sticky kolonlar, sıralama/filtre/arama, seçim, sürükle-bırak, light/dark tema, i18n.

Expo Go (SDK 54) example ile deneyebilirsiniz.

npm: https://www.npmjs.com/package/expo-modern-table  
GitHub: https://github.com/melihmuratpesmen/expo-modern-table

Erken `0.x` — geri bildirimlere açığız.

*(GIF ekle)*

---

## English — Dev.to / Hashnode (short post outline)

**Title:** Extracting a production React Native data table into expo-modern-table

1. Why we needed sticky columns + filters on mobile (MyExamy)
2. Why FlashList (recycling / large lists)
3. Controlled UI + `useTable` / `getTableProps()` pattern
4. Expo vs bare RN (optional orientation peer)
5. Try the Expo Go example (SDK 54)
6. Links + ask for issues

Keep ~6–8 min read. Embed `demo.gif` + install snippet from README.

---

## Checklist

- [ ] `npm publish` 0.1.1 live
- [ ] Reddit r/reactnative
- [ ] Reddit r/expo (check self-promo rules)
- [ ] Expo Discord
- [ ] LinkedIn (TR or EN)
- [ ] X
- [ ] Dev.to (optional same week)
