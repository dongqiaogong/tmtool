// pages/nameSetting/nameSetting.js
const db = wx.cloud.database();
Page({

  /**
   * Page initial data
   */
  data: {
    realName: null,
  },

  bindKeyInput: function (e) {
    this.setData({
      realName: e.detail.value
    })
  },

  save: function (e) {
    const realName = this.data.realName;
    if (!realName) {
      wx.showModal({
        content: 'Real Name can not be empty',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          }
        }
      });
    } else {
      var app = getApp();     // 取得全局App

      const userCollection = db.collection('members');
      userCollection.where({
        "_openid": app.globalData.myOpenId
      }).get().then(res => {
        if (res.data.length) {
          userCollection.doc(res.data[0]._id).update({
            "data": {
              "realname": realName
            }
          }).then(res => this.setProfileCallback(realName))
        } else {
          userCollection.add({
            "data": {
              "realname": realName,
              "permission": 'normal'
            }
          }).then(res => this.setProfileCallback(realName))
        }
      })
    }
  },

  setProfileCallback: function (realName) {
    const app = getApp();
    app.globalData.userName = realName;
    wx.showModal({
      content: 'Set Profile Successfully!',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          wx.redirectTo({
            url: `../meetingList/meetingList`,
          });
        }
      }
    });
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})