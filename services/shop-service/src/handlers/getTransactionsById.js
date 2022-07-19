/*eslint new-cap: ["error", { "newIsCap": false }]*/
/*eslint no-unneeded-ternary: "error"*/

import { responseHandler } from "../lib/response";
import { getTransactionsByTransactionId } from "../lib/transactionsHelper";

const getTransactionsById = async (event, context) => {
    try {
        const { transactionId } = event.queryStringParameters;
        try {
            let data = await getTransactionsByTransactionId({ transactionId });
            let response = responseHandler({
                statusCode: 200,
                message: "Transactions Object",
                data: data && data.Items.length ? data.Items[0] : {},
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

export const handler = getTransactionsById;


