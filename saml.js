'use strict';

angular.module('myApp',['ngCookies'])
.controller('samlctl', function($scope, $http, $httpParamSerializer, $window, $cookies){
	$scope.auth=function() {
		var host = "https://vra-01a.corp.local";
		var cks = angular.toJson($cookies.getAll());
		var req1 = {
			method: "GET",
			url: "/vcac/"
		};
		$http(req1).then( function(res1){
			console.log(res1);
			var req2 = {
				method: "POST",
				url: "/SAAS/auth/login/userstore",
				headers: {
					'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: $httpParamSerializer({
					dest: host + '/SAAS/auth/oauth2/authorize?response_type=code&client_id=csp-admin-4tlcFjacmQ&redirect_uri=' + host + '/vcac/org/vsphere.local/',
					userStoreDomain: {
						userStoreUuid: "e65fda77-688f-4294-ac46-be6f5295f2eb",
						userDomainUuid: "d04fa3be-3d63-4215-894a-ff5f4965cd61"
					},
					remember:true
				})
			};
			$http(req2).then(function(res2) {
				console.log(res2);
				var parser = new DOMParser();
				var doc = parser.parseFromString(res2.data, 'text/html');
				var reqId  = doc.getElementById('requestId').value;
				var ctx = doc.getElementById('authnContext').value;
				var relay = doc.getElementById('RelayState').value;
				console.log("requestID:" + reqId.value);
				console.log("RelayState:" + relay);
				console.log("ctx:" + ctx);
				
				var req3 = {
					method: 'POST',
					url: '/hc/3001/authenticate/',
					headers: {
						'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					data: $httpParamSerializer({
						acsUrl: 'https://vra-01a.corp.local/SAAS/t/VSPHERE.LOCAL/auth/saml/response',
						RelayState: relay,
						requestId: reqId,
						userstore: 'corp.local',
						authnContext: ctx,
						userNameTextFieldReadonly: false,
						username: 'tony',
						password: 'VMware1!',
						action: 'Sign in'
					})
				};
				
				$http(req3).then(function(res3) {
					console.log(res3);
					var parser = new DOMParser();
					var doc = parser.parseFromString(res3.data, 'text/html');
					var elemsamlres = doc.getElementsByName('SAMLResponse');
					var samlres = elemsamlres[0].value;
					var elemrelay = doc.getElementsByName('RelayState');
					var relay = elemrelay[0].value;
					console.log("samlresponse:" + samlres);
					console.log("relay:" + relay);

					var req4 = {
						method: 'POST',
						url: '/SAAS/t/VSPHERE.LOCAL/auth/saml/response',
						headers: {
							'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						data: $httpParamSerializer({
							SAMLResponse: samlres,
							RelayState: relay							
						})
					}
					
					$http(req4).then(function(res4) {
						console.log(res4);
						$window.open('/vcac/', '_blank');					
					});
				});
			});
		});
	};
	$scope.msg ="signed in!";
});