/** Client code for the Bingo simulator */
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
        const playerWins = this.horizontalWin() || this.verticalWin() || this.eitherDiagonalWin()
        return playerWins
    }

    /** Returns whether there is a horizontal win */
    private horizontalWin(): boolean {
        return this.horizontalOrVerticalWin(5, 25, 1)
    }

    /** Returns whether there is a vertical win */
    private verticalWin(): boolean {
        return this.horizontalOrVerticalWin(1, 5, 5)
    }

    /**
     * Returns whether there is a horizontal or vertical win
     * @param outerSpacing distance between cells (in the 1-dimensional array of cells) for rows or columns (1 or 5)
     * @param maxCellIndex the maximum cell index
     * @param increment
     * @private
     */
    private horizontalOrVerticalWin(outerSpacing: number, maxCellIndex: number, increment: number): boolean {
        for (let cellIndex = 0; cellIndex < maxCellIndex; cellIndex += outerSpacing) {
            const marks = this.marks(cellIndex, increment)
            if (marks.length == 5) {
                this.markWinning(marks)
                return true
            }
        }
        return false
    }

    /**
     * Returns whether the diagonal defined by indexStart and indexSpacing is fully marked
     * @param indexStart is the beginning of the numbers diagonalWin checks
     * @param indexSpacing is the space between elements of the diagonal
     * @private
     */
    private diagonalWin(indexStart: number, indexSpacing: number) {
        let markIndexes = []
        for (let c = 0, cellIndex = indexStart; c < 5; ++c, cellIndex += indexSpacing) {
            if (this.cellIsMarked(cellIndex)){
                markIndexes.push(cellIndex)
            }
        }
        if (markIndexes.length === 5) {
            this.markWinning(markIndexes)
            return true
        }
        return false
    }

    private eitherDiagonalWin(): boolean {
        return this.diagonalWin(4, 4) || this.diagonalWin(0, 6)
    }

    private marks(cellIndex: number, increment: number): number[] {
        let markedIndexes = []
        for (let c = 0, columnIndex = cellIndex; c < 5; ++c, columnIndex += increment)
            if (this.cellIsMarked(columnIndex))
                markedIndexes.push(columnIndex)
        return markedIndexes
    }

    private cellIsMarked(cellIndex: number) {
        return this.playerCardCells[cellIndex].classList.contains('received');
    }

    private markWinning(markedIndexes: number[]) {
        markedIndexes.forEach(i => this.playerCardCells[i].classList.add('winning-cell'))
    }
}

new Bingo()
