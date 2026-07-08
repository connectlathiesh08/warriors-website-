import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

driver = webdriver.Chrome(options=chrome_options)

try:
    print("Loading homepage to check console errors...")
    driver.get("http://localhost:5000/index.html")
    time.sleep(3)
    
    print("Retrieving console logs:")
    logs = driver.get_log("browser")
    for entry in logs:
        print(f"[{entry['level']}] {entry['message']}")
except Exception as e:
    print("Error:", e)
finally:
    driver.quit()
