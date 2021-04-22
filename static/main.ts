const source = new EventSource('/events')
const ballsReceived = document.querySelector('#balls-received')
const playerCard = document.querySelector('#player-card')
const receivedCells = ballsReceived.querySelectorAll('td')
const playerCardCells = playerCard.querySelectorAll('td')
const NUMBER_OF_LETTERS = 5
const NUMBERS_PER_LETTER = 15

function cellFor(oneBasedNumber: number): HTMLTableDataCellElement {
    const zeroBasedNumber = oneBasedNumber - 1
    const colIndex = Math.floor(zeroBasedNumber / NUMBERS_PER_LETTER)
    const rowIndex = zeroBasedNumber % NUMBERS_PER_LETTER
    return receivedCells[rowIndex * NUMBER_OF_LETTERS + colIndex]
}

function selectNumbers(lowerBound: number): number[] {
    const nums = []
    for (let i = lowerBound; i < lowerBound + NUMBERS_PER_LETTER; i++) {
        nums.push(i)
    }
    // todo shuffle nums
    return nums.slice(0, 5)
}

function populatePlayerCard(): void {
    for (let colIndex = 0; colIndex < 5; colIndex++) {
        const selectedNums = selectNumbers(colIndex * NUMBERS_PER_LETTER + 1)
        for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
            playerCardCells[rowIndex * NUMBER_OF_LETTERS + colIndex].textContent = selectedNums[rowIndex].toString()
        }
    }
}

populatePlayerCard()

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
