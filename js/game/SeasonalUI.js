/* One calendar for the story and its badge. Two calendars were quite enough. */
function SeasonalUI() {
  var self = this;
	self.svgIcons = {
		snowflake: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="32" y1="8" x2="32" y2="56"/><line x1="8" y1="32" x2="56" y2="32"/><line x1="16" y1="16" x2="48" y2="48"/><line x1="48" y1="16" x2="16" y2="48"/><line x1="32" y1="16" x2="24" y2="22"/><line x1="32" y1="16" x2="40" y2="22"/><line x1="48" y1="32" x2="42" y2="24"/><line x1="48" y1="32" x2="42" y2="40"/><line x1="32" y1="48" x2="24" y2="42"/><line x1="32" y1="48" x2="40" y2="42"/><line x1="16" y1="32" x2="22" y2="24"/><line x1="16" y1="32" x2="22" y2="40"/><line x1="40" y1="24" x2="36" y2="20"/><line x1="40" y1="24" x2="44" y2="28"/><line x1="40" y1="40" x2="44" y2="36"/><line x1="40" y1="40" x2="36" y2="44"/><line x1="24" y1="24" x2="20" y2="20"/><line x1="24" y1="24" x2="28" y2="28"/><line x1="24" y1="40" x2="28" y2="36"/><line x1="24" y1="40" x2="20" y2="44"/></g></svg>',
		flower: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><circle cx="32" cy="32" r="6"/><ellipse cx="32" cy="14" rx="5" ry="8"/><ellipse cx="43" cy="19" rx="5" ry="8" transform="rotate(72 43 19)"/><ellipse cx="43" cy="45" rx="5" ry="8" transform="rotate(144 43 45)"/><ellipse cx="21" cy="45" rx="5" ry="8" transform="rotate(216 21 45)"/><ellipse cx="21" cy="19" rx="5" ry="8" transform="rotate(288 21 19)"/></g><line x1="32" y1="38" x2="32" y2="56" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
		sun: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor" stroke="none"><circle cx="32" cy="32" r="12"/><rect x="30" y="6" width="4" height="8" rx="2"/><rect x="44" y="14" width="6" height="6" rx="2" transform="rotate(45 47 17)"/><rect x="50" y="30" width="8" height="4" rx="2"/><rect x="44" y="44" width="6" height="6" rx="2" transform="rotate(45 47 47)"/><rect x="30" y="50" width="4" height="8" rx="2"/><rect x="14" y="44" width="6" height="6" rx="2" transform="rotate(45 17 47)"/><rect x="6" y="30" width="8" height="4" rx="2"/><rect x="14" y="14" width="6" height="6" rx="2" transform="rotate(45 17 17)"/></g></svg>',
		leaf: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><path d="M 32 8 Q 50 20 48 40 Q 32 52 16 40 Q 14 20 32 8 Z" fill="currentColor"/><line x1="32" y1="8" x2="32" y2="48" stroke="white" stroke-width="1.5" opacity="0.6"/></g></svg>'
	};

  self.indicatorElement = null;
  self.render = function (date) {
    var root = document.getElementById("game-controls");
    if (!root) return;
    var season = WBWWBSeasonalContext(date).meteorologicalSeason;
    var icon = {winter:"snowflake",spring:"flower",summer:"sun",autumn:"leaf"}[season];
    var indicator = self.indicatorElement;
    if (!indicator) {
      indicator = document.createElement("span");
      indicator.id = "seasonal-indicator";
      indicator.setAttribute("aria-hidden", "true");
      root.appendChild(indicator);
      self.indicatorElement = indicator;
    }
    indicator.className = "seasonal-" + season;
    indicator.innerHTML = self.svgIcons[icon];
  };
  self.init = function () { self.render(Game.date); };
  self.destroy = function () {
    if (self.indicatorElement) self.indicatorElement.remove();
    self.indicatorElement = null;
  };
}
if (typeof module !== "undefined" && module.exports) module.exports = SeasonalUI;
