import secrets
from os import environ

import git
import feedparser
from bs4 import BeautifulSoup
from flask import Flask, jsonify, render_template, request

FEED_URL = environ["FEED_URL"]
TAGS = {}


for key, value in environ.items():
    key = key.upper()

    if key.startswith("TAG_"):
        TAGS[key[4:].replace("_", " ")] = value


VERSION = str(git.Repo(search_parent_directories=True).head.object.hexsha)


app = Flask(__name__)


@app.route("/")
def index():
    app.logger.warning(request.user_agent.string)
    return render_template("index.html", rand_val=secrets.token_urlsafe(32))


@app.route("/version")
def version():
    return VERSION


@app.route("/feed.json")
def feed_json():
    parsed = feedparser.parse(FEED_URL)

    data = {
        "entries": [],
        "tags": TAGS,
    }

    for entry in parsed.entries:
        if not hasattr(entry, "tags"):
            entry.tags = []

        entry_data = {
            "title": entry.title,
            "summary": entry.summary,
            "author": entry.author,
            "tags": [tag["term"] for tag in entry.tags],
            "published": entry.published,
        }

        if "<p>" in entry.summary or "<img" in entry.summary:
            entry_data["summary"] = ""  # It's a block of HTML, we can't have that

        img_tag = None

        if hasattr(entry, "content"):
            img_tag = BeautifulSoup(entry.content[0]["value"], features="html.parser").img

        entry_data["image"] = img_tag.get("src") if img_tag else None
        entry_data["image_alt"] = img_tag.get("alt") if img_tag else None

        data["entries"].append(entry_data)

    return jsonify(data)
