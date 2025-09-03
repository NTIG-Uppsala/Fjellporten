from unittest import TestCase, main
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from os import path, getcwd


class TestBasicInfo(TestCase):

    # settings for how tests are run
    doNotCloseBrowser = False  # if true the browser stays open after tests are done
    hideWindow = True  # shows browser while tests are running

    # setUpClass runs BEFORE FIRST test
    @classmethod
    def setUpClass(cls):
        chr_options = Options()

        if cls.doNotCloseBrowser:
            chr_options.add_experimental_option("detach", True)

        if cls.hideWindow:
            chr_options.add_argument("--headless")

        cls.browser = webdriver.Chrome(options=chr_options)

    # tearDownClass runs AFTER LAST test
    @classmethod
    def tearDownClass(cls):
        pass  # does nothing

    # setUp runs BEFORE EACH test
    def setUp(self):
        pass  # does nothing

    # tearDown runs AFTER EACH test
    def tearDown(self):
        self.browser.get(
            "about:blank"
        )  # go to blank page to avoid influence from prior tests

    # TESTS START HERE
    def testCompanyName(self):
        self.browser.get(path.join(getcwd(), "index.html"))
        self.assertIn("Fjellporten biluthyrning", self.browser.page_source)

    def testPhoneNumber(self):
        self.browser.get(path.join(getcwd(), "index.html"))
        self.assertIn("555-357 11 13", self.browser.page_source)

    def testEmail(self):
        self.browser.get(path.join(getcwd(), "index.html"))
        self.assertIn("notreal@fjellporten.se", self.browser.page_source)

    def testAddress(self):
        self.browser.get(path.join(getcwd(), "index.html"))
        self.assertIn("Kurravaaravägen 4, 98137 Kiruna", self.browser.page_source)

    def testOpeningHours(self):
        self.browser.get(path.join(getcwd(), "index.html"))
        body = self.browser.find_element(By.TAG_NAME, "body")

        for text in (
            "Måndag: 10-22",
            "Tisdag: 10-22",
            "Onsdag: 10-24",
            "Torsdag: 10-22",
            "Fredag: 10-03",
            "Lördag: 12-04",
            "Söndag: 12-23",
        ):
            self.assertIn(text, body.text)


class TestMainPage(TestCase):

    # settings for how tests are run
    doNotCloseBrowser = False  # if true the browser stays open after tests are done
    hideWindow = True  # shows browser while tests are running

    # setUpClass runs BEFORE FIRST test
    @classmethod
    def setUpClass(cls):
        chr_options = Options()

        if cls.doNotCloseBrowser:
            chr_options.add_experimental_option("detach", True)

        if cls.hideWindow:
            chr_options.add_argument("--headless")

        cls.browser = webdriver.Chrome(options=chr_options)

    # tearDownClass runs AFTER LAST test
    @classmethod
    def tearDownClass(cls):
        pass  # does nothing

    # setUp runs BEFORE EACH test
    def setUp(self):
        pass  # does nothing

    # tearDown runs AFTER EACH test
    def tearDown(self):
        self.browser.get(
            "about:blank"
        )  # go to blank page to avoid influence from prior tests

    # TESTS START HERE
    def testCategoryList(self):
        self.browser.get(path.join(getcwd(), "index.html"))
        content = self.browser.find_element(By.ID, "content-container")
        self.assertIn("liten bil", content.text.lower())
        self.assertIn("stor bil", content.text.lower())
        self.assertIn("husbil", content.text.lower())

    def testProducts(self):
        self.browser.get(path.join(getcwd(), "index.html"))
        card = self.browser.find_element(By.CLASS_NAME, "category-card")
        card.click()
        self.assertIn("Kia Picanto", self.browser.page_source)
        self.assertIn("Audi A4 Avant", self.browser.page_source)
        self.assertIn("Adria Coral XL", self.browser.page_source)


# this bit is here so that the tests are run when the file is run as a normal python-program
if __name__ == "__main__":
    main(verbosity=2)
