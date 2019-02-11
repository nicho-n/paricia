	var useLaserHelpers = false;
var clock = new THREE.Clock();
	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();
//	var scene;
	var hitCount = 0;
//	var go = 0;
	var maxLasers = 16;
	var nActive = 0;
	var maxLaserDist = -1000; // distance before laser disappears
	var beamLength = 100; // length of beam geometry
	var laserVelocity = 1000; // speed of laser beam
	var lasers = []; // array of laser mesh objects
	var collisionDist = beamLength; // distance to consider collision

	var laserRadius = 0.5;
	var laserGeom = new THREE.CylinderGeometry(laserRadius,laserRadius,beamLength, 4);
	laserGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, beamLength/2, 0));
	laserGeom.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
	var laserMat = new THREE.MeshPhongMaterial({
		ambient : 0,
		emissive : 0xff0000,
		color : 0xff0000,
		specular : 0x101010,
		shininess: 20
	});

	// initialize lasers:
function startLasers(){
	for (var i = 0; i < maxLasers; i++) {
		//lasers.push(new THREE.Line(laserGeom, laserMat));
		lasers.push(new THREE.Mesh(laserGeom, laserMat));
		lasers[i].time = 0;
		lasers[i].dir = new THREE.Vector3(0,0,0);
		lasers[i].active = false;
		//lasers[i].visible = false;
		lasers[i].light = new THREE.PointLight( 0xff0000, 0, 300 );

		// light helper:
		if (useLaserHelpers) {
			lasers[i].light.intensity = 1; // otherwise helper is black
			var pointLightHelper=new THREE.PointLightHelper(lasers[i].light,10);
			scene.add(pointLightHelper);
			lasers[i].light.intensity = 0;
		}

		scene.add(lasers[i]);
		lasers[i].add(lasers[i].light); // ???
	}
//	go = 1;
}

	function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	}

	function onMouseDown(event) {
		raycaster.setFromCamera(mouse, camera);
		var zAxis = new THREE.Vector3(0, 0, -1);

		for (var i = 0; i < maxLasers; i++) { // find available laser & set
			if (!lasers[i].active) {
				nActive ++;
				lasers[i].active = true;
				lasers[i].visible = true;
				lasers[i].time = 0;
				lasers[i].position.copy(camera.position);
				lasers[i].dir.copy(raycaster.ray.direction);
				//lasers[i].lookAt(raycaster.ray.direction);
				lasers[i].light.intensity = 1;
				break;
			}
			// else look for next available laser
		}

		//document.getElementById("laserSound").play();
	}

	function animateLasers( t ) {
		var newPos = new THREE.Vector3(0,0,0);
		var collisions = [];

		for (var i = 0; i < lasers.length; i++) {
			if (lasers[i].active) {
				lasers[i].time += t;
				newPos.copy(lasers[i].position);
				newPos.multiplyScalar(lasers[i].time * laserVelocity);
				lasers[i].position.copy(newPos);
				//lasers[i].rotation.x = Math.PI/2;
				lasers[i].lookAt(lasers[i].dir);
				var kill_this_laser = false;

				raycaster.set(lasers[i].position, lasers[i].dir);
			//	intersects = raycaster.intersectObjects(planets);
			//	if (intersects.length > 0 && intersects[0].distance < collisionDist) {
			//		hitCount++;
			//		var obj = intersects[i].object;
					//obj.material.emissive.setHex(0x00ff00);
			//		spawnPlanet(obj);
			//		kill_this_laser = true;
				}
//
				// check max distance for laser:
				if (lasers[i].position.z < maxLaserDist) {
					kill_this_laser = true;
				}

				if (kill_this_laser) killLaser(i);
			}
		}

	function killLaser(i) {
		nActive--;
		lasers[i].active = false;
		lasers[i].visible = false;
		lasers[i].light.intensity = 0;
	}

	window.addEventListener('mousemove', onMouseMove, false);
	window.addEventListener('mousedown', onMouseDown, false);
