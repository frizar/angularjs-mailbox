;(function() {
	'use strict';

	const TEST_API_RESPONSE_DELAY = 0;
	const TEST_API_VERSION = 'v1';
	const TEST_API_NAMESPACE = 'vschekin';
	const TEST_API_URL = `https://test-api.javascript.ru/${TEST_API_VERSION}/${TEST_API_NAMESPACE}`;
	const TEST_API_URL_DELAY_PART = `?delay=${TEST_API_RESPONSE_DELAY}`;
	const RESULT_DELAY = 3000;

	let app = angular.module('mailboxApp', ['ui.router']);

	app.config(($stateProvider, $urlRouterProvider, $httpProvider) => {
		$httpProvider.interceptors.push('AuthRejector');

		$urlRouterProvider
			.when('/mail//', '/mail/inbox/')
			.otherwise('/mail/inbox/');

		$stateProvider
			.state({
				name: 'login',
				url: '/login',
				template: '<login-form></login-form>'
			})
			.state({
				name: 'logout',
				url: '/logout',
				controller: function(AuthService, $state) {
					AuthService.logout();
					$state.go('login');
				}
			})
			.state({
				abstract: true,
				name: 'mail',
				url: '/mail',
				template: `<ui-view></ui-view>`
			})
			.state({
				name: 'mail.box',
				url: '/:mailboxKey/:letterId',
				templateUrl: 'templates/mail/index.html',
				controller: function($scope, $stateParams) {
					$scope.mailboxKey = $stateParams.mailboxKey;
					$scope.letterId = $stateParams.letterId;
				}
			})
			.state({
				name: 'newLetter',
				url: '/new-letter/:userId',
				resolve: {
					outboxId: function(MailService) {
						return MailService.getMailboxId('outbox');
					}
				},
				templateUrl: 'templates/newLetter/index.html',
				controller: function($scope, $stateParams, outboxId) {
					$scope.userId = $stateParams.userId;
					$scope.outboxId = outboxId;
				}
			})
			.state({
				abstract: true,
				name: 'contacts',
				url: '/contacts',
				template: `<ui-view></ui-view>`
			})
			.state({
				name: 'contacts.list',
				url: '/list',
				template: `<contacts-list></contacts-list>`
			})
			.state({
				name: 'contacts.user',
				url: '/user/:userId',
				template: `<contacts-user user-id="userId"></contacts-user>`,
				controller: function($scope, $stateParams) {
					$scope.userId = $stateParams.userId;
				}
			})
			.state({
				name: 'test-api',
				url: '/test-api',
				template: `<test-api></test-api>`
			});
	});

	app.run(($rootScope, $state, AuthService) => {
		$rootScope.$on('$stateChangeStart', function(event, toState) {
			let isAuth = AuthService.isAuth();
			let isAdmin = AuthService.getUser().isAdmin;

			if (toState.name !== 'login' && !isAuth) {
				event.preventDefault();
				$state.go('login');
			} else if (toState.name === 'login' && isAuth) {
				event.preventDefault();
				$state.go('mail.box', {mailboxKey: 'inbox', letterId: ''});
			} else if (toState.name === 'test-api' && !isAdmin) {
				event.preventDefault();
				$state.go('mail.box', {mailboxKey: 'inbox', letterId: ''});
			}
		});
	});

	app.service('AuthRejector', function($q, $injector) {
		this.responseError = function(responseError) {
			if (responseError.status === 401) {
				$injector.get('$state').go('login');
			}

			return $q.reject(responseError);
		};
	});

	app.service('AuthService', function($q) {
		let _auth = false;
		let _name = '';
		let _user = {};

		let users = [
			{email: 'test@gmail.com', password: 'test1234'},
			{email: 'vasya@gmail.com', password: 'qwerty', isAdmin: true},
			{email: 'petya@gmail.com', password: 'пароль'},
		];

		this.isAuth = () => _auth;
		this.getName = () => _name;
		this.getUser = () => _user;

		this.login = (email, password) => {
			let user = users.find(user => user.email === email);

			if (!user) {
				return $q.reject({email: 'Пользователь не найден'});
			}

			if (user.password !== password) {
				return $q.reject({password: 'Не верный пароль'});
			}

			_auth = true;

			_name = email.split('@')[0];
			_name = _name[0].toUpperCase() + _name.slice(1);
			_user = user;

			return $q.resolve();
		};

		this.logout = () => {
			_auth = false;
			_name = '';
			_user = {};
		}
	});

	app.service('UserService', function($http) {
		this.getAll = () => {
			return $http.get(`https://test-api.javascript.ru/${TEST_API_VERSION}/${TEST_API_NAMESPACE}/users?delay=${TEST_API_RESPONSE_DELAY}`)
				.then(response => response.data)
				.catch(error => error);
		};

		this.getById = userId => {
			return $http.get(`https://test-api.javascript.ru/${TEST_API_VERSION}/${TEST_API_NAMESPACE}/users/${userId}?delay=${TEST_API_RESPONSE_DELAY}`)
				.then(response => response.data)
				.catch(error => error);
		};

		this.getThumbImage = avatarUrl => {
			// example: https://randomuser.me/api/portraits/men/0.jpg
			let beginUrl = 'https://randomuser.me/api/portraits/';
			return `${beginUrl}thumb/${avatarUrl.slice(beginUrl.length)}`;
		};

		this.getMediumImage = avatarUrl => {
			// example: https://randomuser.me/api/portraits/men/0.jpg
			let beginUrl = 'https://randomuser.me/api/portraits/';
			return `${beginUrl}med/${avatarUrl.slice(beginUrl.length)}`;
		};
	});

	app.service('MailService', function($http) {
		const _defineMailboxKey = title => {
			if (title === 'Входящие') {
				return 'inbox';
			} else if (title === 'Отправленные') {
				return 'outbox';
			} else if (title === 'Важные') {
				return 'starred';
			} else if (title === 'Корзина') {
				return 'trash';
			}

			return '';
		};

		this.getMailboxes = () => {
			return $http.get(`${TEST_API_URL}/mailboxes${TEST_API_URL_DELAY_PART}`)
				.then(response => {
					let mailboxes = response.data;
					return mailboxes.map(mailbox => {
						mailbox.key = _defineMailboxKey(mailbox.title);
						return mailbox;
					})
				})
				.catch(error => error);
		};

		let _cachedMailboxes = this.getMailboxes();

		this.getAllLetters = () => {
			return $http.get(`${TEST_API_URL}/letters${TEST_API_URL_DELAY_PART}`)
				.then(response => response.data)
				.catch(error => error);
		};

		this.getLettersFromMailbox = mailboxId => {
			return this.getAllLetters()
				.then(letters => letters.filter(letter => letter.mailbox === mailboxId))
				.catch(error => error);
		};

		this.getCachedMailboxes = () => _cachedMailboxes;

		this.getMailboxId = mailboxKey => {
			return _cachedMailboxes.then(mailboxes => {
				let mailbox = mailboxes.find(mailbox => mailbox.key === mailboxKey);
				return mailbox ? mailbox._id : -1;
			});
		};

		this.updateCachedMailboxes = () => {
			_cachedMailboxes = this.getMailboxes();
		};

		this.getLetter = letterId => {
			return $http.get(`${TEST_API_URL}/letters/${letterId}${TEST_API_URL_DELAY_PART}`)
				.then(response => response.data)
				.catch(error => error);
		};

		this.moveTo = (mailboxKey, letter) => {
			let mailboxId = this.getMailboxId(mailboxKey)
				.then(mailboxId => mailboxId);

			return mailboxId.then(mailboxId => {
				letter.mailbox = mailboxId;
				return $http.patch(`${TEST_API_URL}/letters/${letter._id}${TEST_API_URL_DELAY_PART}`, letter)
					.then(response => response.data)
					.catch(error => error);
			});
		};

		this.remove = letterId => {
			return $http.delete(`${TEST_API_URL}/letters/${letterId}${TEST_API_URL_DELAY_PART}`)
				.then(response => response.data)
				.catch(error => error);
		};

		this.sendLetter = letter => {
			return $http.post(`${TEST_API_URL}/letters/${TEST_API_URL_DELAY_PART}`, letter)
				.then(response => response.data)
				.catch(error => error);
		};
	});

	app.service('TestAPI', function($http, MailService) {
		let defaultUsers = [
			{
				'fullName': 'Santana Coffey',
				'email': 'santanacoffey@tellifly.com',
				'avatarUrl': 'https://randomuser.me/api/portraits/men/10.jpg',
				'birthdate': '2014-07-03',
				'gender': 'M',
				'address': '673 Lefferts Place, Swartzville, Virgin Islands, 1790'
			},
			{
				'fullName': 'Deirdre Boyer',
				'email': 'deirdreboyer@tellifly.com',
				'avatarUrl': 'https://randomuser.me/api/portraits/women/10.jpg',
				'birthdate': '2016-01-05',
				'gender': 'F',
				'address': '888 Livonia Avenue, Winesburg, Vermont, 7174'
			},
			{
				'fullName': 'Rachael Skinner',
				'email': 'rachaelskinner@tellifly.com',
				'avatarUrl': 'https://randomuser.me/api/portraits/women/11.jpg',
				'birthdate': '2015-02-04',
				'gender': 'F',
				'address': '589 Verona Street, Kerby, Alabama, 9026'
			},
			{
				'fullName': 'Crawford Barber',
				'email': 'crawfordbarber@tellifly.com',
				'avatarUrl': 'https://randomuser.me/api/portraits/men/11.jpg',
				'birthdate': '2014-07-27',
				'gender': 'M',
				'address': '407 Dewey Place, Albrightsville, Maine, 4848'
			},
			{
				'fullName': 'Howell Cole',
				'email': 'howellcole@tellifly.com',
				'avatarUrl': 'https://randomuser.me/api/portraits/men/12.jpg',
				'birthdate': '2014-02-13',
				'gender': 'M',
				'address': '215 Allen Avenue, Marne, South Dakota, 8742'
			},
			{
				'fullName': 'Fern Salazar',
				'email': 'fernsalazar@tellifly.com',
				'avatarUrl': 'https://randomuser.me/api/portraits/women/12.jpg',
				'birthdate': '2014-08-28',
				'gender': 'F',
				'address': '321 Polhemus Place, Waiohinu, Minnesota, 3766'
			},
			{
				'fullName': 'Ida Bullock',
				'email': 'idabullock@tellifly.com',
				'avatarUrl': 'https://randomuser.me/api/portraits/women/13.jpg',
				'birthdate': '2015-11-14',
				'gender': 'F',
				'address': '560 Kingston Avenue, Greer, North Carolina, 5899'
			},
			{
				'fullName': 'Hope Moody',
				'email': 'hopemoody@tellifly.com',
				'avatarUrl': 'https://randomuser.me/api/portraits/women/14.jpg',
				'birthdate': '2014-03-13',
				'gender': 'F',
				'address': '295 Kossuth Place, Dowling, Wisconsin, 4553'
			},
			{
				'fullName': 'Beverly Evans',
				'email': 'beverlyevans@tellifly.com',
				'avatarUrl': 'https://randomuser.me/api/portraits/women/15.jpg',
				'birthdate': '2014-12-29',
				'gender': 'F',
				'address': '431 Beacon Court, Eureka, Virginia, 5177'
			},
			{
				'fullName': 'Valenzuela Velasquez',
				'email': 'valenzuelavelasquez@tellifly.com',
				'avatarUrl': 'https://randomuser.me/api/portraits/women/17.jpg',
				'birthdate': '2014-09-21',
				'gender': 'M',
				'address': '508 Cambridge Place, Trucksville, Puerto Rico, 6877'
			}
		];
		let defaultMailboxes = [
			{'title': 'Корзина'},
			{'title': 'Важные'},
			{'title': 'Отправленные'},
			{'title': 'Входящие'}
		];
		let defaultLetters = [
			{
				'mailbox': '',
				'subject': 'eiusmod eiusmod nisi',
				'body': 'Consectetur ipsum minim cupidatat anim nulla. Laboris sunt minim exercitation do elit qui cillum reprehenderit sint quis magna sint elit laborum. Nulla proident aute cupidatat laborum consequat in Lorem adipisicing esse. Reprehenderit sit quis cillum esse adipisicing cupidatat. Voluptate ea fugiat duis cillum mollit culpa nulla. Cillum ut cupidatat laboris excepteur proident proident nostrud labore. Exercitation et in voluptate aliqua irure culpa laborum sit deserunt ea mollit.\r\n',
				'to': 'rochamullins@netplax.com'
			},
			{
				'mailbox': '',
				'subject': 'commodo cillum esse',
				'body': 'Occaecat ea et id eu nostrud. In aliqua ea incididunt eu reprehenderit nisi laboris dolor tempor. Mollit voluptate officia magna labore consectetur exercitation aute culpa.\r\n',
				'to': 'rochamullins@netplax.com'
			},
			{
				'mailbox': '',
				'subject': 'labore nulla minim',
				'body': 'Nostrud aute culpa ipsum esse Lorem consectetur aliqua adipisicing tempor reprehenderit dolore aute. Fugiat aute dolor consectetur ut consectetur tempor sit qui ut ex cupidatat labore. Sint anim officia eiusmod mollit officia. Exercitation anim nostrud ad sit eu. Cillum proident labore pariatur proident elit laboris nulla nisi pariatur pariatur. Velit consequat est officia velit excepteur officia cillum.\r\n',
				'to': 'rochamullins@netplax.com'
			},
			{
				'mailbox': '',
				'subject': 'anim do adipisicing',
				'body': 'Amet tempor tempor nostrud elit velit esse pariatur aliqua. Ea ex ut labore ad irure aliquip Lorem elit veniam fugiat. Aliquip cillum mollit incididunt sint.\r\n',
				'to': 'rochamullins@netplax.com'
			},
			{
				'mailbox': '',
				'subject': 'quis et eiusmod',
				'body': 'Et consectetur dolor sit dolor sit consectetur voluptate. Eu ut nulla ipsum qui esse. Dolor et sit sunt in eiusmod eiusmod nostrud labore sunt tempor est cupidatat officia. Velit nostrud cupidatat occaecat aute duis consequat id nisi ea laborum dolore nisi id est. Laborum irure laborum dolore dolor id dolore deserunt do ut exercitation quis duis.\r\n',
				'to': 'rochamullins@netplax.com'
			},
			{
				'mailbox': '',
				'subject': 'ea quis exercitation',
				'body': 'Enim laborum fugiat ut irure occaecat pariatur. Commodo cupidatat occaecat laboris amet in quis in ullamco labore irure laborum incididunt veniam et. Exercitation dolore ad exercitation irure culpa nostrud esse in in aliquip.\r\n',
				'to': 'rochamullins@netplax.com'
			},
			{
				'mailbox': '',
				'subject': 'fugiat ipsum deserunt',
				'body': 'Fugiat anim anim in exercitation dolor esse. Duis magna eu officia voluptate ullamco incididunt commodo sint anim ex laborum anim. Laboris velit eu cupidatat enim aute occaecat nostrud velit ad fugiat quis eu fugiat. Non nulla laborum adipisicing excepteur exercitation velit cillum occaecat commodo eu anim proident commodo. Reprehenderit dolore id dolore ex aliqua ex non eiusmod. Veniam Lorem proident ea minim Lorem consequat ea proident Lorem exercitation aliqua magna minim.\r\n',
				'to': 'rochamullins@netplax.com'
			},
			{
				'mailbox': '',
				'subject': 'quis duis veniam',
				'body': 'Proident occaecat reprehenderit esse elit amet magna ex consectetur ullamco deserunt est proident ex. Duis adipisicing elit consequat id mollit elit deserunt. Fugiat ex nisi excepteur et duis anim sunt. Non aute labore eiusmod nulla do occaecat laboris minim pariatur irure. Deserunt et aliqua minim do est nisi id elit proident Lorem do dolor consectetur enim. Sunt cupidatat sit pariatur irure. Lorem dolor culpa anim commodo sit pariatur voluptate do labore irure reprehenderit tempor id.\r\n',
				'to': 'rochamullins@netplax.com'
			},
			{
				'mailbox': '',
				'subject': 'excepteur nisi enim',
				'body': 'Reprehenderit ullamco incididunt veniam eu commodo mollit consequat ex qui. Exercitation magna exercitation labore ipsum excepteur id sit elit ut ut deserunt incididunt fugiat excepteur. Excepteur consequat irure irure reprehenderit proident nisi id qui labore exercitation enim. Mollit consectetur aute incididunt mollit eu pariatur. Adipisicing laborum aute sunt ullamco velit non. Ad irure ex eiusmod adipisicing amet in officia magna velit labore adipisicing tempor anim laboris.\r\n',
				'to': 'rochamullins@netplax.com'
			},
			{
				'mailbox': '',
				'subject': 'sunt in culpa',
				'body': 'Aliquip adipisicing proident commodo pariatur do anim voluptate tempor sit proident aute eiusmod. Reprehenderit et consectetur magna tempor dolore sunt adipisicing ea voluptate. Occaecat est dolor fugiat Lorem quis. Eiusmod et laborum irure dolore. Consectetur pariatur irure dolore qui eiusmod laboris enim incididunt exercitation voluptate occaecat. Laboris duis eu enim ex.\r\n',
				'to': 'rochamullins@netplax.com'
			}
		];

		this.removeAllData = () => {
			return $http.delete(`${TEST_API_URL}${TEST_API_URL_DELAY_PART}`)
				.then(response => {
					MailService.updateCachedMailboxes();
					return response.data;
				})
				.catch(error => error);
		};

		this.createAllData = () => {
			$http.post(`${TEST_API_URL}${TEST_API_URL_DELAY_PART}`, {
				users: defaultUsers
			});

			return $http.post(`${TEST_API_URL}${TEST_API_URL_DELAY_PART}`, {
				mailboxes: defaultMailboxes
			})
				.then(response => response.data.mailboxes)
				.then(mailboxes => {
					MailService.updateCachedMailboxes();
					// we need to know inbox _id before we can POST default letters
					let inbox = mailboxes.find(mailbox => mailbox.title === 'Входящие');

					return defaultLetters.map(letter => {
						letter.mailbox = inbox._id;
						return letter;
					});
				})
				.then(letters => {
					return $http.post(`${TEST_API_URL}${TEST_API_URL_DELAY_PART}`, {
						letters: letters
					})
						.then(response => 'ok');
				});
		};
	});

	app.service('Styles', function() {
		this.ICONS = {
			NO_ICON: '',
			SPINNER: 'fa fa-spinner fa-pulse fa-fw',
			DONE: 'fa fa-check',
			ERROR: 'fa fa-exclamation-triangle'
		};

		this.AVAILABILITY = {
			ENABLED: '',
			DISABLED: 'disabled',
		};
	});

	app.component('navBar', {
		templateUrl: 'templates/navbar/index.html',
		controller: function(AuthService) {
			this.userIsAuth = () => AuthService.isAuth();
			this.getUserName = () => AuthService.getName();
			this.isAdmin = () => AuthService.getUser().isAdmin;
		}
	});

	app.component('loginForm', {
		templateUrl: 'templates/login/index.html',
		controller: function(AuthService, $state) {
			this.email = 'vasya@gmail.com';
			this.password = 'qwerty';

			this.errors = {
				email: '',
				password: ''
			};

			this.login = () => {
				this.errors = {
					email: '',
					password: ''
				};

				AuthService.login(this.email, this.password)
					.then(() => {
						$state.go('mail.box', {mailboxKey: 'inbox'});
					})
					.catch(error => {
						console.error(error);
						if (error.email) {
							this.errors.email = error.email;
						}
						if (error.password) {
							this.errors.password = error.password;
						}
					});
			};
		}
	});

	app.component('alert', {
		bindings: {
			className: '<',
			title: '<',
			description: '<',
			icon: '<'
		},
		templateUrl: 'templates/alert/index.html'
	});

	app.component('mailboxes', {
		bindings: {
			mailboxKey: '<'
		},
		templateUrl: 'templates/mail/mailboxes.html',
		controller: function(MailService) {
			this.loading = true;
			this.noMailboxes = false;
			this.mailboxes = [];

			MailService.getCachedMailboxes()
				.then(mailboxes => {
					this.loading = false;

					this.mailboxes = mailboxes;
					if (!this.mailboxes.length) {
						this.noMailboxes = true;
					}
				})
				.catch(error => {
					console.error(error);
				});
		}
	});

	app.component('letters', {
		bindings: {
			mailboxKey: '<',
		},
		templateUrl: 'templates/mail/letters.html',
		controller: function(MailService) {
			this.loading = true;
			this.noLetters = false;
			this.letters = [];

			MailService.getMailboxId(this.mailboxKey || 'inbox')
				.then(mailboxId => mailboxId)
				.then(mailboxId => {
					MailService.getLettersFromMailbox(mailboxId)
						.then(letters => {
							this.loading = false;

							this.letters = letters;
							if (!this.letters.length) {
								this.noLetters = true;
							}
						})
						.catch(error => {
							console.error(error);
						});
				});

			this.moveTo = (mailboxKey, letter, index) => {
				MailService.moveTo(mailboxKey, letter)
					.then(() => {
						this.letters.splice(index, 1);
					})
					.catch(error => {
						console.error(error);
					});
			};

			this.remove = (letterId, index) => {
				MailService.remove(letterId)
					.then(() => {
						this.letters.splice(index, 1);
					})
					.catch(error => {
						console.error(error);
					});
			};
		}
	});

	app.component('letter', {
		bindings: {
			letterId: '<',
			mailboxKey: '<'
		},
		templateUrl: 'templates/mail/letter.html',
		controller: function(MailService) {
			this.loading = true;
			this.letter = {};

			MailService.getLetter(this.letterId)
				.then(letter => {
					this.loading = false;
					this.letter = letter;
				})
				.catch(error => {
					console.error(error);
				});
		}
	});

	app.component('newLetter', {
		bindings: {
			userId: '<',
			outboxId: '<'
		},
		templateUrl: 'templates/newLetter/new-letter.html',
		controller: function(MailService, UserService, $timeout) {
			this.letter = {
				subject: '',
				mailbox: this.outboxId,
				body: '',
				to: ''
			};

			this.searchUserQuery = '';
			this.usersNotFound = false;
			this.users = [];
			this.foundedUsers = [];
			this.emailSended = false;

			this.findUsers = () => {
				this.usersNotFound = false;
				this.foundedUsers = [];

				if (!this.searchUserQuery || !this.users.length) {
					return;
				}

				let query = this.searchUserQuery.toLowerCase();

				let foundedUsers = this.users.filter(user => {
					let emailIsFound = user.email.toLowerCase().indexOf(query) > -1;
					let userNameIsFound = user.fullName.toLowerCase().indexOf(query) > -1;

					return emailIsFound || userNameIsFound;
				});

				this.usersNotFound = !foundedUsers.length;
				this.foundedUsers = foundedUsers;
			};

			this.getThumb = avatarUrl => UserService.getThumbImage(avatarUrl);

			this.setLetterTo = email => {
				this.letter.to = email;

				$timeout(() => {
					this.usersNotFound = false;
					this.foundedUsers = [];
					this.searchUserQuery = '';
				}, 1000);
			};

			this.sendLetter = () => {
				MailService.sendLetter(this.letter)
					.then(() => {
						this.letter = {
							subject: '',
							mailbox: this.outboxId,
							body: '',
							to: ''
						};

						this.emailSended = true;
						$timeout(() => {
							this.emailSended = false;
						}, RESULT_DELAY);
					})
					.catch(errors => {
						console.log(errors);
					});
			};

			UserService.getAll()
				.then(users => {
					this.users = users;

					if (this.userId) {
						let user = this.users.find(user => user._id === this.userId);
						this.letter.to = user ? user.email : '';
					}
				})
				.catch(error => {
					console.error(error);
				});
		}
	});

	app.component('contactsList', {
		templateUrl: 'templates/contacts/list.html',
		controller: function(UserService) {
			this.noUsers = false;
			this.loading = true;
			this.users = [];

			this.getThumb = avatarUrl => UserService.getThumbImage(avatarUrl);

			UserService.getAll()
				.then(users => {
					this.loading = false;
					this.users = users;

					if (!this.users.length) {
						this.noUsers = true;
					}
				})
				.catch(error => {
					console.error(error);
				});
		}
	});

	app.component('contactsUser', {
		bindings: {
			userId: '<'
		},
		templateUrl: 'templates/contacts/user.html',
		controller: function(UserService) {
			this.loading = true;
			this.user = {};

			this.getGenderIconClass = gender => {
				if (gender === 'M') {
					return 'fa fa-mars';
				} else if (gender === 'F') {
					return 'fa fa-venus';
				}

				return '';
			};

			UserService.getById(this.userId)
				.then(user => {
					this.loading = false;

					this.user = user;
				})
				.catch(error => {
					console.error(error);
				});
		}
	});

	app.component('testApi', {
		templateUrl: 'templates/test-api/index.html',
		controller: function(TestAPI, $timeout, Styles) {
			this.icons = {
				removeAll: Styles.ICONS.NO_ICON,
				createAll: Styles.ICONS.NO_ICON
			};

			this.availability = {
				removeAll: Styles.AVAILABILITY.ENABLED,
				createAll: Styles.AVAILABILITY.ENABLED
			};

			this.removeAll = () => {
				if (this.availability.removeAll === Styles.AVAILABILITY.DISABLED) {
					return;
				}

				this.icons.removeAll = Styles.ICONS.SPINNER;
				this.availability.removeAll = Styles.AVAILABILITY.DISABLED;

				TestAPI.removeAllData()
					.then(() => {
						this.icons.removeAll = Styles.ICONS.DONE;

						$timeout(() => {
							this.icons.removeAll = Styles.ICONS.NO_ICON;
							this.availability.removeAll = Styles.AVAILABILITY.ENABLED;
						}, RESULT_DELAY);
					})
					.catch(error => {
						console.error(error);
						this.icons.removeAll = Styles.ICONS.ERROR;
					});
			};

			this.createAll = () => {
				if (this.availability.createAll === Styles.AVAILABILITY.DISABLED) {
					return;
				}

				this.icons.createAll = Styles.ICONS.SPINNER;
				this.availability.createAll = Styles.AVAILABILITY.DISABLED;

				TestAPI.createAllData()
					.then(() => {
						this.icons.createAll = Styles.ICONS.DONE;

						$timeout(() => {
							this.icons.createAll = Styles.ICONS.NO_ICON;
							this.availability.createAll = Styles.AVAILABILITY.ENABLED;
						}, RESULT_DELAY);
					})
					.catch(error => {
						console.error(error);
						this.icons.createAll = Styles.ICONS.ERROR;
					});
			};
		}
	});

}());
