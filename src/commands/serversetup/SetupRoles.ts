import { Command, CommandoClient, CommandMessage } from 'discord.js-commando';
import { Message, Role } from 'discord.js';
import { sendEmbedSuccess } from '../../models/Misc';
import { MySQL } from '../../models/MySQL';
import { ServerPermissionRole } from '../../models/ServerPermissionRole';
import { CacheService } from '../../services/cache';
import { PermissionNames, Permission } from '../../models/Permission';

module.exports = class SetupRolesCommand extends Command {
    private mysql: MySQL;

    constructor(client: CommandoClient) {
        super(client, {
            name: 'setuproles',
            group: 'serversetup', 
            memberName: 'setuproles',
            description: 'Setup various moderation roles with the server roles',
            guildOnly: true, 
            args: [
                {
                    key: "moderatorRole",
                    label: "moderator role", 
                    prompt: "Mention the role that is considered a moderator. \n**Note:** the role has to be mentionable, you can remove this once this is set up.",
                    type: "role",
                    min: 3,
                    max: 20
                },
                {
                    key: "administratorRole",
                    label: "administrator role", 
                    prompt: "Mention the role that is considered an administrator. \n**Note:** the role has to be mentionable, you can remove this once this is set up.",
                    type: "role",
                    min: 3,
                    max: 20
                },
            ]
        });

        this.mysql = new MySQL(client);
    }

    public hasPermission(message: CommandMessage) {
        const permission = new Permission(this.client);
        return permission.checkPermission(message, PermissionNames.Administrator);
    }

    public async run(message: CommandMessage, args: { moderatorRole: Role, administratorRole: Role }): Promise<Message | Message[]> {
        const [settingsExist]: any = await this.mysql.query('SELECT * FROM permissionroles WHERE serverID = ?', [message.guild.id]);

        if(settingsExist != undefined) {
            await this.mysql.query('UPDATE permissionroles SET moderatorRole = ?, administratorRole = ? WHERE serverID = ?', [
                args.moderatorRole.id,
                args.administratorRole.id,
                message.guild.id
            ]);

            (<CacheService>(<any>this.client).cache).updateServerPermission(new ServerPermissionRole(message.guild.id, args.moderatorRole.id, args.administratorRole.id));
        }
        else {
            await this.mysql.query('INSERT INTO permissionroles SET serverID = ?, moderatorRole = ?, administratorRole = ?', [
                message.guild.id,
                args.moderatorRole.id,
                args.administratorRole.id,
            ]);

            (<CacheService>(<any>this.client).cache).addServerPermission(new ServerPermissionRole(message.guild.id, args.moderatorRole.id, args.administratorRole.id));
        }

        return sendEmbedSuccess(message, `Successfully updated the roles for moderator and administrator.`);
    }
};