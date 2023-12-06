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
	const colorData = eyesObj.right.patch.data.reduce((a,b) => a+b, 0)
									+ eyesObj.left.patch.data.reduce((a,b) => a+b, 0);

	return {
			data: colorData,
			width: eyesObj.right,
			height: eyesObj.right,
	};
}

function isSameEye(oldEye, newEye) {
	return (oldEye.width === newEye.width) && (oldEye.height === newEye.height);
}

function isBlink() {
		let medianColorData = 0;
		let lastFrame = blinkData.get(blinkWindow-1);
		for (let i = 0; i < (blinkWindow-1); i++) {
				const data = blinkData.get(i);
				//if (!isSameEye(data, nextData)) {
					//	return false;
				//}
				medianColorData += data.data;
		}
		medianColorData /= (blinkWindow-1);
		let blink = medianColorData/lastFrame.data
	//console.log(blink);
		return blink > minCorrelation && blink < maxCorrelation;
}

export default blinkDetector;