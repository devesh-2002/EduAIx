from fastapi import FastAPI, HTTPException, File, UploadFile, Query, Request
from audio import audio_text
from mongodb_rag import vector_db_urls, teacher_question
from prompt import prompt_template
from scraping import retrieve_content_from_all_urls
import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
DB_NAME = "langchain_db"
COLLECTION_NAME = "test"
ATLAS_VECTOR_SEARCH_INDEX_NAME = "vector_index"
MONGODB_COLLECTION = client[DB_NAME][COLLECTION_NAME]


app = FastAPI()
def cleanup_mongodb():
    MONGODB_COLLECTION.delete_many({})  

@app.middleware("http")
async def cleanup_mongodb_middleware(request: Request, call_next):
    cleanup_mongodb()
    response = await call_next(request)
    return response


@app.post("/process/")
async def process_data(
    audio_file: UploadFile = File(None),
    start_url: str = Query(None),
    prompt: str = Query(None),
    pdf_file: UploadFile = File(None),

):
    try:
        if audio_file and start_url:
            raise HTTPException(status_code=400, detail="Cannot process both audio file and start URL together.")

        if audio_file and prompt:
            os.makedirs('temp', exist_ok=True)
            audio_path = f"temp/{audio_file.filename}"
            with open(audio_path, "wb") as f:
                f.write(await audio_file.read())

            answer = prompt_template(prompt,None,audio_path,None)
            return {"Answer ":answer}
        
        if start_url and prompt:
            answer = prompt_template(prompt, start_url,None,None)
            return {"Answer ": answer}

        if prompt and pdf_file:
            os.makedirs('temp', exist_ok=True)
            pdf_path = f"temp/1.pdf"
            with open(pdf_path, "wb") as f:
                f.write(await pdf_file.read())
            
            answer = prompt_template(prompt,None,None, pdf_path)
        elif prompt:
            return {"prompt": prompt}
        
        else:
            raise HTTPException(status_code=400, detail="Either audio file, start URL, or prompt parameter is required.")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.post('/teacher')
async def create_questions(
    pdf_file: UploadFile = File(...),  # Use ... for required fields
    n_ques: str = Query(None),
    total_marks: str = Query(None),
    additional_inst: str = Query(None)
):
    try:
        os.makedirs('temp', exist_ok=True)
        
        pdf_path = f"temp/{pdf_file.filename}"
        with open(pdf_path, "wb") as f:
            f.write(await pdf_file.read())

        quest = teacher_question(pdf_path, n_ques, total_marks, additional_inst)


        return quest

    except Exception as e:
        return {"error": str(e)}



    
@app.get("/")
def read_root():
    return {"Hello": "World"}
