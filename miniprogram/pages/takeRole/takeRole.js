// miniprogram/pages/takeRole/takeRole.js
const db = wx.cloud.database();

Page({

  /**
   * Page initial data
   */
  data: {
    loading: true,
    roles: null,
    meetingId: null,
    userName: null,
    isAdmin: false,
    myOpenId: null,
    test: null,
  },

  takeRole(e) {
    const app = getApp();
    const role = e.target.dataset.role;
    const roleOwner = app.globalData.userName;
    const promiseArray = [];
    if (role.roleName == 'Toastmaster') {
      const updateMeeting = db.collection('meetings').doc(this.data.meetingId).update({
        data: {
          toastmasterOpenId: app.globalData.myOpenId
        }
      });
      promiseArray.push(updateMeeting);
      app.globalData.meetingInfo.toastmasterOpenId = app.globalData.myOpenId;
    }

    const updateRole = db.collection('roles').doc(role._id).update({
      data: {
        roleOwner: roleOwner,
        ownerOpenId: app.globalData.myOpenId
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

  cancelRole(e) {
    const role = e.target.dataset.role;
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

  loadRoleList: function (meetingId) {
    db.collection('roles').where({
      meetingId
    }).get().then(res => {
      console.log(res);
      let roleData = res.data;
      // roleData = roleData.filter(role => role.roleType !== 'speaker')
      console.log(roleData);
      roleData.sort((a, b) => a.index - b.index);
      console.log(roleData);
      this.setData({
        roles: roleData,
        loading: false
      })
    });
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    const app = getApp();
    app.checkLogin().then(res => {
      const meetingId = options.id;
      this.setData({
        meetingId,
        userName: app.globalData.userName,
        isAdmin: app.globalData.isAdmin,
        myOpenId: app.globalData.myOpenId
      });
      this.loadRoleList(meetingId);
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