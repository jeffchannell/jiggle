
const LOG_NONE = 0;
const LOG_ERROR = 1;
const LOG_WARNING = LOG_ERROR | 2;
const LOG_INFO = LOG_WARNING | 4;
const LOG_DEBUG = LOG_INFO | 8;

const LOG_LEVELS = [
    LOG_NONE,
    LOG_ERROR,
    LOG_WARNING,
    LOG_INFO,
    LOG_DEBUG,
];

let LogLevel = LOG_WARNING

export function isAtLevel(level) {
    return (LogLevel & level) === level;
}

export function logDebug(e) {
    if (isAtLevel(LOG_DEBUG)) log('Jiggle[DEBUG] '+e);
}

export function logErr(e) {
    if (isAtLevel(LOG_ERROR)) logError(e, 'JiggleError');
}

export function logInfo(e) {
    if (isAtLevel(LOG_INFO)) log('Jiggle[INFO] '+e);
}

export function logWarning(e) {
    if (isAtLevel(LOG_WARNING)) log('Jiggle[WARNING] '+e);
}

export function setLogLevel(level) {
    LogLevel = LOG_LEVELS[level] ?? LOG_WARNING;
}
