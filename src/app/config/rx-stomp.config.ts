import { RxStompConfig } from "@stomp/rx-stomp";
import { environment } from "src/environments/environment";

export const rxStompConfig: RxStompConfig = {
  brokerURL: environment.wsEndpoint,
  heartbeatIncoming: 25000,
  heartbeatOutgoing: 20000,
  reconnectDelay: 200,
  // debug: (msg: string): void => {
  //   console.log(new Date(), msg);
  // }
}

