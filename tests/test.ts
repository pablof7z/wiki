import { expect, test } from '@playwright/test';

test('landing page renders without runtime errors', async ({ page }) => {
	const pageErrors: string[] = [];

	page.on('pageerror', (error) => {
		pageErrors.push(String(error));
	});

	await page.goto('/');
	await expect(page.getByText('Read. Write. Disagree.')).toBeVisible();
	await expect(page.getByText('Wiki cache sync')).toBeVisible();
	await page.waitForTimeout(1000);

	expect(pageErrors).toEqual([]);
});

test('new page renders the editor without runtime errors', async ({ page }) => {
	const pageErrors: string[] = [];

	page.on('pageerror', (error) => {
		pageErrors.push(String(error));
	});

	await page.goto('/new');
	await expect(page.getByRole('textbox', { name: 'Title' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Save draft' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Publish' })).toBeVisible();
	await page.waitForTimeout(1000);

	expect(pageErrors).toEqual([]);
});

test('draft manager renders the signed-out state without runtime errors', async ({ page }) => {
	const pageErrors: string[] = [];

	page.on('pageerror', (error) => {
		pageErrors.push(String(error));
	});

	await page.goto('/drafts');
	await expect(page.getByRole('heading', { name: 'Draft Manager' })).toBeVisible();
	await expect(page.getByText('Sign in to view drafts')).toBeVisible();
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
	await expect(page.getByText(/shown$/)).toBeVisible();
	await page.waitForTimeout(1000);

	expect(pageErrors).toEqual([]);
});
