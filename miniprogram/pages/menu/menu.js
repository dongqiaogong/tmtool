// miniprogram/pages/menu/menu.js
Page({

  /**
   * Page initial data
   */
  data: {
    meetingInfo: {},
    loading: true,
    grids: null
  },
  goToFunctionPage(e) {
    console.log(e);
    const item = e.currentTarget.dataset.item;
    if (item.canExpired && this.data.expired || item.disabled) {
      return
    } else {
      wx.navigateTo({
        url: `../${item.page}/${item.page}?id=${this.data.meetingId}`,
      })
    }
  },

  getDefaultMenuItems: function () {
    const menuItems = [{
      text: 'Take Role',
      icon: 'test',
      page: 'takeRole',
      isAdmin: false,
      canExpired: true,
    }, {
      text: 'Speech',
      icon: 'test(1)',
      page: 'speechList',
      isAdmin: false,
      canExpired: true,
    }, {
      text: 'Agenda',
      icon: 'checklist',
      page: 'agenda',
      isAdmin: false,
      canExpired: true,
    }, {
      text: 'Table Topic',
      icon: 'conversation',
      page: 'tableTopic',
      isAdmin: false,
    }, {
      text: 'Vote',
      icon: 'edit-tools',
      page: 'vote',
      isAdmin: false,
      canExpired: true,
    }, {
      text: 'Vote Result',
      icon: 'print',
      page: 'voteReport',
      isAdmin: false,
    }, {
      text: 'Management',
      icon: 'setup',
      page: 'meetingManage',
      isAdmin: true,
    }, {
      text: 'Timer Tool',
      icon: 'alarm_clock',
      page: 'timer',
      isAdmin: false,
      canExpired: true,
      disabled: true,
    }, {
      text: 'Time Report',
      icon: 'paper-plane',
      page: 'timeReport',
      isAdmin: false,
      disabled: true,
    }];
    return menuItems;
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    console.log('onLoad');
    const meetingId = options.id;
    this.setData({
      meetingId,
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
    console.log('onShow');
    
    const app = getApp();
    app.checkLogin().then(res => {
      const isAdmin = app.globalData.isAdmin;

      const db = wx.cloud.database();
      const meetings = db.collection('meetings').doc(this.data.meetingId).get().then(res => {
        const menuItems = this.getDefaultMenuItems();

        for (let menuItem of menuItems) {

          if (menuItem.isAdmin && !isAdmin) {
            menuItem.disabled = true;
          }
          if (menuItem.text == "Management"
            && app.globalData.meetingInfo.toastmasterOpenId == app.globalData.myOpenId) {
            menuItem.disabled = false;
          }
        }

        this.setData({
          loading: false,
          grids: menuItems,
        })

      });
    })

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {
    console.log('onHide');
  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {
    console.log('onUnload');
  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {
    console.log('onPullDownRefresh');
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