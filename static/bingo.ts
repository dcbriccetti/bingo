/** Client code for the Bingo simulator */
const NUMBER_OF_LETTERS = 5
const NUMBERS_PER_LETTER = 15

class Bingo {
    private readonly eventSource: EventSource
    private readonly playerCard: PlayerCard

    constructor() {
        this.eventSource = new EventSource('/events')
        this.playerCard = new PlayerCard('player-card-1')

        this.createReceivedDisplay()

        this.eventSource.onmessage = event => {
            const ballNumber: number = parseInt(event.data)
            this.receivedDisplayCellFor(ballNumber).classList.add('received')
            if (this.playerCard.update(ballNumber)) {
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
        const colIndex = Math.floor(zeroBasedNumber / NUMBERS_PER_LETTER)
        const rowIndex = zeroBasedNumber % NUMBERS_PER_LETTER
        const receivedCells: NodeListOf<HTMLTableDataCellElement> = document.querySelectorAll('#balls-received td')
        return receivedCells[rowIndex * NUMBER_OF_LETTERS + colIndex]
    }
}
