// pages/wardrobe/wardrobe.ts
const util = require('../../utils/util')
const { saveToStorage, getFromStorage, generateId, formatTime } = util

interface WardrobeItem {
  id: string
  imageUrl: string
  createTime: string
  title: string
  tags: string[]
}

Page({
  data: {
    wardrobeList: [] as WardrobeItem[],
    showAddModal: false,
    isUploading: false,
    selectedImage: null as string | null
  },

  onLoad() {
    this.loadWardrobeList()
  },

  onShow() {
    this.loadWardrobeList()
  },

  // 加载衣柜列表
  loadWardrobeList() {
    const list = getFromStorage<WardrobeItem[]>('wardrobeList', [])
    this.setData({
      wardrobeList: list
    })
  },

  // 显示添加模态框
  showAddModal(e?: any) {
    this.setData({
      showAddModal: true
    })
  },

  // 隐藏添加模态框
  hideAddModal(e?: any) {
    this.setData({
      showAddModal: false
    })
  },

  // 从相册选择或拍照
  chooseImage(e: any) {
    const source = e.currentTarget.dataset.source || 'album'
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: [source],
      success: async (res) => {
        const tempFilePath = res.tempFilePaths[0]
        this.setData({ isUploading: true })
        wx.showLoading({ title: '处理中...' })

        try {
          // 处理图片（抠图）
          const processedImage = await this.processImage(tempFilePath)

          const newItem: WardrobeItem = {
            id: generateId(),
            imageUrl: processedImage,
            createTime: formatTime(new Date()),
            title: '新衣服',
            tags: []
          }

          const list = getFromStorage<WardrobeItem[]>('wardrobeList', [])
          list.unshift(newItem)
          saveToStorage('wardrobeList', list)

          this.loadWardrobeList()
          this.hideAddModal()
          wx.showToast({
            title: '添加成功',
            icon: 'success'
          })
        } catch (error) {
          wx.showToast({
            title: '处理失败',
            icon: 'none'
          })
          console.error('处理失败', error)
        } finally {
          this.setData({ isUploading: false })
          wx.hideLoading()
        }
      }
    })
  },

  // 处理图片（抠图功能）
  // 注意：实际项目中需要使用后端API或小程序云函数来实现抠图功能
  processImage(tempFilePath: string): Promise<string> {
    return new Promise((resolve) => {
      // 这里可以调用图片处理API
      // 暂时直接返回原图路径
      // 实际应该调用抠图服务，比如：
      // 1. 使用小程序云函数调用AI抠图API
      // 2. 使用第三方服务如Remove.bg等
      
      // 示例：尝试保存图片到本地文件系统（如果支持）
      // 注意：临时文件可能会被系统清理，建议使用云存储或服务器存储
      try {
        const fileManager = wx.getFileSystemManager()
        // 使用临时目录
        const savedFilePath = `${wx.env.USER_DATA_PATH || ''}/${Date.now()}.jpg`
        
        if (wx.env && wx.env.USER_DATA_PATH) {
          fileManager.copyFile({
            srcPath: tempFilePath,
            destPath: savedFilePath,
            success: () => {
              resolve(savedFilePath)
            },
            fail: () => {
              // 如果保存失败，使用临时路径
              resolve(tempFilePath)
            }
          })
        } else {
          // 不支持USER_DATA_PATH时，直接使用临时路径
          resolve(tempFilePath)
        }
      } catch (e) {
        // 出错时使用临时路径
        resolve(tempFilePath)
      }
    })
  },

  // 查看详情
  viewDetail(e: any) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/wardrobe-detail/wardrobe-detail?id=${id}`
    })
  },

  // 删除物品
  deleteItem(e: any) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这件衣服吗？',
      success: (res) => {
        if (res.confirm) {
          const list = getFromStorage<WardrobeItem[]>('wardrobeList', [])
          const newList = list.filter(item => item.id !== id)
          saveToStorage('wardrobeList', newList)
          this.loadWardrobeList()
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  }
})

