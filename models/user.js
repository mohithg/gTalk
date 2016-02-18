var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');
var messages = require('./messages');
var model = mongoose.model('users', new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  online: {
    type: Boolean
  },
  peers: [{
    peerid: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    status: {
      type: Number,
      required: true
    }
  }]
}));

model.getAll = function(cb) {
  model.find({}, {
    __v: false,
    password: false
  }, function(err, data) {
    cb(err, data);
  });
};

model.getOneByUsername = function(uname, cb) {
  model.findOne({
    username: uname
  }, {
    __v: false,
    password: false
  }, function(err, data) {
    cb(err, data);
  });
};

model.getOneById = function(id, cb) {
  model.findOne({
    _id: id
  }, {
    __v: false,
    password: false
  }, function(err, data) {
    cb(err, data);
  });
}

model.signIn = function(data, cb) {
  model.findOne({
    username: data.username
  }, {
    __v: false
  }, function(err, data) {
    cb(err, data);
  });
};
model.signUp = function(data, cb) {
  var u = new this(data);
  u.save(function(err) {
    cb(err);
  });
};

model.sendReq = function(data, cb) {
  model.findOneAndUpdate({
    _id: data.from
  }, {
    $addToSet: {
      peers: {
        peerid: data.to,
        status: 1
      }
    }
  }, {
    upsert: false
  }, function(error, userData) {
    if (!error) {
      model.findOneAndUpdate({
        _id: data.to
      }, {
        $addToSet: {
          peers: {
            peerid: data.from,
            status: 2
          }
        }
      }, {
        upsert: false
      }, function(error, userData) {
        if(error) console.log(error);
      });
    }
    cb(error,userData);
  });
};

model.cancelReq = function(data, cb) {
  model.findOneAndUpdate({
    _id: data.from
  }, {
    $pull: {
      peers: {
        peerid: data.to
      }
    }
  }, function(error) {
    if (!error) {
      model.findOneAndUpdate({
        _id: data.to
      }, {
        $pull: {
          peers: {
            peerid: data.from
          }
        }
      }, function(rr) {
        if (rr)console.log(rr);
      });
    }
    cb(error);
  });

};

model.acceptReq = function(data, cb) {
  model.findOneAndUpdate({
    '_id': data.from,
    'peers.peerid': data.to
  }, {
    $set: {
      'peers.$.status': 3
    }
  }, function(err, userData) {
    if (!err) {
      model.findOneAndUpdate({
        '_id': data.to,
        'peers.peerid': data.from
      }, {
        $set: {
          'peers.$.status': 3
        }
      }, function(err) {
        if(err)console.log(err);
      });
    }
    cb(err);
  });
};

model.rejectReq = function(data, cb) {
  model.findOneAndUpdate({
    _id: data.from
  }, {
    $pull: {
      peers: {
        peerid: data.to
      }
    }
  }, function(error) {
    if (!error) {
      model.findOneAndUpdate({
        _id: data.to
      }, {
        $pull: {
          peers: {
            peerid: data.from
          }
        }
      }, function(error) {
        if(error) console.log(error);
      });
    }
    cb(error);
  });
};

model.setOnline = function(obj, onlineStatus, cb)

{
  model.findOneAndUpdate(obj, {
    $set: {
      online: onlineStatus
    }
  }, {
    upsert: false
  }, function(error, data) {
    cb(error);
  });
}

module.exports = model;
