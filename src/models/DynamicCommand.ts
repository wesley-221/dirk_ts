import { MySQL } from "./MySQL";

export enum CommandType {
    Global = "global",
    Guild = "guild"
}

export class DynamicCommand {
    serverId: string;
    commandName: string;
    commandType: CommandType;
    commandMessage: string;
    commandCreatedBy: string;
    commandCreatedAt: Date;
    mysql: MySQL;

    constructor(serverId: string, commandName: string, commandType: CommandType, commandMessage: string, commandCreatedBy: string, commandCreatedAt: Date = new Date) {
        this.serverId = serverId;
        this.commandName = commandName;
        this.commandType = commandType;
        this.commandMessage = commandMessage;
        this.commandCreatedBy = commandCreatedBy;
        this.commandCreatedAt = commandCreatedAt;
        this.mysql = new MySQL();
    }
    
    async create() {
        await this.mysql.query('INSERT INTO command SET serverID = ?, commandName = ?, commandType = ?, commandMessage = ?, commandCreatedBy = ?, commandCreatedAt = ?', [
            this.serverId,
            this.commandName, 
            this.commandType,
            this.commandMessage, 
            this.commandCreatedBy,
            this.commandCreatedAt
        ]);
    }

    async update() {
        await this.mysql.query('UPDATE command SET serverID = ?, commandName = ?, commandType = ?, commandMessage = ?, commandCreatedBy = ?, commandCreatedAt = ? WHERE serverID = ? AND commandName = ?', [
            this.serverId,
            this.commandName, 
            this.commandType,
            this.commandMessage, 
            this.commandCreatedBy,
            this.commandCreatedAt,
            this.serverId,
            this.commandName
        ]);
    }

    async delete() {
        await this.mysql.query('DELETE FROM command WHERE serverID = ? AND commandName = ? AND commandType = ?', [
            this.serverId,
            this.commandName,
            this.commandType
        ]);
    }
}