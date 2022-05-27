import AWS from "aws-sdk";

const sqs = new AWS.SQS();
const dynamoDb = new AWS.DynamoDB.DocumentClient();
export const pushDataToSQSToCreateUserOccasionMapping = async (data) => {
  return new Promise(async (resolve, reject) => {
    console.log("check ARN : ", process.env.OCCASION_USERS_MAPPING_QUEUE);
    console.log("data going to push ---", data);
    //https://sqs.eu-central-1.amazonaws.com/929042302465/OccasionUsersMappingQueue-dev
    //sqs.eu-central-1.amazonaws.com/929042302465/OccasionUsersMappingQueue-dev
    try {
      let result = await sqs
        .sendMessage({
          QueueUrl: process.env.OCCASION_USERS_MAPPING_QUEUE,
          MessageBody: JSON.stringify(data),
        })
        .promise();
      console.log("sqs result--", result);
      resolve("success");
    } catch (error) {
      console.log("Error in OCCASION_USERS_MAPPING", error);
      reject(error);
    }
  });
};

export const increaseMessageCounter = async ({
  occasionId,
  flag,
  receiver,
  sender,
}) => {
  let fieldToBeIncreased = "";
  let occasionReceiver = "";
  if (flag === "sendertoreceiver") {
    occasionReceiver = receiver;
    fieldToBeIncreased = "messagesForReceiver";
  } else {
    occasionReceiver = sender;
    fieldToBeIncreased = "messagesForSender";
  }
  const paramsToIncMsgCount = {
    TableName: process.env.OCCASION_TABLE,
    Key: { occasionId: occasionId, receivedBy: occasionReceiver },
    UpdateExpression: `set ${fieldToBeIncreased} = ${fieldToBeIncreased} + :inc`,
    ExpressionAttributeValues: {
      ":inc": 1,
    },
    ReturnValues: "ALL_NEW",
  };
  console.log("paramsU--", paramsToIncMsgCount);
  await dynamoDb.update(paramsToIncMsgCount).promise();
};

export const increaseMessageCounterOfTotalRead = async ({
  occasionId,
  occasionReceiver,
  readBy,
  totalMessagesRead,
}) => {
  let fieldToBeIncreased = "";
  if (occasionReceiver === readBy) {
    fieldToBeIncreased = "messagesReadByReceiver";
  } else {
    fieldToBeIncreased = "messagesReadBySender";
  }
  const paramsToIncMsgCount = {
    TableName: process.env.OCCASION_TABLE,
    Key: { occasionId: occasionId, receivedBy: occasionReceiver },
    UpdateExpression: `set ${fieldToBeIncreased} = ${fieldToBeIncreased} + :inc`,
    ExpressionAttributeValues: {
      ":inc": totalMessagesRead,
    },
    ReturnValues: "ALL_NEW",
  };
  console.log("paramsU--", paramsToIncMsgCount);
  await dynamoDb.update(paramsToIncMsgCount).promise();
};

export const occasionSentByUser = async (userId) => {
  let params = {
    TableName: process.env.OCCASION_TABLE,
    IndexName: "occasion_sentBy_Index",
    ScanIndexForward: false,
    KeyConditionExpression: "#sentBy = :sentBy",
    ExpressionAttributeNames: {
      "#sentBy": "sentBy",
    },
    ExpressionAttributeValues: {
      ":sentBy": userId,
    },
  };
  console.log(params);
  let result = await dynamoDb.query(params).promise();

  return result.Items;
};

export const occasionReceivedByUser = async (userId) => {
  let params = {
    TableName: process.env.OCCASION_TABLE,
    IndexName: "occasion_receivedBy_Index",
    ScanIndexForward: false,
    KeyConditionExpression: "#receivedBy = :receivedBy",
    ExpressionAttributeNames: {
      "#receivedBy": "receivedBy",
    },
    ExpressionAttributeValues: {
      ":receivedBy": userId,
    },
  };
  let result = await dynamoDb.query(params).promise();

  return result.Items;
};

export const clubSentOccasions = (occasions) => {
  let sharedWith = [];
  let clubedOccasions = occasions.reduce((clubObj, item) => {
    console.log(clubObj);
    sharedWith.push(item.receivedBy);
    if (clubObj[item.occasionId]) {
      clubObj[item.occasionId].msgReceivedCount += item.messagesForSender;
      clubObj[item.occasionId].msgReadCount += item.messagesReadBySender;
      clubObj[item.occasionId].newMsgCount =
        clubObj[item.occasionId].msgReceivedCount -
        clubObj[item.occasionId].msgReadCount;
      if (item.giftId) {
        clubObj[item.occasionId].giftId = item.giftId;
      }
      clubObj[item.occasionId].viewReceivedCount += item.totalViews;
      clubObj[item.occasionId].viewCheckedCount +=
        item.totalViewsCheckedBySender;
      clubObj[item.occasionId].newViewsCount =
        clubObj[item.occasionId].viewReceivedCount -
        clubObj[item.occasionId].viewCheckedCount;
      clubObj[item.occasionId].sharedWith.push(item.receivedBy);
    } else {
      clubObj[item.occasionId] = {
        occasionId: item.occasionId,
        createdAt: item.createdAt,
        mediaType: item.mediaType,
        mediaUrl: item.mediaUrl,
        msgReceivedCount: item.messagesForSender,
        msgReadCount: item.messagesReadBySender,
        newMsgCount: item.messagesForSender - item.messagesReadBySender,
        giftId: item.giftId ? item.giftId : null,
        viewReceivedCount: item.totalViews,
        viewCheckedCount: item.totalViewsCheckedBySender,
        newViewsCount: item.totalViews - item.totalViewsCheckedBySender,
        message: item.message ? item.message : null,
        sharedWith: [item.receivedBy],
        flag: "sent",
      };
    }
    return clubObj;
  }, {});

  return { clubedOccasions: Object.values(clubedOccasions), sharedWith };
};

export const formatOccasionReceived = (occasions, flag = "") => {
  return occasions.map((occasion) => {
    return {
      occasionId: occasion.occasionId,
      createdAt: occasion.createdAt,
      mediaType: occasion.mediaType,
      mediaUrl: occasion.mediaUrl,
      msgReceivedCount: occasion.messagesForReceiver,
      msgReadCount: occasion.messagesReadByReceiver,
      newMsgCount:
        occasion.messagesForReceiver - occasion.messagesReadByReceiver,
      giftId: occasion.giftId ? occasion.giftId : null,
      message: occasion.message ? occasion.message : null,
      flag: !flag ? "received" : flag,
      shareWith: [occasion.sentBy],
    };
  });
};

export const formatOccasionSent = (occasions, flag = "") => {
  return occasions.map((occasion) => {
    return {
      occasionId: occasion.occasionId,
      createdAt: occasion.createdAt,
      mediaType: occasion.mediaType,
      mediaUrl: occasion.mediaUrl,
      msgReceivedCount: occasion.messagesForSender,
      msgReadCount: occasion.messagesReadBySender,
      newMsgCount: occasion.messagesForSender - occasion.messagesReadBySender,
      viewReceivedCount: occasion.totalViews,
      viewCheckedCount: occasion.totalViewsCheckedBySender,
      newViewsCount: occasion.totalViews - occasion.totalViewsCheckedBySender,
      giftId: occasion.giftId ? occasion.giftId : null,
      message: occasion.message ? occasion.message : null,
      flag: !flag ? "sent" : flag,
      shareWith: [occasion.receivedBy],
    };
  });
};

export const occasionsBetweenTwoUsers = async (senderId, receiverId) => {
  let params = {
    TableName: process.env.OCCASION_TABLE,
    IndexName: "occasion_receivedBy_sentBy_Index",
    ScanIndexForward: false,
    KeyConditionExpression: "#receivedBy = :receivedBy and #sentBy = :sentBy",
    ExpressionAttributeNames: {
      "#receivedBy": "receivedBy",
      "#sentBy": "sentBy",
    },
    ExpressionAttributeValues: {
      ":receivedBy": receiverId,
      ":sentBy": senderId,
    },
  };
  let result = await dynamoDb.query(params).promise();

  return result.Items;
};
