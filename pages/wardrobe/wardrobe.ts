// pages/wardrobe/wardrobe.ts
const util = require('../../utils/util')
const { saveToStorage, getFromStorage, generateId, formatTime, formatDate } = util

interface WardrobeItem {
  id: string
  imageUrl: string
  createTime: string
  title: string
  tags: string[]
  displayDate?: string  // 格式化后的日期
  completed?: boolean  // 是否已完成
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
    console.log('加载衣柜列表，数量:', list.length)
    
    let hasFixed = false
    
    // 为每个物品添加格式化后的日期，并修复错误的路径格式
    const listWithDate = list.map((item, index) => {
      let fixedImageUrl = item.imageUrl
      
      // 修复路径：将错误的 /tmp/ 格式转换为 http://tmp/ 格式
      if (fixedImageUrl && fixedImageUrl.startsWith('/tmp/')) {
        fixedImageUrl = fixedImageUrl.replace('/tmp/', 'http://tmp/')
        console.log(`物品 ${index}: 修复路径`, item.imageUrl, '->', fixedImageUrl)
        hasFixed = true
      }
      
      console.log(`物品 ${index}:`, item.title, '图片路径:', fixedImageUrl)
      
      return {
        id: item.id,
        imageUrl: fixedImageUrl,
        createTime: item.createTime,
        title: item.title,
        tags: item.tags || [],
        completed: item.completed || false,
        displayDate: formatDate(item.createTime)
      }
    })
    
    // 如果有路径被修复，更新存储
    if (hasFixed) {
      const fixedList = listWithDate.map((item) => {
        return {
          id: item.id,
          imageUrl: item.imageUrl,
          createTime: item.createTime,
          title: item.title,
          tags: item.tags || [],
          completed: item.completed || false
        }
      })
      saveToStorage('wardrobeList', fixedList)
      console.log('已修复图片路径并更新存储')
    }
    
    this.setData({
      wardrobeList: listWithDate
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
      sizeType: ['original', 'compressed'],
      sourceType: [source],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        console.log('选择的图片路径（原始）:', tempFilePath)
        this.setData({ isUploading: true })
        wx.showLoading({ title: '保存中...', mask: true })

        // wx.chooseImage 返回的路径格式是 http://tmp/xxx（网络临时路径）
        // 直接使用原始路径，不做任何转换（与照片墙完全一致）
        const imageUrl = tempFilePath
        console.log('保存的图片路径:', imageUrl)

        // 直接使用临时路径，与照片墙保持一致
        const newItem: WardrobeItem = {
          id: generateId(),
          imageUrl: imageUrl,
          createTime: formatTime(new Date()),
          title: '新衣服',
          tags: [],
          completed: false
        }

        const list = getFromStorage<WardrobeItem[]>('wardrobeList', [])
        list.unshift(newItem)
        saveToStorage('wardrobeList', list)

        this.loadWardrobeList()
        this.hideAddModal()
        
        wx.hideLoading()
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        })
        
        this.setData({ isUploading: false })
      },
      fail: (err) => {
        // 用户取消或选择失败时也要确保隐藏 loading
        console.log('选择图片失败或取消', err)
        wx.hideLoading()
        this.setData({ isUploading: false })
      }
    })
  },

  // 图片加载成功
  onImageLoad(e: any) {
    const { id } = e.currentTarget.dataset
    console.log('图片加载成功', id)
  },

  // 图片加载错误处理
  onImageError(e: any) {
    const { id } = e.currentTarget.dataset
    const { wardrobeList } = this.data
    const item = wardrobeList.find((item: any) => item.id === id)
    console.error('图片加载失败', {
      id,
      imageUrl: item ? item.imageUrl : undefined,
      error: e.detail.errMsg || e.detail
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
  },

  // 切换完成状态
  toggleComplete(e: any) {
    const { id } = e.currentTarget.dataset
    const list = getFromStorage<WardrobeItem[]>('wardrobeList', [])
    const index = list.findIndex(item => item.id === id)
    
    if (index !== -1) {
      list[index].completed = !list[index].completed
      saveToStorage('wardrobeList', list)
      this.loadWardrobeList()
      
      wx.showToast({
        title: list[index].completed ? '已标记为完成' : '已取消完成',
        icon: 'success',
        duration: 1500
      })
    }
  }
})

