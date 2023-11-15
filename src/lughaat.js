var lughaat = [
	'خرٰسٰني',
	'خُرلِش',
	'english',
	'خُردُو',
	'اُردُو',
	'خُربِيّة',
	'عرَبِيّة',
	'خُرسكي',
	'русский',
	'خُرمٰنِيّة',
	'عُثمٰني',
	'خُرملۧي',
	'malaayu',
],
yassar = function (str, max) { // simplify
	return tabdeel(str, [
		/[\\\/]/g, ' ',
		/\n/g, ' ', /\ \ /g, ' ', / /g, '-',
//		/\-\-/g, '-',
	]).slice(0, max);
},
droprumooz = function (str) {
	return tabdeel(str, [
		/\./g, '', /\۔/g, '',
	]);
},
cyrillic = function (str, from) {
	if (from)
	return tabdeel(str, [
		/р/gi, 'r', /у/gi, 'u', /с/gi, 's', /к/gi, 'k', /и/gi, 'i', /д/gi, 'd',
		/а/gi, 'a', /е/gi, 'e', /н/gi, 'n', /х/gi, 'x', /о/gi, 'o', /б/gi, 'b',
		/г/gi, 'g', /п/gi, 'p', /з/gi, 'z', /в/gi, 'v', /л/gi, 'l', /м/gi, 'm',
	]);
	else
	return tabdeel(str, [
		/r/gi, 'р', /u/gi, 'у', /s/gi, 'с', /k/gi, 'к', /i/gi, 'и', /d/gi, 'д',
		/a/gi, 'а', /e/gi, 'е', /n/gi, 'н', /x/gi, 'х', /o/gi, 'о', /b/gi, 'б',
		/gi/gi, 'г', /p/gi, 'п', /z/gi, 'з', /v/gi, 'в', /l/gi, 'л', /m/gi, 'м',
	]);
};
