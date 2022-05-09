from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langdetect import detect, detect_langs, DetectorFactory
from deep_translator import GoogleTranslator
from collections import defaultdict
from loguru import logger
import json
import requests


def get_response(msg: str) -> str:
    logger.debug(f"msg={msg}")
    lower_msg = msg.lower().strip()
    if lower_msg == "hello" or lower_msg == "hi":
        return "Hello"
    courses = [
        {
            "name": "Computer Programming",
            "ic": "Manoj Kannan",
            "tb": "The Art of Computer Programming, Volumes 1-4",
            "date": "12/12/2021",
        },
        {
            "name": "General Biology",
            "ic": "Meghana Tare",
            "tb": "Wiley's Fundamentals of Biology",
            "date": "10/12/2021",
        },
        {
            "name": "Object Oriented Programming",
            "ic": "Yashwardhan Sharma",
            "tb": "Head First Object-Oriented Analysis and Design",
            "date": "08/12/2021",
        },
    ]
    req_course = None
    for course in courses:
        if course["name"].lower() in lower_msg:
            req_course = course
            break
        logger.debug(f"{course['name'].lower()} not found in {lower_msg}")
    if not req_course:
        return "Course Not Found"
    response = f"For {req_course['name']}, "
    subresponses = []
    INSTRUCTOR_RESPONSE = f"instructor in charge is {req_course['ic']}"
    TEXTBOOK_RESPONSE = f"textbook is '{req_course['tb']}'"
    COMPREDATE_RESPONSE = f"compre date is {req_course['date']}"

    if "instructor" in lower_msg:
        subresponses.append(INSTRUCTOR_RESPONSE)
    if "book" in lower_msg:
        subresponses.append(TEXTBOOK_RESPONSE)
    if "date" in lower_msg:
        subresponses.append(COMPREDATE_RESPONSE)
    if len(subresponses) == 1:
        return response + subresponses[0]
    if len(subresponses) == 0:
        subresponses = [INSTRUCTOR_RESPONSE, TEXTBOOK_RESPONSE, COMPREDATE_RESPONSE]
    for subres in subresponses[:-1]:
        response += subres + ", "
    return response[:-2] + " and " + subresponses[-1]


app = FastAPI()


class Request(BaseModel):
    message: str
    sender: str


@app.get("/")
def read_root():
    return {"message": "BOT Working !!!"}


@app.post("/webhooks/rest/webhook")
def message(req: Request):
    logger.debug("Request Received")
    response = get_response(req.message)
    return [{"text": response, "recipient_id": req.sender}]
