import fs from "fs";
import { Level, Logger } from "../lib/logger/logger";
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
// import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import Database from 'better-sqlite3';


export function connectToDb(dbName: string, directory?: string) {
    if (directory && !fs.existsSync(directory)) {
        fs.mkdirSync(directory)
    }

    const dbLocation = (directory || "") + dbName;

    try {
        const sqlite3 = new Database(dbLocation);
        const db: BetterSQLite3Database = drizzle(sqlite3);

        // await migrate(db, { migrationsFolder: "drizzle" })

        return db;
    } catch (e) {
        Logger.log("Unable to create database.", Level.ERROR);
        throw e;
    }
}
