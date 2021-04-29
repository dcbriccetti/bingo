class Bingo {
    private eventSource: EventSource
    private readonly playerCardCells: NodeListOf<HTMLTableDataCellElement>
    private NUMBER_OF_LETTERS = 5
    private NUMBERS_PER_LETTER = 15

    constructor() {
        this.eventSource = new EventSource('/events')
        this.playerCardCells = document.querySelectorAll('#player-card td')

        this.populatePlayerCard()

        for (let i = 1; i <= 75; i++)
            this.cellFor(i).textContent = i.toString()

        this.eventSource.onmessage = event => {
            const ballNumber: number = parseInt(event.data)
            this.cellFor(ballNumber).classList.add('received')
            if (this.updatePlayerCard(ballNumber)) {
                this.eventSource.close()
            }
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
            const fifteenNumbers: number[] = Array.from({length: 15}, (_, i: number) => i + lowerBound) // 1–15, or 16–29, etc.
            return Array.from({length: 5}, () => {  // Choose 5 randomly
                    const selectedNumberIndex = Math.floor(Math.random() * fifteenNumbers.length)
                    const selectedNumber: number = fifteenNumbers.splice(selectedNumberIndex, 1)[0]
                    return selectedNumber
                }
            )
        }

        for (let colIndex = 0; colIndex < this.NUMBER_OF_LETTERS; colIndex++) {
            const selectedNums = selectFiveNumbers(colIndex * this.NUMBERS_PER_LETTER + 1)
            for (let rowIndex = 0; rowIndex < this.NUMBER_OF_LETTERS; rowIndex++) {
                this.playerCardCells[rowIndex * this.NUMBER_OF_LETTERS + colIndex].textContent = selectedNums[rowIndex].toString()
            }
        }
        const centerCellIndex = 2 * this.NUMBER_OF_LETTERS + Math.floor(this.NUMBER_OF_LETTERS / 2);
        const centerCell = this.playerCardCells[centerCellIndex];
        centerCell.textContent = "★"
        centerCell.classList.add('star')
    }

    private updatePlayerCard(ballNumber: number): boolean {
        this.playerCardCells.forEach(cell => {
            if (cell.textContent === ballNumber.toString()) {
                cell.classList.add('received')
            }
        })
        return this.playerWins()
    }

    private playerWins(): boolean {
        return this.horizontalWin() || this.verticalWin() || this.diagonalWin()
    }

    private horizontalWin(): boolean {
        for (let rowIndex = 0; rowIndex < this.NUMBER_OF_LETTERS ** 2; rowIndex += this.NUMBER_OF_LETTERS) {
            if (this.numHorizontalMarks(rowIndex) == this.NUMBER_OF_LETTERS) {
                return true
            }
        }
        return false
    }

    private verticalWin(): boolean {
        return false
    }

    private diagonalWin(): boolean {
        return false
    }

    private numHorizontalMarks(rowIndex: number) {
        let marks = 0
        for (let columnIndex = rowIndex; columnIndex < rowIndex + 5; columnIndex++)
            if (this.cellIsMarked(columnIndex))
                ++marks
        return marks
    }

    private cellIsMarked(cellIndex: number) {
        return this.playerCardCells[cellIndex].classList.contains('received');
    }
}

new Bingo()
