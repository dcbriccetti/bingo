from random import shuffle
from time import sleep

from flask import Flask, render_template, Response

NUMBERS_PER_LETTER = 15  # B-1 through B-15, I-1 through I-15, etc.

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/events')
def events():
    def event_stream():
        balls = []
        for letter_index, letter in enumerate('BINGO'):
            letter_range_start = letter_index * NUMBERS_PER_LETTER + 1
            letter_range_end = letter_range_start + NUMBERS_PER_LETTER
            balls_with_letter = [f'{letter}-{number}' for number in range(letter_range_start, letter_range_end)]
            balls.extend(balls_with_letter)
        shuffle(balls)

        for ball in balls:
            yield f'data: {ball}\n\n'
            sleep(1)

    return Response(event_stream(), mimetype="text/event-stream")

app.run('localhost', debug=True)
