[English](README.md) | 中文

Milkid 是一个使用 TypeScript 编写的、可高度定制的分布式唯一 ID 生成器。

## 前言

JavaScript 有许多优秀的分布式唯一 ID 生成器，但是它们都主要面向一些特定的场景，无法自由地定制它。

- 对于数据库主键，我们需要按照字典顺序排序的 ID，以避免数据库出现碎片

- 对于一些分布式系统，我们需要 ID 尽可能地均匀，以避免出现热点

- 对于新闻网站，我们希望新闻的 URL 中的 ID 是完全随机的，避免被爬虫遍历

- 对于一些短网址功能，我们需要 URL 中的 ID 尽可能地短

Milkid 可以进行高度地定制化，以满足我们在不同场景下，对于 ID 的需求。

并且，Milkid 的编码表在常见的场景下都很安全，你甚至可以在 URL 或者 HTML 的 `class` 属性中使用（`class` 必须以字母开头，Milkid 的每一段的第一个字符都一定会是字母）

## 安装

```bash
npm i milkid
```

## 使用

```ts
const idGenerator = defineIdGenerator({
    length: 24,
    hyphen: false,
    fingerprint: false,
    timestamp: true,
    sequential: true,
    magicNumber: 12345678,
});

console.log(idGenerator.createId()); // AWdM7nLAX5XA5DJAfRD8TjtY
```

## 指纹

UUID 和一些其他的 ID 生成算法令人讨厌的一点就是，需要使用者提供机器 ID。但对于现在的可以水平扩展的系统来说，所运行的机器数量是事先不确定的。

当你将选项中的 `fingerprint` 为 `true` 时，你可以在产生 ID 时传递一个字符串或者 Buffer 作为指纹，设置指纹可以降低 ID 的碰撞概率，但这并非是必须的，只要 ID 的长度足够长，也足够避免出现碰撞问题。

无论你的指纹传递的内容是什么，有多长，这些内容都会被哈希化，然后作为 ID 的一部分。你可以根据你的需要，传递指纹或者不传递指纹。

在理想的情况下，我们可以使用以下的内容拼接起来作为指纹：用户 ID、UserAgent、机器 ID、进程 ID、内网 IP 地址、系统启动时间、会话计数器。

当然，并非所有的内容都需要作为指纹，有些内容或许和业务耦合太深，或许在环境中是很难获得的，你可以根据你的需要，选择传递哪些内容。并且，如果你的 ID 足够长，即使没有指纹，碰撞的概率也会足够的低。

```ts
const idGenerator = defineIdGenerator({
    fingerprint: true,
    timestamp: true,
});

const fingerprint = `${context.USER_ID}-${navigator.userAgent}-${process.env.MACHINE_ID}-${process.pid}-${getLocalIp()}-${process.uptime()}-${sessionStorage.getItem('sessionCounter')}`;

console.log(idGenerator.createId(fingerprint));
```

## 组成

当你启用了时间戳和指纹后，Milkid 生成的 ID 由以下部分组成：

```bash
          Aba3eJC          -      nY5EC      -   2z2SXrxk09j0
 Millisecond timestamp (7) | Fingerprint (5) | Random Bits (12)
```

Milkid 的编码表由 `0-9a-zA-Z` 组成，Milkid 的每一段在常见的场景下都很安全，你甚至可以在 URL 或者 HTML 的 `class` 属性中使用（浏览器要求 `class` 必须以字母开头，Milkid 的每一段的第一个字符都一定会是一个字母）

## 选项

选项 | 缺省值 | 说明
---|---|---
`length` | `24` | 生成的 ID 的长度
`timestamp` | `-` | 是否使用时间戳作为 ID 的开头，这能有效避免数据库出现碎片
`hyphen` | `false` | 是否使用连字符分隔 ID 的各个部分
`fingerprint` | `false` | 是否使用指纹作为 ID 的一部分，开启后生产 ID 时需要传递指纹

## 也可以看看

[nanoid](https://github.com/ai/nanoid) - 一个小型、快速的唯一字符串 ID 生成器。

[ulid](https://github.com/ulid/javascript) - 一个时间有序的的唯一字符串 ID 生成器。

[cuid2](https://github.com/paralleldrive/cuid2) - 在安全性上考虑更多的唯一 ID 生成器。