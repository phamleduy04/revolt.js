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
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_1 = require("mobx");
class Bots {
    constructor(client) {
        this.client = client;
    }
    /**
     * Fetch a bot
     * @param id Bot ID
     * @returns Bot and User object
     */
    fetch(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let { bot, user } = yield this.client.req('GET', `/bots/${id}`);
            return {
                bot,
                user: yield this.client.users.fetch(user._id, user)
            };
        });
    }
    /**
     * Delete a bot
     * @param id Bot ID
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.req('DELETE', `/bots/${id}`);
        });
    }
    /**
     * Fetch a public bot
     * @param id Bot ID
     * @returns Public Bot object
     */
    fetchPublic(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('GET', `/bots/${id}/invite`);
        });
    }
    /**
     * Invite a public bot
     * @param id Bot ID
     * @param destination The group or server to add to
     */
    invite(id, destination) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('POST', `/bots/${id}/invite`, destination);
        });
    }
    /**
     * Fetch a bot
     * @param id Bot ID
     * @returns Bot and User objects
     */
    fetchOwned() {
        return __awaiter(this, void 0, void 0, function* () {
            const { bots, users: userObjects } = yield this.client.req('GET', `/bots/@me`);
            let users = [];
            for (const obj of userObjects) {
                users.push(yield this.client.users.fetch(obj._id, obj));
            }
            return { bots, users };
        });
    }
    /**
     * Edit a bot
     * @param id Bot ID
     * @param data Bot edit data object
     */
    edit(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.req('PATCH', `/bots/${id}`, data);
            if (data.name) {
                let user = this.client.users.get(id);
                if (user) {
                    mobx_1.runInAction(() => {
                        user.username = data.name;
                    });
                }
            }
        });
    }
    /**
     * Create a bot
     * @param data Bot creation data
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let bot = yield this.client.req('POST', '/bots/create', data);
            let user = yield this.client.users.fetch(bot._id, {
                _id: bot._id,
                username: data.name,
                bot: {
                    owner: this.client.user._id
                }
            });
            return {
                bot,
                user
            };
        });
    }
}
exports.default = Bots;
