import { CommandoClient } from "discord.js-commando";
import { GuildMember, Guild } from "discord.js";
import { MySQL } from "../models/MySQL";
import { sendEmbed } from "../models/Misc";

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

        const [welcome]: any = await mysql.query('SELECT serverID, channelID, welcomeMessage FROM wmtoggle WHERE serverID = ? AND welcomeEnabled = 1', [this.guildId]);

        if(welcome) {
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
    }
}