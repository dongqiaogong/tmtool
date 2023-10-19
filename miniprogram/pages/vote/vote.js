// miniprogram/pages/vote/vote.js
const db = wx.cloud.database();

Page({

  /**
   * Page initial data
   */
  data: {
    loading: true,
    hasVoted: false,
    meetingId: null,
    preparedSpeakers: null,
    functionRoles: null,
    evaluators: null,
    tableTopicSpeakers: null,
    all: null,
    // preparedSpeakers: [
    //   { name: 'cell standard', value: '0' },
    //   { name: 'cell standard', value: '1' }
    // ],
  },

  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value);
    const datasetName = e.currentTarget.dataset.dataset;
    console.log(datasetName);

    var dataset = this.data[datasetName];
    for (var i = 0, len = dataset.length; i < len; ++i) {
      dataset[i].checked = dataset[i].value == e.detail.value;
    }

    this.setData({
      [datasetName]: dataset
    });
  },

  loadData: function () {
    const getSpeeches = db.collection('speeches').where({
      meetingId: this.data.meetingId
    }).get();
    const getRoles = db.collection('roles').where({
      meetingId: this.data.meetingId
    }).get();
    const getTabletopics = db.collection('tableTopics').where({
      meetingId: this.data.meetingId
    }).get();
    const app = getApp();
    console.log(app.globalData.myOpenId);
    const getMyVotes = db.collection('votes').where({
      meetingId: this.data.meetingId,
      _openid: app.globalData.myOpenId
    }).get();

    Promise.all([getSpeeches, getRoles, getTabletopics, getMyVotes]).then(res => {
      const speeches = res[0].data;
      const roles = res[1].data;
      const tableTopics = res[2].data;
      const myVotes = res[3].data;

      let hasVoted = false;
      const voteMap = {};
      console.log(myVotes);
      if (myVotes.length) {
        hasVoted = true;
        this.setData({
          hasVoted
        });
        for (let vote of myVotes) {
          voteMap[vote.type] = vote;
        }
        console.log(voteMap);
      }

      const all = [];

      const preparedSpeakers = [];
      for (let item of speeches) {
        preparedSpeakers.push({
          name: item.owner, value: item._id, openId: item.ownerOpenId,
          checked: hasVoted && voteMap['Best Prepared Speaker'].voteToOpenId == item.ownerOpenId
        });
        all.push({
          name: item.owner, value: item.owner, openId: item.ownerOpenId,
          checked: hasVoted && voteMap['Most Improved'].voteToOpenId == item.ownerOpenId
        });

      }

      const functionRoles = [];
      for (let item of roles) {
        if (item.roleType == 'function' && item.roleOwner) {
          functionRoles.push({
            name: `${item.roleOwner} - ${item.roleName}`, value: item._id, openId: item.ownerOpenId,
            checked: hasVoted && voteMap['Best Function Role'].voteToOpenId == item.ownerOpenId
          });
          if (!all.find((e) => e.name == item.roleOwner)) {
            all.push({
              name: item.roleOwner, value: item.roleOwner, openId: item.ownerOpenId,
              checked: hasVoted && voteMap['Most Improved'].voteToOpenId == item.ownerOpenId
            });
          }
        }
      };

      const evaluators = [];
      for (let item of speeches) {
        if (item.evaluator) {
          evaluators.push({
            name: `${item.evaluator} - Prepared Speech Evaluator`, value: item._id, openId: item.evaluatorOpenId,
            checked: hasVoted && voteMap['Best Evaluator'].voteToOpenId == item.evaluatorOpenId
          });
          if (!all.find((e) => e.name == item.evaluator)) {
            all.push({
              name: item.evaluator, value: item.evaluator, openId: item.evaluatorOpenId,
              checked: hasVoted && voteMap['Most Improved'].voteToOpenId == item.evaluatorOpenId
            });
          }
        }
      }
      for (let item of roles) {
        if (item.roleType == 'evaluator' && item.roleOwner) {
          evaluators.push({
            name: `${item.roleOwner} - ${item.roleName}`, value: item._id, openId: item.ownerOpenId,
            checked: hasVoted && voteMap['Best Evaluator'].voteToOpenId == item.ownerOpenId
          });
          if (!all.find((e) => e.name == item.roleOwner)) {
            all.push({
              name: item.roleOwner, value: item.roleOwner, openId: item.ownerOpenId,
              checked: hasVoted && voteMap['Most Improved'].voteToOpenId == item.ownerOpenId
            });
          }
        }
      };

      const tableTopicSpeakers = [];
      for (let item of tableTopics) {
        tableTopicSpeakers.push({
          name: item.owner, value: item._id, openId: item.ownerOpenId,
          checked: hasVoted && voteMap['Best Table Topic Speaker'].voteToOpenId == item.ownerOpenId
        });
        if (!all.find((e) => e.name == item.owner)) {
          all.push({
            name: item.owner, value: item.owner, openId: item.ownerOpenId,
            checked: hasVoted && voteMap['Most Improved'].voteToOpenId == item.ownerOpenId
          });
        }
      }

      this.setData({
        preparedSpeakers,
        functionRoles,
        evaluators,
        tableTopicSpeakers,
        all,
        loading: false
      })

    })
  },

  submit: function() {
    const promiseArray = [];
    
    const datasets = [
      {dataset: 'preparedSpeakers', type: 'Best Prepared Speaker'},
      {dataset: 'functionRoles', type: 'Best Function Role'},
      {dataset: 'evaluators', type: 'Best Evaluator'},
      {dataset: 'tableTopicSpeakers', type: 'Best Table Topic Speaker'},
      {dataset: 'all', type: 'Most Improved'},
    ]

    for (let dataset of datasets) {
      promiseArray.push(this.vote(dataset.dataset, dataset.type));
    }
    
    Promise.all(promiseArray).then(res=>{
      wx.showModal({
        content: 'Vote Successfully!',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            wx.redirectTo({
              url: `../menu/menu?id=${this.data.meetingId}`,
            });
          }
        }
      });
    })
    
  },

  vote: function(dataset, type){
    const best = this.getChecked(this.data[dataset]);
    const promise = db.collection('votes').add({
      data: {
        meetingId: this.data.meetingId,
        type: type,
        voteTo: best.name,
        voteToOpenId: best.openId,
        itemId: best.value
      }
    });
    return promise;
  },

  getChecked: function(dataset) {
    for (let item of dataset) {
      if (item.checked) {
        return item;
      }
    }
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