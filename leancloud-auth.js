// ============================================
// LeanCloud 认证和数据同步模块
// ============================================

import leanCloudConfig, { isLeanCloudConfigured } from './leancloud-config.js';

// LeanCloud实例
let AV = null;
let currentUserId = null;
let dataQuery = null;

// ============================================
// 初始化LeanCloud
// ============================================
async function initLeanCloud() {
  if (!isLeanCloudConfigured()) {
    console.warn('LeanCloud未配置，使用本地存储模式');
    return false;
  }

  try {
    // 检查是否已经加载了AV
    if (typeof window.AV !== 'undefined') {
      AV = window.AV;
    } else {
      // 动态加载LeanCloud SDK
      await loadLeanCloudSDK();
      AV = window.AV;
    }
    
    // 验证AV对象
    if (!AV || typeof AV.init !== 'function') {
      throw new Error('LeanCloud SDK加载失败');
    }
    
    // 初始化LeanCloud
    AV.init({
      appId: leanCloudConfig.appId,
      appKey: leanCloudConfig.appKey,
      serverURL: leanCloudConfig.serverURL
    });
    
    console.log('✅ LeanCloud初始化成功');
    return true;
  } catch (error) {
    console.error('❌ LeanCloud初始化失败:', error);
    return false;
  }
}

// 加载LeanCloud SDK的辅助函数
function loadLeanCloudSDK() {
  return new Promise((resolve, reject) => {
    // 如果已经加载，直接返回
    if (window.AV) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/leancloud-storage@4.15.2/dist/av-min.js';
    script.onload = () => {
      // 等待一小段时间确保AV对象可用
      setTimeout(() => {
        if (window.AV) {
          resolve();
        } else {
          reject(new Error('AV对象未找到'));
        }
      }, 100);
    };
    script.onerror = () => reject(new Error('SDK加载失败'));
    document.head.appendChild(script);
  });
}

// ============================================
// 生成用户ID（基于密码的SHA-256哈希）
// ============================================
async function generateUserId(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return 'user_' + hashHex.substring(0, 32);
}

// ============================================
// 验证密码并加载数据
// ============================================
export async function verifyAndLoadData(password) {
  try {
    // 初始化LeanCloud
    const leanCloudReady = await initLeanCloud();
    
    if (!leanCloudReady) {
      // LeanCloud未配置，使用本地存储
      return {
        success: true,
        isNew: false,
        message: '使用本地存储模式'
      };
    }

    // 生成用户ID
    currentUserId = await generateUserId(password);
    
    // 定义数据类
    const UserData = AV.Object.extend('UserData');
    
    // 查询用户数据 - 处理表不存在的情况
    let result = null;
    try {
      const query = new AV.Query('UserData');
      query.equalTo('userId', currentUserId);
      result = await query.first();
    } catch (queryError) {
      // 如果是404错误（表或对象不存在），这是正常的
      if (queryError.code === 101 || queryError.message.includes('does not exist')) {
        console.log('📝 数据表不存在，将创建新用户');
        result = null;
      } else {
        // 其他错误需要抛出
        throw queryError;
      }
    }

    if (result) {
      // 用户存在，加载数据
      const userData = result.toJSON();
      
      // 保存到本地存储
      if (userData.energy !== undefined) {
        localStorage.setItem('kitty_energy', String(userData.energy));
      }
      if (userData.history) {
        localStorage.setItem('kitty_history', JSON.stringify(userData.history));
      }
      if (userData.pools) {
        localStorage.setItem('kitty_pools', JSON.stringify(userData.pools));
      }

      // 保存对象ID用于后续更新
      localStorage.setItem('leancloud_object_id', result.id);

      console.log('✅ 数据加载成功');
      return {
        success: true,
        isNew: false,
        message: '欢迎回来！'
      };
    } else {
      // 新用户，创建数据
      const localEnergy = localStorage.getItem('kitty_energy') || '0';
      const localHistory = localStorage.getItem('kitty_history') || '[]';
      const localPools = localStorage.getItem('kitty_pools') || 'null';

      const userDataObj = new UserData();
      userDataObj.set('userId', currentUserId);
      userDataObj.set('energy', Number(localEnergy));
      userDataObj.set('history', JSON.parse(localHistory));
      userDataObj.set('pools', localPools !== 'null' ? JSON.parse(localPools) : null);

      const savedObj = await userDataObj.save();
      
      // 保存对象ID
      localStorage.setItem('leancloud_object_id', savedObj.id);
      
      console.log('✅ 账号创建成功');
      return {
        success: true,
        isNew: true,
        message: '账号创建成功！'
      };
    }
  } catch (error) {
    console.error('❌ 验证失败:', error);
    return {
      success: false,
      message: '验证失败: ' + error.message
    };
  }
}

// ============================================
// 同步数据到云端
// ============================================
export async function syncToCloud(data) {
  // 尝试恢复用户ID
  if (!currentUserId) {
    const savedPassword = sessionStorage.getItem('kitty_password');
    if (savedPassword) {
      currentUserId = await generateUserId(savedPassword);
    }
  }
  
  // 尝试重新初始化AV对象
  if (!AV) {
    const initSuccess = await initLeanCloud();
    if (!initSuccess) {
      console.log('📱 未连接云端，仅保存到本地');
      return false;
    }
  }
  
  if (!AV || !currentUserId) {
    console.log('📱 未连接云端，仅保存到本地');
    return false;
  }

  try {
    const objectId = localStorage.getItem('leancloud_object_id');
    
    if (!objectId) {
      console.error('❌ 未找到对象ID');
      return false;
    }

    const UserData = AV.Object.extend('UserData');
    const userDataObj = AV.Object.createWithoutData('UserData', objectId);
    
    // 更新数据
    if (data.energy !== undefined) {
      userDataObj.set('energy', data.energy);
    }
    if (data.history) {
      userDataObj.set('history', data.history);
    }
    if (data.pools) {
      userDataObj.set('pools', data.pools);
    }

    await userDataObj.save();

    console.log('☁️ 数据已同步到云端');
    return true;
  } catch (error) {
    console.error('❌ 同步失败:', error);
    return false;
  }
}

// ============================================
// 实时监听云端数据变化（轮询方式）
// ============================================
export async function listenToCloudChanges(callback) {
  if (!AV || !currentUserId) {
    return null;
  }

  try {
    const objectId = localStorage.getItem('leancloud_object_id');
    
    if (!objectId) {
      return null;
    }

    // LeanCloud免费版不支持实时通信，使用轮询
    let lastUpdated = new Date();

    const checkForUpdates = async () => {
      try {
        const UserData = AV.Object.extend('UserData');
        const query = new AV.Query('UserData');
        const obj = await query.get(objectId);
        
        const objData = obj.toJSON();
        const objUpdated = new Date(objData.updatedAt);

        if (objUpdated > lastUpdated) {
          lastUpdated = objUpdated;
          callback(objData);
          console.log('🔄 检测到云端数据更新');
        }
      } catch (error) {
        console.error('轮询错误:', error);
      }
    };

    // 每30秒检查一次更新
    const intervalId = setInterval(checkForUpdates, 30000);

    // 返回取消监听的函数
    return () => clearInterval(intervalId);
  } catch (error) {
    console.error('❌ 监听失败:', error);
    return null;
  }
}

// ============================================
// 获取当前用户ID
// ============================================
export function getCurrentUserId() {
  return currentUserId;
}

// ============================================
// 验证设置密码
// ============================================
export async function verifySettingsPassword(inputPassword) {
  const savedPassword = sessionStorage.getItem('kitty_password');
  return inputPassword === savedPassword;
}

// ============================================
// 登出
// ============================================
export function logout() {
  sessionStorage.removeItem('kitty_logged_in');
  sessionStorage.removeItem('kitty_password');
  localStorage.removeItem('leancloud_object_id');
  currentUserId = null;
  window.location.href = 'login.html';
}

// ============================================
// 模块初始化完成
// ============================================
