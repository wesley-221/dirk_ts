import { Command, CommandoClient, CommandMessage } from "discord.js-commando";
import { Message } from "discord.js";
import { sendEmbedSuccess, sendEmbedError } from "../../models/Misc";
import { RideTheBus, GameStatus } from "../../models/ridethebus/RideTheBus";
import { Participant } from "../../models/ridethebus/Participant";

module.exports = class CreateGuildCommandCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'joinridethebus',
            group: 'ridethebus', 
            memberName: 'joinridethebus',
            description: 'Join a game of ride the bus'
        });
    }

    public async run(message: CommandMessage): Promise<Message | Message[]> {
        const currentGame: RideTheBus = (<any>this.client).rideTheBus;

        if(currentGame.gameStatus != GameStatus.OpenForRegistration) {
            return sendEmbedError(message, `You can't participate. Current game status: ${GameStatus[currentGame.gameStatus]}`);
        }

        const participant = new Participant(message.member.id);
        const join = currentGame.addPlayerToGame(participant);

        if(join == "success") {
            return sendEmbedSuccess(message, `You are now participating in ride the bus!`);
        }
        else {
            return sendEmbedError(message, join);
        }
    }
};