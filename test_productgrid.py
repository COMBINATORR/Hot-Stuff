from playwright.sync_api import sync_playwright

def verify_product_grid():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto('http://localhost:3000')
        page.wait_for_load_state('networkidle')

        # Find desktop quick view buttons
        quick_view_buttons = page.locator('text=БЫСТРЫЙ ПРОСМОТР')

        print(f"Found {quick_view_buttons.count()} Quick View buttons")
        if quick_view_buttons.count() > 0:
            print("Product Grid is rendering products.")
        else:
            print("WARNING: Product Grid is empty.")

        # Let's take a general screenshot anyway
        page.screenshot(path='home_page.png')

        browser.close()

if __name__ == '__main__':
    verify_product_grid()
