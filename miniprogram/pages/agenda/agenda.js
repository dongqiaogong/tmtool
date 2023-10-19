// miniprogram/pages/agenda/agenda.js
const db = wx.cloud.database();
Page({
  /**
   * Page initial data
   */
  data: {
    items: null,
    loading: true
  },

  loadRoleList: function (meetingId) {
    const app = getApp();
    const speeches = db.collection('speeches').where({
      meetingId
    }).get();
    const roles = db.collection('roles').where({
      meetingId
    }).get();
    const getAgendaItems = wx.cloud.callFunction({
      name: 'agendas',
      data: {
        clubId: app.globalData.meetingInfo.clubId
      }
    });
    Promise.all([speeches, roles, getAgendaItems]).then(res => {
      const speechData = res[0].data;
      const roleData = res[1].data;
      const agendaItems = res[2].result.data;

      const regularAgenda_Part_1 = agendaItems.filter(item => item.type == 'TOP').sort((a, b) => a.index - b.index);
      const regularAgenda_Part_2 = agendaItems.filter(item => item.type == 'BOTTOM').sort((a, b) => a.index - b.index);
      const speech_part = agendaItems.filter(item => item.type == 'SPEECH').sort((a, b) => a.index - b.index);
      const pse_part = agendaItems.filter(item => item.type == 'PSE').sort((a, b) => a.index - b.index);

      console.log(regularAgenda_Part_1);
      console.log(regularAgenda_Part_2);

      const meetingAgenda = [];
      let toastmasterOwner = null;
      for (let item of regularAgenda_Part_1) {
        if (item.noNeedOwner == true) {
          meetingAgenda.push(item);
        } else {
          for (let role of roleData) {
            if (role.roleName == 'Toastmaster' || role.roleName == '总主持人') {
              toastmasterOwner = role.roleOwner;
            }
            if (item.role == role.roleName && role.roleOwner) {
              console.log(item.role, role.roleName);
              item.owner = role.roleOwner;
              meetingAgenda.push(item);
            }
          }
        }
      }
      for (let i = 0; i < speechData.length; i++) {
        const item = speechData[i];
        for (let j = 0; j < speech_part.length; j++) {
          const agenda = speech_part[j];
          console.log(agenda);
          if (agenda.noNeedOwner == true) {
            meetingAgenda.push(agenda);
            continue;
          }
          let owner = item.owner;
          let event = item.title;
          if (agenda.role == 'Toastmaster'  || agenda.role == '总主持人') {
            owner = toastmasterOwner;
            event = `${agenda.event}${agenda.needIndex ? ` - ${i + 1}` : ''}`
          }

          meetingAgenda.push({
            'event': event,
            'role': agenda.role,
            'owner': owner,
            'green': agenda.role == 'Toastmaster' || agenda.role == '总主持人' ? agenda.green : item.green,
            'yellow': agenda.role == 'Toastmaster' || agenda.role == '总主持人' ? agenda.yellow : item.yellow,
            'red': agenda.role == 'Toastmaster' || agenda.role == '总主持人' ? agenda.red : item.red,
          });
        }
      }

      // add evaluation part 
      for (let i = 0; i < speechData.length; i++) {
        const item = speechData[i];
        for (let j = 0; j < pse_part.length; j++) {
          const agenda = pse_part[j];

          let owner = item.evaluator;
          if (agenda.role == 'Toastmaster' || agenda.role == '总主持人') {
            owner = toastmasterOwner;
          }

          meetingAgenda.push({
            'event': `${agenda.event}${agenda.needIndex ? ` - ${i + 1}` : ''}`,
            'role': agenda.role,
            'owner': owner,
            'green': agenda.green,
            'yellow': agenda.yellow,
            'red': agenda.red
          });
        }
      }

      for (let item of regularAgenda_Part_2) {
        if (item.noNeedOwner == true) {
          meetingAgenda.push(item);
          continue;
        }
        for (let role of roleData) {
          if (item.role == role.roleName && role.roleOwner) {
            console.log(item.role, role.roleName);
            item.owner = role.roleOwner;
            meetingAgenda.push(item);
          }
        }
      }
      console.log("meetingAgenda", meetingAgenda);

      const startTime = app.globalData.meetingInfo.startTime;
      meetingAgenda[0].time = this.subtractionTime(startTime, meetingAgenda[0].red);
      for (let i = 1; i < meetingAgenda.length; i++) {
        meetingAgenda[i].time = this.getStartTime(meetingAgenda[i - 1].time, meetingAgenda[i - 1].red);
      }

      this.setData({
        items: meetingAgenda,
        loading: false
      });
    });
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    const meetingId = options.id;
    const app = getApp();
    app.checkLogin().then(res => {
      this.setData({
        meetingId
      });
      this.loadRoleList(meetingId);
    })
  },

  getStartTime: function (prevStartTime, PrevDuration) {

    const temp = prevStartTime.split(':');
    let [hour, min] = temp;
    min = parseInt(min) + parseInt(PrevDuration);
    if (min >= 60) {
      min = min - 60;
      hour = parseInt(hour) + 1;
    }
    if (min < 10) {
      min = '0' + min;
    }
    return `${hour}:${min}`;
  },

  subtractionTime: function (time, minus) {
    const temp = time.split(':');
    let [hour, min] = temp;
    min = parseInt(min) - parseInt(minus);
    if (min < 0) {
      hour -= 1;
      min += 60;
    }
    if (min < 10) {
      min = '0' + min;
    }
    return `${hour}:${min}`;
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