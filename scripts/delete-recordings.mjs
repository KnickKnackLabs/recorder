import { selectRecording, openSettingsMenu } from './helpers.mjs';

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
    try {
      const found = await selectRecording(page, title);

      if (!found) {
        results.push({ title, error: 'not found' });
        continue;
      }

      await page.waitForTimeout(3000);

      await openSettingsMenu(page);

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
    } catch (err) {
      results.push({ title, error: err.message });
    }
  }

  console.log(JSON.stringify(results));
}
