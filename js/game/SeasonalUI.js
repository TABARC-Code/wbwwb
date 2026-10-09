/************************************

SEASONAL UI SYSTEM

Detects user's calendar date and displays appropriate seasonal UI elements:
- Winter (Dec 21 - Mar 20): Snowflake
- Spring (Mar 21 - Jun 20): Flower
- Summer (Jun 21 - Sep 22): Sun
- Autumn (Sep 23 - Dec 20): Leaf

*************************************/

function SeasonalUI(){

	var self = this;
	self.updateTimeoutId = null;
	self.updateIntervalId = null;
	self.indicatorElement = null;

	// Get current date and determine season
	self.getCurrentSeason = function(){
		var today = new Date();
		var month = today.getMonth() + 1; // 1-12
		var day = today.getDate();

		// Determine season based on date ranges
		// Winter: Dec 21 - Mar 20
		if((month === 12 && day >= 21) || (month === 1) || (month === 2) || (month === 3 && day <= 20)){
			return {
				name: 'winter',
				icon: 'snowflake',
				label: '❄'
			};
		}
		// Spring: Mar 21 - Jun 20
		else if((month === 3 && day >= 21) || (month === 4) || (month === 5) || (month === 6 && day <= 20)){
			return {
				name: 'spring',
				icon: 'flower',
				label: '🌸'
			};
		}
		// Summer: Jun 21 - Sep 22
		else if((month === 6 && day >= 21) || (month === 7) || (month === 8) || (month === 9 && day <= 22)){
			return {
				name: 'summer',
				icon: 'sun',
				label: '☀'
			};
		}
		// Autumn: Sep 23 - Dec 20
		else {
			return {
				name: 'autumn',
				icon: 'leaf',
				label: '🍂'
			};
		}
	};

	// SVG icon definitions (inline to ensure currentColor works)
	self.svgIcons = {
		snowflake: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="32" y1="8" x2="32" y2="56"/><line x1="8" y1="32" x2="56" y2="32"/><line x1="16" y1="16" x2="48" y2="48"/><line x1="48" y1="16" x2="16" y2="48"/><line x1="32" y1="16" x2="24" y2="22"/><line x1="32" y1="16" x2="40" y2="22"/><line x1="48" y1="32" x2="42" y2="24"/><line x1="48" y1="32" x2="42" y2="40"/><line x1="32" y1="48" x2="24" y2="42"/><line x1="32" y1="48" x2="40" y2="42"/><line x1="16" y1="32" x2="22" y2="24"/><line x1="16" y1="32" x2="22" y2="40"/><line x1="40" y1="24" x2="36" y2="20"/><line x1="40" y1="24" x2="44" y2="28"/><line x1="40" y1="40" x2="44" y2="36"/><line x1="40" y1="40" x2="36" y2="44"/><line x1="24" y1="24" x2="20" y2="20"/><line x1="24" y1="24" x2="28" y2="28"/><line x1="24" y1="40" x2="28" y2="36"/><line x1="24" y1="40" x2="20" y2="44"/></g></svg>',
		flower: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><circle cx="32" cy="32" r="6"/><ellipse cx="32" cy="14" rx="5" ry="8"/><ellipse cx="43" cy="19" rx="5" ry="8" transform="rotate(72 43 19)"/><ellipse cx="43" cy="45" rx="5" ry="8" transform="rotate(144 43 45)"/><ellipse cx="21" cy="45" rx="5" ry="8" transform="rotate(216 21 45)"/><ellipse cx="21" cy="19" rx="5" ry="8" transform="rotate(288 21 19)"/></g><line x1="32" y1="38" x2="32" y2="56" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
		sun: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor" stroke="none"><circle cx="32" cy="32" r="12"/><rect x="30" y="6" width="4" height="8" rx="2"/><rect x="44" y="14" width="6" height="6" rx="2" transform="rotate(45 47 17)"/><rect x="50" y="30" width="8" height="4" rx="2"/><rect x="44" y="44" width="6" height="6" rx="2" transform="rotate(45 47 47)"/><rect x="30" y="50" width="4" height="8" rx="2"/><rect x="14" y="44" width="6" height="6" rx="2" transform="rotate(45 17 47)"/><rect x="6" y="30" width="8" height="4" rx="2"/><rect x="14" y="14" width="6" height="6" rx="2" transform="rotate(45 17 17)"/></g></svg>',
		leaf: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><path d="M 32 8 Q 50 20 48 40 Q 32 52 16 40 Q 14 20 32 8 Z" fill="currentColor"/><line x1="32" y1="8" x2="32" y2="48" stroke="white" stroke-width="1.5" opacity="0.6"/></g></svg>'
	};

	// Create seasonal indicator element
	self.createSeasonalIndicator = function(){
		var season = self.getCurrentSeason();

		var indicator = document.createElement('div');
		indicator.id = 'seasonal-indicator';
		indicator.className = 'seasonal-indicator seasonal-' + season.name;
		indicator.title = season.name.charAt(0).toUpperCase() + season.name.slice(1);

		// SVG icon (inline for currentColor support)
		var svgContainer = document.createElement('div');
		svgContainer.className = 'seasonal-icon';
		svgContainer.innerHTML = self.svgIcons[season.icon] || '';

		indicator.appendChild(svgContainer);

		return indicator;
	};

	// Insert seasonal indicator into game UI
	self.insertIntoUI = function(){
		var gameContainer = document.getElementById('game-container');
		if(!gameContainer){
			console.warn('SeasonalUI: #game-container not found');
			return;
		}

		var existing = document.getElementById('seasonal-indicator');

		if(existing){
			// Update existing element instead of recreating
			var season = self.getCurrentSeason();
			existing.className = 'seasonal-indicator seasonal-' + season.name;
			existing.title = season.name.charAt(0).toUpperCase() + season.name.slice(1);
		} else {
			// Create and insert new indicator on first load
			var indicator = self.createSeasonalIndicator();
			gameContainer.appendChild(indicator);
			self.indicatorElement = indicator;
		}
	};

	// Add CSS styles for seasonal indicator
	self.addStyles = function(){
		// Check if styles already exist
		if(document.getElementById('seasonal-ui-styles')) return;

		var style = document.createElement('style');
		style.id = 'seasonal-ui-styles';
		style.textContent = `
			#seasonal-indicator {
				position: fixed;
				top: env(safe-area-inset-top, 8px);
				right: 8px;
				z-index: 100;
				width: 48px;
				height: 48px;
				display: flex;
				align-items: center;
				justify-content: center;
				border-radius: 8px;
				background: rgba(255, 255, 255, 0.1);
				border: 2px solid currentColor;
				transition: all 0.3s ease;
				animation: seasonalPulse 3s ease-in-out infinite;
			}

			#seasonal-indicator:hover {
				background: rgba(255, 255, 255, 0.2);
				transform: scale(1.1);
			}

			.seasonal-icon {
				width: 32px;
				height: 32px;
				display: flex;
				align-items: center;
				justify-content: center;
				color: inherit;
			}

			.seasonal-icon img {
				width: 100%;
				height: 100%;
				object-fit: contain;
				color: currentColor;
			}

			/* Season-specific colors */
			.seasonal-winter {
				color: #4A90E2;
				border-color: #4A90E2;
			}

			.seasonal-spring {
				color: #E85D75;
				border-color: #E85D75;
			}

			.seasonal-summer {
				color: #F5A623;
				border-color: #F5A623;
			}

			.seasonal-autumn {
				color: #D97A3A;
				border-color: #D97A3A;
			}

			@keyframes seasonalPulse {
				0%, 100% {
					opacity: 0.7;
				}
				50% {
					opacity: 1;
				}
			}

			/* Dark theme support */
			@media (prefers-color-scheme: dark) {
				#seasonal-indicator {
					background: rgba(0, 0, 0, 0.3);
				}

				#seasonal-indicator:hover {
					background: rgba(0, 0, 0, 0.5);
				}
			}

			/* Mobile responsive */
			@media (max-width: 600px) {
				#seasonal-indicator {
					width: 40px;
					height: 40px;
					top: env(safe-area-inset-top, 4px);
					right: 4px;
				}

				.seasonal-icon {
					width: 24px;
					height: 24px;
				}
			}
		`;

		document.head.appendChild(style);
	};

	// Clean up timers (for game restart or cleanup)
	self.destroy = function(){
		if(self.updateTimeoutId){
			clearTimeout(self.updateTimeoutId);
			self.updateTimeoutId = null;
		}
		if(self.updateIntervalId){
			clearInterval(self.updateIntervalId);
			self.updateIntervalId = null;
		}
	};

	// Initialize seasonal UI
	self.init = function(){
		self.destroy();
		self.addStyles();
		self.insertIntoUI();

		// Update daily (check at midnight)
		var now = new Date();
		var tomorrow = new Date(now);
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(0, 0, 0, 0);

		var timeUntilMidnight = tomorrow - now;

		self.updateTimeoutId = setTimeout(function(){
			self.insertIntoUI();
			// Update every 24 hours after that
			self.updateIntervalId = setInterval(function(){
				self.insertIntoUI();
			}, 24 * 60 * 60 * 1000);
		}, timeUntilMidnight);
	};

}

// Export for use in game
if(typeof module !== 'undefined' && module.exports){
	module.exports = SeasonalUI;
}
