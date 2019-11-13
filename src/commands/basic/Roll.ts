import { Command, CommandoClient, CommandMessage } from 'discord.js-commando';
import { Message } from 'discord.js';

module.exports = class RollCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'roll',
            group: 'basic', 
            memberName: 'roll',
            description: 'Rolls a random number between 1 and 100'
        });
    }

    public async run(message: CommandMessage): Promise<Message | Message[]> {
        const roll = Math.floor(Math.random() * 100) + 1;
        return message.say(`${message.author} rolled ${roll}.`);
    }
};