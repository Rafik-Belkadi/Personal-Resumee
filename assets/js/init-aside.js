

const vec2 = new Vec2();

const init = () => {
  const content = document.querySelector(".aside-banner");
  const cursor = document.querySelector(".cursor");
  const dot = document.querySelector(".dot");
  const width = innerWidth;
  const height = innerHeight;
  const imgUrl = document.querySelector(".aside-banner").getAttribute('data-url')
  
  let mouse = {
    x: 0,
    y: 0
  };
  let lastmouse = { x: 0, y: 0 };

  const gl = {
    renderer: new THREE.WebGLRenderer({ antialias: true }),
    camera: new THREE.PerspectiveCamera(45, 1, 0.1, 10000),
    scene: new THREE.Scene(),
    loader: new THREE.TextureLoader(),
    clock: new THREE.Clock()
  };

  const textures = [
    imgUrl
  ];

  const loadCanvas = texturesLoaded => {
    const factors = textures.map(d => new THREE.Vector2(1, 1));
    let currentIndex = 0;

    const getPointSize = el => {
      const w = el.getBoundingClientRect().width / 2;
      const h = el.getBoundingClientRect().height / 2;
      return [w, h];
    };

    const [cWidth, cHeight] = getPointSize(cursor);
    const [dotWidth, dotHeight] = getPointSize(dot);

    const uniforms = {
      u_time: { type: "f", value: 0 },
      u_res: {
        type: "v2",
        value: new THREE.Vector2(width, height)
      },
      u_mouse: { type: "v2", value: new THREE.Vector2(0, 0) },
      u_directionMouse: { type: "v2", value: new THREE.Vector2(0, 0) },
      u_text0: { value: texturesLoaded[currentIndex] },
      u_progress: { type: "f", value: 0 },
      u_waveIntensity: { type: "f", value: 0 },
      u_direction: { type: "f", value: 1 },
      u_offset: { type: "f", value: 10 },
      u_volatility: { type: "f", value: 0 },
      u_textureFactor: { type: "v2", value: factors[0] }
    };

    const getPlaneSize = () => {
      const fovRadians = gl.camera.fov * Math.PI / 180;
      const viewSize = Math.abs(
        gl.camera.position.z * Math.tan(fovRadians / 2) * 2
      );

      return [viewSize * 1, viewSize];
    };

    const calculateAspectRatioFactor = (index, texture) => {
      const [width, height] = getPlaneSize();

      const windowRatio = content.offsetWidth / content.offsetHeight;
      const rectRatio = width / height * windowRatio;
      const imageRatio = texture.image.width / texture.image.height;

      let factorX = 1;
      let factorY = 1;
      if (rectRatio > imageRatio) {
        factorX = 1;
        factorY = 1 / rectRatio * imageRatio;
      } else {
        factorX = 1 * rectRatio / imageRatio;
        factorY = 1;
      }

      factors[index] = new THREE.Vector2(factorX, factorY);

      if (currentIndex === index) {
        uniforms.u_textureFactor.value = factors[index];
        uniforms.u_textureFactor.needsUpdate = true;
      }
    };

    const addScene = () => {
      gl.renderer.setSize(width, height);
      gl.renderer.setPixelRatio(devicePixelRatio);

      content.append(gl.renderer.domElement);

      gl.camera.position.z = 5;
      //gl.controls = new THREE.OrbitControls(gl.camera, gl.renderer.domElement);
      gl.scene.add(gl.camera);
      addMesh();
    };

    const addMesh = () => {
      const [width, height] = getPlaneSize();

      const geometry = new THREE.PlaneGeometry(width, height, 60, 60);
      const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: `
  uniform float u_progress;
  uniform float u_direction;
  uniform float u_waveIntensity;
  uniform float u_offset;
  uniform float u_time;
  
  varying vec2 vUv;
  void main(){
    
    vec3 pos = position.xyz;
    float dist = length(uv - .5);
    float maxDist = length(vec2(.5));
    float normDist = dist / maxDist;
    
    float stickOut = normDist;
    float stickIn = -normDist;
    float stickEff = mix(stickOut, stickIn, u_direction);
    
    float stick = .5;
    
    float waveIn = u_progress * (1./stick);
    float waveOut = -(u_progress - 1.) * (1./(1. - stick));
    float stickProg = min(waveIn, waveOut);
    
    float offIn = clamp(waveIn, 0., 1.);
    float offOut = clamp(1. - waveOut, 0., 1.);
    float offProg = mix(offIn, offOut, u_direction);

    pos.z += stickEff * u_offset * stickProg - u_offset * offProg;
    
    pos.z += sin(dist * 8. -  u_time * 10.) * u_waveIntensity;
    
    vUv = uv;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }`,
        fragmentShader: `  #define S(a,b,n) smoothstep(a,b,n)
  #define pi2 6.28318530718
  #define pi 3.14159265359
  
  uniform float u_time;
  uniform float u_volatility;
  
  uniform vec2 u_res;
  uniform vec2 u_mouse;
  uniform vec2 u_directionMouse;
  uniform vec2 u_textureFactor;
  uniform vec2 u_texture2Factor;

  uniform sampler2D u_text0;

  varying vec2 vUv;
  
  vec2 centeredAspectRatio(vec2 uvs, vec2 factor){
    return uvs * factor - factor / 2. + 0.5;
  }
  
  void main() {
    vec2 uv = vUv;
    vec2 st = (gl_FragCoord.xy - .5 * u_res) / min(u_res.x, u_res.y) * vec2(.4, 1.);
    vec2 mouse_normalized = (u_mouse - .5 * u_res) / min(u_res.x, u_res.y) * vec2(.4, 1.);
    
    float vel = u_volatility; 

    float dist = length(mouse_normalized - st);
    float m_color = S(.2, .01, dist);
       
    vec4 tex1 = vec4(1.);
    
    vel += vel * 2.;
    
    uv.x -= (sin(uv.y) * m_color * vel / 100.) * u_directionMouse.x;
    uv.y -= (sin(uv.x) * m_color * vel / 100.) * u_directionMouse.y;
    tex1.r = texture2D(u_text0, centeredAspectRatio(uv, u_textureFactor)).r;
    
    uv.x -= (sin(uv.y) * m_color * vel / 150.) * u_directionMouse.x;
    uv.y -= (sin(uv.x) * m_color * vel / 150.) * u_directionMouse.y;
    tex1.g = texture2D(u_text0, centeredAspectRatio(uv, u_textureFactor)).g;
    
    uv.x -= (sin(uv.y) * m_color * vel / 300.) * u_directionMouse.x;
    uv.y -= (sin(uv.x) * m_color * vel / 300.) * u_directionMouse.y;
    tex1.b = texture2D(u_text0, centeredAspectRatio(uv, u_textureFactor)).b;
           
    gl_FragColor = tex1;
  }`
      });

      gl.mesh = new THREE.Mesh(geometry, material);

      gl.scene.add(gl.mesh);
    };

    const onMouse = interval => {
      const velocity = vec2.dist(lastmouse, mouse) / interval;

      // volatility
      TweenLite.to(uniforms.u_volatility, 1, {
        value: Math.min(vec2.map(velocity, 0, 10, 10, 100), 1.4)
      });

      // mouse direction (edge -1, 1)
      TweenLite.to(uniforms.u_directionMouse.value, 1, {
        x: vec2.clamp(mouse.x - lastmouse.x, -1, 1),
        y: vec2.clamp(mouse.y - lastmouse.y, -1, 1)
      });

      lastmouse = { x: mouse.x, y: mouse.y };
    };

    const pointerMove = (el, m, w, h, t) => {
      TweenLite.to(el, t, {
        x: m.x - w,
        y: (innerHeight - m.y) - h
      })
    };

    const resize = () => {
const w = content.offsetWidth;
      const h = content.offsetHeight;

      gl.renderer.setSize(w, h);
      //gl.camera.aspect = w / h;

      uniforms.u_res.value.x = w;
      uniforms.u_res.value.y = h;

      for (let [i, texture] of texturesLoaded.entries()) {
        calculateAspectRatioFactor(i, texture);
      }

      gl.camera.updateProjectionMatrix();
    };

    content.addEventListener("mousemove", ({ clientX, clientY }) => {
      mouse.x = clientX;
      mouse.y = innerHeight - clientY;
      
      // mouse position
      TweenLite.to(uniforms.u_mouse.value, 1, {
        x: mouse.x,
        y: mouse.y
      });
      
      pointerMove(dot, mouse, dotWidth, dotHeight, .2);
      pointerMove(cursor, mouse, cWidth, cHeight, .5);
    });

    content.addEventListener("mousedown", () => {
      TweenLite.to(uniforms.u_direction, 1, {
        value: 0,
        ease: Elastic.easeOut.config(1, 0.9)
      });

      TweenLite.to(uniforms.u_progress, 0.7, {
        value: 1
      });

      TweenMax.to(uniforms.u_waveIntensity, 5, {
        value: 0.5
      });
    });

    content.addEventListener("mouseup", () => {
      TweenLite.to(uniforms.u_direction, 1, {
        value: 1,
        ease: Elastic.easeOut.config(1, 0.9)
      });

      TweenLite.to(uniforms.u_progress, 0.7, {
        value: 0
      });

      TweenLite.to(uniforms.u_waveIntensity, 0.7, {
        value: 0
      });
    });

    const render = () => gl.renderer.render(gl.scene, gl.camera);

    let start = performance.now();
    const update = () => {
      uniforms.u_time.value = gl.clock.getElapsedTime();

      const now = performance.now();
      const interval = now - start;

      onMouse(interval);

      start = now;

      render();
      requestAnimationFrame(update);
    };

    addScene();
    update();
    resize();
    window.addEventListener("resize", resize);
  };

  let texturesLoaded = [];
  textures.map((texture, i) => {
    gl.loader.load(texture, textLoaded => {
      texturesLoaded.push(textLoaded);
      if (i + 1 === textures.length) {
        loadCanvas(texturesLoaded);
      }
    });
  });
};

init();