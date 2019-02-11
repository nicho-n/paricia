if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var MARGIN = 0;
var SCREEN_HEIGHT = window.innerHeight - MARGIN * 2;
var SCREEN_WIDTH  = window.innerWidth;
var textureLoader = new THREE.TextureLoader();
var radius = 6371;
var spheres = [];
var clouds = [];
var tilt = 0.41;
var rotationSpeed = 0.02;
var cloudsScale = 1.005;
var moonScale = 0.23;
var composer;
var scene;
var clock = new THREE.Clock();
//var d, dPlanet, dMoon, dMoonVec = new THREE.Vector3();
var camera;
var meshMoon;
var meshPlanet;
var controls;
var player;
var test;
var messages;
var textlabels = [];
var players = {};
var socket = io();
var renderedPlayers = {};
var playerID = -1;
var spaceStuff = [];
var loader;
var conencted = false;
var playerInfo = "";
var loginWindow = 0;
var planetWindow = 0;
var go = 0;
var laserClass = 0;
var isOpen = 0;
var characterWindow = new WindowPane("character", "character.html", "500px", "300px");
init();
animate();

document.addEventListener("keypress", function onPress(event) {
    if (event.key == "c") {
                if (characterWindow.isOpen){
			characterWindow.remove();
		}
		else {
			characterWindow.open();
//			buildCharacterWindow();
		}
    }
});

function onMouseDown(event){
	var clickArea = document.getElementById("clickArea");
	if (event.target == clickArea){
		if (laserClass == 0)
			laserClass = new Laser(0, 0);
		laserClass.go();
	}
}

function loadSpaceStuff(label, i, loader, name, x, y, z, sc){
	spaceStuff.push(new THREE.Object3D());
	spaceStuff[i].position.x = x;
	spaceStuff[i].position.y = y;
	spaceStuff[i].position.z = z;
	spaceStuff[i].scale.set (sc,sc,sc);
	//spaceStuff[i].updateMatrix();
	loader.load(name,
		function (object){
			spaceStuff[i].add(object);
		},
	);

	var newDir = new THREE.Vector3(0, 0, 0);
	var pos = new THREE.Vector3();
	pos.addVectors(newDir, spaceStuff[i].position);
	spaceStuff[i].lookAt(pos);
	scene.add(spaceStuff[i]);

        var text = _createTextLabel();
        text.setHTML(label);
        text.setParent(spaceStuff[i]);
        this.textlabels.push(text);
        this.container.appendChild(text.element);


}


function loadOtherPlayer(i, loader){
	if (players[i] != null){
	renderedPlayers[i] = new THREE.Object3D();
       	renderedPlayers[i].position.x = players[i].x;
     	renderedPlayers[i].position.y = players[i].y;
        renderedPlayers[i].position.z = players[i].z;
//	renderedPlayers[i].scale.set(0.5,0.5,0.5);
        loader.load('spacefighter.obj',
        	function ( object ) {
                	renderedPlayers[i].add(object);
                },
        );
        //renderedPlayers[i].scale.set(50,50,50);

        	scene.add(renderedPlayers[i]);
	}

	var text = _createTextLabel();
        text.setHTML(players[i].username);
        text.setParent(renderedPlayers[i]);
        this.textlabels.push(text);
        this.container.appendChild(text.element);

	var hmm = document.getElementById("ok");
	if (players[i].username != undefined)
		$('#ok').append(players[i].username + '<br>');

}

function loadPlayer(username){
        if (loginWindow != 0) {
		loginWindow.remove();
		delete loginWindow;
	}
        playerInfo = new Player(username,0,0,0,31845);
        player = new THREE.Object3D();
        player.position.x = -728;
        player.position.y = -203
        player.position.z = 25774;
//        player.position.x = 0;
//        player.position.y = 70;
//        player.position.z = 500;

	// load a resource

        loader.load('spacefighter.obj',
                function ( object ) {
                        player.add(object);
                },
        );
	//player.scale.set(, 50, 50);
	playerInfo.username = username;
        playerInfo.x = player.position.x;
        playerInfo.y = player.position.y;
        playerInfo.z = player.position.z;
        scene.add(player);
        //camera = new THREE.PerspectiveCamera(25, SCREEN_WIDTH / SCREEN_HEIGHT, 50, 1e7);
        player.add(camera);
        camera.position.set(0, 70, 500);
        controls = new THREE.FlyControls(player);

        controls.movementSpeed = 1000;
        controls.domElement = container;
        controls.rollSpeed = Math.PI / 24;
        controls.autoForward = false;
        controls.dragToLook = false;

        loadSpaceStuff("Dock", 0, loader, 'spacedock.obj', -560, -500, 25000, 250);
        loadSpaceStuff("Zenith", 1, loader, 'station.obj', 3860, 2350, 35593, 1000);
        loadSpaceStuff("Dan-zaw", 2, loader, 'splitm1p.obj', -860, 0, 35593, .03);
        loadSpaceStuff("Qweqwe", 3, loader, 'spacefighter.obj', -260, 0, 35593, .5);

        planetWindow = new WindowPane("Planet Info", "planet.html", "500px", "300px");
	planetWindow.open();
	socket.emit('player joined', playerInfo);
        $('#ok').append(username + '<br>');
        window.addEventListener('mousedown', onMouseDown, false);

}

function init(){

	socket.on('add current players', function(allPlayers){
		players = allPlayers;
		players[playerID] = 0;
	});

	socket.on('client disconnecting', function(playerTuple){
		scene.remove(renderedPlayers[playerTuple[0]]);
                delete players[playerTuple[0]];
		delete renderedPlayers[playerTuple[0]];
	//	delete players[playerTuple[1]];
	});

	socket.on('player joined', function(newPlayerTuple){
		players[newPlayerTuple[0]] = newPlayerTuple[1];
		loadOtherPlayer(newPlayerTuple[0], loader);
	});

	socket.on('position change', function (playerTuple){
		if (playerTuple[0] != playerID){
			players[playerTuple[0]] = playerTuple[1];
			renderedPlayers[playerTuple[0]].position.x = playerTuple[1].x;
			renderedPlayers[playerTuple[0]].position.y = playerTuple[1].y;
			renderedPlayers[playerTuple[0]].position.z = playerTuple[1].z;
		}
	});

	socket.on('receive player id', function(id){
		playerID = id;
	});

	function drawPlanet(radius, widthSegments, heightSegments, materialNormalMap, scene, texture, x, y, z){
                geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
                meshPlanet = new THREE.Mesh(geometry, materialNormalMap);
                meshPlanet.rotation.y = 0;
                meshPlanet.rotation.z = tilt;
                meshPlanet.position.set(x, y, z);
                scene.add(meshPlanet);
                spheres.push(meshPlanet);
                var materialClouds = new THREE.MeshLambertMaterial( {
                        map: textureLoader.load(texture),
                        transparent: true
                } );
                meshClouds = new THREE.Mesh(geometry, materialClouds);
                meshClouds.scale.set(cloudsScale, cloudsScale, cloudsScale);
                meshClouds.rotation.z = tilt;
                meshClouds.position.set(x, y, z);
                scene.add(meshClouds);
                clouds.push(meshClouds);

			var text = _createTextLabel();
      			text.setHTML("Planet 1");
      			text.setParent(meshPlanet);
      			this.textlabels.push(text);
      			this.container.appendChild(text.element);
        }

	function drawMoon(geometry, moonScale, radius, x, y, z){
                var materialMoon = new THREE.MeshLambertMaterial( {
                        map: textureLoader.load("textures/planets/moon_1024.jpg")
                } );
                meshMoon = new THREE.Mesh( geometry, materialMoon );
                meshMoon.position.set(x, y, z);
                meshMoon.scale.set(moonScale, moonScale, moonScale);
                scene.add(meshMoon);
                spheres.push(meshMoon);
        }

	container = document.createElement('div');
	pos = document.getElementById("pos");
	messages = document.getElementById("messages");
	document.body.appendChild(container);
        camera = new THREE.PerspectiveCamera(25, SCREEN_WIDTH / SCREEN_HEIGHT, 50, 1e7);
	scene = new THREE.Scene();
	loader = new THREE.OBJLoader();

	var dirLight = new THREE.DirectionalLight(0xffffff);
	var textlabels = [];
        dirLight.position.set(-1, 0, 1).normalize();
        scene.fog = new THREE.FogExp2(0x000000, 0.00000025);
	scene.add(dirLight);
	loginWindow = new WindowPane("login", "login.html", "490px", "220px");
	loginWindow.open();
	loginWindow.show();
        var materialNormalMap = new THREE.MeshPhongMaterial( {
        	specular: 0x333333,
                shininess: 15,
                map: textureLoader.load( "textures/planets/earth_atmos_2048.jpg" ),
                specularMap: textureLoader.load( "textures/planets/earth_specular_2048.jpg" ),
                normalMap: textureLoader.load( "textures/planets/earth_normal_2048.jpg" ), 
                normalScale: new THREE.Vector2( 0.85, 0.85 )
        } );

	var materialSunMap = new THREE.MeshPhongMaterial( {
        	specular: 0x333333,
               	shininess: 15,
                map: textureLoader.load( "textures/planets/suntexture.jpg" ),
                specularMap: textureLoader.load( "textures/planets/suntexture.jpg" ),
                normalMap: textureLoader.load( "textures/planets/suntexture.jpg" ), 
                normalScale: new THREE.Vector2( 0.85, 0.85 )
        } );

        drawPlanet(radius*2, 100, 50, materialSunMap, scene, "textures/planets/marstexture2.jpg", -2000, 4000, 0);
        drawMoon(geometry, moonScale, radius, 150000, 5000, 5000);
        //drawPlanet(radius*50, 100, 50, materialSunMap, scene, "textures/planets/suntexture.jpg", -32737, 7737, -44147);

	// stars
	var i, r = radius, starsGeometry = [ new THREE.Geometry(), new THREE.Geometry() ];
	for ( i = 0; i < 15000; i ++ ) {
		var vertex = new THREE.Vector3();
		vertex.x = Math.random() * 2 - 1;
		vertex.y = Math.random() * 2 - 1;
		vertex.z = Math.random() * 2 - 1;
		vertex.multiplyScalar( r );
		starsGeometry[ 0 ].vertices.push( vertex );
	}

	for ( i = 0; i < 15000; i ++ ) {
		var vertex = new THREE.Vector3();
		vertex.x = Math.random() * 2 - 1;
		vertex.y = Math.random() * 2 - 1;
		vertex.z = Math.random() * 2 - 1;
		vertex.multiplyScalar( r );
		starsGeometry[ 1 ].vertices.push( vertex );
	}

	var stars;
	var starsMaterials = [
		new THREE.PointsMaterial( { color: 0x555555, size: 2, sizeAttenuation: false } ),
		new THREE.PointsMaterial( { color: 0x555555, size: 1, sizeAttenuation: false } ),
		new THREE.PointsMaterial( { color: 0x333333, size: 2, sizeAttenuation: false } ),
		new THREE.PointsMaterial( { color: 0x3a3a3a, size: 1, sizeAttenuation: false } ),
		new THREE.PointsMaterial( { color: 0x1a1a1a, size: 2, sizeAttenuation: false } ),
		new THREE.PointsMaterial( { color: 0x1a1a1a, size: 1, sizeAttenuation: false } )
	];

	for ( i = 10; i < 30; i ++ ) {
		stars = new THREE.Points( starsGeometry[ i % 2 ], starsMaterials[ i % 6 ] );
		stars.rotation.x = Math.random() * 6;
		stars.rotation.y = Math.random() * 6;
		stars.rotation.z = Math.random() * 6;
		stars.scale.setScalar( i * 10 );
		stars.matrixAutoUpdate = false;
		stars.updateMatrix();
		scene.add( stars );
	}

	renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
        container.appendChild( renderer.domElement );
        //stats = new Stats();
        //container.appendChild( stats.dom );
        window.addEventListener( 'resize', onWindowResize, false );
        // postprocessing
        var renderModel = new THREE.RenderPass( scene, camera );
        var effectFilm = new THREE.FilmPass( 0.35, 0.75, 2048, false );
        effectFilm.renderToScreen = true;
        composer = new THREE.EffectComposer( renderer );
        composer.addPass( renderModel );
        composer.addPass( effectFilm );
       // loadSpaceDock(0, loader);
//	startLasers();
	var station = new Station();
}

function onWindowResize( event ) {
	SCREEN_HEIGHT = window.innerHeight;
        SCREEN_WIDTH  = window.innerWidth;
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
        camera.updateProjectionMatrix();
        composer.reset();
}

function animate() {
	requestAnimationFrame( animate );
       	render();
//        stats.update();
}

function render() {
	var delta = clock.getDelta();
	var newPos = new THREE.Vector3(0,0,0);
	//animate any active lasers
	for (var i = 0; i < lasers.length; i++){
		newPos.copy(lasers[i].dir);
		lasers[i].time += delta;
		newPos.multiplyScalar(lasers[i].time * laserVelocity);
		lasers[i].position.copy(newPos);
		lasers[i].lookAt(lasers[i].dir);
		raycaster.set(lasers[i].position, lasers[i].dir);

		 if (lasers[i].position.z < maxLaserDist) {
                 	scene.remove(lasers[i]);
			delete lasers[i];
			lasers.splice(i, 1);
                 }

	}

	for(var i=0; i<this.textlabels.length; i++)
        	this.textlabels[i].updatePosition();
        for (var i = 0; i < spheres.length; i++)
        	spheres[i].rotation.y += rotationSpeed * delta;
        for (var i = 0; i < clouds.length; i++)
       		clouds[i].rotation.y += 1.25 * rotationSpeed * delta;

	//controls.update(delta);
        composer.render(delta);
	renderer.render( scene, camera );
	if (playerInfo != ""){
        	pos.innerHTML = player.position.x + "," + player.position.y + "," + player.position.z;
	        controls.update(delta);
		if (player.position.x != playerInfo.x || player.position.y != playerInfo.y || player.position.z != playerInfo.z){
			playerInfo.x = player.position.x;
			playerInfo.y = player.position.y;
			playerInfo.z = player.position.z;
		socket.emit('position change', playerInfo);

		if (player.position.distanceTo(spaceStuff[0].position) < 1000){
			if (isOpen == 0){
				planetWindow.show();
				isOpen = 1;
			}
		}

		if (isOpen == 1){
			if (player.position.distanceTo(spaceStuff[0].position) > 1000){
				planetWindow.hide();
				isOpen = 0;
			}
		}

	}
	if (Object.keys(renderedPlayers).length < Object.keys(players).length)
		for (var key in players)
			if (!(key in renderedPlayers))
				loadOtherPlayer(key, loader);
	}
}

function _createTextLabel() {
	var div = document.createElement('div');
	div.className = 'text-label';
	div.style.position = 'absolute';
	div.style.width = 100;
	div.style.height = 100;
	div.innerHTML = "";
	div.style.top = -1000;
	div.style.left = -1000;
	var _this = this;

	return {
		element: div,
		parent: false,
		position: new THREE.Vector3(0,0,0),
		setHTML: function(html) {
			this.element.innerHTML = html;
		},
		setParent: function(threejsobj) {
			this.parent = threejsobj;
		},
		updatePosition: function() {
			if(parent) {
				this.position.copy(this.parent.position);
			}
			var coords2d = this.get2DCoords(this.position, _this.camera);
			this.element.style.left = coords2d.x + 'px';
			this.element.style.top = coords2d.y + 'px';
		},
		get2DCoords: function(position, camera) {
			var vector = position.project(camera);
			vector.x = (vector.x + 1)/2 * window.innerWidth;
			vector.y = -(vector.y - 1)/2 * window.innerHeight;
			return vector;
		}
	};
 }

function connect(username){
	var chat = document.getElementById("chat");
	var prompt = document.getElementById("usernameprompt");
//	username = prompt.value;
	var popup = document.getElementById("loginTop");
	var ok = document.getElementById("login");
        chat.contentWindow.postMessage(prompt.value, 'http://localhost:3004');
}


        window.addEventListener('mousedown', onMouseDown, false);

