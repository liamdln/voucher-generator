export enum Level {
    INFO = "INFO",
    WARNING = "WARNING",
    ERROR = "ERROR"
}

export class Logger {

    static log(content: string, level: Level) {
        console.log(`${new Date()} [${level}] >> ${content}`)
    }

}