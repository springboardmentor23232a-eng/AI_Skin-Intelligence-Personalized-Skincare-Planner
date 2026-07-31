/**
 * Returns a dynamic greeting based on local time of day.
 * - 05:00 - 11:59 : Good Morning ☀️
 * - 12:00 - 16:59 : Good Afternoon 🌤️
 * - 17:00 - 21:59 : Good Evening 🌆
 * - 22:00 - 04:59 : Good Night 🌙
 */
export const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { greeting: "Good Morning", emoji: "☀️", icon: "morning" };
  } else if (hour >= 12 && hour < 17) {
    return { greeting: "Good Afternoon", emoji: "🌤️", icon: "afternoon" };
  } else if (hour >= 17 && hour < 22) {
    return { greeting: "Good Evening", emoji: "🌆", icon: "evening" };
  } else {
    return { greeting: "Good Night", emoji: "🌙", icon: "night" };
  }
};
