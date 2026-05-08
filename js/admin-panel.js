// 管理面板逻辑
let editorSimpleMDE = null;

// ===== 登录状态检查 =====
async function checkLoginStatus() {
  const token = getToken();
  if (!token) {
    updateUserPanel();
    return;
  }

  try {
    const user = await AuthAPI.getCurrentUser();
    localStorage.setItem('blog_user', JSON.stringify(user));
    updateUserPanel(user);
  } catch (err) {
    // Token 无效，清除
    clearToken();
    updateUserPanel();
  }
}

// ===== 更新用户面板 =====
function updateUserPanel(user = null) {
  const loginSection = document.getElementById('login-section');
  const userSection = document.getElementById('user-section');
  const sidebarAvatar = document.getElementById('sidebar-avatar');

  if (user) {
    loginSection.classList.add('hidden');
    userSection.classList.remove('hidden');
    document.getElementById('user-name').textContent = user.username;

    if (user.avatar) {
      document.getElementById('user-avatar-small').src = user.avatar;
      if (sidebarAvatar) sidebarAvatar.src = user.avatar;
    }
    if (user.signature) {
      document.getElementById('sidebar-signature').textContent = user.signature;
    }
  } else {
    loginSection.classList.remove('hidden');
    userSection.classList.add('hidden');
  }
}

// ===== 登录模态框 =====
function showLoginModal() {
  document.getElementById('login-modal').classList.remove('hidden');
  document.getElementById('auth-message').classList.add('hidden');
}

function closeLoginModal() {
  document.getElementById('login-modal').classList.add('hidden');
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });

  if (tab === 'login') {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
  } else {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
  }

  document.getElementById('auth-message').classList.add('hidden');
}

async function handleLogin(e) {
  e.preventDefault();
  const form = e.target;
  const username = form.username.value;
  const password = form.password.value;

  try {
    await AuthAPI.login(username, password);
    closeLoginModal();
    const user = getUser();
    updateUserPanel(user);
    showToast('登录成功');
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const form = e.target;
  const username = form.username.value;
  const password = form.password.value;
  const confirmPassword = form.confirm_password.value;

  if (password !== confirmPassword) {
    showMessage('两次密码输入不一致', 'error');
    return;
  }

  try {
    await AuthAPI.register(username, password);
    closeLoginModal();
    const user = getUser();
    updateUserPanel(user);
    showToast('注册成功');
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

function showMessage(text, type) {
  const el = document.getElementById('auth-message');
  el.textContent = text;
  el.className = `message ${type}`;
}

// ===== 用户下拉菜单 =====
function toggleUserDropdown() {
  const dropdown = document.getElementById('user-dropdown');
  dropdown.classList.toggle('hidden');
}

// 点击其他地方关闭下拉菜单
document.addEventListener('click', function(e) {
  const dropdown = document.getElementById('user-dropdown');
  const menuBtn = document.querySelector('.user-menu-btn');
  if (dropdown && menuBtn && !menuBtn.contains(e.target)) {
    dropdown.classList.add('hidden');
  }
});

function logout() {
  AuthAPI.logout();
}

// ===== 文章编辑器 =====
async function showArticleEditor(article = null) {
  // 确保已登录
  if (!getToken()) {
    showLoginModal();
    return;
  }

  const modal = document.getElementById('editor-modal');
  const form = document.getElementById('editor-form');

  form.reset();

  if (article) {
    document.getElementById('editor-modal-title').textContent = '编辑文章';
    document.getElementById('editor-article-id').value = article.id;
    document.getElementById('editor-title').value = article.title;
    document.getElementById('editor-summary').value = article.summary || '';
    document.getElementById('editor-tags').value = article.tags ? article.tags.map(t => t.name).join(', ') : '';
    document.getElementById('editor-published').checked = article.status === 'published';
  } else {
    document.getElementById('editor-modal-title').textContent = '写文章';
    document.getElementById('editor-article-id').value = '';
  }

  // 加载专栏列表
  await loadCategoriesForEditor();

  modal.classList.remove('hidden');

  // 初始化 Markdown 编辑器
  setTimeout(() => {
    if (!editorSimpleMDE) {
      editorSimpleMDE = new SimpleMDE({
        element: document.getElementById('editor-content'),
        placeholder: '使用 Markdown 编写文章内容...',
        spellChecker: false,
        status: ['lines', 'words']
      });
    } else {
      editorSimpleMDE.value('');
    }

    if (article && article.content) {
      editorSimpleMDE.value(article.content);
    }
  }, 100);
}

async function loadCategoriesForEditor() {
  try {
    const categories = await CategoryAPI.getAll();
    const select = document.getElementById('editor-category');

    if (categories.length === 0) {
      select.innerHTML = '<option value="">请先创建专栏</option>';
      return;
    }

    select.innerHTML = '<option value="">选择专栏</option>' +
      categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  } catch (err) {
    console.error('加载专栏失败:', err);
  }
}

function closeEditorModal() {
  document.getElementById('editor-modal').classList.add('hidden');
}

async function saveArticle(e) {
  e.preventDefault();
  await doSaveArticle(false);
}

async function saveArticleDraft() {
  await doSaveArticle(true);
}

async function doSaveArticle(asDraft) {
  const id = document.getElementById('editor-article-id').value;
  const categoryId = parseInt(document.getElementById('editor-category').value);
  const title = document.getElementById('editor-title').value.trim();
  const summary = document.getElementById('editor-summary').value.trim();
  const content = editorSimpleMDE ? editorSimpleMDE.value() : '';
  const tagsStr = document.getElementById('editor-tags').value;
  const isPublished = document.getElementById('editor-published').checked && !asDraft;

  if (!categoryId) {
    showToast('请选择专栏', 'error');
    return;
  }

  if (!title) {
    showToast('请输入标题', 'error');
    return;
  }

  const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t);

  const data = {
    category_id: categoryId,
    title,
    content,
    summary,
    tags,
    status: asDraft ? 'draft' : (isPublished ? 'published' : 'draft')
  };

  try {
    if (id) {
      await ArticleAPI.update(parseInt(id), data);
      showToast('更新成功');
    } else {
      await ArticleAPI.create(data);
      showToast('创建成功');
    }

    closeEditorModal();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ===== 设置模态框 =====
async function showSettings() {
  // 确保已登录
  if (!getToken()) {
    showLoginModal();
    return;
  }

  const modal = document.getElementById('settings-modal');

  try {
    const user = await UserAPI.getProfile();
    document.getElementById('settings-avatar').src = user.avatar || 'images/avatar.png';
    document.getElementById('settings-signature').value = user.signature || '';
  } catch (err) {
    console.error('加载设置失败:', err);
  }

  modal.classList.remove('hidden');
  toggleUserDropdown(); // 关闭下拉菜单
}

function closeSettingsModal() {
  document.getElementById('settings-modal').classList.add('hidden');
}

async function uploadAvatar(input) {
  const file = input.files[0];
  if (!file) return;

  try {
    const data = await UserAPI.uploadAvatar(file);
    document.getElementById('settings-avatar').src = data.avatar;
    document.getElementById('user-avatar-small').src = data.avatar;
    document.getElementById('sidebar-avatar').src = data.avatar;
    showToast('头像更新成功');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function updateSignature(e) {
  e.preventDefault();

  try {
    await UserAPI.updateProfile(document.getElementById('settings-signature').value);
    document.getElementById('sidebar-signature').textContent =
      document.getElementById('settings-signature').value || '道阻且长 · 行则将至';
    showToast('签名更新成功');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function changePassword(e) {
  e.preventDefault();
  const oldPassword = document.getElementById('old-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (newPassword !== confirmPassword) {
    showToast('两次密码输入不一致', 'error');
    return;
  }

  try {
    await AuthAPI.changePassword(oldPassword, newPassword);
    showToast('密码修改成功');
    document.getElementById('old-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ===== 工具函数 =====
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
