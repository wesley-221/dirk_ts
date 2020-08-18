import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import { sendEmbedSuccess, sendEmbedError } from '../../models/Misc';
import { MySQL } from '../../models/MySQL';
import { DynamicCommand, CommandType } from '../../models/DynamicCommand';

module.exports = class CreateGlobalCommandCommand extends Command {
    private mysql: MySQL;

    constructor(client: CommandoClient) {
        super(client, {
            name: 'createglobalcommand',
            group: 'globalcommands', 
            memberName: 'createglobalcommand',
            description: 'Create a new global command that can be used in any server.',
            ownerOnly: true,
            args: [
                {
                    key: "commandName",
                    label: "command name", 
                    prompt: "Enter the name of the new command",
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

    public async run(message: CommandoMessage, args: { commandName: string, message: string }): Promise<Message | Message[]> {
        // Check for "static" commands
        if(this.client.registry.findCommands(args.commandName).length > 0) {
            return sendEmbedError(message, `The command \`${args.commandName}\` already exists. Please try a different name.`);
        }

        const [command]: any = await this.mysql.query('SELECT * FROM command WHERE commandName = ? AND commandType = "global"', [args.commandName]);

        if(command) {
            return sendEmbedError(message, `The command \`${args.commandName}\` already exists. Please try a different name.`);
        }
        else {
            const newCommand = new DynamicCommand(this.client, "0", args.commandName, CommandType.Global, args.message, message.author.id);
            await newCommand.create();
            
            return sendEmbedSuccess(message, `Successfully created the global command \`${args.commandName}\`: \`${args.message}\`.`);
        }
    }
};