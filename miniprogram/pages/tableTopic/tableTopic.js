// miniprogram/pages/tableTopic/tableTopic.js
const db = wx.cloud.database();
Page({

  /**
   * Page initial data
   */
  data: {
    meetingId: null,
    showAddInput: false,
    members: null,

    memberObjects: null,
    memberIndex: -1,
    list: null,
    searchResultList: null,
    loading: true,
    keyword: '',
    guestName: '',
    showSearchResult: false,
  },

  bindKeywordInput: function (e) {
    this.setData({
      keyword: e.detail.value,
    })
  },

  bindGuestNameInput: function (e) {
    this.setData({
      guestName: e.detail.value
    })
  },


  showAddInput: function () {
    this.setData({
      showAddInput: true
    })
  },

  bindMemberChange: function (e) {
    console.log('picker account 发生选择改变，携带值为', e.detail.value);

    this.setData({
      memberIndex: e.detail.value
    });
  },

  add: function () {
    if (this.data.memberIndex == -1) {
      this.setData({
        showAddInput: false
      });
      return;
    }
    db.collection('tableTopics').add({
      data: {
        meetingId: this.data.meetingId,
        owner: this.data.memberObjects[this.data.memberIndex].realname,
        ownerOpenId: this.data.memberObjects[this.data.memberIndex]._openid,
      }
    }).then(res => {
      this.setData({
        showAddInput: false,
        memberIndex: -1,
        keyword: "",
        searchResultList: null,
        showSearchResult: false,
        guestName: ''
      });
      this.getTableTopicSpeakerList();
    })
  },

  addGuest: function () {
    db.collection('tableTopics').add({
      data: {
        meetingId: this.data.meetingId,
        owner: this.data.guestName,
        ownerOpenId: '',
      }
    }).then(res => {
      this.setData({
        showAddInput: false,
        memberIndex: -1,
        keyword: "",
        searchResultList: null,
        showSearchResult: false,
        guestName: ''
      });
      this.getTableTopicSpeakerList();
    })
  },

  getTableTopicSpeakerList: function () {
    this.setData({
      loading: true
    });
    db.collection('tableTopics').where({
      meetingId: this.data.meetingId
    }).get().then(res => {
      this.setData({
        list: res.data,
        loading: false
      })
    })
  },

  searchMembers: function () {
    const keyword = this.data.keyword;
    console.log(keyword);
    if (keyword === '') {
      wx.showModal({
        content: 'Please type the name of the member for search',
        showCancel: false
      });
      return;
    }

    this.setData({
      loading: true
    });
    db.collection('members').where({
      realname: db.RegExp({
        regexp: keyword,
        options: 'i',
      })
    }).get().then((res) => {
      console.log(res);
      this.setData({
        searchResultList: res.data,
        loading: false,
        showSearchResult: true
      })
    });
  },

  getAllMembers: function () {
    wx.cloud.callFunction({
      name: 'getAllMembers'
    }).then(res => {
      const members = [];
      for (let member of res.result.data) {
        members.push(member.realname);
      }
      this.setData({
        members,
        memberObjects: res.result.data
      });
    })
  },

  deleteSpeaker(e) {
    wx.showModal({
      title: 'Alert',
      content: 'Are you sure you want to delete the speecher?',
      confirmText: "Confirm",
      cancelText: "Cancel",
      success: (res) => {
        console.log(res);
        if (res.confirm) {
          const speaker = e.currentTarget.dataset.speaker;
          db.collection('tableTopics').doc(speaker._id).remove().then(res => {
            wx.showToast({
              title: 'Successfully!',
              icon: 'success',
              duration: 3000
            });
            this.getTableTopicSpeakerList();
          })
        } else {
          // console.log('用户点击辅助操作')
        }
      }
    });
    const app = getApp();
    const promiseArray = [];
    if (role.roleName == 'Toastmaster') {
      const updateMeeting = db.collection('meetings').doc(this.data.meetingId).update({
        data: {
          toastmasterOpenId: ''
        }
      });
      promiseArray.push(updateMeeting);
      app.globalData.meetingInfo.toastmasterOpenId = '';
    }

    const updateRole = db.collection('roles').doc(role._id).update({
      data: {
        roleOwner: "",
        ownerOpenId: ""
      }
    });

    promiseArray.push(updateRole);

    Promise.all(promiseArray).then(res => {
      console.log(res);
      if (res[0].stats.updated == 1) {
        wx.showToast({
          title: 'Successfully!',
          icon: 'success',
          duration: 3000
        });
        this.loadRoleList(this.data.meetingId);
      } else {
        wx.showToast({
          title: 'Failed!',
          icon: 'cancel',
          duration: 3000
        });
      }
    })
  },

  addSpeakerFromSearchResultList: function (e) {
    const speaker = e.currentTarget.dataset.speaker;
    db.collection('tableTopics').add({
      data: {
        meetingId: this.data.meetingId,
        owner: speaker.realname,
        ownerOpenId: speaker._openid,
      }
    }).then(res => {
      this.setData({
        showAddInput: false,
        memberIndex: -1,
        keyword: "",
        searchResultList: null,
        showSearchResult: false,
        guestName: ''
      });
      this.getTableTopicSpeakerList();
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
      this.getTableTopicSpeakerList();
      this.getAllMembers();
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