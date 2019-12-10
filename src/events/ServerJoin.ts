import { CommandoClient } from "discord.js-commando";
import { GuildMember, Guild } from "discord.js";
import { MySQL } from "../models/MySQL";

export class ServerJoin {
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

        const [welcome]: any = await mysql.query('SELECT * FROM wmtoggle WHERE serverID = ?', [this.guildId]);

        if(welcome && welcome.welcomeEnabled == 1) {
            const parsedMessage = welcome.welcomeMessage
										.replace("{{user}}", `<@${this.newMember.user.id}>`)
										.replace("{{tag}}", `${this.newMember.user.tag}`)
                                        .replace("{{userid}}", `${this.newMember.user.id}`);
                                        
            (<any>this.newMember.guild.channels.get(welcome.channelID)).send({
                embed: {
                    color: 0x00FF00,
                    author: {
                        name: parsedMessage,
                        icon_url: this.newMember.user.avatarURL
                    },
                    footer: {
                        text: "User joined"
                    },
                    timestamp: new Date()
                }
            });
        }

        if(welcome && welcome.welcomeRole != null) {
            const role = this.newMember.guild.roles.get(welcome.welcomeRole);

            if(role != undefined) {
                this.newMember.addRole(role);
            }
        }
    }
}