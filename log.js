'use strict';

const LOG_NONE = 0;
const LOG_ERROR = 1;
const LOG_WARNING = LOG_ERROR | 2;
const LOG_INFO = LOG_WARNING | 4;
const LOG_DEBUG = LOG_INFO | 8;

var LOG_LEVELS = [
    LOG_NONE,
    LOG_ERROR,
    LOG_WARNING,
    LOG_INFO,
    LOG_DEBUG,
];

var LogLevel = 7

function isAtLevel(level) {
    return level | LogLevel == level;
}

function logDebug(e) {
    if (isAtLevel(LOG_DEBUG)) log('Jiggle[DEBUG] '+e);
}

function logErr(e) {
    if (isAtLevel(LOG_ERROR)) logError(e, 'JiggleError');
}

function logInfo(e) {
    if (isAtLevel(LOG_INFO)) log('Jiggle[INFO] '+e);
}

function logWarning(e) {
    if (isAtLevel(LOG_WARNING)) log('Jiggle[WARNING] '+e);
}

function setLogLevel(level) {
    LogLevel = LOG_LEVELS[level];
}
