import os
from langchain.chains import LLMChain
from dotenv import load_dotenv
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import OpenAI, OpenAIEmbeddings
from mongodb_rag import vector_db_urls
load_dotenv()


def prompt_template(prompt, url=None, text_audio=None,pdf=None):
  if url:
          vector_search = vector_db_urls(url,None,None)
          print(vector_search)
  if text_audio:
        vector_search = vector_db_urls(None,text_audio)
        print(vector_search)
        
  if pdf:
        vector_search = vector_db_urls(None,None,pdf)
        print(vector_search)
  docs_with_score = vector_search.similarity_search_with_score(query=prompt,k=1)

  llm = OpenAI(openai_api_key=os.getenv('OPENAI_API_KEY'))

  prompt_template = ChatPromptTemplate.from_messages([
    ("system", "You are a student answering chatbot. You have to answer based on the data with you. Do not start with 'based on this information'. Be sure while giving answer. Gve only coirrect answers."),
      ("user", "{input}")
  ])

  chain = LLMChain(
      llm=llm,
      prompt=prompt_template
  )

  input_docs = "\n".join([doc.page_content for doc, _ in docs_with_score])
  response = chain.invoke({"input": input_docs})
  print(response['text'])
  return response['text']


