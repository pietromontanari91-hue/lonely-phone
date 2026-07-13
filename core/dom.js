export const $ = (id) => document.getElementById(id);

export function createScreenController(screens) {
  return function showScreen(name, animated = false) {
    Object.values(screens).forEach((screen) => screen.classList.remove("active", "slide-up"));
    screens[name].classList.add("active");
    if (animated) screens[name].classList.add("slide-up");
  };
}
