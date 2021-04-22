from random import shuffle, random
from time import sleep

from flask import Flask, render_template, Response

NUMBER_OF_LETTERS = len('BINGO')
NUMBERS_PER_LETTER = 15  # B-1 through B-15, I-1 through I-15, etc.

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/events')
def events():
    def event_stream():
        ball_numbers: list[int] = list(range(1, NUMBERS_PER_LETTER * NUMBER_OF_LETTERS + 1))
        shuffle(ball_numbers)

        for ball_number in ball_numbers:
            yield f'data: {ball_number}\n\n'
            sleep(random() * 3)

    return Response(event_stream(), mimetype="text/event-stream")

app.run('localhost', debug=True)
