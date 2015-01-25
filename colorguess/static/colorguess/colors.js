(function() {


	function Game() {

		this.score = 0;
		this.maxTime = 30;
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

			this.timeRemaining += [0,1,3,6][bonusTime];


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
					$('.score-modal').css({'opacity': '0', 'display': 'block'}).animate({'opacity': '1'});
					$('.score-page').css('display', 'block');
					$('.highscores-page').css('display', 'none');
					return;
				}
			}
		}
	}



	var closeModal = function() {
		$('.score-modal').animate({'opacity': '0'}, 400, function() {
			$(this).css({'display': 'none', 'opacity': '1'});
			$('.guess-box').css('z-index', '40');
			$('.submit-page').css('display', 'block');
			$('.highscores-page').css('display', 'none');
		});
	}


	var game = new Game();


	$('.start').click(function() {
		closeModal();

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


	function getCookie(name) {
		var cookieValue = null;
		if (document.cookie && document.cookie != '') {
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				var cookie = jQuery.trim(cookies[i]);
				if (cookie.substring(0, name.length + 1) == (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}
	var csrftoken = getCookie('csrftoken');
	function csrfSafeMethod(method) {
		// these HTTP methods do not require CSRF protection
		return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
	}
	$.ajaxSetup({
		beforeSend: function(xhr, settings) {
			if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
				xhr.setRequestHeader("X-CSRFToken", csrftoken);
			}
		}
	});

	$('.submit-score').click(function() {

		if ($('.name-input input').val().length <= 0) {
			$('.name-input input').addClass('error');
			return;
		} else {
			$('.name-input input').removeClass('error');
		}

		$.ajax({
			url: '/scores/',
			type: 'POST',
			data: {value: game.score, name: $('.name-input input').val()},
			success: function(response) {
				$('.submit-page').animate({'opacity': '0'}, 400, function() {
					$(this).css({'display': 'none', 'opacity': '1'});
					$('.highscores-page').css('display', 'block');
					$('.highscores').html(response);
				});
			}
		})
	});

})();








