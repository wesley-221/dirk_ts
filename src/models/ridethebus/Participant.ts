import { Card } from "./Card";

export class Participant {
    userId: string;
    cardInHand: Card[] = [];

    nextGuess: string = "";

    constructor(userId: string) {
        this.userId = userId;
    }

    giveCard(card: Card) {
        this.cardInHand.push(card);
    }

    getAllCards() {
        let cards = [];

        for(let card in this.cardInHand) {
            cards.push(`**${this.cardInHand[card].cardValue} ${this.cardInHand[card].cardGroup}**`)
        }

        return cards.join(", ");
    }
}