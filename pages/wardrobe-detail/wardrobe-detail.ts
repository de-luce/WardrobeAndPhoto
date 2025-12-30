// pages/wardrobe-detail/wardrobe-detail.ts
const util = require('../../utils/util')
const { saveToStorage, getFromStorage, formatTime } = util

interface WardrobeItem {
  id: string
  imageUrl: string
  createTime: string
  title: string
  tags: string[]
}

Page({
  data: {
    item: null as WardrobeItem | null,
    showEditModal: false,
    editTitle: '',
    editTags: ''
  },

  onLoad(options: { id?: string }) {
    const { id } = options
    if (id) {
      this.loadItemDetail(id)
    }
  },

  // 加载详情
  loadItemDetail(id: string) {
    const list = getFromStorage<WardrobeItem[]>('wardrobeList', [])
    const item = list.find(i => i.id === id)
    if (item) {
      this.setData({
        item: item,
        editTitle: item.title || '',
        editTags: (item.tags || []).join(',')
      })
    } else {
      wx.showToast({
        title: '物品不存在',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  // 预览大图
  previewImage(e?: any) {
    const { item } = this.data
    if (item && item.imageUrl) {
      wx.previewImage({
        urls: [item.imageUrl],
        current: item.imageUrl
      })
    }
  },

  // 显示编辑模态框
  onShowEditModal(e?: any) {
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

  // 阻止事件冒泡
  stopPropagation(e?: any) {
    // 阻止事件冒泡，防止点击内容区域关闭模态框
  },

  // 输入标题
  onTitleInput(e: any) {
    this.setData({
      editTitle: e.detail.value
    })
  },

  // 输入标签
  onTagsInput(e: any) {
    this.setData({
      editTags: e.detail.value
    })
  },

  // 保存编辑
  saveEdit(e?: any) {
    const { item, editTitle, editTags } = this.data
    if (!item) return
    
    if (!editTitle.trim()) {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      })
      return
    }

    const list = getFromStorage<WardrobeItem[]>('wardrobeList', [])
    const index = list.findIndex(i => i.id === item.id)
    if (index !== -1) {
      list[index].title = editTitle.trim()
      list[index].tags = editTags.split(',').map(t => t.trim()).filter(t => t)
      saveToStorage('wardrobeList', list)
      
      this.loadItemDetail(item.id)
      this.hideEditModal()
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
    }
  },

  // 删除
  deleteItem(e?: any) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这件衣服吗？',
      success: (res) => {
        if (res.confirm) {
          const { item } = this.data
          if (!item) return
          
          const list = getFromStorage<WardrobeItem[]>('wardrobeList', [])
          const newList = list.filter(i => i.id !== item.id)
          saveToStorage('wardrobeList', newList)
          
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

