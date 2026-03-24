export function decodeHerePolyline(encoded) {
    let index = 0;
    const result = {
        precision: 5,
        thirdDim: 0,
        thirdDimPrecision: 0,
        polyline: [],
    };

    const header = decodeUnsignedVarint(encoded, index);
    index = header.nextIndex;
    const value = header.value;

    result.precision = value & 15;
    result.thirdDim = (value >> 4) & 7;
    result.thirdDimPrecision = (value >> 7) & 15;

    const factorDegree = Math.pow(10, result.precision);
    const factorZ = Math.pow(10, result.thirdDimPrecision);

    let lastLat = 0;
    let lastLng = 0;
    let lastZ = 0;

    while (index < encoded.length) {
        const deltaLat = decodeSignedVarint(encoded, index);
        index = deltaLat.nextIndex;
        lastLat += deltaLat.value;

        const deltaLng = decodeSignedVarint(encoded, index);
        index = deltaLng.nextIndex;
        lastLng += deltaLng.value;

        const point = [lastLat / factorDegree, lastLng / factorDegree];

        if (result.thirdDim) {
            const deltaZ = decodeSignedVarint(encoded, index);
            index = deltaZ.nextIndex;
            lastZ += deltaZ.value;
            point.push(lastZ / factorZ);
        }

        result.polyline.push(point);
    }

    return result.polyline.map(([lat, lng]) => [lng, lat]); // Mapbox format
}

function decodeUnsignedVarint(encoded, startIndex) {
    let result = 0;
    let shift = 0;
    let byte = null;
    let index = startIndex;

    do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1F) << shift;
        shift += 5;
    } while (byte >= 0x20);

    return { value: result, nextIndex: index };
}

function decodeSignedVarint(encoded, startIndex) {
    const decoded = decodeUnsignedVarint(encoded, startIndex);
    const value = decoded.value;
    const shouldNegate = value & 1;
    decoded.value = (value >> 1) * (shouldNegate ? -1 : 1);
    return decoded;
}
