export const site = 'recorder.google.com';

export default async function({ page, args }) {
  if (args.length === 0) {
    console.error('Usage: recorder delete <title> [title2] [title3] ...');
    process.exit(1);
  }

  await page.goto('https://recorder.google.com');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const results = [];

  for (const title of args) {
    // Click the target recording in the sidebar
    const found = await page.evaluate((t) => {
      const main = document.querySelector('recorder-main');
      if (!main?.shadowRoot) return false;

      const sidebar = main.shadowRoot.querySelector('recorder-sidebar');
      if (!sidebar?.shadowRoot) return false;

      const sidebarItems = sidebar.shadowRoot.querySelector('recorder-sidebar-items');
      if (!sidebarItems?.shadowRoot) return false;

      const items = sidebarItems.shadowRoot.querySelectorAll('recorder-sidebar-item');
      for (const item of items) {
        const meta = item.shadowRoot?.querySelector('recorder-metadata');
        if (!meta?.shadowRoot) continue;

        const itemTitle = meta.shadowRoot.querySelector('.title')?.textContent?.trim();
        if (itemTitle === t) {
          item.click();
          return true;
        }
      }
      return false;
    }, title);

    if (!found) {
      results.push({ title, error: 'not found' });
      continue;
    }

    await page.waitForTimeout(3000);

    // Open the settings menu (three-dot icon)
    await page.evaluate(() => {
      const main = document.querySelector('recorder-main');
      const content = main.shadowRoot.querySelector('recorder-content');
      const settings = content.shadowRoot.querySelector('recorder-settings');
      const menuBtn = settings.shadowRoot.querySelector('mwc-icon-button.menu');
      if (menuBtn) menuBtn.click();
    });

    await page.waitForTimeout(1000);

    // Click the Delete menu item
    await page.evaluate(() => {
      const main = document.querySelector('recorder-main');
      const content = main.shadowRoot.querySelector('recorder-content');
      const settings = content.shadowRoot.querySelector('recorder-settings');
      const deleteItem = settings.shadowRoot.querySelector('.delete-item');
      if (deleteItem) deleteItem.click();
    });

    await page.waitForTimeout(2000);

    // Confirm deletion in the dialog
    // The dialog lives at recorder-main > recorder-settings-delete > mwc-dialog
    const deleted = await page.evaluate(() => {
      const main = document.querySelector('recorder-main');
      const deleteEl = main.shadowRoot.querySelector('recorder-settings-delete');
      if (!deleteEl?.shadowRoot) return false;

      const confirmBtn = deleteEl.shadowRoot.querySelector('mwc-button.delete');
      if (confirmBtn) { confirmBtn.click(); return true; }
      return false;
    });

    await page.waitForTimeout(2000);

    results.push({ title, deleted });
  }

  console.log(JSON.stringify(results));
}
