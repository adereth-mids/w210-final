from bs4 import BeautifulSoup
from requests import get
import datetime
import os
from tqdm import tqdm
from time import sleep
import random
import sys

def congressional_record_url_for_date(date, chamber):
    return ("https://www.congress.gov/congressional-record/%d/%d/%d/%s-section" %
            (date.year, date.month, date.day, chamber))

def extract_article_urls(congressional_record_url):
    response = get(congressional_record_url)
    if response.status_code != 200:
        return []
    soup = BeautifulSoup(response.text, 'html.parser')
    if len(soup.select(".item_table")) == 0:
        return []
    return ["https://www.congress.gov" + a.get('href') for a
            in soup.select(".item_table")[0]("a")
             if ("article" in a.get('href'))]

def extract_text_from_article_url(article_url):
    response = get(article_url)
    i = 0
    while response.status_code != 200 and i < 20:
        print("Failed retrieving " + article_url)
        sleep(random.uniform(5.0, 10.0))
        response = get(article_url)
        i += 1
    soup = BeautifulSoup(response.text, 'html.parser')
    return soup.select(".txt-box")[0].text

destination_dir = "/home/madereth/Projects/w210-final/data/raw/congress"

def archive_articles(date, chamber):
    path = "%s/%s/%d/%d/%d/" % (destination_dir, chamber, date.year, date.month, date.day)
    if not os.path.exists(path):
        os.makedirs(path)
        for i, u in enumerate(extract_article_urls(congressional_record_url_for_date(date, chamber))):
            article_text = extract_text_from_article_url(u)
            with open(path + "{:03d}".format(i), 'w') as f:
                f.write(article_text)

if __name__== "__main__":
    d = datetime.datetime(int(sys.argv[1]), 1, 1)
    for i in tqdm(range(366), desc=sys.argv[1]):
        archive_articles(d + datetime.timedelta(days=i), "house")



