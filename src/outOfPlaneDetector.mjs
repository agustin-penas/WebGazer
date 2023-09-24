const outOfPlaneDetector = {};

outOfPlaneDetector.isOutOfPlane = function( keypoints ) {
  var outOfPlane = false;
  if (keypoints[160].z > 20 || keypoints[160].z < -20) {
    //outOfPlane = true;
  }

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

  if (distanceToLeft < (0.5*distanceToRight) || distanceToRight < (0.5*distanceToLeft)) {
    outOfPlane = true;
  }

  if (distanceToTop < (0.8*distanceToBottom) || distanceToBottom < (0.8*distanceToTop)) {
    outOfPlane = true;
  }
/*
  console.log("distance nose to top: " + (noseY - topY));
  console.log("distance nose to bottom: " + (bottomY - noseY));
  console.log("distance nose to right: " + (noseX - rightearX));
  console.log("distance nose to left: " + (leftEarX - noseX));
*/
  return outOfPlane;
}

export default outOfPlaneDetector;