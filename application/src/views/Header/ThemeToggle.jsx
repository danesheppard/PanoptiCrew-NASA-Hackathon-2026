import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "../../customHooks.ts";

/**
 * Icon button that switches between light and dark themes.
 * Shows the icon of the theme it will switch to.
 *
 * @returns {JSX.Element} The theme toggle button.
 */
export default function ThemeToggle() {
  const [theme, toggleTheme] = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  const Icon = next === "light" ? IconSun : IconMoon;

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      <Icon aria-hidden="true" />
    </button>
  );
}
