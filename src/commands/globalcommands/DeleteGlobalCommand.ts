import { Command, CommandoClient, CommandMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import { sendEmbedSuccess, sendEmbedError } from '../../models/Misc';
import { MySQL } from '../../models/MySQL';
import { DynamicCommand, CommandType } from '../../models/DynamicCommand';

module.exports = class CreateGlobalCommandCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'deleteglobalcommand',
            group: 'globalcommands', 
            memberName: 'deleteglobalcommand',
            description: 'Delete an existing global command.',
            ownerOnly: true,
            args: [
                {
                    key: "commandName",
                    label: "command name", 
                    prompt: "Enter the name of the command you want to delete",
                    type: "string",
                    min: 3
                }
            ]
        });
    }

    public async run(message: CommandMessage, args: { commandName: string, message: string }): Promise<Message | Message[]> {
        const mysql = new MySQL();
        const [command]: any = await mysql.query('SELECT * FROM command WHERE commandName = ? AND commandType = "global"', [args.commandName]);

        if(command) {
            const newCommand = new DynamicCommand("0", args.commandName, CommandType.Global, args.message, message.author.id);
            await newCommand.delete();

            return sendEmbedSuccess(message, `Successfully deleted the global command \`${args.commandName}\`.`);
        }
        else {
            return sendEmbedError(message, `The command \`${args.commandName}\` does not exist. Please try a different name.`);
        }
    }
};