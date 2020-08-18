import { CommandoMessage } from "discord.js-commando";
import { Message } from "discord.js";

/**
 * Send an embed message to the given channel
 * @param message
 * @param text 
 * @param color 
 */
export function sendEmbed(message: CommandoMessage, text: string, color: number): Promise<Message | Message[]> {
    return message.embed({
        color,
        description: text
    });
}

/**
 * Send an error embed message to the given channel
 * @param message 
 * @param text 
 */
export function sendEmbedError(message: CommandoMessage, text: string): Promise<Message | Message[]> {
    return sendEmbed(message, `:no_entry: | Something went wrong for ${message.author}: \n${text}`, 0xFF0000);
}

/**
 * Send a success embed message to the given channel
 * @param message 
 * @param text 
 */
export function sendEmbedSuccess(message: CommandoMessage, text: string): Promise<Message | Message[]> {
    return sendEmbed(message, `:white_check_mark: | ${text}`, 0x00FF00);
}

/**
 * Split a number string so it will be more readable 
 * @param text the text to split
 * @param splitter the character the text should be split on
 */
export function addCharacter(text: string, splitter: string): string {
    text += '';

    let x = text.split('.');
    let x1 = x[0];
    let x2 = x.length > 1 ? '.' + x[1] : '';

    const regex = /(\d+)(\d{3})/;

    while(regex.test(x1)) {
        x1 = x1.replace(regex, '$1' + splitter + '$2');
    }

    return x1 + x2;
}