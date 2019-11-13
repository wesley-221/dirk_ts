import { CommandoClient } from "discord.js-commando";
import { GuildMember } from "discord.js";
import { MySQL } from "../models/MySQL";

export class ServerLeave {
    private client: CommandoClient;
    private newMember: GuildMember;
    private guildId: string;

    constructor(client: CommandoClient, member: GuildMember) {
        this.client = client;
        this.newMember = member;

        this.guildId = member.guild.id;
    }

    async start() {
        const mysql = new MySQL();

        const [leave]: any = await mysql.query('SELECT serverID, channelID, leaveMessage FROM wmtoggle WHERE serverID = ? AND leaveEnabled = 1', [this.guildId]);

        if(leave) {
            const parsedMessage = leave.leaveMessage
										.replace("{{user}}", `<@${this.newMember.user.id}>`)
										.replace("{{tag}}", `${this.newMember.user.tag}`)
                                        .replace("{{userid}}", `${this.newMember.user.id}`);
                                        
            (<any>this.newMember.guild.channels.get(leave.channelID)).send({
                embed: {
                    color: 0xFFA500,
                    author: {
                        name: parsedMessage,
                        icon_url: this.newMember.user.avatarURL
                    },
                    footer: {
                        text: "User left"
                    },
                    timestamp: new Date()
                }
            });
        }
    }
}