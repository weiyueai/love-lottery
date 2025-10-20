// ============================================
// Firebase 认证和数据同步模块
// ============================================

import firebaseConfig, { isFirebaseConfigured } from './firebase-config.js';

// Firebase实例
let db = null;
let currentUserId = null;

// ============================================
// 初始化Firebase
// ============================================
async function initFirebase() {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase未配置，使用本地存储模式');
    return false;
  }

  try {
    // 动态导入Firebase SDK
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getFirestore, collection, doc, getDoc, setDoc, onSnapshot } = 
      await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    // 初始化Firebase
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    
    console.log('✅ Firebase初始化成功');
    return true;
  } catch (error) {
    console.error('❌ Firebase初始化失败:', error);
    return false;
  }
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
    // 初始化Firebase
    const firebaseReady = await initFirebase();
    
    if (!firebaseReady) {
      // Firebase未配置，使用本地存储
      return {
        success: true,
        isNew: false,
        message: '使用本地存储模式'
      };
    }

    // 生成用户ID
    currentUserId = await generateUserId(password);
    
    // 从Firestore加载数据
    const { getFirestore, doc, getDoc, setDoc } = 
      await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    const userDocRef = doc(getFirestore(), 'users', currentUserId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // 用户存在，加载数据
      const userData = userDoc.data();
      
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

      console.log('✅ 数据加载成功');
      return {
        success: true,
        isNew: false,
        message: '欢迎回来！'
      };
    } else {
      // 新用户，创建账号
      const localEnergy = localStorage.getItem('kitty_energy') || '0';
      const localHistory = localStorage.getItem('kitty_history') || '[]';
      const localPools = localStorage.getItem('kitty_pools') || 'null';

      const initialData = {
        energy: Number(localEnergy),
        history: JSON.parse(localHistory),
        pools: localPools !== 'null' ? JSON.parse(localPools) : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(userDocRef, initialData);
      
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
  if (!db || !currentUserId) {
    console.log('📱 未连接云端，仅保存到本地');
    return false;
  }

  try {
    const { getFirestore, doc, setDoc, serverTimestamp } = 
      await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    const userDocRef = doc(getFirestore(), 'users', currentUserId);
    
    await setDoc(userDocRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log('☁️ 数据已同步到云端');
    return true;
  } catch (error) {
    console.error('❌ 同步失败:', error);
    return false;
  }
}

// ============================================
// 实时监听云端数据变化
// ============================================
export async function listenToCloudChanges(callback) {
  if (!db || !currentUserId) {
    return null;
  }

  try {
    const { getFirestore, doc, onSnapshot } = 
      await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    const userDocRef = doc(getFirestore(), 'users', currentUserId);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        callback(data);
        console.log('🔄 检测到云端数据更新');
      }
    });

    return unsubscribe;
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
  currentUserId = null;
  window.location.href = 'login.html';
}

