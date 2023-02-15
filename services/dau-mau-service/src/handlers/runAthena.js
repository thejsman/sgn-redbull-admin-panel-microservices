import AWS from "aws-sdk";
const athena = new AWS.Athena();
const runAthena = async (event, context) => {
  try {
    // const now = new Date();
    // let currDate = now.toISOString().slice(0, 10);
    //let currMonth = now.toISOString().slice(0, 7);
    //let currWeek = weekNumber(now);
    var params = {
      "QueryExecutionContext": {
        "Database": "test"
      },
      "QueryString": "select distinct uid, count(*) from loggedin_data where year=2023 and month=02 and day=14  group by uid",
      "ResultConfiguration": {
        "OutputLocation": "s3://userloggedinactivity/"
      }
    };
    let athenaResult = await athena.startQueryExecution(params).promise();
    console.log('athenaResult---', athenaResult);
    //store this execution id in redis
  } catch (error) {
    console.log("error", error);

  }
};

export const handler = runAthena;
