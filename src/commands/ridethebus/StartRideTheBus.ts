import { Command, CommandoClient, CommandMessage } from "discord.js-commando";
import { Message } from "discord.js";
import { sendEmbedSuccess, sendEmbedError } from "../../models/Misc";
import { RideTheBus, GameStatus } from "../../models/ridethebus/RideTheBus";

module.exports = class CreateGuildCommandCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'rtb',
            group: 'ridethebus', 
            memberName: 'startridethebus',
            description: 'Start a game of ride the bus'
        });
    }

    public async run(message: CommandMessage): Promise<Message | Message[]> {
        const currentGame: RideTheBus = (<any>this.client).rideTheBus;

        if(currentGame.gameStatus == GameStatus.ClosedForRegistration) {
            currentGame.gameStatus = GameStatus.OpenForRegistration;
            return sendEmbedSuccess(message, `You can now participate the game by typing \`${this.client.commandPrefix}joinridethebus\`.`);
        }
        else if(currentGame.gameStatus == GameStatus.OpenForRegistration) {
            currentGame.gameStatus = GameStatus.Ongoing;
            return sendEmbedSuccess(message, `We are now starting the game! \nGuess what colour of the card you are gonna draw, type \`${this.client.commandPrefix}pick <red/black>\``);
        }
        
        return sendEmbedError(message, "hi");
    }
};