import { Command, CommandoClient, CommandMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import { sendEmbedError, sendEmbedSuccess } from '../../models/Misc';
import { ServerPermissionRole } from '../../models/ServerPermissionRole';
import { CacheService } from '../../services/cache';

module.exports = class DeleteTeamCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'deleteteam',
            group: 'teams', 
            memberName: 'deleteteam',
            description: 'Deletes a team',
            args: [
                {
                    key: "teamName",
                    label: "team name", 
                    prompt: "Enter the name of the team you want to delete",
                    type: "string",
                    min: 3,
                    max: 20
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

    public async run(message: CommandMessage, args: { teamName: string }): Promise<Message | Message[]> {
        if(message.guild.channels.filter(c => c.name == args.teamName).size == 0) {
            return sendEmbedError(message, `The team "${args.teamName}" doesn't exist. Please try again.`);
        }

        message.guild.channels.forEach(async channel => {
            if(channel.name == args.teamName) {
                await channel.delete();
            }
        });

        await message.guild.roles.filter(r => r.name == args.teamName).first().delete();

        return sendEmbedSuccess(message, `Succesfully deleted the team "${args.teamName}".`);
    }
};