export const formatFromSeconds = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const finalTime = `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  console.log(finalTime);
  return finalTime;
};

/// Formats HH:MM:SS to seconds

export const formatHMSToSeconds = (time: string) => {
  const [hours = "00", minutes = "00", seconds = "00"] = time.split(":");

  console.log("raw strings, formatHMSToSeconds", hours, minutes, seconds);
  console.log(
    "Formatted time to seconds:",
    parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds)
  );
  return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
};
