import { Command, CommandoClient, CommandMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import { sendEmbedSuccess, sendEmbedError } from '../../models/Misc';
import { MySQL } from '../../models/MySQL';
import { DynamicCommand, CommandType } from '../../models/DynamicCommand';

module.exports = class EditGlobalCommandCommand extends Command {
    private mysql: MySQL;

    constructor(client: CommandoClient) {
        super(client, {
            name: 'editglobalcommand',
            group: 'globalcommands', 
            memberName: 'editglobalcommand',
            description: 'Edit an existing global command that can be used in any server.',
            ownerOnly: true,
            args: [
                {
                    key: "commandName",
                    label: "command name", 
                    prompt: "Enter the name of the command you want to edit",
                    type: "string",
                    min: 3,
                    max: 20
                },
                { 
                    key: "message",
                    label: "message",
                    prompt: "Enter the message that will be send when the command is executed",
                    type: "string", 
                    min: 3, 
                    max: 300
                }
            ]
        });
        
        this.mysql = new MySQL(client);
    }

    public async run(message: CommandMessage, args: { commandName: string, message: string }): Promise<Message | Message[]> {
        const [command]: any = await this.mysql.query('SELECT * FROM command WHERE commandName = ? AND commandType = "global"', [args.commandName]);

        if(command) {
            const newCommand = new DynamicCommand(this.client, "0", args.commandName, CommandType.Global, args.message, message.author.id);
            await newCommand.update();

            return sendEmbedSuccess(message, `Successfully edited the global command \`${args.commandName}\`: \`${args.message}\`.`);
        }
        else {
            return sendEmbedError(message, `The command \`${args.commandName}\` does not exist. Please try a different name.`);
        }
    }
};