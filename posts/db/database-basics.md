---
title: 数据库基础知识
date: 2026-05-07
category: 数据库
tags: [数据库, SQL, MySQL]
excerpt: 了解数据库的基本概念和 SQL 基础。
---

# 数据库基础知识

数据库是现代应用不可或缺的一部分。

## 关系型数据库

- **MySQL** - 开源、流行
- **PostgreSQL** - 功能强大、标准兼容
- **SQLite** - 轻量、单文件

## 基础 SQL

```sql
-- 创建表
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255)
);

-- 查询数据
SELECT * FROM users WHERE id = 1;

-- 插入数据
INSERT INTO users (id, name, email) VALUES (1, 'Alice', 'alice@example.com');
```

## NoSQL 简介

- **MongoDB** - 文档数据库
- **Redis** - 键值存储
- **Elasticsearch** - 搜索引擎

---

*持续更新中...*
