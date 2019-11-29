import { Command, CommandoClient, CommandMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import { sendEmbedError, sendEmbedSuccess } from '../../models/Misc';

module.exports = class AddToTeamCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'addtoteam',
            group: 'teams', 
            memberName: 'addtoteam',
            description: 'Add a player to the given team',
            args: [
                {
                    key: "teamName",
                    label: "team name", 
                    prompt: "Enter the name of the team you want to add the user to",
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

    public async run(message: CommandMessage, args: { teamName: string, mentions: string }): Promise<Message | Message[]> {
        if(message.guild.channels.filter(c => c.name == args.teamName).size == 0) {
            return sendEmbedError(message, `The team "${args.teamName}" doesn't exist. Please try again.`);
        }

        if(message.mentions.users.size == 0) {
            return sendEmbedError(message, `You have to mention at least one user to create a team.`);
        }

        const teamRole = message.guild.roles.filter(r => r.name == args.teamName).first();
        let mentionString: string[] = [];

        message.mentions.users.forEach(async user => {
            mentionString.push(`<@${user.id}>`);
            await message.guild.members.find(r => r.id == user.id).addRole(teamRole);
        });

        return sendEmbedSuccess(message, `Succesfully added ${mentionString.join(', ')} to the team "${args.teamName}".`);
    }
};