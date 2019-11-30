import { ServerPermissionRole } from "../models/ServerPermissionRole";
import { Snowflake } from "discord.js";
import { MySQL } from "../models/MySQL";

export class CacheService {
    private serverPermissionRoles: ServerPermissionRole[];

    constructor() {
        this.serverPermissionRoles = [];
    }

    /**
     * Initialize the cache
     */
    async initialize() {
        const mysql = new MySQL();

        const serverPermissionRoles: any = await mysql.query('SELECT * FROM permissionroles');

        for(let serverPermissionRole of serverPermissionRoles) {
            this.addServerPermission(new ServerPermissionRole(serverPermissionRole.serverID, serverPermissionRole.moderatorRole, serverPermissionRole.administratorRole));
        }
    }

    /**
     * Get the permission role object from the given server
     * @param serverID 
     */
    getServerPermission(serverID: Snowflake): ServerPermissionRole | null {
        for(let serverPermissionRole of this.serverPermissionRoles) {
            if(serverPermissionRole.getServerID() == serverID) {
                return serverPermissionRole;
            }
        }

        return null;
    }

    /**
     * Add a new permission role object
     * @param serverPermissionRole 
     */
    addServerPermission(serverPermissionRole: ServerPermissionRole): void {
        this.serverPermissionRoles.push(serverPermissionRole);
    }

    /**
     * Update an existing permission role object
     * @param serverPermissionRole 
     */
    updateServerPermission(serverPermissionRole: ServerPermissionRole): boolean {
        for(let sPermissionRole in this.serverPermissionRoles) {
            if(this.serverPermissionRoles[sPermissionRole].getServerID() == serverPermissionRole.getServerID()) {
                this.serverPermissionRoles[sPermissionRole] = serverPermissionRole;

                return true;
            }
        }

        return false;
    }
}