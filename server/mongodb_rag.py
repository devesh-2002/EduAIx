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
from langchain.chains import RetrievalQA

from langchain import hub
from langchain_core.prompts import PromptTemplate
from openai import OpenAI
from langchain_openai import OpenAI
import os
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate


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
    loader = PyPDFLoader(pdf_path)
    data = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = text_splitter.split_documents(data)
    print(docs, " Docs")
    llm = OpenAI(openai_api_key=os.getenv('OPENAI_API_KEY'))
    embedding_function = OpenAIEmbeddings()
    vectorstore = Chroma.from_documents(docs, embedding_function)
    retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 10})

    def format_docs(docs):
        return "\n".join(doc.page_content for doc in docs)
  
    prompt_temp = f"Generate {n_ques} questions only for Total Marks : {total_marks}. Also follow Additional Instructions : {additional_inst}"

    prompt_template = """You are a Question generator chatbot. 
      You need to generate questions based on the context and on the instructions specified. Also mention the marks besides every question and subquestion.
      
        {question}
        Context :
        {context} 
      """
    prompt = hub.pull("rlm/rag-prompt")
    print(retriever | format_docs , " : Context")
    prompt = ChatPromptTemplate.from_messages([("human", prompt_template)])
    rag_chain = {"context": retriever, "question": RunnablePassthrough()} | prompt | llm
    response = rag_chain.invoke(prompt_temp)
    print(response)
    return response

