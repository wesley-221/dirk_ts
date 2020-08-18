'use strict'

import { CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as debug from 'debug';
import * as path from 'path';
import * as YAML from 'yamljs';
import * as mysql from 'mysql';
import { ServerJoin } from './events/ServerJoin';
import { ServerLeave } from './events/ServerLeave';
import { Message } from './events/Message';
import { CacheService } from './services/cache';
import { MessageReaction, User } from 'discord.js';

// DEBUG PREPARE
// ----------------------------------------------------------------------------
const logSystem = debug('bot:system');
const logEvent = debug('bot:event');
const logError = debug('bot:error');
const logWarn = debug('bot:warn');

// DISCORD CLASS
// ----------------------------------------------------------------------------
export class DiscordTS {
	private client: CommandoClient;
	private config: any;
	private beneluxRoleChannels = ['server-roles', 'temproles'];

	constructor() {
		this.config = YAML.load(path.resolve(__dirname, 'settings.yml'));

		this.client = new CommandoClient({
			owner: '88662320791707648',
			commandPrefix: this.config.settings.prefix,
			partials: ['MESSAGE', 'CHANNEL', 'REACTION']
		});

		// Create the mysql pool 
		// ----------------------------------------------------------------------------
		(<any>this.client).pool = mysql.createPool({
			connectionLimit: 10,
			host: this.config.settings.host,
			user: this.config.settings.user,
			password: this.config.settings.password,
			database: this.config.settings.database,
			supportBigNumbers: true
		});

		(<any>this.client).pool.getConnection((err: Error, connection: any) => {
			if (err) console.log(err);
			if (connection) connection.release();
		});
	}

	public async start() {
		logSystem('Starting bot...');

		this.client.on('ready', () => {
			logEvent(`[${this.config.settings.nameBot}] Connected.`);
			logEvent(`Logged in as ${this.client.user.tag}`);

			this.client.user.setActivity(this.config.settings.activity);
		});

		// Register command groups
		// ----------------------------------------------------------------------------
		this.client.registry.registerGroups([
			['basic', 'Basic commands'],
			['osu', 'osu! related commands'],
			['owner', 'Commands for the owner'],
			['serversetup', 'Various commands to manage a server'],
			['globalcommands', 'Manage dynamic global commands'],
			['guildcommands', 'Manage dynamic guild commands'],
			['teams', 'Manage team channels']
		]).registerDefaults().registerCommandsIn(path.join(__dirname, 'commands'));

		// Setup logging
		// ----------------------------------------------------------------------------
		this.client.on('error', logError);
		this.client.on('warn', logWarn);

		// Setup cache
		// ----------------------------------------------------------------------------
		const cache = new CacheService(this.client);
		await cache.initialize();

		(<any>this.client).cache = cache;

		// Setup various listeners
		// ----------------------------------------------------------------------------
		this.client.on('guildMemberAdd', async (member) => {
			const serverJoin = new ServerJoin(this.client, member);
			await serverJoin.start();
		});

		this.client.on('guildMemberRemove', async (member) => {
			const serverLeave = new ServerLeave(this.client, member);
			await serverLeave.start();
		})

		this.client.on('message', async (msg: CommandoMessage) => {
			const message = new Message(this.client, msg);
			await message.start();
		});

		const NL_IDENTIFIER = "%F0%9F%87%B3%F0%9F%87%B1";
		const BE_IDENTIFIER = "%F0%9F%87%A7%F0%9F%87%AA";
		const LU_IDENTIFIER = "%F0%9F%87%B1%F0%9F%87%BA";
		const BEER_IDENTIFIER = "%F0%9F%8D%BA";

		this.client.on('messageReactionAdd', async (messageReaction: MessageReaction, user: User) => {
			if (this.beneluxRoleChannels.indexOf(messageReaction.message.channel.name) > -1) {
				switch (messageReaction.emoji.identifier) {
					case NL_IDENTIFIER:
						messageReaction.message.guild.members.cache.filter(u => u.user.username == user.username).first().roles.add(messageReaction.message.guild.roles.cache.filter(r => r.name == 'Netherlands').first());
						break;

					case BE_IDENTIFIER:
						messageReaction.message.guild.members.cache.filter(u => u.user.username == user.username).first().roles.add(messageReaction.message.guild.roles.cache.filter(r => r.name == 'Belgium').first());
						break;

					case LU_IDENTIFIER:
						messageReaction.message.guild.members.cache.filter(u => u.user.username == user.username).first().roles.add(messageReaction.message.guild.roles.cache.filter(r => r.name == 'Luxembourg').first());
						break;

					case BEER_IDENTIFIER:
						messageReaction.message.guild.members.cache.filter(u => u.user.username == user.username).first().roles.add(messageReaction.message.guild.roles.cache.filter(r => r.name == 'Alcoholic').first());
						break;

					default:
						break;
				}
			}
		});

		this.client.on('messageReactionRemove', async (messageReaction: MessageReaction, user: User) => {
			if (this.beneluxRoleChannels.indexOf(messageReaction.message.channel.name) > -1) {
				switch (messageReaction.emoji.identifier) {
					case NL_IDENTIFIER:
						messageReaction.message.guild.members.cache.filter(u => u.user.username == user.username).first().roles.remove(messageReaction.message.guild.roles.cache.filter(r => r.name == 'Netherlands').first());
						break;

					case BE_IDENTIFIER:
						messageReaction.message.guild.members.cache.filter(u => u.user.username == user.username).first().roles.remove(messageReaction.message.guild.roles.cache.filter(r => r.name == 'Belgium').first());
						break;

					case LU_IDENTIFIER:
						messageReaction.message.guild.members.cache.filter(u => u.user.username == user.username).first().roles.remove(messageReaction.message.guild.roles.cache.filter(r => r.name == 'Luxembourg').first());
						break;

					case BEER_IDENTIFIER:
						messageReaction.message.guild.members.cache.filter(u => u.user.username == user.username).first().roles.remove(messageReaction.message.guild.roles.cache.filter(r => r.name == 'Alcoholic').first());
						break;

					default:
						break;
				}
			}
		});

		// Setup logging and stuff
		// ----------------------------------------------------------------------------
		process.on('exit', () => {
			logEvent(`[${this.config.settings.nameBot}] Process exit.`);
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
