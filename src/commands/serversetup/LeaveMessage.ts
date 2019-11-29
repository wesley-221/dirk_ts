import { Command, CommandoClient, CommandMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import { sendEmbedSuccess } from '../../models/Misc';
import { MySQL } from '../../models/MySQL';

module.exports = class LeaveMessageCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'leavemessage',
            group: 'serversetup', 
            memberName: 'leavemessage',
            aliases: ['lm'], 
            description: 'Enable or disable the leaving message in the current channel.',
            guildOnly: true,
            args: [
                {
                    key: "status",
                    prompt: "Do you want to enable or disable the leaving message, type `enable` or `disable`",
                    type: "string",
                    validate: (text: string) => ['enable', 'disable'].indexOf(text) > -1
                },
                { 
                    key: "message",
                    prompt: "**Note:** If you want to disable the leaving message you can just enter one character here. \n\nThe message to send when someone leaves the server, example: `{{tag}} ({{userid}})` \n\nUse `{{tag}}` to display the username and tag \nUse `{{userid}}` to display the userid",
                    type: "string",
                    default: "{{tag}} ({{userid}})"
                }
            ]
        });
    }

    public hasPermission(message: CommandMessage) {
        return message.member.hasPermission(['ADMINISTRATOR']);
    }

    public async run(message: CommandMessage, args: { status: string, message: string }): Promise<Message | Message[]> {
        const mysql = new MySQL();

        if(args.status == "enable") {
            const [recordExist]: any = await mysql.query('SELECT leaveEnabled FROM wmtoggle WHERE serverID = ? AND channelID = ?', [message.guild.id, message.channel.id]);

            // There is no record yet, insert new one
            if(!recordExist) {
                await mysql.query('INSERT INTO wmtoggle SET serverID = ?, channelID = ?, leaveEnabled = 1, leaveMessage = ?', [
                    message.guild.id, 
                    message.channel.id,
                    args.message
                ]);

                return sendEmbedSuccess(message, `This channel will now receive a message when someone leaves this server.`);
            }
            // There is a record, update the existing one
            else {
                await mysql.query('UPDATE wmtoggle SET leaveEnabled = 1, leaveMessage = ? WHERE serverID = ? AND channelID = ?', [
                    args.message,
                    message.guild.id, 
                    message.channel.id
                ]);

                return sendEmbedSuccess(message, `This channel will now receive a message when someone leaves this server.`);
            }
        }
        else if(args.status == "disable") {
            const [recordExist]: any = await mysql.query('SELECT leaveEnabled FROM wmtoggle WHERE serverID = ? AND channelID = ?', [message.guild.id, message.channel.id]);

            // There is no record yet, insert new one
            if(!recordExist) {
                await mysql.query('INSERT INTO wmtoggle SET serverID = ?, channelID = ?, leaveEnabled = 0', [
                    message.guild.id, 
                    message.channel.id,
                ]);

                return sendEmbedSuccess(message, `This channel will no longer receive a message when someone leaves this server.`);
            }
            // There is a record, update the existing one
            else {
                await mysql.query('UPDATE wmtoggle SET leaveEnabled = 0 WHERE serverID = ? AND channelID = ?', [
                    message.guild.id, 
                    message.channel.id
                ]);

                return sendEmbedSuccess(message, `This channel will no longer receive a message when someone leaves this server.`);
            }
        }

        return sendEmbedSuccess(message, `Something magical happened here.`);
    }
};