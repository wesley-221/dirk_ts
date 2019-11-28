import { Command, CommandoClient, CommandMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import { sendEmbedSuccess } from '../../models/Misc';

module.exports = class RemindMeCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'remindme',
            group: 'basic', 
            memberName: 'remindme',
            description: 'Sends you a highlight after X time with the given message.',
            args: [
                {
                    key: "amount",
                    prompt: "The amount of seconds/minutes/hours I should wait before sending the message",
                    type: "integer"
                },
                { 
                    key: "timeUnit",
                    prompt: "The time unit to use: second(s), minute(s), hour(s)",
                    type: "string", 
                    validate: (text: string) => ['second', 'seconds', 'minute', 'minutes', 'hour', 'hours'].indexOf(text) > -1
                }, 
                {
                    key: "reminderMessage",
                    prompt: "The reminder you want to receive",
                    type: "string"
                }
            ]
        });
    }

    public async run(message: CommandMessage, args: { amount: number, timeUnit: string, reminderMessage: string }): Promise<Message | Message[]> {
        const { amount, timeUnit, reminderMessage } = args;

        let finalTime = 0;

        switch(timeUnit) {
            case 'second': case 'seconds': 
                finalTime = amount * (1000);
                break;
            case 'minute': case 'minutes':
                finalTime = amount * (1000 * 60);
                break;
            case 'hour': case 'hours': 
                finalTime = amount * (1000 * 60 * 60);
                break;
        }

        setTimeout(() => {
            this.client.users.find(u => u.id == message.author.id).send({
                "embed": {
                    author: {
                        name: 'Reminder'
                    },
                    thumbnail: {
                        url: this.client.user.avatarURL
                    },
                    description: reminderMessage,
                    color: 0xFF0000,
                    timestamp: new Date()
                }
            });
        }, finalTime);

        return sendEmbedSuccess(message, `${message.author}, will remind you in ${amount} ${timeUnit}.`);
    }
};