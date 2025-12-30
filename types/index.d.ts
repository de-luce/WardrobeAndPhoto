// 微信小程序类型定义
declare namespace wx {
  function getStorageSync(key: string): any;
  function setStorageSync(key: string, data: any): void;
  function login(options: { success?: (res: { code: string }) => void }): void;
  function showToast(options: { title: string; icon?: string }): void;
  function showLoading(options: { title: string }): void;
  function hideLoading(): void;
  function showModal(options: {
    title: string;
    content: string;
    success?: (res: { confirm: boolean }) => void;
  }): void;
  function navigateTo(options: { url: string }): void;
  function navigateBack(options?: { delta?: number }): void;
  function switchTab(options: { url: string }): void;
  function chooseImage(options: {
    count?: number;
    sizeType?: string[];
    sourceType?: string[];
    success?: (res: { tempFilePaths: string[] }) => void;
    fail?: (err: any) => void;
  }): void;
  function previewImage(options: {
    urls: string[];
    current?: string;
  }): void;
  function downloadFile(options: {
    url: string;
    success?: (res: { tempFilePath: string; statusCode: number }) => void;
    fail?: (err: any) => void;
  }): void;
  function getFileSystemManager(): {
    copyFile(options: {
      srcPath: string;
      destPath: string;
      success?: () => void;
      fail?: (err: any) => void;
    }): void;
  };
  function vibrateShort(options?: { type?: string }): void;
  function setClipboardData(options: {
    data: string;
    success?: () => void;
  }): void;
  
  interface Env {
    USER_DATA_PATH?: string;
  }
  
  const env: Env;
}

// 页面类型定义
interface PageInstance {
  data?: any;
  onLoad?: (options?: any) => void;
  onShow?: () => void;
  onReady?: () => void;
  onHide?: () => void;
  onUnload?: () => void;
  setData?: (data: any) => void;
}

interface AppInstance {
  globalData?: any;
  onLaunch?: (options?: any) => void;
  onShow?: (options?: any) => void;
  onHide?: () => void;
}

// 数据类型定义
interface WardrobeItem {
  id: string;
  imageUrl: string;
  createTime: string;
  title: string;
  tags: string[];
}

interface PhotoItem {
  id: string;
  imageUrl: string;
  createTime: string;
  description: string;
}

interface WishItem {
  id: string;
  title: string;
  imageUrl?: string;
  price?: string;
  link?: string;
  note?: string;
  tags: string[];
  createTime: string;
  completed: boolean;
}

// 工具函数类型
interface Util {
  formatTime(date: Date): string;
  saveToStorage(key: string, data: any): boolean;
  getFromStorage<T>(key: string, defaultValue?: T): T;
  generateId(): string;
  isValidUrl(string: string): boolean;
  downloadImage(url: string): Promise<string>;
}

declare function App(options: AppInstance): void;
declare function Page(options: PageInstance): void;
declare function require(path: string): any;
declare function getApp(): AppInstance;

