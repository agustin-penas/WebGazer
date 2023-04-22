import '@mediapipe/face_mesh';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import tfjsFaceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import tf from '@tensorflow/tfjs';

/**
 * Constructor of TFFaceMesh object
 * @constructor
 * */
const TFFaceMesh = function() {
  // https://github.com/tensorflow/tfjs-models/tree/master/face-landmarks-detection/src/mediapipe
  // https://github.com/tensorflow/tfjs-models/blob/master/face-landmarks-detection/README.md#how-to-run-it
  this.model = tfjsFaceLandmarksDetection.createDetector(
    tfjsFaceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
    {
      runtime: 'mediapipe',
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
    });
  this.predictionReady = false;
};

// Global variable for face landmark positions array
TFFaceMesh.prototype.positionsArray = null;

/**
 * Isolates the two patches that correspond to the user's eyes
 * @param  {Canvas} imageCanvas - canvas corresponding to the webcam stream
 * @param  {Number} width - of imageCanvas
 * @param  {Number} height - of imageCanvas
 * @return {Object} the two eye-patches, first left, then right eye
 */
TFFaceMesh.prototype.getEyePatches = async function(video, imageCanvas, width, height) {

  if (imageCanvas.width === 0) {
    return null;
  }

  // Load the MediaPipe facemesh model.
  const model = await this.model;

  // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain an
  // array of detected faces from the MediaPipe graph.
  const predictions = await model.estimateFaces(video);

  if (predictions.length == 0){
    return false;
  }

  // Save positions to global variable
  const { keypoints } = predictions[0];
  this.positionsArray = keypoints;
  const positions = this.positionsArray;

  const [leftBBox, rightBBox] = [
    // left
    {
      eyeTopArcKeypoints: [
        25, 33, 246, 161, 160, 159, 158, 157, 173, 243,
      ],
      eyeBottomArcKeypoints: [
        25, 110, 24, 23, 22, 26, 112, 243,
      ],
    },
    // right
    {
      eyeTopArcKeypoints: [
        463, 398, 384, 385, 386, 387, 388, 466, 263, 255,
      ],
      eyeBottomArcKeypoints: [
        463, 341, 256, 252, 253, 254, 339, 255,
      ],
    },
  ].map(({ eyeTopArcKeypoints, eyeBottomArcKeypoints }) => {
    const topLeftOrigin = {
      x: Math.round(Math.min(...eyeTopArcKeypoints.map(k => keypoints[k].x))),
      y: Math.round(Math.min(...eyeTopArcKeypoints.map(k => keypoints[k].y))),
    };
    const bottomRightOrigin = {
      x: Math.round(Math.max(...eyeBottomArcKeypoints.map(k => keypoints[k].x))),
      y: Math.round(Math.max(...eyeBottomArcKeypoints.map(k => keypoints[k].y))),
    };

    return {
      origin: topLeftOrigin,
      width: bottomRightOrigin.x - topLeftOrigin.x,
      height: bottomRightOrigin.y - topLeftOrigin.y,
    }
  });
  var leftOriginX = leftBBox.origin.x;
  var leftOriginY = leftBBox.origin.y;
  var leftWidth = leftBBox.width;
  var leftHeight = leftBBox.height;
  var rightOriginX = rightBBox.origin.x;
  var rightOriginY = rightBBox.origin.y;
  var rightWidth = rightBBox.width;
  var rightHeight = rightBBox.height;

  if (leftWidth === 0 || rightWidth === 0){
    console.log('an eye patch had zero width');
    return null;
  }

  if (leftHeight === 0 || rightHeight === 0){
    console.log('an eye patch had zero height');
    return null;
  }

  // Start building object to be returned
  var eyeObjs = {};

  var leftImageData = imageCanvas.getContext('2d').getImageData(leftOriginX, leftOriginY, leftWidth, leftHeight);
  eyeObjs.left = {
    patch: leftImageData,
    imagex: leftOriginX,
    imagey: leftOriginY,
    width: leftWidth,
    height: leftHeight
  };

  var rightImageData = imageCanvas.getContext('2d').getImageData(rightOriginX, rightOriginY, rightWidth, rightHeight);
  eyeObjs.right = {
    patch: rightImageData,
    imagex: rightOriginX,
    imagey: rightOriginY,
    width: rightWidth,
    height: rightHeight
  };

  this.predictionReady = true;

  return eyeObjs;
};

/**
 * Returns the positions array corresponding to the last call to getEyePatches.
 * Requires that getEyePatches() was called previously, else returns null.
 */
TFFaceMesh.prototype.getPositions = function () {
  return this.positionsArray;
}

/**
 * Reset the tracker to default values
 */
TFFaceMesh.prototype.reset = function(){
  console.log( "Unimplemented; Tracking.js has no obvious reset function" );
}

/**
 * Draw TF_FaceMesh_Overlay
 */
TFFaceMesh.prototype.drawFaceOverlay= function(ctx, keypoints){
  // If keypoints is falsy, don't do anything
  if (keypoints) {
    ctx.fillStyle = '#32EEDB';
    ctx.strokeStyle = '#32EEDB';
    ctx.lineWidth = 0.5;

    for (let i = 0; i < keypoints.length; i++) {
      const x = keypoints[i][0];
      const y = keypoints[i][1];

      ctx.beginPath();
      ctx.arc(x, y, 1 /* radius */, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
    }
  }
}

/**
 * The TFFaceMesh object name
 * @type {string}
 */
TFFaceMesh.prototype.name = 'TFFaceMesh';

export default TFFaceMesh;
