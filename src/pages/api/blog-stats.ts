import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

interface TreeItem {
  name: string;
  isFolder: boolean;
  level: number;
  children: TreeItem[];
  id: string;
}
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const countFilePath = path.join(process.cwd(), "src", "blogs", "count.md");

    if (!fs.existsSync(countFilePath)) {
      return res.status(404).json({ message: "Count file not found" });
    }

    const countContent = fs.readFileSync(countFilePath, "utf-8");

    // 解析 count.md 文件内容
    const stats = parseCountFile(countContent);

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error reading count file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

function parseDirectoryStructure(structureText: string) {
  console.log("原始目录结构文本:", structureText);

  const lines = structureText.split("\n").filter((line) => line.trim());
  const tree: TreeItem[] = [];
  const stack: TreeItem[] = [];

  lines.forEach((line, lineIndex) => {
    console.log(
      `第${lineIndex}行: "${line}", 前导空格: ${
        line.length - line.trimStart().length
      }`
    );

    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine === "blogs/") return;

    // 计算缩进级别 - 每4个空格为一级
    const leadingSpaces = line.length - line.trimStart().length;
    const indentLevel = Math.floor(leadingSpaces / 4);

    // 判断是否为文件夹
    const isFolder = trimmedLine.endsWith("/");

    // 提取名称
    let name = trimmedLine.replace(/[└├─│\s]/g, "").replace(/\/$/, "");

    // 处理文件名中的描述部分
    if (!isFolder && name.includes(" - ")) {
      name = name.split(" - ")[0];
    }

    if (!name) return;

    const item = {
      name,
      isFolder,
      level: indentLevel,
      children: [],
      id: `${name}-${indentLevel}-${lineIndex}`,
    };

    console.log(`解析项目:`, item);

    // 栈管理：移除级别大于等于当前级别的项目
    while (stack.length > 0 && stack[stack.length - 1].level >= indentLevel) {
      stack.pop();
    }

    // 添加到适当的父级
    if (stack.length === 0) {
      tree.push(item);
    } else {
      const parent = stack[stack.length - 1];
      parent.children.push(item);
      console.log(
        `添加到父级 ${parent.name}, 父级现在有 ${parent.children.length} 个子项`
      );
    }

    // 如果是文件夹，添加到栈中
    if (isFolder) {
      stack.push(item);
    }
  });

  console.log("最终解析结果:", JSON.stringify(tree, null, 2));
  return tree;
}

function parseCountFile(content: string) {
  const lines = content.split("\n");

  let totalArticles = 0;
  let totalDirectories = 0;
  let totalFiles = 0;
  let lastUpdated = "";
  const categoryStats: { [key: string]: number } = {};
  let directoryStructure = "";

  let inStructureSection = false;
  let inCategorySection = false;
  let inCodeBlock = false; // 新增：跟踪是否在代码块内

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // 解析更新时间
    if (trimmedLine.includes("最后更新时间:")) {
      lastUpdated = trimmedLine.replace("> 最后更新时间:", "").trim();
    }

    // 解析总体统计
    if (trimmedLine.includes("**总文章数**:")) {
      totalArticles = parseInt(trimmedLine.match(/\d+/)?.[0] || "0");
    }
    if (trimmedLine.includes("**总目录数**:")) {
      totalDirectories = parseInt(trimmedLine.match(/\d+/)?.[0] || "0");
    }
    if (trimmedLine.includes("**总文件数**:")) {
      totalFiles = parseInt(trimmedLine.match(/\d+/)?.[0] || "0");
    }

    // 解析目录结构
    if (trimmedLine === "## 📁 目录结构") {
      inStructureSection = true;
      continue;
    }
    if (inStructureSection && trimmedLine === "## 📈 分类统计") {
      inStructureSection = false;
      inCategorySection = true;
      continue;
    }

    // 处理目录结构部分
    if (inStructureSection) {
      if (trimmedLine === "```") {
        inCodeBlock = !inCodeBlock; // 切换代码块状态
        continue;
      }

      // 只有在代码块内且不是空行时才添加到目录结构
      if (inCodeBlock && trimmedLine !== "") {
        directoryStructure += line + "\n"; // 保持原始缩进
      }
    }

    // 解析分类统计
    if (
      inCategorySection &&
      trimmedLine.startsWith("| ") &&
      !trimmedLine.includes("分类")
    ) {
      const parts = trimmedLine
        .split("|")
        .map((p) => p.trim())
        .filter((p) => p);
      if (parts.length >= 2) {
        const category = parts[0];
        const count = parseInt(parts[1]) || 0;
        if (category && !isNaN(count)) {
          categoryStats[category] = count;
        }
      }
    }

    if (trimmedLine === "## 🔍 文章列表") {
      inCategorySection = false;
    }
  }

  return {
    totalArticles,
    totalDirectories,
    totalFiles,
    lastUpdated,
    categoryStats,
    directoryTree: parseDirectoryStructure(directoryStructure.trim()),
  };
}
