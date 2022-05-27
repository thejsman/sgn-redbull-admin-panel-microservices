'use strict'

const uuid = require('uuid')
const AWS = require('aws-sdk')
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY
})
AWS.config.region = 'eu-central-1'

const sns = new AWS.SNS()

module.exports.sendNotification = async ({ data, notificationData }) => {
  var notification_data = {
    data: {
      event: notificationData.event,
      event_type: notificationData.event_type,
      title: notificationData.title,
      image: notificationData.image,
      message: notificationData.message,
      body: notificationData.body,
      composed: notificationData.composed,
      badge: notificationData.badge,
      priority: notificationData.priority,
      sound: notificationData.sound
    }
  }
  var android_payload = JSON.stringify({
    default: notification_data.data.message,
    GCM: JSON.stringify(notification_data)
  })

  var params = {
    Message: android_payload,
    MessageStructure: 'json'
  }

  if (data.deviceType === 'android') {
    try {
      params.TargetArn = data.EndPointArn
      await sns.publish(params).promise()
    } catch (error) {
      throw error
    }
  }
  var notification_data_ios = {
    aps: {
      'mutable-content': 1,
      alert: {
        title: notificationData.title,
        body: notificationData.body
      }
    },
    event: notificationData.event,
    event_type: notificationData.event_type,
    image: notificationData.image,
    composed: notificationData.composed,
    badge: notificationData.badge,
    priority: notificationData.priority,
    sound: notificationData.sound
  }
  var ios_payload = JSON.stringify({
    APNS: JSON.stringify(notification_data_ios)
  })

  var ios_params = {
    Message: ios_payload,
    MessageStructure: 'json'
  }

  if (data.deviceType === 'ios') {
    try {
      ios_params.TargetArn = data.EndPointArn
      await sns.publish(ios_params).promise()
    } catch (error) {
      throw error
    }
  }
}
