const blinkDetector = {};

const EAR_THRESHOLD = 0.27;

function getEucledianDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function getEAR(upper, lower) {
  return (
    (getEucledianDistance(upper[5].x, upper[5].y, lower[4].x, lower[4].y) +
      getEucledianDistance(
        upper[3].x,
        upper[3].y,
        lower[2].x,
        lower[2].y
      )) /
    (2 *
      getEucledianDistance(upper[0].x, upper[0].y, upper[8].x, upper[8].y))
  );
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
	const rightEAR = getEAR(rightEyeTopArc, rightEyeBottomArc);

	const leftEyeTopArc = leftEyeTopArcKeypoints.map(
		point => keypoints[point]
	);
	const leftEyeBottomArc = leftEyeBottomArcKeypoints.map(
		point => keypoints[point]
	);
	const leftEAR = getEAR(leftEyeTopArc, leftEyeBottomArc);

	if (rightEAR<=EAR_THRESHOLD) {
		eyeBlinkObjs.right = true;
	} else {
		eyeBlinkObjs.right = false;
	}

	if (leftEAR<=EAR_THRESHOLD) {
		eyeBlinkObjs.left = true;
	} else {
		eyeBlinkObjs.left = false;
	}

	return eyeBlinkObjs;
}

export default blinkDetector;