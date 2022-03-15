const Redis = require("ioredis");
const options = {
  port: 6379,
  host: '127.0.0.1',
  username: 'minh',
  password: '123456'
}
const redis = new Redis(options);

setInterval(() => {
  const message = { foo: Math.random() };
  // Publish to my-channel-1 or my-channel-2 randomly.
  const channel = `my-channel-${1 + Math.round(Math.random())}`;

  // Message can be either a string or a buffer
  redis.publish(channel, JSON.stringify(message));
  console.log("Published %s to %s", message, channel);
}, 1000);