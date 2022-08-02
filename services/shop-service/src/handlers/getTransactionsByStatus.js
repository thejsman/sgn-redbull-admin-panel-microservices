/*eslint new-cap: ["error", { "newIsCap": false }]*/
/*eslint no-unneeded-ternary: "error"*/

import { responseHandler } from "../lib/response";
import { getTransactionsStatusWise } from "../lib/transactionsHelper";

const getTransactionsByStatus = async (event, context) => {
    try {
        const { status, transactionId, userId } = event.queryStringParameters;
        let transactionObject = {
            transactionId,
            userId,
            limit: 10,
            status
        };
        try {
            let data = await getTransactionsStatusWise(transactionObject);
            let response = responseHandler({
                statusCode: 200,
                message: "Transactions List",
                data: data,
            });
            return response;
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

export const handler = getTransactionsByStatus;
