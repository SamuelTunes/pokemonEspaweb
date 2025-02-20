import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';


const container = document.getElementById('canvas-container');
let scene, camera, renderer, object;

function initScene() {
    // Cria uma nova cena do Three.js
    scene = new THREE.Scene();

    // Cria uma câmera com perspectiva ajustável
    // FOV (Field of View): 75 graus
    // Aspect Ratio: baseado no tamanho do container
    // Clipping Plane: objetos entre 1 e 1000 unidades da câmera são renderizados
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 1000);
    
    // Define a posição inicial da câmera (X, Y, Z)
    camera.position.set(0, 0, 60);
    
    // Define o fundo da cena como nulo (transparente)
    scene.background = null;
}

function initRenderer() {
    // Cria um renderizador WebGL com anti-aliasing ativado para suavizar arestas
    // `alpha: true` permite transparência na cena
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    // Define o tamanho do renderizador para corresponder ao container
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Anexa o elemento de renderização ao container no DOM
    container.appendChild(renderer.domElement);
}

function initLights() {
    // Cria uma luz hemisférica
    // Primeiro parâmetro: cor da luz superior (branca)
    // Segundo parâmetro: cor da luz inferior (preta, sem reflexos na parte de baixo)
    const light = new THREE.HemisphereLight(0xffffff, 0x000000);

    // Adiciona a luz à cena
    scene.add(light);
}

function toggleTheme() {
    // Obtém o estado do checkbox de alternância de tema
    const isChecked = document.getElementById('theme-toggle').checked;

    // Define o tema como 'dark' se o checkbox estiver marcado, senão 'light'
    const newTheme = isChecked ? 'dark' : 'light';

    // Atualiza o atributo do tema no elemento raiz (`<html>`), ativando os estilos CSS correspondentes
    document.documentElement.setAttribute('data-theme', newTheme);

    // Atualiza o fundo da cena para combinar com o novo tema
    updateSceneBackground();

    // Garante que a animação seja atualizada após a mudança de tema
    animate();
}

function updateSceneBackground() {
    // Garante que a alternância do tema seja escutada corretamente
    document.getElementById('theme-toggle').addEventListener('change', toggleTheme);

    // Obtém o tema atual aplicado ao `<html>`
    const currentTheme = document.documentElement.getAttribute('data-theme');

    // Atualiza o estado do checkbox de acordo com o tema carregado
    document.getElementById('theme-toggle').checked = currentTheme === 'dark';

    // Obtém o estilo computado do elemento raiz (`<html>`)
    const computedStyle = getComputedStyle(document.documentElement);

    // Extrai o valor da variável CSS `--background-canvas`
    const backgroundColor = computedStyle.getPropertyValue('--background-canvas').trim();

    // Verifica se a variável CSS está definida corretamente
    if (backgroundColor && backgroundColor !== 'transparent') {
        // Define a cor de fundo da cena com a cor obtida do CSS
        scene.background = new THREE.Color(backgroundColor);
    } else {
        // Se não houver cor definida, mantém o fundo transparente
        scene.background = null;
    }
}

function loadModel() {
    // Cria um carregador para modelos no formato GLTF
    const loader = new GLTFLoader();

    // Configura o DracoLoader para descompactar modelos otimizados
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/examples/jsm/libs/draco/');
    loader.setDRACOLoader(dracoLoader);

    // Carrega o modelo 3D especificado
    loader.load(
        '../model/eevee2.glb',
        function (gltf) { // Callback executado após o carregamento bem-sucedido
            object = gltf.scene; // Obtém a cena do modelo carregado
            scene.add(object); // Adiciona o modelo à cena

            centerModel(); // Garante que o modelo esteja centralizado
            // DestaqueModel(); // Pode ser ativado para destacar o modelo

            animate(); // Reinicia a animação para refletir a nova cena
        },
        undefined, // Callback opcional para progresso de carregamento
        function (error) { // Callback para capturar erros no carregamento
            console.error('Error loading model:', error);
        }
    );
}

function centerModel(){
    // Cria um limite tridimensional ao redor do objeto carregado
    const box = new THREE.Box3().setFromObject(object);

    // Obtém o centro do modelo dentro desse limite
    const center = box.getCenter(new THREE.Vector3());

    // Move o objeto para que seu centro fique no ponto (0,0,0) da cena
    object.position.sub(center);
}

function DestaqueModel(){
    // Percorre todos os objetos filhos do modelo
    object.traverse((child) => {
        // Verifica se o filho é uma malha (Mesh)
        if (child.isMesh) {
            // Altera a cor do material para vermelho
            child.material.color.set(0xff0000);
        }
    });
}

function setupEventListeners() {
    // Ajusta a cena quando a janela é redimensionada
    window.addEventListener('resize', onResize);

    // Captura interações do usuário no container 3D
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('wheel', onZoom);

    // Captura eventos do teclado
    document.addEventListener('keydown', onKeyPress);
}

function onResize() {
    // Atualiza a proporção da câmera para o novo tamanho da tela
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    // Atualiza o tamanho do renderizador para ocupar toda a tela
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Re-renderiza a cena com as novas configurações
    animate();
}

let isMouseDown = false, startX, startY;
function onMouseDown(event) {
    isMouseDown = true;
    startX = event.clientX;
    startY = event.clientY;
}

function onMouseMove(event) {
    if (isMouseDown && object) {
        object.rotation.y += (event.clientX - startX) * 0.01;
        object.rotation.x += (event.clientY - startY) * 0.01;
        startX = event.clientX;
        startY = event.clientY;
        animate();
    }
}

function onMouseUp() {
    isMouseDown = false;
}

function onZoom(event) {
    camera.position.z += event.deltaY * 0.01;
    animate();
}

function onKeyPress(event) {
    if (object) {
        const rotations = {
            ArrowUp: () => object.rotation.x -= 0.05,
            ArrowDown: () => object.rotation.x += 0.05,
            ArrowLeft: () => object.rotation.y -= 0.05,
            ArrowRight: () => object.rotation.y += 0.05,
        };
        if (rotations[event.key]) {
            rotations[event.key]();
            animate();
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Inicializa a cena e configurações básicas
initScene();
initRenderer();
initLights();
updateSceneBackground();
loadModel();
setupEventListeners();
animate();