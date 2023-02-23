import AWS from "aws-sdk";
const lambda = new AWS.Lambda();

export const getRedisItem = (key) => {
	return new Promise(async (resolve, reject) => {
		try {
			const item = await lambda
				.invoke({
					FunctionName: `redis-service-${process.env.STAGE}-getRedisItem`,
					Payload: JSON.stringify({ key }, null, 2),
				})
				.promise();

			resolve(item);
		} catch (error) {
			console.log("error in getRedisItem", error);
			reject(error);
		}
	});
};

export const setRedisItem = (key, ttl, value) => {
	return new Promise(async (resolve, reject) => {
		try {
			const item = await lambda
				.invoke({
					FunctionName: `redis-service-${process.env.STAGE}-setRedisItem`,
					Payload: JSON.stringify({
						key,
						ttl,
						value,
					}),
				})
				.promise();

			resolve(item);
		} catch (error) {
			console.log("error in getRedisItem", error);
			reject(error);
		}
	});
};

export const setRedisList = (key, value) => {
	return new Promise(async (resolve, reject) => {
		try {
			const item = await lambda
				.invoke({
					FunctionName: `redis-service-${process.env.STAGE}-setRedisList`,
					Payload: JSON.stringify({
						key,
						value,
					}),
				})
				.promise();

			resolve(item);
		} catch (error) {
			console.log("error in setRedisList", error);
			reject(error);
		}
	});
};

export const checkRedisList = (key, value) => {
	return new Promise(async (resolve, reject) => {
		try {
			const item = await lambda
				.invoke({
					FunctionName: `redis-service-${process.env.STAGE}-checkRedisList`,
					Payload: JSON.stringify({
						key,
						value,
					}),
				})
				.promise();

			resolve(item.Payload);
		} catch (error) {
			console.log("error in setRedisList", error);
			reject(error);
		}
	});
};

export const deleteRedisListItem = (key, value) => {
	return new Promise(async (resolve, reject) => {
		try {
			const item = await lambda
				.invoke({
					FunctionName: `redis-service-${process.env.STAGE}-deleteRedisListItem`,
					Payload: JSON.stringify({
						key,
						value,
					}),
				})
				.promise();

			resolve(item.Payload);
		} catch (error) {
			console.log("error in setRedisList", error);
			reject(error);
		}
	});
};

export const setRedisSets = (key, value) => {
	return new Promise(async (resolve, reject) => {
		try {
			const item = await lambda
				.invoke({
					FunctionName: `redis-service-${process.env.STAGE}-setRedisSets`,
					Payload: JSON.stringify({
						key,
						value,
					}),
				})
				.promise();

			resolve(item);
		} catch (error) {
			console.log("error in setRedisSets", error);
			reject(error);
		}
	});
};

export const setIsMember = (key, value) => {
	return new Promise(async (resolve, reject) => {
		try {
			const item = await lambda
				.invoke({
					FunctionName: `redis-service-${process.env.STAGE}-setIsMember`,
					Payload: JSON.stringify({
						key,
						value,
					}),
				})
				.promise();

			resolve(item);
		} catch (error) {
			console.log("error in setIsMember", error);
			reject(error);
		}
	});
};

export const removeSetMember = (key, value) => {
	return new Promise(async (resolve, reject) => {
		try {
			const item = await lambda
				.invoke({
					FunctionName: `redis-service-${process.env.STAGE}-removeSetMember`,
					Payload: JSON.stringify({
						key,
						value,
					}),
				})
				.promise();

			resolve(item);
		} catch (error) {
			console.log("error in removeSetMember", error);
			reject(error);
		}
	});
};

export const getRedisSet = (key) => {
	return new Promise(async (resolve, reject) => {
		try {
			const item = await lambda
				.invoke({
					FunctionName: `redis-service-${process.env.STAGE}-getRedisSet`,
					Payload: JSON.stringify({ key }, null, 2),
				})
				.promise();

			resolve(item);
		} catch (error) {
			console.log("error in getRedisSet", error);
			reject(error);
		}
	});
};

