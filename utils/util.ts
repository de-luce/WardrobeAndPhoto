// utils/util.ts

const formatTime = (date: Date): string => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = (n: number): string => {
  const str = n.toString()
  return str[1] ? str : `0${str}`
}

// 保存数据到本地存储
const saveToStorage = (key: string, data: any): boolean => {
  try {
    wx.setStorageSync(key, data)
    return true
  } catch (e) {
    console.error('保存数据失败', e)
    return false
  }
}

// 从本地存储读取数据
const getFromStorage = <T = any>(key: string, defaultValue: T | null = null): T | null => {
  try {
    return wx.getStorageSync(key) || defaultValue
  } catch (e) {
    console.error('读取数据失败', e)
    return defaultValue
  }
}

// 生成唯一ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 验证URL格式
const isValidUrl = (string: string): boolean => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

// 下载网络图片到本地
const downloadImage = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url: url,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.tempFilePath)
        } else {
          reject(new Error('下载失败'))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

module.exports = {
  formatTime,
  saveToStorage,
  getFromStorage,
  generateId,
  isValidUrl,
  downloadImage
}

