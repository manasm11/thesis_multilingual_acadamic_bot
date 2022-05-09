from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langdetect import detect, detect_langs, DetectorFactory
from deep_translator import GoogleTranslator
from collections import defaultdict
from loguru import logger
import json
import requests

DetectorFactory.seed = 0
PROBABILITY_THRESHOLD = 0.9

app = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

toEnglishTranslator = GoogleTranslator(source="auto", target="en")
translators = {}


class Request(BaseModel):
    message: str
    chat_id: str


def translate_to_english(q: str, chat_id):
    chat_id or logger.warning("'chat_id' not provided")
    substrings = q.split()
    isNumeric = all([s.isnumeric() for s in substrings])
    if isNumeric:
        logger.info(f"'{q}' is NUMERIC")
        return "".join(substrings)
    if chat_id in translators and translators[chat_id].target != "en":
        return toEnglishTranslator.translate(q)
    translated = toEnglishTranslator.translate(q)
    if translated == q:
        translators[chat_id] = toEnglishTranslator
        return q
    possible_langs = detect_langs(q)
    for lang in possible_langs:
        if lang.prob > PROBABILITY_THRESHOLD:
            translators[chat_id] = GoogleTranslator(source="en", target=lang.lang)
            return translated
    logger.warning(f"Unable to detect language for query: '{q}'")
    return ""


def translate_from_english(q, chat_id):
    if q.isnumeric():
        return q
    if chat_id in translators:
        return translators[chat_id].translate(q)
    logger.warning("Couldn't find the 'chat_id'")
    return ""


@app.get("/")
def read_root():
    return {"message": "API Working !!!"}


@app.post("/message")
def message(req: Request):
    translated = translate_to_english(req.message, req.chat_id)
    logger.debug(f"translated={translated}")
    # try:
    res = requests.post(
        "http://localhost:5005/webhooks/rest/webhook",
        json={"message": translated, "sender": req.chat_id},
    )
    print(res)
    data = res.json()
    logger.info(f"response from bot: {json.dumps(data, indent=2)}")
    for d in data:
        d["text"] = translate_from_english(d["text"], d["recipient_id"])
        d["lang"] = translators[d["recipient_id"]].target
        if "buttons" in d:
            for b in d["buttons"]:
                b["title"] = translate_from_english(b["title"], d["recipient_id"])
        logger.debug(
            f"After translations, {json.dumps(data, indent=2, ensure_ascii=False)}"
        )
    return data
    # except Exception as e:
    #     logger.error(e)
    #     return []
