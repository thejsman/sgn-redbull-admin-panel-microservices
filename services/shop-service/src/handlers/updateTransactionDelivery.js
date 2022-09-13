/*eslint new-cap: ["error", { "newIsCap": false }]*/
/*eslint no-unneeded-ternary: "error"*/

import { responseHandler } from "../lib/response";
import { getTransactionsByTransactionId, updateTransaction } from "../lib/transactionsHelper";

const updateTransactionDelivery = async (event, context) => {
    try {
        const { transactionId, deliveryDate } = JSON.parse(event.body);
        try {
            let data = await getTransactionsByTransactionId({ transactionId });
            if (data && data.Items.length) {
                let transaction = data.Items[0];
                let deliveryObject = {
                    ...transaction.deliveryObject,
                    deliveryDate: deliveryDate,
                    deliveryStatus: "DELIVERED",
                    deliverySubTitle: "Item delivered"
                };
                await updateTransaction({ deliveryObject, transactionId, userId: transaction.userId });
                let response = responseHandler({
                    statusCode: 200,
                    message: "Transactions Object",
                    data: data && data.Items.length ? data.Items[0] : {},
                });
                return response;

            }
            else {
                let response = responseHandler({
                    statusCode: 500,
                    message: "Transactions Not Found",
                    data: {},
                });
                return response;

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
