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
exports.Member = void 0;
const mobx_1 = require("mobx");
const lodash_isequal_1 = __importDefault(require("lodash.isequal"));
const null_1 = require("../util/null");
const Collection_1 = __importDefault(require("./Collection"));
class Member {
    constructor(client, data) {
        this.nickname = null;
        this.avatar = null;
        this.roles = null;
        this.client = client;
        this._id = data._id;
        this.nickname = null_1.toNullable(data.nickname);
        this.avatar = null_1.toNullable(data.avatar);
        this.roles = null_1.toNullable(data.roles);
        mobx_1.makeAutoObservable(this, {
            _id: false,
            client: false,
        });
    }
    update(data, clear) {
        const apply = (key) => {
            // This code has been tested.
            // @ts-expect-error
            if (typeof data[key] !== 'undefined' && !lodash_isequal_1.default(this[key], data[key])) {
                // @ts-expect-error
                this[key] = data[key];
            }
        };
        switch (clear) {
            case "Nickname":
                this.nickname = null;
                break;
            case "Avatar":
                this.avatar = null;
                break;
        }
        apply("nickname");
        apply("avatar");
        apply("roles");
    }
    /**
     * Edit a server member
     * @param data Member editing route data
     * @returns Server member object
     */
    edit(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('PATCH', `/servers/${this._id.server}/members/${this._id.user}`, data);
        });
    }
    /**
     * Kick server member
     * @param user_id User ID
     */
    kick() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.req('DELETE', `/servers/${this._id.server}/members/${this._id.user}`);
        });
    }
    generateAvatarURL(...args) {
        var _a;
        return this.client.generateFileURL((_a = this.avatar) !== null && _a !== void 0 ? _a : undefined, ...args);
    }
}
__decorate([
    mobx_1.action
], Member.prototype, "update", null);
__decorate([
    mobx_1.computed
], Member.prototype, "generateAvatarURL", null);
exports.Member = Member;
class Members extends Collection_1.default {
    constructor(client) {
        super(client);
        this.createObj = this.createObj.bind(this);
    }
    static toKey(id) {
        return JSON.stringify(id, Object.keys(id).sort());
    }
    hasKey(id) {
        return super.has(Members.toKey(id));
    }
    getKey(id) {
        return super.get(Members.toKey(id));
    }
    setKey(id, member) {
        return super.set(Members.toKey(id), member);
    }
    deleteKey(id) {
        return super.delete(Members.toKey(id));
    }
    $get(id, data) {
        let member = this.getKey(id);
        if (data)
            member.update(data);
        return member;
    }
    /**
     * Create a member object.
     * This is meant for internal use only.
     * @param data: Member Data
     * @param emit Whether to emit creation event
     * @returns Member
     */
    createObj(data, emit) {
        if (this.hasKey(data._id))
            return this.$get(data._id, data);
        let member = new Member(this.client, data);
        mobx_1.runInAction(() => {
            this.setKey(data._id, member);
        });
        if (emit === true)
            this.client.emit('member/join', member);
        return member;
    }
}
__decorate([
    mobx_1.action
], Members.prototype, "$get", null);
exports.default = Members;
