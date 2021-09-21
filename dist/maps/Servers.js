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
exports.Server = void 0;
const mobx_1 = require("mobx");
const lodash_isequal_1 = __importDefault(require("lodash.isequal"));
const null_1 = require("../util/null");
const permissions_1 = require("../api/permissions");
const Collection_1 = __importDefault(require("./Collection"));
class Server {
    constructor(client, data) {
        this.description = null;
        this.channel_ids = [];
        this.categories = null;
        this.system_messages = null;
        this.roles = null;
        this.icon = null;
        this.banner = null;
        this.nsfw = null;
        this.flags = null;
        this.client = client;
        this._id = data._id;
        this.owner = data.owner;
        this.name = data.name;
        this.description = null_1.toNullable(data.description);
        this.channel_ids = data.channels;
        this.categories = null_1.toNullable(data.categories);
        this.system_messages = null_1.toNullable(data.system_messages);
        this.roles = null_1.toNullable(data.roles);
        this.default_permissions = data.default_permissions;
        this.icon = null_1.toNullable(data.icon);
        this.banner = null_1.toNullable(data.banner);
        this.nsfw = null_1.toNullable(data.nsfw);
        this.flags = null_1.toNullable(data.flags);
        mobx_1.makeAutoObservable(this, {
            _id: false,
            client: false,
        });
    }
    get channels() {
        return this.channel_ids.map(x => this.client.channels.get(x));
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
            case "Banner":
                this.banner = null;
                break;
            case "Description":
                this.description = null;
                break;
            case "Icon":
                this.icon = null;
                break;
        }
        apply("owner");
        apply("name");
        apply("description");
        apply("channels", "channel_ids");
        apply("categories");
        apply("system_messages");
        apply("roles");
        apply("default_permissions");
        apply("icon");
        apply("banner");
        apply("nsfw");
        apply("flags");
    }
    /**
     * Create a channel
     * @param data Channel create route data
     * @returns The newly-created channel
     */
    createChannel(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('POST', `/servers/${this._id}/channels`, data);
        });
    }
    /**
     * Edit a server
     * @param data Server editing route data
     */
    edit(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('PATCH', `/servers/${this._id}`, data);
        });
    }
    /**
     * Delete a guild
     */
    delete(avoidReq) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!avoidReq)
                yield this.client.req('DELETE', `/servers/${this._id}`);
            mobx_1.runInAction(() => {
                this.client.servers.delete(this._id);
            });
        });
    }
    /**
     * Mark a server as read
     */
    ack() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('PUT', `/servers/${this._id}/ack`);
        });
    }
    /**
     * Ban user
     * @param user_id User ID
     */
    banUser(user_id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('PUT', `/servers/${this._id}/bans/${user_id}`, data);
        });
    }
    /**
     * Unban user
     * @param user_id User ID
     */
    unbanUser(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('DELETE', `/servers/${this._id}/bans/${user_id}`);
        });
    }
    /**
     * Fetch a server's invites
     * @returns An array of the server's invites
     */
    fetchInvites() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('GET', `/servers/${this._id}/invites`);
        });
    }
    /**
     * Fetch a server's bans
     * @returns An array of the server's bans.
     */
    fetchBans() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('GET', `/servers/${this._id}/bans`);
        });
    }
    /**
     * Set role permissions
     * @param role_id Role Id, set to 'default' to affect all users
     * @param permissions Permission number, removes permission if unset
     */
    setPermissions(role_id = 'default', permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('PUT', `/servers/${this._id}/permissions/${role_id}`, { permissions });
        });
    }
    /**
     * Create role
     * @param name Role name
     */
    createRole(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('POST', `/servers/${this._id}/roles`, { name });
        });
    }
    /**
     * Edit a role
     * @param role_id Role ID
     * @param data Role editing route data
     */
    editRole(role_id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('PATCH', `/servers/${this._id}/roles/${role_id}`, data);
        });
    }
    /**
     * Delete role
     * @param role_id Role ID
     */
    deleteRole(role_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('DELETE', `/servers/${this._id}/roles/${role_id}`);
        });
    }
    /**
     * Fetch a server member
     * @param user User or User ID
     * @returns Server member object
     */
    fetchMember(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const user_id = typeof user === 'string' ? user : user._id;
            const existing = this.client.members.getKey({ server: this._id, user: user_id });
            if (existing)
                return existing;
            const member = yield this.client.req('GET', `/servers/${this._id}/members/${user_id}`);
            return this.client.members.createObj(member);
        });
    }
    /**
     * Fetch a server's members.
     * @returns An array of the server's members and their user objects.
     */
    fetchMembers() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.client.req('GET', `/servers/${this._id}/members`);
            return mobx_1.runInAction(() => {
                return {
                    members: data.members.map(this.client.members.createObj),
                    users: data.users.map(this.client.users.createObj)
                };
            });
        });
    }
    generateIconURL(...args) {
        var _a;
        return this.client.generateFileURL((_a = this.icon) !== null && _a !== void 0 ? _a : undefined, ...args);
    }
    generateBannerURL(...args) {
        var _a;
        return this.client.generateFileURL((_a = this.banner) !== null && _a !== void 0 ? _a : undefined, ...args);
    }
    get permission() {
        var _a, _b, _c, _d;
        if (this.owner === ((_a = this.client.user) === null || _a === void 0 ? void 0 : _a._id)) {
            return permissions_1.U32_MAX;
        }
        else {
            let member = (_b = this.client.members.getKey({
                user: this.client.user._id,
                server: this._id
            })) !== null && _b !== void 0 ? _b : { roles: null };
            if (!member)
                return 0;
            let perm = this.default_permissions[0] >>> 0;
            if (member.roles) {
                for (let role of member.roles) {
                    perm |= ((_d = (_c = this.roles) === null || _c === void 0 ? void 0 : _c[role].permissions[0]) !== null && _d !== void 0 ? _d : 0) >>> 0;
                }
            }
            return perm;
        }
    }
}
__decorate([
    mobx_1.action
], Server.prototype, "update", null);
__decorate([
    mobx_1.computed
], Server.prototype, "generateIconURL", null);
__decorate([
    mobx_1.computed
], Server.prototype, "generateBannerURL", null);
__decorate([
    mobx_1.computed
], Server.prototype, "permission", null);
exports.Server = Server;
class Servers extends Collection_1.default {
    constructor(client) {
        super(client);
        this.createObj = this.createObj.bind(this);
    }
    $get(id, data) {
        let server = this.get(id);
        if (data)
            server.update(data);
        return server;
    }
    /**
     * Fetch a server
     * @param id Server ID
     * @returns The server
     */
    fetch(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.has(id))
                return this.$get(id, data);
            let res = data !== null && data !== void 0 ? data : yield this.client.req('GET', `/servers/${id}`);
            return mobx_1.runInAction(() => __awaiter(this, void 0, void 0, function* () {
                for (let channel of res.channels) {
                    // ! FIXME: add route for fetching all channels
                    // ! FIXME: OR the WHOLE server
                    try {
                        yield this.client.channels.fetch(channel);
                        // future proofing for when not
                    }
                    catch (err) { }
                }
                return this.createObj(res);
            }));
        });
    }
    /**
     * Create a server object.
     * This is meant for internal use only.
     * @param data: Server Data
     * @returns Server
     */
    createObj(data) {
        if (this.has(data._id))
            return this.$get(data._id, data);
        let server = new Server(this.client, data);
        mobx_1.runInAction(() => {
            this.set(data._id, server);
        });
        return server;
    }
    /**
     * Create a server
     * @param data Server create route data
     * @returns The newly-created server
     */
    createServer(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let server = yield this.client.req('POST', `/servers/create`, data);
            return this.fetch(server._id, server);
        });
    }
}
__decorate([
    mobx_1.action
], Servers.prototype, "$get", null);
exports.default = Servers;
