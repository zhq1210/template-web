const chokidar = require('chokidar');
const { generateCountFile } = require('./generate-count');
const path = require('path');

const BLOGS_DIR = path.join(__dirname, '../src/blogs');

console.log('🔍 开始监听博客目录变化...');

// 监听文件变化
const watcher = chokidar.watch(BLOGS_DIR, {
  ignored: /count\.md$/, // 忽略统计文件本身
  persistent: true,
  ignoreInitial: false
});

watcher
  .on('add', path => {
    console.log(`📄 新增文件: ${path}`);
    generateCountFile();
  })
  .on('unlink', path => {
    console.log(`🗑️ 删除文件: ${path}`);
    generateCountFile();
  })
  .on('addDir', path => {
    console.log(`📁 新增目录: ${path}`);
    generateCountFile();
  })
  .on('unlinkDir', path => {
    console.log(`🗂️ 删除目录: ${path}`);
    generateCountFile();
  });

console.log('✅ 监听已启动，文件变化时将自动更新统计');