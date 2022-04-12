require('winston-daily-rotate-file')
const {createLogger, format, transports} = require('winston')
const path = require('path')

function createServiceLogger(serviceName) {
    return createLogger({
        level: 'info',
        format: format.combine(
            format.splat(),
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }),
            format.printf((log) => {
                if (log.stack) return `[${log.timestamp}] [${log.level}] ${log.stack}`
                return `[${log.timestamp}] [${log.level}] ${log.message}`
            })
        ),
        transports: [
            new transports.DailyRotateFile({
                filename: path.join(__dirname, `/LogFolder/${serviceName}Logs/${serviceName}Logs_%DATE%.log`),
                datePattern: 'YYYY-MM-DD',
                maxFiles: '180d',
                level: 'info',
            }),
        ],
    })
}

module.exports = createServiceLogger
