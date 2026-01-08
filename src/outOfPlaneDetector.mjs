const outOfPlaneDetector = {};

outOfPlaneDetector.isOutOfPlane = function( keypoints ) {
  var outOfPlane = false;

  const noseX = keypoints[1].x;
  const noseY = keypoints[1].y;

  const topY = keypoints[10].y;
  const bottomY = keypoints[152].y;

  const leftEarX = keypoints[454].x;
  const rightearX = keypoints[234].x;
 
  const distanceToTop = noseY - topY;
  const distanceToBottom = bottomY - noseY;

  const distanceToLeft = leftEarX - noseX;
  const distanceToRight = noseX - rightearX;

  if (distanceToLeft < (0.53*distanceToRight) || distanceToRight < (0.53*distanceToLeft)) {
    outOfPlane = true;
  }

  if (distanceToTop < (0.53*distanceToBottom) || distanceToBottom < (0.53*distanceToTop)) {
    outOfPlane = true;
  }

  return outOfPlane;
}

export default outOfPlaneDetector;