import { NextApiRequest, NextApiResponse } from "next";
import { decodeEventLog, parseAbi } from "viem";
import webpush, { PushSubscription } from "web-push";
import { deleteSubscriptionFromDB, getAllSubsriptionsFromDb } from "~~/database/firebase/utils";

type Subscription = {
  _id: string;
  pushSubscription: PushSubscription;
};

const triggerPush = async (subscription: Subscription, dataToSend: string) => {
  try {
    await webpush.sendNotification(subscription.pushSubscription, dataToSend);
  } catch (err: any) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      console.log("Subscription has expired or is no longer valid: ", subscription._id);
      await deleteSubscriptionFromDB(subscription.pushSubscription);
    } else {
      console.log("Subscription is no longer valid: ", err);
      throw err;
    }
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
  }

  if (!req.body || !req.body.logs || req.body.logs?.length === 0) {
    console.log("ReqBody", req.body);
    // Not a valid subscription.
    res.status(400);
    res.setHeader("Content-Type", "application/json");
    res.send(
      JSON.stringify({
        error: {
          id: "no-endpoint",
          message: "Notify all must have body & logs",
        },
      }),
    );
    return;
  }

  try {
    const topics = decodeEventLog({
      abi: parseAbi(["event GreetingChange(address indexed, string, bool, uint256)"]),
      data: req.body.logs[0].data,
      topics: req.body.logs[0].topics,
    });
    const message = topics.args[1];
    const subscriptions = await getAllSubsriptionsFromDb();

    if (subscriptions && subscriptions.length > 0) {
      await Promise.all(
        subscriptions.map(s => {
          return triggerPush(s, message);
        }),
      );
    }

    res.status(200).json({ message: `${subscriptions?.length ?? 0} messages sent!` });
  } catch (e) {
    console.log("Error :", e);
    res.status(500).json({ message: "Error while sending notifications" });
  }
}
