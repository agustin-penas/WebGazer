import numeric from 'numeric';
import mat from './mat';
import util from './util';
import params from './params';

const reg = {};
var ridgeParameter = Math.pow(10,-5);
var dataWindow = 700;
var trailDataWindow = 10;

/**
 * Performs ridge regression, according to the Weka code.
 * @param {Array} y - corresponds to screen coordinates (either x or y) for each of n click events
 * @param {Array.<Array.<Number>>} X - corresponds to gray pixel features (120 pixels for both eyes) for each of n clicks
 * @param {Array} k - ridge parameter
 * @return{Array} regression coefficients
 */
function ridge(y, X, k){
  var nc = X[0].length;
  var m_Coefficients = new Array(nc);
  var xt = mat.transpose(X);
  var solution = new Array();
  var success = true;
  do{
    var ss = mat.mult(xt,X);
    // Set ridge regression adjustment
    for (var i = 0; i < nc; i++) {
      ss[i][i] = ss[i][i] + k;
    }

    // Carry out the regression
    var bb = mat.mult(xt,y);
    for(var i = 0; i < nc; i++) {
      m_Coefficients[i] = bb[i][0];
    }
    try{
      var n = (m_Coefficients.length !== 0 ? m_Coefficients.length/m_Coefficients.length: 0);
      if (m_Coefficients.length*n !== m_Coefficients.length){
        console.log('Array length must be a multiple of m')
      }
      solution = (ss.length === ss[0].length ? (numeric.LUsolve(numeric.LU(ss,true),bb)) : (mat.QRDecomposition(ss,bb)));

      for (var i = 0; i < nc; i++){
        m_Coefficients[i] = solution[i];
      }
      success = true;
    }
    catch (ex){
      k *= 10;
      console.log(ex);
      success = false;
    }
  } while (!success);
  return m_Coefficients;
}

//TODO: still usefull ???
/**
 *
 * @returns {Number}
 */
function getCurrentFixationIndex() {
  var index = 0;
  var recentX = this.screenXTrailArray.get(0);
  var recentY = this.screenYTrailArray.get(0);
  for (var i = this.screenXTrailArray.length - 1; i >= 0; i--) {
    var currX = this.screenXTrailArray.get(i);
    var currY = this.screenYTrailArray.get(i);
    var euclideanDistance = Math.sqrt(Math.pow((currX-recentX),2)+Math.pow((currY-recentY),2));
    if (euclideanDistance > 72){
      return i+1;
    }
  }
  return i;
}

/**
 * Constructor of RidgeReg object,
 * this object allow to perform ridge regression
 * @constructor
 */
reg.RidgeReg = function() {
  this.init();
};

/**
 * Initialize new arrays and initialize Kalman filter.
 */
reg.RidgeReg.prototype.init = function() {
  this.screenXClicksArray = new util.DataWindow(dataWindow);
  this.screenYClicksArray = new util.DataWindow(dataWindow);
  this.eyeFeaturesClicks = new util.DataWindow(dataWindow);

  //sets to one second worth of cursor trail
  this.trailTime = 1000;
  this.trailDataWindow = this.trailTime / params.moveTickSize;
  this.screenXTrailArray = new util.DataWindow(trailDataWindow);
  this.screenYTrailArray = new util.DataWindow(trailDataWindow);
  this.eyeFeaturesTrail = new util.DataWindow(trailDataWindow);
  this.trailTimes = new util.DataWindow(trailDataWindow);

  this.coefficientsX = null;
  this.coefficientsY = null;

  this.dataClicks = new util.DataWindow(dataWindow);
  this.dataTrail = new util.DataWindow(trailDataWindow);

  // Initialize Kalman filter [20200608 xk] what do we do about parameters?
  // [20200611 xk] unsure what to do w.r.t. dimensionality of these matrices. So far at least
  //               by my own anecdotal observation a 4x1 x vector seems to work alright
  var F = [ [1, 0, 1, 0],
    [0, 1, 0, 1],
    [0, 0, 1, 0],
    [0, 0, 0, 1]];

  //Parameters Q and R may require some fine tuning
  var Q = [ [1/4, 0,    1/2, 0],
    [0,   1/4,  0,   1/2],
    [1/2, 0,    1,   0],
    [0,  1/2,  0,   1]];// * delta_t
  var delta_t = 1/10; // The amount of time between frames
  Q = numeric.mul(Q, delta_t);

  var H = [ [1, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0]];
  var H = [ [1, 0, 0, 0],
    [0, 1, 0, 0]];
  var pixel_error = 47; //We will need to fine tune this value [20200611 xk] I just put a random value here

  //This matrix represents the expected measurement error
  var R = numeric.mul(numeric.identity(2), pixel_error);

  var P_initial = numeric.mul(numeric.identity(4), 0.0001); //Initial covariance matrix
  var x_initial = [[500], [500], [0], [0]]; // Initial measurement matrix

  this.kalman = new util.KalmanFilter(F, H, Q, R, P_initial, x_initial);
};

/**
 * Add given data from eyes
 * @param {Object} eyes - eyes where extract data to add
 * @param {Object} screenPos - The current screen point
 * @param {Object} type - The type of performed action
 */
reg.RidgeReg.prototype.addData = function(eyes, screenPos, type) {
  if (this.coefficientsX !== null || this.coefficientsY !== null) {
    throw new Error(
      'Data can not be added after coefficients have been computed.'
    );
  }
  if (!eyes) {
    return;
  }
  //not doing anything with blink at present
  // if (eyes.left.blink || eyes.right.blink) {
  //   return;
  // }
  //why are we pushing these as arrays rather than single elements?
  if (type === 'click') {
    this.screenXClicksArray.push([screenPos[0]]);
    this.screenYClicksArray.push([screenPos[1]]);

    this.eyeFeaturesClicks.push(util.getEyeFeats(eyes));
    this.dataClicks.push({'eyes':eyes, 'screenPos':screenPos, 'type':type});
  } else if (type === 'move') {
    this.screenXTrailArray.push([screenPos[0]]);
    this.screenYTrailArray.push([screenPos[1]]);

    this.eyeFeaturesTrail.push(util.getEyeFeats(eyes));
    this.trailTimes.push(performance.now());
    this.dataTrail.push({'eyes':eyes, 'screenPos':screenPos, 'type':type});
  }

  // [20180730 JT] Why do we do this? It doesn't return anything...
  // But as JS is pass by reference, it still affects it.
  //
  // Causes problems for when we want to call 'addData' twice in a row on the same object, but perhaps with different screenPos or types (think multiple interactions within one video frame)
  //eyes.left.patch = Array.from(eyes.left.patch.data);
  //eyes.right.patch = Array.from(eyes.right.patch.data);
}

/**
 * Try to predict coordinates from pupil data
 * after apply linear regression on data set
 * @param {Object} eyesObj - The current user eyes object
 * @returns {Object}
 */
reg.RidgeReg.prototype.predict = function(eyesObj) {
  if (!this.coefficientsX || !this.coefficientsY) {
    // Ridge regression coefficients have not yet been computed
    return null;
  }

  if (!eyesObj || this.eyeFeaturesClicks.length === 0) {
    return null;
  }

  var acceptTime = performance.now() - this.trailTime;
  var trailX = [];
  var trailY = [];
  var trailFeat = [];
  for (var i = 0; i < this.trailDataWindow; i++) {
    if (this.trailTimes.get(i) > acceptTime) {
      trailX.push(this.screenXTrailArray.get(i));
      trailY.push(this.screenYTrailArray.get(i));
      trailFeat.push(this.eyeFeaturesTrail.get(i));
    }
  }

  var eyeFeats = util.getEyeFeats(eyesObj);
  var predictedX = 0;
  for(var i=0; i< eyeFeats.length; i++){
    predictedX += eyeFeats[i] * this.coefficientsX[i];
  }
  var predictedY = 0;
  for(var i=0; i< eyeFeats.length; i++){
    predictedY += eyeFeats[i] * this.coefficientsY[i];
  }

  predictedX = Math.floor(predictedX);
  predictedY = Math.floor(predictedY);

  if (params.applyKalmanFilter) {
    // Update Kalman model, and get prediction
    var newGaze = [predictedX, predictedY]; // [20200607 xk] Should we use a 1x4 vector?
    newGaze = this.kalman.update(newGaze);

    return {
      x: newGaze[0],
      y: newGaze[1]
    };
  } else {
    return {
      x: predictedX,
      y: predictedY
    };
  }
};

/**
 * Add given data to current data set then,
 * replace current data member with given data
 * @param {Array.<Object>} data - The data to set
 */
reg.RidgeReg.prototype.setData = function(data) {
  for (var i = 0; i < data.length; i++) {
    // Clone data array
    var leftData = new Uint8ClampedArray(data[i].eyes.left.patch.data);
    var rightData = new Uint8ClampedArray(data[i].eyes.right.patch.data);
    // Duplicate ImageData object
    data[i].eyes.left.patch = new ImageData(leftData, data[i].eyes.left.width, data[i].eyes.left.height);
    data[i].eyes.right.patch = new ImageData(rightData, data[i].eyes.right.width, data[i].eyes.right.height);

    // Add those data objects to model
    this.addData(data[i].eyes, data[i].screenPos, data[i].type);
  }
};

/**
 * Return the data
 * @returns {Array.<Object>|*}
 */
reg.RidgeReg.prototype.getData = function() {
  return this.dataClicks.data;
}

reg.RidgeReg.prototype.computeCoefficients = function() {
  const screenXArray = this.screenXClicksArray.data;
  const screenYArray = this.screenYClicksArray.data;
  const eyeFeatures = this.eyeFeaturesClicks.data;

  this.coefficientsX = ridge(screenXArray, eyeFeatures, ridgeParameter);
  this.coefficientsY = ridge(screenYArray, eyeFeatures, ridgeParameter);
}

/**
 * The RidgeReg object name
 * @type {string}
 */
reg.RidgeReg.prototype.name = 'ridge';

export default reg;
