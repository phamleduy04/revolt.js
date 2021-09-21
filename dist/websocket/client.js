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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketClient = void 0;
const isomorphic_ws_1 = __importDefault(require("isomorphic-ws"));
const exponential_backoff_1 = require("exponential-backoff");
const mobx_1 = require("mobx");
class WebSocketClient {
    constructor(client) {
        this.client = client;
        this.connected = false;
        this.ready = false;
    }
    /**
     * Disconnect the WebSocket and disable heartbeats.
     */
    disconnect() {
        clearInterval(this.heartbeat);
        this.connected = false;
        this.ready = false;
        if (typeof this.ws !== 'undefined' && this.ws.readyState === isomorphic_ws_1.default.OPEN) {
            this.ws.close();
        }
    }
    /**
     * Send a notification
     * @param notification Serverbound notification
     */
    send(notification) {
        if (typeof this.ws === 'undefined' || this.ws.readyState !== isomorphic_ws_1.default.OPEN)
            return;
        let data = JSON.stringify(notification);
        if (this.client.debug)
            console.debug('[<] PACKET', data);
        this.ws.send(data);
    }
    /**
     * Connect the WebSocket
     * @param disallowReconnect Whether to disallow reconnection
     */
    connect(disallowReconnect) {
        this.client.emit('connecting');
        return new Promise((resolve, $reject) => {
            let thrown = false;
            const reject = (err) => {
                if (!thrown) {
                    thrown = true;
                    $reject(err);
                }
            };
            this.disconnect();
            if (typeof this.client.configuration === 'undefined') {
                throw new Error("Attempted to open WebSocket without syncing configuration from server.");
            }
            if (typeof this.client.session === 'undefined') {
                throw new Error("Attempted to open WebSocket without valid session.");
            }
            let ws = new isomorphic_ws_1.default(this.client.configuration.ws);
            this.ws = ws;
            ws.onopen = () => {
                if (typeof this.client.session === 'string') {
                    this.send({ type: 'Authenticate', token: this.client.session });
                }
                else {
                    this.send(Object.assign({ type: 'Authenticate' }, this.client.session));
                }
            };
            let timeouts = {};
            let handle = (msg) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                let data = msg.data;
                if (typeof data !== 'string')
                    return;
                if (this.client.debug)
                    console.debug('[>] PACKET', data);
                let packet = JSON.parse(data);
                this.client.emit('packet', packet);
                switch (packet.type) {
                    case 'Error': {
                        reject(packet.error);
                        break;
                    }
                    case 'Authenticated': {
                        disallowReconnect = false;
                        this.client.emit('connected');
                        this.connected = true;
                        break;
                    }
                    case 'Ready': {
                        mobx_1.runInAction(() => {
                            if (packet.type !== 'Ready')
                                throw 0;
                            for (let user of packet.users) {
                                this.client.users.createObj(user);
                            }
                            for (let channel of packet.channels) {
                                this.client.channels.createObj(channel);
                            }
                            for (let server of packet.servers) {
                                this.client.servers.createObj(server);
                            }
                            for (let member of packet.members) {
                                this.client.members.createObj(member);
                            }
                        });
                        this.client.user = this.client.users.get(packet.users.find(x => x.relationship === 'User')._id);
                        this.client.emit('ready');
                        this.ready = true;
                        resolve();
                        if (this.client.heartbeat > 0) {
                            this.send({ type: 'Ping', data: +new Date() });
                            this.heartbeat = setInterval(() => this.send({ type: 'Ping', data: +new Date() }), this.client.heartbeat * 1e3);
                        }
                        break;
                    }
                    case "Message": {
                        if (!this.client.messages.has(packet._id)) {
                            if (packet.author === '00000000000000000000000000') {
                                if (typeof packet.content === 'object') {
                                    switch (packet.content.type) {
                                        case 'user_added':
                                        case 'user_remove':
                                            yield this.client.users.fetch(packet.content.by);
                                        case 'user_left':
                                            yield this.client.users.fetch(packet.content.id);
                                            break;
                                        case 'user_joined':
                                        case 'user_left':
                                        case 'user_banned':
                                        case 'user_kicked':
                                            yield this.client.users.fetch(packet.content.id);
                                            break;
                                        case 'channel_description_changed':
                                        case 'channel_icon_changed':
                                        case 'channel_renamed':
                                            yield this.client.users.fetch(packet.content.by);
                                            break;
                                    }
                                }
                            }
                            else {
                                yield this.client.users.fetch(packet.author);
                            }
                            let channel = yield this.client.channels.fetch(packet.channel);
                            if (channel.channel_type === 'TextChannel') {
                                let server = yield this.client.servers.fetch(channel.server_id);
                                if (packet.author !== '00000000000000000000000000')
                                    yield server.fetchMember(packet.author);
                            }
                            this.client.messages.createObj(packet, true);
                        }
                        break;
                    }
                    case "MessageUpdate": {
                        let message = this.client.messages.get(packet.id);
                        if (message) {
                            message.update(packet.data);
                            this.client.emit('message/update', message);
                        }
                        break;
                    }
                    case "MessageDelete": {
                        this.client.messages.delete(packet.id);
                        this.client.emit('message/delete', packet.id);
                        break;
                    }
                    case "ChannelCreate": {
                        mobx_1.runInAction(() => __awaiter(this, void 0, void 0, function* () {
                            if (packet.type !== 'ChannelCreate')
                                throw 0;
                            if (packet.channel_type === 'TextChannel' || packet.channel_type === 'VoiceChannel') {
                                let server = yield this.client.servers.fetch(packet.server);
                                server.channel_ids.push(packet._id);
                            }
                            this.client.channels.createObj(packet, true);
                        }));
                        break;
                    }
                    case "ChannelUpdate": {
                        let channel = this.client.channels.get(packet.id);
                        if (channel) {
                            channel.update(packet.data, packet.clear);
                            this.client.emit('channel/update', channel);
                        }
                        break;
                    }
                    case "ChannelDelete": {
                        (_a = this.client.channels.get(packet.id)) === null || _a === void 0 ? void 0 : _a.delete(true);
                        this.client.emit('channel/delete', packet.id);
                        break;
                    }
                    case "ChannelGroupJoin": {
                        (_b = this.client.channels.get(packet.id)) === null || _b === void 0 ? void 0 : _b.updateGroupJoin(packet.user);
                        break;
                    }
                    case "ChannelGroupLeave": {
                        (_c = this.client.channels.get(packet.id)) === null || _c === void 0 ? void 0 : _c.updateGroupLeave(packet.user);
                        break;
                    }
                    case "ServerUpdate": {
                        let server = this.client.servers.get(packet.id);
                        if (server) {
                            server.update(packet.data, packet.clear);
                            this.client.emit('server/update', server);
                        }
                        break;
                    }
                    case "ServerDelete": {
                        (_d = this.client.servers.get(packet.id)) === null || _d === void 0 ? void 0 : _d.delete(true);
                        this.client.emit('server/delete', packet.id);
                        break;
                    }
                    case "ServerMemberUpdate": {
                        let member = this.client.members.getKey(packet.id);
                        if (member) {
                            member.update(packet.data, packet.clear);
                            this.client.emit('member/update', member);
                        }
                        break;
                    }
                    case "ServerMemberJoin": {
                        mobx_1.runInAction(() => __awaiter(this, void 0, void 0, function* () {
                            if (packet.type !== 'ServerMemberJoin')
                                return 0;
                            yield this.client.servers.fetch(packet.id);
                            yield this.client.users.fetch(packet.user);
                            this.client.members.createObj({
                                _id: {
                                    server: packet.id,
                                    user: packet.user
                                }
                            }, true);
                        }));
                        break;
                    }
                    case "ServerMemberLeave": {
                        if (packet.user === this.client.user._id) {
                            const server_id = packet.id;
                            mobx_1.runInAction(() => {
                                var _a;
                                (_a = this.client.servers.get(server_id)) === null || _a === void 0 ? void 0 : _a.delete(true);
                                [...this.client.members.keys()]
                                    .forEach(key => {
                                    if (JSON.parse(key).server === server_id) {
                                        this.client.members.delete(key);
                                    }
                                });
                            });
                        }
                        else {
                            this.client.members.deleteKey({
                                server: packet.id,
                                user: packet.user
                            });
                            this.client.emit('member/leave', {
                                server: packet.id,
                                user: packet.user
                            });
                        }
                        break;
                    }
                    case "ServerRoleUpdate": {
                        let server = this.client.servers.get(packet.id);
                        if (server) {
                            let role = Object.assign(Object.assign({}, (_e = server.roles) === null || _e === void 0 ? void 0 : _e[packet.role_id]), packet.data);
                            server.roles = Object.assign(Object.assign({}, server.roles), { [packet.role_id]: role });
                            this.client.emit('role/update', packet.role_id, role, packet.id);
                        }
                        break;
                    }
                    case "ServerRoleDelete": {
                        let server = this.client.servers.get(packet.id);
                        if (server) {
                            let _j = (_f = server.roles) !== null && _f !== void 0 ? _f : {}, _k = packet.role_id, _ = _j[_k], roles = __rest(_j, [typeof _k === "symbol" ? _k : _k + ""]);
                            server.roles = roles;
                            this.client.emit('role/delete', packet.role_id, packet.id);
                        }
                        break;
                    }
                    case "UserUpdate": {
                        (_g = this.client.users.get(packet.id)) === null || _g === void 0 ? void 0 : _g.update(packet.data, packet.clear);
                        break;
                    }
                    case "UserRelationship": {
                        let user = this.client.users.get(packet.user._id);
                        if (user) {
                            user.update({ relationship: packet.status });
                        }
                        else {
                            this.client.users.createObj(packet.user);
                        }
                        break;
                    }
                    case "ChannelStartTyping": {
                        let channel = this.client.channels.get(packet.id);
                        let user = packet.user;
                        if (channel) {
                            channel.updateStartTyping(user);
                            clearInterval(timeouts[packet.id + user]);
                            timeouts[packet.id + user] = setTimeout(() => {
                                channel.updateStopTyping(user);
                            }, 3000);
                        }
                        break;
                    }
                    case "ChannelStopTyping": {
                        (_h = this.client.channels.get(packet.id)) === null || _h === void 0 ? void 0 : _h.updateStopTyping(packet.user);
                        clearInterval(timeouts[packet.id + packet.user]);
                        break;
                    }
                    case "ChannelAck": break;
                    case "Pong": {
                        this.ping = +new Date() - packet.data;
                        break;
                    }
                    default: this.client.debug && console.warn(`Warning: Unhandled packet! ${packet.type}`);
                }
            });
            let processing = false;
            let queue = [];
            ws.onmessage = (data) => __awaiter(this, void 0, void 0, function* () {
                queue.push(data);
                if (!processing) {
                    processing = true;
                    while (queue.length > 0) {
                        yield handle(queue.shift());
                    }
                    processing = false;
                }
            });
            ws.onerror = (err) => {
                reject(err);
            };
            ws.onclose = () => {
                this.client.emit('dropped');
                this.connected = false;
                this.ready = false;
                Object.keys(timeouts).map(k => timeouts[k]).forEach(clearTimeout);
                mobx_1.runInAction(() => {
                    [...this.client.users.values()].forEach(user => user.online = false);
                    [...this.client.channels.values()].forEach(channel => channel.typing_ids.clear());
                });
                if (!disallowReconnect && this.client.autoReconnect) {
                    exponential_backoff_1.backOff(() => this.connect(true)).catch(reject);
                }
            };
        });
    }
}
exports.WebSocketClient = WebSocketClient;
