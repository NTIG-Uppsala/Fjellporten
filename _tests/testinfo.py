from unittest import TestCase, main
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from os import path, getcwd



class TestHemsida(TestCase):

    # inställningar för hur testerna körs
    stangintebrowsern = False  # om True så hålls webbläsaren öppen efter testerna är klara, annars stängs den
    gomfonstret = True  # visar webbläsaren medan testerna körs

    # setUpClass körs INNAN FÖRSTA testet
    @classmethod
    def setUpClass(cls):
        chr_options = Options()

        if cls.stangintebrowsern:
            chr_options.add_experimental_option("detach", True)

        if cls.gomfonstret:
            chr_options.add_argument("--headless")

        cls.browser = webdriver.Chrome(options=chr_options)

    # tearDownClass körs EFTER SISTA testet
    @classmethod
    def tearDownClass(cls):
        pass  # gör ingenting

    # setUp körs INNAN VARJE TEST
    def setUp(self):
        pass  # gör ingenting

    # tearDown körs EFTER VARJE TEST
    def tearDown(self):
        self.browser.get('about:blank')  # gå till en tom sida för att undvika att tidigare test påverkar senare


    # HÄR BÖRJAR TESTERNA
    def testCompanyName(self):
        self.browser.get(path.join(getcwd(), 'index.html'))
        self.assertIn("Fjellporten biluthyrning", self.browser.page_source)

    def testPhoneNumber(self):
        self.browser.get(path.join(getcwd(), 'index.html'))
        self.assertIn("555-3571113", self.browser.page_source)
    
    def testEmail(self):
        self.browser.get(path.join(getcwd(), 'index.html'))
        self.assertIn("notreal@fjellporten.se", self.browser.page_source)

    def testAddress(self):
        self.browser.get(path.join(getcwd(), 'index.html'))
        self.assertIn("Kurravaaravägen 4, 98137 Kiruna", self.browser.page_source)

    





# denna bit finns här så att testerna körs om filen körs som vanligt python-program
if __name__ == '__main__':
    main(verbosity=2)
