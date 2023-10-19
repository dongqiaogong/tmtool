// components/pageTitle/pageTitle.js
Component({
  /**
   * Component properties
   */
  properties: {
    meetingId: {
      type: String,
      value: '',
      // observer(newVal, oldVal) {
      //   // 第一种方式通过参数传递的方式触发函数的执行
      //   var app = getApp();     // 取得全局App
      //   console.log("page Title observer", this.properties.meetingId);
      //   console.log(app.globalData.meetingInfo);
      //   if (app.globalData.meetingInfo) {
      //     this.setData({
      //       meetingInfo: app.globalData.meetingInfo
      //     })
      //   } else {
      //     const db = wx.cloud.database();
      //     db.collection('meetings').doc(this.properties.meetingId).get().then(res => {
      //       console.log(res.data);
      //       app.globalData.meetingInfo = { ...res.data, id: res.data._id }
      //       this.setData({
      //         meetingInfo: app.globalData.meetingInfo
      //       })
      //       console.log(this.data.meetingInfo);
      //     })
      //   }
      // }
    }
  },

  observers: {
    "meetingInfo": function (meetingInfo) {
      this.setData(meetingInfo)
    }
  },

  /**
   * Component initial data
   */
  data: {
    meetingInfo: {},
  },
  ready() {


  },
  attached() {
    var app = getApp();     // 取得全局App
    console.log("page Title attached", this.properties.meetingId);
    console.log(app.globalData.meetingInfo);
    if (app.globalData.meetingInfo) {
      this.setData({
        meetingInfo: app.globalData.meetingInfo
      })
    } else {
      const db = wx.cloud.database();
      db.collection('meetings').doc(this.properties.meetingId).get().then(res => {
        console.log(res.data);
        app.globalData.meetingInfo = { ...res.data, id: res.data._id }
        this.setData({
          meetingInfo: app.globalData.meetingInfo
        })
        console.log("this.data.meetingInfo", this.data.meetingInfo);
      })
    }
  },
  /**
   * Component methods
   */
  methods: {
    backToMenu: function () {
      wx.navigateTo({
        url: `../../pages/menu/menu?id=${this.data.meetingInfo.id}`,
      })
    }
  }
})
