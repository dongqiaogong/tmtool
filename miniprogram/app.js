//app.js
App({
  onLaunch: function () {
    console.log('onLaunch');

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env: 'dev-ma9lj',
        env: 'toastmaster-8smkd',
        traceUser: true,
      })
    }

    this.globalData = {
      userName: null,
      myOpenId: null,
      meetingInfo: null,
      isAdmin: null,
    }
  },

  checkLogin: function () {
    if (this.globalData.userName) {
      return new Promise((resolve, reject) => {
        resolve();
      });
    }
    const db = wx.cloud.database();
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'login'
      }).then(res => {
        this.globalData.myOpenId = res.result.openid;
        db.collection('members').where({
          "_openid": res.result.openid
        }).get().then(res => {
          console.log('finished launch')
          if (res.data.length) {
            this.globalData.userName = res.data[0].realname;
            this.globalData.isAdmin = res.data[0].permission === 'admin';
            resolve(res);
          } else {
            wx.redirectTo({
              url: '../nameSetting/nameSetting',
            })
          }
        })
      })
    })
  }
})
