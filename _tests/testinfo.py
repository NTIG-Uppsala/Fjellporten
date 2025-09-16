from unittest import TestCase, main
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

# settings for how tests are run
doNotCloseBrowser = False  # if true the browser stays open after tests are done
hideWindow = not (doNotCloseBrowser)  # shows browser while tests are running


class TestBasicInfo(TestCase):

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
    def testCompanyName(self):
        self.browser.get("http://localhost:8000/")
        self.assertIn("Fjellporten biluthyrning", self.browser.find_element(By.TAG_NAME, "body").text)

    def testPhoneNumber(self):
        self.browser.get("http://localhost:8000/")
        self.assertIn("555-357 11 13", self.browser.find_element(By.TAG_NAME, "footer").text)

    def testEmail(self):
        self.browser.get("http://localhost:8000/")
        self.assertIn("notreal@fjellporten.se", self.browser.find_element(By.TAG_NAME, "footer").text)

    def testAddress(self):
        self.browser.get("http://localhost:8000/")
        self.assertIn("Kurravaaravägen 4, 98137 Kiruna", self.browser.find_element(By.TAG_NAME, "footer").text)

    def testOpeningHours(self):
        self.browser.get("http://localhost:8000/")
        self.assertIn("Onsdag: 10-24", self.browser.find_element(By.TAG_NAME, "footer").text)


class TestMainPage(TestCase):

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
    def testCategoryList(self):
        self.browser.get("http://localhost:8000/")
        content = self.browser.find_element(By.ID, "contentContainer")
        self.assertIn("små bilar", content.text.lower())
        self.assertIn("stora bilar", content.text.lower())
        self.assertIn("husbilar", content.text.lower())

    def testSmallCars(self):
        self.browser.get("http://localhost:8000/")
        card = self.browser.find_elements(By.CLASS_NAME, "categoryCard")[0]
        card.click()
        self.assertIn("Kia Picanto", self.browser.find_element(By.ID, "carTable").text)
        self.assertNotIn("Audi A4 Avant", self.browser.find_element(By.ID, "carTable").text)

    def testLargeCars(self):
        self.browser.get("http://localhost:8000/")
        card = self.browser.find_elements(By.CLASS_NAME, "categoryCard")[1]
        card.click()
        self.assertIn("Audi A4 Avant", self.browser.find_element(By.ID, "carTable").text)
        self.assertNotIn("Kia Picanto", self.browser.find_element(By.ID, "carTable").text)

    def testCamperVans(self):
        self.browser.get("http://localhost:8000/")
        card = self.browser.find_elements(By.CLASS_NAME, "categoryCard")[2]
        card.click()
        self.assertIn("Adria Coral XL", self.browser.find_element(By.ID, "carTable").text)
        self.assertNotIn("Audi A4 Avant", self.browser.find_element(By.ID, "carTable").text)

    def testStaffPictures(self):
        self.browser.get("http://localhost:8000/")
        self.browser.find_element(By.CSS_SELECTOR, '[href="personal.html"]').click()
        pictures = self.browser.find_elements(By.CLASS_NAME, "staffPicture")
        self.assertEqual(len(pictures), 3)
        content = self.browser.find_element(By.ID, "contentContainer")
        self.assertIn("Anna Pettersson", content.text)
        self.assertIn("Fredrik Örtqvist", content.text)
        self.assertIn("Peter Johansson", content.text)


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
        assert firstPrice.text == "2 400 kr/dag", f"Expected '2 400 kr/dag' but got '{firstPrice.text}'"
        lastPrice = rows[-1].find_elements(By.TAG_NAME, "td")[1]
        assert lastPrice.text == "1 400 kr/dag", f"Expected '1 400 kr/dag' but got '{lastPrice.text}'"

        menu.click()
        self.browser.find_element(By.CSS_SELECTOR, "#dropDownMenu option[value='priceAsc']").click()
        rows = self.browser.find_elements(By.CSS_SELECTOR, "#carTable tr")
        firstPrice = rows[0].find_elements(By.TAG_NAME, "td")[1]
        assert firstPrice.text == "1 400 kr/dag", f"Expected '1 400 kr/dag' but got '{firstPrice.text}'"
        lastPrice = rows[-1].find_elements(By.TAG_NAME, "td")[1]
        assert lastPrice.text == "2 400 kr/dag", f"Expected '2 400 kr/dag' but got '{lastPrice.text}'"

    def testSortingByName(self):
        self.browser.get("http://localhost:8000/small_cars.html")
        menu = self.browser.find_element(By.ID, "dropDownMenu")
        menu.click()

        self.browser.find_element(By.CSS_SELECTOR, "#dropDownMenu option[value='nameDesc']").click()
        rows = self.browser.find_elements(By.CSS_SELECTOR, "#carTable tr")
        firstCar = rows[0].find_elements(By.TAG_NAME, "td")[0]
        assert firstCar.text == "Volkswagen Polo TSI", f"Expected 'Volkswagen Polo TSI' but got '{firstCar.text}'"
        lastCar = rows[-1].find_elements(By.TAG_NAME, "td")[0]
        assert lastCar.text == "Ford Fiesta EcoBoost", f"Expected 'Ford Fiesta EcoBoost' but got '{lastCar.text}'"

        menu.click()
        self.browser.find_element(By.CSS_SELECTOR, "#dropDownMenu option[value='nameAsc']").click()
        rows = self.browser.find_elements(By.CSS_SELECTOR, "#carTable tr")
        firstCar = rows[0].find_elements(By.TAG_NAME, "td")[0]
        assert firstCar.text == "Ford Fiesta EcoBoost", f"Expected 'Ford Fiesta EcoBoost' but got '{firstCar.text}'"
        lastCar = rows[-1].find_elements(By.TAG_NAME, "td")[0]
        assert lastCar.text == "Volkswagen Polo TSI", f"Expected 'Volkswagen Polo TSI' but got '{lastCar.text}'"


# this bit is here so that the tests are run when the file is run as a normal python-program
if __name__ == "__main__":
    main(verbosity=2)
