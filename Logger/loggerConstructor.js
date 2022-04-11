const {createLogger, format, transports} = require('winston')
function createServiceLogger(serviceName, logFiles) {
    const trans = logFiles.map((fileInfo) => {
        return new transports.File({
            filename: serviceName + '_' + fileInfo.filename,
            level: fileInfo.level,
        })
    })
    return createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }),
            format.errors({stack: true}),
            format.splat(),
            format.json()
        ),
        defaultMeta: {service: serviceName},
        transports: trans,
    })
}

module.exports = createServiceLogger
