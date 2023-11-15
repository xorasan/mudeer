//+ 
var muhawwal;
;(function(){
	'use strict';
	
	var axavluggah = function () {
		
	};
	
	var s = 'Я не рыдаю, я не спокоен!'
+'\nПрошу, глаза мне закрой рукою.'
+'\nВас двое. Воспоминания печаль укроют.'
+'\nПорой изнемогаю и тихо кроет.'
+'\n'
+'\nС тобой твои герои цвета иной крови - '
+'\nКак паранойя, но я спокоен (Да, что с того)'
+'\nДа я не спорю, ломать - не строить.'
+'\nПрошу глаза мне закрой рукою.'
+'\n'
+'\nВот она, - моя стелла памяти. Подождите!'
+'\nВы же стремились так познать ту обитель.'
+'\nТак вот вам! Забирайте без остатка все, что надо.'
+'\nТолько оставьте то тепло, что я дарил когда-то.'
+'\n'
+'\nОставьте веру! Моя вера сильнее ветра,'
+'\nЧто разрывает в клочья порывы зверского гнева.'
+'\nОставьте время на заполнение пробелов.'
+'\nСотрите файлы картин, что рисовал акварелью.'
+'\n'
+'\nУлыбку, глаза ее, губы!'
+'\nЯ не хочу болеть этим, я не хочу сбивать руки,'
+'\nНе хочу быть плюшевым - я хочу остаться!'
+'\nПускай марионеткой, пускай можно сорваться...'
+'\n'
+'\nНо так попроще. Как раз - то, что мне нужно.'
+'\nПросто уйти в себя, просто быть психом.'
+'\nМожет так лучше? Не знаю, но снова вспоминаю прошлое.'
+'\nОбидно, что в нем нет хорошего.'
+'\n'
+'\nПрипев:'
+'\nОсень развенчала.'
+'\nОдинокие причалы помнят радость глаз твоих.'
+'\nОсень разлучая, счастья дневники листала.'
+'\nОсень на двоих.'
+'\n'
+'\nЭту историю писали двое и вздорили. '
+'\nТакой финал - какой ценой? '
+'\nА стоит ли винить небо, звонить в скорую?'
+'\nПостой! Пустой слезой ты не омоешь боль мою.'
+'\nРасправив крылья - я стану былью (спорим)'
+'\nПустой строкой в твоей истории новой.'
+'\nСлепой тоской и правдой голой.'
+'\nПрошу глаза мне закрой рукою. (прошу тебя)'
+'\n'
+'\nПрипев:'
+'\nОсень развенчала.'
+'\nОдинокие причалы помнят радость глаз твоих.'
+'\nОсень разлучая, счастья дневники листала.'
+'\nОсень на двоих. (Просто осень на двоих)'
+'\n'
+'\nОсень развенчала.'
+'\nОдинокие причалы помнят радость глаз твоих. '
+'\n(А знаешь, все еще помнят радость глаз твоих)'
+'\nОсень разлучая, счастья дневники листала.'
+'\nОсень на двоих. (Просто осень на двоих)'
;
	
	muhawwal = function (str, ilaa, min) {
		str = str || s;
		if (!ilaa) return str;
		if (!min) min = axavluggah(str);
		
		str = tabdeel(str.toLowerCase(), [
			/дж/g, 'ج'			,
			/і/g, 'ي'			,
			/х/g, 'خ'			,
			/ж/g, 'ژ'			,
			/э/g, 'ا'			,
			/ю/g, 'يُ'			,
			/й/g, 'ئ'			,
			/т/g, 'ت'			,
			/к/g, 'ك'			,
			/г/g, 'گ'			,
			/(^|\s|\b)а/g, '$1ا' ,
			/а/g, 'ٰ'			,
			/б/g, 'ب'			,
			/в/g, 'ؤ'			,
			/ф/g, 'ف'			,
			/с/g, 'س'			,
			/е/g, 'ع'			,
			/ё/g, 'غ'			,
			/з/g, 'ز'			,
			/м/g, 'م'			,
			/н/g, 'ن'			,
			/п/g, 'پ'			,
			/р/g, 'ر'			,
			/ои/g, 'ؤِ'			,
//			/(^|\s|\b)о/g, '$1او',
			/о/g, 'و'			,
			/(^|\s|\b)и/g, '$1اِ'	,
			/ии/g, 'ي'			,
			/и/g, 'ِ'			,
			/ы/g, 'ي'			,
			/ъ/g, 'ء'			,
			/ь/g, 'ء'			,
			/ч/g, 'چ'			,
			/л/g, 'ل'			,
			/я/g, 'يَ'			,
			/щ/g, 'شّ'			,
			/ш/g, 'ش'			,
			/д/g, 'د'			,
			/(^|\s|\b)у/g, '$1اُ'	,
			/у/g, 'ُ'			,
			/ц/g, 'ث'			,
			/\,/g, '،'			,
			/\./g, '۔'			,
		]);

// 		str = str.replace(/[َُِ]/g, '')

		return str;
	};

})();