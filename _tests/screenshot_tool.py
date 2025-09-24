import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import re

def screenshot_Tool():

    screenshot_Counter = 1

    options = Options()
    # options.add_argument()

    driver = webdriver.Chrome(options=options)

    driver.get("http://localhost:8000/products.html")

    # Directory where screenshots are saved
    screenshot_dir = "_screenshots"

    # Make sure directory exists
    os.makedirs(screenshot_dir, exist_ok=True)

    # Pattern to find existing screenshots like screenshot_1.png
    pattern = re.compile(r'screenshot_(\d+)\.png')

    # Get all existing screenshot files and extract numbers
    existing_files = os.listdir(screenshot_dir)
    numbers = [int(match.group(1)) for f in existing_files if (match := pattern.match(f))]

    # Start numbering after the max existing number, or 1 if none
    screenshot_Counter = max(numbers) + 1 if numbers else 1

    def take_Screenshot():
        global screenshot_Counter
        filename = f"screenshot_{screenshot_Counter}.png"
        filepath = os.path.join(screenshot_dir, filename)
        driver.save_screenshot(filepath)
        print(f"Saved {filepath}")
        screenshot_Counter += 1

    take_Screenshot()

    driver.quit()

