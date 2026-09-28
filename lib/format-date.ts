/**
 * Formats PocketBase UTC datetime strings into a clean, human-readable date & time separation.
 * Handles space or ISO T separators ("YYYY-MM-DD HH:mm:ss.000Z" or "YYYY-MM-DDTHH:mm:ss.000Z").
 */
export function formatQuotationDateTime(
  dateStr?: string,
  createdStr?: string
): {
  date: string;
  time: string;
} {
  const primary = dateStr || createdStr;
  if (!primary) {
    return { date: "—", time: "" };
  }

  // Normalize string for Date constructor
  const normalized = primary.replace(" ", "T");
  const dateObj = new Date(normalized);

  if (isNaN(dateObj.getTime())) {
    return { date: primary, time: "" };
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const day = String(dateObj.getUTCDate()).padStart(2, "0");
  const month = months[dateObj.getUTCMonth()];
  const year = dateObj.getUTCFullYear();
  const formattedDate = `${day} ${month}, ${year}`;

  // Resolve time source: prioritize created timestamp, or check if dateStr has a non-midnight time
  const timeSource =
    createdStr ||
    (primary.includes(":") && !primary.includes("00:00:00") ? primary : "");

  let formattedTime = "";
  if (timeSource) {
    const timeObj = new Date(timeSource.replace(" ", "T"));
    if (!isNaN(timeObj.getTime())) {
      formattedTime = timeObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  return {
    date: formattedDate,
    time: formattedTime,
  };
}
