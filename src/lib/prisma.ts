/**
 * Prisma Client singleton
 * ### 主要作用
 * 1.
 * 单例模式 ：确保整个应用只有一个 Prisma 客户端实例
 * 2.
 * 连接池管理 ：避免创建过多数据库连接
 * 3.
 * 开发环境优化 ：防止 Next.js 热重载时重复创建客户端
 * 4.
 * 查询日志 ：启用 SQL 查询日志，便于调试
 * 5.
 * 全局访问 ：在整个应用中可以导入使用
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
