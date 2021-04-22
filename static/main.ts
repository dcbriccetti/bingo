const source = new EventSource('/events')
const ballsReceived = document.querySelector('#balls-received')
const cells = ballsReceived.querySelectorAll('td')
const NUMBER_OF_LETTERS = 5
const NUMBERS_PER_LETTER = 15

function cellFor(oneBasedNumber: number): HTMLTableDataCellElement {
    const zeroBasedNumber = oneBasedNumber - 1
    const colIndex = Math.floor(zeroBasedNumber / NUMBERS_PER_LETTER)
    const rowIndex = zeroBasedNumber % NUMBERS_PER_LETTER
    return cells[rowIndex * NUMBER_OF_LETTERS + colIndex]
}

const addNumber = (number: number) => cellFor(number).textContent = number.toString()

for (let i = 1; i <= 75; i++) addNumber(i)

source.onmessage = event => {
    const number: number = parseInt(event.data)
    cellFor(number).classList.add('received')
}

source.onerror = event => {
    // Stop EventSource from reconnecting after all data is sent
    source.close()
}
