
// const uuid = require('uuid');
const AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY
});
AWS.config.region = 'eu-central-1';

const sns = new AWS.SNS();

module.exports.sendNotification = async ({ data ,notificationData}) => {
  console.log('datadatadata1', data);
  var ios = [];
  var android = [];
  var notification_data = {
    data: {
      event: notificationData.event,
      event_type: notificationData.event_type,
      title: notificationData.title,
      image:notificationData.image,
      message: notificationData.message,
      body: notificationData.body,
      composed: notificationData.composed,
      badge: notificationData.badge,
      priority: notificationData.priority,
      sound: notificationData.sound
    }
  };
  var android_payload = JSON.stringify({
    default: notification_data.data.message,
    GCM: JSON.stringify(notification_data)
  });
  console.log('android_payload', android_payload);

  let androidToken = data.Items.filter(item => item.deviceType === 'android');
  if (androidToken.length) {
    androidToken.forEach(function (arn) {
      android.push(arn.EndpointArn);
    });
  }

  var params = {
    Message: android_payload,
    MessageStructure: 'json'
  };
  for (const element of android) {
    params.TargetArn = element;
    try {
      await sns.publish(params).promise();
    } catch (error) {
      throw error;
    }
  }
  var notification_data_ios = {
    aps: {
      'mutable-content': 1,
      alert: {
        title: notificationData.title,
        body: notificationData.body,
      }
    },
    event: notificationData.event,
    event_type: notificationData.event_type,
    image:notificationData.image,
    composed: notificationData.composed,
    badge: notificationData.badge,
    priority: notificationData.priority,
    sound: notificationData.sound
  };
  var ios_payload = JSON.stringify({
    APNS: JSON.stringify(notification_data_ios)
  });
  let iosToken = data.Items.filter(item => item.deviceType === 'ios');
  if (iosToken.length) {
    iosToken.forEach(function (arn) {
      ios.push(arn.EndpointArn);
    });
  }
  var ios_params = {
    Message: ios_payload,
    MessageStructure: 'json'
  };
  for (const element of ios) {
    ios_params.TargetArn = element;
    console.log('ios_params', ios_params);
    try {
      await sns.publish(ios_params).promise();
    } catch (error) {
      throw error;
    }
  }
};
