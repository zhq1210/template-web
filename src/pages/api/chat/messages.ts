import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import pusher from "@/lib/pusher";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { roomId, page = "1", limit = "50" } = req.query;

      const messages = await prisma.message.findMany({
        where: { roomId: roomId as string },
        orderBy: { createdAt: "desc" },
        take: parseInt(limit as string),
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      });

      res.status(200).json(messages.reverse());
    } catch {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  } else if (req.method === "POST") {
    try {
      const { content, userId, userName, userAvatar, roomId } = req.body;

      // 保存消息到数据库
      const message = await prisma.message.create({
        data: {
          content,
          userId,
          userName,
          userAvatar,
          roomId,
        },
      });

      // 更新房间的最后更新时间
      await prisma.chatRoom.update({
        where: { id: roomId },
        data: { updatedAt: new Date() },
      });
      console.log(`Broadcasting message to channel: chat-room-${roomId}`);
      // 通过 Pusher 广播消息
      await pusher.trigger(`presence-chat-room-${roomId}`, "new-message", {
        id: message.id,
        content: message.content,
        userId: message.userId,
        userName: message.userName,
        userAvatar: message.userAvatar,
        createdAt: message.createdAt,
      });
      console.log("Message broadcasted successfully");
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
