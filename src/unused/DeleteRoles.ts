// import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
// import { Message } from 'discord.js';
// import { sendEmbedSuccess } from '../models/Misc';

// module.exports = class DeleteRolesCommand extends Command {
//     constructor(client: CommandoClient) {
//         super(client, {
//             name: 'deleteroles',
//             group: 'serversetup', 
//             memberName: 'deleteroles',
//             aliases: ['dr'], 
//             description: 'Delete roles',
//             ownerOnly: true,
//             guildOnly: true
//         });
//     }

//     public async run(message: CommandoMessage): Promise<Message | Message[]> {
//         // ======================================================
//         // Delete all roles
//         // TODO: Remove this after done with command
//         // ======================================================
//         message.guild.roles.cache.forEach(async role => {
//             if(role.name == "admin") return;
//             if(role.name == "@everyone") return;

//             await role.delete();
//         });

//         message.guild.channels.cache.forEach(async channel => {
//             if(channel.name.endsWith('_keep')) return;

//             await channel.delete();
//         });

//         return sendEmbedSuccess(message, `yeet`);
//     }
// };