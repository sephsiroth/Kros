import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 720})
        await page.goto("http://localhost:4173")
        await page.wait_for_selector("text=PYROS")

        # Select Pyros god
        await page.click("text=PYROS")
        await page.wait_for_timeout(1000)

        # End turn 3 times to gain PA
        for _ in range(3):
            end_turn_btn = await page.query_selector("button:has-text('Fin du Tour')")
            if end_turn_btn:
                await end_turn_btn.click()
                await page.wait_for_timeout(2000)

        # Now click first card in hand
        cards = await page.query_selector_all(".kros-card")
        if cards:
            await cards[0].click()
            await page.wait_for_timeout(500)

            # Click highlight cell
            highlights = await page.query_selector_all(".kros-grid-cell-highlight")
            if highlights:
                await highlights[0].click()
                await page.wait_for_timeout(500)

        # Take screenshot showing creature on pedestal
        await page.screenshot(path="/home/jules/verification/mobs_board_3d.png")
        await browser.close()

asyncio.run(run())
