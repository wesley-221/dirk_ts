import { Command, CommandoClient, CommandMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import { sendEmbedSuccess } from '../../models/Misc';
import { MySQL } from '../../models/MySQL';
import { ServerPermissionRole } from '../../models/ServerPermissionRole';
import { CacheService } from '../../services/cache';

module.exports = class WelcomeMessageCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'welcomemessage',
            group: 'serversetup', 
            memberName: 'welcomemessage',
            aliases: ['wm'], 
            description: 'Enable or disable the welcome message in the current channel.',
            guildOnly: true,
            args: [
                {
                    key: "status",
                    prompt: "Do you want to enable or disable the welcome message, type `enable` or `disable`",
                    type: "string",
                    validate: (text: string) => ['enable', 'disable'].indexOf(text) > -1
                },
                { 
                    key: "message",
                    prompt: "**Note:** If you want to disable the join message you can just enter one character here. \n\nThe message to send when someone joins the server, example: `{{tag}} ({{userid}})` \n\nUse `{{tag}}` to display the username and tag \nUse `{{userid}}` to display the userid",
                    type: "string",
                    default: "{{tag}} ({{userid}})"
                }
            ]
        });
    }

    public hasPermission(message: CommandMessage) {
        const serverPermissionRole: ServerPermissionRole | null = (<CacheService>(<any>this.client).cache).getServerPermission(message.guild.id);

        return ((serverPermissionRole != null && message.member.roles.get(serverPermissionRole.getAdministratorRole()) != undefined) || message.member.hasPermission(['ADMINISTRATOR']));
    }

    public async run(message: CommandMessage, args: { status: string, message: string }): Promise<Message | Message[]> {
        const mysql = new MySQL();

        if(args.status == "enable") {
            const [recordExist]: any = await mysql.query('SELECT welcomeEnabled FROM wmtoggle WHERE serverID = ? AND channelID = ?', [message.guild.id, message.channel.id]);

            // There is no record yet, insert new one
            if(!recordExist) {
                await mysql.query('INSERT INTO wmtoggle SET serverID = ?, channelID = ?, welcomeEnabled = 1, welcomeMessage = ?', [
                    message.guild.id, 
                    message.channel.id,
                    args.message
                ]);

                return sendEmbedSuccess(message, `This channel will now receive a message when someone joins this server.`);
            }
            // There is a record, update the existing one
            else {
                await mysql.query('UPDATE wmtoggle SET welcomeEnabled = 1, welcomeMessage = ? WHERE serverID = ? AND channelID = ?', [
                    args.message,
                    message.guild.id, 
                    message.channel.id
                ]);

                return sendEmbedSuccess(message, `This channel will now receive a message when someone joins this server.`);
            }
        }
        else if(args.status == "disable") {
            const [recordExist]: any = await mysql.query('SELECT welcomeEnabled FROM wmtoggle WHERE serverID = ? AND channelID = ?', [message.guild.id, message.channel.id]);

            // There is no record yet, insert new one
            if(!recordExist) {
                await mysql.query('INSERT INTO wmtoggle SET serverID = ?, channelID = ?, welcomeEnabled = 0', [
                    message.guild.id, 
                    message.channel.id
                ]);

                return sendEmbedSuccess(message, `This channel will no longer receive a message when someone joins this server.`);
            }
            // There is a record, update the existing one
            else {
                await mysql.query('UPDATE wmtoggle SET welcomeEnabled = 0 WHERE serverID = ? AND channelID = ?', [
                    message.guild.id, 
                    message.channel.id
                ]);

                return sendEmbedSuccess(message, `This channel will no longer receive a message when someone joins this server.`);
            }
        }

        return sendEmbedSuccess(message, `Something magical happened here.`);
    }
};