# Launch kit

Ready-to-post copy for announcing **expo-modern-table**, in English and Turkish. Everything here
is accurate as of v0.5 — keep it that way: no "fastest", no "only", no invented numbers.

## Links & assets

| What | Where |
|------|-------|
| Website | https://melihmuratpesmen.github.io/expo-modern-table/ |
| Live demo | https://melihmuratpesmen.github.io/expo-modern-table/demo/ |
| Docs | https://melihmuratpesmen.github.io/expo-modern-table/getting-started/introduction/ |
| Comparison | https://melihmuratpesmen.github.io/expo-modern-table/comparison/ |
| GitHub | https://github.com/melihmuratpesmen/expo-modern-table |
| npm | https://www.npmjs.com/package/expo-modern-table |
| Social image (1280×640) | `docs/brand/social-preview.png` |
| Hero image | `docs/media/hero.png` |
| Demo clips (GIF + MP4) | `docs/media/demo-orders.*`, `demo-team.*`, `demo-markets.*` |

Upload the MP4s on X and LinkedIn (they autoplay; GIFs are re-encoded and look worse). Use the
GIFs on Reddit, dev.to and GitHub.

## Messaging

**One-liner** — Serious data tables, built for mobile.

**Tagline** — A complete data table for Expo & React Native: pinned columns, sorting, filters,
server-side paging, selection and inline editing — iOS, Android and web.

**Elevator pitch** — Most React Native tables are either a few styled rows or a headless toolkit
that leaves the UI to you. expo-modern-table is the whole table: a polished component plus a
`useTable` hook. Spread one into the other and you get search, sorting, filters, pagination,
selection and a totals row — on the device, or through your API with one flag.

**Proof points** (pick two or three)

- Built on FlashList; runs in Expo Go, bare React Native and the web
- Sticky columns, drag to resize / reorder columns and rows, expandable rows, summary row
- Server-side mode: `table.state` is a ready query key for TanStack Query / Supabase
- Light & dark themes, every string translatable (English + Turkish included), accessibility labels
- TypeScript-first, MIT, 169 tests, used in production at MyExamy
- Live demo: 25,000 orders over a mock API, a team directory, a live market table

**Mesaj (TR)**

- **Tek cümle** — Mobil için ciddi veri tabloları.
- **Slogan** — Expo ve React Native için eksiksiz bir veri tablosu: sabit sütunlar, sıralama,
  filtreler, sunucu tarafı sayfalama, seçim ve satır içi düzenleme — iOS, Android ve web.
- **Kısa anlatım** — React Native'deki tablolar ya birkaç stillendirilmiş satırdan ibaret ya da
  arayüzü tamamen size bırakan "headless" araçlar. expo-modern-table tablonun tamamı: şık bir
  bileşen ve bir `useTable` hook'u. Birini diğerine verin; arama, sıralama, filtre, sayfalama,
  seçim ve toplam satırı hazır — cihazda ya da tek bir bayrakla kendi API'nizde.

---

## Reddit — r/reactnative (EN)

**Title:** I built a full data table for Expo / React Native — pinned columns, filters, server-side paging (live demo)

**Body:**

> Every app I worked on needed "just a table" and every time it turned into a week of sticky
> columns, sort headers, filter sheets and pagination. So I turned ours into a library:
> **expo-modern-table**.
>
> It's a finished component (not headless) on top of FlashList, plus a `useTable` hook:
>
> ```tsx
> const table = useTable(orders, columns, 20);
> return <ModernTable columns={columns} {...table.getTableProps()} />;
> ```
>
> That gives you search, sorting, column filters, pagination, selection, a pinned first column
> and a totals row. Other things that are a prop away: column resize and reorder, drag-to-reorder
> rows, inline editing, expandable rows, bulk actions, loading / error / empty states, dark mode,
> translations. `manual: true` hands sorting / filtering / paging to your API.
>
> It runs in Expo Go, bare RN and on the web — the live demo is the example app exported for the
> web: https://melihmuratpesmen.github.io/expo-modern-table/demo/
>
> Docs: https://melihmuratpesmen.github.io/expo-modern-table/ · GitHub:
> https://github.com/melihmuratpesmen/expo-modern-table
>
> It's 0.x and I'd love feedback — especially on the API and on what's missing for your use case.
> If it's not a fit, the docs have an honest comparison with Paper's DataTable and TanStack Table.

*(Attach `demo-orders.gif`. Reply to comments for the first couple of hours.)*

---

## X / Twitter thread (EN)

**1/** Tables on mobile are always "just a quick table" until you need pinned columns, filters
and pagination.

I open-sourced the one we use in production: **expo-modern-table** — a complete data table for
Expo & React Native. 🧵

[video: demo-orders.mp4]

**2/** One hook, one component:

```tsx
const table = useTable(orders, columns, 20);
<ModernTable columns={columns} {...table.getTableProps()} />
```

Search, sorting, filters, pagination, selection, pinned first column and a totals row — done.

**3/** Gestures that feel native: drag a header edge to resize, long-press to reorder columns,
drag handles to reorder rows. Built on FlashList, Reanimated and Gesture Handler.

[video: demo-team.mp4]

**4/** Big data? `manual: true` and your API does the work. `table.state` is a ready query key:

```tsx
useQuery({ queryKey: ['orders', table.state], queryFn: () => fetchOrders(table.state) })
```

**5/** Custom cells, live updates, summary rows, dark mode, translations, accessibility labels.

[video: demo-markets.mp4]

**6/** Runs in Expo Go, bare React Native and the web. Try it in your browser — it's the real
component:

https://melihmuratpesmen.github.io/expo-modern-table/demo/

⭐ https://github.com/melihmuratpesmen/expo-modern-table

## X / Twitter thread (TR)

**1/** Mobilde tablo hep "küçük bir tablo"yla başlar; sonra sabit sütun, filtre, sayfalama
gelir.

Üretimde kullandığımız tabloyu açık kaynak yaptım: **expo-modern-table** — Expo ve React Native
için eksiksiz bir veri tablosu. 🧵

[video: demo-orders.mp4]

**2/** Bir hook, bir bileşen:

```tsx
const table = useTable(orders, columns, 20);
<ModernTable columns={columns} {...table.getTableProps()} />
```

Arama, sıralama, filtreler, sayfalama, seçim, sabit ilk sütun ve toplam satırı — hazır.

**3/** Doğal hissettiren hareketler: başlık kenarını sürükleyip genişletin, uzun basıp sütunları
taşıyın, tutamaçla satırları sıralayın. FlashList, Reanimated ve Gesture Handler üzerine kurulu.

[video: demo-team.mp4]

**4/** Veri büyükse `manual: true` deyin, işi API'niz yapsın. `table.state` doğrudan bir query
key:

```tsx
useQuery({ queryKey: ['orders', table.state], queryFn: () => fetchOrders(table.state) })
```

**5/** Özel hücreler, canlı güncelleme, özet satırı, koyu tema, çeviriler (Türkçe hazır) ve
erişilebilirlik etiketleri.

[video: demo-markets.mp4]

**6/** Expo Go'da, saf React Native'de ve web'de çalışır. Tarayıcıda deneyin — gerçek bileşen:

https://melihmuratpesmen.github.io/expo-modern-table/demo/

⭐ https://github.com/melihmuratpesmen/expo-modern-table

---

## LinkedIn (EN)

> **Open-sourcing the data table behind our mobile app 📱📊**
>
> Almost every product eventually needs a table: orders, reports, inventories, leaderboards. On
> mobile that "simple table" quickly turns into pinned columns, filter sheets, pagination,
> selection, and a lot of edge cases.
>
> I've packaged ours as **expo-modern-table** — a complete, themeable data table for Expo and
> React Native:
>
> ✅ Pinned columns, column resize & reorder
> ✅ Sorting, filters and accent-aware search
> ✅ Server-side mode for large data sets (works great with TanStack Query and Supabase)
> ✅ Selection with bulk actions, inline editing, expandable rows, summary rows
> ✅ Light / dark themes, translations, accessibility labels
> ✅ iOS, Android and web — and it runs in Expo Go
>
> It's MIT licensed and used in production at MyExamy. The live demo runs the real component in
> your browser: https://melihmuratpesmen.github.io/expo-modern-table/demo/
>
> Feedback and stars are very welcome 🙏
> https://github.com/melihmuratpesmen/expo-modern-table
>
> #ReactNative #Expo #OpenSource #MobileDevelopment #TypeScript

## LinkedIn (TR)

> **Mobil uygulamamızın arkasındaki veri tablosunu açık kaynak yaptım 📱📊**
>
> Neredeyse her ürün bir gün tabloya ihtiyaç duyar: siparişler, raporlar, stoklar, sıralamalar.
> Mobilde bu "basit tablo" kısa sürede sabit sütunlara, filtre ekranlarına, sayfalamaya, seçime
> ve bir sürü uç duruma dönüşür.
>
> Kendi kullandığımız tabloyu **expo-modern-table** adıyla paketledim — Expo ve React Native için
> eksiksiz, temalanabilir bir veri tablosu:
>
> ✅ Sabit sütunlar, sütun genişletme ve taşıma
> ✅ Sıralama, filtreler ve Türkçe karakterlere duyarlı arama
> ✅ Büyük veriler için sunucu tarafı mod (TanStack Query ve Supabase ile tam uyumlu)
> ✅ Toplu işlemlerle seçim, satır içi düzenleme, açılır satırlar, özet satırı
> ✅ Açık / koyu tema, çeviriler (Türkçe hazır), erişilebilirlik
> ✅ iOS, Android ve web — Expo Go'da da çalışır
>
> MIT lisanslı ve MyExamy'de üretimde kullanılıyor. Canlı demo gerçek bileşeni tarayıcınızda
> çalıştırıyor: https://melihmuratpesmen.github.io/expo-modern-table/demo/
>
> Geri bildirimlerinizi ve GitHub yıldızlarınızı bekliyorum 🙏
> https://github.com/melihmuratpesmen/expo-modern-table
>
> #ReactNative #Expo #AçıkKaynak #MobilGeliştirme #TypeScript

---

## Blog post — dev.to / Hashnode / Medium (EN)

**Title:** Building data tables for React Native that don't feel like a web page
**Tags:** reactnative, expo, typescript, opensource
**Cover:** `docs/brand/social-preview.png`

> Tables are the most boring component in a design system — right up until you have to build
> one for a phone. The screen is narrow, there's no hover, horizontal scrolling fights with
> vertical scrolling, and users still expect everything a spreadsheet does.
>
> This post walks through **expo-modern-table**, the open-source table I built for our Expo app,
> and the decisions behind it.
>
> ### One hook, one component
>
> ```tsx
> import { ModernTable, useTable, type Column } from 'expo-modern-table';
>
> const columns: Column<Order>[] = [
>   { key: 'id', title: 'Order', width: 100, isSticky: true },
>   { key: 'customer', title: 'Customer', width: 200 },
>   { key: 'status', title: 'Status', filterConfig: { type: 'select', options: STATUSES } },
>   { key: 'total', title: 'Total', align: 'right', footer: 'sum' },
> ];
>
> export function Orders({ orders }: { orders: Order[] }) {
>   const table = useTable(orders, columns, 20);
>   return <ModernTable columns={columns} {...table.getTableProps()} />;
> }
> ```
>
> `ModernTable` is presentational and fully controlled. `useTable` owns the state — search,
> sort, filters, page, selection, column layout — and hands it over with `getTableProps()`. You
> can replace the hook with your own store, or drive the table from code with
> `table.handleSort('date', 'desc')`.
>
> ### Pinned columns without jank
>
> The first column stays put while the rest scrolls sideways. Rows are virtualized with
> FlashList, and every pinned cell shares one native-driver animation of the horizontal scroll
> offset, so pinning doesn't add per-row work.
>
> ### Gestures that respect the scroll
>
> Resizing a column (drag the header edge), reordering columns (long-press a header) and
> reordering rows (drag handles) are Gesture Handler + Reanimated gestures that only activate
> after a clear intent, so they don't steal vertical or horizontal scrolls.
>
> ### When the data lives on a server
>
> With `manual: true` the hook stops processing rows and only keeps the state. Search is
> debounced, a new search or filter goes back to page 1, and `table.state` keeps its identity
> until something changes — so it's a ready query key:
>
> ```tsx
> const table = useTable(page.rows, columns, { manual: true, rowCount: page.total });
> const query = useQuery({
>   queryKey: ['orders', table.state],
>   queryFn: () => fetchOrders(table.state),
> });
> ```
>
> The helpers the hook uses on the device (`searchRows`, `filterRows`, `sortRows`) are pure
> functions, so the same logic can run in a Node API or a mock server. The live demo pages
> through 25,000 orders exactly that way.
>
> ### The details that make it feel finished
>
> - Loading, refetching, error-with-retry and empty states
> - Selection with a contextual bulk-action bar
> - Inline editing that keeps numbers as numbers (and accepts `,` as a decimal separator)
> - Expandable rows and a summary row that covers every filtered row, not just the page
> - Light / dark themes, token overrides, replaceable icons
> - Every string and accessibility label translatable — search folds accents and Turkish `İ/ı`
>
> ### Try it
>
> - Live demo (the real component, in your browser):
>   https://melihmuratpesmen.github.io/expo-modern-table/demo/
> - Docs and recipes (TanStack Query, Supabase, MMKV, CSV export):
>   https://melihmuratpesmen.github.io/expo-modern-table/
> - GitHub: https://github.com/melihmuratpesmen/expo-modern-table
>
> It's 0.x and MIT. If you build something with it — or hit something it can't do yet — I'd love
> to hear about it.

## Blog yazısı — Medium (TR)

**Başlık:** React Native'de web sayfası gibi hissettirmeyen veri tabloları
**Etiketler:** react-native, expo, typescript, açık kaynak

> Tablolar bir tasarım sisteminin en sıkıcı bileşenidir — ta ki bir telefon için yapmanız
> gerekene kadar. Ekran dar, "hover" yok, yatay kaydırma dikey kaydırmayla çatışıyor ve
> kullanıcılar yine de bir hesap tablosunun yaptığı her şeyi bekliyor.
>
> Bu yazıda Expo uygulamamız için geliştirdiğim açık kaynak tablo **expo-modern-table**'ı ve
> arkasındaki kararları anlatıyorum.
>
> ### Bir hook, bir bileşen
>
> ```tsx
> const table = useTable(orders, columns, 20);
> return <ModernTable columns={columns} {...table.getTableProps()} />;
> ```
>
> `ModernTable` yalnızca gösterir ve tamamen kontrollüdür. `useTable` durumu yönetir — arama,
> sıralama, filtreler, sayfa, seçim, sütun düzeni — ve `getTableProps()` ile tabloya verir.
> İsterseniz hook yerine kendi store'unuzu kullanabilir ya da tabloyu koddan yönetebilirsiniz:
> `table.handleSort('date', 'desc')`.
>
> ### Takılmayan sabit sütunlar
>
> İlk sütun yerinde kalırken diğerleri yana kayar. Satırlar FlashList ile sanallaştırılır;
> sabit hücrelerin hepsi yatay kaydırmanın tek bir native animasyonunu paylaşır, yani sabitlemek
> satır başına ek iş getirmez.
>
> ### Kaydırmaya saygılı hareketler
>
> Sütun genişletme (başlık kenarını sürükleyin), sütun taşıma (başlığa uzun basın) ve satır
> sıralama (tutamaçlar) Gesture Handler + Reanimated hareketleridir ve yalnızca niyet netleşince
> devreye girer; kaydırmayı çalmaz.
>
> ### Veri sunucudaysa
>
> `manual: true` ile hook satırları işlemeyi bırakır, yalnızca durumu tutar. Arama gecikmeli
> (debounce) gönderilir, yeni bir arama ya da filtre 1. sayfaya döner ve `table.state` bir şey değişene kadar
> aynı nesne kalır — doğrudan bir query key olarak kullanılabilir:
>
> ```tsx
> const table = useTable(page.rows, columns, { manual: true, rowCount: page.total });
> const query = useQuery({
>   queryKey: ['orders', table.state],
>   queryFn: () => fetchOrders(table.state),
> });
> ```
>
> Hook'un cihazda kullandığı yardımcılar (`searchRows`, `filterRows`, `sortRows`) saf
> fonksiyonlardır; aynı mantık bir Node API'sinde de çalışır. Canlı demo 25.000 siparişi tam
> olarak böyle sayfalıyor.
>
> ### "Bitmiş" hissettiren ayrıntılar
>
> - Yükleniyor, yeniden yükleniyor, hata + tekrar dene ve boş durumları
> - Bağlama duyarlı toplu işlem çubuğuyla seçim
> - Sayıları sayı olarak koruyan satır içi düzenleme (ondalık ayırıcı olarak virgül de olur)
> - Açılır satırlar ve yalnızca sayfayı değil tüm filtrelenmiş satırları kapsayan özet satırı
> - Açık / koyu tema, renk ayarları, değiştirilebilir ikonlar
> - Tüm metinler çevrilebilir, Türkçe çeviri hazır; arama `İ/ı` ve aksanları doğru eşleştirir
>
> ### Deneyin
>
> - Canlı demo (tarayıcınızda gerçek bileşen):
>   https://melihmuratpesmen.github.io/expo-modern-table/demo/?lang=tr
> - Dokümantasyon ve tarifler (TanStack Query, Supabase, MMKV, CSV):
>   https://melihmuratpesmen.github.io/expo-modern-table/
> - GitHub: https://github.com/melihmuratpesmen/expo-modern-table
>
> Sürüm 0.x ve MIT lisanslı. Bununla bir şey yaparsanız — ya da henüz yapamadığı bir şeye
> takılırsanız — duymak isterim.

---

## Short posts

**Discord / Slack (Expo, Reactiflux, Infinite Red Community):**

> 👋 I open-sourced **expo-modern-table** — a full data table for Expo / RN (pinned columns,
> filters, server-side paging, selection, inline edit, dark mode) built on FlashList. Runs in
> Expo Go and on the web. Live demo: https://melihmuratpesmen.github.io/expo-modern-table/demo/
> — feedback very welcome!

**Show HN title:** Show HN: expo-modern-table – a complete data table for React Native and Expo

**Product Hunt tagline (60 chars):** Serious data tables for Expo and React Native

## Where to post

- r/reactnative, r/expo (Reddit — weekday morning US time)
- X / Bluesky with `#ReactNative #Expo`, tagging @expo and @shopify (FlashList) only if they
  engage
- LinkedIn (EN and TR as separate posts, a few days apart)
- dev.to + Hashnode (EN), Medium (TR)
- Expo Discord `#showcase`, Reactiflux `#react-native`
- Newsletters: [React Native Newsletter](https://reactnativenewsletter.com/),
  [This Week in React](https://thisweekinreact.com/) — submit the blog post link
- [React Native Directory](https://reactnative.directory/) is already listed — keep it current

## Checklist before posting

- [ ] Latest version published to npm (README with the new visuals)
- [ ] GitHub Pages is live and the demo loads on a phone
- [ ] Social preview uploaded (Settings → General → Social preview)
- [ ] Repository description, website and topics set
- [ ] Pinned issue or discussion for feedback
