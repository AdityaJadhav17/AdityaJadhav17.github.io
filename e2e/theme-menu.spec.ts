import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const trigger = (page: Page) => page.getByRole('button', { name: /^theme/i })
const item = (page: Page, name: string) => page.getByRole('menuitemradio', { name })

test('each choice applies at once and survives a reload', async ({ page }) => {
  await page.goto('/')
  const html = page.locator('html')
  for (const [choice, dark] of [['Dark', true], ['Light', false], ['System', false]] as const) {
    await expect(trigger(page)).toHaveAccessibleName(/^Theme: /)
    await trigger(page).click()
    await item(page, choice).click()
    await expect(html).toHaveAttribute('data-theme-pref', choice.toLowerCase())
    if (dark) await expect(html).toHaveClass(/dark/)
    else await expect(html).not.toHaveClass(/dark/)
    await expect(trigger(page)).toHaveAccessibleName(/^Theme: /)
    await page.reload()
    await expect(html).toHaveAttribute('data-theme-pref', choice.toLowerCase())
    if (dark) await expect(html).toHaveClass(/dark/)
    else await expect(html).not.toHaveClass(/dark/)
    // The label settles in a mount effect: the button is live once it says so.
    await expect(trigger(page)).toHaveAccessibleName(/^Theme: /)
    await trigger(page).click()
    await expect(item(page, choice)).toBeChecked()
    await expect(item(page, choice)).toBeFocused() // the mount effect has run
    await page.keyboard.press('Escape')
    await expect(page.getByRole('menu')).toBeHidden()
  }
})

test('System follows the OS scheme live, and a forced theme does not', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  const html = page.locator('html')
  await expect(trigger(page)).toHaveAccessibleName('Theme: System (light)')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(html).toHaveClass(/dark/)
  await expect(trigger(page)).toHaveAccessibleName('Theme: System (dark)')
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(html).not.toHaveClass(/dark/)

  await trigger(page).click()
  await item(page, 'Light').click()
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(trigger(page)).toHaveAccessibleName('Theme: Light')
  await expect(html).not.toHaveClass(/dark/)
})

test('keyboard: Enter opens, ArrowDown and Enter select, focus returns', async ({ page }, ti) => {
  test.skip(ti.project.name === 'iphone', 'no hardware keyboard')
  await page.goto('/')
  await trigger(page).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('menu')).toBeVisible()
  // Entry focus lands on the active choice (System); wrap down to Light, then Dark.
  await expect(item(page, 'System')).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await expect(item(page, 'Dark')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.getByRole('menu')).toBeHidden()
  await expect(trigger(page)).toBeFocused()
})

// Hold the app bundle back so only the inline pre-paint script and the CSS
// have run: the icon must already be right, not swapped in by an effect.
for (const [stored, shown, hidden] of [['dark', 'moon', 'sun'], ['light', 'sun', 'moon']] as const) {
  test(`first paint shows the ${shown} for a stored ${stored} theme`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem('theme', t), stored)
    await page.route('**/assets/index-*.js', (route) => route.abort())
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const display = (name: string) =>
      page
        .locator(`button[aria-haspopup="menu"] svg.lucide-${name}`)
        .evaluate((el) => getComputedStyle(el).display)
    expect(await display(shown)).not.toBe('none')
    expect(await display(hidden)).toBe('none')
    await expect(page.locator('html')).toHaveAttribute('data-theme-pref', stored)
  })
}

test('the first click opens the menu even when its chunk is slow', async ({ page }, ti) => {
  test.skip(ti.project.name !== 'chromium', 'Chromium only')
  await page.route('**/assets/ThemeMenuContent-*.js', async (route) => {
    await new Promise((r) => setTimeout(r, 1500))
    await route.continue()
  })
  await page.goto('/')
  await trigger(page).click()
  await expect(page.getByRole('menu')).toBeVisible()
  await item(page, 'Dark').click()
  await expect(page.locator('html')).toHaveClass(/dark/)
})

for (const colorScheme of ['light', 'dark'] as const) {
  test(`axe: no violations with the menu open (${colorScheme})`, async ({ browser }, ti) => {
    test.skip(ti.project.name === 'iphone', 'axe runs once, on Chromium')
    const context = await browser.newContext({ colorScheme })
    const page = await context.newPage()
    await page.goto('/')
    await trigger(page).click()
    await expect(page.getByRole('menu')).toBeVisible()
    await page.waitForTimeout(300) // let the 150 ms entrance finish
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze()
    expect(violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([])
    await context.close()
  })
}
