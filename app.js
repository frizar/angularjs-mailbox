;(function() {
	'use strict';

	const API_VERSION = 'v1';
	const API_NAMESPACE = 'vschekin';
	const API_RESPONSE_DELAY = 0;
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
			name: 'cp',
			url: '/cp',
			template: `<cp />`
		});
	});

	APP.service('UserService', function($http) {
		this.getAll = () => {
			return $http.get(`https://test-api.javascript.ru/${API_VERSION}/${API_NAMESPACE}/users?delay=${API_RESPONSE_DELAY}`)
				.then(response => response.data)
				.catch(error => error);
		};

		this.getById = userId => {
			return $http.get(`https://test-api.javascript.ru/${API_VERSION}/${API_NAMESPACE}/users/${userId}?delay=${API_RESPONSE_DELAY}`)
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

	APP.service('CP', function($http, $timeout) {
		const users = [
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
		const mailboxes = [
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
		const letters = [
			{
				'mailbox': '57ff50163727f3110444ca81',
				'subject': 'eiusmod eiusmod nisi',
				'body': 'Consectetur ipsum minim cupidatat anim nulla. Laboris sunt minim exercitation do elit qui cillum reprehenderit sint quis magna sint elit laborum. Nulla proident aute cupidatat laborum consequat in Lorem adipisicing esse. Reprehenderit sit quis cillum esse adipisicing cupidatat. Voluptate ea fugiat duis cillum mollit culpa nulla. Cillum ut cupidatat laboris excepteur proident proident nostrud labore. Exercitation et in voluptate aliqua irure culpa laborum sit deserunt ea mollit.\r\n',
				'to': 'rochamullins@netplax.com'
			},
			{
				'mailbox': '57ff50163727f3110444ca81',
				'subject': 'commodo cillum esse',
				'body': 'Occaecat ea et id eu nostrud. In aliqua ea incididunt eu reprehenderit nisi laboris dolor tempor. Mollit voluptate officia magna labore consectetur exercitation aute culpa.\r\n',
				'to': 'rochamullins@netplax.com'
			},
			{
				'mailbox': '57ff50163727f3110444ca81',
				'subject': 'labore nulla minim',
				'body': 'Nostrud aute culpa ipsum esse Lorem consectetur aliqua adipisicing tempor reprehenderit dolore aute. Fugiat aute dolor consectetur ut consectetur tempor sit qui ut ex cupidatat labore. Sint anim officia eiusmod mollit officia. Exercitation anim nostrud ad sit eu. Cillum proident labore pariatur proident elit laboris nulla nisi pariatur pariatur. Velit consequat est officia velit excepteur officia cillum.\r\n',
				'to': 'rochamullins@netplax.com'
			},
			{
				'mailbox': '57ff50163727f3110444ca81',
				'subject': 'anim do adipisicing',
				'body': 'Amet tempor tempor nostrud elit velit esse pariatur aliqua. Ea ex ut labore ad irure aliquip Lorem elit veniam fugiat. Aliquip cillum mollit incididunt sint.\r\n',
				'to': 'rochamullins@netplax.com'
			},
			{
				'mailbox': '57ff50163727f3110444ca81',
				'subject': 'quis et eiusmod',
				'body': 'Et consectetur dolor sit dolor sit consectetur voluptate. Eu ut nulla ipsum qui esse. Dolor et sit sunt in eiusmod eiusmod nostrud labore sunt tempor est cupidatat officia. Velit nostrud cupidatat occaecat aute duis consequat id nisi ea laborum dolore nisi id est. Laborum irure laborum dolore dolor id dolore deserunt do ut exercitation quis duis.\r\n',
				'to': 'rochamullins@netplax.com'
			},
			{
				'mailbox': '57ff50163727f3110444ca81',
				'subject': 'ea quis exercitation',
				'body': 'Enim laborum fugiat ut irure occaecat pariatur. Commodo cupidatat occaecat laboris amet in quis in ullamco labore irure laborum incididunt veniam et. Exercitation dolore ad exercitation irure culpa nostrud esse in in aliquip.\r\n',
				'to': 'rochamullins@netplax.com'
			},
			{
				'mailbox': '57ff50163727f3110444ca81',
				'subject': 'fugiat ipsum deserunt',
				'body': 'Fugiat anim anim in exercitation dolor esse. Duis magna eu officia voluptate ullamco incididunt commodo sint anim ex laborum anim. Laboris velit eu cupidatat enim aute occaecat nostrud velit ad fugiat quis eu fugiat. Non nulla laborum adipisicing excepteur exercitation velit cillum occaecat commodo eu anim proident commodo. Reprehenderit dolore id dolore ex aliqua ex non eiusmod. Veniam Lorem proident ea minim Lorem consequat ea proident Lorem exercitation aliqua magna minim.\r\n',
				'to': 'rochamullins@netplax.com'
			},
			{
				'mailbox': '57ff50163727f3110444ca81',
				'subject': 'quis duis veniam',
				'body': 'Proident occaecat reprehenderit esse elit amet magna ex consectetur ullamco deserunt est proident ex. Duis adipisicing elit consequat id mollit elit deserunt. Fugiat ex nisi excepteur et duis anim sunt. Non aute labore eiusmod nulla do occaecat laboris minim pariatur irure. Deserunt et aliqua minim do est nisi id elit proident Lorem do dolor consectetur enim. Sunt cupidatat sit pariatur irure. Lorem dolor culpa anim commodo sit pariatur voluptate do labore irure reprehenderit tempor id.\r\n',
				'to': 'rochamullins@netplax.com'
			},
			{
				'mailbox': '57ff50163727f3110444ca81',
				'subject': 'excepteur nisi enim',
				'body': 'Reprehenderit ullamco incididunt veniam eu commodo mollit consequat ex qui. Exercitation magna exercitation labore ipsum excepteur id sit elit ut ut deserunt incididunt fugiat excepteur. Excepteur consequat irure irure reprehenderit proident nisi id qui labore exercitation enim. Mollit consectetur aute incididunt mollit eu pariatur. Adipisicing laborum aute sunt ullamco velit non. Ad irure ex eiusmod adipisicing amet in officia magna velit labore adipisicing tempor anim laboris.\r\n',
				'to': 'rochamullins@netplax.com'
			},
			{
				'mailbox': '57ff50163727f3110444ca81',
				'subject': 'sunt in culpa',
				'body': 'Aliquip adipisicing proident commodo pariatur do anim voluptate tempor sit proident aute eiusmod. Reprehenderit et consectetur magna tempor dolore sunt adipisicing ea voluptate. Occaecat est dolor fugiat Lorem quis. Eiusmod et laborum irure dolore. Consectetur pariatur irure dolore qui eiusmod laboris enim incididunt exercitation voluptate occaecat. Laboris duis eu enim ex.\r\n',
				'to': 'rochamullins@netplax.com'
			}
		];

		const data = {
			users: users,
			mailboxes: mailboxes,
			letters: letters
		};

		const requestStatus = {
			removeAll: {
				users: null, // null, 'loading', 'ok', 'error'
				mailboxes: null,
				letters: null
			},
			createAll: {
				users: null,
				mailboxes: null,
				letters: null
			}
		};

		const cleanRequestStatusDeferred = (requestType, dataType) => {
			$timeout(() => {
				requestStatus[requestType][dataType] = null;
			}, RESULT_DELAY);
		};

		this.getRequestStatusActiveClass = (requestType, dataType) => {
			let status = requestStatus[requestType][dataType];

			if (status !== null) {
				return 'disabled';
			}

			return '';
		};

		this.getRequestStatusIconClass = (requestType, dataType) => {
			let status = requestStatus[requestType][dataType];

			if (status === 'loading') {
				return 'fa fa-spinner fa-pulse fa-fw';
			} else if (status === 'ok') {
				return 'fa fa-check';
			} else if (status === 'error') {
				return 'fa fa-exclamation-triangle';
			}

			return '';
		};

		this.removeAll = dataType => {
			if (requestStatus.removeAll[dataType]) {
				return;
			}

			let url = `https://test-api.javascript.ru/${API_VERSION}/${API_NAMESPACE}/${dataType}?delay=${API_RESPONSE_DELAY}`;
			let promise = $http.delete(url);
			requestStatus.removeAll[dataType] = 'loading';

			promise
				.then(response => {
					requestStatus.removeAll[dataType] = 'ok';

					cleanRequestStatusDeferred('removeAll', dataType);
				})
				.catch(error => {
					console.error(error);

					requestStatus.removeAll[dataType] = 'error';
					cleanRequestStatusDeferred('removeAll', dataType);
				});
		};

		this.createAll = dataType => {
			if (requestStatus.createAll[dataType]) {
				return;
			}

			let url = `https://test-api.javascript.ru/${API_VERSION}/${API_NAMESPACE}?delay=${API_RESPONSE_DELAY}`;
			let promise = $http.post(url, {
				[dataType]: data[dataType]
			});
			requestStatus.createAll[dataType] = 'loading';

			promise
				.then(response => {
					requestStatus.createAll[dataType] = 'ok';

					cleanRequestStatusDeferred('createAll', dataType);
				})
				.catch(error => {
					console.error(error);

					requestStatus.createAll[dataType] = 'error';
					cleanRequestStatusDeferred('createAll', dataType);
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

	APP.component('cp', {
		templateUrl: 'templates/cp/index.html',
		controller: function(CP) {
			this.getRequestStatusActiveClass = (requestType, dataType) => {
				return CP.getRequestStatusActiveClass(requestType, dataType);
			};

			this.getRequestStatusIconClass = (requestType, dataType) => {
				return CP.getRequestStatusIconClass(requestType, dataType);
			};

			this.removeAll = dataType => {
				CP.removeAll(dataType);
			};

			this.createAll = dataType => {
				CP.createAll(dataType);
			};
		}
	});

}());
