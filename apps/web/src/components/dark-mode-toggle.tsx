import { MoonIcon, SunIcon } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";

const DarkModeToggle = () => {
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light");

  const Icon = theme === "dark" ? SunIcon : MoonIcon;

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
  };

  return (
    <button
      type="button"
      className="group py-1 pl-2 cursor-pointer"
      onClick={toggleTheme}
    >
      <Icon className="size-6 text-border group-hover:text-muted-foreground transition-colors" />
    </button>
  );
};

export default DarkModeToggle;
