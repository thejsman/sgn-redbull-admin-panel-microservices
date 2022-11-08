export const generateUpdateQuery = (fields) => {
  let exp = {
    UpdateExpression: "set",
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
  };
  Object.entries(fields).forEach(([key, item]) => {
    exp.UpdateExpression += ` #${key} = :${key},`;
    exp.ExpressionAttributeNames[`#${key}`] = key;
    exp.ExpressionAttributeValues[`:${key}`] = item;
  });
  exp.UpdateExpression = exp.UpdateExpression.replace(/(^,)|(,$)/g, "");
  return exp;
};

export const currencySymbol = {
  91: "₹",
  1: "$",
  977: "₨.",
};
