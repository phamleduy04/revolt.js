"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.Channel = void 0;
const mobx_1 = require("mobx");
const lodash_isequal_1 = __importDefault(require("lodash.isequal"));
const ulid_1 = require("ulid");
const null_1 = require("../util/null");
const Collection_1 = __importDefault(require("./Collection"));
const permissions_1 = require("../api/permissions");
class Channel {
    constructor(client, data) {
        /**
         * Whether this DM is active.
         * @requires `DirectMessage`
         */
        this.active = null;
        /**
         * The ID of the group owner.
         * @requires `Group`
         */
        this.owner_id = null;
        /**
         * The ID of the server this channel is in.
         * @requires `TextChannel`, `VoiceChannel`
         */
        this.server_id = null;
        /**
         * Permissions for group members.
         * @requires `Group`
         */
        this.permissions = null;
        /**
         * Default server channel permissions.
         * @requires `TextChannel`, `VoiceChannel`
         */
        this.default_permissions = null;
        /**
         * Channel permissions for each role.
         * @requires `TextChannel`, `VoiceChannel`
         */
        this.role_permissions = null;
        /**
         * Channel name.
         * @requires `Group`, `TextChannel`, `VoiceChannel`
         */
        this.name = null;
        /**
         * Channel icon.
         * @requires `Group`, `TextChannel`, `VoiceChannel`
         */
        this.icon = null;
        /**
         * Channel description.
         * @requires `Group`, `TextChannel`, `VoiceChannel`
         */
        this.description = null;
        /**
         * Group / DM members.
         * @requires `Group`, `DM`
         */
        this.recipient_ids = null;
        /**
         * Id of last message in channel.
         * @requires `Group`, `DM`, `TextChannel`, `VoiceChannel`
         */
        this.last_message_id = null;
        /**
         * Users typing in channel.
         */
        this.typing_ids = new Set();
        this.client = client;
        this._id = data._id;
        this.channel_type = data.channel_type;
        switch (data.channel_type) {
            case "DirectMessage": {
                this.active = null_1.toNullable(data.active);
                this.recipient_ids = null_1.toNullable(data.recipients);
                this.last_message_id = null_1.toNullable(data.last_message_id);
                break;
            }
            case "Group": {
                this.recipient_ids = null_1.toNullable(data.recipients);
                this.name = null_1.toNullable(data.name);
                this.owner_id = null_1.toNullable(data.owner);
                this.description = null_1.toNullable(data.description);
                this.last_message_id = null_1.toNullable(data.last_message_id);
                this.icon = null_1.toNullable(data.icon);
                this.permissions = null_1.toNullable(data.permissions);
                break;
            }
            case "TextChannel":
            case "VoiceChannel": {
                this.server_id = null_1.toNullable(data.server);
                this.name = null_1.toNullable(data.name);
                this.description = null_1.toNullable(data.description);
                this.icon = null_1.toNullable(data.icon);
                this.default_permissions = null_1.toNullable(data.default_permissions);
                this.role_permissions = null_1.toNullable(data.role_permissions);
                if (data.channel_type === "TextChannel") {
                    this.last_message_id = null_1.toNullable(data.last_message_id);
                }
                break;
            }
        }
        mobx_1.makeAutoObservable(this, {
            _id: false,
            client: false,
        });
    }
    /**
     * The group owner.
     * @requires `Group`
     */
    get owner() {
        if (this.owner_id === null)
            return;
        return this.client.users.get(this.owner_id);
    }
    /**
     * Server this channel belongs to.
     * @requires `Server`
     */
    get server() {
        if (this.server_id === null)
            return;
        return this.client.servers.get(this.server_id);
    }
    /**
     * The DM recipient.
     * @requires `DM`
     */
    get recipient() {
        var _a;
        const user_id = (_a = this.recipient_ids) === null || _a === void 0 ? void 0 : _a.find(x => this.client.user._id !== x);
        if (!user_id)
            return;
        return this.client.users.get(user_id);
    }
    /**
     * Last message sent in this channel.
     * @requires `Group`, `DM`, `TextChannel`, `VoiceChannel`
     */
    get last_message() {
        const id = this.last_message_id;
        if (!id)
            return;
        return this.client.messages.get(id);
    }
    /**
     * Group recipients.
     * @requires `Group`
     */
    get recipients() {
        var _a;
        return (_a = this.recipient_ids) === null || _a === void 0 ? void 0 : _a.map(id => this.client.users.get(id));
    }
    /**
     * Users typing.
     */
    get typing() {
        return Array.from(this.typing_ids).map(id => this.client.users.get(id));
    }
    update(data, clear) {
        const apply = (key, target) => {
            // This code has been tested.
            // @ts-expect-error
            if (typeof data[key] !== 'undefined' && !lodash_isequal_1.default(this[target !== null && target !== void 0 ? target : key], data[key])) {
                // @ts-expect-error
                this[target !== null && target !== void 0 ? target : key] = data[key];
            }
        };
        switch (clear) {
            case "Description":
                this.description = null;
                break;
            case "Icon":
                this.icon = null;
                break;
        }
        apply("active");
        apply("owner", "owner_id");
        apply("permissions");
        apply("default_permissions");
        apply("role_permissions");
        apply("name");
        apply("icon");
        apply("description");
        apply("recipients", "recipient_ids");
        apply("last_message_id");
    }
    updateGroupJoin(user) {
        var _a;
        (_a = this.recipient_ids) === null || _a === void 0 ? void 0 : _a.push(user);
    }
    updateGroupLeave(user) {
        var _a;
        this.recipient_ids = null_1.toNullable((_a = this.recipient_ids) === null || _a === void 0 ? void 0 : _a.filter((x) => x !== user));
    }
    updateStartTyping(id) {
        this.typing_ids.add(id);
    }
    updateStopTyping(id) {
        this.typing_ids.delete(id);
    }
    /**
     * Fetch a channel's members.
     * @requires `Group`
     * @returns An array of the channel's members.
     */
    fetchMembers() {
        return __awaiter(this, void 0, void 0, function* () {
            let members = yield this.client.req('GET', `/channels/${this._id}/members`);
            return members.map(this.client.users.createObj);
        });
    }
    /**
     * Edit a channel
     * @param data Channel editing route data
     */
    edit(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('PATCH', `/channels/${this._id}`, data);
            // ! FIXME: return $set in req
        });
    }
    /**
     * Delete a channel
     * @requires `DM`, `Group`, `TextChannel`, `VoiceChannel`
     */
    delete(avoidReq) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!avoidReq)
                yield this.client.req('DELETE', `/channels/${this._id}`);
            mobx_1.runInAction(() => {
                if (this.channel_type === 'DirectMessage') {
                    this.active = true;
                    return;
                }
                if (this.channel_type === 'TextChannel' || this.channel_type === 'VoiceChannel') {
                    let server = this.server;
                    if (server) {
                        server.channel_ids = server.channel_ids.filter(x => x !== this._id);
                    }
                }
                this.client.channels.delete(this._id);
            });
        });
    }
    /**
     * Add a user to a group
     * @param user_id ID of the target user
     */
    addMember(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('PUT', `/channels/${this._id}/recipients/${user_id}`);
        });
    }
    /**
     * Remove a user from a group
     * @param user_id ID of the target user
     */
    removeMember(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('DELETE', `/channels/${this._id}/recipients/${user_id}`);
        });
    }
    /**
     * Send a message
     * @param data Either the message as a string or message sending route data
     * @returns The message
     */
    sendMessage(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let msg = Object.assign({ nonce: ulid_1.ulid() }, (typeof data === 'string' ? { content: data } : data));
            let message = yield this.client.req('POST', `/channels/${this._id}/messages`, msg);
            return this.client.messages.createObj(message, true);
        });
    }
    /**
     * Fetch a message by its ID
     * @param message_id ID of the target message
     * @returns The message
     */
    fetchMessage(message_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let message = yield this.client.req('GET', `/channels/${this._id}/messages/${message_id}`);
            return this.client.messages.createObj(message);
        });
    }
    /**
     * Fetch multiple messages from a channel
     * @param params Message fetching route data
     * @returns The messages
     */
    fetchMessages(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let messages = yield this.client.request('GET', `/channels/${this._id}/messages`, { params });
            return mobx_1.runInAction(() => messages.map(this.client.messages.createObj));
        });
    }
    /**
     * Fetch multiple messages from a channel including the users that sent them
     * @param params Message fetching route data
     * @returns Object including messages and users
     */
    fetchMessagesWithUsers(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.client.request('GET', `/channels/${this._id}/messages`, { params: Object.assign(Object.assign({}, params), { include_users: true }) });
            return mobx_1.runInAction(() => {
                var _a;
                return {
                    messages: data.messages.map(this.client.messages.createObj),
                    users: data.users.map(this.client.users.createObj),
                    members: (_a = data.members) === null || _a === void 0 ? void 0 : _a.map(this.client.members.createObj)
                };
            });
        });
    }
    /**
     * Search for messages
     * @param params Message searching route data
     * @returns The messages
     */
    search(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let messages = yield this.client.req('POST', `/channels/${this._id}/search`, params);
            return mobx_1.runInAction(() => messages.map(this.client.messages.createObj));
        });
    }
    /**
     * Search for messages including the users that sent them
     * @param params Message searching route data
     * @returns The messages
     */
    searchWithUsers(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.client.req('POST', `/channels/${this._id}/search`, Object.assign(Object.assign({}, params), { include_users: true }));
            return mobx_1.runInAction(() => {
                var _a;
                return {
                    messages: data.messages.map(this.client.messages.createObj),
                    users: data.users.map(this.client.users.createObj),
                    members: (_a = data.members) === null || _a === void 0 ? void 0 : _a.map(this.client.members.createObj)
                };
            });
        });
    }
    /**
     * Fetch stale messages
     * @param ids IDs of the target messages
     * @returns The stale messages
     */
    fetchStale(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.client.req('POST', `/channels/${this._id}/messages/stale`, { ids });
            mobx_1.runInAction(() => {
                data.deleted.forEach(id => this.client.messages.delete(id));
                data.updated.forEach(data => { var _a; return (_a = this.client.messages.get(data._id)) === null || _a === void 0 ? void 0 : _a.update(data); });
            });
            return data;
        });
    }
    /**
     * Create an invite to the channel
     * @returns Newly created invite code
     */
    createInvite() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.client.req('POST', `/channels/${this._id}/invites`);
            return res.code;
        });
    }
    /**
     * Join a call in a channel
     * @returns Join call response data
     */
    joinCall() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('POST', `/channels/${this._id}/join_call`);
        });
    }
    /**
     * Mark a channel as read
     * @param message Last read message or its ID
     * @param skipRateLimiter Whether to skip the internal rate limiter
     */
    ack(message, skipRateLimiter) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const id = (_b = (_a = (typeof message === 'string' ? message : message === null || message === void 0 ? void 0 : message._id)) !== null && _a !== void 0 ? _a : this.last_message_id) !== null && _b !== void 0 ? _b : ulid_1.ulid();
            const performAck = () => {
                delete this.ackLimit;
                this.client.req('PUT', `/channels/${this._id}/ack/${id}`);
            };
            if (!this.client.options.ackRateLimiter || skipRateLimiter)
                return performAck();
            clearTimeout(this.ackTimeout);
            if (this.ackLimit && +new Date() > this.ackLimit) {
                performAck();
            }
            // We need to use setTimeout here for both Node.js and browser.
            this.ackTimeout = setTimeout(performAck, 5000);
            if (!this.ackLimit) {
                this.ackLimit = +new Date() + 15e3;
            }
        });
    }
    /**
     * Set role permissions
     * @param role_id Role Id, set to 'default' to affect all users
     * @param permissions Permission number, removes permission if unset
     */
    setPermissions(role_id = 'default', permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('PUT', `/channels/${this._id}/permissions/${role_id}`, { permissions });
        });
    }
    /**
     * Start typing in this channel
     */
    startTyping() {
        this.client.websocket.send({ type: 'BeginTyping', channel: this._id });
    }
    /**
     * Stop typing in this channel
     */
    stopTyping() {
        this.client.websocket.send({ type: 'EndTyping', channel: this._id });
    }
    generateIconURL(...args) {
        var _a;
        return this.client.generateFileURL((_a = this.icon) !== null && _a !== void 0 ? _a : undefined, ...args);
    }
    get permission() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        switch (this.channel_type) {
            case 'SavedMessages': return permissions_1.U32_MAX;
            case 'DirectMessage': {
                let user_permissions = ((_a = this.recipient) === null || _a === void 0 ? void 0 : _a.permission) || 0;
                if (user_permissions & permissions_1.UserPermission.SendMessage) {
                    return permissions_1.DEFAULT_PERMISSION_DM;
                }
                else {
                    return 0;
                }
            }
            case 'Group': {
                if (this.owner_id === this.client.user._id) {
                    return permissions_1.DEFAULT_PERMISSION_DM;
                }
                else {
                    return (_b = this.permissions) !== null && _b !== void 0 ? _b : permissions_1.DEFAULT_PERMISSION_DM;
                }
            }
            case 'TextChannel':
            case 'VoiceChannel': {
                let server = this.server;
                if (typeof server === 'undefined')
                    return 0;
                if (server.owner === ((_c = this.client.user) === null || _c === void 0 ? void 0 : _c._id)) {
                    return permissions_1.U32_MAX;
                }
                else {
                    let member = (_d = this.client.members.getKey({
                        user: this.client.user._id,
                        server: server._id
                    })) !== null && _d !== void 0 ? _d : { roles: null };
                    if (!member)
                        return 0;
                    let perm = ((_e = this.default_permissions) !== null && _e !== void 0 ? _e : server.default_permissions[1]) >>> 0;
                    if (member.roles) {
                        for (let role of member.roles) {
                            perm |= ((_g = (_f = this.role_permissions) === null || _f === void 0 ? void 0 : _f[role]) !== null && _g !== void 0 ? _g : 0) >>> 0;
                            perm |= ((_j = (_h = server.roles) === null || _h === void 0 ? void 0 : _h[role].permissions[1]) !== null && _j !== void 0 ? _j : 0) >>> 0;
                        }
                    }
                    return perm;
                }
            }
        }
    }
}
__decorate([
    mobx_1.action
], Channel.prototype, "update", null);
__decorate([
    mobx_1.action
], Channel.prototype, "updateGroupJoin", null);
__decorate([
    mobx_1.action
], Channel.prototype, "updateGroupLeave", null);
__decorate([
    mobx_1.action
], Channel.prototype, "updateStartTyping", null);
__decorate([
    mobx_1.action
], Channel.prototype, "updateStopTyping", null);
__decorate([
    mobx_1.computed
], Channel.prototype, "permission", null);
exports.Channel = Channel;
class Channels extends Collection_1.default {
    constructor(client) {
        super(client);
        this.createObj = this.createObj.bind(this);
    }
    $get(id, data) {
        let channel = this.get(id);
        if (data)
            channel.update(data);
        return channel;
    }
    /**
     * Fetch a channel
     * @param id Channel ID
     * @returns The channel
     */
    fetch(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.has(id))
                return this.$get(id);
            let res = data !== null && data !== void 0 ? data : yield this.client.req('GET', `/channels/${id}`);
            return this.createObj(res);
        });
    }
    /**
     * Create a channel object.
     * This is meant for internal use only.
     * @param data: Channel Data
     * @param emit Whether to emit creation event
     * @returns Channel
     */
    createObj(data, emit) {
        if (this.has(data._id))
            return this.$get(data._id);
        let channel = new Channel(this.client, data);
        mobx_1.runInAction(() => {
            this.set(data._id, channel);
        });
        if (emit === true)
            this.client.emit('channel/create', channel);
        return channel;
    }
    /**
     * Create a group
     * @param data Group create route data
     * @returns The newly-created group
     */
    createGroup(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let group = yield this.client.req('POST', `/channels/create`, data);
            return (yield this.fetch(group._id, group));
        });
    }
}
__decorate([
    mobx_1.action
], Channels.prototype, "$get", null);
exports.default = Channels;
