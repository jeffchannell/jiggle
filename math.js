'use strict';

/**
 * Get distance between two points
 * 
 * @param {Object} p1
 * @param {Object} p2
 * 
 * @return {Number}
 */
function distance(p1, p2)
{
    return Math.sqrt(Math.pow(p2.x-p1.x,2)+Math.pow(p2.y-p1.y,2));
}

/**
 * Get gamma in triangles using law of cosines
 * 
 * @param {Object} st
 * @param {Object} nd
 * @param {Object} rd
 * 
 * @return {Number}
 */
function gamma(st, nd, rd) {
    // pythagoras
    var a = Math.sqrt(Math.pow(st.x-nd.x,2)+Math.pow(st.y-nd.y,2));
    var b = Math.sqrt(Math.pow(nd.x-rd.x,2)+Math.pow(nd.y-rd.y,2));
    var c = Math.sqrt(Math.pow(rd.x-st.x,2)+Math.pow(rd.y-st.y,2));
    var gam;

    if (0 === a * b) {
        gam = 0;
    } else {
        // law of cosines
        gam = 180-Math.acos((Math.pow(a,2)+Math.pow(b,2)-Math.pow(c,2))/(2*a*b))*180/Math.PI;
    }

    return gam;
}