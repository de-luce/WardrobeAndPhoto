// pages/photo-detail/photo-detail.ts
const util = require('../../utils/util')
const { saveToStorage, getFromStorage } = util

interface PhotoItem {
  id: string
  imageUrl: string
  createTime: string
  description: string
}

Page({
  data: {
    photo: null as PhotoItem | null,
    showEditModal: false,
    editDescription: ''
  },

  onLoad(options: { id?: string }) {
    const { id } = options
    if (id) {
      this.loadPhotoDetail(id)
    }
  },

  // 加载详情
  loadPhotoDetail(id: string) {
    const list = getFromStorage<PhotoItem[]>('photoList', [])
    const photo = list.find(p => p.id === id)
    if (photo) {
      this.setData({
        photo: photo,
        editDescription: photo.description || ''
      })
    } else {
      wx.showToast({
        title: '照片不存在',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  // 预览大图
  previewImage(e?: any) {
    const { photo } = this.data
    if (photo && photo.imageUrl) {
      wx.previewImage({
        urls: [photo.imageUrl],
        current: photo.imageUrl
      })
    }
  },

  // 显示编辑模态框
  showEditModal(e?: any) {
    this.setData({
      showEditModal: true
    })
  },

  // 隐藏编辑模态框
  hideEditModal(e?: any) {
    this.setData({
      showEditModal: false
    })
  },

  // 输入描述
  onDescriptionInput(e: any) {
    this.setData({
      editDescription: e.detail.value
    })
  },

  // 保存编辑
  saveEdit(e?: any) {
    const { photo, editDescription } = this.data
    if (!photo) return
    
    const list = getFromStorage<PhotoItem[]>('photoList', [])
    const index = list.findIndex(p => p.id === photo.id)
    if (index !== -1) {
      list[index].description = editDescription.trim()
      saveToStorage('photoList', list)
      
      this.loadPhotoDetail(photo.id)
      this.hideEditModal()
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
    }
  },

  // 删除
  deletePhoto(e?: any) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张照片吗？',
      success: (res) => {
        if (res.confirm) {
          const { photo } = this.data
          if (!photo) return
          
          const list = getFromStorage<PhotoItem[]>('photoList', [])
          const newList = list.filter(p => p.id !== photo.id)
          saveToStorage('photoList', newList)
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      }
    })
  }
})

