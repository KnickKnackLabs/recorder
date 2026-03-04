export const site = 'recorder.google.com';

export default async function({ page, args }) {
  const targetTitle = args[0];
  if (!targetTitle) {
    console.error('Usage: recorder recording:get "<recording title>"');
    process.exit(1);
  }

  const outputPath = args[1] || null; // optional output path

  await page.goto('https://recorder.google.com');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Click the target recording in the sidebar
  const found = await page.evaluate((title) => {
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

      const t = meta.shadowRoot.querySelector('.title')?.textContent?.trim();
      if (t === title) {
        item.click();
        return true;
      }
    }
    return false;
  }, targetTitle);

  if (!found) {
    console.error(`Recording not found: "${targetTitle}"`);
    process.exit(1);
  }

  await page.waitForTimeout(3000);

  // Open the settings menu (three-dot menu)
  await page.evaluate(() => {
    const main = document.querySelector('recorder-main');
    const content = main.shadowRoot.querySelector('recorder-content');
    const settings = content.shadowRoot.querySelector('recorder-settings');
    // The settings component has a menu trigger — click the icon button
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

  // In the download modal, select only "Audio file (.m4a)" and click download
  // First, ensure the audio checkbox is selected and text is deselected
  await page.evaluate(() => {
    const main = document.querySelector('recorder-main');
    const modal = main.shadowRoot.querySelector('recorder-download-modal');
    const checklist = modal.shadowRoot.querySelector('#checklist');
    const items = checklist.shadowRoot.querySelectorAll('mwc-check-list-item');

    for (const item of items) {
      const text = item.textContent.trim();
      if (text.includes('Audio file')) {
        // Ensure it's selected
        if (!item.selected) item.click();
      } else {
        // Deselect non-audio items
        if (item.selected) item.click();
      }
    }
  });

  await page.waitForTimeout(500);

  // Set up download listener and click the download button
  const downloadPromise = page.waitForEvent('download');

  await page.evaluate(() => {
    const main = document.querySelector('recorder-main');
    const modal = main.shadowRoot.querySelector('recorder-download-modal');
    const downloadBtn = modal.shadowRoot.querySelector('mwc-button.download');
    if (downloadBtn) downloadBtn.click();
  });

  const download = await downloadPromise;

  // Save the file
  const suggestedName = download.suggestedFilename();
  const savePath = outputPath || suggestedName;
  await download.saveAs(savePath);

  console.log(JSON.stringify({ title: targetTitle, file: savePath, suggestedName }));
}
