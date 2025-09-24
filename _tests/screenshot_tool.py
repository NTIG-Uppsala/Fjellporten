import os
import re
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


screenshot_Counter = 1

options = Options()
# options.add_argument()

resolutions = [
    (2560, 1440),
    (1920, 1080),
    (900, 650),
    (375, 812),
]

urls = [
    "http://localhost:8000/products.html?car_type=small_car",
    "http://localhost:8000/products.html?car_type=big_car",
    "http://localhost:8000/products.html?car_type=caravan",
    "http://localhost:8000/index.html",
    "http://localhost:8000/staff.html",
]

driver = webdriver.Chrome(options=options)

# Directory where screenshots are saved
screenshot_dir = "screenshots"
os.makedirs(screenshot_dir, exist_ok=True)

# Pattern to find existing screenshots like screenshot_1.png
pattern = re.compile(r'screenshot_(\d+)\.png')

# Get all existing screenshot files and extract numbers
existing_files = os.listdir(screenshot_dir)
numbers = [int(match.group(1)) for f in existing_files if (match := pattern.match(f))]
screenshot_Counter = max(numbers) + 1 if numbers else 1

def take_Screenshot(url, resolution):
    global screenshot_Counter
    width, height = resolution 
    driver.set_window_size(width, height)
    driver.get(url)

    try:
        WebDriverWait(driver, 1).until(
            EC.visibility_of_element_located((By.ID, "carTable"))
        )
    except:
        print("Table not found or not visible after waiting")

    # Clean filename parts
    page_name = url.split("/")[-1].split("?")[0].replace(".html", "")
    car_type = re.search(r"car_type=([\w_]+)", url)
    car_type_str = f"_{car_type.group(1)}" if car_type else ""

    filename = f"screenshot_{screenshot_Counter}_{page_name}{car_type_str}_{width}x{height}.png"
    filepath = os.path.join(screenshot_dir, filename)

    driver.save_screenshot(filepath)
    print(f"Saved {filepath}")
    screenshot_Counter += 1

for url in urls:
    for resolution in resolutions:
        take_Screenshot(url, resolution)

driver.quit()
