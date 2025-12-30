// pages/index/index.ts
Page({
  onLoad() {
    // 跳转到衣柜页面（tabBar 页面）
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/wardrobe/wardrobe',
        fail: (err) => {
          console.error('跳转失败', err)
          wx.showToast({
            title: '跳转失败，请点击底部菜单',
            icon: 'none'
          })
        }
      })
    }, 100)
  },
  
  onShow() {
    // 如果页面显示时还在首页，再次尝试跳转
    wx.switchTab({
      url: '/pages/wardrobe/wardrobe'
    })
  }
})

