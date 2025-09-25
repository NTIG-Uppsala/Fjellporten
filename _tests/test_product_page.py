from unittest import TestCase, main
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time

# settings for how tests are run
doNotCloseBrowser = False  # if true the browser stays open after tests are done
hideWindow = not (doNotCloseBrowser)  # shows browser while tests are running


class TestProductPage(TestCase):

    # setUpClass runs BEFORE FIRST test
    @classmethod
    def setUpClass(cls):
        chr_options = Options()

        if doNotCloseBrowser:
            chr_options.add_experimental_option("detach", True)

        if hideWindow:
            chr_options.add_argument("--headless")

        cls.browser = webdriver.Chrome(options=chr_options)

    # tearDownClass runs AFTER LAST test
    @classmethod
    def tearDownClass(cls):
        pass  # does nothing

    # setUp runs BEFORE EACH test
    def setUp(self): 
        self.browser.get("http://localhost:8000/products.html") 
        self.browser.execute_script("window.localStorage.clear();")  # clear cookies between test
        self.browser.get("about:blank")  # go to blank page to avoid influence from prior tests

    # tearDown runs AFTER EACH test
    def tearDown(self):
        pass  # does nothing

    # TESTS START HERE
    def testVATButton(self):
        self.browser.get("http://localhost:8000/products.html?car_type=small_car")
        time.sleep(1)
        self.assertIn("450 kr/dag", self.browser.find_element(By.ID, "carTable").text)
        self.assertNotIn("416 kr/dag", self.browser.find_element(By.ID, "carTable").text)
        button = self.browser.find_element(By.ID, "VATButton")
        button.click()
        self.assertIn("416 kr/dag", self.browser.find_element(By.ID, "carTable").text)

    def testVATLocalStorage(self):
        self.browser.get("http://localhost:8000/products.html?car_type=small_car")
        time.sleep(1)
        self.assertIn("450 kr/dag", self.browser.find_element(By.ID, "carTable").text)
        self.assertNotIn("416 kr/dag", self.browser.find_element(By.ID, "carTable").text)
        button = self.browser.find_element(By.ID, "VATButton")
        button.click()
        self.assertIn("416 kr/dag", self.browser.find_element(By.ID, "carTable").text)
        self.browser.refresh()
        time.sleep(1)
        self.assertIn("416 kr/dag", self.browser.find_element(By.ID, "carTable").text)

    def testSortingDefault(self):
        self.browser.get("http://localhost:8000/products.html?car_type=big_car")
        time.sleep(1)
        rows = self.browser.find_elements(By.CSS_SELECTOR, "#carTable tr")
        firstCar = rows[1].find_elements(By.TAG_NAME, "td")[0]
        firstCarName = firstCar.text
        self.assertEqual("Audi A4 Avant", firstCarName)
        lastCar = rows[-1].find_elements(By.TAG_NAME, "td")[0]
        lastCarName = lastCar.text
        self.assertEqual("Volvo XC60 D4 AWD", lastCarName)

    def testSortingByPrice(self):
        self.browser.get("http://localhost:8000/products.html?car_type=caravan")
        time.sleep(1)
        menu = self.browser.find_element(By.ID, "dropDownMenuSort")
        
        menu.click()
        self.browser.find_element(By.CSS_SELECTOR, "#dropDownMenuSort option[value='priceDesc']").click()
        rows = self.browser.find_elements(By.CSS_SELECTOR, "#carTable tr")
        firstPrice = rows[1].find_elements(By.TAG_NAME, "td")[2]
        self.assertEqual("2 400 kr/dag", firstPrice.text)
        lastPrice = rows[-1].find_elements(By.TAG_NAME, "td")[2]
        self.assertEqual("321 kr/dag", lastPrice.text)

        menu.click()
        self.browser.find_element(By.CSS_SELECTOR, "#dropDownMenuSort option[value='priceAsc']").click()
        rows = self.browser.find_elements(By.CSS_SELECTOR, "#carTable tr")
        firstPrice = rows[1].find_elements(By.TAG_NAME, "td")[2]
        self.assertEqual("321 kr/dag", firstPrice.text)
        lastPrice = rows[-1].find_elements(By.TAG_NAME, "td")[2]
        self.assertEqual("2 400 kr/dag", lastPrice.text)

    def testSortingByName(self):
        self.browser.get("http://localhost:8000/products.html?car_type=small_car")
        time.sleep(1)
        menu = self.browser.find_element(By.ID, "dropDownMenuSort")
        
        menu.click()
        self.browser.find_element(By.CSS_SELECTOR, "#dropDownMenuSort option[value='nameDesc']").click()
        rows = self.browser.find_elements(By.CSS_SELECTOR, "#carTable tr")
        firstCar = rows[1].find_elements(By.TAG_NAME, "td")[0]
        self.assertEqual("öäå", firstCar.text)
        lastCar = rows[-1].find_elements(By.TAG_NAME, "td")[0]
        self.assertEqual("Ford Fiesta EcoBoost", lastCar.text)

        menu.click()
        self.browser.find_element(By.CSS_SELECTOR, "#dropDownMenuSort option[value='nameAsc']").click()
        rows = self.browser.find_elements(By.CSS_SELECTOR, "#carTable tr")
        firstCar = rows[1].find_elements(By.TAG_NAME, "td")[0]
        self.assertEqual("Ford Fiesta EcoBoost", firstCar.text)
        lastCar = rows[-1].find_elements(By.TAG_NAME, "td")[0]
        self.assertEqual("öäå", lastCar.text)
        
    def testChangingCarType(self):
        self.browser.get("http://localhost:8000/products.html?car_type=small_car")
        time.sleep(1)
        self.assertIn("450 kr/dag", self.browser.find_element(By.ID, "carTable").text)
        self.assertNotIn("1 050 kr/dag", self.browser.find_element(By.ID, "carTable").text)
        menu = self.browser.find_element(By.ID, "dropDownMenuCars")
        
        menu.click()
        self.browser.find_element(By.CSS_SELECTOR, "#dropDownMenuCars option[value='products.html?car_type=big_car']").click()
        time.sleep(1)
        self.assertIn("1 050 kr/dag", self.browser.find_element(By.ID, "carTable").text)
        self.assertNotIn("450 kr/dag", self.browser.find_element(By.ID, "carTable").text)
        
    def testCheckCargo(self):
        self.browser.get("http://localhost:8000/products.html?car_type=small_car")
        time.sleep(1)
        self.assertIn("290L", self.browser.find_element(By.ID, "carTable").text)
    
    def testCheckBeds(self):
        self.browser.get("http://localhost:8000/products.html?car_type=caravan")
        time.sleep(1)
        self.assertIn("4st", self.browser.find_element(By.ID, "carTable").text)
        
    def testSortingByCargo(self):
        self.browser.get("http://localhost:8000/products.html?car_type=small_car")
        time.sleep(1)
        menu = self.browser.find_element(By.ID, "dropDownMenuSort")
        
        menu.click()
        self.browser.find_element(By.CSS_SELECTOR, "#dropDownMenuSort option[value='cargo/bedsDesc']").click()
        rows = self.browser.find_elements(By.CSS_SELECTOR, "#carTable tr")
        firstCar = rows[1].find_elements(By.TAG_NAME, "td")[1]
        self.assertEqual("351L", firstCar.text)
        lastCar = rows[-1].find_elements(By.TAG_NAME, "td")[1]
        self.assertEqual("3L", lastCar.text)

        menu.click()
        self.browser.find_element(By.CSS_SELECTOR, "#dropDownMenuSort option[value='cargo/bedsAsc']").click()
        rows = self.browser.find_elements(By.CSS_SELECTOR, "#carTable tr")
        firstCar = rows[1].find_elements(By.TAG_NAME, "td")[1]
        self.assertEqual("3L", firstCar.text)
        lastCar = rows[-1].find_elements(By.TAG_NAME, "td")[1]
        self.assertEqual("351L", lastCar.text)
        
    def testSortingLocalStorage(self):
        self.browser.get("http://localhost:8000/products.html?car_type=small_car")
        time.sleep(1)
        menu = self.browser.find_element(By.ID, "dropDownMenuSort")
        
        menu.click()
        self.browser.find_element(By.CSS_SELECTOR, "#dropDownMenuSort option[value='cargo/bedsDesc']").click()
        
        rows = self.browser.find_elements(By.CSS_SELECTOR, "#carTable tr")
        firstCar = rows[1].find_elements(By.TAG_NAME, "td")[1]
        self.assertEqual("351L", firstCar.text)
        lastCar = rows[-1].find_elements(By.TAG_NAME, "td")[1]
        self.assertEqual("3L", lastCar.text)
        self.browser.refresh()
        time.sleep(1)
        
        rows = self.browser.find_elements(By.CSS_SELECTOR, "#carTable tr")
        firstCar = rows[1].find_elements(By.TAG_NAME, "td")[1]
        self.assertEqual("351L", firstCar.text)
        lastCar = rows[-1].find_elements(By.TAG_NAME, "td")[1]
        self.assertEqual("3L", lastCar.text)
        
    def testTableHeaderSort(self):
        self.browser.get("http://localhost:8000/products.html?car_type=caravan")
        time.sleep(1)
        
        headerRow = self.browser.find_element(By.ID, "headerRow")
        carCostHeader = headerRow.find_elements(By.TAG_NAME, "th")[2]
        carCostHeader.click()
        
        rows = self.browser.find_elements(By.CSS_SELECTOR, "#carTable tr")
        firstPrice = rows[1].find_elements(By.TAG_NAME, "td")[2]
        self.assertEqual("321 kr/dag", firstPrice.text)
        lastPrice = rows[-1].find_elements(By.TAG_NAME, "td")[2]
        self.assertEqual("2 400 kr/dag", lastPrice.text)
        headerRow = self.browser.find_element(By.ID, "headerRow")
        carCostHeader = headerRow.find_elements(By.TAG_NAME, "th")[2]
        carCostHeader.click()
        
        rows = self.browser.find_elements(By.CSS_SELECTOR, "#carTable tr")
        firstPrice = rows[1].find_elements(By.TAG_NAME, "td")[2]
        self.assertEqual("2 400 kr/dag", firstPrice.text)
        lastPrice = rows[-1].find_elements(By.TAG_NAME, "td")[2]
        self.assertEqual("321 kr/dag", lastPrice.text)
        

# this bit is here so that the tests are run when the file is run as a normal python-program
if __name__ == "__main__":
    main(verbosity=2)
