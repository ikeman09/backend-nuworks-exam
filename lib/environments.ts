// Get environment variables
const Environments = {
  AWS_PROFILE: process.env.AWS_PROFILE,
  AWS_ACCOUNT: process.env.AWS_ACCOUNT,
  AWS_REGION: process.env.AWS_REGION,
  MONGO_CLUSTER: process.env.MONGO_CLUSTER,
  MONGO_USERNAME: process.env.MONGO_USERNAME,
  MONGO_PASSWORD: process.env.MONGO_PASSWORD,
  ENVIRONMENT: process.env.ENVIRONMENT,
};

module.exports = Environments;
