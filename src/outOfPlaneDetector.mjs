const outOfPlaneDetector = {};

const THRESHOLD_RIGHR_LEFT = [0.1, 0.25, 0.5, 0.75, 0.8];

const THRESHOLD_TOP_BOTTOM = [0.6, 0.7, 0.8, 0.9, 0.95];

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

  return outOfPlane;
}

outOfPlaneDetector.isOutOfPlaneLR = function( keypoints ) {
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

  return THRESHOLD_RIGHR_LEFT.map( t => distanceToLeft < (t*distanceToRight) || distanceToRight < (t*distanceToLeft) )

}

outOfPlaneDetector.isOutOfPlaneTB = function( keypoints ) {
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

  return THRESHOLD_TOP_BOTTOM.map( t => distanceToTop < (t*distanceToBottom) || distanceToBottom < (t*distanceToTop ) )
}

export default outOfPlaneDetector;