import { useEffect, useState } from "react";
import { fetchCustomerWallet } from "../services/paymentsApi";
import { useMobileApp } from "../store/mobileStore";

const emptyWallet = { balance: 0, transactions: [] };

export function useCustomerWallet() {
  const { state } = useMobileApp();
  const [wallet, setWallet] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  function load() {
    setStatus("loading");
    setError("");
    fetchCustomerWallet({ phone: state.currentUser?.phone, userId: state.currentUser?.id, token: state.token })
      .then(setWallet)
      .catch((requestError) => {
        setWallet(emptyWallet);
        setError(requestError?.message || "");
      })
      .finally(() => setStatus("idle"));
  }

  useEffect(load, [state.currentUser?.id, state.currentUser?.phone, state.token]);

  return {
    wallet,
    status,
    error,
    load
  };
}
