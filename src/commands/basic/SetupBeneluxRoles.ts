import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import { Permission, PermissionNames } from '../../models/Permission';

module.exports = class SetupBeneluxRolesCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'setupbeneluxroles',
            group: 'basic',
            memberName: 'setupbeneluxroles',
            description: 'Create a message on how to setup roles for osu!catch Benelux server',
            guildOnly: true
        });
    }

    public hasPermission(message: CommandoMessage) {
        const permission = new Permission(this.client);
        return permission.checkPermission(message, PermissionNames.Administrator);
    }

    public async run(message: CommandoMessage): Promise<Message | Message[]> {
        const test = message.channel.send({
            embed: {
                color: 0xa83232,
                description: `Click on any of the emoji's on this message in order to get the appropriate role. \n` +
                    `:flag_nl: : My nationality is **Dutch**! \n` +
                    `:flag_be: : My nationality is **Belgian**! \n` +
                    `:flag_lu: : My nationality is **Luxembourgian**! \n` +
                    `:beer: : I want to have access to the drinking channels, here we post announcements when we do drinking games over discord on this server. \n` +
                    `:birthday: : I want to enlist my birthday on this server, and receive notifications for other people's birthdays (Not working yet :poop:).`
            }
        }).then(async (message: Message) => {
            await message.react('🇳🇱');
            await message.react('🇧🇪');
            await message.react('🇱🇺');
            await message.react('🍺');
        }).catch(error => {
            console.log(error);
        });

        return message.channel.send('asdf');
    }
};