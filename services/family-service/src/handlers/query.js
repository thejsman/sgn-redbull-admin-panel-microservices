import AWS from 'aws-sdk';
import { responseHandler } from "../lib/response";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const relationshipQuery = async (event, context) => {
  try{
    const data = event.queryStringParameters;
    let params = {
      TableName: process.env.RELATIONSHIP_TABLE_NAME,
      Limit: +data.limit,
      IndexName:"relation_order-Index",
      ScanIndexForward:data.ScanIndexForward,
      KeyConditionExpression: "#relationshipIdentifier = :relationshipIdentifier",
      ExpressionAttributeNames: {
          "#relationshipIdentifier": "relationshipIdentifier",
          // "#displayOrder": "displayOrder"
      },
      ExpressionAttributeValues: {
          ":relationshipIdentifier": data.relationshipIdentifier,
          // ":sOrder": +data.sOrder,
          // ":eOrder": +data.eOrder
      }
      };

      if (data.displayOrder && +data.displayOrder>0) {
        params = {
          ...params,
          ExclusiveStartKey: {
            relationshipIdentifier: "relationship",
            displayOrder:+data.displayOrder,
            relationshipName:data.relationshipName
          }
        };
      }
    try {
      let getData = await dynamoDb.query(params).promise();
      console.log("getDatagetData",getData);
      let responseData = responseHandler({
        statusCode: 200,
        message: 'Relationship List',
        data: getData
      });
      return responseData;
    } catch (error) {
        console.log("error",error);
      let responseData = responseHandler({
        statusCode: 502,
        message: "Error in query Data",
        data: {}
      });
      console.log('responseData', responseData);
      return responseData;
    }
  }catch(error){
    return responseHandler({
      statusCode: 500,
      message: 'Internal Server Error',
      data: {}
    });
  }
};

export const handler = relationshipQuery;
