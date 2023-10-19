// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const conditions = {
    clubId: event.clubId,
  }
  if (event.type == 'Regular') {
    conditions.isRegular = true;
  } else {
    conditions.isMarathon = true;
  }
  const roles = await db.collection('club-roles').where(conditions).get();

  const meetingRoles = [];
  for (let role of roles.data) {
    const meetingRole = {
      index: role.index,
      meetingId: event.meetingId,
      roleName: role.roleName,
      roleType: role.roleType
    }
    meetingRoles.push(meetingRole);
  }
  console.log(meetingRoles);

  return db.collection('roles').add({
    data: meetingRoles
  })

}