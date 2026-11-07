/* Facts transcribed from Q-Net's 2026 standard recipe table, checked 2026-10-31.
   Korean explanations and the training sequence are independently authored. */
(function (root) {
  'use strict';
  const source = {
    year: 2026, checked: '2026-10-31', published: '2025-12-30',
    url: 'https://www.q-net.or.kr/cst006.do?artlSeq=5250970&brdId=Q006&code=1204&gId=&gSite=Q&id=cst00602',
    standards: 'https://www.q-net.or.kr/cst006.do?artlSeq=5213459&brdId=Q006&code=1202&gId=&gSite=Q&id=cst00602',
    attachment: '조주기능사 2026년 큐넷 공지용.zip',
    recipeFile: '2026년 조주기능사 실기시험 표준레시피.pdf',
    note: '2026년 제1회 실기부터 적용. 변경 내역에 공개 레시피 내용 변경 없음으로 명시되어 있습니다.'
  };
  const ingredients = {
    grenadine: ['그레나딘 시럽', 'Grenadine Syrup', '시럽', '#ca4660'],
    mintGreen: ['크렘 드 멘트 그린', 'Crème de Menthe (Green)', '리큐르', '#50a46a'],
    brandy: ['브랜디', 'Brandy', '브랜디', '#bf8541'],
    bourbon: ['버번 위스키', 'Bourbon Whiskey', '위스키', '#b97838'],
    sweetVermouth: ['스위트 베르무트', 'Sweet Vermouth', '와인', '#9c4c44'],
    bitters: ['앙고스투라 비터스', 'Angostura Bitters', '비터스', '#79533e'],
    gin: ['드라이 진', 'Dry Gin', '진', '#a6c9bf'],
    dryVermouth: ['드라이 베르무트', 'Dry Vermouth', '와인', '#becb8c'],
    sugar: ['가루 설탕', 'Powdered Sugar', '설탕', '#ded6bf'],
    soda: ['소다 워터', 'Soda Water', '탄산', '#a9cddd'],
    cacaoBrown: ['크렘 드 카카오 브라운', 'Crème de Cacao (Brown)', '리큐르', '#805647'],
    milk: ['라이트 밀크', 'Light Milk', '우유', '#dfd8c5'],
    lemon: ['레몬 주스', 'Lemon Juice', '주스', '#e1c359'],
    cherryBrandy: ['체리 플레이버드 브랜디', 'Cherry Flavored Brandy', '리큐르', '#ad4d64'],
    vodka: ['보드카', 'Vodka', '보드카', '#afc9d7'],
    coffee: ['커피 리큐르', 'Coffee Liqueur', '리큐르', '#704739'],
    tequila: ['테킬라', 'Tequila', '테킬라', '#cfbf80'],
    orangeLiqueur: ['쿠앵트로 또는 트리플 섹', 'Cointreau or Triple Sec', '리큐르', '#d5a568'],
    lime: ['라임 주스', 'Lime Juice', '주스', '#9aba60'],
    scotch: ['스카치 위스키', 'Scotch Whisky', '위스키', '#b7854f'],
    drambuie: ['드람뷔', 'Drambuie', '리큐르', '#b69148'],
    rum: ['라이트 럼', 'Light Rum', '럼', '#c2d3c7'],
    irishCream: ['베일리스 아이리시 크림', "Bailey’s Irish Cream Liqueur", '리큐르', '#b7a485'],
    grandMarnier: ['그랑 마르니에', 'Grand Marnier', '리큐르', '#b87b47'],
    melon: ['미도리 (멜론 리큐르)', 'Midori (Melon Liqueur)', '리큐르', '#80b85d'],
    coconutRum: ['코코넛 플레이버드 럼', 'Coconut Flavored Rum', '럼', '#c9d0ba'],
    banana: ['바나나 리큐르', 'Banana Liqueur', '리큐르', '#dbc26b'],
    pineapple: ['파인애플 주스', 'Pineapple Juice', '주스', '#d8b65c'],
    sweetSour: ['스위트 앤 사워 믹스', 'Sweet & Sour Mix', '믹스', '#bfc774'],
    bacardi: ['바카디 럼 화이트', 'Bacardi Rum White', '럼', '#c2c7b4'],
    cola: ['콜라', 'Cola', '탄산', '#77544b'],
    cacaoWhite: ['크렘 드 카카오 화이트', 'Crème de Cacao (White)', '리큐르', '#d1d0ba'],
    cranberry: ['크랜베리 주스', 'Cranberry Juice', '주스', '#c15770'],
    grapefruit: ['자몽 주스', 'Grapefruit Juice', '주스', '#dc9c88'],
    applePucker: ['애플 퍼커', 'Apple Pucker (Sour Apple Liqueur)', '리큐르', '#9db867'],
    campari: ['캄파리', 'Campari', '리큐르', '#cf685d'],
    tripleSec: ['트리플 섹', 'Triple Sec', '리큐르', '#c5be9d'],
    orange: ['오렌지 주스', 'Orange Juice', '주스', '#e3a453'],
    pinaMix: ['피나 콜라다 믹스', 'Pina Colada Mix', '믹스', '#d9d2ad'],
    gingerAle: ['진저 에일', 'Ginger Ale', '탄산', '#cabb84'],
    apricotBrandy: ['애프리콧 플레이버드 브랜디', 'Apricot Flavored Brandy', '리큐르', '#d69b69'],
    appleBrandy: ['애플 브랜디', 'Apple Brandy', '브랜디', '#b99d62'],
    benedictine: ['베네딕틴 DOM', 'Benedictine DOM', '리큐르', '#bda64c'],
    blueCuracao: ['블루 큐라소', 'Blue Curacao', '리큐르', '#4caccb'],
    whiteWine: ['화이트 와인', 'White Wine', '와인', '#c4c48c'],
    cassis: ['크렘 드 카시스', 'Crème de Cassis', '리큐르', '#935c7e'],
    gamhongro: ['감홍로 (40도)', 'Gam Hong Ro (40°)', '전통주', '#bd905c'],
    jindo: ['진도 홍주 (40도)', 'Jindo Hong Ju (40°)', '전통주', '#b86c6c'],
    mintWhite: ['크렘 드 멘트 화이트', 'Crème de Menthe (White)', '리큐르', '#c3d3c5'],
    whiteGrape: ['청포도 주스', 'White Grape Juice', '주스', '#b3c783'],
    raspberry: ['라즈베리 시럽', 'Raspberry Syrup', '시럽', '#b94e70'],
    andong: ['안동소주 (35도)', 'Andong Soju (35°)', '전통주', '#a5bacb'],
    insam: ['금산 인삼주 (43도)', 'Geumsan Insamju (43°)', '전통주', '#b4b584'],
    bokbunja: ['선운산 복분자주', 'Sunwoonsan Bokbunja Wine', '전통주', '#9b5272'],
    sprite: ['스프라이트', 'Sprite', '탄산', '#add3ac'],
    freshLemon: ['생레몬 착즙', 'Fresh Squeezed Lemon', '과일', '#e6cc58']
  };
  const glasses = {
    liqueur: ['스템드 리큐르 잔', 'Stemmed Liqueur Glass'],
    cocktail: ['칵테일 잔', 'Cocktail Glass'],
    rocks: ['올드 패션드 잔', 'Old-fashioned Glass'],
    pilsner: ['필스너 잔 (받침형)', 'Footed Pilsner Glass'],
    sour: ['사워 잔', 'Sour Glass'],
    sherry: ['셰리 잔 (2 oz)', 'Sherry Glass (2 oz)'],
    collins: ['콜린스 잔', 'Collins Glass'],
    highball: ['하이볼 잔', 'Highball Glass'],
    saucer: ['소서형 샴페인 잔', 'Champagne Glass (saucer)'],
    wine: ['화이트 와인 잔', 'White Wine Glass'],
    flute: ['플루트 샴페인 잔', 'Flute Champagne Glass']
  };
  const garnishes = {
    none: '없음', cherry: '체리', olive: '그린 올리브', orangeCherry: '오렌지 슬라이스 + 체리', nutmeg: '넛메그 가루',
    salt: '소금 리밍', lemonCherry: '레몬 슬라이스 + 체리', lemonTwist: '레몬 껍질 트위스트', pineappleCherry: '생파인애플 웨지 + 체리',
    lemonWedge: '레몬 웨지', citrusWedge: '라임 또는 레몬 웨지', apple: '사과 슬라이스', maiTai: '생파인애플 웨지(오렌지) + 체리',
    citrusTwist: '라임 또는 레몬 껍질 트위스트', citrusSlice: '라임 또는 레몬 슬라이스', lemonSlice: '레몬 슬라이스', orangeTwist: '오렌지 껍질 트위스트'
  };
  // Numeric values below retain the Q-Net oz/tsp/dash/part/ea units. No Fill amount is inferred.
  const rows = [
    [1,'푸스 카페','Pousse Cafe','Float','liqueur','none','grenadine:1/3 part|mintGreen:1/3 part|brandy:1/3 part','층은 아래에서 시럽 → 민트 → 브랜디. part는 비율입니다.'],
    [2,'맨해튼','Manhattan','Stir','cocktail','cherry','bourbon:1 1/2 oz|sweetVermouth:3/4 oz|bitters:1 dash','버번과 스위트 베르무트, 비터스 1 dash를 함께 기억하세요.'],
    [3,'드라이 마티니','Dry Martini','Stir','cocktail','olive','gin:2 oz|dryVermouth:1/3 oz','드라이 베르무트는 1/3 oz. 가니시는 그린 올리브입니다.'],
    [4,'올드 패션드','Old Fashioned','Build','rocks','orangeCherry','bourbon:1 1/2 oz|sugar:1 tsp|bitters:1 dash|soda:1/2 oz','소다 워터는 Fill이 아니라 1/2 oz입니다.'],
    [5,'브랜디 알렉산더','Brandy Alexander','Shake','cocktail','nutmeg','brandy:3/4 oz|cacaoBrown:3/4 oz|milk:3/4 oz','세 재료가 모두 3/4 oz. 카카오는 브라운입니다.'],
    [6,'싱가포르 슬링','Singapore Sling','Shake/Build','pilsner','orangeCherry','gin:1 1/2 oz|lemon:1/2 oz|sugar:1 tsp|soda:Fill|cherryBrandy:1/2 oz@top','소다는 채우고, 체리 플레이버드 브랜디 1/2 oz는 마지막에 올립니다.'],
    [7,'블랙 러시안','Black Russian','Build','rocks','none','vodka:1 oz|coffee:1/2 oz','보드카 : 커피 리큐르 = 2 : 1, 가니시 없음.'],
    [8,'마가리타','Margarita','Shake','cocktail','salt','tequila:1 1/2 oz|orangeLiqueur:1/2 oz|lime:1/2 oz','쿠앵트로 또는 트리플 섹 중 하나를 사용하며, 소금 리밍을 합니다.'],
    [9,'러스티 네일','Rusty Nail','Build','rocks','none','scotch:1 oz|drambuie:1/2 oz','스카치 위스키와 드람뷔, 두 재료만 사용합니다.'],
    [10,'위스키 사워','Whiskey Sour','Shake/Build','sour','lemonCherry','bourbon:1 1/2 oz|lemon:1/2 oz|sugar:1 tsp|soda:1 oz@top','소다 워터는 마지막에 1 oz. 사워 잔에 제출합니다.'],
    [11,'뉴욕','New York','Shake','cocktail','lemonTwist','bourbon:1 1/2 oz|lime:1/2 oz|sugar:1 tsp|grenadine:1/2 tsp','라임 주스와 그레나딘 1/2 tsp를 구분하세요.'],
    [12,'다이키리','Daiquiri','Shake','cocktail','none','rum:1 3/4 oz|lime:3/4 oz|sugar:1 tsp','럼 1 3/4 oz, 라임 3/4 oz, 가루 설탕 1 tsp.'],
    [13,'B-52','B-52','Float','sherry','none','coffee:1/3 part|irishCream:1/3 part|grandMarnier:1/3 part','커피 → 베일리스 → 그랑 마르니에의 3층. 셰리 잔은 2 oz 규격입니다.'],
    [14,'준 벅','June Bug','Shake','collins','pineappleCherry','melon:1 oz|coconutRum:1/2 oz|banana:1/2 oz|pineapple:2 oz|sweetSour:2 oz','미도리 1 oz, 두 리큐르류 각 1/2 oz, 주스·믹스 각 2 oz.'],
    [15,'바카디 칵테일','Bacardi Cocktail','Shake','cocktail','none','bacardi:1 3/4 oz|lime:3/4 oz|grenadine:1 tsp','바카디 럼 화이트를 지정합니다. 그레나딘은 1 tsp입니다.'],
    [16,'쿠바 리브레','Cuba Libre','Build','highball','lemonWedge','rum:1 1/2 oz|lime:1/2 oz|cola:Fill','라임 주스를 넣지만, 가니시는 레몬 웨지입니다.'],
    [17,'그래스호퍼','Grasshopper','Shake','saucer','none','mintGreen:1 oz|cacaoWhite:1 oz|milk:1 oz','민트 그린·카카오 화이트·밀크를 같은 양으로. 소서형 샴페인 잔.'],
    [18,'시브리즈','Seabreeze','Build','highball','citrusWedge','vodka:1 1/2 oz|cranberry:3 oz|grapefruit:1/2 oz','크랜베리 3 oz, 자몽 1/2 oz입니다.'],
    [19,'애플 마티니','Apple Martini','Shake','cocktail','apple','vodka:1 oz|applePucker:1 oz|lime:1/2 oz','보드카와 애플 퍼커는 각각 1 oz. 사과 슬라이스로 장식합니다.'],
    [20,'네그로니','Negroni','Build','rocks','lemonTwist','gin:3/4 oz|sweetVermouth:3/4 oz|campari:3/4 oz','시험 표준은 Build, 세 재료 각 3/4 oz, 레몬 껍질 트위스트입니다.'],
    [21,'롱 아일랜드 아이스드 티','Long Island Iced Tea','Build','collins','citrusWedge','gin:1/2 oz|vodka:1/2 oz|rum:1/2 oz|tequila:1/2 oz|tripleSec:1/2 oz|sweetSour:1 1/2 oz|cola:On Top','주류 5종은 각각 1/2 oz. 콜라는 On Top이며 수치가 지정되지 않았습니다.'],
    [22,'사이드카','Sidecar','Shake','cocktail','none','brandy:1 oz|tripleSec:1 oz|lemon:1/4 oz','브랜디와 트리플 섹 각 1 oz, 레몬 주스 1/4 oz.'],
    [23,'마이 타이','Mai-Tai','Blend','pilsner','maiTai','rum:1 1/4 oz|tripleSec:3/4 oz|lime:1 oz|pineapple:1 oz|orange:1 oz|grenadine:1/4 oz','시험 표준은 Blend. 세 과즙은 각각 1 oz입니다.'],
    [24,'피나 콜라다','Pina Colada','Blend','pilsner','pineappleCherry','rum:1 1/4 oz|pinaMix:2 oz|pineapple:2 oz','코코넛 럼 대신 피나 콜라다 믹스 2 oz를 사용합니다.'],
    [25,'코스모폴리탄','Cosmopolitan Cocktail','Shake','cocktail','citrusTwist','vodka:1 oz|tripleSec:1/2 oz|lime:1/2 oz|cranberry:1/2 oz','보드카만 1 oz, 나머지는 각각 1/2 oz입니다.'],
    [26,'모스코 뮬','Moscow Mule','Build','highball','citrusSlice','vodka:1 1/2 oz|lime:1/2 oz|gingerAle:Fill','시험 표준은 진저 에일과 하이볼 잔입니다.'],
    [27,'애프리콧 칵테일','Apricot Cocktail','Shake','cocktail','none','apricotBrandy:1 1/2 oz|gin:1 tsp|lemon:1/2 oz|orange:1/2 oz','드라이 진은 1 oz가 아니라 1 tsp입니다.'],
    [28,'허니문 칵테일','Honeymoon Cocktail','Shake','cocktail','none','appleBrandy:3/4 oz|benedictine:3/4 oz|tripleSec:1/4 oz|lemon:1/2 oz','애플 브랜디·베네딕틴 각 3/4 oz. 꿀은 들어가지 않습니다.'],
    [29,'블루 하와이안','Blue Hawaiian','Blend','pilsner','pineappleCherry','rum:1 oz|blueCuracao:1 oz|coconutRum:1 oz|pineapple:2 1/2 oz','세 주류는 각 1 oz, 파인애플 주스는 2 1/2 oz입니다.'],
    [30,'키르','Kir','Build','wine','lemonTwist','whiteWine:3 oz|cassis:1/2 oz','화이트 와인 3 oz와 카시스 1/2 oz. 레몬 껍질 트위스트.'],
    [31,'테킬라 선라이즈','Tequila Sunrise','Build/Float','pilsner','none','tequila:1 1/2 oz|orange:Fill|grenadine:1/2 oz@float','오렌지 주스를 채운 뒤 그레나딘을 넣어 층을 만듭니다.'],
    [32,'힐링','Healing','Shake','cocktail','lemonTwist','gamhongro:원문 1/1/2 oz|benedictine:1/3 oz|cassis:1/3 oz|sweetSour:1 oz','감홍로 용량은 원문 표기가 불명확합니다. 이 항목은 용량 채점에서 제외합니다.'],
    [33,'진도','Jindo','Shake','cocktail','none','jindo:1 oz|mintWhite:1/2 oz|whiteGrape:3/4 oz|raspberry:1/2 oz','진도 홍주 40도, 민트 화이트, 청포도 주스, 라즈베리 시럽.'],
    [34,'풋사랑','Puppy Love','Shake','cocktail','apple','andong:1 oz|tripleSec:1/3 oz|applePucker:1 oz|lime:1/3 oz','안동소주 35도. 트리플 섹과 라임은 각각 1/3 oz입니다.'],
    [35,'금산','Geumsan','Shake','cocktail','none','insam:1 1/2 oz|coffee:1/2 oz|applePucker:1/2 oz|lime:1 tsp','금산 인삼주 43도. 커피 리큐르 원문에는 Kahlûa가 병기되어 있습니다.'],
    [36,'고창','Gochang','Stir','flute','none','bokbunja:2 oz|tripleSec:1/2 oz|sprite:2 oz','선운산 복분자주와 스프라이트 각 2 oz. 플루트 샴페인 잔.'],
    [37,'진 피즈','Gin Fizz','Shake/Build','highball','lemonSlice','gin:1 1/2 oz|lemon:1/2 oz|sugar:1 tsp|soda:Fill','진·레몬·설탕을 셰이크하고 소다 워터로 채웁니다.'],
    [38,'프레시 레몬 스쿼시','Fresh Lemon Squash','Build','highball','lemonSlice','freshLemon:1/2 ea|sugar:2 tsp|soda:Fill','생레몬 반 개를 착즙합니다. 가루 설탕은 2 tsp입니다.'],
    [39,'버진 프루트 펀치','Virgin Fruit Punch','Blend','pilsner','pineappleCherry','orange:1 oz|pineapple:1 oz|cranberry:1 oz|grapefruit:1 oz|lemon:1/2 oz|grenadine:1/2 oz','네 과즙 각 1 oz, 레몬과 그레나딘 각 1/2 oz. 무알코올 메뉴.'],
    [40,'불바디에','Boulevardier','Stir','rocks','orangeTwist','bourbon:1 oz|sweetVermouth:1 oz|campari:1 oz','버번·스위트 베르무트·캄파리 각 1 oz, 오렌지 껍질 트위스트.']
  ];
  const colors = ['#b77b47','#d28850','#c5c48e','#c88145','#c2a28d','#e09271','#835044','#bbca8d','#b98545','#e2bc70','#dc8f72','#cfce9a','#bb9068','#abcb76','#e6a3a1','#8d6755','#a8c8aa','#dc919d','#b4cb86','#cb7665','#ad8565','#c7a568','#e6b57c','#e5cf94','#d99cae','#d6cc97','#dcac71','#caad71','#6bbaca','#b58ca4','#e8ae66','#a78f95','#c4859e','#b1bd8a','#b2a180','#ac738d','#dbd295','#dfd18b','#d29d85','#cb805a'];
  const cocktails = rows.map(([number,name,en,method,glass,garnish,recipe,tip],i) => {
    const list=recipe.split('|').map(item=>{const [id,raw]=item.split(':');const [amount,finish]=raw.split('@');return {id,amount,finish:finish||'',verified:!amount.startsWith('원문')};});
    const base = number===38||number===39 ? '무알코올' : number>=32&&number<=36 ? '전통주' : ingredients[list[0].id][2];
    return {id:'jj-'+String(number).padStart(2,'0'),number,name,en,method,glass,garnish,ingredients:list,tip,base,color:colors[i],page:number<=14?1:number<=29?2:3};
  });
  const data={source,ingredients,glasses,garnishes,cocktails};
  root.JojuData=data;
  if(typeof module!=='undefined')module.exports=data;
})(globalThis);
