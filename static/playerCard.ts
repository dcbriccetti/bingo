class PlayerCard {
    public readonly cells: NodeListOf<HTMLTableDataCellElement>

    constructor(cardId: string) {
        this.cells = document.querySelectorAll(`#${cardId} td`)
        this.create()
    }

    /** Puts randomly selected numbers, in the right range, in each of the 5 Bâ¦O columns */
    private create(): void {

        /**
         * Returns an array of five numbers randomly selected from the 15 integers starting with lowerBound
         * @param lowerBound the lower number in the range of 15 numbers
         */
        function selectFiveNumbers(lowerBound: number): number[] {
            const fifteenNumbers: number[] = Array.from({length: 15}, (_, i: number) => i + lowerBound) // 1â15, or 16â29, etc.
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
            centerCell.textContent = "â"
            centerCell.classList.add('star')
            centerCell.classList.add('received')
        }

        for (let colIndex = 0; colIndex < NUMBER_OF_LETTERS; colIndex++) {
            const selectedNums = selectFiveNumbers(colIndex * NUMBERS_PER_LETTER + 1)
            for (let rowIndex = 0; rowIndex < NUMBER_OF_LETTERS; rowIndex++) {
                this.cells[rowIndex * NUMBER_OF_LETTERS + colIndex].textContent = selectedNums[rowIndex].toString()
            }
        }

        setStarInCenter(NUMBER_OF_LETTERS, this.cells)
    }

    /**
     * Updates the player card with the number given and returns whether the player wins
     * @param ballNumber the number to mark on the player card
     */
    public update(ballNumber: number): boolean {
        this.cells.forEach(cell => {
            if (cell.textContent === ballNumber.toString()) {
                cell.classList.add('received')
            }
        })
        const playerWins = this.horizontalWin() || this.verticalWin() || this.eitherDiagonalWin()
        return playerWins
    }

    /** Returns whether there is a horizontal win */
    private horizontalWin(): boolean {
        return this.horizontalOrVerticalWin(5)
    }

    /** Returns whether there is a vertical win */
    private verticalWin(): boolean {
        return this.horizontalOrVerticalWin(1)
    }

    /**
     * Returns whether there is a horizontal or vertical win
     * @param outerSpacing distance between cells (in the 1-dimensional array of cells) for rows or columns (1 or 5)
     */
    private horizontalOrVerticalWin(outerSpacing: number): boolean {
        const increment = outerSpacing === 5 ? 1 : 5
        for (let c = 0, cellIndex = 0; c < 5; ++c, cellIndex += outerSpacing) {
            const marks = this.markedIndexes(cellIndex, increment)
            if (marks.length === 5) {
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
     */
    private diagonalWin(indexStart: number, indexSpacing: number) {
        const markIndexes = this.markedIndexes(indexStart, indexSpacing)
        if (markIndexes.length === 5) {
            this.markWinning(markIndexes)
            return true
        }
        return false
    }

    private eitherDiagonalWin(): boolean {
        return this.diagonalWin(4, 4) || this.diagonalWin(0, 6)
    }

    private markedIndexes(cellIndex: number, increment: number): number[] {
        let indexes = []
        for (let c = 0, columnIndex = cellIndex; c < 5; ++c, columnIndex += increment)
            if (this.cellIsMarked(columnIndex))
                indexes.push(columnIndex)
        return indexes
    }

    private cellIsMarked(cellIndex: number) {
        return this.cells[cellIndex].classList.contains('received');
    }

    private markWinning(markedIndexes: number[]) {
        markedIndexes.forEach(i => this.cells[i].classList.add('winning-cell'))
    }

}
