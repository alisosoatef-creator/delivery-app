import { createContext, useContext, useMemo, useReducer } from "react";

const MobileStoreContext = createContext(null);

const initialState = {
  role: "guest",
  token: "",
  currentUser: null,
  session: null,
  pendingPhone: "",
  activeArea: "auth",
  activeScreen: "login",
  toast: ""
};

function reducer(state, action) {
  switch (action.type) {
    case "navigate":
      return { ...state, activeArea: action.area || state.activeArea, activeScreen: action.screen || state.activeScreen, toast: "" };
    case "pendingPhone":
      return { ...state, pendingPhone: action.phone || "" };
    case "login":
      return {
        ...state,
        role: action.role || action.user?.role || "customer",
        token: action.token || "",
        currentUser: action.user || null,
        session: action.session || action.user || null,
        activeArea: action.role === "driver" || action.user?.role === "driver" ? "driver" : "customer",
        activeScreen: "home",
        toast: action.toast || ""
      };
    case "logout":
      return { ...initialState, toast: action.toast || "" };
    case "toast":
      return { ...state, toast: action.message || "" };
    default:
      return state;
  }
}

export function MobileAppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <MobileStoreContext.Provider value={value}>{children}</MobileStoreContext.Provider>;
}

export function useMobileApp() {
  const context = useContext(MobileStoreContext);
  if (!context) throw new Error("useMobileApp must be used within MobileAppProvider");
  return context;
}
