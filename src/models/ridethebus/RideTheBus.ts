import { Participant } from "./Participant";
import { Card, CardValue, CardGroup } from "./Card";

export enum GameStatus {
    OpenForRegistration,
    ClosedForRegistration,
    Ongoing
}

export enum GamePhase {
    PickRedOrBlack,
    PickHigherOrLower,
    PickBetweenOrOutside,
    PickHaveSuit
}

export class RideTheBus {
    MAX_PARTICIPANTS = 10;

    participants: Participant[] = [];
    cardsInDeck: Card[] = [];

    gameStatus: GameStatus;
    gamePhase: GamePhase;

    peoplePicked: number = 0;

    constructor() {
        this.gameStatus = GameStatus.ClosedForRegistration;
        this.gamePhase = GamePhase.PickRedOrBlack;

        for(let cardGroup in CardGroup) {
            if(!isNaN(Number(cardGroup))) continue;

            let count = 1;

            for(let card in CardValue) {
                if(!isNaN(Number(card))) continue;
    
                this.cardsInDeck.push(new Card(count, card, cardGroup))

                count ++;
            }
        }
    }

    /**
     * Get the amount of pariticpants in the game
     */
    public getParticipantCount(): number {
        return this.participants.length;
    }

    /**
     * Add a participant to the game
     * @param participant the participant to add
     */
    public addPlayerToGame(addParticipant: Participant): string {
        if(this.getParticipantCount() >= this.MAX_PARTICIPANTS) return "Maximum amount of participants reached.";

        for(let participant in this.participants) {
            if(this.participants[participant].userId == addParticipant.userId) {
                return "You are already participating.";
            }
        }

        this.participants.push(addParticipant);

        return "success";
    }

    /**
     * Remove a participant from the game
     * @param participant the participant to remove
     */
    public removePlayerFromGame(removeParticipant: Participant): string {
        for(let participant in this.participants) {
            if(this.participants[participant].userId == removeParticipant.userId) {
                this.participants.splice(Number(participant), 1);

                return "success";
            }
        }

        return "You aren't participating.";
    }

    /**
     * Check if a user is participating in the current game
     * @param userId the user to check
     */
    public isUserParticipating(userId: string): boolean {
        for(let participant in this.participants) {
            if(this.participants[participant].userId == userId) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get the participant by the userid
     * @param userId the user to check
     */
    public getUserParticipating(userId: string): any {
        for(let participant in this.participants) {
            if(this.participants[participant].userId == userId) {
                return this.participants[participant];
            }
        }

        return null;
    }

    public pickRandomCard() {
        const cardIndexToPick = Math.floor(Math.random() * this.cardsInDeck.length);
        const card = Card.makeTrueCopy(this.cardsInDeck[cardIndexToPick]);

        this.cardsInDeck.splice(cardIndexToPick, 1);

        return card;        
    }
}