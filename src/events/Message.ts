import { CommandoClient, CommandoMessage } from "discord.js-commando";
import { MySQL } from "../models/MySQL";

export enum CommandTypes {
    Global = "global",
    Guild = "guild"
}

export class Message {
    private client: CommandoClient;
    private messageObject: CommandoMessage;
    private guildId: string;
    private channelId: string;
    private message: string;
    private mysql: MySQL;

    constructor(client: CommandoClient, message: CommandoMessage) {
        this.client = client;
        this.messageObject = message;

        if(message.guild != null) {
            this.guildId = message.guild.id;
        }
        else {
            this.guildId = "0";
        }
        
        this.channelId = message.channel.id;
        this.message = message.content;

        this.mysql = new MySQL(client);
    }

    async start() {
        // Check if the author is a bot
        if(this.messageObject.author.bot)
            return;

        if(this.isCommandMessage(this.message)) {
            const commandMessage = this.message.slice(this.client.commandPrefix.length, this.message.length);

            // Check if a "static" command was run
            if(this.client.registry.findCommands(commandMessage).length > 0) {
                return;
            }

            const [dbCommand]: any = await this.mysql.query('SELECT * FROM command WHERE commandName = ?', [commandMessage]);

            // Check if the command actually exists
            if(dbCommand != undefined) {
                // Command is a global command, execute anywhere
                if(dbCommand.commandType == CommandTypes.Global) {
                    this.messageObject.channel.send(dbCommand.commandMessage);
                }
                // Command is a guild specific command, check for appropriate guild
                else {
                    // The command is run in the appropriate guild
                    if(dbCommand.serverID == this.guildId) {
                        this.messageObject.channel.send(dbCommand.commandMessage);
                    }
                }
            }
        }
    }

    private isCommandMessage(message: string) {
        return message.startsWith(this.client.commandPrefix);
    }
}