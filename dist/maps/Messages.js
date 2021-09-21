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
exports.Message = void 0;
const mobx_1 = require("mobx");
const lodash_isequal_1 = __importDefault(require("lodash.isequal"));
const null_1 = require("../util/null");
const Collection_1 = __importDefault(require("./Collection"));
class Message {
    constructor(client, data) {
        this.client = client;
        this._id = data._id;
        this.nonce = data.nonce;
        this.channel_id = data.channel;
        this.author_id = data.author;
        this.content = data.content;
        this.attachments = null_1.toNullable(data.attachments);
        this.edited = null_1.toNullableDate(data.edited);
        this.embeds = null_1.toNullable(data.embeds);
        this.mention_ids = null_1.toNullable(data.mentions);
        this.reply_ids = null_1.toNullable(data.replies);
        mobx_1.makeAutoObservable(this, {
            _id: false,
            client: false,
        });
    }
    get channel() {
        return this.client.channels.get(this.channel_id);
    }
    get author() {
        return this.client.users.get(this.author_id);
    }
    get member() {
        const channel = this.channel;
        if ((channel === null || channel === void 0 ? void 0 : channel.channel_type) === 'TextChannel') {
            return this.client.members.getKey({
                server: channel.server_id,
                user: this.author_id
            });
        }
    }
    get mentions() {
        var _a;
        return (_a = this.mention_ids) === null || _a === void 0 ? void 0 : _a.map(id => this.client.users.get(id));
    }
    get asSystemMessage() {
        const content = this.content;
        if (typeof content === 'string')
            return { type: 'text', content };
        const { type } = content;
        const get = (id) => this.client.users.get(id);
        switch (content.type) {
            case 'text': return content;
            case 'user_added': return { type, user: get(content.id), by: get(content.by) };
            case 'user_remove': return { type, user: get(content.id), by: get(content.by) };
            case 'user_joined': return { type, user: get(content.id) };
            case 'user_left': return { type, user: get(content.id) };
            case 'user_kicked': return { type, user: get(content.id) };
            case 'user_banned': return { type, user: get(content.id) };
            case 'channel_renamed': return { type, name: content.name, by: get(content.by) };
            case 'channel_description_changed': return { type, by: get(content.by) };
            case 'channel_icon_changed': return { type, by: get(content.by) };
        }
    }
    update(data) {
        const apply = (key, target, transform) => {
            // This code has been tested.
            // @ts-expect-error
            if (typeof data[key] !== 'undefined' && !lodash_isequal_1.default(this[target !== null && target !== void 0 ? target : key], data[key])) {
                // @ts-expect-error
                this[target !== null && target !== void 0 ? target : key] = transform ? transform(data[key]) : data[key];
            }
        };
        apply("content");
        apply("attachments");
        apply("edited", undefined, null_1.toNullableDate);
        apply("embeds");
        apply("mentions", "mention_ids");
    }
    /**
     * Edit a message
     * @param data Message edit route data
     */
    edit(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('PATCH', `/channels/${this.channel_id}/messages/${this._id}`, data);
        });
    }
    /**
     * Delete a message
     */
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('DELETE', `/channels/${this.channel_id}/messages/${this._id}`);
        });
    }
    /**
     * Acknowledge this message as read
     */
    ack() {
        var _a;
        (_a = this.channel) === null || _a === void 0 ? void 0 : _a.ack(this);
    }
    /**
     * Reply to Message
     */
    reply(data, mention = true) {
        var _a;
        let obj = typeof data === 'string' ? { content: data } : data;
        return (_a = this.channel) === null || _a === void 0 ? void 0 : _a.sendMessage(Object.assign(Object.assign({}, obj), { replies: [{ id: this._id, mention }] }));
    }
}
__decorate([
    mobx_1.computed
], Message.prototype, "asSystemMessage", null);
__decorate([
    mobx_1.action
], Message.prototype, "update", null);
exports.Message = Message;
class Messages extends Collection_1.default {
    constructor(client) {
        super(client);
        this.createObj = this.createObj.bind(this);
    }
    $get(id, data) {
        let msg = this.get(id);
        if (data)
            msg.update(data);
        return msg;
    }
    /**
     * Create a message object.
     * This is meant for internal use only.
     * @param data Message Data
     * @param emit Whether to emit creation event
     * @returns Message
     */
    createObj(data, emit) {
        if (this.has(data._id))
            return this.$get(data._id);
        let message = new Message(this.client, data);
        mobx_1.runInAction(() => {
            this.set(data._id, message);
        });
        if (emit === true)
            this.client.emit('message', message);
        return message;
    }
}
__decorate([
    mobx_1.action
], Messages.prototype, "$get", null);
exports.default = Messages;
