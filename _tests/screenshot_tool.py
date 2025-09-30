import os
import re
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

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

options = Options()
# options.add_argument()

driver = webdriver.Chrome(options=options)

# Directory where screenshots are saved
screenshotDir = "screenshots"
os.makedirs(screenshotDir, exist_ok=True)

def takeScreenshot(url, resolution):
    width, height = resolution 
    driver.set_window_size(width, height)
    driver.get(url)
    time.sleep(1)

    # Takes the page name from the url
    pageName = url.split("/")[-1].split("?")[0].replace(".html", "")
    # Searches the url for a "car_type" paramater and captures it's value
    carType = re.search(r"car_type=([\w_]+)", url)
    # Add "_car_type" if found in the URL, and nothing if "_car_type" isnt found in the URL
    carTypeStr = f"_{carType.group(1)}" if carType else ""

    # Puts the file name together
    fileName = f"screenshot_{pageName}{carTypeStr}_{width}x{height}.png"
    # Puts the directory and filename in the same variable
    filePath = os.path.join(screenshotDir, fileName)

    # Creates and saves file in the screenshots directory  
    driver.save_screenshot(filePath)
    print(f"Saved {filePath}")

for url in urls:
    for resolution in resolutions:
        takeScreenshot(url, resolution)

driver.quit()