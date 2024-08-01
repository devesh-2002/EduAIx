import os
from langchain.chains import LLMChain
from dotenv import load_dotenv
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import OpenAI, OpenAIEmbeddings
from mongodb_rag import vector_db_urls
from langchain_core.prompts import PromptTemplate
from langchain.chains import RetrievalQA

load_dotenv()


def prompt_template(prompt, url=None, text_audio=None,pdf=None):
      if url:
            vector_search = vector_db_urls(url,None,None)
            print(vector_search, "Vector Search")
      if text_audio:
            vector_search = vector_db_urls(None,text_audio)
            print(vector_search , "Vector Search")
            
      if pdf:
            vector_search = vector_db_urls(None,None,pdf)
            print(vector_search , "Vector Search")

      llm = OpenAI(openai_api_key=os.getenv('OPENAI_API_KEY'))
      prompt_template = """Use the following pieces of generate questions at the end. Try to allocate marks for every question or subquestion.
      If you don't know the answer, just say that you don't know, don't try to make up an answer.

      {context}

      Question: {question}
      """
      PROMPT = PromptTemplate(
      template=prompt_template, input_variables=["context", "question"]
      )
      qa_retriever = vector_search.as_retriever(
      search_type="similarity",
      search_kwargs={"k": 10},
      )
      qa = RetrievalQA.from_chain_type(
      llm=OpenAI(),
      chain_type="stuff",
      retriever=qa_retriever,
      return_source_documents=True,
      chain_type_kwargs={"prompt": PROMPT},
      )
      docs = qa({"query": prompt})

      print(docs["result"])
      return docs['result']


