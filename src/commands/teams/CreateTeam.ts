import { Command, CommandoClient, CommandMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import { sendEmbedError } from '../../models/Misc';
import { Permission, PermissionNames } from '../../models/Permission';

module.exports = class CreateTeamCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'createteam',
            group: 'teams', 
            memberName: 'createteam',
            description: 'Create a text and voice channel for the given team name',
            args: [
                {
                    key: "teamName",
                    label: "team name", 
                    prompt: "Enter the name of the team",
                    type: "string",
                    min: 3,
                    max: 20
                },
                { 
                    key: "mentions",
                    label: "mentions",
                    prompt: "Mention all the players you wish to add",
                    type: "string"
                }
            ]
        });
    }

    public hasPermission(message: CommandMessage) {
        const permission = new Permission(this.client);
        return permission.checkPermission(message, PermissionNames.Moderator);
    }

    public async run(message: CommandMessage, args: { teamName: string, mentions: string }): Promise<Message | Message[]> {
        if(message.guild.channels.filter(c => c.name == args.teamName).size > 0) {
            return sendEmbedError(message, `The team "${args.teamName}" already exists. Please try again.`);
        }

        if(message.mentions.users.size == 0) {
            return sendEmbedError(message, `You have to mention at least one user to create a team.`);
        }

        let editMessage: any,
            teamRole: any;

        editMessage = await message.channel.send({
            embed: {
                color: 0x00FF00,
                description: `Creating the role \`${args.teamName}\`...`
            }
        });

        // ====================
        // Create the team role
        await message.guild.createRole({
            name: args.teamName,
            permissions: 0,
            hoist: true,
            mentionable: true
        }).then(async role => {
            teamRole = role;
        });

        await editMessage.edit({
            embed: {
                color: 0x00FF00,
                description: `Succesfully created the team \`${args.teamName}\`, will now create the category...`
            }
        });

        // ======================================
        // Assign the role to all mentioned users
        message.mentions.users.forEach(async user => {
            await (<any>message.guild.members.get(user.id)).addRole(teamRole);
        });

        // ===================
        // Create the category
        let teamCategory = await message.guild.createChannel(args.teamName, {
            type: "category"
        });

        await editMessage.edit({
            embed: {
                color: 0x00FF00,
                description: `Succesfully created the category, will now start with the text channel...`
            }
        });

        // ============================
        // Create the team text channel
        let teamTextChannel = await message.guild.createChannel(args.teamName, {
            type: "text"
        });

        await teamTextChannel.overwritePermissions(message.guild.defaultRole, {
            VIEW_CHANNEL: false
        });

        await teamTextChannel.overwritePermissions(teamRole, {
            VIEW_CHANNEL: true
        });

        await teamTextChannel.setParent(teamCategory);

        await editMessage.edit({
            embed: {
                color: 0x00FF00,
                description: `Succesfully created the text channel, will now start with the voice channel...`
            }
        });

        // =============================
        // Create the team voice channel
        let teamVoiceChannel = await message.guild.createChannel(args.teamName, {
            type: "voice"
        });

        await teamVoiceChannel.overwritePermissions(message.guild.defaultRole, {
            VIEW_CHANNEL: false
        });

        await teamVoiceChannel.overwritePermissions(teamRole, {
            VIEW_CHANNEL: true
        });

        await teamVoiceChannel.setParent(teamCategory);

        // =========
        // All done!
        return editMessage.edit({
            embed: {
                color: 0x00FF00,
                description: `Succesfully created the voice channel, enjoy!`
            }
        });
    }
};