import type { Bot, PublicBot } from 'revolt-api/types/Bots';
import type { RevoltConfiguration } from 'revolt-api/types/Core';
import type { UserSettings, ChannelUnread } from 'revolt-api/types/Sync';
import type { RetrievedInvite, ServerInvite } from 'revolt-api/types/Invites';
import type { Profile, Relationship, RelationshipOnly, Status, User } from 'revolt-api/types/Users';
import type { Ban, Category, Member, PermissionTuple, Server, SystemMessageChannels } from 'revolt-api/types/Servers';
import type { Channel, DirectMessageChannel, GroupChannel, Message, TextChannel, VoiceChannel } from 'revolt-api/types/Channels';
import { Account, SessionInfo } from 'revolt-api/types/Auth';
export declare type RemoveUserField = 'ProfileContent' | 'ProfileBackground' | 'StatusText' | 'Avatar';
export declare type RemoveChannelField = 'Icon' | 'Description';
export declare type RemoveServerField = 'Icon' | 'Banner' | 'Description';
export declare type RemoveMemberField = 'Nickname' | 'Avatar';
export declare type RemoveRoleField = 'Colour';
declare type Id = 'id';
declare type Routes = 
/**
 * Core
 */
{
    method: 'GET';
    route: `/`;
    data: undefined;
    response: RevoltConfiguration;
}
/**
 * Auth
 */
 | {
    method: 'GET';
    route: `/auth/account`;
    data: undefined;
    response: Account;
} | {
    method: 'POST';
    route: `/auth/account/create`;
    data: {
        email: string;
        password: string;
        invite?: string;
        captcha?: string;
    };
    response: undefined;
} | {
    method: 'POST';
    route: `/auth/account/reverify`;
    data: {
        email: string;
        captcha?: string;
    };
    response: undefined;
} | {
    method: 'POST';
    route: `/auth/account/verify/:code`;
    data: undefined;
    response: undefined;
} | {
    method: 'POST';
    route: `/auth/account/reset_password`;
    data: {
        email: string;
        captcha?: string;
    };
    response: undefined;
} | {
    method: 'PATCH';
    route: `/auth/account/reset_password`;
    data: {
        password: string;
        token: string;
    };
    response: undefined;
} | {
    method: 'PATCH';
    route: `/auth/account/change/password`;
    data: {
        password: string;
        current_password: string;
    };
    response: undefined;
} | {
    method: 'PATCH';
    route: `/auth/account/change/email`;
    data: {
        email: string;
        current_password: string;
    };
    response: undefined;
} | {
    method: 'POST';
    route: `/auth/session/login`;
    data: {
        email: string;
        password?: string;
        challenge?: string;
        friendly_name?: string;
        captcha?: string;
    };
    response: undefined;
} | {
    method: 'POST';
    route: `/auth/session/logout`;
    data: undefined;
    response: undefined;
} | {
    method: 'PATCH';
    route: `/auth/session/${Id}`;
    data: {
        friendly_name: string;
    };
    response: undefined;
} | {
    method: 'DELETE';
    route: `/auth/session/${Id}`;
    data: undefined;
    response: undefined;
} | {
    method: 'GET';
    route: `/auth/session/all`;
    data: undefined;
    response: SessionInfo[];
} | {
    method: 'DELETE';
    route: `/auth/session/all`;
    data: undefined;
    response: undefined;
}
/**
 * Onboarding
 */
 | {
    method: 'GET';
    route: `/onboard/hello`;
    data: undefined;
    response: {
        onboarding: boolean;
        id?: string;
    };
} | {
    method: 'POST';
    route: `/onboard/complete`;
    data: {
        username: string;
    };
    response: {
        onboarding: boolean;
    };
}
/**
 * Users
 */
 | {
    method: 'GET';
    route: `/users/${Id}`;
    data: undefined;
    response: User;
} | {
    method: 'PATCH';
    route: `/users/${Id}`;
    data: {
        status?: Status;
        profile?: {
            content?: string;
            background?: string;
        };
        avatar?: string;
        remove?: RemoveUserField;
    };
    response: undefined;
} | {
    method: 'PATCH';
    route: `/users/${Id}/username`;
    data: {
        username: string;
        password: string;
    };
    response: undefined;
} | {
    method: 'GET';
    route: `/users/${Id}/profile`;
    data: undefined;
    response: Profile;
} | {
    method: 'GET';
    route: `/users/dms`;
    data: undefined;
    response: (DirectMessageChannel | GroupChannel)[];
} | {
    method: 'GET';
    route: `/users/${Id}/dm`;
    data: undefined;
    response: DirectMessageChannel;
} | {
    method: 'GET';
    route: `/users/relationships`;
    data: undefined;
    response: Relationship[];
} | {
    method: 'GET';
    route: `/users/${Id}/relationship`;
    data: undefined;
    response: RelationshipOnly;
} | {
    method: 'GET';
    route: `/users/${Id}/mutual`;
    data: undefined;
    response: {
        users: string[];
        servers: string[];
    };
} | {
    method: 'PUT';
    route: `/users/${Id}/friend`;
    data: undefined;
    response: RelationshipOnly;
} | {
    method: 'DELETE';
    route: `/users/${Id}/friend`;
    data: undefined;
    response: RelationshipOnly;
} | {
    method: 'PUT';
    route: `/users/${Id}/block`;
    data: undefined;
    response: RelationshipOnly;
} | {
    method: 'DELETE';
    route: `/users/${Id}/block`;
    data: undefined;
    response: RelationshipOnly;
} | {
    method: 'GET';
    route: `/users/${Id}/avatar`;
    data: undefined;
    response: any;
} | {
    method: 'GET';
    route: `/users/${Id}/default_avatar`;
    data: undefined;
    response: any;
}
/**
 * Channels
 */
 | {
    method: 'GET';
    route: `/channels/${Id}`;
    data: undefined;
    response: Channel;
} | {
    method: 'GET';
    route: `/channels/${Id}/members`;
    data: undefined;
    response: User[];
} | {
    method: 'PATCH';
    route: `/channels/${Id}`;
    data: {
        name?: string;
        description?: string;
        icon?: string;
        nsfw?: boolean;
        remove?: RemoveChannelField;
    };
    response: undefined;
} | {
    method: 'DELETE';
    route: `/channels/${Id}`;
    data: undefined;
    response: undefined;
} | {
    method: 'POST';
    route: `/channels/create`;
    data: {
        name: string;
        description?: string;
        nonce: string;
        users: string[];
    };
    response: GroupChannel;
} | {
    method: 'POST';
    route: `/channels/${Id}/invites`;
    data: undefined;
    response: {
        code: string;
    };
} | {
    method: 'PUT';
    route: `/channels/${Id}/recipients/${Id}`;
    data: undefined;
    response: undefined;
} | {
    method: 'DELETE';
    route: `/channels/${Id}/recipients/${Id}`;
    data: undefined;
    response: undefined;
} | {
    method: 'PUT';
    route: `/channels/${Id}/ack/${Id}`;
    data: undefined;
    response: undefined;
} | {
    method: 'PUT';
    route: `/channels/${Id}/permissions/${Id}`;
    data: {
        permissions?: number;
    };
    response: undefined;
}
/**
 * Messaging
 */
 | {
    method: 'POST';
    route: `/channels/${Id}/messages`;
    data: {
        content: string;
        nonce: string;
        attachments?: string[];
        replies?: {
            id: string;
            mention: boolean;
        }[];
    };
    response: Message;
} | {
    method: 'GET';
    route: `/channels/${Id}/messages/${Id}`;
    data: undefined;
    response: Message;
} | {
    method: 'GET';
    route: `/channels/${Id}/messages`;
    data: {
        limit?: number;
        before?: string;
        after?: string;
        sort?: 'Latest' | 'Oldest';
        nearby?: string;
        include_users?: boolean;
    };
    response: Message[] | {
        messages: Message[];
        users: User[];
        members?: Member[];
    };
} | {
    method: 'POST';
    route: `/channels/${Id}/search`;
    data: {
        query: string;
        limit?: number;
        before?: string;
        after?: string;
        sort?: 'Relevance' | 'Latest' | 'Oldest';
        include_users?: boolean;
    };
    response: Message[] | {
        messages: Message[];
        users: User[];
        members?: Member[];
    };
} | {
    method: 'POST';
    route: `/channels/${Id}/messages/stale`;
    data: {
        ids: string[];
    };
    response: {
        updated: Message[];
        deleted: string[];
    };
} | {
    method: 'PATCH';
    route: `/channels/${Id}/messages/${Id}`;
    data: {
        content: string;
    };
    response: undefined;
} | {
    method: 'DELETE';
    route: `/channels/${Id}/messages/${Id}`;
    data: undefined;
    response: undefined;
}
/**
 * Servers
 */
 | {
    method: 'POST';
    route: `/servers/create`;
    data: {
        name: string;
        nonce: string;
    };
    response: Server;
} | {
    method: 'GET';
    route: `/servers/${Id}`;
    data: undefined;
    response: Server;
} | {
    method: 'DELETE';
    route: `/servers/${Id}`;
    data: undefined;
    response: undefined;
} | {
    method: 'PATCH';
    route: `/servers/${Id}`;
    data: {
        name?: string;
        description?: string;
        icon?: string;
        banner?: string;
        categories?: Category[];
        system_messages?: SystemMessageChannels;
        nsfw?: boolean;
        remove?: RemoveServerField;
    };
    response: undefined;
} | {
    method: 'PUT';
    route: `/servers/${Id}/ack`;
    data: undefined;
    response: undefined;
} | {
    method: 'GET';
    route: `/servers/${Id}/members`;
    data: undefined;
    response: {
        members: Member[];
        users: User[];
    };
} | {
    method: 'GET';
    route: `/servers/${Id}/members/${Id}`;
    data: undefined;
    response: Member;
} | {
    method: 'PATCH';
    route: `/servers/${Id}/members/${Id}`;
    data: {
        nickname?: string;
        avatar?: string;
        roles?: string[];
        remove?: RemoveMemberField;
    };
    response: undefined;
} | {
    method: 'DELETE';
    route: `/servers/${Id}/members/${Id}`;
    data: undefined;
    response: undefined;
} | {
    method: 'PUT';
    route: `/servers/${Id}/bans/${Id}`;
    data: {
        reason?: string;
    };
    response: undefined;
} | {
    method: 'DELETE';
    route: `/servers/${Id}/bans/${Id}`;
    data: undefined;
    response: undefined;
} | {
    method: 'GET';
    route: `/servers/${Id}/bans`;
    data: undefined;
    response: {
        users: Pick<User, '_id' | 'username' | 'avatar'>[];
        bans: Ban[];
    };
} | {
    method: 'POST';
    route: `/servers/${Id}/channels`;
    data: {
        type?: 'Text' | 'Voice';
        name: string;
        description?: string;
        nonce: string;
    };
    response: TextChannel | VoiceChannel;
} | {
    method: 'GET';
    route: `/servers/${Id}/invites`;
    data: undefined;
    response: ServerInvite[];
} | {
    method: 'POST';
    route: `/servers/${Id}/roles`;
    data: {
        name: string;
    };
    response: {
        id: string;
        permissions: PermissionTuple;
    };
} | {
    method: 'PATCH';
    route: `/servers/${Id}/roles/${Id}`;
    data: {
        name?: string;
        colour?: string;
        hoist?: boolean;
        rank?: number;
        remove?: RemoveRoleField;
    };
    response: undefined;
} | {
    method: 'DELETE';
    route: `/servers/${Id}/roles/${Id}`;
    data: undefined;
    response: undefined;
} | {
    method: 'PUT';
    route: `/servers/${Id}/permissions/${Id}`;
    data: {
        permissions?: {
            server: number;
            channel: number;
        };
    };
    response: undefined;
}
/**
 * Bots
 */
 | {
    method: 'POST';
    route: `/bots/create`;
    data: {
        name: string;
    };
    response: Bot;
} | {
    method: 'GET';
    route: `/bots/@me`;
    data: undefined;
    response: {
        bots: Bot[];
        users: User[];
    };
} | {
    method: 'GET';
    route: `/bots/${Id}`;
    data: undefined;
    response: {
        bot: Bot;
        user: User;
    };
} | {
    method: 'PATCH';
    route: `/bots/${Id}`;
    data: {
        name?: string;
        public?: boolean;
        interactionsURL?: string;
        remove?: 'InteractionsURL';
    };
    response: undefined;
} | {
    method: 'DELETE';
    route: `/bots/${Id}`;
    data: undefined;
    response: undefined;
} | {
    method: 'GET';
    route: `/bots/${Id}/invite`;
    data: undefined;
    response: PublicBot;
} | {
    method: 'POST';
    route: `/bots/${Id}/invite`;
    data: ({
        server: string;
    } | {
        group: string;
    });
    response: undefined;
}
/**
 * Invites
 */
 | {
    method: 'GET';
    route: `/invites/${Id}`;
    data: undefined;
    response: RetrievedInvite;
} | {
    method: 'POST';
    route: `/invites/${Id}`;
    data: undefined;
    response: ({
        type: 'Server';
        channel: TextChannel;
        server: Server;
    });
} | {
    method: 'DELETE';
    route: `/invites/${Id}`;
    data: undefined;
    response: undefined;
}
/**
 * Sync
 */
 | {
    method: 'POST';
    route: `/sync/settings/fetch`;
    data: {
        keys: string[];
    };
    response: UserSettings;
} | {
    method: 'POST';
    route: `/sync/settings/set`;
    data: {
        [key: string]: string;
    };
    response: undefined;
} | {
    method: 'GET';
    route: `/sync/unreads`;
    data: undefined;
    response: ChannelUnread[];
}
/**
 * Push API
 */
 | {
    method: 'POST';
    route: `/push/subscribe`;
    data: {
        endpoint: string;
        p256dh: string;
        auth: string;
    };
    response: undefined;
} | {
    method: 'POST';
    route: `/push/unsubscribe`;
    data: undefined;
    response: undefined;
}
/**
 * Voice API
 */
 | {
    method: 'POST';
    route: `/channels/${Id}/join_call`;
    data: undefined;
    response: {
        token: string;
    };
};
export declare type RoutePath = Routes["route"];
export declare type RouteMethod = Routes["method"];
declare type ExcludeRouteKey<K> = K extends "route" ? never : K;
declare type ExcludeRouteField<A> = {
    [K in ExcludeRouteKey<keyof A>]: A[K];
};
declare type ExtractRouteParameters<A, T> = A extends {
    route: T;
} ? ExcludeRouteField<A> : never;
declare type ExcludeMethodKey<K> = K extends "method" ? never : K;
declare type ExcludeMethodField<A> = {
    [K in ExcludeMethodKey<keyof A>]: A[K];
};
declare type ExtractMethodParameters<A, T> = A extends {
    method: T;
} ? ExcludeMethodField<A> : never;
export declare type Route<M extends RouteMethod, T extends RoutePath> = ExtractMethodParameters<ExtractRouteParameters<Routes, T>, M>;
export {};
