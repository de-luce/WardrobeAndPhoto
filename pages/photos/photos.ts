// pages/photos/photos.ts
const util = require('../../utils/util')
const { saveToStorage, getFromStorage, generateId, formatTime } = util

interface PhotoItem {
  id: string
  imageUrl: string
  createTime: string
  description: string
}

Page({
  data: {
    photoList: [] as PhotoItem[]
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
    this.setData({
      photoList: list
    })
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

  // 预览图片
  previewImage(e: any) {
    const { url } = e.currentTarget.dataset
    const { photoList } = this.data
    const urls = photoList.map(item => item.imageUrl)
    
    wx.previewImage({
      urls: urls,
      current: url
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
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  }
})

