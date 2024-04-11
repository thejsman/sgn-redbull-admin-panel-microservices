/*eslint new-cap: ["error", { "newIsCap": false }]*/
/*eslint no-unneeded-ternary: "error"*/

import { responseHandler } from "../lib/response";
import {
  getTransactionsByTransactionId,
  updateTransaction,
  getGiftsByGiftId,
  updateGifts,
  updateDeliveryObjectAndWithGiftsArray,
} from "../lib/transactionsHelper";

const updateTransactionDelivery = async (event, context) => {
  try {
    const {
      transactionId,
      deliveryDate,
      transactionType = "deals",
      userId,
    } = JSON.parse(event.body);
    try {
      if (transactionType === "deals") {
        let data = await getTransactionsByTransactionId({ transactionId });
        if (data && data.Items.length) {
          let transaction = data.Items[0];
          let deliveryTransactionObject = {
            ...transaction.deliveryObject,
            deliveryDate: deliveryDate,
            deliveryStatus: "DELIVERED",
            deliverySubTitle: "Item delivered",
          };
          await updateTransaction({
            deliveryTransactionObject,
            transactionId,
            userId: transaction.userId,
          });
          let response = responseHandler({
            statusCode: 200,

            message: "Transactions Object",
            data: {
              transactionObj: data && data.Items.length ? data.Items[0] : {},
            },
          });
          return response;
        } else {
          let response = responseHandler({
            statusCode: 500,
            message: "Transactions Not Found",
            data: {},
          });
          return response;
        }
      } else {
        let transactionData = getTransactionsByTransactionId({ transactionId });
        let giftData = getGiftsByGiftId({ transactionId, userId });
        return Promise.all([transactionData, giftData]).then(function (result) {
          console.log(result[0], "ddddddddddddddddd", result[0]);
          if (result[0].Items.length && result[1].Items.length) {
            let transaction = result[0].Items[0];
            let gift = result[1].Items[0];
            let deliveryTransactionObject = {
              ...transaction.deliveryObject,
              deliveryDate: deliveryDate,
              deliveryStatus: "DELIVERED",
              deliverySubTitle: "Item delivered",
            };
            let deliveryGiftObject = {
              ...gift.deliveryObject,
              deliveryDate: deliveryDate,
              deliveryStatus: "DELIVERED",
              deliverySubTitle: "Item delivered",
            };
            let giftWith = transaction.giftWith;
            if (giftWith.length) {
              for (let i = 0; i < giftWith.length; i++) {
                if (giftWith[i].userId === userId) {
                  giftWith[i].delivered = true;
                  break;
                }
              }
            }
            let updateDeliveryObjectInTransaction =
              updateDeliveryObjectAndWithGiftsArray({
                deliveryTransactionObject,
                transactionId,
                userId: transaction.userId,
                giftWith,
              });
            let updateDeliveryObjectInGifts = updateGifts({
              deliveryGiftObject,
              transactionId,
              userId: gift.userId,
            });

            return Promise.all([
              updateDeliveryObjectInTransaction,
              updateDeliveryObjectInGifts,
            ]).then(function (result) {
              let response = responseHandler({
                statusCode: 200,
                message: "Transactions Object",
                data: { transactionObj: result[0][0], giftObj: result[1][0] },
              });
              return response;
            });
          } else {
            let response = responseHandler({
              statusCode: 500,
              message: "Transactions Or Gifts Not Found",
              data: {},
            });
            return response;
          }
        });
      }
    } catch (error) {
      console.log("error", error);
      return responseHandler({
        statusCode: 502,
        message: "Error Occur",
        data: {},
      });
    }
  } catch (error) {
    console.log("error", error);
    return responseHandler({
      statusCode: 500,
      message: "Internal Server Error",
      data: {},
    });
  }
};

export const handler = updateTransactionDelivery;
