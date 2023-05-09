import util from './util';

const blinkDetector = {};

const blinkWindow = 8;
const equalizeStep = 5;
const threshold = 80;
const minCorrelation = 0.78;
const maxCorrelation = 0.85;
const blinkData = new util.DataWindow(blinkWindow);

blinkDetector.isBlink = function( eyesObj ) {
	const data = extractBlinkData(eyesObj);
	blinkData.push(data);

	eyesObj.left.isBlink = false;
	eyesObj.right.isBlink = false;

	if (blinkData.length < blinkWindow) {
		return eyesObj;
	}

	if (isBlink()) {
		eyesObj.left.isBlink = true;
		eyesObj.right.isBlink = true;
	}

	return eyesObj;
}

function extractBlinkData(eyesObj) {
	const eye = eyesObj.right;
	const grayscaled = util.grayscale(eye.patch.data, eye.width, eye.height);
	const equalized = util.equalizeHistogram(grayscaled, equalizeStep, grayscaled);
	const thresholded = util.threshold(equalized, threshold);
	return {
			data: thresholded,
			width: eye.width,
			height: eye.height,
	};
}

function isSameEye(oldEye, newEye) {
	return (oldEye.width === newEye.width) && (oldEye.height === newEye.height);
}

function isBlink() {
		let correlation = 0;
		for (let i = 0; i < blinkWindow; i++) {
				const data = blinkData.get(i);
				const nextData = blinkData.get(i + 1);
				//if (!isSameEye(data, nextData)) {
					//	return false;
				//}
				correlation += util.correlation(data.data, nextData.data);
		}
		correlation /= blinkWindow;
		console.log(correlation);
		return correlation > minCorrelation && correlation < maxCorrelation;
}

export default blinkDetector;