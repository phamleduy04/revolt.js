import { AxiosRequestConfig } from 'axios';
import { EventEmitter } from 'eventemitter3';
import { WebSocketClient } from './websocket/client';
import { Route, RoutePath, RouteMethod } from './api/routes';
import { ClientboundNotification } from './websocket/notifications';
import type { RevoltConfiguration } from 'revolt-api/types/Core';
import type { SizeOptions } from 'revolt-api/types/Autumn';
import type { Session } from 'revolt-api/types/Auth';
import Users, { User } from './maps/Users';
import Channels, { Channel } from './maps/Channels';
import Servers, { Server } from './maps/Servers';
import Members, { Member } from './maps/Members';
import Messages, { Message } from './maps/Messages';
import Bots from './maps/Bots';
import { MemberCompositeKey, Role } from 'revolt-api/types/Servers';
/**
 * Client options object
 */
export interface ClientOptions {
    apiURL: string;
    debug: boolean;
    cache: boolean;
    heartbeat: number;
    autoReconnect: boolean;
    ackRateLimiter: boolean;
}
export declare interface Client {
    on(event: 'connected', listener: () => void): this;
    on(event: 'connecting', listener: () => void): this;
    on(event: 'dropped', listener: () => void): this;
    on(event: 'ready', listener: () => void): this;
    on(event: 'packet', listener: (packet: ClientboundNotification) => void): this;
    on(event: 'message', listener: (message: Message) => void): this;
    on(event: 'message/update', listener: (message: Message) => void): this;
    on(event: 'message/delete', listener: (id: string) => void): this;
    on(event: 'channel/create', listener: (channel: Channel) => void): this;
    on(event: 'channel/update', listener: (channel: Channel) => void): this;
    on(event: 'channel/delete', listener: (id: string) => void): this;
    on(event: 'server/update', listener: (server: Server) => void): this;
    on(event: 'server/delete', listener: (id: string) => void): this;
    on(event: 'role/update', listener: (roleId: string, role: Role, serverId: string) => void): this;
    on(event: 'role/delete', listener: (id: string, serverId: string) => void): this;
    on(event: 'member/join', listener: (member: Member) => void): this;
    on(event: 'member/update', listener: (member: Member) => void): this;
    on(event: 'member/leave', listener: (id: MemberCompositeKey) => void): this;
    on(event: 'user/relationship', listener: (user: User) => void): this;
}
/**
 * Regular expression for mentions.
 */
export declare const RE_MENTIONS: RegExp;
/**
 * Regular expression for spoilers.
 */
export declare const RE_SPOILER: RegExp;
export declare type FileArgs = [options?: SizeOptions, allowAnimation?: boolean, fallback?: string];
export declare class Client extends EventEmitter {
    heartbeat: number;
    session?: Session | string;
    user?: User;
    options: ClientOptions;
    websocket: WebSocketClient;
    private Axios;
    configuration?: RevoltConfiguration;
    users: Users;
    channels: Channels;
    servers: Servers;
    members: Members;
    messages: Messages;
    bots: Bots;
    constructor(options?: Partial<ClientOptions>);
    /**
     * ? Configuration.
     */
    get apiURL(): string;
    get debug(): boolean;
    get autoReconnect(): boolean;
    /**
     * ? Axios request wrapper.
     */
    req<M extends RouteMethod, T extends RoutePath>(method: M, url: T): Promise<Route<M, T>["response"]>;
    req<M extends RouteMethod, T extends RoutePath>(method: M, url: T, data: Route<M, T>["data"]): Promise<Route<M, T>["response"]>;
    /**
     * Perform an HTTP request using Axios, specifying a request config.
     * @param method HTTP method
     * @param url Target route
     * @param data Axios request config object
     * @returns The response body
     */
    request<M extends RouteMethod, T extends RoutePath>(method: M, url: T, data: AxiosRequestConfig): Promise<Route<M, T>["response"]>;
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
    connect(): Promise<void>;
    /**
     * Fetches the configuration of the server if it has not been already fetched.
     */
    fetchConfiguration(): Promise<void>;
    private $generateHeaders;
    /**
     * Log in with auth data, creating a new session in the process.
     * @param details Login data object
     * @returns An onboarding function if onboarding is required, undefined otherwise
     */
    login(details: Route<'POST', '/auth/session/login'>["data"]): Promise<((username: string, loginAfterSuccess?: boolean | undefined) => Promise<void>) | undefined>;
    /**
     * Use an existing session to log into Revolt.
     * @param session Session data object
     * @returns An onboarding function if onboarding is required, undefined otherwise
     */
    useExistingSession(session: Session): Promise<((username: string, loginAfterSuccess?: boolean | undefined) => Promise<void>) | undefined>;
    /**
     * Log in as a bot.
     * @param token Bot token
     */
    loginBot(token: string): Promise<void>;
    private $connect;
    /**
     * Finish onboarding for a user, for example by providing a username.
     * @param data Onboarding data object
     * @param loginAfterSuccess Defines whether to automatically log in and connect after onboarding finishes
     */
    completeOnboarding(data: Route<'POST', '/onboard/complete'>["data"], loginAfterSuccess?: boolean): Promise<void>;
    /**
     * ? Miscellaneous API routes.
     */
    /**
     * Fetch infomation about an UserID
     * @param id The User ID
     * @returns User infomation
     */
    fetchUser(id: string): Promise<import("revolt-api/types/Users").User>;
    /**
     * Fetch information about a given invite code.
     * @param code The invite code.
     * @returns Invite information.
     */
    fetchInvite(code: string): Promise<import("revolt-api/types/Invites").RetrievedInvite>;
    /**
     * Use an invite.
     * @param code The invite code.
     * @returns Data provided by invite.
     */
    joinInvite(code: string): Promise<{
        type: "Server";
        channel: import("revolt-api/types/Channels").TextChannel;
        server: import("revolt-api/types/Servers").Server;
    }>;
    /**
     * Delete an invite.
     * @param code The invite code.
     */
    deleteInvite(code: string): Promise<void>;
    /**
     * Fetch user settings for current user.
     * @param keys Settings keys to fetch, leave blank to fetch full object.
     * @returns Key-value object of settings.
     */
    syncFetchSettings(keys: string[]): Promise<import("revolt-api/types/Sync").UserSettings>;
    /**
     * Set user settings for current user.
     * @param data Data to set as an object. Any non-string values will be automatically serialised.
     * @param timestamp Timestamp to use for the current revision.
     */
    syncSetSettings(data: {
        [key: string]: object | string;
    }, timestamp?: number): Promise<void>;
    /**
     * Fetch user unreads for current user.
     * @returns Array of channel unreads.
     */
    syncFetchUnreads(): Promise<import("revolt-api/types/Sync").ChannelUnread[]>;
    /**
     * ? Utility functions.
     */
    /**
     * Log out of REVOLT. Disconnect the WebSocket, request a session invalidation and reset the client.
     */
    logout(): Promise<void>;
    /**
     * Reset the client by setting properties to their original value or deleting them entirely.
     * Disconnects the current WebSocket.
     */
    reset(): void;
    /**
     * Register for a new account.
     * @param data Registration data object
     * @returns A promise containing a registration response object
     */
    register(data: Route<'POST', '/auth/account/create'>["data"]): Promise<undefined>;
    /**
     * Prepare a markdown-based message to be displayed to the user as plain text.
     * @param source Source markdown text
     * @returns Modified plain text
     */
    markdownToText(source: string): string;
    /**
     * Proxy a file through January.
     * @param url URL to proxy
     * @returns Proxied media URL
     */
    proxyFile(url: string): string | undefined;
    /**
     * Generates a URL to a given file with given options.
     * @param attachment Partial of attachment object
     * @param options Optional query parameters to modify object
     * @param allowAnimation Returns GIF if applicable, no operations occur on image
     * @param fallback Fallback URL
     * @returns Generated URL or nothing
     */
    generateFileURL(attachment?: {
        tag: string;
        _id: string;
        content_type?: string;
    }, ...args: FileArgs): string | undefined;
}
