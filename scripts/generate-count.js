const fs = require('fs');
const path = require('path');

// 配置
const BLOGS_DIR = path.join(__dirname, '../src/blogs');
const OUTPUT_FILE = path.join(BLOGS_DIR, 'count.md');

// 递归扫描目录
function scanDirectory(dir, basePath = '', level = 0) {
  const items = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  // 统计信息
  let fileCount = 0;
  let dirCount = 0;
  
  entries.forEach(entry => {
    if (entry.name === 'count.md') return; // 跳过统计文件本身
    
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);
    const indent = '│   '.repeat(level);
    
    if (entry.isDirectory()) {
      dirCount++;
      const subResult = scanDirectory(fullPath, relativePath, level + 1);
      items.push({
        type: 'directory',
        name: entry.name,
        path: relativePath,
        indent,
        children: subResult.items,
        stats: subResult.stats
      });
      fileCount += subResult.stats.files;
      dirCount += subResult.stats.directories;
    } else if (entry.name.endsWith('.md')) {
      fileCount++;
      // 读取文件内容获取标题
      const content = fs.readFileSync(fullPath, 'utf8');
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : entry.name.replace('.md', '');
      
      items.push({
        type: 'file',
        name: entry.name,
        title,
        path: relativePath,
        indent
      });
    }
  });
  
  return {
    items,
    stats: { files: fileCount, directories: dirCount }
  };
}

// 生成树形结构文本
function generateTreeText(items, level = 0) {
  let result = '';
  
  items.forEach((item, index) => {
    const isLast = index === items.length - 1;
    const prefix = level === 0 ? '' : (isLast ? '└── ' : '├── ');
    const indent = '    '.repeat(level);
    
    if (item.type === 'directory') {
      result += `${indent}${prefix}${item.name}/\n`;
      if (item.children && item.children.length > 0) {
        result += generateTreeText(item.children, level + 1);
      }
    } else {
      const description = item.title !== item.name.replace('.md', '') ? 
        ` - ${item.title}` : '';
      result += `${indent}${prefix}${item.name}${description}\n`;
    }
  });
  
  return result;
}

// 生成统计信息
function generateStats(items) {
  let totalFiles = 0;
  let totalDirs = 0;
  const categoryStats = {};
  
  function countItems(items, category = '根目录') {
    items.forEach(item => {
      if (item.type === 'directory') {
        totalDirs++;
        if (!categoryStats[item.name]) {
          categoryStats[item.name] = { files: 0, directories: 0 };
        }
        categoryStats[item.name].directories++;
        if (item.children) {
          countItems(item.children, item.name);
        }
      } else {
        totalFiles++;
        if (!categoryStats[category]) {
          categoryStats[category] = { files: 0, directories: 0 };
        }
        categoryStats[category].files++;
      }
    });
  }
  
  countItems(items);
  
  return { totalFiles, totalDirs, categoryStats };
}

// 主函数
function generateCountFile() {
  try {
    console.log('开始扫描博客目录...');
    
    const result = scanDirectory(BLOGS_DIR);
    const stats = generateStats(result.items);
    const treeText = generateTreeText(result.items);
    
    // 生成 Markdown 内容
    const content = `# 博客文章统计

> 最后更新时间: ${new Date().toLocaleString('zh-CN')}

## 📊 总体统计

- **总文章数**: ${stats.totalFiles} 篇
- **总目录数**: ${stats.totalDirs} 个
- **总文件数**: ${stats.totalFiles + stats.totalDirs} 个

## 📁 目录结构

\`\`\`
blogs/
${treeText}\`\`\`

## 📈 分类统计

| 分类 | 文章数 | 子目录数 |
|------|--------|----------|
${Object.entries(stats.categoryStats)
  .map(([category, stat]) => `| ${category} | ${stat.files} | ${stat.directories} |`)
  .join('\n')}

## 🔍 文章列表

${generateArticleList(result.items)}

---

*此文件由脚本自动生成，请勿手动编辑*
`;
    
    fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
    console.log(`✅ 统计文件已生成: ${OUTPUT_FILE}`);
    console.log(`📝 共统计 ${stats.totalFiles} 篇文章，${stats.totalDirs} 个目录`);
    
  } catch (error) {
    console.error('❌ 生成统计文件失败:', error);
  }
}

// 生成文章列表
function generateArticleList(items, category = '') {
  let result = '';
  
  items.forEach(item => {
    if (item.type === 'directory') {
      result += `\n### ${item.name}\n\n`;
      if (item.children) {
        result += generateArticleList(item.children, item.name);
      }
    } else {
      const link = item.path.replace(/\\/g, '/');
      result += `- [${item.title}](${link})\n`;
    }
  });
  
  return result;
}

// 执行生成
if (require.main === module) {
  generateCountFile();
}

module.exports = { generateCountFile };