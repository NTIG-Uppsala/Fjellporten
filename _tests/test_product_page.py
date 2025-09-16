from unittest import TestCase, main
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

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
        self.browser.delete_all_cookies()  # clear cookies between test
        self.browser.get("about:blank")  # go to blank page to avoid influence from prior tests

    # tearDown runs AFTER EACH test
    def tearDown(self):
        pass  # does nothing

    # TESTS START HERE
    def testVATButton(self):
        self.browser.get("http://localhost:8000/small_cars.html")
        self.assertIn("450", self.browser.find_element(By.ID, "carTable").text)
        self.assertNotIn("416", self.browser.find_element(By.ID, "carTable").text)
        button = self.browser.find_element(By.ID, "VATButton")
        button.click()
        self.assertIn("416", self.browser.find_element(By.ID, "carTable").text)

    def testVATCookie(self):
        self.browser.get("http://localhost:8000/small_cars.html")
        self.assertIn("450", self.browser.find_element(By.ID, "carTable").text)
        self.assertNotIn("416", self.browser.find_element(By.ID, "carTable").text)
        button = self.browser.find_element(By.ID, "VATButton")
        button.click()
        self.assertIn("416", self.browser.find_element(By.ID, "carTable").text)
        self.browser.refresh()
        self.assertIn("416", self.browser.find_element(By.ID, "carTable").text)

    def testSortingDefault(self):
        self.browser.get("http://localhost:8000/big_cars.html")
        rows = self.browser.find_elements(By.CSS_SELECTOR, "#carTable tr")
        firstCar = rows[0].find_elements(By.TAG_NAME, "td")[0]
        firstCarName = firstCar.text
        assert firstCarName == "Audi A4 Avant", f"Expected 'Audi A4 Avant' but got '{firstCarName}'"
        lastCar = rows[-1].find_elements(By.TAG_NAME, "td")[0]
        lastCarName = lastCar.text
        assert lastCarName == "Volvo XC60 D4 AWD", f"Expected 'Volvo XC60 D4 AWD' but got '{lastCarName}'"

    def testSortingByPrice(self):
        self.browser.get("http://localhost:8000/caravans.html")
        menu = self.browser.find_element(By.ID, "dropDownMenu")
        menu.click()

        self.browser.find_element(By.CSS_SELECTOR, "#dropDownMenu option[value='priceDesc']").click()
        rows = self.browser.find_elements(By.CSS_SELECTOR, "#carTable tr")
        firstPrice = rows[0].find_elements(By.TAG_NAME, "td")[1]
        self.assertEqual("2 400 kr/dag", firstPrice.text)
        lastPrice = rows[-1].find_elements(By.TAG_NAME, "td")[1]
        self.assertEqual("1 400 kr/dag", lastPrice.text)

        menu.click()
        self.browser.find_element(By.CSS_SELECTOR, "#dropDownMenu option[value='priceAsc']").click()
        rows = self.browser.find_elements(By.CSS_SELECTOR, "#carTable tr")
        firstPrice = rows[0].find_elements(By.TAG_NAME, "td")[1]
        self.assertEqual("1 400 kr/dag", firstPrice.text)
        lastPrice = rows[-1].find_elements(By.TAG_NAME, "td")[1]
        self.assertEqual("2 400 kr/dag", lastPrice.text)

    def testSortingByName(self):
        self.browser.get("http://localhost:8000/small_cars.html")
        menu = self.browser.find_element(By.ID, "dropDownMenu")
        menu.click()

        self.browser.find_element(By.CSS_SELECTOR, "#dropDownMenu option[value='nameDesc']").click()
        rows = self.browser.find_elements(By.CSS_SELECTOR, "#carTable tr")
        firstCar = rows[0].find_elements(By.TAG_NAME, "td")[0]
        self.assertEqual("Volkswagen Polo TSI", firstCar.text)
        lastCar = rows[-1].find_elements(By.TAG_NAME, "td")[0]
        self.assertEqual("Ford Fiesta EcoBoost", lastCar.text)

        menu.click()
        self.browser.find_element(By.CSS_SELECTOR, "#dropDownMenu option[value='nameAsc']").click()
        rows = self.browser.find_elements(By.CSS_SELECTOR, "#carTable tr")
        firstCar = rows[0].find_elements(By.TAG_NAME, "td")[0]
        self.assertEqual("Ford Fiesta EcoBoost", firstCar.text)
        lastCar = rows[-1].find_elements(By.TAG_NAME, "td")[0]
        self.assertEqual("Volkswagen Polo TSI", lastCar.text)

# this bit is here so that the tests are run when the file is run as a normal python-program
if __name__ == "__main__":
    main(verbosity=2)
