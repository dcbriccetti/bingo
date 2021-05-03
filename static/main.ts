class Bingo {
    private readonly eventSource: EventSource
    private readonly playerCardCells: NodeListOf<HTMLTableDataCellElement>
    private readonly NUMBER_OF_LETTERS = 5
    private readonly NUMBERS_PER_LETTER = 15

    constructor() {
        this.eventSource = new EventSource('/events')
        this.playerCardCells = document.querySelectorAll('#player-card td')

        this.createReceivedDisplay()
        this.createPlayerCard()

        this.eventSource.onmessage = event => {
            const ballNumber: number = parseInt(event.data)
            this.receivedDisplayCellFor(ballNumber).classList.add('received')
            if (this.updatePlayerCard(ballNumber)) {
                this.eventSource.close()
            }
        }

        this.eventSource.onerror = () => {
            // Stop EventSource from reconnecting after all data is sent
            this.eventSource.close()
        }

    }

    /** Sets the numbers 1 to 75, 15 per column B to O, on the received display */
    private createReceivedDisplay() {
        for (let i = 1; i <= 75; i++)
            this.receivedDisplayCellFor(i).textContent = i.toString()
    }

    /**
     * Returns the HTMLTableDataCellElement for the ball number given
     * @param ballNumber a number from 1 to 75
     */
    private receivedDisplayCellFor(ballNumber: number): HTMLTableDataCellElement {
        const zeroBasedNumber = ballNumber - 1
        const colIndex = Math.floor(zeroBasedNumber / this.NUMBERS_PER_LETTER)
        const rowIndex = zeroBasedNumber % this.NUMBERS_PER_LETTER
        const receivedCells: NodeListOf<HTMLTableDataCellElement> = document.querySelectorAll('#balls-received td')
        return receivedCells[rowIndex * this.NUMBER_OF_LETTERS + colIndex]
    }

    /** Puts randomly selected numbers, in the right range, in each of the 5 B…O columns */
    private createPlayerCard(): void {

        /**
         * Returns an array of five numbers randomly selected from the 15 integers starting with lowerBound
         * @param lowerBound the lower number in the range of 15 numbers
         */
        function selectFiveNumbers(lowerBound: number): number[] {
            const fifteenNumbers: number[] = Array.from({length: 15}, (_, i: number) => i + lowerBound) // 1–15, or 16–29, etc.
            return Array.from({length: 5}, () => {  // Choose 5 randomly
                    const selectedNumberIndex = Math.floor(Math.random() * fifteenNumbers.length)
                    const selectedNumber: number = fifteenNumbers.splice(selectedNumberIndex, 1)[0]
                    return selectedNumber
                }
            )
        }

        function setStarInCenter(numLetters: number, playerCardCells: NodeListOf<HTMLTableDataCellElement>) {
            const centerCellIndex = 2 * numLetters + Math.floor(numLetters / 2)
            const centerCell = playerCardCells[centerCellIndex]
            centerCell.textContent = "★"
            centerCell.classList.add('star')
            centerCell.classList.add('received')
        }

        for (let colIndex = 0; colIndex < this.NUMBER_OF_LETTERS; colIndex++) {
            const selectedNums = selectFiveNumbers(colIndex * this.NUMBERS_PER_LETTER + 1)
            for (let rowIndex = 0; rowIndex < this.NUMBER_OF_LETTERS; rowIndex++) {
                this.playerCardCells[rowIndex * this.NUMBER_OF_LETTERS + colIndex].textContent = selectedNums[rowIndex].toString()
            }
        }

        setStarInCenter(this.NUMBER_OF_LETTERS, this.playerCardCells)
    }

    /**
     * Updates the player card with the number given and returns whether the player wins
     * @param ballNumber the number to mark on the player card
     */
    private updatePlayerCard(ballNumber: number): boolean {
        this.playerCardCells.forEach(cell => {
            if (cell.textContent === ballNumber.toString()) {
                cell.classList.add('received')
            }
        })
        const playerWins = this.horizontalWin() || this.verticalWin() || this.diagonalWin()
        return playerWins
    }

    private horizontalWin(): boolean {
        const numLetters = this.NUMBER_OF_LETTERS;
        for (let cellIndex = 0; cellIndex < numLetters ** 2; cellIndex += numLetters) {
            if (this.numHorizontalMarks(cellIndex) == numLetters) {
                for (let i = cellIndex; i < cellIndex + 5; i++) {
                    this.playerCardCells[i].classList.add('winning-cell')
                }
                return true
            }
        }
        return false
    }

    private verticalWin(): boolean {
        const numLetters = this.NUMBER_OF_LETTERS;
        for (let cellIndex = 0; cellIndex < 4; cellIndex++) {
            if (this.numVerticalMarks(cellIndex) == numLetters) {
                for (let i = cellIndex; i < 25; i += 5) {
                    this.playerCardCells[i].classList.add('winning-cell')
                }
                return true
            }
        }
        return false
    }

    private diagonalWin(): boolean {

        return false
    }

    private numHorizontalMarks(rowIndex: number): number {
        let numMarks = 0
        for (let columnIndex = rowIndex; columnIndex < rowIndex + 5; columnIndex++)
            if (this.cellIsMarked(columnIndex))
                ++numMarks
        return numMarks
    }

    private numVerticalMarks(cellIndex: number): number {
        let numMarks = 0
        for (let columnCellIndex = cellIndex; columnCellIndex < 25; columnCellIndex += 5)
            if (this.cellIsMarked(columnCellIndex))
                ++numMarks
        return numMarks
    }

    private cellIsMarked(cellIndex: number) {
        return this.playerCardCells[cellIndex].classList.contains('received');
    }
}

new Bingo()
