import { Command, CommandoClient, CommandMessage } from "discord.js-commando";
import { Message } from "discord.js";
import { RideTheBus, GameStatus } from "../../models/ridethebus/RideTheBus";

module.exports = class CreateGuildCommandCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'ridethebusstatus',
            group: 'ridethebus', 
            memberName: 'ridethebusstatus',
            description: 'Get the status of ride the bus'
        });
    }

    public async run(message: CommandMessage): Promise<Message | Message[]> {
        const currentGame: RideTheBus = (<any>this.client).rideTheBus;

        let users = [
            {
                name: "Status",
                value: `${GameStatus[currentGame.gameStatus]}`,
                inline: true
            },
            {
                name: "Participants",
                value: `${currentGame.getParticipantCount()}/${currentGame.MAX_PARTICIPANTS}`,
                inline: true
            }
        ];

        for(let participant in currentGame.participants) {
            users.push({
                name: `Username`,
                value: `${(await this.client.fetchUser(currentGame.participants[participant].userId)).username}`,
                inline: false
            })
        }

        return message.embed({
            color: 0xef6da7,
            fields: users
        })
    }
};