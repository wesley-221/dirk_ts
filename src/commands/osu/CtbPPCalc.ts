import { Command, CommandoClient, CommandMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import { getBeatmapIdFromUrl, Mods, getModsFromBit, getBitFromMods, doesModExist } from '../../models/OsuHelper';
import { sendEmbed, sendEmbedError } from '../../models/Misc';

module.exports = class CtbPPCalc extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'ctbpp',
            group: 'osu', 
            memberName: 'ctbpp',
            description: 'Get the pp amount the map gives',
            args: [
                {
                    key: "beatmapUrl",
                    label: "beatmap url", 
                    prompt: "Enter the url of the map",
                    type: "string"
                },
                { 
                    key: "mods",
                    label: "mods",
                    prompt: "Enter the mods",
                    type: "string"
                }
            ]
        });
    }

    public async run(message: CommandMessage, args: { beatmapUrl: string, mods: string }): Promise<Message | Message[]> {
        const { beatmapUrl, mods } = args;
        const beatmapId: number | null = getBeatmapIdFromUrl(beatmapUrl);
        const modBit = getBitFromMods(mods);
        const modExists: any = doesModExist(mods);

        if(modExists != true) {
            return sendEmbedError(message, `Invalid mod given: ${modExists}.`);
        }   

        const rp = require("request-promise");
        const data: any = JSON.parse(await rp(`https://up.wybin.xyz/getpp/${beatmapId}/${modBit}`));

        const fullMods = getModsFromBit(modBit);
     
        return message.embed({
            color: 0xef6da7,
            author: {
                name: `${data.beatmap}`,
                url: `https://osu.ppy.sh/beatmaps/${data.beatmapId}`,
            },
            thumbnail: {
                url: `https://b.ppy.sh/thumb/${data.beatmapsetId}l.jpg`
            },
            fields: [
                {
                    name: "Approach rate",
                    value: `${data.approach_rate}`,
                    inline: true
                },
                {
                    name: "Star rating",
                    value: `${data.star_rating}`,
                    inline: true
                },
                {
                    name: "PP",
                    value: `${data.pp}`,
                    inline: true
                },
                { 
                    name: "Mods",
                    value: `${fullMods.join(", ")}`
                }
            ]
        })
    }
};