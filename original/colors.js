(function() {


	function Game() {

		this.score = 0;
		this.maxTime = 5;
		this.splashing = false;
		this.counter;
		this.over = false;


		// To prevent random guessing
		this.scoreConstant = 8;
		this.scoreMultiplier = 1.5;


		setTimeout(function() {
			if (this.time > 0) {
				this.time -= 1;
			}
		}, 1000);

		this.generateHex = function() {
			var hex = ""
			for (var i=0; i<3; i++) {
				hex += Math.floor((Math.random() * 16)).toString(16); 
			}
			return hex;
		};

		this.colorsplash = function(color, first) {
			delay = first ? 0 : 500;
			this.splashing = true;
			var _this = this;
			$('.background').css({'background': "#" + color, 'opacity': '0'}).delay(delay).animate({'opacity': '1'}, {
				duration: 400,
				complete: function() {
					$('.background').animate({'opacity': '0'}, 600, function() {_this.splashing = false});
				}
			});
		};

		this.addScore = function(guess) {

			if (this.over) {return;}
			
			var guessVector = [];
			var answerVector = [];

			for (var i=0; i<3; i++) {
				guessVector.push(parseInt(guess[i], 16));
				answerVector.push(parseInt(this.answer[i], 16));
			}

			var distance = Math.sqrt(Math.pow(guessVector[0] - answerVector[0], 2) + 
									 Math.pow(guessVector[1] - answerVector[1], 2) + 
		 							 Math.pow(guessVector[2] - answerVector[2], 2));
			
			var points = this.scoreConstant - distance;
			points *= Math.max(points/4, 1);
			points *= this.scoreMultiplier;
			this.score += Math.trunc(points);
			$('.score').text(this.score);
			
			console.log(parseInt($('.guess').val(), 16));
		};

		this.flashAnswer = function() {
			var bonusTime = 0;

			for (var i=0; i<this.answer.length; i++) {
				$('.answer .char' + i).text(this.answer[i]);
				var answerInt = parseInt(this.answer[i], 16);
				var guessInt = parseInt($('.guess').val()[i], 16);

				$('.answer .char' + i).removeClass('highGuess lowGuess');

				if (guessInt > answerInt) {
					$('.answer .char' + i).addClass('highGuess');
				} else if (guessInt < answerInt) {
					$('.answer .char' + i).addClass('lowGuess');
				} else if (guessInt == answerInt) {
					bonusTime += 1;
				}
			}

			this.timeRemaining += [1,3,6][bonusTime];


			$('.answer').css({'opacity': '1', 'visibility': 'visible'})
						.animate({'opacity': '0'}, 800, function() {$(this).css('visibility', 'hidden')});
		}

		this.refresh = function(first) {
			$('.guess').val('');
			this.answer = this.generateHex();
			this.colorsplash(this.answer, first);
		};

		this.restart = function() {
			this.over = false;
			this.timeRemaining = this.maxTime;
			this.score = 0;
			$('.score').text(this.score);
			this.refresh(true);

			clearInterval(this.counter);
			this.counter = setInterval(updateTime, 1000);

			var _this = this;
			function updateTime() {
				_this.timeRemaining -= 1;
				$('.time').text(_this.timeRemaining);

				if (_this.timeRemaining <= 0) {
					clearInterval(_this.counter);
					_this.over = true;
					$('.guess-box').css('z-index', '-2');
					$('.score-modal').css('display', 'block');
					return;
				}
			}
		}
	}

	var game = new Game();

	$('.start').click(function() {

		game.restart();
		$(this).text('Restart');

		$(document).keypress(function(event) {
			var keycode = event.which || event.keyCode;

			if (game.over) {
				return;
			}

			if (event.which == 13 && /^[0-9A-F]{3}$/i.test($('.guess').val())) {
				if (!game.splashing) {
					game.addScore($('.guess').val());
					game.flashAnswer();
					game.refresh(false);
				}
			} else if ($('.guess').val().length == 3 && (
					(keycode > 47 && keycode < 58)   || // number keys
					(keycode == 32 || keycode == 13)   || // spacebar & return key(s) (if you want to allow carriage returns)
					(keycode > 64 && keycode < 91)   || // letter keys
					(keycode > 95 && keycode < 112)  || // numpad keys
					(keycode > 185 && keycode < 193) || // ;=,-./` (in order)
					(keycode > 218 && keycode < 223)   // [\]' (in order)']`)
					)) {
				event.preventDefault();
			}
		});
	});

})();
