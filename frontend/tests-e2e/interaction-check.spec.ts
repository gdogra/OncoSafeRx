import { test, expect } from '@playwright/test';

test.describe('Interactions flow (mocked API)', () => {
  test('add two drugs, check interactions, see results', async ({ page }) => {
    await page.route('**/api/drugs/search**', async route => {
      const url = new URL(route.request().url());
      const q = url.searchParams.get('q') || '';
      const results = [
        { rxcui: '111', name: 'Warfarin', synonym: 'Warfarin', tty: 'IN' },
        { rxcui: '222', name: 'Aspirin', synonym: 'Aspirin', tty: 'IN' }
      ].filter(d => d.name.toLowerCase().includes(q.toLowerCase()));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ count: results.length, query: q, results }) });
    });

    await page.route('**/api/interactions/check', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          interactions: {
            stored: [
              { id: '111-222', drug1_rxcui: '111', drug2_rxcui: '222', drug1: { rxcui: '111', name: 'Warfarin' }, drug2: { rxcui: '222', name: 'Aspirin' }, severity: 'major', effect: 'Increased bleeding risk', mechanism: 'Additive anticoagulant effects', management: 'Monitor INR closely', evidence_level: 'A', sources: ['Clinical literature'] }
            ],
            external: []
          },
          sources: { stored: 1, external: 0 }
        })
      });
    });

    await page.goto('/interactions');

    await page.getByPlaceholder('Search for a medication to add...').fill('war');
    await expect(page.getByText('Warfarin')).toBeVisible();
    await page.getByText('Warfarin').first().click();

    await page.getByPlaceholder('Search for a medication to add...').fill('asp');
    await expect(page.getByText('Aspirin')).toBeVisible();
    await page.getByText('Aspirin').first().click();

    await page.getByRole('button', { name: /Check for Interactions/i }).click();

    await expect(page.getByText(/Interaction Analysis/i)).toBeVisible();
    await expect(page.getByText(/major/i)).toBeVisible();
    await expect(page.getByText(/Increased bleeding risk/i)).toBeVisible();
  });
});

