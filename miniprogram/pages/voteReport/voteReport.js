// miniprogram/pages/voteReport/voteReport.js
const db = wx.cloud.database();

Page({

  /**
   * Page initial data
   */
  data: {
    meetingId: null,
    bestes: null,
  },

  loadData: function () {
    wx.cloud.callFunction({
      name: 'voteResult',
      data: {
        meetingId: this.data.meetingId
      }
    }).then(res => {
      console.log(res.result.data);

      const result = {};
      const votes = res.result.data;
      for (let vote of votes) {
        if (!result[vote.type]) {
          result[vote.type] = {};
        }
        if (result[vote.type][vote.voteTo]) {
          result[vote.type][vote.voteTo] += 1;
        } else {
          result[vote.type][vote.voteTo] = 1;
        }
      }

      console.log(result);
      const bestes = [];
      for (let type of Object.keys(result)) {
        let best = [];
        let count = 0;
        let totalForType = 0;
        for (let voteTo of Object.keys(result[type])) {
          totalForType += result[type][voteTo];
          if (result[type][voteTo] > count) {
            best = [voteTo];
            count = result[type][voteTo];
          } else if (result[type][voteTo] == count) {
            best.push(voteTo);
            count = result[type][voteTo];
          }
        }
        bestes.push({ 'type': type, best, count, totalForType });

      }
      console.log(bestes);
      this.setData({
        bestes
      })
    })
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    const meetingId = options.id;
    this.setData({
      meetingId
    });
    const app = getApp();
    app.checkLogin().then(res => {
      this.loadData();
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