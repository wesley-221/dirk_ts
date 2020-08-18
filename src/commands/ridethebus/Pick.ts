import { Command, CommandoClient, CommandMessage } from "discord.js-commando";
import { Message } from "discord.js";
import { sendEmbedSuccess, sendEmbedError } from "../../models/Misc";
import { RideTheBus, GameStatus, GamePhase } from "../../models/ridethebus/RideTheBus";
import { Participant } from "../../models/ridethebus/Participant";
import { Card, CardGroup } from "../../models/ridethebus/Card";

module.exports = class CreateGuildCommandCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'pick',
            group: 'ridethebus', 
            memberName: 'pick',
            description: 'Pick a card',
            args: [
                {
                    key: "nextGuess",
                    label: "next guess", 
                    prompt: `Type \`<red/black/higher/lower/pole>\` depending on what part of the game you are`,
                    type: "string",
                    validate: (text: string) => ['red', 'black', 'higher', 'lower', 'pole', 'between', 'outside', 'have', 'donthave', 'rainbow'].indexOf(text) > -1
                }
            ]
        });
    }

    public async run(message: CommandMessage, args: { nextGuess: string }): Promise<Message | Message[]> {
        const currentGame: RideTheBus = (<any>this.client).rideTheBus;

        if(currentGame.gameStatus == GameStatus.Ongoing) {
            if(!currentGame.isUserParticipating(message.member.id)) {
                return sendEmbedError(message, `You are not participating in the current game.`);
            }

            const participant: Participant = currentGame.getUserParticipating(message.member.id);

            // ===========
            // First phase
            if(currentGame.gamePhase == GamePhase.PickRedOrBlack) {
                if(participant.nextGuess != "") {
                    return sendEmbedError(message, `You have already picked this round.`);
                }

                if(['red', 'black'].indexOf(args.nextGuess) > -1) {
                    participant.nextGuess = args.nextGuess;
                    currentGame.peoplePicked ++;

                    if(currentGame.peoplePicked == currentGame.getParticipantCount()) {
                        await sendEmbedSuccess(message, `<@${message.member.id}>, you have picked ${args.nextGuess}.`);

                        for(let participant in currentGame.participants) {
                            const pickedCard: Card = currentGame.pickRandomCard();
                            currentGame.participants[participant].giveCard(pickedCard);

                            let hasToDrink;

                            if(currentGame.participants[participant].nextGuess == "red") {
                                if(pickedCard.cardGroup == CardGroup[CardGroup.Heart] || pickedCard.cardGroup == CardGroup[CardGroup.Diamond]) {
                                    hasToDrink = false;
                                }
                                else {
                                    hasToDrink = true;
                                }
                            }
                            else if(currentGame.participants[participant].nextGuess == "black") {
                                if(pickedCard.cardGroup == CardGroup[CardGroup.Club] || pickedCard.cardGroup == CardGroup[CardGroup.Spade]) {
                                    hasToDrink = false;
                                }
                                else {
                                    hasToDrink = true;
                                }
                            }

                            await sendEmbedSuccess(message, `<@${currentGame.participants[participant].userId}>, you picked **${currentGame.participants[participant].nextGuess}**, you got **${pickedCard.cardValue} ${pickedCard.cardGroup}** - **${hasToDrink ? "You have to drink" : "You don't have to drink"}** \n\nCurrent cards: ${currentGame.participants[participant].getAllCards()}`);

                            // Reset nextGuess
                            currentGame.participants[participant].nextGuess = "";
                        }

                        // Reset peoplePicked
                        currentGame.peoplePicked = 0;
                        currentGame.gamePhase = GamePhase.PickHigherOrLower;

                        return sendEmbedSuccess(message, `Guess if the next card you are gonna draw is higher or lower than the one you have, type \`${this.client.commandPrefix}pick <higher/lower/pole>\``);
                    }

                    return sendEmbedSuccess(message, `<@${message.member.id}>, you have picked ${args.nextGuess}.`);
                }
                else {
                    return sendEmbedError(message, `<@${message.member.id}>, you can only guess between red or black, type \`${this.client.commandPrefix}pick <red/black>\``);
                }
            }
            // ============
            // Second phase
            else if(currentGame.gamePhase == GamePhase.PickHigherOrLower) {
                if(participant.nextGuess != "") {
                    return sendEmbedError(message, `You have already picked this round.`);
                }

                if(['higher', 'lower', 'pole'].indexOf(args.nextGuess) > -1) {
                    participant.nextGuess = args.nextGuess;
                    currentGame.peoplePicked ++;

                    if(currentGame.peoplePicked == currentGame.getParticipantCount()) {
                        await sendEmbedSuccess(message, `<@${message.member.id}>, you have picked ${args.nextGuess}.`);

                        for(let participant in currentGame.participants) {
                            const pickedCard: Card = currentGame.pickRandomCard();
                            currentGame.participants[participant].giveCard(pickedCard);

                            let hasToDrink, 
                                lastCard = currentGame.participants[participant].cardInHand[currentGame.participants[participant].cardInHand.length - 1];

                            if(currentGame.participants[participant].nextGuess == "higher") {
                                if(lastCard.cardScore > currentGame.participants[participant].cardInHand[0].cardScore) {
                                    hasToDrink = false;
                                }
                                else {
                                    hasToDrink = true;
                                }
                            }
                            else if(currentGame.participants[participant].nextGuess == "lower") {
                                if(lastCard.cardScore < currentGame.participants[participant].cardInHand[0].cardScore) {
                                    hasToDrink = false;
                                }
                                else {
                                    hasToDrink = true;
                                }
                            }
                            else if(currentGame.participants[participant].nextGuess == "pole") {
                                if(lastCard.cardScore == currentGame.participants[participant].cardInHand[0].cardScore) {
                                    hasToDrink = false;
                                }
                                else {
                                    hasToDrink = true;
                                }
                            }

                            await sendEmbedSuccess(message, `<@${currentGame.participants[participant].userId}>, you picked **${currentGame.participants[participant].nextGuess}**, you got **${pickedCard.cardValue} ${pickedCard.cardGroup}** - **${hasToDrink ? "You have to drink" : "You don't have to drink"}** \n\nCurrent cards: ${currentGame.participants[participant].getAllCards()}`);

                            // Reset nextGuess
                            currentGame.participants[participant].nextGuess = "";
                        }

                        // Reset peoplePicked
                        currentGame.peoplePicked = 0;
                        currentGame.gamePhase = GamePhase.PickBetweenOrOutside;

                        return sendEmbedSuccess(message, `Guess if the next card you are gonna draw is between or outside the one you have, type \`${this.client.commandPrefix}pick <between/outside/pole>\``);
                    }

                    return sendEmbedSuccess(message, `<@${message.member.id}>, you have picked ${args.nextGuess}.`);
                }
                else {
                    return sendEmbedError(message, `<@${message.member.id}>, you can only guess between higher, lower or pole, type \`${this.client.commandPrefix}pick <higher/lower/pole>\``);
                }
            }
            // ===========
            // Third phase
            else if(currentGame.gamePhase == GamePhase.PickBetweenOrOutside) {
                if(participant.nextGuess != "") {
                    return sendEmbedError(message, `You have already picked this round.`);
                }

                if(['between', 'outside', 'pole'].indexOf(args.nextGuess) > -1) {
                    participant.nextGuess = args.nextGuess;
                    currentGame.peoplePicked ++;

                    if(currentGame.peoplePicked == currentGame.getParticipantCount()) {
                        await sendEmbedSuccess(message, `<@${message.member.id}>, you have picked ${args.nextGuess}.`);

                        for(let participant in currentGame.participants) {
                            const pickedCard: Card = currentGame.pickRandomCard();
                            currentGame.participants[participant].giveCard(pickedCard);

                            let hasToDrink, 
                                firstCard = currentGame.participants[participant].cardInHand[0],
                                secondCard = currentGame.participants[participant].cardInHand[1],
                                lowestCard = firstCard > secondCard ? secondCard : firstCard,
                                highestCard = firstCard > secondCard ? firstCard : secondCard,
                                lastCard = currentGame.participants[participant].cardInHand[currentGame.participants[participant].cardInHand.length - 1];

                            if(currentGame.participants[participant].nextGuess == "between") {
                                if(lastCard.cardScore > lowestCard.cardScore && lastCard.cardScore < highestCard.cardScore) {
                                    hasToDrink = false;
                                }
                                else {
                                    hasToDrink = true;
                                }
                            }
                            else if(currentGame.participants[participant].nextGuess == "outside") {
                                if(lastCard.cardScore < lowestCard.cardScore || lastCard.cardScore > highestCard.cardScore) {
                                    hasToDrink = false;
                                }
                                else {
                                    hasToDrink = true;
                                }
                            }
                            else if(currentGame.participants[participant].nextGuess == "pole") {
                                if(currentGame.participants[participant].cardInHand[0].cardScore == lastCard.cardScore || currentGame.participants[participant].cardInHand[1].cardScore == lastCard.cardScore) {
                                    hasToDrink = false;
                                }
                                else {
                                    hasToDrink = true;
                                }
                            }

                            await sendEmbedSuccess(message, `<@${currentGame.participants[participant].userId}>, you picked **${currentGame.participants[participant].nextGuess}**, you got **${pickedCard.cardValue} ${pickedCard.cardGroup}** - **${hasToDrink ? "You have to drink" : "You don't have to drink"}** \n\nCurrent cards: ${currentGame.participants[participant].getAllCards()}`);

                            // Reset nextGuess
                            currentGame.participants[participant].nextGuess = "";
                        }

                        // Reset peoplePicked
                        currentGame.peoplePicked = 0;
                        currentGame.gamePhase = GamePhase.PickHaveSuit;

                        return sendEmbedSuccess(message, `Guess if the next card you are gonna draw has a suit you already have or rainbow (1 of each suit), type \`${this.client.commandPrefix}pick <have/donthave/rainbow>\``);
                    }

                    return sendEmbedSuccess(message, `<@${message.member.id}>, you have picked ${args.nextGuess}.`);
                }
                else {
                    return sendEmbedError(message, `<@${message.member.id}>, you can only guess between between, outside or pole, type \`${this.client.commandPrefix}pick <between/outside/pole>\``);
                }
            }
            // ============
            // Fourth phase
            else if(currentGame.gamePhase == GamePhase.PickHaveSuit) {
                if(participant.nextGuess != "") {
                    return sendEmbedError(message, `You have already picked this round.`);
                }

                if(['have', 'donthave', 'rainbow'].indexOf(args.nextGuess) > -1) {
                    participant.nextGuess = args.nextGuess;
                    currentGame.peoplePicked ++;

                    if(currentGame.peoplePicked == currentGame.getParticipantCount()) {
                        await sendEmbedSuccess(message, `<@${message.member.id}>, you have picked ${args.nextGuess}.`);

                        for(let participant in currentGame.participants) {
                            const pickedCard: Card = currentGame.pickRandomCard();
                            currentGame.participants[participant].giveCard(pickedCard);

                            let hasToDrink, 
                                lastCard = currentGame.participants[participant].cardInHand[currentGame.participants[participant].cardInHand.length - 1];

                            if(currentGame.participants[participant].nextGuess == "have") {
                                if(lastCard.cardGroup == currentGame.participants[participant].cardInHand[0].cardGroup ||
                                    lastCard.cardGroup == currentGame.participants[participant].cardInHand[1].cardGroup || 
                                    lastCard.cardGroup == currentGame.participants[participant].cardInHand[2].cardGroup) {
                                        hasToDrink = false;
                                    }
                                    else {
                                        hasToDrink = true;
                                    }
                            }
                            else if(currentGame.participants[participant].nextGuess == "donthave") {
                                if(!(lastCard.cardGroup == currentGame.participants[participant].cardInHand[0].cardGroup ||
                                    lastCard.cardGroup == currentGame.participants[participant].cardInHand[1].cardGroup || 
                                    lastCard.cardGroup == currentGame.participants[participant].cardInHand[2].cardGroup)) {
                                        hasToDrink = false;
                                    }
                                    else {
                                        hasToDrink = true;
                                    }
                            }
                            else if(currentGame.participants[participant].nextGuess == "rainbow") {
                                
                            }

                            await sendEmbedSuccess(message, `<@${currentGame.participants[participant].userId}>, you picked **${currentGame.participants[participant].nextGuess}**, you got **${pickedCard.cardValue} ${pickedCard.cardGroup}** - **${hasToDrink ? "You have to drink" : "You don't have to drink"}** \n\nCurrent cards: ${currentGame.participants[participant].getAllCards()}`);

                            // Reset nextGuess
                            currentGame.participants[participant].nextGuess = "";
                        }

                        // Reset peoplePicked
                        currentGame.peoplePicked = 0;
                        currentGame.gamePhase = GamePhase.PickHaveSuit;

                        return sendEmbedSuccess(message, `PYRAMIDE`);
                    }

                    // Reset peoplePicked
                    currentGame.peoplePicked = 0;
                    currentGame.gamePhase = GamePhase.PickHaveSuit;

                    return sendEmbedSuccess(message, `<@${message.member.id}>, you have picked ${args.nextGuess}.`);
                }
            }
            else {
                return sendEmbedError(message, "Should not happen");
            }
        }
        else {
            return sendEmbedError(message, `There is no game going on right now.`);
        }
    }
};