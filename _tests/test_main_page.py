from unittest import TestCase, main
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time

# settings for how tests are run
doNotCloseBrowser = False  # if true the browser stays open after tests are done
hideWindow = not (doNotCloseBrowser)  # shows browser while tests are running


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
        time.sleep(1)
        self.assertIn("Kia Picanto", self.browser.find_element(By.ID, "carTable").text)
        self.assertNotIn("Audi A4 Avant", self.browser.find_element(By.ID, "carTable").text)

    def testLargeCars(self):
        self.browser.get("http://localhost:8000/")
        card = self.browser.find_elements(By.CLASS_NAME, "categoryCard")[1]
        card.click()
        time.sleep(1)
        self.assertIn("Audi A4 Avant", self.browser.find_element(By.ID, "carTable").text)
        self.assertNotIn("Kia Picanto", self.browser.find_element(By.ID, "carTable").text)

    def testCamperVans(self):
        self.browser.get("http://localhost:8000/")
        card = self.browser.find_elements(By.CLASS_NAME, "categoryCard")[2]
        card.click()
        time.sleep(1)
        self.assertIn("Adria Coral XL", self.browser.find_element(By.ID, "carTable").text)
        self.assertNotIn("Audi A4 Avant", self.browser.find_element(By.ID, "carTable").text)

    def testStaffPictures(self):
        self.browser.get("http://localhost:8000/")
        self.browser.find_element(By.CSS_SELECTOR, '[href="staff.html"]').click()
        pictures = self.browser.find_elements(By.CLASS_NAME, "staffPicture")
        self.assertEqual(len(pictures), 3)
        content = self.browser.find_element(By.ID, "contentContainer")
        self.assertIn("Anna Pettersson", content.text)
        self.assertIn("Fredrik Örtqvist", content.text)
        self.assertIn("Peter Johansson", content.text)

# this bit is here so that the tests are run when the file is run as a normal python-program
if __name__ == "__main__":
    main(verbosity=2)
