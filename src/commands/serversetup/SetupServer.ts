import { Command, CommandoClient, CommandMessage } from 'discord.js-commando';
import { Message, Role } from 'discord.js';
import { sendEmbedError } from '../../models/Misc';

module.exports = class SetupServerCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'setupserver',
            group: 'serversetup', 
            memberName: 'setupserver',
            description: 'Setup the server with some general tournament roles and channels',
            guildOnly: true,
        });
    }

    public hasPermission(message: CommandMessage) {
        return message.member.hasPermission(['ADMINISTRATOR']);
    }

    public async run(message: CommandMessage, args: { status: string, message: string }): Promise<Message | Message[]> {
        // Check for bot permissions
        if(!message.guild.me.hasPermission(['MANAGE_CHANNELS', 'MANAGE_ROLES'])) {
            return sendEmbedError(message, `The bot doesn't have sufficient permission. Please create a role with the name \`Bot\` and permissions: \`MANAGE_CHANNELS\` and \`MANAGE_ROLES\`.`);
        }

        let editMessage: any,
            tournamenthostRole: Role,
            mappickerRole: Role,
            refereeRole: Role, 
            commentatorRole: Role,
            streamerRole: Role,
            staffRole: Role;

        editMessage = await message.channel.send({
            embed: {
                color: 0x00FF00,
                description: `I will now start creating roles.`
            }
        });

        // ======================================================
        // Create the various roles and assign them to a variable
        // Tournament host role
        await message.guild.createRole({
            name: 'Tournament Host',
            color: 0xf1c40f,
            permissions: 8,
            hoist: true,
            mentionable: true
        }).then(async role => {
            tournamenthostRole = role;
            await message.guild.me.addRole(role);
        });

        // Mappicker role
        await message.guild.createRole({
            name: 'Mappicker',
            color: 0x1abc9c,
            permissions: 0,
            hoist: true,
            mentionable: true
        }).then(async role => {
            mappickerRole = role;
            await message.guild.me.addRole(role);
        });

        // Referee role
        await message.guild.createRole({
            name: 'Referee',
            color: 0x992d22,
            permissions: 0,hoist: true,

            mentionable: true
        }).then(async role => {
            refereeRole = role;
            await message.guild.me.addRole(role);
        });

        // Commentator role
        await message.guild.createRole({
            name: 'Commentator',
            color: 0xe67e22,
            permissions: 0,
            hoist: true,
            mentionable: true
        }).then(async role => {
            commentatorRole = role;
            await message.guild.me.addRole(role);
        });

        // Streamer role
        await message.guild.createRole({
            name: 'Streamer',
            color: 0xe67e22,
            permissions: 0,
            hoist: true,
            mentionable: true
        }).then(async role => {
            streamerRole = role;
            await message.guild.me.addRole(role);
        });

        // Staff role
        await message.guild.createRole({
            name: 'Staff',
            color: 0x3498db,
            permissions: 0,
            hoist: true,
            mentionable: true
        }).then(async role => {
            staffRole = role;
            await message.guild.me.addRole(role);
        });

        // ====================================================================================
        // Edit the message again, and continue with making the various categories and channels

        await editMessage.edit({
            embed: {
                color: 0x00FF00,
                description: `Succesfully created the roles, I will now continue to create the channels.`
            }
        }).then(async () => {
            // =================
            // Create a category
            let informationCategory = await message.guild.createChannel('Information', {
                type: "category"
            });

            // ==============================
            // Create the information channel
            let informationChannel = await message.guild.createChannel('information', {
                type: "text"
            });

            await informationChannel.overwritePermissions(message.guild.defaultRole, {
                SEND_MESSAGES: false
            });

            await informationChannel.setParent(informationCategory);

            await editMessage.edit({
                embed: {
                    color: 0x00FF00,
                    description: `Created the information channel... :hourglass_flowing_sand:`
                }
            });

            // ===============================
            // Create the announcement channel
            let announcementChannel = await message.guild.createChannel('announcements', {
                type: "text"
            });

            await announcementChannel.overwritePermissions(message.guild.defaultRole, {
                SEND_MESSAGES: false
            });

            await announcementChannel.setParent(informationCategory);

            await editMessage.edit({
                embed: {
                    color: 0x00FF00,
                    description: `Created the announcements channel... :hourglass:`
                }
            });

            // ==============================
            // Create the rules channel
            let rulesChannel = await message.guild.createChannel('rules', {
                type: "text"
            });

            await rulesChannel.overwritePermissions(message.guild.defaultRole, {
                SEND_MESSAGES: false
            });

            await rulesChannel.setParent(informationCategory);

            await editMessage.edit({
                embed: {
                    color: 0x00FF00,
                    description: `Created the rules channel... :hourglass_flowing_sand:`
                }
            });

            // ==============================
            // Create the rules channel
            let matchHistoryChannel = await message.guild.createChannel('matchhistory', {
                type: "text"
            });

            await matchHistoryChannel.overwritePermissions(message.guild.defaultRole, {
                SEND_MESSAGES: false
            });

            await matchHistoryChannel.overwritePermissions(refereeRole, {
                SEND_MESSAGES: true
            });

            await matchHistoryChannel.setParent(informationCategory);

            await editMessage.edit({
                embed: {
                    color: 0x00FF00,
                    description: `Created the matchhistory channel... :hourglass:`
                }
            });

            // =================
            // Create a category
            let generalCategory = await message.guild.createChannel('General', {
                type: "category"
            });
            
            // ==============================
            // Create the general channel
            let generalChannel = await message.guild.createChannel('general', {
                type: "text"
            });

            await generalChannel.setParent(generalCategory);

            await editMessage.edit({
                embed: {
                    color: 0x00FF00,
                    description: `Created the general channel... :hourglass_flowing_sand:`
                }
            });

            // ==================================
            // Create the tournament help channel
            let tournamentHelpChannel = await message.guild.createChannel('tournamenthelp', {
                type: "text"
            });

            await tournamentHelpChannel.setParent(generalCategory);

            await editMessage.edit({
                embed: {
                    color: 0x00FF00,
                    description: `Created the tournamenthelp channel... :hourglass:`
                }
            });

            // ==================================
            // Create the staff help channel
            let staffHelpChannel = await message.guild.createChannel('staffhelp', {
                type: "text"
            });

            await staffHelpChannel.setParent(generalCategory);

            await editMessage.edit({
                embed: {
                    color: 0x00FF00,
                    description: `Created the staffhelp channel... :hourglass_flowing_sand:`
                }
            });

            // =================
            // Create a category
            let staffCategory = await message.guild.createChannel('Staff', {
                type: "category"
            });

            await staffCategory.overwritePermissions(message.guild.defaultRole, {
                VIEW_CHANNEL: false
            });

            await staffCategory.overwritePermissions(staffRole, {
                VIEW_CHANNEL: true
            });

            await staffCategory.overwritePermissions(tournamenthostRole, {
                VIEW_CHANNEL: true
            });

            await staffCategory.overwritePermissions(mappickerRole, {
                VIEW_CHANNEL: true
            });

            await staffCategory.overwritePermissions(refereeRole, {
                VIEW_CHANNEL: true
            });

            await staffCategory.overwritePermissions(commentatorRole, {
                VIEW_CHANNEL: true
            });

            await staffCategory.overwritePermissions(streamerRole, {
                VIEW_CHANNEL: true
            });

            // ================================
            // Create the general staff channel
            let generalStaffChannel = await message.guild.createChannel('general', {
                type: "text"
            });

            await generalStaffChannel.overwritePermissions(message.guild.defaultRole, {
                VIEW_CHANNEL: false
            });

            await generalStaffChannel.overwritePermissions(staffRole, {
                VIEW_CHANNEL: true
            });

            await generalStaffChannel.overwritePermissions(tournamenthostRole, {
                VIEW_CHANNEL: true
            });

            await generalStaffChannel.overwritePermissions(mappickerRole, {
                VIEW_CHANNEL: true
            });

            await generalStaffChannel.overwritePermissions(refereeRole, {
                VIEW_CHANNEL: true
            });

            await generalStaffChannel.overwritePermissions(commentatorRole, {
                VIEW_CHANNEL: true
            });

            await generalStaffChannel.overwritePermissions(streamerRole, {
                VIEW_CHANNEL: true
            });

            await generalStaffChannel.setParent(staffCategory);

            await editMessage.edit({
                embed: {
                    color: 0x00FF00,
                    description: `Created the general staff channel... :hourglass:`
                }
            });

            // ============================
            // Create the mappicker channel
            let mappickerChannel = await message.guild.createChannel('mappicker', {
                type: "text"
            });

            await mappickerChannel.overwritePermissions(message.guild.defaultRole, {
                VIEW_CHANNEL: false
            });

            await mappickerChannel.overwritePermissions(mappickerRole, {
                VIEW_CHANNEL: true
            });

            await mappickerChannel.setParent(staffCategory);

            await editMessage.edit({
                embed: {
                    color: 0x00FF00,
                    description: `Created the mappicker channel... :hourglass_flowing_sand:`
                }
            });

            // ==========================
            // Create the referee channel
            let refereeChannel = await message.guild.createChannel('referee', {
                type: "text"
            });

            await refereeChannel.overwritePermissions(message.guild.defaultRole, {
                VIEW_CHANNEL: false
            });

            await refereeChannel.overwritePermissions(refereeRole, {
                VIEW_CHANNEL: true
            });

            await refereeChannel.overwritePermissions(commentatorRole, {
                VIEW_CHANNEL: true
            });

            await refereeChannel.overwritePermissions(streamerRole, {
                VIEW_CHANNEL: true
            });

            await refereeChannel.setParent(staffCategory);

            await editMessage.edit({
                embed: {
                    color: 0x00FF00,
                    description: `Created the referee channel... :hourglass:`
                }
            });

            // =========================
            // Create the stream channel
            let streamChannel = await message.guild.createChannel('stream', {
                type: "text"
            });

            await streamChannel.overwritePermissions(message.guild.defaultRole, {
                VIEW_CHANNEL: false
            });

            await streamChannel.overwritePermissions(streamerRole, {
                VIEW_CHANNEL: true
            });

            await streamChannel.overwritePermissions(commentatorRole, {
                VIEW_CHANNEL: true
            });

            await streamChannel.setParent(staffCategory);

            await editMessage.edit({
                embed: {
                    color: 0x00FF00,
                    description: `Created the stream channel... :hourglass_flowing_sand:`
                }
            });

            // ==============================
            // Create the commentator channel
            let commentatorChannel = await message.guild.createChannel('commentator', {
                type: "text"
            });

            await commentatorChannel.overwritePermissions(message.guild.defaultRole, {
                VIEW_CHANNEL: false
            });

            await commentatorChannel.overwritePermissions(streamerRole, {
                VIEW_CHANNEL: true
            });

            await commentatorChannel.overwritePermissions(commentatorRole, {
                VIEW_CHANNEL: true
            });

            await commentatorChannel.setParent(staffCategory);

            await editMessage.edit({
                embed: {
                    color: 0x00FF00,
                    description: `Created the commentator channel... :hourglass:`
                }
            });
        });

        message.guild.me.roles.forEach(async role => {
            if(role.name.toLowerCase() == "bot") return;
            if(role.name.toLowerCase() == "admin") return;

            await message.guild.me.removeRole(role);
        });

        return await editMessage.edit({
            embed: {
                color: 0x00FF00,
                description: `Created all the channels, enjoy!`
            }
        })
    }
};