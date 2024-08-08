import { expect, test } from './base.js'

test('see PREreviews published in a year', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: 'PREreviews' }).click()

  await page.getByLabel('Year').selectOption('2024')

  await expect(page.getByRole('main')).toContainText('PREreviews in 2024')
})
