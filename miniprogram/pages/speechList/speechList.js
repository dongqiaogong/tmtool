// miniprogram/pages/speechList/speechList.js
const db = wx.cloud.database();

Page({

  /**
   * Page initial data
   */
  data: {
    loading: true,
    speeches: null,
    meetingId: null,
    userName: null,
    isAdmin: false,
    myOpenId: null,
    canEnrollment: true,
  },

  enrollment: function () {
    wx.redirectTo({
      url: `../enrollment/enrollment?id=${this.data.meetingId}`,
    })
  },

  loadSpeechList: function () {
    this.setData({
      loading: true
    })
    console.log('speech list', this.data.meetingId)
    db.collection('speeches').where({
      meetingId: this.data.meetingId
    }).get().then(res => {
      console.log('speech list', res.data);
      const app = getApp();
      const meetingType = app.globalData.meetingInfo.type;
      const speechCount = res.data.length;
      let canEnrollment = true;
      if ((meetingType == 'Regular' && speechCount >= 2)
        || (meetingType == 'Malathon' && speechCount >= 5)) {
        canEnrollment = false;
      }
      this.setData({
        speeches: res.data,
        loading: false,
        canEnrollment
      });
    })
  },

  showDetail: function (e) {
    const speech = e.currentTarget.dataset.speech;
    wx.redirectTo({
      url: `../enrollment/enrollment?id=${this.data.meetingId}&speechId=${speech._id}`,
    });
  },

  takeEvaluator: function (e) {
    const app = getApp();
    const speech = e.currentTarget.dataset.speech;
    const data = {
      'evaluator': app.globalData.userName,
      'evaluatorOpenId': app.globalData.myOpenId
    }
    wx.showToast({
      title: '数据加载中',
      icon: 'loading',
      // duration: 3000
    });
    db.collection('speeches').doc(speech._id).update({
      data
    }).then(res => {
      wx.showToast({
        title: 'Successfully!',
        icon: 'success',
        duration: 3000
      });
      this.loadSpeechList();
    });
  },

  cancelEvaluator: function (e) {
    const app = getApp();
    const speech = e.currentTarget.dataset.speech;
    const data = {
      'evaluator': '',
      'evaluatorOpenId': ''
    }
    wx.showToast({
      title: '数据加载中',
      icon: 'loading',
      // duration: 3000
    });
    db.collection('speeches').doc(speech._id).update({
      data
    }).then(res => {
      wx.showToast({
        title: 'Successfully!',
        icon: 'success',
        duration: 3000
      });

      this.loadSpeechList();
    });
  },

  cancelSpeech: function (e) {
    wx.showModal({
      title: 'Alert',
      content: 'Are you sure you want to give up this speech?',
      confirmText: "Confirm",
      cancelText: "Cancel",
      success: (res) => {
        console.log(res);
        if (res.confirm) {
          const speech = e.currentTarget.dataset.speech;
          db.collection('speeches').doc(speech._id).remove().then(res => {
            wx.showToast({
              title: 'Successfully!',
              icon: 'success',
              duration: 3000
            });
            this.loadSpeechList();
          })
        } else {
          // console.log('用户点击辅助操作')
        }
      }
    });

  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    const app = getApp();
    const meetingId = options.id;
    app.checkLogin().then(res => {
      this.setData({
        meetingId,
        userName: app.globalData.userName,
        isAdmin: app.globalData.isAdmin,
        myOpenId: app.globalData.myOpenId
      });
      this.loadSpeechList();
    });

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