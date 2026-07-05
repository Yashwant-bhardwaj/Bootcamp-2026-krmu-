import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as CANNON from "cannon-es";
import { motion } from "framer-motion";
import { Dices, Trash2, Bomb, Layers } from "lucide-react";

// ── Constants ──────────────────────────────────────────────────
const PALETTE = [
  0x6366f1, 0xec4899, 0x22d3ee, 0xf59e0b, 0x10b981, 0xf97316, 0xa855f7,
  0xef4444, 0x84cc16, 0x06b6d4,
];
const SHAPES = ["box", "sphere", "cylinder", "cone", "torus", "capsule"];
const MAX_CHARGE = 1400;
const GROUND_Y = 0;

const SHAPE_EMOJIS = {
  box: "⬛",
  sphere: "⚽",
  cylinder: "🥫",
  cone: "🔺",
  torus: "🍩",
  capsule: "💊",
};

function createThreeGeometry(shape, size) {
  switch (shape) {
    case "box":
      return new THREE.BoxGeometry(size, size, size);
    case "sphere":
      return new THREE.SphereGeometry(size * 0.55, 24, 24);
    case "cylinder":
      return new THREE.CylinderGeometry(size * 0.4, size * 0.4, size * 1.2, 20);
    case "cone":
      return new THREE.ConeGeometry(size * 0.45, size * 1.3, 16);
    case "torus":
      return new THREE.TorusGeometry(size * 0.38, size * 0.15, 12, 32);
    case "capsule":
      return new THREE.CapsuleGeometry(size * 0.3, size * 0.6, 8, 16);
    default:
      return new THREE.BoxGeometry(size, size, size);
  }
}

function createCannonShape(shape, size) {
  switch (shape) {
    case "box":
      return new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
    case "sphere":
      return new CANNON.Sphere(size * 0.55);
    case "cylinder":
      return new CANNON.Cylinder(size * 0.4, size * 0.4, size * 1.2, 12);
    case "cone":
      return new CANNON.Cylinder(0.01, size * 0.45, size * 1.3, 10);
    case "torus":
      return new CANNON.Sphere(size * 0.48);
    case "capsule":
      return new CANNON.Sphere(size * 0.42);
    default:
      return new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
  }
}

export default function Sandbox() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const worldRef = useRef(null);
  const controlsRef = useRef(null);
  const objectsRef = useRef([]);
  const sparksRef = useRef([]);
  const colorIndexRef = useRef(0);
  const isChargingRef = useRef(false);
  const chargeStartRef = useRef(0);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastFPSRef = useRef(0);

  const [selectedShape, setSelectedShape] = useState("box");
  const [props, setProps] = useState({
    size: 0.5,
    mass: 1.0,
    bounce: 0.3,
    friction: 0.4,
  });
  const [env, setEnv] = useState({ gravity: 20, windX: 0, windZ: 0 });
  const [objCount, setObjCount] = useState(0);
  const [fps, setFps] = useState(60);
  const [chargePct, setChargePct] = useState(0);
  const [charging, setCharging] = useState(false);

  const objects = useRef([]);
  const sparks = useRef([]);

  const nextColor = useCallback(() => {
    return PALETTE[colorIndexRef.current++ % PALETTE.length];
  }, []);

  const makeSpark = useCallback((pos, color) => {
    if (!sceneRef.current) return;
    const count = 8;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;
      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 5,
          Math.random() * 4 + 1,
          (Math.random() - 0.5) * 5,
        ),
      );
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color,
      size: 0.12,
      transparent: true,
      opacity: 1,
    });
    const pts = new THREE.Points(geo, mat);
    sceneRef.current.add(pts);
    sparks.current.push({ pts, velocities, life: 1.0 });
  }, []);

  const spawnObject = useCallback(
    (shape, size, mass, bounce, friction, position, velocity) => {
      if (!sceneRef.current || !worldRef.current) return;
      const color = nextColor();
      const geo = createThreeGeometry(shape, size);
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.45,
        metalness: 0.2,
        emissive: color,
        emissiveIntensity: 0.04,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      sceneRef.current.add(mesh);

      const objMat = new CANNON.Material("obj");
      const groundMat = new CANNON.Material("ground");
      const cc = new CANNON.ContactMaterial(groundMat, objMat, {
        friction,
        restitution: bounce,
      });
      const defaultMat = new CANNON.Material("default");
      const cc2 = new CANNON.ContactMaterial(defaultMat, objMat, {
        friction,
        restitution: bounce,
      });
      const cc3 = new CANNON.ContactMaterial(objMat, objMat, {
        friction,
        restitution: bounce * 0.8,
      });
      worldRef.current.addContactMaterial(cc);
      worldRef.current.addContactMaterial(cc2);
      worldRef.current.addContactMaterial(cc3);

      const body = new CANNON.Body({
        mass,
        material: objMat,
        allowSleep: true,
        sleepTimeLimit: 1,
        sleepSpeedLimit: 0.15,
      });
      body.addShape(createCannonShape(shape, size));
      body.position.set(position.x, position.y, position.z);
      if (velocity) body.velocity.set(velocity.x, velocity.y, velocity.z);
      body.angularVelocity.set(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
      );
      worldRef.current.addBody(body);

      objects.current.push({ mesh, body, shape, size, color });
      setObjCount(objects.current.length);
    },
    [nextColor],
  );

  const doThrow = useCallback(
    (power) => {
      if (!cameraRef.current) return;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), cameraRef.current);
      const origin = cameraRef.current.position.clone();
      const dir = raycaster.ray.direction.clone();
      const speed = 10 + power * 35;
      const spawnPos = origin.clone().addScaledVector(dir, 1.5);
      const vel = dir.clone().multiplyScalar(speed);
      spawnObject(
        selectedShape,
        props.size,
        props.mass,
        props.bounce,
        props.friction,
        spawnPos,
        vel,
      );
    },
    [selectedShape, props, spawnObject],
  );

  const explode = useCallback(() => {
    objects.current.forEach(({ body }) => {
      const dir = body.position.vsub(new CANNON.Vec3(0, 0, 0));
      const len = dir.length() || 1;
      dir.normalize();
      const force = 300 / (len * 0.4 + 1);
      body.wakeUp();
      body.applyImpulse(
        new CANNON.Vec3(
          dir.x * force,
          Math.abs(dir.y * force) + 40,
          dir.z * force,
        ),
        body.position,
      );
      body.angularVelocity.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
      );
    });
  }, []);

  const spawnRandom = useCallback(() => {
    const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const sz = 0.3 + Math.random() * 1.2;
    spawnObject(
      s,
      sz,
      0.5 + Math.random() * 5,
      Math.random() * 0.7,
      0.2 + Math.random() * 0.5,
      {
        x: (Math.random() - 0.5) * 6,
        y: 10 + Math.random() * 8,
        z: (Math.random() - 0.5) * 6,
      },
      { x: (Math.random() - 0.5) * 2, y: 0, z: (Math.random() - 0.5) * 2 },
    );
  }, [spawnObject]);

  const clearAll = useCallback(() => {
    if (!sceneRef.current || !worldRef.current) return;
    objects.current.forEach(({ mesh, body }) => {
      sceneRef.current.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      worldRef.current.removeBody(body);
    });
    objects.current = [];
    setObjCount(0);
  }, []);

  // ── Initialize Three.js + Cannon ────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d0d1a);
    scene.fog = new THREE.FogExp2(0x0d0d1a, 0.022);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      300,
    );
    camera.position.set(0, 8, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.mouseButtons = {
      LEFT: null,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    controls.touches = { ONE: null, TWO: THREE.TOUCH.DOLLY_ROTATE };
    controls.minDistance = 3;
    controls.maxDistance = 80;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    // Lighting
    const ambient = new THREE.AmbientLight(0x6070a0, 0.6);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfff4e0, 1.8);
    sun.position.set(12, 20, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 80;
    sun.shadow.camera.left = -25;
    sun.shadow.camera.right = 25;
    sun.shadow.camera.top = 25;
    sun.shadow.camera.bottom = -25;
    sun.shadow.bias = -0.001;
    sun.shadow.normalBias = 0.02;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x4060c0, 0.5);
    fill.position.set(-8, 5, -5);
    scene.add(fill);
    const rim = new THREE.PointLight(0x8866ff, 1.2, 40);
    rim.position.set(-10, 15, -10);
    scene.add(rim);

    // Ground
    const floorGeo = new THREE.PlaneGeometry(60, 60, 30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.9,
      metalness: 0.0,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = GROUND_Y;
    floor.receiveShadow = true;
    scene.add(floor);
    const grid = new THREE.GridHelper(60, 40, 0x2a2a4a, 0x1e1e35);
    grid.position.y = GROUND_Y + 0.002;
    scene.add(grid);

    // Physics world
    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -20, 0) });
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.allowSleep = true;
    world.solver.iterations = 20;
    worldRef.current = world;

    const groundMatC = new CANNON.Material("ground");
    const groundBody = new CANNON.Body({ mass: 0, material: groundMatC });
    groundBody.addShape(new CANNON.Plane());
    groundBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2,
    );
    groundBody.position.y = GROUND_Y;
    world.addBody(groundBody);

    const defaultMatC = new CANNON.Material("default");
    world.addContactMaterial(
      new CANNON.ContactMaterial(groundMatC, defaultMatC, {
        friction: 0.5,
        restitution: 0.3,
      }),
    );

    // Collision sparks
    world.addEventListener("beginContact", (e) => {
      const { bodyA, bodyB } = e;
      const vrel = bodyA.velocity.vsub(bodyB.velocity);
      const speed = vrel.length();
      if (speed < 3) return;
      const pos = bodyA.position.vadd(bodyB.position).scale(0.5);
      const idx = Math.floor(Math.random() * objects.current.length);
      const color = objects.current[idx]?.color ?? 0xffffff;
      makeSpark(pos, color);
    });

    // Seed scene
    const configs = [
      ["box", 0.7, 2, 0.2, 0.5, { x: 0, y: 8, z: 0 }],
      ["sphere", 0.5, 1, 0.6, 0.3, { x: 1, y: 12, z: 0.5 }],
      ["cylinder", 0.6, 1.5, 0.1, 0.6, { x: -0.5, y: 16, z: -0.3 }],
      ["box", 0.9, 3, 0.15, 0.4, { x: 0.3, y: 20, z: 0.2 }],
      ["cone", 0.5, 1, 0.2, 0.5, { x: -0.2, y: 24, z: -0.4 }],
    ];
    configs.forEach(([shape, size, mass, bounce, friction, pos]) => {
      spawnObject(shape, size, mass, bounce, friction, pos, {
        x: 0,
        y: 0,
        z: 0,
      });
    });

    // Animation loop
    const animate = () => {
      const now = performance.now();
      if (lastTimeRef.current === 0) lastTimeRef.current = now;
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      world.step(1 / 60, dt, 3);

      // Sync objects
      objects.current.forEach(({ mesh, body }) => {
        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);
      });

      // Update sparks
      for (let i = sparks.current.length - 1; i >= 0; i--) {
        const sp = sparks.current[i];
        sp.life -= dt * 1.8;
        if (sp.life <= 0) {
          scene.remove(sp.pts);
          sp.pts.geometry.dispose();
          sp.pts.material.dispose();
          sparks.current.splice(i, 1);
          continue;
        }
        const posA = sp.pts.geometry.attributes.position;
        for (let j = 0; j < sp.velocities.length; j++) {
          sp.velocities[j].y -= 9 * dt;
          posA.array[j * 3] += sp.velocities[j].x * dt;
          posA.array[j * 3 + 1] += sp.velocities[j].y * dt;
          posA.array[j * 3 + 2] += sp.velocities[j].z * dt;
        }
        posA.needsUpdate = true;
        sp.pts.material.opacity = sp.life;
      }

      // Prune fallen objects
      for (let i = objects.current.length - 1; i >= 0; i--) {
        if (objects.current[i].body.position.y < -30) {
          scene.remove(objects.current[i].mesh);
          objects.current[i].mesh.geometry.dispose();
          objects.current[i].mesh.material.dispose();
          world.removeBody(objects.current[i].body);
          objects.current.splice(i, 1);
        }
      }

      controls.update();
      renderer.render(scene, camera);

      // FPS
      frameCountRef.current++;
      if (now - lastFPSRef.current > 600) {
        const fpsVal = Math.round(
          frameCountRef.current / ((now - lastFPSRef.current) / 1000),
        );
        setFps(fpsVal);
        frameCountRef.current = 0;
        lastFPSRef.current = now;
      }
      setObjCount(objects.current.length);

      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement))
        container.removeChild(renderer.domElement);
      objects.current.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
    };
  }, []);

  // ── Sync environment (gravity + wind) ───────────────────────
  useEffect(() => {
    if (!worldRef.current) return;
    worldRef.current.gravity.set(
      env.windX * 0.5,
      -env.gravity,
      env.windZ * 0.5,
    );
  }, [env]);

  // ── Mouse events ────────────────────────────────────────────
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (e.button !== 0 || !containerRef.current) return;
      isChargingRef.current = true;
      chargeStartRef.current = performance.now();
      setCharging(true);
    };
    const handleMouseUp = (e) => {
      if (e.button !== 0 || !isChargingRef.current) return;
      const held = Math.min(
        performance.now() - chargeStartRef.current,
        MAX_CHARGE,
      );
      doThrow(held / MAX_CHARGE);
      isChargingRef.current = false;
      setCharging(false);
      setChargePct(0);
    };
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [doThrow]);

  // Charge indicator animation
  useEffect(() => {
    if (!charging) return;
    let raf;
    const update = () => {
      if (!isChargingRef.current) {
        setChargePct(0);
        return;
      }
      const pct = Math.min(
        ((performance.now() - chargeStartRef.current) / MAX_CHARGE) * 100,
        100,
      );
      setChargePct(pct);
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [charging]);

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      {/* Crosshair */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10">
        <div className="absolute w-0.5 h-full top-0 left-1/2 -translate-x-1/2 bg-white/60" />
        <div className="absolute h-0.5 w-full top-1/2 left-0 -translate-y-1/2 bg-white/60" />
      </div>

      {/* Charge indicator */}
      <div
        className={`fixed bottom-16 left-1/2 -translate-x-1/2 w-[200px] h-1 bg-white/10 rounded-sm z-10 overflow-hidden transition-opacity duration-200 ${charging ? "opacity-100" : "opacity-0"}`}
      >
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-sm transition-[width] duration-50"
          style={{ width: `${chargePct}%` }}
        />
      </div>

      {/* Hints */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2.5 z-10 pointer-events-none">
        <span className="bg-black/50 border border-white/10 rounded-md px-2.5 py-1.5 text-[10px] text-white/40 tracking-wider backdrop-blur-md">
          <b className="text-white/65 font-medium">Click</b> throw ·{" "}
          <b className="text-white/65 font-medium">Hold</b> charge
        </span>
        <span className="bg-black/50 border border-white/10 rounded-md px-2.5 py-1.5 text-[10px] text-white/40 tracking-wider backdrop-blur-md">
          <b className="text-white/65 font-medium">Right-drag</b> orbit
        </span>
        <span className="bg-black/50 border border-white/10 rounded-md px-2.5 py-1.5 text-[10px] text-white/40 tracking-wider backdrop-blur-md">
          <b className="text-white/65 font-medium">Scroll</b> zoom
        </span>
      </div>

      {/* Stats bar */}
      <div className="fixed top-4 right-4 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white/40 tracking-wider backdrop-blur-md z-10 leading-relaxed">
        Objects: <span className="text-white/70">{objCount}</span> &nbsp;|&nbsp;
        FPS: <span className="text-white/70">{fps}</span>
      </div>

      {/* UI Panels */}
      <div className="fixed top-4 left-4 flex flex-col gap-2 z-10">
        {/* Panel 1: Spawn Object */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[rgba(10,10,20,0.82)] border border-white/10 rounded-xl p-3 backdrop-blur-xl min-w-[180px]"
        >
          <div className="text-[10px] tracking-[0.12em] uppercase text-white/35 mb-2.5">
            Spawn Object
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {SHAPES.map((shape) => (
              <button
                key={shape}
                onClick={() => setSelectedShape(shape)}
                className={`flex flex-col items-center gap-1 py-2 px-1.5 rounded-lg text-[10px] border transition-all cursor-pointer ${
                  selectedShape === shape
                    ? "bg-indigo-500/25 border-indigo-500/70 text-white"
                    : "bg-white/5 border-white/10 text-white/75 hover:bg-white/10 hover:border-white/25"
                }`}
              >
                <span className="text-lg">{SHAPE_EMOJIS[shape]}</span>
                <span className="capitalize">{shape}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Panel 2: Properties */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-[rgba(10,10,20,0.82)] border border-white/10 rounded-xl p-3 backdrop-blur-xl min-w-[180px]"
        >
          <div className="text-[10px] tracking-[0.12em] uppercase text-white/35 mb-2.5">
            Properties
          </div>
          {[
            { key: "size", label: "Size", min: 0.2, max: 2.0, step: 0.05 },
            { key: "mass", label: "Mass", min: 0.1, max: 10, step: 0.1 },
            { key: "bounce", label: "Bounce", min: 0, max: 0.95, step: 0.05 },
            { key: "friction", label: "Friction", min: 0, max: 1, step: 0.05 },
          ].map((p) => (
            <div
              key={p.key}
              className="flex items-center gap-2 mb-1.5 last:mb-0"
            >
              <span className="text-[10px] text-white/45 w-[52px] shrink-0">
                {p.label}
              </span>
              <input
                type="range"
                min={p.min}
                max={p.max}
                step={p.step}
                value={props[p.key]}
                onChange={(e) =>
                  setProps((prev) => ({
                    ...prev,
                    [p.key]: parseFloat(e.target.value),
                  }))
                }
                className="flex-1 h-[3px] rounded-sm bg-white/12 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500"
              />
              <span className="text-[10px] text-white/60 w-7 text-right">
                {props[p.key].toFixed(1)}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Panel 3: Environment (NEW - 3rd dynamic feature) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[rgba(10,10,20,0.82)] border border-white/10 rounded-xl p-3 backdrop-blur-xl min-w-[180px]"
        >
          <div className="text-[10px] tracking-[0.12em] uppercase text-white/35 mb-2.5">
            <Layers className="w-3 h-3 inline mr-1 -mt-0.5" /> Environment
          </div>
          {[
            { key: "gravity", label: "Gravity", min: 1, max: 40, step: 1 },
            { key: "windX", label: "Wind X", min: -15, max: 15, step: 0.5 },
            { key: "windZ", label: "Wind Z", min: -15, max: 15, step: 0.5 },
          ].map((p) => (
            <div
              key={p.key}
              className="flex items-center gap-2 mb-1.5 last:mb-0"
            >
              <span className="text-[10px] text-white/45 w-[52px] shrink-0">
                {p.label}
              </span>
              <input
                type="range"
                min={p.min}
                max={p.max}
                step={p.step}
                value={env[p.key]}
                onChange={(e) =>
                  setEnv((prev) => ({
                    ...prev,
                    [p.key]: parseFloat(e.target.value),
                  }))
                }
                className="flex-1 h-[3px] rounded-sm bg-white/12 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
              />
              <span className="text-[10px] text-white/60 w-8 text-right">
                {env[p.key].toFixed(p.key === "gravity" ? 0 : 1)}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Panel 4: Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[rgba(10,10,20,0.82)] border border-white/10 rounded-xl p-3 backdrop-blur-xl min-w-[180px]"
        >
          <div className="text-[10px] tracking-[0.12em] uppercase text-white/35 mb-2.5">
            Actions
          </div>
          <div className="flex gap-1.5 mb-1.5">
            <button
              onClick={spawnRandom}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] border border-white/10 bg-white/5 text-white/65 hover:bg-white/12 hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
            >
              <Dices className="w-3 h-3" /> Random
            </button>
            <button
              onClick={explode}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] border border-white/10 bg-white/5 text-white/65 hover:bg-white/12 hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
            >
              <Bomb className="w-3 h-3" /> Explode
            </button>
          </div>
          <button
            onClick={clearAll}
            className="w-full flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] border border-red-500/35 bg-white/5 text-white/65 hover:bg-red-500/20 hover:border-red-500/60 hover:text-red-300 transition-colors cursor-pointer uppercase tracking-wider"
          >
            <Trash2 className="w-3 h-3" /> Clear All
          </button>
        </motion.div>
      </div>
    </div>
  );
}
