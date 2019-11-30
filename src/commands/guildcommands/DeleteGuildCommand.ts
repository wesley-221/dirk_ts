import { Command, CommandoClient, CommandMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import { sendEmbedSuccess, sendEmbedError } from '../../models/Misc';
import { MySQL } from '../../models/MySQL';
import { DynamicCommand, CommandType } from '../../models/DynamicCommand';
import { ServerPermissionRole } from '../../models/ServerPermissionRole';
import { CacheService } from '../../services/cache';

module.exports = class CreateGuildCommandCommand extends Command {
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
    }

    public hasPermission(message: CommandMessage) {
        const serverPermissionRole: ServerPermissionRole | null = (<CacheService>(<any>this.client).cache).getServerPermission(message.guild.id);

        return ((serverPermissionRole != null && (
                    message.member.roles.get(serverPermissionRole.getModeratorRole()) != undefined || 
                    message.member.roles.get(serverPermissionRole.getAdministratorRole()) != undefined)) || 
            message.member.hasPermission(['ADMINISTRATOR']));
    }

    public async run(message: CommandMessage, args: { commandName: string, message: string }): Promise<Message | Message[]> {
        const mysql = new MySQL();
        const [command]: any = await mysql.query('SELECT * FROM command WHERE commandName = ? AND commandType = "Guild"', [args.commandName]);

        if(command) {
            const newCommand = new DynamicCommand(message.guild.id, args.commandName, CommandType.Guild, args.message, message.author.id);
            await newCommand.delete();

            return sendEmbedSuccess(message, `Successfully deleted the guild command \`${args.commandName}\`.`);
        }
        else {
            return sendEmbedError(message, `The command \`${args.commandName}\` does not exist. Please try a different name.`);
        }
    }
};