import type { Member as MemberI, MemberCompositeKey } from 'revolt-api/types/Servers';
import type { RemoveMemberField, Route } from '../api/routes';
import type { Attachment } from 'revolt-api/types/Autumn';
import { Nullable } from '../util/null';
import Collection from './Collection';
import { Client, FileArgs } from '..';
export declare class Member {
    client: Client;
    _id: MemberCompositeKey;
    nickname: Nullable<string>;
    avatar: Nullable<Attachment>;
    roles: Nullable<string[]>;
    constructor(client: Client, data: MemberI);
    update(data: Partial<MemberI>, clear?: RemoveMemberField): void;
    /**
     * Edit a server member
     * @param data Member editing route data
     * @returns Server member object
     */
    edit(data: Route<'PATCH', '/servers/id/members/id'>["data"]): Promise<undefined>;
    /**
     * Kick server member
     * @param user_id User ID
     */
    kick(): Promise<undefined>;
    generateAvatarURL(...args: FileArgs): string | undefined;
}
export default class Members extends Collection<string, Member> {
    constructor(client: Client);
    static toKey(id: MemberCompositeKey): string;
    hasKey(id: MemberCompositeKey): boolean;
    getKey(id: MemberCompositeKey): Member | undefined;
    setKey(id: MemberCompositeKey, member: Member): this;
    deleteKey(id: MemberCompositeKey): boolean;
    $get(id: MemberCompositeKey, data?: MemberI): Member;
    /**
     * Create a member object.
     * This is meant for internal use only.
     * @param data: Member Data
     * @param emit Whether to emit creation event
     * @returns Member
     */
    createObj(data: MemberI, emit?: boolean | number): Member;
}
