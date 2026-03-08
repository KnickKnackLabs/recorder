// Shared helpers for recorder browser scripts.

// Find a recording by title in the sidebar and click it.
// Returns true if found, false otherwise.
export async function selectRecording(page, title) {
  return page.evaluate((t) => {
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

      if (meta.shadowRoot.querySelector('.title')?.textContent?.trim() === t) {
        item.click();
        return true;
      }
    }
    return false;
  }, title);
}

// Open the three-dot settings menu for the currently selected recording.
export async function openSettingsMenu(page) {
  await page.evaluate(() => {
    const main = document.querySelector('recorder-main');
    const content = main.shadowRoot.querySelector('recorder-content');
    const settings = content.shadowRoot.querySelector('recorder-settings');
    settings.shadowRoot.querySelector('mwc-icon-button.menu')?.click();
  });
}
