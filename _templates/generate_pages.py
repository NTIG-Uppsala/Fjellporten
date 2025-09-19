import os
import re

# List of language templates with their filename endings
languageTemplateList = [
    ["_templates/languages/swedish.txt", ""],
    ["_templates/languages/english.txt", "_english"],
    ["_templates/languages/english.txt", "_norwegian"]
] 

# List of page templates with their filename starts and if they're a product page or not
pageTemplateList = [
    ["_templates/pages/index.html", "index", False],
    ["_templates/pages/staff.html", "staff", False],
    ["_templates/pages/small_cars.html", "small_cars", True, "smallCars"],
    ["_templates/pages/big_cars.html", "big_cars", True, "bigCars"],
    ["_templates/pages/caravans.html", "caravans", True, "caravans"],
    ]

# List of module templates with their replace keywords and if they're specifically for product pages or not
moduleTemplateList = [
    ["_templates/modules/footer.html", "!!!FOOTER!!!", False],
    ["_templates/modules/car_table.html", "!!!CAR_TABLE!!!", True],
    ["_templates/modules/product_page_js.html", "!!!PRODUCT_PAGE_JS!!!", True],
]

# Creates a list where all the full pages will be placed until they get checked with the language templates
pageList = []
        
for pageTemplate in pageTemplateList:

    with open(pageTemplate[0], encoding="utf-8") as p:
        # Read page template
        page = p.read()
        outputFile = f"{pageTemplate[1]}.html"
        for moduleTemplate in moduleTemplateList:

            with open(moduleTemplate[0], encoding="utf-8") as m:
                # Read module template
                module = m.read()
                if moduleTemplate[2]: # Checks if the module is only supposed to be used by product pages
                    if pageTemplate[2]: # Checks if the page is a product page
                        if moduleTemplate[1] == "!!!CAR_TABLE!!!": # Checks if the module is specifically the car table module
                            module = module.replace("'!!!CAR_ARRAY!!!'", f"carDictionary['{pageTemplate[3]}Array']")
                        # Replace module template replace keyword with said module 
                        page = page.replace(moduleTemplate[1], module)
                    else:
                        pass # The module will be ignored since the page isn't supposed to have it
                else:
                    
                    # Replace module template replace keyword with said module 
                    page = page.replace(moduleTemplate[1], module)
                    
        with open(outputFile, "w", encoding="utf-8") as f:
            f.write(page)
            
        ### Used for later when we have actual language templates    
        
        #pageList.append(page)

# for languageTemplate in languageTemplateList: 
#     pageNumber = 0

#     for page in pageList:
        
#         # Sets the output file depending on both pageTemplate and languageTemplate
#         currentPage = pageTemplateList[pageNumber][1]
#         outputFile = f"{currentPage}{languageTemplate[1]}.html"
#         pageNumber +=1
    
#         with open(languageTemplate[0], encoding="utf-8") as l:

#             for count, line in enumerate(l):
                
#                 # Checks if the line contains a hashtag and decides if it's a comment or not
#                 if re.findall("^#", line) == []:
#                     isNotIgnored = True
#                 else:
#                     isNotIgnored = False
                    
#                 # Checks if the line contains nothing at all and decides if it's empty or not
#                 if re.findall("^$", line) == []:
#                     isNotEmpty = True
#                 else:
#                     isNotEmpty = False
                
#                 if isNotIgnored and isNotEmpty:
#                     # Splits the line into two separate strings where the first one contains 
#                     # the replace keyword and the second contains the main content
#                     lineInfo = line.split(" ", 1)
#                     replaceKeyword = lineInfo[0]
#                     lineContent = lineInfo[1].split("\n")[0]
#                     if re.findall("^!!!LANGUAGE_LINK", lineInfo[0]) != []:
#                         lineContent = f"{currentPage}{lineContent}"
#                     page = page.replace(replaceKeyword, lineContent)

#             # Create new complete file
#             with open(outputFile, "w", encoding="utf-8") as f:
#                 f.write(page)
