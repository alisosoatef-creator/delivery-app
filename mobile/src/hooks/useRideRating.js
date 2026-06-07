import { useState } from "react";
import { submitRideRating } from "../services/ridesApi";
import { useMobileApp } from "../store/mobileStore";
import { apiErrorMessage } from "../utils/errorUtils";

export function useRideRating({ ride, onRideUpdated } = {}) {
  const { state, dispatch } = useMobileApp();
  const [ratingDraft, setRatingDraft] = useState(5);
  const [reviewDraft, setReviewDraft] = useState("");
  const [ratingStatus, setRatingStatus] = useState("idle");
  const [ratingError, setRatingError] = useState("");
  const session = { token: state.token, role: "customer", phone: state.currentUser?.phone, userId: state.currentUser?.id };

  async function submitRating() {
    if (!ride?.id || ride.status !== "completed") return;
    setRatingStatus("saving");
    setRatingError("");
    try {
      const payload = await submitRideRating(ride.id, { rating: ratingDraft, comment: reviewDraft }, session);
      onRideUpdated?.(payload.ride);
      dispatch({ type: "setCurrentRide", ride: payload.ride, area: "customer", screen: "ride-status", toast: "تم حفظ تقييم الرحلة." });
    } catch (requestError) {
      setRatingError(apiErrorMessage(requestError, "تعذر حفظ تقييم الرحلة."));
    } finally {
      setRatingStatus("idle");
    }
  }

  return {
    ratingDraft,
    setRatingDraft,
    reviewDraft,
    setReviewDraft,
    ratingStatus,
    ratingError,
    submitRating
  };
}
