import type { Channel as ChannelI, Message as MessageI } from 'revolt-api/types/Channels';
import type { RemoveChannelField, Route } from '../api/routes';
import type { Attachment } from 'revolt-api/types/Autumn';
import { Nullable } from '../util/null';
import Collection from './Collection';
import { Message } from './Messages';
import { Client, FileArgs } from '..';
export declare class Channel {
    client: Client;
    _id: string;
    channel_type: ChannelI["channel_type"];
    /**
     * Whether this DM is active.
     * @requires `DirectMessage`
     */
    active: Nullable<boolean>;
    /**
     * The ID of the group owner.
     * @requires `Group`
     */
    owner_id: Nullable<string>;
    /**
     * The ID of the server this channel is in.
     * @requires `TextChannel`, `VoiceChannel`
     */
    server_id: Nullable<string>;
    /**
     * Permissions for group members.
     * @requires `Group`
     */
    permissions: Nullable<number>;
    /**
     * Default server channel permissions.
     * @requires `TextChannel`, `VoiceChannel`
     */
    default_permissions: Nullable<number>;
    /**
     * Channel permissions for each role.
     * @requires `TextChannel`, `VoiceChannel`
     */
    role_permissions: Nullable<{
        [key: string]: number;
    }>;
    /**
     * Channel name.
     * @requires `Group`, `TextChannel`, `VoiceChannel`
     */
    name: Nullable<string>;
    /**
     * Channel icon.
     * @requires `Group`, `TextChannel`, `VoiceChannel`
     */
    icon: Nullable<Attachment>;
    /**
     * Channel description.
     * @requires `Group`, `TextChannel`, `VoiceChannel`
     */
    description: Nullable<string>;
    /**
     * Group / DM members.
     * @requires `Group`, `DM`
     */
    recipient_ids: Nullable<string[]>;
    /**
     * Id of last message in channel.
     * @requires `Group`, `DM`, `TextChannel`, `VoiceChannel`
     */
    last_message_id: Nullable<string>;
    /**
     * Users typing in channel.
     */
    typing_ids: Set<string>;
    /**
     * The group owner.
     * @requires `Group`
     */
    get owner(): import("./Users").User | undefined;
    /**
     * Server this channel belongs to.
     * @requires `Server`
     */
    get server(): import("./Servers").Server | undefined;
    /**
     * The DM recipient.
     * @requires `DM`
     */
    get recipient(): import("./Users").User | undefined;
    /**
     * Last message sent in this channel.
     * @requires `Group`, `DM`, `TextChannel`, `VoiceChannel`
     */
    get last_message(): Message | undefined;
    /**
     * Group recipients.
     * @requires `Group`
     */
    get recipients(): (import("./Users").User | undefined)[] | undefined;
    /**
     * Users typing.
     */
    get typing(): (import("./Users").User | undefined)[];
    constructor(client: Client, data: ChannelI);
    update(data: Partial<ChannelI>, clear?: RemoveChannelField): void;
    updateGroupJoin(user: string): void;
    updateGroupLeave(user: string): void;
    updateStartTyping(id: string): void;
    updateStopTyping(id: string): void;
    /**
     * Fetch a channel's members.
     * @requires `Group`
     * @returns An array of the channel's members.
     */
    fetchMembers(): Promise<import("./Users").User[]>;
    /**
     * Edit a channel
     * @param data Channel editing route data
     */
    edit(data: Route<'PATCH', '/channels/id'>["data"]): Promise<undefined>;
    /**
     * Delete a channel
     * @requires `DM`, `Group`, `TextChannel`, `VoiceChannel`
     */
    delete(avoidReq?: boolean): Promise<void>;
    /**
     * Add a user to a group
     * @param user_id ID of the target user
     */
    addMember(user_id: string): Promise<undefined>;
    /**
     * Remove a user from a group
     * @param user_id ID of the target user
     */
    removeMember(user_id: string): Promise<undefined>;
    /**
     * Send a message
     * @param data Either the message as a string or message sending route data
     * @returns The message
     */
    sendMessage(data: string | (Omit<Route<'POST', '/channels/id/messages'>["data"], 'nonce'> & {
        nonce?: string;
    })): Promise<Message>;
    /**
     * Fetch a message by its ID
     * @param message_id ID of the target message
     * @returns The message
     */
    fetchMessage(message_id: string): Promise<Message>;
    /**
     * Fetch multiple messages from a channel
     * @param params Message fetching route data
     * @returns The messages
     */
    fetchMessages(params?: Omit<Route<'GET', '/channels/id/messages'>["data"], 'include_users'>): Promise<Message[]>;
    /**
     * Fetch multiple messages from a channel including the users that sent them
     * @param params Message fetching route data
     * @returns Object including messages and users
     */
    fetchMessagesWithUsers(params?: Omit<Route<'GET', '/channels/id/messages'>["data"], 'include_users'>): Promise<{
        messages: Message[];
        users: import("./Users").User[];
        members: import("./Members").Member[] | undefined;
    }>;
    /**
     * Search for messages
     * @param params Message searching route data
     * @returns The messages
     */
    search(params: Omit<Route<'POST', '/channels/id/search'>["data"], 'include_users'>): Promise<Message[]>;
    /**
     * Search for messages including the users that sent them
     * @param params Message searching route data
     * @returns The messages
     */
    searchWithUsers(params: Omit<Route<'POST', '/channels/id/search'>["data"], 'include_users'>): Promise<{
        messages: Message[];
        users: import("./Users").User[];
        members: import("./Members").Member[] | undefined;
    }>;
    /**
     * Fetch stale messages
     * @param ids IDs of the target messages
     * @returns The stale messages
     */
    fetchStale(ids: string[]): Promise<{
        updated: MessageI[];
        deleted: string[];
    }>;
    /**
     * Create an invite to the channel
     * @returns Newly created invite code
     */
    createInvite(): Promise<string>;
    /**
     * Join a call in a channel
     * @returns Join call response data
     */
    joinCall(): Promise<{
        token: string;
    }>;
    private ackTimeout?;
    private ackLimit?;
    /**
     * Mark a channel as read
     * @param message Last read message or its ID
     * @param skipRateLimiter Whether to skip the internal rate limiter
     */
    ack(message?: Message | string, skipRateLimiter?: boolean): Promise<void>;
    /**
     * Set role permissions
     * @param role_id Role Id, set to 'default' to affect all users
     * @param permissions Permission number, removes permission if unset
     */
    setPermissions(role_id?: string, permissions?: number): Promise<undefined>;
    /**
     * Start typing in this channel
     */
    startTyping(): void;
    /**
     * Stop typing in this channel
     */
    stopTyping(): void;
    generateIconURL(...args: FileArgs): string | undefined;
    get permission(): number;
}
export default class Channels extends Collection<string, Channel> {
    constructor(client: Client);
    $get(id: string, data?: ChannelI): Channel;
    /**
     * Fetch a channel
     * @param id Channel ID
     * @returns The channel
     */
    fetch(id: string, data?: ChannelI): Promise<Channel>;
    /**
     * Create a channel object.
     * This is meant for internal use only.
     * @param data: Channel Data
     * @param emit Whether to emit creation event
     * @returns Channel
     */
    createObj(data: ChannelI, emit?: boolean | number): Channel;
    /**
     * Create a group
     * @param data Group create route data
     * @returns The newly-created group
     */
    createGroup(data: Route<'POST', '/channels/create'>["data"]): Promise<Channel>;
}
