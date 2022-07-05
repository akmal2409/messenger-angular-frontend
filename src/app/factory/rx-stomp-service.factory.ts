import { rxStompConfig } from "../config/rx-stomp.config";
import { AuthService } from "../service/auth.service";
import { RxStompService } from "../service/rx-stomp.service";

export const rxStompServiceFactory = (authService: AuthService) => {
  const config = { ...rxStompConfig };
  config.connectHeaders = {
    'Authorization': `Bearer ${authService.accessToken}`
  };

  const service = new RxStompService();
  service.configure(config);
  service.activate();

  return service;
}
