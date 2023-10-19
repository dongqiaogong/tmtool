// miniprogram/pages/enrollment/enrollment.js
const db = wx.cloud.database();

Page({

  /**
   * Page initial data
   */
  data: {
    meetingId: null,
    speechId: null,
    title: '',
    manual: '',
    objective: '',
    green: 0,
    red: 0,
    myOpenId: null,
    ownerOpenId: null,
    disabled: false,
  },

  bindformInput: function (e) {
    this.setData({
      [e.target.id]: e.detail.value
    });
  },

  enrollment: function () {
    const app = getApp();
    const data = {
      meetingId: this.data.meetingId,
      title: this.data.title,
      manual: this.data.manual,
      objective: this.data.objective,
      green: this.data.green,
      yellow: (parseInt(this.data.green) + parseInt(this.data.red)) / 2,
      red: this.data.red,
      owner: app.globalData.userName,
      ownerOpenId: app.globalData.myOpenId,
    }

    db.collection('speeches').add({
      data
    }).then(res => {
      wx.showModal({
        content: 'Enrollment Successfully!',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            wx.redirectTo({
              url: `../speechList/speechList?id=${this.data.meetingId}`,
            });
          }
        }
      });
    })
  },

  update: function () {
    const data = {
      title: this.data.title,
      manual: this.data.manual,
      objective: this.data.objective,
      green: this.data.green,
      yellow: (parseInt(this.data.green) + parseInt(this.data.red)) / 2,
      red: this.data.red,
    }

    db.collection('speeches').doc(this.data.speechId).update({
      data
    }).then(res => {
      wx.showModal({
        content: 'Update Successfully!',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            wx.redirectTo({
              url: `../speechList/speechList?id=${this.data.meetingId}`,
            });
          }
        }
      });
    });
  },

  // cancel: function () {
  //   db.collection('speeches').doc(this.data.speechId).remove().then(res => {
  //     wx.redirectTo({
  //       url: `../speechList/speechList?id=${this.data.meetingId}`,
  //     });
  //   })
  // },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    const meetingId = options.id ? options.id : 'e6a3b07d5ef0bed200361ac46969d7a1';
    const speechId = options.speechId;
    const app = getApp();
    app.checkLogin().then(res => { 
      if (speechId) {
        db.collection('speeches').doc(speechId).get().then(res => {
          this.setData({
            ownerOpenId: res.data.ownerOpenId,
            title: res.data.title,
            manual: res.data.manual,
            objective: res.data.objective,
            green: res.data.green,
            red: res.data.red,
            disabled: app.globalData.myOpenId == res.data.ownerOpenId ? false : true
          })
        });
      }
  
      this.setData({
        meetingId,
        speechId,
        myOpenId: app.globalData.myOpenId,
      });
    })
    
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