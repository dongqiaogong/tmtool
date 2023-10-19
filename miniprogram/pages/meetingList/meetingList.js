// miniprogram/pages/meetingList/meetingList.js
const db = wx.cloud.database();
Page({
  /**
   * Page initial data
   */
  data: {
    loading: true,
    meetings: null,
    username: "",
    hasRegister: false,
    isAdmin: false
  },

  loadMeetingList: function () {
    db.collection('meetings').orderBy('date', 'desc').get().then(res => {
      let meetingData = res.data;
      this.setData({
        meetings: meetingData
      })
    });
  },

  goToMeetingDetail: function (e) {
    const meeting = e.currentTarget.dataset.meeting;

    var app = getApp();     // 取得全局App
    app.globalData.meetingInfo = {
      id: meeting._id,
      type: meeting.type,
      date: meeting.date,
      number: meeting.number,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      venue: meeting.venue,
      theme: meeting.theme,
      toastmasterOpenId: meeting.toastmasterOpenId,
      club: meeting.club,
      clubId: meeting.clubId
    };

    wx.navigateTo({
      url: `../menu/menu?id=${meeting._id}`,
    });

  },

  setNewMeeting: function (e) {
    wx.redirectTo({
      url: `../meetingManage/meetingManage`,
    });
  },

  setName: function (e) {
    wx.redirectTo({
      url: '../nameSetting/nameSetting',
    })
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    const app = getApp();

    app.checkLogin().then(res => {
      this.setData({
        username: app.globalData.userName,
        loading: false,
        isAdmin: app.globalData.isAdmin
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
    this.loadMeetingList();
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