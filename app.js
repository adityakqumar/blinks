const toggleFlashlightBtn = document.getElementById('toggleFlashlight');
const patternSelector = document.getElementById('patternSelector');
const blinkSpeedSlider = document.getElementById('blinkSpeed');

let isFlashlightOn = false; // Flashlight state
let flashlightStream = null; // Media stream for flashlight
let blinkInterval = null; // Interval ID for blinking patterns

// Check if the device supports the torch constraint
const supportsTorch = 'mediaDevices' in navigator &&
                      'getSupportedConstraints' in navigator.mediaDevices &&
                      navigator.mediaDevices.getSupportedConstraints().torch;

if (!supportsTorch) {
  alert('Flashlight control is not supported on this device.');
  toggleFlashlightBtn.disabled = true;
}

// Toggle flashlight on/off
toggleFlashlightBtn.addEventListener('click', async () => {
  if (isFlashlightOn) {
    stopFlashlight();
  } else {
    await startFlashlight();
  }
});

// Start the flashlight
async function startFlashlight() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Flashlight control is not supported in this browser.');
    return;
  }

  try {
    // Request the rear camera with torch enabled
    flashlightStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // Rear camera
        torch: true                // Enable the flashlight
      }
    });

    isFlashlightOn = true;
    toggleFlashlightBtn.textContent = 'Stop Flashlight';
    console.log('Flashlight started successfully!');

    applyBlinkPattern(); // Start the selected blinking pattern
  } catch (error) {
    console.error('Error accessing flashlight:', error);
    alert('Could not access the flashlight. Please ensure permissions are granted.');
  }
}

// Stop the flashlight
function stopFlashlight() {
  if (flashlightStream) {
    flashlightStream.getTracks().forEach(track => track.stop()); // Stop all tracks
    flashlightStream = null;
  }

  clearInterval(blinkInterval); // Clear blinking interval
  isFlashlightOn = false;
  toggleFlashlightBtn.textContent = 'Start Flashlight';
  console.log('Flashlight stopped.');
}

// Apply the selected blinking pattern
function applyBlinkPattern() {
  clearInterval(blinkInterval); // Clear any existing pattern
  const pattern = patternSelector.value;
  const speed = parseInt(blinkSpeedSlider.value, 10);

  if (pattern === 'steady') {
    // Toggle the flashlight at a steady interval
    blinkInterval = setInterval(toggleTorch, speed);
  } else if (pattern === 'sos') {
    // SOS pattern: 3 short, 3 long, 3 short
    let sosSequence = [200, 200, 200, 600, 600, 600, 200, 200, 200];
    let index = 0;

    blinkInterval = setInterval(() => {
      toggleTorch();
      setTimeout(toggleTorch, sosSequence[index]); // Turn off after duration
      index = (index + 1) % sosSequence.length; // Cycle through SOS sequence
    }, speed);
  }
}

// Toggle flashlight torch on/off
function toggleTorch() {
  if (flashlightStream) {
    const track = flashlightStream.getVideoTracks()[0];
    track.applyConstraints({
      advanced: [{ torch: !isFlashlightOn }]
    });
    isFlashlightOn = !isFlashlightOn; // Update state
  }
}
