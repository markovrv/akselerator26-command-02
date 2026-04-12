<template>
  <div class="viewer-3d">
    <div v-if="loading" class="viewer-loading">
      <div class="spinner"></div>
      <p>Загрузка 3D-модели...</p>
    </div>
    <div v-else-if="error" class="viewer-error">
      <span>⚠️</span>
      <p>{{ error }}</p>
      <a v-if="modelUrl" :href="modelUrl" target="_blank" class="btn-link">Открыть модель отдельно</a>
    </div>
    <canvas ref="canvasRef" v-show="!loading && !error"></canvas>
    <div class="viewer-controls" v-if="!loading && !error">
      <span>🖱️ Вращение — ЛКМ · Масштаб — Колёсико</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const props = defineProps<{
  modelUrl: string
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const loading = ref(true)
const error = ref('')

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let animationId: number

onMounted(async () => {
  if (!canvasRef.value || !props.modelUrl) {
    error.value = 'URL модели не указан'
    loading.value = false
    return
  }

  try {
    const canvas = canvasRef.value

    // Scene
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf1f5f9)

    // Camera
    camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
    camera.position.set(0, 1, 3)

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4)
    directionalLight2.position.set(-5, 3, -5)
    scene.add(directionalLight2)

    // Controls
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.5

    // Load model
    const loader = new GLTFLoader()
    loader.load(
      props.modelUrl,
      (gltf) => {
        const model = gltf.scene

        // Center and scale
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 2 / maxDim
        model.scale.setScalar(scale)
        model.position.sub(center.multiplyScalar(scale))

        scene.add(model)
        loading.value = false
      },
      undefined,
      (err) => {
        console.error('GLTF Load error:', err)
        error.value = 'Не удалось загрузить 3D-модель. Формат: .glb/.gltf'
        loading.value = false
      }
    )

    // Animate
    function animate() {
      animationId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Resize handler
    const resizeObserver = new ResizeObserver(() => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    resizeObserver.observe(canvas.parentElement!)
  } catch (e) {
    error.value = 'Ошибка инициализации 3D-просмотра'
    loading.value = false
  }
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  renderer?.dispose()
})
</script>

<style scoped lang="scss">
.viewer-3d {
  width: 100%;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  background: #f1f5f9;
  position: relative;
  border: 1px solid #e2e8f0;

  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
}

.viewer-loading,
.viewer-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: #64748b;
}

.viewer-error span {
  font-size: 2.5rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.btn-link {
  color: #2563eb;
  text-decoration: underline;
  font-size: 0.875rem;
}

.viewer-controls {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #64748b;
  backdrop-filter: blur(4px);
}
</style>
