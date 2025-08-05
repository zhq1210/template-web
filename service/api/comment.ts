import { request, requestWithDefault } from "../request";

// 评论类型定义
export interface Comment {
  id: number;
  nickname?: string;
  contact?: string;
  content: string;
  createdAt: string;
  parentId?: number;
  replies?: Comment[];
}

export type ReactionType =
  | "like"
  | "cheer"
  | "celebrate"
  | "appreciate"
  | "smile";

export interface ReactionCounts {
  like: number;
  cheer: number;
  celebrate: number;
  appreciate: number;
  smile: number;
}

// 默认的空数据
const DEFAULT_COMMENTS: Comment[] = [];
const DEFAULT_REACTIONS: ReactionCounts = {
  like: 0,
  cheer: 0,
  celebrate: 0,
  appreciate: 0,
  smile: 0,
};

// 评论相关API
export const commentAPI = {
  // 获取评论列表 - 带默认值
  getComments: () => requestWithDefault<Comment[]>("/comments", DEFAULT_COMMENTS),

  // 添加评论 - 保持原有错误处理，因为这是用户主动操作
  addComment: async (data: {
    nickname?: string;
    contact?: string;
    content: string;
    parentId?: number;
  }) => {
    const result = await request<Comment>("/comments", {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    if (!result) {
      throw new Error('评论发送失败，请稍后重试');
    }
    
    return result;
  },
};

// 点赞相关API
export const reactionAPI = {
  // 获取所有类型的点赞数量 - 带默认值
  getReactions: () => requestWithDefault<ReactionCounts>("/reactions", DEFAULT_REACTIONS),

  // 增加特定类型的点赞 - 静默失败，不影响用户体验
  addReaction: async (type: ReactionType) => {
    const result = await request<{ type: string; count: number }>("/reactions", {
      method: "POST",
      body: JSON.stringify({ type }),
    });
    
    // 点赞失败时静默处理，不抛出错误
    if (!result) {
      console.warn(`点赞失败: ${type}`);
      return { type, count: 0 };
    }
    
    return result;
  },
};
