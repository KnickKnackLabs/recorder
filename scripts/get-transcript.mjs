export const site = 'recorder.google.com';

export default async function({ page, args }) {
  const targetTitle = args[0];
  if (!targetTitle) {
    console.error('Usage: recorder transcript:get "<recording title>"');
    process.exit(1);
  }

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

  // Wait for transcript to load
  await page.waitForTimeout(5000);

  // Extract transcript utterances
  const transcript = await page.evaluate(() => {
    const main = document.querySelector('recorder-main');
    if (!main?.shadowRoot) return null;

    const content = main.shadowRoot.querySelector('recorder-content');
    if (!content?.shadowRoot) return null;

    const transcriptEl = content.shadowRoot.querySelector('recorder-transcript');
    if (!transcriptEl?.shadowRoot) return null;

    const utterances = transcriptEl.shadowRoot.querySelectorAll('recorder-transcript-utterance');

    return [...utterances].map(u => {
      const sr = u.shadowRoot;
      if (!sr) return null;

      const timeEl = sr.querySelector('.time');
      const containerEl = sr.querySelector('.container');

      return {
        time: timeEl?.textContent?.trim() || '',
        text: containerEl?.textContent?.trim() || sr.textContent?.trim() || '',
      };
    }).filter(Boolean);
  });

  if (!transcript) {
    console.error('Could not extract transcript — page structure may have changed');
    process.exit(1);
  }

  console.log(JSON.stringify({ title: targetTitle, utterances: transcript }));
}
