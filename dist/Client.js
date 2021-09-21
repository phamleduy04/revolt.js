"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = exports.RE_SPOILER = exports.RE_MENTIONS = void 0;
const axios_1 = __importDefault(require("axios"));
const lodash_defaultsdeep_1 = __importDefault(require("lodash.defaultsdeep"));
const eventemitter3_1 = require("eventemitter3");
const client_1 = require("./websocket/client");
const Users_1 = __importDefault(require("./maps/Users"));
const Channels_1 = __importDefault(require("./maps/Channels"));
const Servers_1 = __importDefault(require("./maps/Servers"));
const Members_1 = __importDefault(require("./maps/Members"));
const Messages_1 = __importDefault(require("./maps/Messages"));
const Bots_1 = __importDefault(require("./maps/Bots"));
const mobx_1 = require("mobx");
const config_1 = require("./config");
/**
 * Regular expression for mentions.
 */
exports.RE_MENTIONS = /<@([A-z0-9]{26})>/g;
/**
 * Regular expression for spoilers.
 */
exports.RE_SPOILER = /!!.+!!/g;
class Client extends eventemitter3_1.EventEmitter {
    constructor(options = {}) {
        super();
        this.users = new Users_1.default(this);
        this.channels = new Channels_1.default(this);
        this.servers = new Servers_1.default(this);
        this.members = new Members_1.default(this);
        this.messages = new Messages_1.default(this);
        this.bots = new Bots_1.default(this);
        mobx_1.makeObservable(this, {
            users: mobx_1.observable,
            channels: mobx_1.observable,
            servers: mobx_1.observable,
            members: mobx_1.observable,
            messages: mobx_1.observable
        }, {
            proxy: false
        });
        this.options = lodash_defaultsdeep_1.default(options, config_1.defaultConfig);
        if (this.options.cache)
            throw "Cache is not supported yet.";
        this.Axios = axios_1.default.create({ baseURL: this.apiURL });
        this.websocket = new client_1.WebSocketClient(this);
        this.heartbeat = this.options.heartbeat;
        if (options.debug) {
            this.Axios.interceptors.request.use(request => {
                var _a;
                console.debug('[<]', (_a = request.method) === null || _a === void 0 ? void 0 : _a.toUpperCase(), request.url);
                return request;
            });
            this.Axios.interceptors.response.use(response => {
                console.debug('[>] (' + response.status + ':', response.statusText + ')', JSON.stringify(response.data));
                return response;
            });
        }
        this.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
            let channel = message.channel;
            if (!channel)
                return;
            if (channel.channel_type === 'DirectMessage') {
                channel.active = true;
            }
            channel.last_message_id = message._id;
        }));
    }
    /**
     * ? Configuration.
     */
    get apiURL() {
        return this.options.apiURL;
    }
    get debug() {
        return this.options.debug;
    }
    get autoReconnect() {
        return this.options.autoReconnect;
    }
    /**
     * Perform an HTTP request using Axios, specifying a route data object.
     * @param method HTTP method
     * @param url Target route
     * @param data Route data object
     * @returns The response body
     */
    req(method, url, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.Axios.request({
                method,
                data,
                url
            });
            return res.data;
        });
    }
    /**
     * Perform an HTTP request using Axios, specifying a request config.
     * @param method HTTP method
     * @param url Target route
     * @param data Axios request config object
     * @returns The response body
     */
    request(method, url, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.Axios.request(Object.assign(Object.assign({}, data), { method,
                url }));
            return res.data;
        });
    }
    /**
     * ? Authentication and connection.
     */
    /**
     * Fetches the configuration of the server.
     *
     * @remarks
     * Unlike `fetchConfiguration`, this function also fetches the
     * configuration if it has already been fetched before.
     */
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.configuration = yield this.req('GET', '/');
        });
    }
    /**
     * Fetches the configuration of the server if it has not been already fetched.
     */
    fetchConfiguration() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.configuration)
                yield this.connect();
        });
    }
    $generateHeaders(session = this.session) {
        if (typeof session === 'string') {
            return {
                'x-bot-token': session
            };
        }
        else {
            return {
                'x-session-token': session === null || session === void 0 ? void 0 : session.token
            };
        }
    }
    /**
     * Log in with auth data, creating a new session in the process.
     * @param details Login data object
     * @returns An onboarding function if onboarding is required, undefined otherwise
     */
    login(details) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fetchConfiguration();
            this.session = yield this.req('POST', '/auth/session/login', details);
            return yield this.$connect();
        });
    }
    /**
     * Use an existing session to log into Revolt.
     * @param session Session data object
     * @returns An onboarding function if onboarding is required, undefined otherwise
     */
    useExistingSession(session) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fetchConfiguration();
            this.session = session;
            return yield this.$connect();
        });
    }
    /**
     * Log in as a bot.
     * @param token Bot token
     */
    loginBot(token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fetchConfiguration();
            this.session = token;
            this.Axios.defaults.headers = this.$generateHeaders();
            return yield this.websocket.connect();
        });
    }
    // Check onboarding status and connect to notifications service.
    $connect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.Axios.defaults.headers = this.$generateHeaders();
            let { onboarding } = yield this.req('GET', '/onboard/hello');
            if (onboarding) {
                return (username, loginAfterSuccess) => this.completeOnboarding({ username }, loginAfterSuccess);
            }
            yield this.websocket.connect();
        });
    }
    /**
     * Finish onboarding for a user, for example by providing a username.
     * @param data Onboarding data object
     * @param loginAfterSuccess Defines whether to automatically log in and connect after onboarding finishes
     */
    completeOnboarding(data, loginAfterSuccess) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.req('POST', '/onboard/complete', data);
            if (loginAfterSuccess) {
                yield this.$connect();
            }
        });
    }
    /**
     * ? Miscellaneous API routes.
     */
    /**
     * Fetch infomation about an UserID
     * @param id The User ID
     * @returns User infomation
     */
    fetchUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.req('GET', `/users/${id}`);
        });
    }
    /**
     * Fetch information about a given invite code.
     * @param code The invite code.
     * @returns Invite information.
     */
    fetchInvite(code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.req('GET', `/invites/${code}`);
        });
    }
    /**
     * Use an invite.
     * @param code The invite code.
     * @returns Data provided by invite.
     */
    joinInvite(code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.req('POST', `/invites/${code}`);
        });
    }
    /**
     * Delete an invite.
     * @param code The invite code.
     */
    deleteInvite(code) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.req('DELETE', `/invites/${code}`);
        });
    }
    /**
     * Fetch user settings for current user.
     * @param keys Settings keys to fetch, leave blank to fetch full object.
     * @returns Key-value object of settings.
     */
    syncFetchSettings(keys) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.req('POST', '/sync/settings/fetch', { keys });
        });
    }
    /**
     * Set user settings for current user.
     * @param data Data to set as an object. Any non-string values will be automatically serialised.
     * @param timestamp Timestamp to use for the current revision.
     */
    syncSetSettings(data, timestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            let requestData = {};
            for (let key of Object.keys(data)) {
                let value = data[key];
                requestData[key] = typeof value === 'string' ? value : JSON.stringify(value);
            }
            let query = timestamp ? `?timestamp=${timestamp}` : '';
            yield this.req('POST', `/sync/settings/set${query}`, requestData);
        });
    }
    /**
     * Fetch user unreads for current user.
     * @returns Array of channel unreads.
     */
    syncFetchUnreads() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.req('GET', '/sync/unreads');
        });
    }
    /**
     * ? Utility functions.
     */
    /**
     * Log out of REVOLT. Disconnect the WebSocket, request a session invalidation and reset the client.
     */
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            this.websocket.disconnect();
            yield this.req('POST', '/auth/session/logout');
            this.reset();
        });
    }
    /**
     * Reset the client by setting properties to their original value or deleting them entirely.
     * Disconnects the current WebSocket.
     */
    reset() {
        this.websocket.disconnect();
        delete this.user;
        delete this.session;
        this.users = new Users_1.default(this);
        this.channels = new Channels_1.default(this);
        this.servers = new Servers_1.default(this);
        this.members = new Members_1.default(this);
        this.messages = new Messages_1.default(this);
    }
    /**
     * Register for a new account.
     * @param data Registration data object
     * @returns A promise containing a registration response object
     */
    register(data) {
        return this.request('POST', '/auth/account/create', { data });
    }
    /**
     * Prepare a markdown-based message to be displayed to the user as plain text.
     * @param source Source markdown text
     * @returns Modified plain text
     */
    markdownToText(source) {
        return source
            .replace(exports.RE_MENTIONS, (sub, ...args) => {
            const id = args[0], user = this.users.get(id);
            if (user) {
                return `@${user.username}`;
            }
            return sub;
        })
            .replace(exports.RE_SPOILER, '<spoiler>');
    }
    /**
     * Proxy a file through January.
     * @param url URL to proxy
     * @returns Proxied media URL
     */
    proxyFile(url) {
        var _a;
        if ((_a = this.configuration) === null || _a === void 0 ? void 0 : _a.features.january.enabled) {
            return `${this.configuration.features.january.url}/proxy?url=${encodeURIComponent(url)}`;
        }
    }
    /**
     * Generates a URL to a given file with given options.
     * @param attachment Partial of attachment object
     * @param options Optional query parameters to modify object
     * @param allowAnimation Returns GIF if applicable, no operations occur on image
     * @param fallback Fallback URL
     * @returns Generated URL or nothing
     */
    generateFileURL(attachment, ...args) {
        var _a;
        const [options, allowAnimation, fallback] = args;
        let autumn = (_a = this.configuration) === null || _a === void 0 ? void 0 : _a.features.autumn;
        if (!(autumn === null || autumn === void 0 ? void 0 : autumn.enabled))
            return fallback;
        if (!attachment)
            return fallback;
        let { tag, _id, content_type } = attachment;
        let query = '';
        if (options) {
            if (!allowAnimation || content_type !== 'image/gif') {
                query = '?' + Object.keys(options).map(k => `${k}=${options[k]}`).join('&');
            }
        }
        return `${autumn.url}/${tag}/${_id}${query}`;
    }
}
exports.Client = Client;
