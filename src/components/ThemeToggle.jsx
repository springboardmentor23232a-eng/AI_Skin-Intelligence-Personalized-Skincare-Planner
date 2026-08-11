import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center p-2 rounded-circle"
      onClick={toggleTheme}
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
      style={{ width: "36px", height: "36px", border: "1px solid var(--border-strong)" }}
    >
      {theme === "light" ? (
        <span style={{ fontSize: "1.1rem" }}>🌙</span>
      ) : (
        <span style={{ fontSize: "1.1rem" }}>☀️</span>
      )}
    </button>
  );
}

export default ThemeToggle;
