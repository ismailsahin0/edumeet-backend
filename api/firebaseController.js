const admin = require('./firebase');

class firebaseController {
  static async createUser(email, password) {
    let userId;
    let response = await admin.auth().createUser({
      email: email,
      emailVerified: false,
      disabled: false,
      password: password
    })
      .then(function (userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log('Successfully created new user:', userRecord.uid);
        userId = userRecord.uid;
      })
      .catch(function (error) {
        console.log('Error creating new user:', error);
        return error;
      });
    if (userId) {
      return ({ success: true, userId: userId });
    } else {
      return ({ success: false, error: response });
    }
  }

  static async deleteUser(uid) {
    let response = await admin.auth().deleteUser(uid)
      .then(function (userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log('User deleted for rollback', uid);
      })
      .catch(function (error) {
        console.log('Error deleting user:', error);
        return error;
      });
    if (uid) {
      return ({ success: true, userId: uid });
    } else {
      return ({ success: false, error: response });
    }
  }

  static async updateUser(uid, info) {
    return await admin.auth().updateUser(uid, info)
      .then(function (userRecord) {
        console.log(`Successfully fetched user data: ${userRecord.toJSON()}`);
      })
      .catch(function (error) {
        console.log('Error fetching user data:', error);
      });
  }

  static async getUserByEmail(email) {
    return await admin.auth().getUserByEmail(email)
      .then(function (userRecord) {
        console.log(`Successfully fetched user data: ${userRecord.toJSON()}`);
        return userRecord;
      })
      .catch(function (error) {
        console.log('Error fetching user data:', error);
      });
  }
}
module.exports = firebaseController;