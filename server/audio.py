import os

from deepgram import (
    DeepgramClient,
    PrerecordedOptions,
    FileSource,
)
from dotenv import load_dotenv
load_dotenv()

def audio_text(audio):
    API_KEY = os.getenv("DEEPGRAM_API_KEY")
    deepgram = DeepgramClient(API_KEY)
    with open(audio, "rb") as file:
        buffer_data = file.read()

    payload: FileSource = {
            "buffer": buffer_data,
        }
    options = PrerecordedOptions(
            model="nova-2",
            smart_format=True,
        )
    response = deepgram.listen.prerecorded.v("1").transcribe_file(payload, options)
    res = response.results.channels[0]["alternatives"][0]["transcript"]
    return res
