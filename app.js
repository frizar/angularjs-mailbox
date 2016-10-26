;(function() {
	'use strict';

	const TEST_API_RESPONSE_DELAY = 0;
	const TEST_API_VERSION = 'v1';
	const TEST_API_NAMESPACE = 'vschekin';
	const TEST_API_URL = `https://test-api.javascript.ru/${TEST_API_VERSION}/${TEST_API_NAMESPACE}`;
	const TEST_API_URL_DEFERRED = `https://test-api.javascript.ru/${TEST_API_VERSION}/${TEST_API_NAMESPACE}?delay=${TEST_API_RESPONSE_DELAY}`;
	const RESULT_DELAY = 3000;

	const APP = angular.module('mailboxApp', ['ui.router']);

	APP.config(function($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('/mail');

		$stateProvider.state('mail', {
			name: 'mail',
			url: '/mail',
			template: `<mail-list />`
		});

		$stateProvider.state({
			abstract: true,
			name: 'contacts',
			url: '/contacts',
			template: `<ui-view />`
		});

		$stateProvider.state({
			name: 'contacts.list',
			url: '/list',
			template: `<contacts-list />`
		});

		$stateProvider.state({
			name: 'contacts.user',
			url: '/user/:userId',
			template: `<contacts-user user-id="userId" />`,
			controller: function($scope, $stateParams) {
				$scope.userId = $stateParams.userId;
			}
		});

		$stateProvider.state({
			name: 'test-api',
			url: '/test-api',
			template: `<test-api />`
		});
	});

	APP.service('UserService', function($http) {
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
			let beginUrl = 'https://randomuser.me/api/portraits';
			return `${beginUrl}/thumb/${avatarUrl.slice(beginUrl.length)}`;
		};

		this.getMediumImage = avatarUrl => {
			// example: https://randomuser.me/api/portraits/men/0.jpg
			let beginUrl = 'https://randomuser.me/api/portraits';
			return `${beginUrl}/med/${avatarUrl.slice(beginUrl.length)}`;
		};
	});

	APP.service('TestAPI', function($http) {
		let defaultUsers = [
			{
				'fullName': 'Santana Coffey',
				'email': 'santanacoffey@tellifly.com',
				'avatarUrl': 'https://randomuser.me/api/portraits/men/0.jpg',
				'birthdate': '2014-07-03',
				'gender': 'M',
				'address': '673 Lefferts Place, Swartzville, Virgin Islands, 1790'
			},
			{
				'fullName': 'Deirdre Boyer',
				'email': 'deirdreboyer@tellifly.com',
				'avatarUrl': 'https://randomuser.me/api/portraits/women/0.jpg',
				'birthdate': '2016-01-05',
				'gender': 'F',
				'address': '888 Livonia Avenue, Winesburg, Vermont, 7174'
			},
			{
				'fullName': 'Rachael Skinner',
				'email': 'rachaelskinner@tellifly.com',
				'avatarUrl': 'https://randomuser.me/api/portraits/women/1.jpg',
				'birthdate': '2015-02-04',
				'gender': 'F',
				'address': '589 Verona Street, Kerby, Alabama, 9026'
			},
			{
				'fullName': 'Crawford Barber',
				'email': 'crawfordbarber@tellifly.com',
				'avatarUrl': 'https://randomuser.me/api/portraits/men/1.jpg',
				'birthdate': '2014-07-27',
				'gender': 'M',
				'address': '407 Dewey Place, Albrightsville, Maine, 4848'
			},
			{
				'fullName': 'Howell Cole',
				'email': 'howellcole@tellifly.com',
				'avatarUrl': 'https://randomuser.me/api/portraits/men/2.jpg',
				'birthdate': '2014-02-13',
				'gender': 'M',
				'address': '215 Allen Avenue, Marne, South Dakota, 8742'
			},
			{
				'fullName': 'Fern Salazar',
				'email': 'fernsalazar@tellifly.com',
				'avatarUrl': 'https://randomuser.me/api/portraits/women/2.jpg',
				'birthdate': '2014-08-28',
				'gender': 'F',
				'address': '321 Polhemus Place, Waiohinu, Minnesota, 3766'
			},
			{
				'fullName': 'Ida Bullock',
				'email': 'idabullock@tellifly.com',
				'avatarUrl': 'https://randomuser.me/api/portraits/women/3.jpg',
				'birthdate': '2015-11-14',
				'gender': 'F',
				'address': '560 Kingston Avenue, Greer, North Carolina, 5899'
			},
			{
				'fullName': 'Hope Moody',
				'email': 'hopemoody@tellifly.com',
				'avatarUrl': 'https://randomuser.me/api/portraits/women/4.jpg',
				'birthdate': '2014-03-13',
				'gender': 'F',
				'address': '295 Kossuth Place, Dowling, Wisconsin, 4553'
			},
			{
				'fullName': 'Beverly Evans',
				'email': 'beverlyevans@tellifly.com',
				'avatarUrl': 'https://randomuser.me/api/portraits/women/5.jpg',
				'birthdate': '2014-12-29',
				'gender': 'F',
				'address': '431 Beacon Court, Eureka, Virginia, 5177'
			},
			{
				'fullName': 'Valenzuela Velasquez',
				'email': 'valenzuelavelasquez@tellifly.com',
				'avatarUrl': 'https://randomuser.me/api/portraits/men/3.jpg',
				'birthdate': '2014-09-21',
				'gender': 'M',
				'address': '508 Cambridge Place, Trucksville, Puerto Rico, 6877'
			}
		];
		let defaultMailboxes = [
			{
				'title': 'inbox'
			},
			{
				'title': 'outbox'
			},
			{
				'title': 'trash'
			},
			{
				'title': 'drafts'
			},
			{
				'title': 'spam'
			}
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
			return $http.delete(TEST_API_URL_DEFERRED)
				.then(response => response.data)
				.catch(error => error);
		};

		this.createAllData = () => {
			$http.post(TEST_API_URL_DEFERRED, {
				users: defaultUsers
			});

			return $http.post(TEST_API_URL_DEFERRED, {
				mailboxes: defaultMailboxes
			})
				.then(response => response.data.mailboxes)
				.then(mailboxes => {
					// we need to know inbox _id before we can POST default letters
					let inbox = mailboxes.find(mailbox => mailbox.title === 'inbox');

					return defaultLetters.map(letter => {
						letter.mailbox = inbox._id;
						return letter;
					});
				})
				.then(letters => {
					return $http.post(TEST_API_URL_DEFERRED, {
						letters: letters
					})
						.then(response => 'ok');
				});
		};
	});

	APP.component('mailList', {
		template: `soon...`,
	});

	APP.component('contactsList', {
		templateUrl: 'templates/contacts/list.html',
		controller: function(UserService) {
			this.users = [];

			this.getThumb = avatarUrl => UserService.getThumbImage(avatarUrl);

			UserService.getAll()
				.then(users => {
					this.users = users;
				})
				.catch(error => {
					console.error(error);
				});
		}
	});

	APP.component('contactsUser', {
		bindings: {
			userId: '<'
		},
		templateUrl: 'templates/contacts/user.html',
		controller: function(UserService) {
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
					this.user = user;
				})
				.catch(error => {
					console.error(error);
				});
		}
	});

	APP.component('testApi', {
		templateUrl: 'templates/test-api/index.html',
		controller: function(TestAPI, $timeout) {
			const ICONS = {
				NO_ICON: '',
				SPINNER: 'fa fa-spinner fa-pulse fa-fw',
				DONE: 'fa fa-check',
				ERROR: 'fa fa-exclamation-triangle'
			};

			const ACTIVES = {
				ENABLED: '',
				DISABLED: 'disabled',
			};

			this.requestIcons = {
				removeAll: '',
				createAll: ''
			};

			this.requestActives = {
				removeAll: '',
				createAll: ''
			};

			this.removeAll = () => {
				if (this.requestActives.removeAll === ACTIVES.DISABLED) {
					return;
				}

				this.requestIcons.removeAll = ICONS.SPINNER;
				this.requestActives.removeAll = ACTIVES.DISABLED;

				TestAPI.removeAllData()
					.then(() => {
						this.requestIcons.removeAll = ICONS.DONE;

						$timeout(() => {
							this.requestIcons.removeAll = ICONS.NO_ICON;
							this.requestActives.removeAll = ACTIVES.ENABLED;
						}, RESULT_DELAY);
					})
					.catch(error => {
						console.error(error);
						this.requestIcons.removeAll = ICONS.ERROR;
					});
			};

			this.createAll = () => {
				if (this.requestActives.createAll === ACTIVES.DISABLED) {
					return;
				}

				this.requestIcons.createAll = ICONS.SPINNER;
				this.requestActives.createAll = ACTIVES.DISABLED;

				TestAPI.createAllData()
					.then(() => {
						this.requestIcons.createAll = ICONS.DONE;

						$timeout(() => {
							this.requestIcons.createAll = ICONS.NO_ICON;
							this.requestActives.createAll = ACTIVES.ENABLED;
						}, RESULT_DELAY);
					})
					.catch(error => {
						console.error(error);
						this.requestIcons.createAll = ICONS.ERROR;
					});
			};
		}
	});

}());
