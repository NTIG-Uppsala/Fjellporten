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

# this bit is here so that the tests are run when the file is run as a normal python-program
if __name__ == "__main__":
    main(verbosity=2)
