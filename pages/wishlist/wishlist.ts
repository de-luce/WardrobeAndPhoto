// pages/wishlist/wishlist.ts
const util = require('../../utils/util')
const { saveToStorage, getFromStorage, generateId, formatTime } = util

interface WishItem {
  id: string
  title: string
  imageUrl?: string
  price?: string
  link?: string
  note?: string
  tags: string[]
  createTime: string
  completed: boolean
}

interface FormData {
  title: string
  imageUrl: string
  price: string
  link: string
  note: string
  tags: string
}

interface FilterCounts {
  all: number
  active: number
  completed: number
}

type FilterType = 'all' | 'active' | 'completed'

Page({
  data: {
    wishList: [] as WishItem[],
    filteredList: [] as WishItem[],
    showAddModal: false,
    editId: null as string | null,
    filterType: 'all' as FilterType,
    filterCounts: {
      all: 0,
      active: 0,
      completed: 0
    } as FilterCounts,
    formData: {
      title: '',
      imageUrl: '',
      price: '',
      link: '',
      note: '',
      tags: ''
    } as FormData
  },

  onLoad() {
    this.loadWishList()
  },

  onShow() {
    this.loadWishList()
  },

  // 加载心愿单列表
  loadWishList() {
    const list = getFromStorage<WishItem[]>('wishList', [])
    // 按创建时间倒序排列，未完成的在前
    list.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    })
    
    // 计算筛选数量
    const filterCounts: FilterCounts = {
      all: list.length,
      active: list.filter(item => !item.completed).length,
      completed: list.filter(item => item.completed).length
    }
    
    this.setData({
      wishList: list,
      filterCounts: filterCounts
    })
    this.applyFilter()
  },

  // 应用筛选
  applyFilter() {
    const { wishList, filterType } = this.data
    let filtered: WishItem[] = []
    if (filterType === 'active') {
      filtered = wishList.filter(item => !item.completed)
    } else if (filterType === 'completed') {
      filtered = wishList.filter(item => item.completed)
    } else {
      filtered = wishList
    }
    this.setData({
      filteredList: filtered
    })
  },

  // 切换筛选类型
  switchFilter(e: any) {
    const { type } = e.currentTarget.dataset
    this.setData({
      filterType: type as FilterType
    })
    this.applyFilter()
  },

  // 显示添加模态框
  showAddModal(e: any) {
    const item = e.currentTarget.dataset.item || null
    if (item) {
      // 编辑模式
      this.setData({
        showAddModal: true,
        editId: item.id,
        formData: {
          title: item.title || '',
          imageUrl: item.imageUrl || '',
          price: item.price || '',
          link: item.link || '',
          note: item.note || '',
          tags: (item.tags || []).join(',')
        }
      })
    } else {
      // 添加模式
      this.setData({
        showAddModal: true,
        editId: null,
        formData: {
          title: '',
          imageUrl: '',
          price: '',
          link: '',
          note: '',
          tags: ''
        }
      })
    }
  },

  // 隐藏添加模态框
  hideAddModal(e?: any) {
    this.setData({
      showAddModal: false,
      editId: null,
      formData: {
        title: '',
        imageUrl: '',
        price: '',
        link: '',
        note: '',
        tags: ''
      }
    })
  },

  // 输入处理
  onInput(e: any) {
    const { field } = e.currentTarget.dataset
    const { formData } = this.data
    formData[field as keyof FormData] = e.detail.value
    this.setData({ formData })
  },

  // 选择图片
  chooseImage(e?: any) {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        const { formData } = this.data
        formData.imageUrl = tempFilePath
        this.setData({ formData })
      }
    })
  },

  // 保存
  saveWish(e?: any) {
    const { formData, editId } = this.data
    if (!formData.title.trim()) {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      })
      return
    }

    const list = getFromStorage<WishItem[]>('wishList', [])
    
    if (editId) {
      // 编辑
      const index = list.findIndex(item => item.id === editId)
      if (index !== -1) {
        list[index] = {
          ...list[index],
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
          price: formData.price.trim(),
          link: formData.link.trim(),
          note: formData.note.trim()
        }
      }
    } else {
      // 新增
      const newItem: WishItem = {
        id: generateId(),
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        price: formData.price.trim(),
        link: formData.link.trim(),
        note: formData.note.trim(),
        createTime: formatTime(new Date()),
        completed: false
      }
      list.unshift(newItem)
    }

    saveToStorage('wishList', list)
    this.loadWishList()
    this.hideAddModal()
    wx.showToast({
      title: editId ? '更新成功' : '添加成功',
      icon: 'success'
    })
  },

  // 切换完成状态
  toggleComplete(e: any) {
    const { id } = e.currentTarget.dataset
    const list = getFromStorage<WishItem[]>('wishList', [])
    const index = list.findIndex(item => item.id === id)
    if (index !== -1) {
      list[index].completed = !list[index].completed
      saveToStorage('wishList', list)
      this.loadWishList()
      // 提供触觉反馈
      wx.vibrateShort({
        type: 'light'
      })
    }
  },

  // 删除
  deleteWish(e: any) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个心愿吗？',
      success: (res) => {
        if (res.confirm) {
          const list = getFromStorage<WishItem[]>('wishList', [])
          const newList = list.filter(item => item.id !== id)
          saveToStorage('wishList', newList)
          this.loadWishList()
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 预览图片
  previewImage(e: any) {
    const { url } = e.currentTarget.dataset
    if (url) {
      wx.previewImage({
        urls: [url],
        current: url
      })
    }
  }
})

