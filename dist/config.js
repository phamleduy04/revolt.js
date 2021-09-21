"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = exports.LIBRARY_VERSION = void 0;
exports.LIBRARY_VERSION = '5.1.0-alpha.0';
exports.defaultConfig = {
    apiURL: 'https://api.revolt.chat',
    autoReconnect: true,
    heartbeat: 30,
    debug: false,
    cache: false,
    ackRateLimiter: true,
};
