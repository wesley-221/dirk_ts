import { Snowflake } from "discord.js";

export class ServerPermissionRole {
    private serverID: Snowflake;
    private moderatorRole: Snowflake;
    private administratorRole: Snowflake;

    constructor(serverID: Snowflake, moderatorRole: Snowflake, administratorRole: Snowflake) {
        this.serverID = serverID;
        this.moderatorRole = moderatorRole;
        this.administratorRole = administratorRole;
    }

    public getServerID(): Snowflake {
        return this.serverID;
    }

    public getModeratorRole(): Snowflake {
        return this.moderatorRole;
    }

    public getAdministratorRole(): Snowflake {
        return this.administratorRole;  
    }
}