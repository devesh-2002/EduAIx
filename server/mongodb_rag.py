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
from langchain.text_splitter import CharacterTextSplitter
from langchain.schema import Document
from langchain.chains import LLMChain

from langchain import hub
from langchain_core.prompts import PromptTemplate
from openai import OpenAI
from langchain_openai import OpenAI
import os
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
import re

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
      You need to generate questions based on the context and on the instructions specified. 
      Also mention the marks besides every question and subquestion.
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


def extract_qa_pairs(text):
    pattern = r'(\d+)\.\s+(.*?)\n(?:Answer|Ans)\s*:\s*(.*?)(?=\n\d+\.|\Z)'
    matches = re.findall(pattern, text, re.DOTALL)
    return [(match[1].replace('\n', ' ').strip(), match[2].replace('\n', ' ').strip()) for match in matches]

def grade_answer(paper_vectorstore, qa_vectorstore, prompt_template, question, answer):
    paper_context = paper_vectorstore.similarity_search(question, k=2)
    qa_context = qa_vectorstore.similarity_search(question, k=1)
    
    context = paper_context + qa_context
    context_text = " ".join([doc.page_content for doc in context])
    
    llm = OpenAI(temperature=0)
    chain = LLMChain(llm=llm, prompt=prompt_template)

    result = chain.run(question=question, answer=answer, context=context_text)
    return result

def extract_grade(result):
    print("Full Result: ", result)
    
    if not result:
        print("Error: Result is empty.")
        return 0
    
    lines = result.strip().split('\n')
    
    for line in lines:
        if line.startswith("Grade:"):
            try:
                grade = line.split(':')[1].strip()
                
                grade = grade.split()[0]  
                
                return float(grade)
            except (IndexError, ValueError) as e:
                print(f"Error extracting grade from line '{line}': {e}")
                return 0
    
    print("Warning: Could not find 'Grade:' in result.")
    return 0

def paper_corrector(answer_sheet_pdf, q_a_pdf, prompt_text):
    answer_sheet_pdf_loader = PyPDFLoader(answer_sheet_pdf)
    answer_sheet_docs = answer_sheet_pdf_loader.load()
    
    q_a_pdf_loader = PyPDFLoader(q_a_pdf)
    q_a_docs = q_a_pdf_loader.load()
    
    qa_content = " ".join([doc.page_content for doc in q_a_docs])
    qa_pairs = extract_qa_pairs(qa_content)

    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    answer_sheet_texts = text_splitter.split_documents(answer_sheet_docs)
    
    embeddings = OpenAIEmbeddings(disallowed_special=())
    paper_vectorstore = Chroma.from_documents(answer_sheet_texts, embeddings)
    
    qa_docs = [
        Document(page_content=f"Question: {q}\nAnswer: {a}", metadata={"type": "qa_pair"})
        for q, a in qa_pairs
    ]
    qa_vectorstore = Chroma.from_documents(qa_docs, embeddings)

    full_prompt = f"You need to grade as per the following prompt: {prompt_text} "
    template = """
      You are an expert grader.
      Your task is to evaluate an answer given to a specific question.

      Question: {question}
      Student's Answer: {answer}
      Relevant Information: {context}

      """ + full_prompt + """
      Your response should be in the following format:

      Grade: [Your marks in number, only 1 number. Like 1,2,3 etc. No need to mention 1/5 or 1/10 etc. ]
      Explanation: [Your explanation]
      Suggestions: [Your suggestions if any]

      """

    prompt_template = PromptTemplate(
        input_variables=["question", "answer", "context"],
        template=template
    )

    # Grade the answers
    total_grade = 0
    results = []
    for question, answer in qa_pairs:
        result = grade_answer(paper_vectorstore, qa_vectorstore, prompt_template, question, answer)
        print("Result : ", result)
        question_grade = extract_grade(result)
        total_grade += question_grade

        results.append({
            "question": question,
            "student_answer": answer,
            "grade": question_grade,
            "feedback": result
        })

    # max_possible_grade = len(qa_pairs) * max(question_grade)
    # percentage = (total_grade / max_possible_grade) * 100

    return {
        "results": results,
        "total_grade": total_grade,
        # "max_possible_grade": max_possible_grade,
        # "percentage": f"{percentage:.2f}%"
    }
