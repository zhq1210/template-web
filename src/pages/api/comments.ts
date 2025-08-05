import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      // 获取评论列表
      const comments = await prisma.comment.findMany({
        where: {
          parentId: null, // 只获取顶级评论
        },
        include: {
          replies: {
            include: {
              replies: true, // 支持二级回复
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.status(200).json(comments);
    } else if (req.method === "POST") {
      // 添加评论
      const { nickname, contact, content, parentId } = req.body;

      if (!content || content.trim() === "") {
        return res.status(400).json({ error: "评论内容不能为空" });
      }

      const comment = await prisma.comment.create({
        data: {
          nickname: nickname || null,
          contact: contact || null,
          content: content.trim(),
          parentId: parentId || null,
        },
        include: {
          replies: true,
        },
      });

      res.status(201).json(comment);
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("评论API错误:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
}
