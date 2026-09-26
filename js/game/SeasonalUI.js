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

	// Create seasonal indicator element
	self.createSeasonalIndicator = function(){
		var season = self.getCurrentSeason();

		var indicator = document.createElement('div');
		indicator.id = 'seasonal-indicator';
		indicator.className = 'seasonal-indicator seasonal-' + season.name;
		indicator.title = season.name.charAt(0).toUpperCase() + season.name.slice(1);

		// SVG icon
		var svgContainer = document.createElement('div');
		svgContainer.className = 'seasonal-icon';
		svgContainer.innerHTML = '<img src="sprites/seasonal/' + season.icon + '.svg" alt="' + season.name + '" />';

		indicator.appendChild(svgContainer);

		return indicator;
	};

	// Insert seasonal indicator into game UI
	self.insertIntoUI = function(){
		var gameContainer = document.getElementById('game-container');
		if(!gameContainer) return;

		// Remove existing indicator if present
		var existing = document.getElementById('seasonal-indicator');
		if(existing) existing.remove();

		// Create and insert new indicator
		var indicator = self.createSeasonalIndicator();
		gameContainer.appendChild(indicator);
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

	// Initialize seasonal UI
	self.init = function(){
		self.addStyles();
		self.insertIntoUI();

		// Update daily (check at midnight)
		var now = new Date();
		var tomorrow = new Date(now);
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(0, 0, 0, 0);

		var timeUntilMidnight = tomorrow - now;

		setTimeout(function(){
			self.insertIntoUI();
			// Update every 24 hours after that
			setInterval(function(){
				self.insertIntoUI();
			}, 24 * 60 * 60 * 1000);
		}, timeUntilMidnight);
	};

}

// Export for use in game
if(typeof module !== 'undefined' && module.exports){
	module.exports = SeasonalUI;
}
