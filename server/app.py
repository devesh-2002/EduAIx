from fastapi import FastAPI, HTTPException, File, UploadFile, Query
from audio import audio_text
from mongodb_rag import vector_db_urls
from prompt import prompt_template
from scraping import retrieve_content_from_all_urls

app = FastAPI()

@app.post("/process/")
def process_data(
    audio_file: UploadFile = File(None),
    start_url: str = Query(None),
    prompt: str = Query(None)
):
    try:
        if audio_file and start_url:
            raise HTTPException(status_code=400, detail="Cannot process both audio file and start URL together.")

        if audio_file and prompt:
            answer = prompt_template(prompt,None,audio_file)
            return {"transcript ":transcript}
        
        if start_url and prompt:
            answer = prompt_template(prompt, start_url,None)
            return {"Answer ": answer}

        elif prompt:
            return {"prompt": prompt}
        
        else:
            raise HTTPException(status_code=400, detail="Either audio file, start URL, or prompt parameter is required.")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.get("/")
def read_root():
    return {"Hello": "World"}
