from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.text_splitter import CharacterTextSplitter
from langchain.llms import OpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.document_loaders import PyPDFLoader
from langchain.schema import Document
import re

arxiv_loader = PyPDFLoader("https://arxiv.org/pdf/2303.08774.pdf")
arxiv_documents = arxiv_loader.load()

text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
arxiv_texts = text_splitter.split_documents(arxiv_documents)

embeddings = OpenAIEmbeddings(disallowed_special=())

paper_vectorstore = Chroma.from_documents(arxiv_texts, embeddings)

def extract_qa_pairs(text):
    pattern = r'(\d+)\.\s+(.*?)\n(?:Answer|Ans)\s*:\s*(.*?)(?=\n\d+\.|\Z)'
    matches = re.findall(pattern, text, re.DOTALL)
    return [(match[1].replace('\n', ' ').strip(), match[2].replace('\n', ' ').strip()) for match in matches]

qa_loader = PyPDFLoader("Q_A.pdf")
qa_documents = qa_loader.load()

qa_content = " ".join([doc.page_content for doc in qa_documents])

qa_pairs = extract_qa_pairs(qa_content)
print(qa_pairs, " Question Ans Pairs")
qa_docs = [
    Document(page_content=f"Question: {q}\nAnswer: {a}", metadata={"type": "qa_pair"})
    for q, a in qa_pairs
]

qa_vectorstore = Chroma.from_documents(qa_docs, embeddings)

combined_retriever = paper_vectorstore.as_retriever(search_kwargs={"k": 5})

llm = OpenAI(temperature=0)

template = """
You are an expert grader. Your task is to evaluate an answer given to a specific question about the paper "GPT-4 Technical Report" (https://arxiv.org/pdf/2303.08774.pdf).

Question: {question}
Student's Answer: {answer}
Relevant Information: {context}

Please grade the answer and provide feedback. These are only 2 mark questions. You need to grade according to the number of points. 
For example, 1 point gives 1 mark or 2 points for 2 marks.
There can be some difference from the context, However not totally different. 

Your response should be in the following format:
Grade: [Your grade]
Explanation: [Your explanation]
Suggestions: [Your suggestions if any]

"""

prompt = PromptTemplate(
    input_variables=["question", "answer", "context"],
    template=template
)

chain = LLMChain(llm=llm, prompt=prompt)

def grade_answer(question, answer):
    paper_context = paper_vectorstore.similarity_search(question, k=2)
    qa_context = qa_vectorstore.similarity_search(question, k=1)
    
    context = paper_context + qa_context
    context_text = " ".join([doc.page_content for doc in context])
        
    result = chain.run(question=question, answer=answer, context=context_text)
    return result

def extract_grade(result):
    grade_line = result.split('\n')[0]
    try:
        return float(grade_line.split(':')[1].strip())
    except:
        print(f"Warning: Could not extract grade from {grade_line}")
        return 0

total_grade = 0
total_questions = len(qa_pairs)
print("Total Number of Questions : ",total_questions)
for i, (question, answer) in enumerate(qa_pairs, 1):
    print(f"Question {i}: {question}")
    print(f"Student's Answer: {answer}")
    result = grade_answer(question, answer)
    print(result)
    
    question_grade = extract_grade(result)
    total_grade += question_grade
    
    print(f"Question {i} Grade: {question_grade}/2")
    print("\n" + "="*50 + "\n")

max_possible_grade = total_questions * 2
percentage = (total_grade / max_possible_grade) * 100

print(f"Total Grade: {total_grade}/{max_possible_grade}")
print(f"Percentage: {percentage:.2f}%")