class Bingo {
    private eventSource: EventSource
    private playerCardCells: NodeListOf<HTMLTableDataCellElement>
    private NUMBER_OF_LETTERS = 5
    private NUMBERS_PER_LETTER = 15

    constructor() {
        this.eventSource = new EventSource('/events')
        this.playerCardCells = document.querySelectorAll('#player-card td')

        this.populatePlayerCard()

        for (let i = 1; i <= 75; i++)
            this.cellFor(i).textContent = i.toString()

        this.eventSource.onmessage = event => {
            const number: number = parseInt(event.data)
            this.cellFor(number).classList.add('received')
        }

        this.eventSource.onerror = () => {
            // Stop EventSource from reconnecting after all data is sent
            this.eventSource.close()
        }

    }

    private cellFor(oneBasedNumber: number): HTMLTableDataCellElement {
        const zeroBasedNumber = oneBasedNumber - 1
        const colIndex = Math.floor(zeroBasedNumber / this.NUMBERS_PER_LETTER)
        const rowIndex = zeroBasedNumber % this.NUMBERS_PER_LETTER
        const receivedCells: NodeListOf<HTMLTableDataCellElement> = document.querySelectorAll('#balls-received td')
        return receivedCells[rowIndex * this.NUMBER_OF_LETTERS + colIndex]
    }

    private populatePlayerCard(): void {
        function selectFiveNumbers(lowerBound: number): number[] {
            const allNums: number[] = Array.from({length: 15}, (v, i) => i + lowerBound) // 1–15, or 16–29, etc.
            return Array.from({length: 5}, () => // Choose 5 randomly
                allNums.splice(Math.floor(Math.random() * allNums.length), 1)[0]
            )
        }

        for (let colIndex = 0; colIndex < this.NUMBER_OF_LETTERS; colIndex++) {
            const selectedNums = selectFiveNumbers(colIndex * this.NUMBERS_PER_LETTER + 1)
            for (let rowIndex = 0; rowIndex < this.NUMBER_OF_LETTERS; rowIndex++) {
                this.playerCardCells[rowIndex * this.NUMBER_OF_LETTERS + colIndex].textContent = selectedNums[rowIndex].toString()
            }
        }
    }
}

new Bingo()
