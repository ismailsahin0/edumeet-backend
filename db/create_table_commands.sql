create table dislikes
(
    dislikesid varchar(50) not null,
    dislikedid varchar(50) not null,
    time       timestamp default now()
);

create table images
(
    uid  varchar(100) not null,
    path varchar(250) not null,
    seq  integer      not null
);

create table likes
(
    likesid varchar(50) not null,
    likedid varchar(50) not null,
    time    timestamp default now()
);

create table matches
(
    uid        varchar(50) not null,
    uidmatched varchar(50) not null,
    time       timestamp default now()
);

create table universities
(
    id        varchar(50) not null
        constraint universities_pkey
            primary key,
    name      varchar(50) not null
        constraint universities_name_key
            unique,
    extension varchar(50) not null
        constraint universities_extension_key
            unique
);

create table users
(
    id         varchar(50)                not null
        constraint users_pkey
            primary key,
    email      varchar(50)                not null
        constraint users_email_key
            unique,
    name       varchar(50)                not null,
    surname    varchar(50)                not null,
    password   varchar(50)                not null,
    university varchar(50)                not null,
    age        integer                    not null,
    gender     varchar(20)                not null,
    verified   boolean      default false not null,
    bio        varchar(250) default ''::character varying
);
