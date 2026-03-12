import { expect, test } from '@playwright/test';

test('new page renders the editor without runtime errors', async ({ page }) => {
	const pageErrors: string[] = [];

	page.on('pageerror', (error) => {
		pageErrors.push(String(error));
	});

	await page.goto('/new');
	await expect(page.getByRole('heading', { name: 'Create New Entry' })).toBeVisible();
	await expect(page.getByText('Title', { exact: true })).toBeVisible();
	await expect(page.getByText(/Rich editor|Source editor/)).toBeVisible();
	await page.waitForTimeout(1000);

	expect(pageErrors).toEqual([]);
});

test('rich editor keeps focus while typing', async ({ page }) => {
	await page.goto('/test-editor');

	const editor = page.locator('.ProseMirror').first();
	const marker = 'ZXQ42';

	await expect(editor).toBeVisible();
	await editor.click();
	await page.keyboard.type(marker);

	await expect(editor).toContainText(marker);
	await expect.poll(() => editor.evaluate((node) => node === document.activeElement)).toBe(true);
});

test('recent comments page renders without runtime errors', async ({ page }) => {
	const pageErrors: string[] = [];

	page.on('pageerror', (error) => {
		pageErrors.push(String(error));
	});

	await page.goto('/comments');
	await expect(page.getByRole('heading', { name: 'Recent comments' })).toBeVisible();
	await expect(page.getByText('NIP-22', { exact: true })).toBeVisible();
	await page.waitForTimeout(1000);

	expect(pageErrors).toEqual([]);
});
