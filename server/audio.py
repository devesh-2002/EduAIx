import os

from deepgram import (
    DeepgramClient,
    PrerecordedOptions,
    FileSource,
)


AUDIO_FILE = "demo_speaker2.mp3"

API_KEY = DEEPGRAMAPI_KEY
deepgram = DeepgramClient(API_KEY)
with open(AUDIO_FILE, "rb") as file:
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
print(response.results.channels[0]["alternatives"][0]["transcript"])