import { NextApiRequest, NextApiResponse } from "next";
import pusher from "@/lib/pusher";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { socket_id, channel_name, user_id, user_info } = req.body;

    // 验证是否为presence channel
    if (!channel_name.startsWith("presence-")) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // 认证用户
    const presenceData = {
      user_id: user_id,
      user_info: {
        name: user_info.name,
        avatar: user_info.avatar || null,
      },
    };

    const authResponse = pusher.authorizeChannel(socket_id, channel_name, presenceData);
    
    res.status(200).json(authResponse);
  } catch (error) {
    console.error("Pusher auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}