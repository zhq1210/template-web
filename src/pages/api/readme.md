### 无需手动导入或注册

- 不需要 在任何地方导入这些 API 文件
- 不需要 手动注册路由
- 不需要 配置路由表
- Next.js 在构建时自动扫描 pages/api/ 目录并创建对应的 API 端点

pages/api/
├── comments.ts # /api/comments
├── reactions.ts # /api/reactions
├── users/
│ ├── index.ts # /api/users
│ └── [id].ts # /api/users/:id (动态路由)
└── auth/
└── login.ts # /api/auth/login

这是 Next.js 的核心特性之一，叫做 "约定优于配置"（Convention over Configuration） 。只要你按照约定的文件结构放置 API 文件，Next.js 就会自动处理路由映射，无需任何额外配置。这大大简化了 API 开发流程。
