export const site = 'recorder.google.com';

export default async function({ page }) {
  await page.goto('https://recorder.google.com');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Click "Load more" until all recordings are loaded
  let prevCount = 0;
  while (true) {
    const result = await page.evaluate(() => {
      const main = document.querySelector('recorder-main');
      if (!main?.shadowRoot) return { count: 0, hasMore: false };

      const sidebar = main.shadowRoot.querySelector('recorder-sidebar');
      if (!sidebar?.shadowRoot) return { count: 0, hasMore: false };

      const sidebarItems = sidebar.shadowRoot.querySelector('recorder-sidebar-items');
      if (!sidebarItems?.shadowRoot) return { count: 0, hasMore: false };

      const count = sidebarItems.shadowRoot.querySelectorAll('recorder-sidebar-item').length;
      const loadMore = sidebarItems.shadowRoot.querySelector('mwc-button.load-more');

      if (loadMore) {
        loadMore.click();
        return { count, hasMore: true };
      }
      return { count, hasMore: false };
    });

    if (!result.hasMore || result.count === prevCount) break;
    prevCount = result.count;
    await page.waitForTimeout(2000);
  }

  // Extract all recordings
  const recordings = await page.evaluate(() => {
    const main = document.querySelector('recorder-main');
    if (!main?.shadowRoot) return [];

    const sidebar = main.shadowRoot.querySelector('recorder-sidebar');
    if (!sidebar?.shadowRoot) return [];

    const sidebarItems = sidebar.shadowRoot.querySelector('recorder-sidebar-items');
    if (!sidebarItems?.shadowRoot) return [];

    const items = sidebarItems.shadowRoot.querySelectorAll('recorder-sidebar-item');

    return [...items].map(item => {
      const meta = item.shadowRoot?.querySelector('recorder-metadata');
      if (!meta?.shadowRoot) return null;

      const sr = meta.shadowRoot;
      return {
        title: sr.querySelector('.title')?.textContent?.trim() || '',
        duration: sr.querySelector('.duration')?.textContent?.trim() || '',
        location: sr.querySelector('.location')?.textContent?.trim() || '',
      };
    }).filter(Boolean);
  });

  console.log(JSON.stringify(recordings));
}
