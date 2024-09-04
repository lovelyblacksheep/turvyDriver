

export const toFixed = (num, fixed) => {
	var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
	return num.toString().match(re)[0];
}

export const secondsToHms = (d) => {
	d = Number(d);
	var h = Math.floor(d / 3600);
	var m = Math.floor(d % 3600 / 60);
	var s = Math.floor(d % 3600 % 60);

	var hDisplay = h > 0 ? h + (h == 1 ? " hr, " : " hr, ") : "";
	var mDisplay = m > 0 ? m + (m == 1 ? " min, " : " min, ") : "";
	var sDisplay = s > 0 ? s + (s == 1 ? " sec" : " sec") : "";
	return hDisplay + mDisplay + sDisplay; 
}

export const debug = (string) => {
	return JSON.stringify(string, null, 2)
}