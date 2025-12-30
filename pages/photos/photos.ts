// pages/photos/photos.ts
const util = require('../../utils/util')
const { saveToStorage, getFromStorage, generateId, formatTime, formatDate } = util

interface PhotoItem {
  id: string
  imageUrl: string
  createTime: string
  description: string
  displayDate?: string
  rotate?: number
}

Page({
  data: {
    photoList: [] as PhotoItem[],
    currentIndex: 0
  },

  onLoad() {
    this.loadPhotoList()
  },

  onShow() {
    this.loadPhotoList()
  },

  // 加载照片列表
  loadPhotoList() {
    const list = getFromStorage<PhotoItem[]>('photoList', [])
    // 为每个照片添加随机旋转角度和格式化日期
    const listWithRotate = list.map((item, index) => ({
      ...item,
      rotate: this.getRandomRotate(index),
      displayDate: formatDate(item.createTime)
    }))
    this.setData({
      photoList: listWithRotate
    })
  },

  // 获取随机旋转角度（拍立得风格）
  getRandomRotate(index: number): number {
    // 根据索引生成不同的旋转角度，但角度不会太大
    const angles = [-3, 2, -2, 3, -1, 1, -2.5, 2.5, -1.5, 1.5]
    return angles[index % angles.length]
  },

  // 选择照片
  choosePhotos(e?: any) {
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        this.savePhotos(tempFilePaths)
      }
    })
  },

  // 保存照片
  savePhotos(tempFilePaths: string[]) {
    wx.showLoading({ title: '保存中...' })
    
    const newPhotos: PhotoItem[] = tempFilePaths.map((path, index) => ({
      id: generateId() + index,
      imageUrl: path,
      createTime: formatTime(new Date()),
      description: ''
    }))

    const list = getFromStorage<PhotoItem[]>('photoList', [])
    list.unshift(...newPhotos)
    saveToStorage('photoList', list)

    this.loadPhotoList()
    wx.hideLoading()
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    })
  },

  // 查看详情
  viewDetail(e: any) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/photo-detail/photo-detail?id=${id}`
    })
  },

  // 预览图片（支持滑动切换）
  previewImage(e: any) {
    const { url, index } = e.currentTarget.dataset
    const { photoList } = this.data
    const urls = photoList.map(item => item.imageUrl)
    const currentIndex = index !== undefined ? parseInt(index) : urls.indexOf(url)
    
    wx.previewImage({
      urls: urls,
      current: urls[currentIndex] || url
    })
  },

  // 删除照片
  deletePhoto(e: any) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张照片吗？',
      success: (res) => {
        if (res.confirm) {
          const list = getFromStorage<PhotoItem[]>('photoList', [])
          const newList = list.filter(item => item.id !== id)
          saveToStorage('photoList', newList)
          this.loadPhotoList()
          
          // 调整当前索引，防止越界
          const { currentIndex } = this.data
          if (currentIndex >= newList.length && newList.length > 0) {
            this.setData({
              currentIndex: newList.length - 1
            })
          }
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 滑动切换事件
  onSwiperChange(e: any) {
    const current = e.detail.current
    this.setData({
      currentIndex: current
    })
  }
})

