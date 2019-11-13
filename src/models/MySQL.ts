import * as path from 'path';
import * as YAML from 'yamljs';
import * as mysql from 'mysql';
import { promisify } from 'util';


export class MySQL {
    private config: any;
    private pool: mysql.Pool;


    constructor() {
        this.config = YAML.load(path.resolve(__dirname, '../settings.yml'));

        this.pool = mysql.createPool({
            connectionLimit: 10,
            host: this.config.settings.host,
            user: this.config.settings.user,
            password: this.config.settings.password, 
            database: this.config.settings.database,
            supportBigNumbers: true
        });

        this.pool.getConnection((err, connection) => {
            if(err) console.log(err);
            if(connection) connection.release();
        });
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