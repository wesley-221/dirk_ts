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
            name: 'createguildcommand',
            group: 'guildcommands', 
            memberName: 'createguildcommand',
            description: 'Create a new guild command that can be used only in this server.',
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
                    max: 50
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
        // Check for "static" commands
        if(this.client.registry.findCommands(args.commandName).length > 0) {
            return sendEmbedError(message, `The command \`${args.commandName}\` already exists. Please try a different name.`);
        }
        
        const mysql = new MySQL();
        const [command]: any = await mysql.query('SELECT * FROM command WHERE commandName = ? AND commandType = "guild"', [args.commandName]);

        if(command) {
            return sendEmbedError(message, `The command \`${args.commandName}\` already exists. Please try a different name.`);
        }
        else {
            const newCommand = new DynamicCommand(message.guild.id, args.commandName, CommandType.Guild, args.message, message.author.id);
            await newCommand.create();
            
            return sendEmbedSuccess(message, `Successfully created the guild command \`${args.commandName}\`: \`${args.message}\`.`);
        }
    }
};