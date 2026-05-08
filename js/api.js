// API 模块 - 处理所有后端通信
// API_BASE 需要在部署时配置为你的服务器地址

const API_BASE = 'http://192.168.31.135:8080'; // 服务器地址

// 获取 Token
function getToken() {
  return localStorage.getItem('blog_token');
}

// 设置 Token
function setToken(token) {
  localStorage.setItem('blog_token', token);
}

// 清除 Token
function clearToken() {
  localStorage.removeItem('blog_token');
  localStorage.removeItem('blog_user');
}

// 获取用户信息
function getUser() {
  const user = localStorage.getItem('blog_user');
  return user ? JSON.parse(user) : null;
}

// API 请求封装
async function api(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '请求失败');
  }

  return data;
}

// ===== 认证相关 =====
const AuthAPI = {
  async login(username, password) {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    setToken(data.token);
    localStorage.setItem('blog_user', JSON.stringify(data.user));
    return data;
  },

  async register(username, password) {
    const data = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    setToken(data.token);
    localStorage.setItem('blog_user', JSON.stringify(data.user));
    return data;
  },

  async getCurrentUser() {
    return api('/api/user/me');
  },

  async changePassword(oldPassword, newPassword) {
    return api('/api/user/password', {
      method: 'PUT',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword
      })
    });
  },

  logout() {
    clearToken();
    updateUserPanel();
    showToast('已退出登录');
  }
};

// ===== 用户相关 =====
const UserAPI = {
  async getProfile() {
    return api('/api/user/profile');
  },

  async updateProfile(signature) {
    return api('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify({ signature })
    });
  },

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = getToken();
    const response = await fetch(`${API_BASE}/api/user/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '上传失败');
    return data;
  },

  async getStats() {
    return api('/api/user/stats');
  }
};

// ===== 专栏相关 =====
const CategoryAPI = {
  async getAll() {
    return api('/api/categories');
  },

  async create(data) {
    return api('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async update(id, data) {
    return api(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async delete(id) {
    return api(`/api/categories/${id}`, {
      method: 'DELETE'
    });
  }
};

// ===== 文章相关 =====
const ArticleAPI = {
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    return api(`/api/my/articles${query ? '?' + query : ''}`);
  },

  async getOne(id) {
    return api(`/api/articles/${id}`);
  },

  async create(data) {
    return api('/api/articles', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async update(id, data) {
    return api(`/api/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async delete(id) {
    return api(`/api/articles/${id}`, {
      method: 'DELETE'
    });
  },

  async getTags() {
    return api('/api/tags');
  }
};

// ===== 统计相关 =====
const StatsAPI = {
  async like(articleId) {
    return api(`/api/articles/${articleId}/like`, {
      method: 'POST'
    });
  },

  async favorite(articleId) {
    return api(`/api/articles/${articleId}/favorite`, {
      method: 'POST'
    });
  },

  async getMyLikes() {
    return api('/api/my/likes');
  },

  async getMyFavorites() {
    return api('/api/my/favorites');
  }
};
