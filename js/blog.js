/**
 * blog.js — 博客核心逻辑
 * 单页滚动式布局 v3
 * 
 * 文章存储：posts/[category]/[filename].md
 */

/* =====================
   全局状态
   ===================== */
let ALL_POSTS = [];
let ALL_CATEGORIES = [];
let CURRENT_SECTION = 'home';
let isScrolling = false;

/* =====================
   工具函数
   ===================== */
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

function getSectionFromHash() {
  const hash = window.location.hash.replace('#', '');
  return hash || 'home';
}

/* =====================
   滚动导航核心
   ===================== */
function scrollToSection(sectionId) {
  if (isScrolling) return;
  isScrolling = true;
  
  // 更新 URL
  window.location.hash = sectionId;
  
  // 更新导航高亮
  updateNavActive(sectionId);
  
  // 获取目标 section
  const targetSection = document.getElementById(`section-${sectionId}`);
  if (!targetSection) {
    isScrolling = false;
    return;
  }
  
  // 计算目标位置
  const targetPosition = targetSection.offsetTop;
  
  // 执行滚动
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
  
  // 滚动完成后重置状态
  setTimeout(() => {
    isScrolling = false;
    CURRENT_SECTION = sectionId;
  }, 800);
}

/* =====================
   导航高亮
   ===================== */
function updateNavActive(activeSection) {
  document.querySelectorAll('.sidebar-nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.section === activeSection) {
      link.classList.add('active');
    }
  });
}

/* =====================
   滚动监听 - 检测当前可见区域
   ===================== */
function setupScrollSpy() {
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.sidebar-nav-link');
  
  const observerOptions = {
    root: null,
    rootMargin: '-40% 0px -40% 0px',
    threshold: 0
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isScrolling) {
        const sectionId = entry.target.dataset.section;
        if (sectionId && sectionId !== CURRENT_SECTION) {
          CURRENT_SECTION = sectionId;
          updateNavActive(sectionId);
          // 更新 URL 但不触发滚动
          if (window.location.hash.replace('#', '') !== sectionId) {
            history.replaceState(null, null, `#${sectionId}`);
          }
        }
      }
    });
  }, observerOptions);
  
  sections.forEach(section => observer.observe(section));
}

/* =====================
   统计数据渲染
   ===================== */
function renderStats() {
  const allTags = [...new Set(ALL_POSTS.flatMap(p => p.tags))];
  const categories = [...new Set(ALL_POSTS.map(p => p.category))];
  const statIcons = ['📝', '📁', '🏷', '✨'];
  const statValues = [
    `${ALL_POSTS.length} 篇`,
    `${categories.length} 个`,
    `${allTags.length} 个`,
    `${new Date().getFullYear()} 年`
  ];
  const statLabels = ['文章总数', '专栏数量', '标签数量', '持续更新'];

  const statsEl = document.getElementById('hero-stats');
  if (statsEl) {
    statsEl.innerHTML = [0, 1, 2, 3].map(i => `
      <div class="stat-card">
        <div class="stat-icon">${statIcons[i]}</div>
        <div class="stat-value">${statValues[i]}</div>
        <div class="stat-label">${statLabels[i]}</div>
      </div>
    `).join('');
  }
}

/* =====================
   文章列表渲染
   ===================== */
function renderPostList() {
  const postListEl = document.getElementById('post-list');
  const countEl = document.getElementById('article-count');
  
  if (countEl) countEl.textContent = ALL_POSTS.length;
  
  if (postListEl) {
    if (ALL_POSTS.length > 0) {
      postListEl.innerHTML = ALL_POSTS.map(post => `
        <div class="post-card" onclick="openPost('${post.id}')">
          <div class="post-card-body">
            <div class="post-card-meta">
              <span>${formatDate(post.date)}</span>
              <span class="dot"></span>
              <span class="category-badge">${post.category}</span>
            </div>
            <div class="post-card-title">${post.title}</div>
            <div class="post-card-excerpt">${post.excerpt || ''}</div>
            <div class="post-card-tags">
              ${post.tags.map(t => `
                <span class="post-card-tag">#${t}</span>
              `).join('')}
            </div>
          </div>
          <span class="post-card-arrow">→</span>
        </div>
      `).join('');
    } else {
      postListEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <div class="empty-state-text">暂无文章</div>
        </div>
      `;
    }
  }
}

/* =====================
   专栏列表渲染
   ===================== */
function renderCategoryList() {
  const catListEl = document.getElementById('category-list');
  const countEl = document.getElementById('category-count');
  
  const catCount = {};
  ALL_POSTS.forEach(p => {
    catCount[p.category] = (catCount[p.category] || 0) + 1;
  });
  
  const catIcons = {
    'C/C++': '⚙️', '开发工具': '🔧', '汇编': '💾', 
    'Python': '🐍', '数据库': '🗄️', '摄影': '📷', '生活': '🌿',
    'default': '📁'
  };

  if (countEl) countEl.textContent = Object.keys(catCount).length;
  
  if (catListEl) {
    const catItems = Object.entries(catCount).map(([cat, count]) => `
      <div class="category-card" onclick="filterByCategory('${cat}')">
        <div class="category-icon">${catIcons[cat] || catIcons['default']}</div>
        <div class="category-info">
          <div class="category-name">${cat}</div>
          <div class="category-count">${count} 篇文章</div>
        </div>
        <span class="category-arrow">→</span>
      </div>
    `).join('');
    
    catListEl.innerHTML = catItems || `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-text">暂无专栏</div>
      </div>
    `;
  }
}

/* =====================
   文章详情弹窗
   ===================== */
let currentPost = null;

async function openPost(postId) {
  currentPost = ALL_POSTS.find(p => p.id === postId);
  if (!currentPost) return;
  
  const modal = document.getElementById('post-modal');
  const body = document.getElementById('post-modal-body');
  
  if (!modal || !body) return;
  
  // 显示加载状态
  body.innerHTML = `
    <div class="post-header">
      <div class="post-header-meta">
        <span>${formatDate(currentPost.date)}</span>
        <span class="category-badge">${currentPost.category}</span>
      </div>
      <h1 class="post-title">${currentPost.title}</h1>
      ${currentPost.excerpt ? `<p class="post-description">${currentPost.excerpt}</p>` : ''}
      <div class="post-tags">
        ${currentPost.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
      </div>
    </div>
    <div class="loading-state">加载中...</div>
  `;
  
  // 显示弹窗
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // 加载文章内容
  try {
    const resp = await fetch(`posts/${currentPost.path || postId}.md`);
    if (resp.ok) {
      const text = await resp.text();
      const content = typeof marked !== 'undefined' ? marked.parse(text) : text;
      body.querySelector('.loading-state').outerHTML = `<div class="post-content">${content}</div>`;
    }
  } catch (e) {
    body.querySelector('.loading-state').outerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-text">文章加载失败</div>
      </div>
    `;
  }
}

function closePostModal() {
  const modal = document.getElementById('post-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* =====================
   筛选功能
   ===================== */
function filterByCategory(category) {
  const catPosts = ALL_POSTS.filter(p => p.category === category);
  renderFilteredPosts(catPosts, `📁 ${category}`);
  scrollToSection('articles');
}

function filterByTag(tag) {
  const tagPosts = ALL_POSTS.filter(p => p.tags.includes(tag));
  renderFilteredPosts(tagPosts, `🏷 #${tag}`);
  scrollToSection('articles');
}

function renderFilteredPosts(posts, title) {
  const postListEl = document.getElementById('post-list');
  const countEl = document.getElementById('article-count');
  const sectionTitleEl = document.querySelector('#section-articles .section-title');
  
  if (countEl) countEl.textContent = posts.length;
  if (sectionTitleEl) {
    sectionTitleEl.innerHTML = `${title} <span class="section-count">${posts.length}</span>`;
  }
  
  if (postListEl) {
    if (posts.length > 0) {
      postListEl.innerHTML = posts.map(post => `
        <div class="post-card" onclick="openPost('${post.id}')">
          <div class="post-card-body">
            <div class="post-card-meta">
              <span>${formatDate(post.date)}</span>
              <span class="dot"></span>
              <span class="category-badge">${post.category}</span>
            </div>
            <div class="post-card-title">${post.title}</div>
            <div class="post-card-excerpt">${post.excerpt || ''}</div>
            <div class="post-card-tags">
              ${post.tags.map(t => `
                <span class="post-card-tag">#${t}</span>
              `).join('')}
            </div>
          </div>
          <span class="post-card-arrow">→</span>
        </div>
      `).join('');
    } else {
      postListEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <div class="empty-state-text">该分类下暂无文章</div>
        </div>
      `;
    }
  }
}

function resetFilters() {
  renderPostList();
  const sectionTitleEl = document.querySelector('#section-articles .section-title');
  if (sectionTitleEl) {
    sectionTitleEl.innerHTML = `📝 全部文章 <span class="section-count" id="article-count">${ALL_POSTS.length}</span>`;
  }
}

/* =====================
   扫描专栏目录
   ===================== */
async function scanCategories() {
  const categories = ['cpp', 'dev-tools', 'asm', 'python', 'db', 'photography', 'life'];
  const categoryNames = {
    'cpp': 'C/C++',
    'dev-tools': '开发工具',
    'asm': '汇编',
    'python': 'Python',
    'db': '数据库',
    'photography': '摄影',
    'life': '生活'
  };
  
  const allPosts = [];
  
  for (const cat of categories) {
    try {
      const resp = await fetch(`posts/${cat}/index.json`);
      if (resp.ok) {
        const data = await resp.json();
        data.posts?.forEach(post => {
          allPosts.push({
            ...post,
            path: `${cat}/${post.id}`,
            category: categoryNames[cat] || post.category
          });
        });
      }
    } catch (e) {
      // 目录可能为空
    }
  }
  
  // 如果没有找到分类文章，使用旧的 index.json
  if (allPosts.length === 0) {
    try {
      const resp = await fetch('posts/index.json');
      if (resp.ok) {
        const data = await resp.json();
        return data.posts || [];
      }
    } catch (e) {}
    return [];
  }
  
  return allPosts;
}

/* =====================
   初始化
   ===================== */
async function init() {
  try {
    ALL_POSTS = await scanCategories();
    ALL_CATEGORIES = [...new Set(ALL_POSTS.map(p => p.category))];
    
    // 渲染各模块
    renderStats();
    renderPostList();
    renderCategoryList();
    
    // 设置滚动监听
    setupScrollSpy();
    
    // 处理初始 hash
    const initialSection = getSectionFromHash();
    updateNavActive(initialSection);
    CURRENT_SECTION = initialSection;
    
    // 如果不是首页，滚动到对应位置
    if (initialSection !== 'home') {
      setTimeout(() => {
        scrollToSection(initialSection);
      }, 100);
    }
    
  } catch (e) {
    console.error('初始化失败:', e);
    document.getElementById('post-list').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-text">
          无法加载文章列表<br>
          <small style="color:var(--text-muted);">请确保通过 HTTP 服务器访问</small>
        </div>
      </div>
    `;
  }
}

/* =====================
   事件监听
   ===================== */

// 导航链接点击
document.querySelectorAll('.sidebar-nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const section = link.dataset.section;
    scrollToSection(section);
  });
});

// Hash 变化
window.addEventListener('hashchange', () => {
  const section = getSectionFromHash();
  if (section !== CURRENT_SECTION && !isScrolling) {
    scrollToSection(section);
  }
});

// ESC 关闭弹窗
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closePostModal();
  }
});

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);

// 暴露函数到全局
window.scrollToSection = scrollToSection;
window.openPost = openPost;
window.closePostModal = closePostModal;
window.filterByCategory = filterByCategory;
window.filterByTag = filterByTag;
window.resetFilters = resetFilters;
