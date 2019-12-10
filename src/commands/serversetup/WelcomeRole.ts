import { Command, CommandoClient, CommandMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import { sendEmbedSuccess, sendEmbedError } from '../../models/Misc';
import { MySQL } from '../../models/MySQL';
import { Permission, PermissionNames } from '../../models/Permission';

module.exports = class WelcomeRoleCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'welcomerole',
            group: 'serversetup', 
            memberName: 'welcomerole',
            aliases: ['wr'], 
            description: 'Give the user a role when they join the server.',
            guildOnly: true,
            args: [
                {
                    key: "role",
                    prompt: "Highlight the role you wish to give to the user when they join the server",
                    type: "string"
                }
            ]
        });
    }

    public hasPermission(message: CommandMessage) {
        const permission = new Permission(this.client);
        return permission.checkPermission(message, PermissionNames.Administrator);
    }

    public async run(message: CommandMessage, args: { role: string }): Promise<Message | Message[]> {
        const   mysql = new MySQL(),
                roleId = args.role.replace(/[<|@|&|>]/g, '');

        const role = message.guild.roles.get(roleId);

        if(role != undefined) {
            const [recordExist]: any = await mysql.query('SELECT welcomeRole FROM wmtoggle WHERE serverID = ?', [message.guild.id]);

            if(!recordExist) {
                await mysql.query('INSERT INTO wmtoggle SET serverID = ?, channelID = ?, welcomeRole = ?', [message.guild.id, message.channel.id, role.id]);
            }
            else {
                await mysql.query('UPDATE wmtoggle SET welcomeRole = ? WHERE serverID = ?', [role.id, message.guild.id]);
            }

            return sendEmbedSuccess(message, `I will now add the role <@&${role.id}> whenever someone joins this server.`);
        }

        return sendEmbedError(message, `Invalid role given. Please try again.`);
    }
};