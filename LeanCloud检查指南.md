# 🔍 LeanCloud 检查指南

## 📋 完整检查清单

### 第一步：检查LeanCloud控制台

#### 1. 登录控制台
访问：https://console.leancloud.cn/
用您注册时的邮箱登录

#### 2. 检查应用状态
- ✅ 应用是否显示为"运行中"
- ✅ 应用名称是否正确
- ✅ 节点信息（华北/华东）

#### 3. 检查应用凭证
进入应用 → 设置 → 应用凭证

**需要确认的信息：**
```
AppID: 类似 a18wkGNz65BN4p8y1jmY20J1-gzGzoHsz
AppKey: 类似 PowDkwnfNSBylBnqb1tp9E5M
服务器地址: 类似 https://a18wkgnz.lc-cn-n1-shared.com
```

**⚠️ 重要：复制这些信息，稍后需要对比**

---

### 第二步：检查数据存储

#### 1. 进入数据管理
左侧菜单：数据存储 → 结构化数据

#### 2. 查看数据表
- ❓ 是否有 `UserData` 表？
- ❓ 如果有，里面有数据吗？
- ❓ 数据结构是否正确？

**正常的UserData表结构：**
```
字段名         类型      示例值
objectId      String    abc123...
userId        String    user_abc123...
energy        Number    100
history       Array     [...]
pools         Object    {...}
createdAt     Date      2025-10-20
updatedAt     Date      2025-10-20
```

#### 3. 检查权限设置
点击表名 → 权限管理
- ✅ 确保读写权限开放（开发阶段）

---

### 第三步：检查配置文件

#### 在本地检查 leancloud-config.js

```javascript
// 您的配置应该类似这样：
const leanCloudConfig = {
  appId: "a18wkGNz65BN4p8y1jmY20J1-gzGzoHsz",
  appKey: "PowDkwnfNSBylBnqb1tp9E5M", 
  serverURL: "https://a18wkgnz.lc-cn-n1-shared.com"
};
```

**检查要点：**
- ✅ appId 与控制台一致
- ✅ appKey 与控制台一致  
- ✅ serverURL 格式正确
- ✅ 没有多余的空格或字符

---

### 第四步：浏览器端检查

#### 1. 打开网站并按F12

#### 2. 在Console运行检查代码

```javascript
// 检查1：配置加载
console.log('=== 检查配置文件 ===');
import('./leancloud-config.js').then(config => {
  console.log('AppID:', config.default.appId);
  console.log('AppKey:', config.default.appKey);
  console.log('ServerURL:', config.default.serverURL);
  console.log('配置状态:', config.isLeanCloudConfigured());
}).catch(err => {
  console.error('❌ 配置文件加载失败:', err);
});
```

```javascript
// 检查2：网络连接
console.log('=== 检查网络连接 ===');
fetch('https://a18wkgnz.lc-cn-n1-shared.com/1.1/date')
  .then(response => response.json())
  .then(data => {
    console.log('✅ LeanCloud服务器连接正常:', data);
  })
  .catch(err => {
    console.error('❌ 无法连接LeanCloud服务器:', err);
  });
```

```javascript
// 检查3：SDK加载
console.log('=== 检查SDK加载 ===');
import('https://cdn.jsdelivr.net/npm/leancloud-storage@4.15.2/dist/av-min.js')
  .then(module => {
    console.log('✅ LeanCloud SDK加载成功');
    const AV = module.default || module;
    return import('./leancloud-config.js').then(config => {
      AV.init(config.default);
      console.log('✅ LeanCloud初始化成功');
      
      // 测试创建数据
      const TestClass = AV.Object.extend('ConnectionTest');
      const testObj = new TestClass();
      testObj.set('timestamp', new Date());
      testObj.set('test', true);
      return testObj.save();
    });
  })
  .then(obj => {
    console.log('✅ 测试数据创建成功, ObjectId:', obj.id);
  })
  .catch(err => {
    console.error('❌ SDK测试失败:', err);
    console.error('错误详情:', err.message);
  });
```

```javascript
// 检查4：本地存储
console.log('=== 检查本地存储 ===');
console.log('LeanCloud ObjectId:', localStorage.getItem('leancloud_object_id'));
console.log('能量值:', localStorage.getItem('kitty_energy'));
console.log('历史记录长度:', JSON.parse(localStorage.getItem('kitty_history') || '[]').length);
```

---

### 第五步：检查API调用统计

#### 在LeanCloud控制台

1. 进入应用主页
2. 查看"API 调用"统计图表
3. 检查是否有API请求记录

**正常情况：**
- ✅ 有API调用记录
- ✅ 请求成功率高
- ✅ 没有大量错误

---

### 第六步：检查网络环境

#### 1. 测试CDN访问
```javascript
// 测试CDN连接
fetch('https://cdn.jsdelivr.net/npm/leancloud-storage@4.15.2/dist/av-min.js')
  .then(response => {
    console.log('✅ CDN访问正常, 状态:', response.status);
  })
  .catch(err => {
    console.error('❌ CDN访问失败:', err);
  });
```

#### 2. 测试不同网络
- 尝试切换WiFi
- 尝试手机热点
- 检查防火墙设置

---

## 🔍 常见问题检查

### 问题1：配置文件问题

**检查项：**
- [ ] 文件名是否正确：`leancloud-config.js`
- [ ] 语法是否正确（没有语法错误）
- [ ] 配置信息是否与控制台一致
- [ ] 是否有中文字符或特殊符号

### 问题2：网络连接问题

**检查项：**
- [ ] 网络是否正常
- [ ] 防火墙是否阻止
- [ ] DNS是否能解析LeanCloud域名
- [ ] 是否在受限网络环境

### 问题3：权限问题

**检查项：**
- [ ] 应用是否暂停
- [ ] 数据表权限是否正确
- [ ] AppKey是否正确
- [ ] 是否超出免费额度

### 问题4：代码问题

**检查项：**
- [ ] import路径是否正确
- [ ] 异步处理是否正确
- [ ] 错误处理是否完善
- [ ] 浏览器兼容性

---

## 🎯 快速诊断流程

### 30秒快速检查：

```javascript
// 一键检查脚本
(async function quickCheck() {
  console.log('🔍 开始快速检查...');
  
  try {
    // 1. 检查配置
    const config = await import('./leancloud-config.js');
    console.log('✅ 配置文件加载成功');
    
    // 2. 检查网络
    await fetch(config.default.serverURL + '/1.1/date');
    console.log('✅ 服务器连接成功');
    
    // 3. 检查SDK
    const AV = await import('https://cdn.jsdelivr.net/npm/leancloud-storage@4.15.2/dist/av-min.js');
    console.log('✅ SDK加载成功');
    
    // 4. 测试初始化
    AV.default.init(config.default);
    console.log('✅ 初始化成功');
    
    console.log('🎉 所有检查通过！');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
})();
```

---

## 📊 检查结果对照表

| 检查项 | 正常状态 | 异常状态 | 解决方案 |
|-------|---------|---------|---------|
| 控制台登录 | ✅ 能正常登录 | ❌ 无法登录 | 检查账号密码 |
| 应用状态 | ✅ 运行中 | ❌ 已暂停 | 联系客服或检查账单 |
| 配置文件 | ✅ 信息一致 | ❌ 信息错误 | 重新复制正确配置 |
| 网络连接 | ✅ 连接成功 | ❌ 连接失败 | 检查网络和防火墙 |
| SDK加载 | ✅ 加载成功 | ❌ 加载失败 | 检查CDN或网络 |
| 数据创建 | ✅ 创建成功 | ❌ 权限错误 | 检查表权限设置 |

---

## 🚨 紧急问题处理

### 如果所有检查都失败：

1. **重新创建应用**
   - 在LeanCloud控制台创建新应用
   - 获取新的配置信息
   - 更新代码配置

2. **检查账号状态**
   - 确认账号是否被限制
   - 检查是否欠费
   - 查看系统通知

3. **联系技术支持**
   - LeanCloud工单系统
   - 官方QQ群或论坛

---

## 💡 检查完成后

### 如果一切正常但数据仍不同步：

可能是轮询间隔问题，LeanCloud免费版使用30秒轮询。

**解决方案：**
- 等待更长时间（1-2分钟）
- 手动刷新页面
- 检查两个设备的时间是否同步

---

请按照这个指南逐步检查，把每一步的结果告诉我，我会帮您精确定位问题！
