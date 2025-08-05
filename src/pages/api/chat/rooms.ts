import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const rooms = await prisma.chatRoom.findMany({
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      res.status(200).json(rooms);
    } catch {
      res.status(500).json({ error: "Failed to fetch rooms" });
    }
  } else if (req.method === "POST") {
    try {
      const { name, description } = req.body;

      const room = await prisma.chatRoom.create({
        data: {
          name,
          description,
        },
      });

      res.status(201).json(room);
    } catch {
      res.status(500).json({ error: "Failed to create room" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
