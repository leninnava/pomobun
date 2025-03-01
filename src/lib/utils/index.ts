export const formatFromSeconds = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
};

/// Format MM:SS to seconds

export const formatToSeconds = (time: string) => {
  const [minutes, seconds] = time.split(":");
  return parseInt(minutes) * 60 + parseInt(seconds);
};
