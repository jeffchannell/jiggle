'use strict';

/**
 * Get distance between two points
 * 
 * @param {Object} p1
 * @param {Object} p2
 * 
 * @return {Number}
 */
function distance(p1, p2) {
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

    if (0 === a * b) {
        return 0;
    }
    // law of cosines
    return 180-Math.acos((Math.pow(a,2)+Math.pow(b,2)-Math.pow(c,2))/(2*a*b))*180/Math.PI;
}

// Next finds the number that satifies the golden ratio using the length of a segment AS for the base
function gr_next(a, s) {
	// Dividing a line segment by exterior division
	// 1. Draw a line segment AS and construct off the point S a segment SC perpendicular to AS and with the same length as AS.
	// get the distance between the two "points" (a,0) and (b,0)
	let as = Math.abs(a - s);
	// 2. Do bisect the line segment AS with M.
	let am = as / 2;
	// 3. A circular arc around M with radius MC intersects in point B the straight line through points A and S (also known as the extension of AS). The ratio of AS to the constructed segment SB is the golden ratio.
	// instead of an arc, we know that the value is the length of CM + AM, so find CM
	// substitute AS for CS and AM for SM in these calculations, as they are the same sizes
	// then offset with either a or s based on size
	let cm = Math.sqrt(as*as + am*am)
	if (a > s) {
		return s - (cm - am)
    }
    return a + (cm + am)
}

// Ratio finds the golden ratio between two numbers a and b
function gr(a, b) {
	// use interior division to find c
	// 1. Having a line segment AB, construct a perpendicular BC at point B, with BC half the length of AB. Draw the hypotenuse AC.
	// get the distance between the two "points" (a,0) and (b,0)
	let pos = (a > b);
	let ab = Math.abs(a - b);
	let bc = ab / 2;                   // get the distance of the perpendicular (b,0) and (b,c)
	let ac = Math.sqrt(ab*ab + bc*bc); // get the distance of the hypotenuse
	// 2. Draw an arc with center C and radius BC. This arc intersects the hypotenuse AC at point D.
	// 3. Draw an arc with center A and radius AD. This arc intersects the original line segment AB at point S. Point S divides the original line segment AB into line segments AS and SB with lengths in the golden ratio.
	// instead of an arc, we know that BC is the radius so that can be subtracted from AC to get the distance of AD and to derive AS (it's the same distance as AD), adjusted for a
	if (pos) {
		return b - (bc - ac);
    }
    return b + (bc - ac);
}