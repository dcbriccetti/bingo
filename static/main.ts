const source = new EventSource('/events')
let balls = []
source.onmessage = event => {
    balls.push(event.data)
    document.querySelector('#balls').textContent = balls.join(', ')
}


