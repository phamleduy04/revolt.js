import type { Category, PermissionTuple, Role, Server as ServerI, SystemMessageChannels } from 'revolt-api/types/Servers';
import type { RemoveServerField, Route } from '../api/routes';
import type { Attachment } from 'revolt-api/types/Autumn';
import { Nullable } from '../util/null';
import Collection from './Collection';
import { User } from './Users';
import { Client, FileArgs } from '..';
export declare class Server {
    client: Client;
    _id: string;
    owner: string;
    name: string;
    description: Nullable<string>;
    channel_ids: string[];
    categories: Nullable<Category[]>;
    system_messages: Nullable<SystemMessageChannels>;
    roles: Nullable<{
        [key: string]: Role;
    }>;
    default_permissions: PermissionTuple;
    icon: Nullable<Attachment>;
    banner: Nullable<Attachment>;
    nsfw: Nullable<boolean>;
    flags: Nullable<number>;
    get channels(): (import("./Channels").Channel | undefined)[];
    constructor(client: Client, data: ServerI);
    update(data: Partial<ServerI>, clear?: RemoveServerField): void;
    /**
     * Create a channel
     * @param data Channel create route data
     * @returns The newly-created channel
     */
    createChannel(data: Route<'POST', '/servers/id/channels'>["data"]): Promise<import("revolt-api/types/Channels").TextChannel | import("revolt-api/types/Channels").VoiceChannel>;
    /**
     * Edit a server
     * @param data Server editing route data
     */
    edit(data: Route<'PATCH', '/servers/id'>["data"]): Promise<undefined>;
    /**
     * Delete a guild
     */
    delete(avoidReq?: boolean): Promise<void>;
    /**
     * Mark a server as read
     */
    ack(): Promise<undefined>;
    /**
     * Ban user
     * @param user_id User ID
     */
    banUser(user_id: string, data: Route<'PUT', '/servers/id/bans/id'>["data"]): Promise<undefined>;
    /**
     * Unban user
     * @param user_id User ID
     */
    unbanUser(user_id: string): Promise<undefined>;
    /**
     * Fetch a server's invites
     * @returns An array of the server's invites
     */
    fetchInvites(): Promise<import("revolt-api/types/Invites").ServerInvite[]>;
    /**
     * Fetch a server's bans
     * @returns An array of the server's bans.
     */
    fetchBans(): Promise<{
        users: Pick<import("revolt-api/types/Users").User, "_id" | "username" | "avatar">[];
        bans: import("revolt-api/types/Servers").Ban[];
    }>;
    /**
     * Set role permissions
     * @param role_id Role Id, set to 'default' to affect all users
     * @param permissions Permission number, removes permission if unset
     */
    setPermissions(role_id?: string, permissions?: {
        server: number;
        channel: number;
    }): Promise<undefined>;
    /**
     * Create role
     * @param name Role name
     */
    createRole(name: string): Promise<{
        id: string;
        permissions: PermissionTuple;
    }>;
    /**
     * Edit a role
     * @param role_id Role ID
     * @param data Role editing route data
     */
    editRole(role_id: string, data: Route<'PATCH', '/servers/id/roles/id'>["data"]): Promise<undefined>;
    /**
     * Delete role
     * @param role_id Role ID
     */
    deleteRole(role_id: string): Promise<undefined>;
    /**
     * Fetch a server member
     * @param user User or User ID
     * @returns Server member object
     */
    fetchMember(user: User | string): Promise<import("./Members").Member>;
    /**
     * Fetch a server's members.
     * @returns An array of the server's members and their user objects.
     */
    fetchMembers(): Promise<{
        members: import("./Members").Member[];
        users: User[];
    }>;
    generateIconURL(...args: FileArgs): string | undefined;
    generateBannerURL(...args: FileArgs): string | undefined;
    get permission(): number;
}
export default class Servers extends Collection<string, Server> {
    constructor(client: Client);
    $get(id: string, data?: ServerI): Server;
    /**
     * Fetch a server
     * @param id Server ID
     * @returns The server
     */
    fetch(id: string, data?: ServerI): Promise<Server>;
    /**
     * Create a server object.
     * This is meant for internal use only.
     * @param data: Server Data
     * @returns Server
     */
    createObj(data: ServerI): Server;
    /**
     * Create a server
     * @param data Server create route data
     * @returns The newly-created server
     */
    createServer(data: Route<'POST', '/servers/create'>["data"]): Promise<Server>;
}
