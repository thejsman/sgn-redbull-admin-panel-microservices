/*eslint new-cap: ["error", { "newIsCap": false }]*/
const { responseHandler } = require("../lib/response");
import commonMiddleware from "../../../../packages/common-middleware";
import { getSingleVoucherByPk, bulkUpdateVouchers } from "../lib/voucherHelper";
// const dynamoDb = new AWS.DynamoDB.DocumentClient();
const bulkUpdate = async (event, context) => {
    // const timestamp = new Date().getTime();
    const data = event.body;
    try {
        let allData = await getSingleVoucherByPk({ ...data, limit: 10000});
        for (let i = 0; i < allData.Items.length; i++) {
            await bulkUpdateVouchers({ ...allData.Items[i], ...data });
        }
        return responseHandler({
            statusCode: 200,
            message: "Voucher has been Updated",
            data: {},
        });
    } catch (error) {
        console.log("errorrrr", error);
        return responseHandler({
            statusCode: 501,
            message: "Request not Updated",
            data: {},
        });
    }
};

// export const handler = updateConnection;
export const handler = commonMiddleware(bulkUpdate);
