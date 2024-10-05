export function calculateWorkExperience(workEx) {
  if (workEx.length === 0) return 0;

  const firstObjectEndDate = new Date(workEx[0].end_date);

  const lastObjectStartDate = new Date(workEx[workEx.length - 1].start_date);

  const diffInMilliseconds = firstObjectEndDate - lastObjectStartDate;
  const diffInYears = diffInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);

  return Math.abs(Math.round(diffInYears));
}
