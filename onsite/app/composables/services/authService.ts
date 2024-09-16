import { getFrontendUserInfo } from "@/composables/api/getFrontendUserInfo";
import { getLoginUrl } from "@/composables/api/getLoginUrl";
import { authState } from "@/composables/state/authState";

function onLogin(fun: CallableFunction): void {
  watch(
    () => authState.value.sessionActive,
    async (newState: boolean, oldState: boolean) => {
      if (newState) {
        await fun();
      }
    }
  );
}

function onLogout(fun: CallableFunction): void {
  watch(
    () => authState.value.sessionActive,
    async (newState: boolean, oldState: boolean) => {
      if (!newState) {
        await fun();
      }
    }
  );
}

interface AuthService {
  getLoginUrl: typeof getLoginUrl;
  getFrontendUserInfo: typeof getFrontendUserInfo;
  onLogin: typeof onLogin;
  onLogout: typeof onLogout;
}

export const authService: AuthService = {
  getLoginUrl: getLoginUrl,
  getFrontendUserInfo: getFrontendUserInfo,
  onLogin: onLogin,
  onLogout: onLogout,
};
