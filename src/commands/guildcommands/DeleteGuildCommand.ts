import { Command, CommandoClient, CommandMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import { sendEmbedSuccess, sendEmbedError } from '../../models/Misc';
import { MySQL } from '../../models/MySQL';
import { DynamicCommand, CommandType } from '../../models/DynamicCommand';
import { Permission, PermissionNames } from '../../models/Permission';

module.exports = class CreateGuildCommandCommand extends Command {
    private mysql: MySQL;

    constructor(client: CommandoClient) {
        super(client, {
            name: 'deleteguildcommand',
            group: 'guildcommands', 
            memberName: 'deleteguildcommand',
            description: 'Delete an existing guild command.',
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

        this.mysql = new MySQL(client);
    }

    public hasPermission(message: CommandMessage) {
        const permission = new Permission(this.client);
        return permission.checkPermission(message, PermissionNames.Moderator);
    }

    public async run(message: CommandMessage, args: { commandName: string, message: string }): Promise<Message | Message[]> {
        const [command]: any = await this.mysql.query('SELECT * FROM command WHERE commandName = ? AND commandType = "Guild"', [args.commandName]);

        if(command) {
            const newCommand = new DynamicCommand(this.client, message.guild.id, args.commandName, CommandType.Guild, args.message, message.author.id);
            await newCommand.delete();

            return sendEmbedSuccess(message, `Successfully deleted the guild command \`${args.commandName}\`.`);
        }
        else {
            return sendEmbedError(message, `The command \`${args.commandName}\` does not exist. Please try a different name.`);
        }
    }
};