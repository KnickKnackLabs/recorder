export const site = 'recorder.google.com';

export default async function({ page }) {
  await page.goto('https://recorder.google.com');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

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
