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
const dotenv_1 = require("dotenv");
const _1 = require(".");
dotenv_1.config();
// To run this example, you need to have a local Revolt server running and an existing account.
// Copy and paste `.env.example` to `.env` and edit accordingly.
function user() {
    let client = new _1.Client({
        apiURL: process.env.API_URL,
        debug: true
    });
    client.on('ready', () => __awaiter(this, void 0, void 0, function* () {
        console.info(`Logged in as ${client.user.username}!`);
    }));
    client.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
        if (message.content === 'sus') {
            message.channel.sendMessage('sus!');
        }
        else if (message.content === 'bot') {
            let bot = yield client.req('POST', '/bots/create', { name: 'basedbot12' });
            message.channel.sendMessage(JSON.stringify(bot));
        }
        else if (message.content === 'my bots') {
            message.channel.sendMessage(JSON.stringify(yield client.req('GET', '/bots/@me')));
        }
        else if (message.content === 'join bot') {
            yield client.req('POST', `/bots/01FCV7DCMRD9MT3JBYT5VEKVRD/invite`, { group: message.channel_id });
            // { server: '01FATEGMHEE2M1QGPA65NS6V8K' });
        }
        else if (message.content === 'edit bot name') {
            yield client.req('PATCH', `/bots/01FCV7DCMRD9MT3JBYT5VEKVRD`, { name: 'testingbkaka' });
        }
        else if (message.content === 'make bot public') {
            yield client.req('PATCH', `/bots/01FCV7DCMRD9MT3JBYT5VEKVRD`, { public: true });
        }
        else if (message.content === 'delete bot') {
            yield client.req('DELETE', `/bots/01FCV7DCMRD9MT3JBYT5VEKVRD`);
        }
    }));
    client.login({ email: process.env.EMAIL, password: process.env.PASSWORD });
}
function bot() {
    let client = new _1.Client({
        apiURL: process.env.API_URL
    });
    client.on('ready', () => __awaiter(this, void 0, void 0, function* () {
        console.info(`Logged in as ${client.user.username}! [${client.user._id}]`);
    }));
    client.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
        if (message.content === 'sus') {
            message.channel.sendMessage('sus!');
        }
    }));
    // client.loginBot(process.env.BOT_TOKEN as string)
}
user();
bot();
