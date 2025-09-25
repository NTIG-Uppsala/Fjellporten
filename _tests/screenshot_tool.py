import os
import re
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

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

def take_Screenshot(url, resolution):
    width, height = resolution 
    driver.set_window_size(width, height)
    driver.get(url)
    time.sleep(1)

    page_name = url.split("/")[-1].split("?")[0].replace(".html", "")
    car_type = re.search(r"car_type=([\w_]+)", url)
    car_type_str = f"_{car_type.group(1)}" if car_type else ""

    filename = f"screenshot_{page_name}{car_type_str}_{width}x{height}.png"
    filepath = os.path.join(screenshot_dir, filename)

    driver.save_screenshot(filepath)
    print(f"Saved {filepath}")

for url in urls:
    for resolution in resolutions:
        take_Screenshot(url, resolution)

driver.quit()