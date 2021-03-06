import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import { sendEmbedSuccess, sendEmbedError } from '../../models/Misc';
import { MySQL } from '../../models/MySQL';
import { Permission, PermissionNames } from '../../models/Permission';

module.exports = class WelcomeRoleCommand extends Command {
    private mysql: MySQL;

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
        
        this.mysql = new MySQL(client);
    }

    public hasPermission(message: CommandoMessage) {
        const permission = new Permission(this.client);
        return permission.checkPermission(message, PermissionNames.Administrator);
    }

    public async run(message: CommandoMessage, args: { role: string }): Promise<Message | Message[]> {
        const roleId = args.role.replace(/[<|@|&|>]/g, '');

        const role = message.guild.roles.get(roleId);

        if(role != undefined) {
            const [recordExist]: any = await this.mysql.query('SELECT welcomeRole FROM wmtoggle WHERE serverID = ?', [message.guild.id]);

            if(!recordExist) {
                await this.mysql.query('INSERT INTO wmtoggle SET serverID = ?, channelID = ?, welcomeRole = ?', [message.guild.id, message.channel.id, role.id]);
            }
            else {
                await this.mysql.query('UPDATE wmtoggle SET welcomeRole = ? WHERE serverID = ?', [role.id, message.guild.id]);
            }

            return sendEmbedSuccess(message, `I will now add the role <@&${role.id}> whenever someone joins this server.`);
        }

        return sendEmbedError(message, `Invalid role given. Please try again.`);
    }
};