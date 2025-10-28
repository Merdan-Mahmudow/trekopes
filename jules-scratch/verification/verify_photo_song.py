from playwright.sync_api import sync_playwright, Page, expect

def verify_photo_song_modal(page: Page):
    """
    This script verifies that the photo song modal opens correctly.
    """
    # 1. Navigate to the generate page.
    page.goto("http://localhost:5173/generate")

    # 2. Find the heading and click it.
    heading = page.get_by_role('heading', name='Песня по фото')
    heading.click()

    # 3. Wait for the modal to appear and assert its title.
    modal_title = page.get_by_text("Музыка по фото")
    expect(modal_title).to_be_visible()

    # 4. Take a screenshot.
    page.screenshot(path="jules-scratch/verification/photo-song-modal.png")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    verify_photo_song_modal(page)
    browser.close()
