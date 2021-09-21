"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PERMISSION_DM = exports.U32_MAX = exports.ServerPermission = exports.ChannelPermission = exports.UserPermission = void 0;
exports.UserPermission = {
    Access: 1 << 0,
    ViewProfile: 1 << 1,
    SendMessage: 1 << 2,
    Invite: 1 << 3,
};
exports.ChannelPermission = {
    View: 1 << 0,
    SendMessage: 1 << 1,
    ManageMessages: 1 << 2,
    ManageChannel: 1 << 3,
    VoiceCall: 1 << 4,
    InviteOthers: 1 << 5,
    EmbedLinks: 1 << 6,
    UploadFiles: 1 << 7,
};
exports.ServerPermission = {
    View: 1 << 0,
    ManageRoles: 1 << 1,
    ManageChannels: 1 << 2,
    ManageServer: 1 << 3,
    KickMembers: 1 << 4,
    BanMembers: 1 << 5,
    ChangeNickname: 1 << 12,
    ManageNicknames: 1 << 13,
    ChangeAvatar: 1 << 14,
    RemoveAvatars: 1 << 15,
};
exports.U32_MAX = Math.pow(2, 32) - 1; // 4294967295
exports.DEFAULT_PERMISSION_DM = exports.ChannelPermission.View
    + exports.ChannelPermission.SendMessage
    + exports.ChannelPermission.ManageChannel
    + exports.ChannelPermission.VoiceCall
    + exports.ChannelPermission.InviteOthers
    + exports.ChannelPermission.EmbedLinks
    + exports.ChannelPermission.UploadFiles;
