const { Novu } = require("@novu/node");

const inAppNotification = async (description, Id) => {
  const novu = new Novu(process.env.NOVU_APIKEY);

  await novu.subscribers.identify(Id, {
    firstName: "inAppSubscriber",
  });

  await novu.trigger("in-app", {
    to: {
      subscriberId: "Sumit",
    },
    payload: {
      description: description,
    },
  });
};

module.exports = { inAppNotification };
