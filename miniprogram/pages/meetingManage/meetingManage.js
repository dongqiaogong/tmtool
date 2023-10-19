// miniprogram/pages/meetingManage/meetingManage.js
const db = wx.cloud.database();
Page({
  /**
   * Page initial data
   */
  data: {
    loading: true,
    meetingId: null,
    isUpdate: false,
    typeItems: [{
      name: 'Regular',
      value: 'Regular',
      checked: true
    },
    {
      name: 'Malathon',
      value: 'Malathon'
    }
    ],
    // club: 'ThomsonReuters',
    clubs: null,
    clubObjects: null,
    clubIndex: -1,
    number: '',
    venue: '',
    startTime: '19:30',
    endTime: '21:00',
    date: '',
    type: 'Regular',
    theme: '',
  },
  setMeeting() {
    const meeting = {
      club: this.data.club,
      number: this.data.number,
      date: this.data.date,
      startTime: this.data.startTime,
      endTime: this.data.endTime,
      venue: this.data.venue,
      type: this.data.type,
      theme: this.data.theme,
      club: this.data.clubObjects[this.data.clubIndex].name,
      clubId: this.data.clubObjects[this.data.clubIndex]._id,
    };
    const meetings = db.collection('meetings');
    if (this.data.meetingId) {
      meetings.doc(this.data.meetingId).update({
        data: meeting
      }).then(res => {
        wx.showModal({
          content: 'Update the Meeting Successfully!',
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              const app = getApp();
              app.globalData.meetingInfo = { ...app.globalData.meetingInfo, ...meeting };
              wx.redirectTo({
                url: `../meetingList/meetingList`,
              });
            }
          }
        });
      });
    } else {
      meetings.add({
        data: meeting
      }).then(
        resData => {
          const meetingId = resData._id;
          this.getRoleData(meetingId, this.data.type);
        }
      );
    }
  },
  getRoleData(meetingId, meetingType) {
    const app = getApp();

    wx.cloud.callFunction({
      name: 'setMeeting',
      data: {
        meetingId,
        type: meetingType,
        clubId: this.data.clubObjects[this.data.clubIndex]._id
      }
    }).then(
      resultList => {
        console.log(resultList);
        wx.showModal({
          content: 'Set the Meeting Successfully!',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              wx.redirectTo({
                url: `../meetingList/meetingList`,
              });
            }
          }
        });
        // wx.requestSubscribeMessage({
        //   tmplIds: ['oWQ-cU0POIsm1y1KhlWnZX4sIaMaPiO4BJUjKBv-va0'] // 订阅的模板ID
        // })
        // wx.cloud.callFunction({
        //   name: 'openapi',
        //   data: {
        //     openId: app.globalData.myOpenId
        //   },
        // })
      }
    )
  },
  bindformInput: function (e) {
    this.setData({
      [e.target.id]: e.detail.value
    });
  },
  radioChange: function (e) {
    this.setData({
      type: e.detail.value
    });
    var typeItems = this.data.typeItems;
    for (var i = 0, len = typeItems.length; i < len; ++i) {
      typeItems[i].checked = typeItems[i].value == e.detail.value;
    }

    this.setData({
      typeItems: typeItems
    });
  },
  getAllClubs: function () {
    return db.collection('clubs').get().then(res => {
      const clubs = [];
      for (let club of res.data) {
        clubs.push(club.name);
      }
      this.setData({
        clubs,
        clubObjects: res.data
      });
    })
  },

  bindClubChange: function (e) {
    console.log('picker account 发生选择改变，携带值为', e.detail.value);

    this.setData({
      clubIndex: e.detail.value
    });
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    const app = getApp();

    app.checkLogin().then(res => {
      this.getAllClubs().then(res => {
        const meetingId = options.id;
        if (meetingId) {

          db.collection('meetings').doc(meetingId).get().then(res => {
            for (let typeItem of this.data.typeItems) {
              if (typeItem.value == res.data.type) {
                typeItem.checked = true;
              } else {
                typeItem.checked = false;
              }
            }

            let clubIndex = -1;
            for (let i = 0; i < this.data.clubObjects.length; i++) {
              const club = this.data.clubObjects[i];
              if (club._id == res.data.clubId) {
                clubIndex = i;
              }
            }
            this.setData({
              loading: false,
              meetingId,
              isUpdate: true,
              club: res.data.club,
              number: res.data.number,
              venue: res.data.venue,
              startTime: res.data.startTime,
              endTime: res.data.endTime,
              date: res.data.date,
              type: res.data.type,
              theme: res.data.theme ? res.data.theme : '',
              typeItems: [...this.data.typeItems],
              clubIndex,
            });
          });
        } else {
          this.setData({
            loading: false
          })
        }
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