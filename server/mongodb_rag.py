from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.document_loaders import UnstructuredURLLoader
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from langchain_openai import OpenAI, ChatOpenAI, OpenAIEmbeddings
from scraping import find_links, fetch_and_extract, retrieve_content_from_all_urls
from langchain_community.document_loaders import TextLoader
from pymongo import MongoClient
from langchain_community.document_loaders import TextLoader
from audio import save_text_to_file
from langchain_community.document_loaders.recursive_url_loader import RecursiveUrlLoader
from bs4 import BeautifulSoup as Soup
from langchain_community.document_loaders import PyPDFLoader
from langchain_chroma import Chroma
from openai import OpenAI
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain import hub
from langchain_core.prompts import PromptTemplate
from openai import OpenAI

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

def teacher_question(pdf_path, n_ques, total_marks, additional_inst):
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    loader = PyPDFLoader(pdf_path)
    data = loader.load()
    print(data," Data")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    print(text_splitter," Text splitter")
    docs = text_splitter.split_documents(data)
    print(docs, " Docs")
    client = OpenAI()
    system_prompt = f" Generate {n_ques} questions based on the given pdf. The Total Marks of all questions combined should be : {total_marks}. Also follow these additional instructions : {additional_inst}. Don't mention the word document anywhere. Assure that each question and (if) subquestion should be properly assigned marks to match the total."
    response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    temperature=0.2,
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"{docs}"}
    ]
    )
    print(response.choices[0].message.content)
    return (response.choices[0].message.content)

    # prompt = hub.pull("rlm/rag-prompt")
    
    # db = Chroma.from_documents(docs, OpenAIEmbeddings())
    # retriever = db.as_retriever()
    
    # system_prompt = f" Generate {n_ques} questions based on the given pdf. The Total Marks of all questions combined should be : {total_marks}. Also follow these additional instructions : {additional_inst}."
    
    # llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
    
    # template = f"""
    # {docs}
    # {system_prompt}

    # Questions :
    # """
    # print(template)
    # custom_rag_prompt = PromptTemplate.from_template(template)
    
    # rag_chain = (
    #     {"context": retriever | format_docs, "question": RunnablePassthrough()}
    #     | custom_rag_prompt
    #     | llm
    #     | StrOutputParser()
    # )
    
    # generated_questions = rag_chain.invoke(system_prompt)
    
    # print(generated_questions)

    # return generated_questions


