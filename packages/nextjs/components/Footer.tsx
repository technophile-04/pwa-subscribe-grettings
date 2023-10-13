import { useState } from "react";
import { hardhat } from "wagmi/chains";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Faucet } from "~~/components/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { deleteSubscription } from "~~/utils/push-api-calls";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";

/**
 * Site footer
 */
export const Footer = () => {
  const { nativeCurrencyPrice, setPushNotificationSubscription, pushNotificationSubscription } = useGlobalState(
    state => state,
  );
  const [unsubscribing, setUnsubscribing] = useState(false);
  const unsubscribeMe = async () => {
    setUnsubscribing(true);
    try {
      const swRegistration = await navigator.serviceWorker.ready;
      const subscription = await swRegistration.pushManager.getSubscription();
      if (!subscription) {
        setPushNotificationSubscription(null);
        return;
      }
      await deleteSubscription(subscription);
      await subscription?.unsubscribe();
      setPushNotificationSubscription(null);
    } catch {
      notification.error("Failed to unsubscribe");
    } finally {
      setUnsubscribing(false);
    }
  };

  return (
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0">
      <div>
        <div className="fixed flex justify-between items-center w-full z-10 p-4 bottom-0 left-0 pointer-events-none">
          <div className="flex space-x-2 pointer-events-auto">
            {nativeCurrencyPrice > 0 && (
              <div className="btn btn-primary btn-sm font-normal cursor-auto gap-0">
                <CurrencyDollarIcon className="h-4 w-4 mr-0.5" />
                <span>{nativeCurrencyPrice}</span>
              </div>
            )}
            {getTargetNetwork().id === hardhat.id && <Faucet />}

            {pushNotificationSubscription && (
              <button
                className="btn btn-primary btn-sm font-normal cursor-auto gap-0 normal-case"
                disabled={unsubscribing}
                onClick={unsubscribeMe}
              >
                {unsubscribing ? <span className="loading loading-dots loading-xs"></span> : "unsubscribe"}
              </button>
            )}
          </div>
          <SwitchTheme className="pointer-events-auto" />
        </div>
      </div>
      <div className="w-full">
        <ul className="menu menu-horizontal w-full">
          <div className="flex justify-center items-center gap-2 text-sm w-full">
            <div className="text-center">
              <a
                href="https://github.com/scaffold-eth/se-2"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                Fork me
              </a>
            </div>
            <span>·</span>
            <div>
              <p className="m-0 text-center">
                Built with <HeartIcon className="inline-block h-4 w-4" /> at 🏰{" "}
                <a
                  href="https://buidlguidl.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  BuidlGuidl
                </a>
              </p>
            </div>
            <span>·</span>
            <div className="text-center">
              <a
                href="https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                Support
              </a>
            </div>
          </div>
        </ul>
      </div>
    </div>
  );
};
