import { ServerPermissionRole } from "./ServerPermissionRole";
import { CacheService } from "../services/cache";
import { CommandoClient, CommandoMessage } from "discord.js-commando";

export enum PermissionNames {
    Moderator = 2,
    Administrator = 3
}

export class Permission {
    private cacheService: CacheService;
    private allPermissions: { name: number, permissionCheck: Function }[] = [
        {
            name: PermissionNames.Moderator,
            permissionCheck: (message: CommandoMessage) => {
                try {
                    const serverPermissionRole: ServerPermissionRole | null = this.cacheService.getServerPermission(message.guild.id);
                    return serverPermissionRole != null && message.member.roles.get(serverPermissionRole.getModeratorRole()) != undefined;
                }
                catch(e) {
                    return false;
                }
            }
        }, 
        {
            name: PermissionNames.Administrator,
            permissionCheck: (message: CommandoMessage) => {
                try {
                    const serverPermissionRole: ServerPermissionRole | null = this.cacheService.getServerPermission(message.guild.id);
                    return serverPermissionRole != null && message.member.roles.get(serverPermissionRole.getAdministratorRole()) != undefined;
                }
                catch(e) {
                    return false;
                }
            }
        }
    ];
    
    constructor(client: CommandoClient) {
        this.cacheService = (<CacheService>(<any>client).cache);
    }

    /**
     * Check if the user has sufficient permissions to run the command
     * @param message 
     * @param requiredPermission 
     */
    checkPermission(message: CommandoMessage, requiredPermission: PermissionNames): boolean {
        let permissionLevel = 0;
        const permissionOrder = this.allPermissions.slice(0).sort((p, c) => p.name < c.name ? 1 : -1);

        while(permissionOrder.length) {
            const currentLevel = permissionOrder.shift();

            if(currentLevel == undefined) break;

            if(currentLevel.permissionCheck(message)) {
                permissionLevel = currentLevel.name;
                break;
            }
        }

        return permissionLevel > requiredPermission || message.member.hasPermission(['ADMINISTRATOR']);
    }
}