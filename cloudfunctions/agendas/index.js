// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  return db.collection('agendas').where({
    clubId: event.clubId
  }).get().then(res => {
    return res;
  })
}