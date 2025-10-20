# 🚀 更新到GitHub指南

## ⚠️ 重要提醒

**上传前务必检查：**
- ❌ **不要上传** `leancloud-config.js` 中的真实配置
- ❌ **不要上传** `firebase-config.js` 中的真实配置
- ✅ 确保配置文件使用占位符
- ✅ 真实配置只保存在本地

---

## 📝 上传前准备

### 步骤1：检查配置文件

确保以下文件使用占位符：

#### leancloud-config.js
```javascript
const leanCloudConfig = {
  appId: "YOUR_APP_ID",
  appKey: "YOUR_APP_KEY",
  serverURL: "https://YOUR_APP_ID.lc-cn-n1-shared.com"
};
```
    
#### firebase-config.js
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  // ... 其他配置也用占位符
};
```

> 💡 **提示**：上传到GitHub后，在本地再改回真实配置使用。

---

## 🔄 更新到GitHub的方法

### 方法一：使用Git命令行（推荐）

#### 1. 打开命令提示符（cmd）

```bash
# 进入项目目录
cd "D:\Users\yuew3\Desktop\礼物盒子"
```

#### 2. 初始化Git（如果是第一次）

```bash
# 如果之前没有初始化
git init
```

#### 3. 添加远程仓库

```bash
# 如果是新仓库
git remote add origin https://github.com/你的用户名/仓库名.git

# 如果之前已经添加过，可以查看
git remote -v

# 如果需要修改
git remote set-url origin https://github.com/你的用户名/仓库名.git
```

#### 4. 添加所有文件

```bash
# 添加所有文件（会自动忽略.gitignore中的文件）
git add .
```

#### 5. 提交更改

```bash
# 提交并添加说明
git commit -m "添加账号功能和LeanCloud支持"
```

#### 6. 推送到GitHub

```bash
# 首次推送
git push -u origin main

# 或者如果分支是master
git push -u origin master

# 后续推送
git push
```

---

### 方法二：使用GitHub Desktop（更简单）

#### 1. 安装GitHub Desktop
- 下载：https://desktop.github.com/
- 安装并登录GitHub账号

#### 2. 打开项目
- File → Add Local Repository
- 选择项目文件夹
- 或 File → New Repository（首次）

#### 3. 查看更改
- 左侧会显示所有更改的文件
- 检查没有包含敏感配置

#### 4. 提交
- 输入 Summary：`添加账号功能和LeanCloud支持`
- 点击 Commit to main

#### 5. 推送
- 点击顶部的 Push origin
- 等待上传完成

---

### 方法三：GitHub网页上传（最简单但功能有限）

#### 1. 打开GitHub仓库

#### 2. 上传文件
- 点击 Add file → Upload files
- 拖拽文件到上传区
- ⚠️ 注意：会覆盖同名文件

#### 3. 提交
- 填写 Commit message
- 点击 Commit changes

---

## 🌐 GitHub Pages自动更新

### 确认Pages设置

1. 进入仓库的 Settings
2. 左侧菜单找到 Pages
3. 确认设置：
   - Source: Deploy from a branch
   - Branch: main (或master)
   - Folder: / (root)
4. 点击 Save

### 等待部署

- 推送后，GitHub会自动构建
- 通常需要 1-3分钟
- 可以在 Actions 标签查看进度
- 部署完成后会显示绿色 ✓

### 访问网站

```
https://你的用户名.github.io/仓库名/login.html
```

---

## 🔐 配置LeanCloud（部署后）

### 重要步骤

1. **在GitHub上使用占位符**
   - 上传的配置文件不包含真实信息

2. **用户自己配置**
   - 用户访问网站后
   - 下载配置文件到本地
   - 修改为自己的LeanCloud配置
   - 本地使用

3. **或者使用环境变量**
   - 在GitHub Secrets中设置
   - 使用GitHub Actions自动部署
   - 配置不会暴露在代码中

---

## 📋 推送检查清单

推送前确认：
- [ ] 已将配置文件改回占位符
- [ ] 已创建 .gitignore 文件
- [ ] 检查没有个人敏感信息
- [ ] 测试功能正常
- [ ] 提交信息清晰

推送后验证：
- [ ] 在GitHub上查看代码
- [ ] 确认配置文件是占位符
- [ ] 等待GitHub Pages部署
- [ ] 访问网站测试功能

---

## 🔄 日常更新流程

### 修改代码后

```bash
# 1. 查看更改
git status

# 2. 添加更改
git add .

# 3. 提交
git commit -m "更新说明"

# 4. 推送
git push
```

### GitHub自动更新

- ✅ 推送后自动触发部署
- ✅ 1-3分钟后网站更新
- ✅ 无需手动操作

---

## 💡 最佳实践

### 1. 分支管理

```bash
# 创建开发分支
git checkout -b dev

# 修改测试
# ...

# 合并到主分支
git checkout main
git merge dev

# 推送
git push
```

### 2. 忽略敏感文件

在 `.gitignore` 中添加：
```
# 真实配置文件（本地使用）
leancloud-config.local.js
firebase-config.local.js
```

### 3. 使用标签

```bash
# 标记版本
git tag -a v2.0 -m "账号功能版本"
git push origin v2.0
```

---

## ❓ 常见问题

### Q1: 推送失败？

**A:** 可能原因：
```bash
# 先拉取远程更改
git pull origin main

# 解决冲突后再推送
git push
```

### Q2: 忘记改配置文件怎么办？

**A:** 立即修改：
```bash
# 修改配置文件为占位符
# 然后
git add leancloud-config.js
git commit -m "修复：移除敏感配置"
git push
```

### Q3: GitHub Pages没更新？

**A:** 检查：
1. 进入仓库 Actions 标签
2. 查看部署状态
3. 如果失败，查看错误日志
4. 清除浏览器缓存（Ctrl+F5）

### Q4: 想同时支持多个配置？

**A:** 使用环境检测：
```javascript
// 自动检测配置
const config = window.location.hostname === 'localhost' 
  ? localConfig  // 本地配置
  : cloudConfig; // 云端配置
```

---

## 🎯 快速命令汇总

```bash
# 完整更新流程
cd "D:\Users\yuew3\Desktop\礼物盒子"
git add .
git commit -m "更新说明"
git push

# 查看状态
git status

# 查看远程仓库
git remote -v

# 拉取最新
git pull

# 查看提交历史
git log --oneline
```

---

## 📞 需要帮助？

- 📖 Git教程：https://www.liaoxuefeng.com/wiki/896043488029600
- 💬 GitHub帮助：https://docs.github.com/cn
- 🎓 GitHub Desktop：https://docs.github.com/cn/desktop

---

**准备好了就开始推送吧！** 🚀

需要我帮您执行Git命令吗？

