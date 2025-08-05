import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { NextApiRequest, NextApiResponse } from "next";

interface BlogArticle {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string;
  readTime: string;
  filename: string;
  category: string; // 新增分类字段
}

interface BlogResponse {
  articles: BlogArticle[];
  categories: string[]; // 新增分类列表
}

// 递归读取文件夹
function readBlogsRecursively(dir: string, baseDir: string): BlogArticle[] {
  const articles: BlogArticle[] = [];
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 递归读取子文件夹
      articles.push(...readBlogsRecursively(fullPath, baseDir));
    } else if (item.endsWith(".md") && item !== "count.md") {
      // 计算相对于blogs目录的分类路径
      const relativePath = path.relative(baseDir, dir);
      const category = relativePath || "root";

      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      articles.push({
        id: `${category}-${item}`,
        title: data.title || item.replace(".md", ""),
        description: data.description || extractDescription(content),
        date: data.date || new Date().toISOString().split("T")[0],
        tags: data.tags || ["未分类"],
        content,
        readTime: data.readTime || "5 分钟阅读",
        filename: item,
        category: category === "root" ? "根目录" : category,
      });
    }
  });

  return articles;
}

function extractDescription(content: string): string {
  const introMatch = content.match(/##\s*简介\s*\n([\s\S]*?)(?=\n##|\n#|$)/);
  if (introMatch && introMatch[1]) {
    return introMatch[1].trim().replace(/\n/g, " ").substring(0, 150) + "...";
  }
  return "暂无描述";
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<BlogResponse | { error: string }>
) {
  try {
    const blogsDirectory = path.join(process.cwd(), "src", "blogs");

    // 检查blogs目录是否存在
    if (!fs.existsSync(blogsDirectory)) {
      return res.status(404).json({ error: "blogs目录不存在" });
    }

    // 递归读取所有文章
    const articles = readBlogsRecursively(blogsDirectory, blogsDirectory);

    // 提取所有分类
    const categories = [
      "全部",
      ...Array.from(new Set(articles.map((article) => article.category))),
    ];

    res.status(200).json({ articles, categories });
  } catch (error) {
    console.error("读取文章失败:", error);
    res.status(500).json({ error: "读取文章失败" });
  }
}
