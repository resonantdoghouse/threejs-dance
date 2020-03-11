/* Code originally from https://www.udemy.com/create-a-3d-multi-player-game-using-threejs-and-socketio/
A few updates to change to dance moves with button triggers.
FBX model and animations from: https://www.mixamo.com
*/

document.addEventListener('DOMContentLoaded', function() {
  const game = new Game();
  window.game = game; //For debugging only
});

class Game {
  constructor() {
    if (WEBGL.isWebGLAvailable() === false) {
      document.body.appendChild(WEBGL.getWebGLErrorMessage());
    }

    this.container;
    this.player = {};
    this.animations = {};
    this.stats;
    this.controls;
    this.camera;
    this.scene;
    this.renderer;

    this.container = document.createElement('div');
    this.container.style.height = '100%';
    document.body.appendChild(this.container);

    const game = this;
    this.anims = [
      'Pointing Gesture',
      'Hip Hop Dancing',
      'Chicken Dance',
      'Locking Hip Hop Dance',
      'Ymca Dance'
    ];

    this.assetsPath = 'https://testinggrounds.info/share/';

    this.clock = new THREE.Clock();

    this.init();

    window.onError = function(error) {
      console.error(JSON.stringify(error));
    };
  }

  init() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    this.camera.position.set(0, 200, 500);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa0a0a0);
    this.scene.fog = new THREE.Fog(0xa0a0a0, 700, 1800);

    let light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 200, 0);
    this.scene.add(light);

    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 200, 100);
    light.castShadow = true;
    light.shadow.camera.top = 180;
    light.shadow.camera.bottom = -100;
    light.shadow.camera.left = -120;
    light.shadow.camera.right = 120;
    this.scene.add(light);

    // ground
    const mesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(4000, 4000),
      new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
    );

    mesh.rotation.x = -Math.PI / 2;
    // mesh.position.y = -100;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const grid = new THREE.GridHelper(4000, 40, 0x000000, 0x000000);
    //grid.position.y = -100;
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    this.scene.add(grid);

    // progress bar, fake it till you make it https://blackthread.io/blog/progress-bar/
    const progressBar = document.getElementById('progress-bar');
    const onProgress = xhr => {
      if (xhr.lengthComputable) {
        let percentComplete = Math.floor((xhr.loaded / xhr.total) * 100);
        progressBar.innerHTML = `<h2>Loading model...</h2> <p>${percentComplete}%</p>`;
        if (percentComplete >= 100) {
          detachElem(progressBar);
        }
      }
    };

    const detachElem = node => {
      return node.parentElement.removeChild(node);
    };

    const onError = err => console.log(err);

    // model
    const loader = new THREE.FBXLoader();
    const game = this;

    loader.load(
      `${this.assetsPath}fbx/Knight.fbx`,
      function(object) {
        object.mixer = new THREE.AnimationMixer(object);
        game.player.mixer = object.mixer;
        game.player.root = object.mixer.getRoot();

        object.name = 'Knight';

        object.traverse(function(child) {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = false;
          }
        });

        game.scene.add(object);
        game.player.object = object;
        game.animations.Idle = object.animations[0];

        game.loadNextAnim(loader);
      },
      onProgress,
      onError
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    this.controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls.target.set(0, 100, 0);
    this.controls.update();

    window.addEventListener(
      'resize',
      function() {
        game.onWindowResize();
      },
      false
    );
  }

  loadNextAnim(loader) {
    let anim = this.anims.pop();
    const game = this;
    loader.load(`${this.assetsPath}fbx/anims/${anim}.fbx`, function(object) {
      game.animations[anim] = object.animations[0];
      if (game.anims.length > 0) {
        game.loadNextAnim(loader);
      } else {
        delete game.anims;
        game.action = 'Idle';
        game.animate();
      }
    });
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  set action(name) {
    const action = this.player.mixer.clipAction(this.animations[name]);
    action.time = 0;
    this.player.mixer.stopAllAction();
    this.player.action = name;
    this.player.actionTime = Date.now();
    this.player.actionName = name;
    action.fadeIn(0.5);
    action.play();
  }

  get action() {
    if (this.player === undefined || this.player.actionName === undefined)
      return '';
    return this.player.actionName;
  }

  toggleAnimation(animName) {
    console.log(animName);
    switch (animName) {
      case 'Idle':
        game.action = animName;
        break;
      case 'Chicken Dance':
        game.action = animName;
        break;
      case 'Pointing Gesture':
        game.action = animName;
        break;
      case 'Hip Hop Dancing':
        game.action = animName;
        break;
      case 'Locking Hip Hop Dance':
        game.action = animName;
        break;
      case 'Ymca Dance':
        game.action = animName;
        break;
    }
  }

  animate() {
    const game = this;
    const dt = this.clock.getDelta();

    requestAnimationFrame(function() {
      game.animate();
    });

    if (this.player.mixer !== undefined) this.player.mixer.update(dt);

    this.renderer.render(this.scene, this.camera);
  }
}
