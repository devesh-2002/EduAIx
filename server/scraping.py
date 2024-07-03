import requests
from bs4 import BeautifulSoup

def find_links(url):
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        links = []
        for link in soup.find_all('a', href=True):
            href = link.get('href')
            if href.startswith('http'): 
                links.append(href)
        return links
    except requests.exceptions.RequestException as e:
        print(f"Error fetching page: {e}")
        return []

def fetch_and_extract(url):
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        text_content = soup.get_text()
        return text_content
    except requests.exceptions.RequestException as e:
        print(f"Error fetching page: {e}")
        return ""

def retrieve_content_from_all_urls(start_url):
    all_urls = find_links(start_url)
    all_content = []
    for url in all_urls:
        content = fetch_and_extract(url)
        all_content.append((url, content))
    return all_content

start_url = 'https://lablab.ai'  
all_content = retrieve_content_from_all_urls(start_url)
