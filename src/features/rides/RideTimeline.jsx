import { tripTimeline, tripTimelineIndex } from "../../utils/rideUtils.js";

export function RideTimeline({ status, isArabic }) {
  const activeIndex = tripTimelineIndex(status);
  return (
    <ol className="ride-timeline">
      {tripTimeline(isArabic).map((item, index) => (
        <li className={index <= activeIndex ? "done" : ""} key={item.key}>
          <span>{index + 1}</span>
          <strong>{item.label}</strong>
        </li>
      ))}
    </ol>
  );
}
