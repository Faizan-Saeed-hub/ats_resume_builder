import React from "react";

const DateRange = ({ startYear, endYear, id }) => {
  if (!startYear && !endYear) {
    return null;
  }

  const lang = "en-US";

  let startStr = "";
  if (startYear) {
    const start = new Date(startYear);
    if (!isNaN(start.getTime()) && startYear.length >= 4) {
      startStr = `${start.toLocaleString(lang, { month: "short" })} ${start.getFullYear()}`;
    } else {
      startStr = String(startYear);
    }
  }

  let endStr = "Present";
  if (endYear) {
    const end = new Date(endYear);
    if (!isNaN(end.getTime()) && endYear.length >= 4) {
      endStr = `${end.toLocaleString(lang, { month: "short" })} ${end.getFullYear()}`;
    } else {
      endStr = String(endYear);
    }
  }

  return (
    <p id={id} className="sub-content">
      {startStr ? (endStr ? `${startStr} — ${endStr}` : startStr) : endStr}
    </p>
  );
};

export default DateRange;
