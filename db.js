const Sequelize = require('sequelize')
var db =  new Sequelize(process.env.DATABASE_URL, {
  logging: false
}) 

var User = db.define('user', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  isMentor : {
    type : Sequelize.BOOLEAN,
    defaultValue : false
  }
})

var Award = db.define('award', {
  name : {
    type : Sequelize.STRING
  }
})

User.findUsersViewModel = function() {
  return this.findAll({
    include: [
     { model : Award },
     { model : User, as : 'Mentor'}
   ],
   order:  [['createdAt', 'ASC']]
  })
}

User.findMentors = function() {
  return this.findAll({
    where : { isMentor : true}
  })
}

User.destroyById = function(id) {
  return User.destroy ({
    where : { id : id }
  })
}

User.generateAward = function(id) {
  var phrase = require('faker').company.catchPhrase()
  return Award.create({
    name : phrase,
    userId : id
  })
  .then(()=> {
    return Award.findAll({
      where : { userId : id}
    })
  })
  .then((awards)=>{
    if (awards.length > 1) {
      return User.update({
        isMentor : true
      }, {
        where : { id : id}
      })
    }
  })
}

User.removeAward = function(userId, awardId) {
  return Award.destroy({
    where : { id : awardId}
  })
  .then(()=> {
    return Award.findAll({
      where : { userId : userId}
    })
  })
  .then((awards)=>{
    if (awards.length < 2) {
      return User.update({
        isMentor : false
      }, {
        where : { id : userId}
      })
      .then(()=> {
        return User.update({
          MentorId : null
        }, {
          where : { MentorId : userId}
        })
      })
    }
  })
}

User.updateUserFromRequestBody = function(id, obj) {
  return User.findAll({
    where : { name : obj.select }
  })
  .then((row)=> {
    return User.update({
      MentorId : row[0]['id']
    }, {
      where : { id : id}
    })
  })
}

Award.belongsTo(User)
User.hasMany(Award)
User.belongsTo(User, { as : 'Mentor' })

module.exports = {
  models : {
    User,
    Award
  }
}
