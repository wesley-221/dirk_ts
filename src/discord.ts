'use strict'

import { CommandoClient, CommandMessage } from 'discord.js-commando';
import * as debug from 'debug';
import * as path from 'path';
import * as YAML from 'yamljs';
import { ServerJoin } from './events/ServerJoin';
import { ServerLeave } from './events/ServerLeave';
import { Message } from './events/Message';

// DEBUG PREPARE
// ----------------------------------------------------------------------------
const logSystem	= debug('bot:system');
const logEvent	= debug('bot:event');
const logError	= debug('bot:error');
const logWarn	= debug('bot:warn');

// DISCORD CLASS
// ----------------------------------------------------------------------------
export class DiscordTS {
	private client: CommandoClient;
	private config: any;

	constructor() {
		this.config = YAML.load(path.resolve(__dirname, 'settings.yml'));

		this.client = new CommandoClient({
			owner: '88662320791707648',
			commandPrefix: this.config.prefix,
			unknownCommandResponse: false
		});
	}

	public start(): void {
		logSystem('Starting bot...');

		this.client.on('ready', () => {
			logEvent(`[${ this.config.settings.nameBot }] Connected.`);
			logEvent(`Logged in as ${ this.client.user.tag }`);

			this.client.user.setActivity(this.config.settings.activity);
		});

		this.client.registry.registerGroups([
			['basic', 'Basic commands'],
			['owner', 'Commands for the owner'],
			['serversetup', 'Various commands to manage a server'],
			['globalcommands', 'Manage dynamic global commands'],
			['guildcommands', 'Manage dynamic guild commands']
		]).registerDefaults().registerCommandsIn(path.join(__dirname, 'commands'));

		this.client.on('error', logError);
		this.client.on('warn', logWarn);

		this.client.on('guildMemberAdd', async (member) => {
			const serverJoin = new ServerJoin(this.client, member);
			await serverJoin.start();
		});

		this.client.on('guildMemberRemove', async (member) => {
			const serverLeave = new ServerLeave(this.client, member);
			await serverLeave.start();
		})

		this.client.on('message', async (msg: CommandMessage) => {
			const message = new Message(this.client, msg);
			await message.start();
		});

		process.on('exit', () => {
			logEvent(`[${ this.config.settings.nameBot }] Process exit.`);
			this.client.destroy();
		});

		process.on('uncaughtException', (err: Error) => {
			const errorMsg = (err ? err.stack || err : '').toString().replace(new RegExp(`${__dirname}\/`, 'g'), './');
			logError(errorMsg);
		});

		// process.on('unhandledRejection', (err: Error) => {
		// 	logError('Uncaught Promise error: \n' + err.stack)
		// })

		this.client.login(this.config.settings.token);
	}
}
