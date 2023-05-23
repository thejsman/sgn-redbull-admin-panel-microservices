/*eslint no-mixed-spaces-and-tabs: ["error", "smart-tabs"]*/

import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const createVoucher = async (voucher) => {
  const timestamp = new Date().getTime();
  const params = {
    ...voucher,
    createdAt: timestamp,
  };
  await dynamodb
    .put({
      TableName: process.env.VOUCHER_TABLE_NAME,
      Item: params,
    })
    .promise();
};

export const voucherList = async (data) => {
  let params = {
    TableName: process.env.VOUCHER_TABLE_NAME,
    Limit: +data.limit,
    IndexName: "country-voucherStatus-Index",
    KeyConditionExpression:
      "#country = :country and #voucherStatus = :voucherStatus",
    ExpressionAttributeNames: {
      "#country": "country",
      "#voucherStatus": "voucherStatus",
    },
    ExpressionAttributeValues: {
      ":country": data.country,
      ":voucherStatus": data.voucherStatus,
    },
  };
  if (data.pk !== "null") {
    params = {
      ...params,
      ExclusiveStartKey: {
        pk: data.pk,
        couponVoucherId: data.couponVoucherId,
      },
    };
  }

  try {
    return await dynamodb.query(params).promise();
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

export const voucherScan = async (data) => {
  let params = {
    TableName: process.env.VOUCHER_TABLE_NAME,
    Limit: +data.limit,
  };
  // if (data.pk !== "null") {
  // 	params = {
  // 		...params,
  // 		ExclusiveStartKey: {
  // 			pk: data.pk,
  // 			couponVoucherId: data.couponVoucherId,
  // 		},
  // 	};
  // }

  try {
    return await dynamodb.scan(params).promise();
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

export const getSingleVoucher = async (data) => {
  console.log("data", data);
  let params = {
    TableName: process.env.VOUCHER_TABLE_NAME,
    IndexName: "productName-Index",
    Limit: +data.limit,
    KeyConditionExpression: "#productName=:productName",
    ExpressionAttributeNames: {
      "#productName": "productName",
    },
    ExpressionAttributeValues: {
      ":productName": data.productName,
    },
  };
  if (data.pk !== "null") {
    params = {
      ...params,
      ExclusiveStartKey: {
        pk: data.pk,
        couponVoucherId: data.couponVoucherId,
        productName: data.productName,
      },
    };
  }
  try {
    return await dynamodb.query(params).promise();
  } catch (error) {
    throw error;
  }
};

export const getSingleVoucherByPk = async (data) => {
  console.log("data", data);
  let params = {
    TableName: process.env.VOUCHER_TABLE_NAME,
    KeyConditionExpression: "#pk=:pk",
    ExpressionAttributeNames: {
      "#pk": "pk",
    },
    ExpressionAttributeValues: {
      ":pk": data.pk,
    },
  };
  // if (data.couponVoucherId !== "null") {
  // 	params = {
  // 		...params,
  // 		ExclusiveStartKey: {
  // 			pk: data.pk,
  // 			couponVoucherId: data.couponVoucherId,
  // 		},
  // 	};
  // }
  try {
    return await dynamodb.query(params).promise();
  } catch (error) {
    throw error;
  }
};

export const getVoucherByVoucherId = async (data) => {
  console.log("data", data);
  let params = {
    TableName: process.env.VOUCHER_TABLE_NAME,
    IndexName: "couponVoucherId-Index",
    KeyConditionExpression: "#couponVoucherId = :couponVoucherId",
    ExpressionAttributeNames: {
      "#couponVoucherId": "couponVoucherId",
    },
    ExpressionAttributeValues: {
      ":couponVoucherId": data.couponVoucherId,
    },
  };
  try {
    return await dynamodb.query(params).promise();
  } catch (error) {
    throw error;
  }
};

export const deleteVoucher = async (data) => {
  console.log("data", data);
  let params = {
    TableName: process.env.VOUCHER_TABLE_NAME,
    Key: {
      pk: data.pk,
      couponVoucherId: data.couponVoucherId,
    },
  };
  console.log("deleteVoucher params", params);
  try {
    return await dynamodb.delete(params).promise();
  } catch (error) {
    throw error;
  }
};

export const bulkUpdateVouchers = async (data) => {
  let params = {};
  params = {
    TableName: process.env.VOUCHER_TABLE_NAME,
    Key: {
      pk: data.pk,
      couponVoucherId: data.couponVoucherId,
    },
    ReturnValues: "ALL_NEW",
  };

  params = {
    ...params,
    ExpressionAttributeNames: {
      "#country": "country",
      "#voucherStatus": "voucherStatus",
    },
    ExpressionAttributeValues: {
      ":country": data.country,
      ":voucherStatus": "notArchived",
    },
    UpdateExpression:
      "SET #country = :country, #voucherStatus = :voucherStatus",
  };
  // console.log("params", params);
  try {
    let updateData = await dynamodb.update(params).promise();
    return updateData;
  } catch (error) {
    throw error;
  }
};

export const updateVoucherStatus = async (data) => {
  let params = {
    TableName: process.env.VOUCHER_TABLE_NAME,
    Key: {
      pk: data.pk,
      couponVoucherId: data.couponVoucherId,
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": data.status,
    },
    UpdateExpression: "SET #status = :status",
    ReturnValues: "ALL_NEW",
  };
  // console.log("params", params);
  try {
    let updateData = await dynamodb.update(params).promise();
    return updateData;
  } catch (error) {
    throw error;
  }
};

export const updateVoucherValidTill = async (data, validTill) => {
  let params = {
    TableName: process.env.VOUCHER_TABLE_NAME,
    Key: {
      pk: data.pk,
      couponVoucherId: data.couponVoucherId,
    },
    ExpressionAttributeNames: {
      "#validTill": "validTill",
    },
    ExpressionAttributeValues: {
      ":validTill": validTill,
    },
    UpdateExpression: "SET #validTill = :validTill",
    ReturnValues: "ALL_NEW",
  };
  // console.log("params", params);
  try {
    let updateData = await dynamodb.update(params).promise();
    return updateData;
  } catch (error) {
    throw error;
  }
};

export const updateVoucherVoucherStatus = async (data) => {
  let params = {
    TableName: process.env.VOUCHER_TABLE_NAME,
    Key: {
      pk: data.pk,
      couponVoucherId: data.couponVoucherId,
    },
    ExpressionAttributeNames: {
      "#voucherStatus": "voucherStatus",
    },
    ExpressionAttributeValues: {
      ":voucherStatus": data.voucherStatus,
    },
    UpdateExpression: "SET #voucherStatus = :voucherStatus",
    ReturnValues: "ALL_NEW",
  };
  // console.log("params", params);
  try {
    let updateData = await dynamodb.update(params).promise();
    return updateData;
  } catch (error) {
    throw error;
  }
};
