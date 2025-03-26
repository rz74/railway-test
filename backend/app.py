# Flask app entry point

from flask import Flask
app = Flask(__name__)

@app.route('/')
def index():
    return "Backend is live!"