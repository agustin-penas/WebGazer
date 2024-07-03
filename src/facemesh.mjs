import '@mediapipe/face_mesh';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import tfjsFaceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import tf from '@tensorflow/tfjs';
import blinkDetector from './blink-ear.mjs'
import outOfPlaneDetector from './outOfPlaneDetector.mjs'
import { eye } from '@tensorflow/tfjs-core';

/**
 * Constructor of TFFaceMesh object
 * @constructor
 * */
const TFFaceMesh = function() {
  this.model = tfjsFaceLandmarksDetection.createDetector(
    tfjsFaceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
    {
      runtime: 'mediapipe',
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
			refineLandmarks: true,
    });
  this.predictionReady = false;
  this.frameImageCanvas = document.createElement('canvas');
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
TFFaceMesh.prototype.getEyePatches = async function(video, imageCanvas, width, height, cameraFocalLenEstimation) {
  if (imageCanvas.width === 0) {
    return null;
  }

  return await estimateOverImage(video, imageCanvas, cameraFocalLenEstimation);
};


estimateOverImage = async function(video, imageCanvas, cameraFocalLenEstimation) {
    // Load the MediaPipe facemesh model.
  const model = await this.model;
  // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain an
  // array of detected faces from the MediaPipe graph.
  const predictions = await model.estimateFaces(video);

  if (predictions.length == 0){
    return false;
  }
  const { keypoints } = predictions[0];
  //const { box } = predictions[1];
  //this are thr points for the left iris, in other versions of
  // facemesh there is a way to obtain this from the result without enumerating the points.
  const LEFT_IRIS_POINTS = [474, 475, 476, 477]
  var irisLeftMinX = -1;
  var irisLeftMaxX = -1;
  for (const point of LEFT_IRIS_POINTS) {
    //console.log(point)
    var point0 = keypoints[point];
    //console.log(point0.z);
    if (irisLeftMinX == -1 || point0.x < irisLeftMinX) {
      irisLeftMinX = point0.x;
    }
    if (irisLeftMaxX == -1 || point0.x > irisLeftMaxX) {
      irisLeftMaxX = point0.x;
    }
  }

  var dx = irisLeftMaxX - irisLeftMinX;
  var dX = 11.7;

  // Logitech HD Pro C922	Norm focal
  var normalizedFocaleX = 1.40625; //50
  var fx = cameraFocalLenEstimation // Math.min(video.videoWidth, video.videoHeight) * normalizedFocaleX;
  var dZ = (fx * (dX / dx)) / 10.0;
  dZ = dZ.toFixed(2);
  console.log(dZ + " cm");
  console.log(fx)

  // Save positions to global variable
  this.positionsArray = keypoints;
  const positions = this.positionsArray;
  //console.log("keypoint 160: " + keypoints[160].z);
  //var outOfPlane = outOfPlaneDetector.isOutOfPlane(keypoints);
  //var outOfPlaneLR = outOfPlaneDetector.isOutOfPlaneLR(keypoints);
  //var outOfPlaneTB = outOfPlaneDetector.isOutOfPlaneTB(keypoints);

	const leftEyeTopArcKeypoints = [
		25, 33, 246, 161, 160, 159, 158, 157, 173, 243,
	];
	const leftEyeBottomArcKeypoints = [
		25, 110, 24, 23, 22, 26, 112, 243,
	];
	const rightEyeTopArcKeypoints = [
		463, 398, 384, 385, 386, 387, 388, 466, 263, 255,
	];
	const rightEyeBottomArcKeypoints = [
		463, 341, 256, 252, 253, 254, 339, 255,
	];
  const [leftBBox, rightBBox] = [
    // left
    {
      eyeTopArcKeypoints: leftEyeTopArcKeypoints,
      eyeBottomArcKeypoints: leftEyeBottomArcKeypoints,
    },
    // right
    {
      eyeTopArcKeypoints: rightEyeTopArcKeypoints,
      eyeBottomArcKeypoints: rightEyeBottomArcKeypoints,
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

	//var eyesBlinking = blinkDetector.isBlink(keypoints);
	//if (eyesBlinking.left || eyesBlinking.right) {
		//console.log(eyesBlinking);
	//}

	const rightEyeTopArc = rightEyeTopArcKeypoints.map(
		point => keypoints[point]
	);
	const rightEyeBottomArc = rightEyeBottomArcKeypoints.map(
		point => keypoints[point]
	);
	const leftEyeTopArc = leftEyeTopArcKeypoints.map(
		point => keypoints[point]
	);
	const leftEyeBottomArc = leftEyeBottomArcKeypoints.map(
		point => keypoints[point]
	);

  // Start building object to be returned
  var eyeObjs = {};
  var leftImageData = imageCanvas.getContext('2d').getImageData(leftOriginX, leftOriginY, leftWidth, leftHeight);
  eyeObjs.left = {
    patch: leftImageData,
    imagex: leftOriginX,
    imagey: leftOriginY,
    width: leftWidth,
    height: leftHeight,
		isBlink: false,
    distanceToCamera: dZ
  };

  var rightImageData = imageCanvas.getContext('2d').getImageData(rightOriginX, rightOriginY, rightWidth, rightHeight);
  eyeObjs.right = {
    patch: rightImageData,
    imagex: rightOriginX,
    imagey: rightOriginY,
    width: rightWidth,
    height: rightHeight,
		isBlink: false,
    distanceToCamera: dZ
  };

  eyeObjs.importantKeypoints = {
    noseX: keypoints[1].x,
    noseY: keypoints[1].y,
    topY: keypoints[10].y,
    bottomY: keypoints[152].y,
    leftEarX: keypoints[454].x,
    rightearX: keypoints[234].x,
    rightEyeTopArc: rightEyeTopArc,
    rightEyeBottomArc: rightEyeBottomArc,
    leftEyeTopArc: leftEyeTopArc,
    leftEyeBottomArc: leftEyeBottomArc
  }
	//eyeObjs = blinkDetector.isBlink(eyeObjs);
	//if (eyeObjs.left.isBlink || eyeObjs.right.isBlink) {
		//console.log(eyeObjs.left.isBlink);
	//}
  this.predictionReady = true;

  return eyeObjs;
}

/**
 * Isolates the two patches that correspond to the user's eyes
 * @param  {VideoFrame} videoFrame - Frame to use
 * @return {Object} the two eye-patches, first left, then right eye
 */
TFFaceMesh.prototype.getEyePatchesForFrame = async function(videoFrame) {
  paintCurrentFrame(videoFrame, this.frameImageCanvas, videoFrame.codedWidth, videoFrame.codedHeight);

  var ctx = this.frameImageCanvas.getContext('2d');
  let img = ctx.getImageData(0, 0, videoFrame.codedWidth, videoFrame.codedHeight);

  return await estimateOverImage(img, this.frameImageCanvas, 640);
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
      const x = keypoints[i].x;
      const y = keypoints[i].y;

      ctx.beginPath();
      ctx.arc(x, y, 1 /* radius */, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function paintCurrentFrame(videoFrame, canvas, width, height) {
  if (canvas.width != width) {
    canvas.width = width;
  }
  if (canvas.height != height) {
    canvas.height = height;
  }

  var ctx = canvas.getContext('2d');
  ctx.drawImage(videoFrame, 0, 0, canvas.width, canvas.height);
}

/**
 * The TFFaceMesh object name
 * @type {string}
 */
TFFaceMesh.prototype.name = 'TFFaceMesh';

export default TFFaceMesh;
