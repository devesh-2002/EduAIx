from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.document_loaders import UnstructuredURLLoader
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from langchain_openai import OpenAI, OpenAIEmbeddings
from scraping import find_links, fetch_and_extract, retrieve_content_from_all_urls
from langchain_community.document_loaders import TextLoader
from pymongo import MongoClient
from langchain_community.document_loaders import TextLoader
from audio import save_text_to_file
from langchain_community.document_loaders.recursive_url_loader import RecursiveUrlLoader
from bs4 import BeautifulSoup as Soup
from langchain_community.document_loaders import PyPDFLoader


import os
from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)

DB_NAME = "langchain_db"
COLLECTION_NAME = "test"
ATLAS_VECTOR_SEARCH_INDEX_NAME = "vector_index"

MONGODB_COLLECTION = client[DB_NAME][COLLECTION_NAME]

def vector_db_urls(url=None,audio=None,pdf=None):
    loader = None
    if url:
        # urls = retrieve_content_from_all_urls(url)
        loader = RecursiveUrlLoader(url=url, max_depth=2, extractor=lambda x: Soup(x, "html.parser").text)
        # print(loader)

    if audio:
        text = save_text_to_file(audio)
        text
        loader = TextLoader('audio_files/1.txt')

    if pdf:
        loader = PyPDFLoader('temp/1.pdf') 
    print(loader, " Loader")
    data = loader.load()
    print(data, " Data")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    docs = text_splitter.split_documents(data)
    print(docs, " Docs")
    vector_search = MongoDBAtlasVectorSearch.from_documents(
        documents=docs,
        embedding=OpenAIEmbeddings(disallowed_special=()),
        collection=MONGODB_COLLECTION,
        index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
    )

    return vector_search
