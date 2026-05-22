const CATEGORIES = {
  Food: [
    'swiggy','zomato','mcdonald','kfc','pizza','burger','cafe','restaurant',
    'hotel','food','eat','domino','subway','starbucks','chai','biryani',
    'canteen','mess','dhaba','bakery','juice','coffee','snack','dine'
  ],
  Travel: [
    'uber','ola','rapido','metro','bus','train','irctc','flight','indigo',
    'spicejet','air india','makemytrip','goibibo','petrol','fuel','diesel',
    'toll','parking','cab','auto','taxi','redbus'
  ],
  Shopping: [
    'amazon','flipkart','myntra','ajio','meesho','nykaa','reliance','dmart',
    'big bazaar','mall','store','shop','market','retail','purchase',
    'cloth','fashion','shoe','watch','jewel','electronic','mobile','laptop'
  ],
  Entertainment: [
    'netflix','hotstar','prime','spotify','youtube','bookmyshow','pvr','inox',
    'cinema','movie','game','steam','concert','event'
  ],
  Health: [
    'pharmacy','medical','hospital','doctor','clinic','apollo','medplus',
    'medicine','health','gym','fitness','yoga','lab','diagnostic','chemist'
  ],
  Utilities: [
    'electricity','water','gas','internet','airtel','jio','vi','bsnl',
    'broadband','recharge','bill','maintenance','rent','emi','loan'
  ],
  Education: [
    'udemy','coursera','byju','unacademy','school','college','university',
    'book','stationery','tuition','class','course','exam','coaching'
  ]
};

function categorize(description) {
  const lower = (description || '').toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return category;
    }
  }
  return 'Others';
}

module.exports = { categorize, CATEGORIES };
