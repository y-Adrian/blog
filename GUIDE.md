# 博客写作指南

## 如何发布新文章

**第 1 步**：在 `posts/` 新建 `.md` 文件（如 `posts/my-post.md`），写 Markdown 内容。

**第 2 步**：在 `posts/index.json` 的 `posts` 数组最前面添加条目：

```json
{
  "id": "my-post",
  "title": "文章标题",
  "date": "2026-05-10",
  "category": "随笔",
  "tags": ["标签1", "标签2"],
  "excerpt": "简短摘要（会显示在文章列表）"
}
```

**第 3 步**：推送 GitHub，1-2 分钟后访问 `https://y-Adrian.github.io/blog`

---

## MD 语法速查

| 语法 | 效果 |
|------|------|
| `# 标题` | 一级标题 |
| `## 标题` | 二级标题 |
| `**粗体**` | **粗体** |
| `*斜体*` | *斜体* |
| `> 引用` | 引用块 |
| `` `代码` `` | 行内代码 |
| ` ```js ``` ` | 代码块 |
| `---` | 分隔线 |

---

## 文件结构

```
blog/
├── index.html        ← 页面框架（含左侧边栏）
├── css/style.css     ← 样式
├── js/blog.js        ← 逻辑 + 文章索引
├── posts/
│   ├── index.json    ← 文章元数据（必填）
│   ├── hello-world.md
│   ├── writing-tips.md
│   └── tools-i-use.md
└── GUIDE.md
```

---

## 部署到 GitHub Pages

1. 推送代码到 GitHub
2. 仓库 → Settings → Pages → Source 选 `main` 分支
3. 等待 1-2 分钟即可访问

---

## 自定义

- **博客名称**：修改 `index.html` 中侧边栏和标题
- **关于页内容**：`js/blog.js` 里的 `renderAbout()` 函数
- **统计卡内容**：`js/blog.js` 里的 `renderHome()` 中的 `statIcons` / `statValues`
- **侧边栏标签**：`js/blog.js` 里 `renderSidebar()` 函数
