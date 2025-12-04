const video = document.getElementById('video');
const videoFileInput = document.getElementById('video-file');
const urlInput = document.getElementById('enlace');
const canvas = document.getElementById('canvas');
const preview = document.getElementById('preview');
const downloadButton = document.getElementById('descargar');
const seek = document.getElementById('seek');
const timestamp = document.getElementById('timestamp');
const mensajes = document.getElementById('mensajes');

const setMensaje = (texto, estado = 'info') => {
  mensajes.textContent = texto || '';
  if (!texto) {
    mensajes.removeAttribute('data-estado');
    return;
  }
  mensajes.dataset.estado = estado;
};

const formatearTiempo = (segundos) => {
  if (!Number.isFinite(segundos)) return '00:00';
  const min = Math.floor(segundos / 60)
    .toString()
    .padStart(2, '0');
  const sec = Math.floor(segundos % 60)
    .toString()
    .padStart(2, '0');
  return `${min}:${sec}`;
};

const drawPlayIcon = async (ctx, width, height) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = 'play.png';
    img.onload = () => {
      const x = width / 2 - img.width / 2;
      const y = height / 2 - img.height / 2;
      ctx.drawImage(img, x, y);
      resolve(true);
    };
    img.onerror = () => {
      setMensaje('No se encontró el ícono play.png en la carpeta.', 'error');
      resolve(false);
    };
  });
};

let thumbnailReady = false;
let overlayApplied = false;

const updatePreview = () => {
  const dataUrl = canvas.toDataURL('image/png');
  preview.src = dataUrl;
  downloadButton.disabled = false;
  downloadButton.dataset.url = dataUrl;
};

const captureFrame = async () => {
  if (video.readyState < 2) {
    setMensaje('Reproduce el video hasta el segundo deseado antes de capturar.', 'error');
    return false;
  }
  canvas.width = video.videoWidth || 600;
  canvas.height = video.videoHeight || 338;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  thumbnailReady = true;
  overlayApplied = false;
  updatePreview();
  setMensaje('Frame capturado. Ahora puedes agregar el ícono de play.');
  return true;
};

const addPlayOverlay = async () => {
  if (!thumbnailReady) {
    const captured = await captureFrame();
    if (!captured) return false;
  }
  const ctx = canvas.getContext('2d');
  const overlayOk = await drawPlayIcon(ctx, canvas.width, canvas.height);
  if (!overlayOk) return false;
  overlayApplied = true;
  updatePreview();
  setMensaje('Ícono agregado. Ya puedes descargar el thumbnail.');
  return true;
};

const setVideoSource = (src) => {
  if (!src) return;
  video.pause();
  video.removeAttribute('src');
  video.load();
  video.src = src;
  seek.disabled = true;
  seek.value = 0;
  timestamp.textContent = '00:00';
  setMensaje('Cargando video...');
  video.play().catch(() => video.pause());
};

const handleFileChange = () => {
  const [file] = videoFileInput.files;
  if (!file) return;
  const objectUrl = URL.createObjectURL(file);
  setVideoSource(objectUrl);
};

const handleUrlChange = () => {
  const value = urlInput.value.trim();
  if (!value) return;
  setVideoSource(value);
};

const downloadImage = async () => {
  if (!thumbnailReady) {
    setMensaje('No hay thumbnail para descargar. Captura un frame primero.', 'error');
    return;
  }
  if (!overlayApplied) {
    const overlayOk = await addPlayOverlay();
    if (!overlayOk) return;
  }

  const url = downloadButton.dataset.url;
  if (!url) {
    setMensaje('Ocurrió un problema al preparar la imagen. Intenta de nuevo.', 'error');
    return;
  }
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'thumbnail.png';
  anchor.click();
};

const actualizarRango = () => {
  if (!Number.isFinite(video.duration) || video.duration === 0) return;
  seek.max = video.duration.toFixed(1);
  seek.disabled = false;
  timestamp.textContent = formatearTiempo(video.currentTime);
};

const manejarCambioRango = () => {
  const tiempo = Number.parseFloat(seek.value);
  if (Number.isFinite(tiempo)) {
    video.currentTime = tiempo;
  }
};

const mostrarErrorVideo = () => {
  setMensaje('El video no se pudo cargar. Verifica el enlace o los permisos (CORS).', 'error');
  seek.disabled = true;
};

video.addEventListener('loadeddata', () => {
  downloadButton.disabled = true;
  preview.removeAttribute('src');
  thumbnailReady = false;
  overlayApplied = false;
  setMensaje('Video listo. Mueve la barra para elegir el momento a capturar.');
});

video.addEventListener('loadedmetadata', actualizarRango);
video.addEventListener('timeupdate', () => {
  seek.value = video.currentTime;
  timestamp.textContent = formatearTiempo(video.currentTime);
});
video.addEventListener('error', mostrarErrorVideo);

videoFileInput.addEventListener('change', handleFileChange);
document.getElementById('cambiar-enlace').addEventListener('click', handleUrlChange);
document.getElementById('capturar').addEventListener('click', captureFrame);
document.getElementById('play').addEventListener('click', addPlayOverlay);
document.getElementById('descargar').addEventListener('click', downloadImage);
seek.addEventListener('input', manejarCambioRango);
