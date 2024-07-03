from langchain.vectorstores import MongoDBAtlasVectorSearch
from langchain_community.embeddings import OpenAIEmbeddings
from langchain.llms import OpenAI
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain

prompt='What is Russian Offensive Campaign?'
docs_with_score = vector_search.similarity_search_with_score(query=prompt,k=1)

llm = ChatOpenAI(openai_api_key=os.environ['OPENAI_API_KEY'])

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