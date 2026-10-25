
/**
 * Get distance between two points
 * 
 * @param {Object} p1
 * @param {Object} p2
 * 
 * @return {Number}
 */
export function distance(from, to) {
    return Math.sqrt(Math.pow(to.x-from.x,2)+Math.pow(to.y-from.y,2));
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
export function gamma(first, second, third) {
    // pythagoras
    const sideA = distance(first, second);
    const sideB = distance(second, third);
    const sideC = distance(third, first);

    if (0 === sideA * sideB) {
        return 0;
    }
    // law of cosines
    return 180-Math.acos((Math.pow(sideA,2)+Math.pow(sideB,2)-Math.pow(sideC,2))/(2*sideA*sideB))*180/Math.PI;
}

// Next finds the number that satifies the golden ratio using the length of a segment AS for the base
export function gr_next(start, end) {
	// Dividing a line segment by exterior division
	// 1. Draw a line segment AS and construct off the point S a segment SC perpendicular to AS and with the same length as AS.
	// get the distance between the two "points" (a,0) and (b,0)
	let segment = Math.abs(start - end);
	// 2. Do bisect the line segment AS with M.
	let half = segment / 2;
	// 3. A circular arc around M with radius MC intersects in point B the straight line through points A and S (also known as the extension of AS). The ratio of AS to the constructed segment SB is the golden ratio.
	// instead of an arc, we know that the value is the length of CM + AM, so find CM
	// substitute AS for CS and AM for SM in these calculations, as they are the same sizes
	// then offset with either a or s based on size
	let hypotenuse = Math.sqrt(segment*segment + half*half)
	if (start > end) {
		return end - (hypotenuse - half)
    }
    return start + (hypotenuse + half)
}

// Ratio finds the golden ratio between two numbers a and b
export function gr(first, second) {
	// use interior division to find c
	// 1. Having a line segment AB, construct a perpendicular BC at point B, with BC half the length of AB. Draw the hypotenuse AC.
	// get the distance between the two "points" (a,0) and (b,0)
	let descending = (first > second);
	let span = Math.abs(first - second);
	let half = span / 2;                   // get the distance of the perpendicular (b,0) and (b,c)
	let hypotenuse = Math.sqrt(span*span + half*half); // get the distance of the hypotenuse
	// 2. Draw an arc with center C and radius BC. This arc intersects the hypotenuse AC at point D.
	// 3. Draw an arc with center A and radius AD. This arc intersects the original line segment AB at point S. Point S divides the original line segment AB into line segments AS and SB with lengths in the golden ratio.
	// instead of an arc, we know that BC is the radius so that can be subtracted from AC to get the distance of AD and to derive AS (it's the same distance as AD), adjusted for a
	if (descending) {
		return second - (half - hypotenuse);
    }
    return second + (half - hypotenuse);
}