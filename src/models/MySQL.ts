import * as mysql from 'mysql';
import { CommandoClient } from 'discord.js-commando';


export class MySQL {
    private pool: mysql.Pool;


    constructor(client: CommandoClient) {
        this.pool = (<any>client).pool;
    }

    /**
     * Execute a query
     * @param query 
     * @param escapedValues 
     */
    async query(query: string, escapedValues: any[] = []) {
        return new Promise((resolve, reject) => {
            this.pool.query(query, escapedValues, (error, result) => {
                if(error) {
                    reject(error);
                }

                if(result) {
                    resolve(result);
                }
            });
        });
    }
}