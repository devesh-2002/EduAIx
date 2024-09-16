FROM python:3.9

WORKDIR /code

COPY . /code

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt


CMD ["fastapi", "run", "app/app.py", "--port", "80"]