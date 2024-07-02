const blinkDetector = {};

var LEFT_OPEN_EYE_DISTANCE = 0;
var RIGHT_OPEN_EYE_DISTANCE = 0;

const THRESHOLD = [0.1, 0.25, 0.5, 0.75, 0.8];

function getEucledianDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

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

blinkDetector.isBlink = function( keypoints ) {
	var eyeBlinkObjs = {};

	const rightEyeTopArc = rightEyeTopArcKeypoints.map(
		point => keypoints[point]
	);
	const rightEyeBottomArc = rightEyeBottomArcKeypoints.map(
		point => keypoints[point]
	);
	const rightDistance = getEucledianDistance(rightEyeTopArc[4].x,rightEyeTopArc[4].y, rightEyeBottomArc[4].x, rightEyeBottomArc[4].y);
	const leftEyeTopArc = leftEyeTopArcKeypoints.map(
		point => keypoints[point]
	);
	const leftEyeBottomArc = leftEyeBottomArcKeypoints.map(
		point => keypoints[point]
	);
	const leftDistance = getEucledianDistance(leftEyeTopArc[5].x, leftEyeTopArc[5].y, leftEyeBottomArc[3].x, leftEyeBottomArc[3].y);

  eyeBlinkObjs.right = THRESHOLD.map( t => rightDistance< (t*RIGHT_OPEN_EYE_DISTANCE))

  eyeBlinkObjs.left = THRESHOLD.map( t => leftDistance< (t*LEFT_OPEN_EYE_DISTANCE))

	if(leftDistance > LEFT_OPEN_EYE_DISTANCE){
		LEFT_OPEN_EYE_DISTANCE = leftDistance;
	}

	if(rightDistance > RIGHT_OPEN_EYE_DISTANCE){
		RIGHT_OPEN_EYE_DISTANCE = rightDistance;
	}

	return eyeBlinkObjs;
}

export default blinkDetector;