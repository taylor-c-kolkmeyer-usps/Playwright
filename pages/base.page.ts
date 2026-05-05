import { expect, type Locator, type Page } from '@playwright/test';

export class BasePage {
	protected readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async goto(path: string): Promise<void> {
		await this.page.goto(path);
	}

	locator(selector: string): Locator {
		return this.page.locator(selector);
	}

	async click(target: string | Locator): Promise<void> {
		const element = this.asLocator(target);
		await element.click();
	}

	async clickIfVisible(target: string | Locator): Promise<boolean> {
		const element = this.asLocator(target);
		if (await element.isVisible()) {
			await element.click();
			return true;
		}
		return false;
	}

	async setCheckbox(target: string | Locator, checked: boolean): Promise<boolean> {
		const element = this.asLocator(target);
		const current = await element.isChecked();
		if (current !== checked) {
			await element.setChecked(checked);
			return true;
		}
		return false;
	}

	async fill(target: string | Locator, value: string): Promise<void> {
		await this.asLocator(target).fill(value);
	}

	async press(target: string | Locator, key: string): Promise<void> {
		await this.asLocator(target).press(key);
	}

	async selectByLabel(target: string | Locator, label: string): Promise<void> {
		await this.asLocator(target).selectOption({ label });
	}

	async selectByValue(target: string | Locator, value: string): Promise<void> {
		await this.asLocator(target).selectOption({ value });
	}

	async text(target: string | Locator): Promise<string> {
		const content = await this.asLocator(target).textContent();
		return content?.trim() ?? '';
	}

	async inputValue(target: string | Locator): Promise<string> {
		return this.asLocator(target).inputValue();
	}

	async attribute(target: string | Locator, name: string): Promise<string | null> {
		return this.asLocator(target).getAttribute(name);
	}

	async allTexts(target: string | Locator): Promise<string[]> {
		const values = await this.asLocator(target).allTextContents();
		return values.map((value) => value.trim());
	}

	async allAttributes(target: string | Locator, name: string): Promise<Array<string | null>> {
		const elements = await this.asLocator(target).all();
		return Promise.all(elements.map(async (element) => element.getAttribute(name)));
	}

	async waitVisible(target: string | Locator): Promise<void> {
		await this.asLocator(target).waitFor({ state: 'visible' });
	}

	async waitHidden(target: string | Locator): Promise<void> {
		await this.asLocator(target).waitFor({ state: 'hidden' });
	}

	async isVisible(target: string | Locator): Promise<boolean> {
		return this.asLocator(target).isVisible();
	}

	async isChecked(target: string | Locator): Promise<boolean> {
		return this.asLocator(target).isChecked();
	}

	async expectVisible(target: string | Locator): Promise<void> {
		await expect(this.asLocator(target)).toBeVisible();
	}

	async expectHidden(target: string | Locator): Promise<void> {
		await expect(this.asLocator(target)).toBeHidden();
	}

	async acceptDialogOnce(): Promise<void> {
		this.page.once('dialog', async (dialog) => {
			await dialog.accept();
		});
	}

	async dismissDialogOnce(): Promise<void> {
		this.page.once('dialog', async (dialog) => {
			await dialog.dismiss();
		});
	}

	async waitForNetworkIdle(): Promise<void> {
		await this.page.waitForLoadState('networkidle');
	}

	async scrollIntoView(target: string | Locator): Promise<void> {
		await this.asLocator(target).scrollIntoViewIfNeeded();
	}

	private asLocator(target: string | Locator): Locator {
		return typeof target === 'string' ? this.page.locator(target) : target;
	}
}
