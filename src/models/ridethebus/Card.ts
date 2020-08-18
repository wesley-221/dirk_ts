export enum CardGroup {
    Heart,
    Spade,
    Diamond,
    Club
}

export enum CardValue {
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Jack",
    "Queen",
    "King",
    "Ace"
}

export class Card {
    cardScore: number;
    cardValue: string
    cardGroup: string;

    constructor(cardScore: number, cardValue: string, cardGroup: string) {
        this.cardScore = cardScore;
        this.cardValue = cardValue;
        this.cardGroup = cardGroup;
    }

    static makeTrueCopy(card: Card) {
        return new Card(card.cardScore, card.cardValue, card.cardGroup);
    }
}