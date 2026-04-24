// src/constants/injection-tokens.ts

export const AUTHENTICATION_SERVICE = Symbol('AUTHENTICATION_SERVICE');
export const PROFILE_SERVICE = Symbol('PROFILE_SERVICE');
export const ROLE_SERVICE = Symbol('ROLE_SERVICE');
export const SESSION_SERVICE = Symbol('SESSION_SERVICE');

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');
export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');
export const TOKEN_PROVIDER = Symbol('TOKEN_PROVIDER');
export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER');
