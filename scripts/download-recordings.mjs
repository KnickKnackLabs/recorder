export const site = 'recorder.google.com';

export default async function({ page, args }) {
  if (args.length === 0) {
    console.error('Usage: recorder download <title> [title2] [title3] ...');
    process.exit(1);
  }

  // Split args into titles and output directory
  // Last arg starting with --output-dir= is the output directory
  let outputDir = '.';
  const titles = [];
  for (const arg of args) {
    if (arg.startsWith('--output-dir=')) {
      outputDir = arg.slice('--output-dir='.length);
    } else {
      titles.push(arg);
    }
  }

  await page.goto('https://recorder.google.com');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const results = [];

  for (const title of titles) {
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

    // Open the settings menu
    await page.evaluate(() => {
      const main = document.querySelector('recorder-main');
      const content = main.shadowRoot.querySelector('recorder-content');
      const settings = content.shadowRoot.querySelector('recorder-settings');
      const trigger = settings.shadowRoot.querySelector('mwc-icon-button') ||
                      settings.shadowRoot.querySelector('[slot="trigger"]') ||
                      settings.shadowRoot.querySelector('button');
      if (trigger) trigger.click();
    });

    await page.waitForTimeout(1000);

    // Click the Download menu item
    await page.evaluate(() => {
      const main = document.querySelector('recorder-main');
      const content = main.shadowRoot.querySelector('recorder-content');
      const settings = content.shadowRoot.querySelector('recorder-settings');
      const downloadItem = settings.shadowRoot.querySelector('.download-item');
      if (downloadItem) downloadItem.click();
    });

    await page.waitForTimeout(1000);

    // Select only audio file in download modal
    await page.evaluate(() => {
      const main = document.querySelector('recorder-main');
      const modal = main.shadowRoot.querySelector('recorder-download-modal');
      const checklist = modal.shadowRoot.querySelector('#checklist');
      const items = checklist.shadowRoot.querySelectorAll('mwc-check-list-item');

      for (const item of items) {
        const text = item.textContent.trim();
        if (text.includes('Audio file')) {
          if (!item.selected) item.click();
        } else {
          if (item.selected) item.click();
        }
      }
    });

    await page.waitForTimeout(500);

    // Download
    const downloadPromise = page.waitForEvent('download');

    await page.evaluate(() => {
      const main = document.querySelector('recorder-main');
      const modal = main.shadowRoot.querySelector('recorder-download-modal');
      const downloadBtn = modal.shadowRoot.querySelector('mwc-button.download');
      if (downloadBtn) downloadBtn.click();
    });

    const download = await downloadPromise;
    const suggestedName = download.suggestedFilename();
    const savePath = `${outputDir}/${suggestedName}`;
    await download.saveAs(savePath);

    results.push({ title, file: savePath, suggestedName });

    // Wait a moment before processing next recording
    await page.waitForTimeout(1000);
  }

  console.log(JSON.stringify(results));
}
