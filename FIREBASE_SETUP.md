# 🔥 Firebase 云端同步配置指南

## 📋 目录
1. [功能说明](#功能说明)
2. [创建Firebase项目](#创建firebase项目)
3. [配置Firestore数据库](#配置firestore数据库)
4. [获取配置信息](#获取配置信息)
5. [修改配置文件](#修改配置文件)
6. [测试云端同步](#测试云端同步)
7. [常见问题](#常见问题)

---

## 🌟 功能说明

启用Firebase云端同步后，您将获得：

✅ **跨设备同步**：在任何设备上登录相同密码，自动加载您的数据
✅ **实时更新**：多设备同时在线时，数据实时同步
✅ **数据备份**：数据存储在Google云端，永不丢失
✅ **安全加密**：密码经过SHA-256加密，确保数据安全

### 工作原理

```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor':'#6c7ae0','primaryTextColor':'#fff','primaryBorderColor':'#8b9de5','lineColor':'#8b9de5','secondaryColor':'#f0f8ff','tertiaryColor':'#fff5f9','textColor':'#e0e0e0','fontSize':'14px'}}}%%
flowchart TB
    A[输入六位密码] --> B[SHA-256加密]
    B --> C{Firebase中存在?}
    
    C -->|存在| D[下载云端数据]
    C -->|不存在| E[创建新账号]
    
    D --> F[加载到本地]
    E --> G[上传本地数据]
    
    F --> H[正常使用]
    G --> H
    
    H --> I[操作数据]
    I --> J[同步到云端]
    J --> K[其他设备实时更新]
    
    style A fill:#6c7ae0,stroke:#8b9de5,stroke-width:3px,color:#fff
    style H fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#fff
    style K fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#fff
```

---

## 🚀 创建Firebase项目

### 步骤1：访问Firebase控制台

1. 打开浏览器，访问：[https://console.firebase.google.com/](https://console.firebase.google.com/)
2. 使用Google账号登录（没有的话先注册一个）

### 步骤2：创建新项目

1. 点击 **"添加项目"** 或 **"Create a project"**
2. 输入项目名称：例如 `kitty-gift-box` 或 `love-lottery`
3. 点击 **"继续"**

### 步骤3：Google Analytics（可选）

1. 选择是否启用Google Analytics（建议选择 **"暂不启用"**）
2. 点击 **"创建项目"**
3. 等待项目创建完成（约1分钟）

---

## 📊 配置Firestore数据库

### 步骤1：启用Firestore

1. 在Firebase控制台左侧菜单，找到 **"Firestore Database"**
2. 点击 **"创建数据库"**

### 步骤2：选择模式

选择 **"以测试模式启动"**（⚠️ 注意：仅用于开发测试）

```
规则如下：
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> 💡 **安全提示**：测试模式下任何人都可以读写数据。如果需要生产环境，请参考下面的安全规则。

### 步骤3：选择位置

选择数据库位置：
- 推荐：`asia-east1`（台湾）或 `asia-northeast1`（东京）
- 点击 **"启用"**

### 步骤4：等待初始化

等待Firestore数据库初始化完成（约30秒）

---

## 🔑 获取配置信息

### 步骤1：添加Web应用

1. 回到Firebase项目主页
2. 在 **"项目概览"** 页面，点击 **"</>"** 图标（Web）
3. 输入应用昵称：例如 `gift-box-web`
4. **不要**勾选 "Firebase Hosting"
5. 点击 **"注册应用"**

### 步骤2：复制配置

您会看到类似下面的配置代码：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567",
  authDomain: "kitty-gift-box.firebaseapp.com",
  projectId: "kitty-gift-box",
  storageBucket: "kitty-gift-box.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**⚠️ 重要**：复制这些配置信息，稍后需要用到！

---

## ⚙️ 修改配置文件

### 步骤1：打开配置文件

打开项目中的 `firebase-config.js` 文件

### 步骤2：替换配置

将文件中的内容替换为您的配置：

**修改前：**
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**修改后（示例）：**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567",
  authDomain: "kitty-gift-box.firebaseapp.com",
  projectId: "kitty-gift-box",
  storageBucket: "kitty-gift-box.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### 步骤3：保存文件

保存 `firebase-config.js` 文件

---

## 🧪 测试云端同步

### 测试步骤

1. **首次登录**
   - 打开 `login.html`
   - 输入任意六位密码（例如：`123456`）
   - 系统会自动创建账号并上传数据

2. **添加能量**
   - 在主页添加一些能量
   - 打开浏览器开发者工具（F12）
   - 查看Console，应该看到 `☁️ 数据已同步到云端`

3. **验证云端数据**
   - 打开Firebase控制台
   - 进入 Firestore Database
   - 查看 `users` 集合
   - 应该能看到您的用户数据

4. **跨设备测试**
   - 清除浏览器缓存或使用无痕模式
   - 重新打开网站
   - 输入相同的密码
   - 数据应该自动加载

### 预期结果

✅ 登录页面显示 "登录成功！"
✅ 控制台显示 "✅ Firebase初始化成功"
✅ 控制台显示 "✅ 云端同步已启用"
✅ 每次操作后显示 "☁️ 数据已同步到云端"

---

## 🔒 生产环境安全规则

如果您要正式上线，请修改Firestore安全规则：

### 步骤1：打开规则编辑器

1. 在Firebase控制台，进入 **Firestore Database**
2. 点击顶部的 **"规则"** 标签

### 步骤2：修改规则

将规则修改为：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 只允许读写自己的数据
    match /users/{userId} {
      allow read, write: if true;
    }
  }
}
```

> 💡 **说明**：由于我们使用密码哈希作为用户ID，不需要额外的身份验证。

### 步骤3：发布规则

点击 **"发布"** 按钮保存规则

---

## ❓ 常见问题

### Q1: 提示 "Firebase未配置"

**A:** 检查以下几点：
- ✅ 确认已修改 `firebase-config.js`
- ✅ 确认配置信息正确（没有 `YOUR_API_KEY` 等占位符）
- ✅ 刷新页面重新加载

### Q2: 提示 "权限不足" 或 "permission-denied"

**A:** Firestore规则配置问题：
1. 进入Firebase控制台
2. Firestore Database → 规则
3. 确认测试模式规则（allow read, write: if true;）
4. 点击发布

### Q3: 数据没有同步

**A:** 打开浏览器控制台（F12）：
- 查看是否有错误信息
- 确认是否显示 "✅ 云端同步已启用"
- 检查网络连接

### Q4: 想更换密码怎么办？

**A:** 目前密码是唯一标识符，更换密码等于创建新账号：
1. 在旧密码下导出数据（使用历史页面的"导出"功能）
2. 使用新密码登录（会创建新账号）
3. 手动导入数据

### Q5: 忘记密码了怎么办？

**A:** 由于采用去中心化设计，密码只在本地存储：
- ❌ 无法找回密码
- ✅ 可以创建新密码（但会丢失旧数据）
- 💡 建议牢记密码或使用密码管理器

### Q6: 多个设备同时操作会冲突吗？

**A:** 不会！Firebase会自动处理：
- ✅ 最后写入的数据生效
- ✅ 实时监听会自动更新界面
- ✅ 不会出现数据丢失

### Q7: Firebase免费吗？

**A:** 是的！免费额度对小型项目完全够用：
- ✅ 存储：1 GB
- ✅ 读取：50,000 次/天
- ✅ 写入：20,000 次/天
- 💡 对于个人使用，这些额度绰绰有余

### Q8: 想禁用云端同步怎么办？

**A:** 两种方法：
1. **完全禁用**：将 `firebase-config.js` 中的配置改回占位符
2. **临时禁用**：删除Firebase项目

### Q9: 数据会永久保存吗？

**A:** 是的！只要：
- ✅ Firebase项目没有被删除
- ✅ 没有超过免费额度
- ✅ Google账号正常
- 💡 建议定期导出数据备份

---

## 📊 配置完成检查清单

部署前确认：
- [ ] 已创建Firebase项目
- [ ] 已启用Firestore Database
- [ ] 已获取配置信息
- [ ] 已修改 `firebase-config.js`
- [ ] 已测试登录功能
- [ ] 控制台显示"云端同步已启用"
- [ ] 在Firebase控制台能看到数据

---

## 🎯 配置流程图

```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor':'#6c7ae0','primaryTextColor':'#fff','primaryBorderColor':'#8b9de5','lineColor':'#8b9de5','secondaryColor':'#f0f8ff','tertiaryColor':'#fff5f9','textColor':'#e0e0e0','fontSize':'14px'}}}%%
flowchart TB
    Start([开始配置]) --> A[访问Firebase控制台]
    A --> B[创建新项目]
    B --> C[启用Firestore数据库]
    C --> D[选择测试模式]
    D --> E[选择数据库位置]
    
    E --> F[添加Web应用]
    F --> G[复制配置信息]
    
    G --> H[修改firebase-config.js]
    H --> I[保存文件]
    
    I --> J[测试登录]
    J --> K{配置成功?}
    
    K -->|是| L[查看控制台日志]
    K -->|否| M[检查错误信息]
    
    L --> N{显示云端同步已启用?}
    N -->|是| O[在Firebase控制台查看数据]
    N -->|否| M
    
    M --> P[查看常见问题]
    P --> J
    
    O --> End([配置完成 🎉])
    
    style Start fill:#6c7ae0,stroke:#8b9de5,stroke-width:3px,color:#fff
    style End fill:#6c7ae0,stroke:#8b9de5,stroke-width:3px,color:#fff
    style O fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#fff
```

---

## 💡 其他说明

### 数据结构

Firestore中的数据结构：

```
users (collection)
  └── user_abc123... (document - 由密码哈希生成)
      ├── energy: 100
      ├── history: [...]
      ├── pools: {...}
      ├── createdAt: "2025-01-01T00:00:00.000Z"
      └── updatedAt: "2025-01-01T12:34:56.000Z"
```

### 成本估算

假设每天使用100次：
- 读取：100次
- 写入：100次
- 月成本：**$0.00**（完全在免费额度内）

---

## 📞 需要帮助？

- 📖 Firebase官方文档：[https://firebase.google.com/docs](https://firebase.google.com/docs)
- 💬 Firebase社区：[https://stackoverflow.com/questions/tagged/firebase](https://stackoverflow.com/questions/tagged/firebase)
- 🎓 Firestore教程：[https://firebase.google.com/docs/firestore](https://firebase.google.com/docs/firestore)

---

## 🎉 完成！

恭喜！您已经成功配置Firebase云端同步！

现在您可以：
- 🌐 在任何设备上访问数据
- 🔄 实时同步所有操作
- 💾 永久保存记忆和礼物
- 🔒 密码保护您的数据

**祝您使用愉快！** 💖

---

**最后更新**：2025年10月20日
**版本**：1.0

