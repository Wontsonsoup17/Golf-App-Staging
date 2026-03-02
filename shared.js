// ==================== AUTO-UPDATE CHECK ====================
// Forces a hard reload when a new version is deployed
var APP_VERSION = '153';
(function() {
  var storedVersion = localStorage.getItem('app_version');
  if (storedVersion && storedVersion !== APP_VERSION) {
    // Version changed — clear browser caches and force reload
    localStorage.setItem('app_version', APP_VERSION);
    if (window.caches) {
      caches.keys().then(function(names) {
        names.forEach(function(name) { caches.delete(name); });
      }).then(function() {
        window.location.reload(true);
      });
    } else {
      window.location.reload(true);
    }
    return; // Stop executing — page will reload
  }
  if (!storedVersion) {
    localStorage.setItem('app_version', APP_VERSION);
  }
})();

// ==================== SERVICE WORKER ====================
// Registers on EVERY page load — forces network-first for all HTML/JS/CSS
// so no device ever gets stuck on stale cached files again
(function() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
      .catch(function() {});
  }
})();

// ==================== COURSE DATA ====================
const COURSES = [
  {
    id: 'sprain-lake', name: 'Sprain Lake',
    address: '290 E Grassy Sprain Rd, Yonkers, NY 10710', phone: '(914) 231-3481', par: 70,
    link: 'https://golf.westchestergov.com/sprain-lake/sprain_course-layout/#',
    overview: 'https://golf.westchestergov.com/wp-content/uploads/2022/01/sprain_layout.jpg',
    tees: {
      blue:  { label: 'Blue',  yards: 5950, rating: 68.7, slope: 125 },
      white: { label: 'White', yards: 5555, rating: 67.3, slope: 116 },
      gold:  { label: 'Gold',  yards: 4792, rating: 64.0, slope: 98  }
    },
    holes: [
      { num:1,  par:4, blue:359, white:339, gold:301, hcp:6,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SprainLake_Hole-1.gif' },
      { num:2,  par:4, blue:380, white:360, gold:334, hcp:2,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SprainLake_Hole-2.gif' },
      { num:3,  par:4, blue:358, white:328, gold:306, hcp:12, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SprainLake_Hole-34.gif' },
      { num:4,  par:3, blue:135, white:130, gold:118, hcp:18, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SprainLake_Hole-34.gif' },
      { num:5,  par:4, blue:300, white:276, gold:248, hcp:14, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SprainLake_Hole-5.gif' },
      { num:6,  par:4, blue:320, white:281, gold:249, hcp:10, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SprainLake_Hole-6.gif' },
      { num:7,  par:4, blue:386, white:370, gold:312, hcp:4,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SprainLake_Hole-7.gif' },
      { num:8,  par:4, blue:346, white:318, gold:270, hcp:8,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SprainLake_Hole-8.gif' },
      { num:9,  par:3, blue:170, white:155, gold:130, hcp:16, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SprainLake_Hole-9.gif' },
      { num:10, par:5, blue:510, white:465, gold:415, hcp:7,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SprainLake_Hole-10.gif' },
      { num:11, par:4, blue:347, white:311, gold:193, hcp:11, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SprainLake_Hole-11.gif' },
      { num:12, par:4, blue:392, white:370, gold:250, hcp:5,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SprainLake_Hole-1213.gif' },
      { num:13, par:3, blue:165, white:160, gold:135, hcp:17, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SprainLake_Hole-1213.gif' },
      { num:14, par:4, blue:320, white:304, gold:270, hcp:13, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SprainLake_Hole-14.gif' },
      { num:15, par:4, blue:414, white:390, gold:320, hcp:3,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SprainLake_Hole-15.gif' },
      { num:16, par:3, blue:165, white:150, gold:144, hcp:15, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SprainLake_Hole-16.gif' },
      { num:17, par:5, blue:455, white:433, gold:399, hcp:9,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SprainLake_Hole-17.gif' },
      { num:18, par:4, blue:428, white:415, gold:398, hcp:1,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SprainLake_Hole-18.gif' }
    ]
  },
  {
    id: 'dunwoodie', name: 'Dunwoodie',
    address: '1 Wasylenko Ln, Yonkers, NY 10701', phone: '(914) 231-3490', par: 70,
    link: 'https://golf.westchestergov.com/dunwoodie/dunwoodie-course-layout/',
    overview: 'https://golf.westchestergov.com/wp-content/uploads/2021/04/course_dunwoodie.png',
    tees: {
      black: { label: 'Black', yards: 5622, rating: 67.4, slope: 120 },
      blue:  { label: 'Blue',  yards: 5254, rating: 65.5, slope: 115 },
      green: { label: 'Green', yards: 4484, rating: 62.5, slope: 106 }
    },
    holes: [
      { num:1,  par:4, black:263, blue:235, green:213, hcp:13, img:'https://golf.westchestergov.com/wp-content/uploads/2020/09/01dunwoodie.gif' },
      { num:2,  par:4, black:320, blue:296, green:282, hcp:9,  img:'https://golf.westchestergov.com/wp-content/uploads/2020/09/02dunwoodie.gif' },
      { num:3,  par:4, black:362, blue:338, green:251, hcp:7,  img:'https://golf.westchestergov.com/wp-content/uploads/2020/09/03dunwoodie.gif' },
      { num:4,  par:4, black:370, blue:319, green:295, hcp:1,  img:'https://golf.westchestergov.com/wp-content/uploads/2020/09/04dunwoodie.gif' },
      { num:5,  par:4, black:321, blue:294, green:287, hcp:5,  img:'https://golf.westchestergov.com/wp-content/uploads/2020/09/05dunwoodie.gif' },
      { num:6,  par:5, black:506, blue:483, green:355, hcp:11, img:'https://golf.westchestergov.com/wp-content/uploads/2020/09/06dunwoodie.gif' },
      { num:7,  par:3, black:162, blue:148, green:128, hcp:17, img:'https://golf.westchestergov.com/wp-content/uploads/2020/09/07dunwoodie.gif' },
      { num:8,  par:4, black:375, blue:343, green:284, hcp:3,  img:'https://golf.westchestergov.com/wp-content/uploads/2020/09/08dunwoodie.gif' },
      { num:9,  par:4, black:237, blue:232, green:213, hcp:15, img:'https://golf.westchestergov.com/wp-content/uploads/2020/09/09dunwoodie.gif' },
      { num:10, par:3, black:165, blue:151, green:124, hcp:14, img:'https://golf.westchestergov.com/wp-content/uploads/2020/09/10dunwoodie.gif' },
      { num:11, par:5, black:483, blue:469, green:355, hcp:8,  img:'https://golf.westchestergov.com/wp-content/uploads/2020/09/11dunwoodie.gif' },
      { num:12, par:3, black:128, blue:122, green:117, hcp:16, img:'https://golf.westchestergov.com/wp-content/uploads/2020/09/12-13-dunwoodie.gif' },
      { num:13, par:4, black:316, blue:302, green:245, hcp:6,  img:'https://golf.westchestergov.com/wp-content/uploads/2020/09/12-13-dunwoodie.gif' },
      { num:14, par:3, black:158, blue:148, green:135, hcp:12, img:'https://golf.westchestergov.com/wp-content/uploads/2020/09/14dunwoodie.gif' },
      { num:15, par:4, black:394, blue:371, green:335, hcp:4,  img:'https://golf.westchestergov.com/wp-content/uploads/2020/09/15dunwoodie.gif' },
      { num:16, par:5, black:503, blue:485, green:397, hcp:10, img:'https://golf.westchestergov.com/wp-content/uploads/2020/09/16dunwoodie.gif' },
      { num:17, par:4, black:402, blue:385, green:342, hcp:2,  img:'https://golf.westchestergov.com/wp-content/uploads/2020/09/17dunwoodie.gif' },
      { num:18, par:3, black:157, blue:133, green:126, hcp:18, img:'https://golf.westchestergov.com/wp-content/uploads/2020/09/18dunwoodie.gif' }
    ]
  },
  {
    id: 'saxon-woods', name: 'Saxon Woods',
    address: '315 Mamaroneck Rd, Scarsdale, NY', phone: '(914) 231-3461', par: 72,
    link: 'https://golf.westchestergov.com/saxon-woods/saxon_course-layout/',
    overview: 'https://golf.westchestergov.com/wp-content/uploads/2022/01/saxon_layout1.jpg',
    tees: {
      blue:  { label: 'Blue',  yards: 6300, rating: 71.4, slope: 126 },
      white: { label: 'White', yards: 6038, rating: 69.5, slope: 122 },
      gold:  { label: 'Gold',  yards: 5375, rating: 66.0, slope: 113 }
    },
    holes: [
      { num:1,  par:4, blue:315, white:300, gold:270, hcp:11, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SaxonWoods_Hole-1.gif' },
      { num:2,  par:4, blue:300, white:285, gold:260, hcp:9,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SaxonWoods_Hole-2.gif' },
      { num:3,  par:5, blue:511, white:495, gold:450, hcp:3,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SaxonWoods_Hole-34.gif' },
      { num:4,  par:3, blue:168, white:155, gold:135, hcp:17, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SaxonWoods_Hole-34.gif' },
      { num:5,  par:4, blue:390, white:375, gold:340, hcp:1,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SaxonWoods_Hole-5.gif' },
      { num:6,  par:4, blue:311, white:295, gold:265, hcp:13, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SaxonWoods_Hole-6.gif' },
      { num:7,  par:3, blue:168, white:155, gold:135, hcp:15, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SaxonWoods_Hole-7.gif' },
      { num:8,  par:5, blue:508, white:490, gold:445, hcp:5,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SaxonWoods_Hole-8.gif' },
      { num:9,  par:4, blue:366, white:350, gold:320, hcp:7,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SaxonWoods_Hole-9.gif' },
      { num:10, par:4, blue:460, white:440, gold:395, hcp:4,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SaxonWoods_Hole-10.gif' },
      { num:11, par:4, blue:308, white:290, gold:265, hcp:14, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SaxonWoods_Hole-11.gif' },
      { num:12, par:4, blue:380, white:365, gold:330, hcp:8,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SaxonWoods_Hole-1213.gif' },
      { num:13, par:5, blue:460, white:445, gold:405, hcp:6,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SaxonWoods_Hole-1213.gif' },
      { num:14, par:4, blue:366, white:350, gold:315, hcp:12, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SaxonWoods_Hole-14.gif' },
      { num:15, par:4, blue:375, white:360, gold:325, hcp:10, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SaxonWoods_Hole-15.gif' },
      { num:16, par:3, blue:152, white:140, gold:120, hcp:18, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SaxonWoods_Hole-16.gif' },
      { num:17, par:4, blue:402, white:385, gold:350, hcp:2,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SaxonWoods_Hole-17.gif' },
      { num:18, par:4, blue:360, white:345, gold:315, hcp:16, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/SaxonWoods_Hole-18.gif' }
    ]
  },
  {
    id: 'hudson-hills', name: 'Hudson Hills',
    address: '400 Croton Dam Rd, Ossining, NY', phone: '(914) 864-3000', par: 71,
    link: 'https://golf.westchestergov.com/hudson-hills/',
    overview: 'https://golf.westchestergov.com/wp-content/uploads/2021/08/hudson-hills-course.jpg',
    tees: {
      black: { label: 'Black', yards: 6935, rating: 74.0, slope: 136 },
      green: { label: 'Green', yards: 6324, rating: 71.2, slope: 130 },
      blue:  { label: 'Blue',  yards: 5555, rating: 67.8, slope: 123 },
      gold:  { label: 'Gold',  yards: 5102, rating: 70.7, slope: 127 }
    },
    holes: [
      { num:1,  par:4, black:444, green:405, blue:372, gold:300, hcp:7,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/HudsonHills_Hole-1.jpg' },
      { num:2,  par:5, black:530, green:502, blue:469, gold:427, hcp:5,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/HudsonHills_Hole-2.jpg' },
      { num:3,  par:3, black:171, green:151, blue:135, gold:119, hcp:17, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/HudsonHills_Hole-3.jpg' },
      { num:4,  par:4, black:456, green:423, blue:393, gold:324, hcp:3,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/HudsonHills_Hole-4.jpg' },
      { num:5,  par:4, black:371, green:340, blue:285, gold:275, hcp:11, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/HudsonHills_Hole-5.jpg' },
      { num:6,  par:3, black:155, green:127, blue:107, gold:85,  hcp:15, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/HudsonHills_Hole-6.jpg' },
      { num:7,  par:5, black:564, green:514, blue:490, gold:455, hcp:1,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/HudsonHills_Hole-7.jpg' },
      { num:8,  par:4, black:389, green:369, blue:326, gold:287, hcp:9,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/HudsonHills_Hole-8.jpg' },
      { num:9,  par:3, black:152, green:138, blue:122, gold:106, hcp:13, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/HudsonHills_Hole-9.jpg' },
      { num:10, par:5, black:521, green:491, blue:452, gold:413, hcp:8,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/HudsonHills_Hole-10.jpg' },
      { num:11, par:3, black:200, green:174, blue:151, gold:120, hcp:16, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/HudsonHills_Hole-11.jpg' },
      { num:12, par:4, black:435, green:400, blue:362, gold:313, hcp:4,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/HudsonHills_Hole-12.jpg' },
      { num:13, par:4, black:474, green:424, blue:380, gold:337, hcp:6,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/HudsonHills_Hole-13.jpg' },
      { num:14, par:3, black:187, green:163, blue:140, gold:97,  hcp:18, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/HudsonHills_Hole-14.jpg' },
      { num:15, par:5, black:568, green:532, blue:502, gold:464, hcp:2,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/HudsonHills_Hole-15.jpg' },
      { num:16, par:4, black:407, green:375, blue:351, gold:324, hcp:14, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/HudsonHills_Hole-16.jpg' },
      { num:17, par:4, black:458, green:393, blue:348, gold:316, hcp:12, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/HudsonHills_Hole-17.jpg' },
      { num:18, par:4, black:453, green:403, blue:370, gold:341, hcp:10, img:'https://golf.westchestergov.com/wp-content/uploads/2021/08/HudsonHills_Hole-18.jpg' }
    ]
  },
  {
    id: 'mohansic', name: 'Mohansic',
    address: '1500 Baldwin Rd, Yorktown Heights, NY 10698', phone: '(914) 862-5283', par: 70,
    link: 'https://golf.westchestergov.com/mohansic/mohansic-course-layout/',
    overview: 'https://golf.westchestergov.com/wp-content/uploads/2021/04/mohansic-course.jpg',
    tees: {
      white: { label: 'White', yards: 6548, rating: 72.5, slope: 133 },
      blue:  { label: 'Blue',  yards: 6285, rating: 70.7, slope: 130 },
      red:   { label: 'Red',   yards: 5456, rating: 72.6, slope: 125 }
    },
    holes: [
      { num:1,  par:4, white:353, blue:340, red:310, hcp:13, img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/01mohansic.gif' },
      { num:2,  par:4, white:382, blue:370, red:330, hcp:7,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/02mohansic.gif' },
      { num:3,  par:4, white:425, blue:410, red:365, hcp:3,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/34-mohansic.gif' },
      { num:4,  par:4, white:442, blue:425, red:375, hcp:1,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/34-mohansic.gif' },
      { num:5,  par:3, white:140, blue:130, red:115, hcp:17, img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/05mohansic.gif' },
      { num:6,  par:4, white:383, blue:370, red:325, hcp:9,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/06mohansic.gif' },
      { num:7,  par:3, white:168, blue:155, red:140, hcp:15, img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/07mohansic.gif' },
      { num:8,  par:4, white:344, blue:330, red:295, hcp:11, img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/08mohansic.gif' },
      { num:9,  par:5, white:592, blue:570, red:505, hcp:5,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/09mohansic.gif' },
      { num:10, par:5, white:495, blue:480, red:430, hcp:18, img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/10mohansic.gif' },
      { num:11, par:4, white:428, blue:415, red:370, hcp:4,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/11mohansic.gif' },
      { num:12, par:4, white:395, blue:380, red:340, hcp:10, img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/1213mohansic.gif' },
      { num:13, par:3, white:208, blue:195, red:165, hcp:14, img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/1213mohansic.gif' },
      { num:14, par:4, white:432, blue:420, red:370, hcp:2,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/14mphansic.gif' },
      { num:15, par:4, white:373, blue:360, red:320, hcp:8,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/15mohansic.gif' },
      { num:16, par:4, white:395, blue:380, red:340, hcp:6,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/16mohansic.gif' },
      { num:17, par:4, white:402, blue:390, red:345, hcp:12, img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/17mohansic.gif' },
      { num:18, par:3, white:191, blue:180, red:155, hcp:16, img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/18mohansic.gif' }
    ]
  },
  {
    id: 'maple-moor', name: 'Maple Moor',
    address: '1128 North St, White Plains, NY 10605', phone: '(914) 995-9200', par: 71,
    link: 'https://golf.westchestergov.com/maple-moor/maple-moor_course-layout/',
    overview: 'https://golf.westchestergov.com/wp-content/uploads/2021/04/maple-moor-layout.jpg',
    tees: {
      blue:  { label: 'Blue',  yards: 6360, rating: 71.2, slope: 130 },
      white: { label: 'White', yards: 6065, rating: 69.4, slope: 128 },
      gold:  { label: 'Gold',  yards: 5645, rating: 65.0, slope: 117 },
      red:   { label: 'Red',   yards: 5289, rating: 72.0, slope: 127 }
    },
    holes: [
      { num:1,  par:4, blue:383, white:365, gold:340, red:320, hcp:7,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/01maplemoor.gif' },
      { num:2,  par:3, blue:190, white:175, gold:160, red:145, hcp:15, img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/02maplemoor.gif' },
      { num:3,  par:5, blue:548, white:530, gold:490, red:460, hcp:3,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/34MapleMoor.gif' },
      { num:4,  par:4, blue:334, white:320, gold:295, red:275, hcp:17, img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/34MapleMoor.gif' },
      { num:5,  par:4, blue:401, white:385, gold:355, red:335, hcp:9,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/05maplemoor.gif' },
      { num:6,  par:5, blue:470, white:455, gold:420, red:395, hcp:1,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/06maplemoor.gif' },
      { num:7,  par:3, blue:202, white:185, gold:170, red:155, hcp:13, img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/07maplemoor.gif' },
      { num:8,  par:4, blue:378, white:360, gold:335, red:315, hcp:11, img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/08maplemoor.gif' },
      { num:9,  par:4, blue:434, white:420, gold:390, red:365, hcp:5,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/09maplemoor.gif' },
      { num:10, par:4, blue:442, white:425, gold:395, red:370, hcp:6,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/10maplemoor.gif' },
      { num:11, par:3, blue:142, white:130, gold:115, red:100, hcp:18, img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/11maplemoor.gif' },
      { num:12, par:5, blue:489, white:475, gold:445, red:420, hcp:16, img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/1213maplemoor.gif' },
      { num:13, par:4, blue:265, white:250, gold:230, red:215, hcp:2,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/1213maplemoor.gif' },
      { num:14, par:4, blue:400, white:385, gold:355, red:335, hcp:8,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/14maplemoor.gif' },
      { num:15, par:3, blue:202, white:185, gold:165, red:150, hcp:10, img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/15maplemoor.gif' },
      { num:16, par:4, blue:348, white:335, gold:310, red:290, hcp:12, img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/16maplemoor.gif' },
      { num:17, par:4, blue:349, white:335, gold:310, red:290, hcp:14, img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/17maplemoor.gif' },
      { num:18, par:4, blue:383, white:370, gold:345, red:325, hcp:4,  img:'https://golf.westchestergov.com/wp-content/uploads/2021/04/18maplemooor.gif' }
    ]
  },

  // ==================== OTHER COURSES ====================
  {
    id: 'punta-borinquen', name: 'Punta Borinquen',
    address: 'Aguadilla, Puerto Rico', phone: '(939) 224-9315', par: 72,
    group: 'other',
    link: 'https://www.puntaborinquengolfclub.org/visit-our-club',
    overview: '',
    tees: {
      black: { label: 'Black', yards: 7268, rating: 75.5, slope: 139 },
      blue:  { label: 'Blue',  yards: 6633, rating: 73.4, slope: 135 },
      white: { label: 'White', yards: 6098, rating: 71.9, slope: 131 },
      gold:  { label: 'Gold',  yards: 5150, rating: 66.8, slope: 122 },
      red:   { label: 'Red',   yards: 4900, rating: 65.7, slope: 120 }
    },
    holes: [
      { num:1,  par:5, black:526, blue:524, white:510, gold:445, red:380, hcp:5  },
      { num:2,  par:3, black:239, blue:190, white:167, gold:164, red:153, hcp:17 },
      { num:3,  par:4, black:469, blue:400, white:375, gold:276, red:278, hcp:9  },
      { num:4,  par:4, black:401, blue:345, white:320, gold:242, red:236, hcp:10 },
      { num:5,  par:4, black:428, blue:418, white:390, gold:305, red:276, hcp:8  },
      { num:6,  par:4, black:352, blue:352, white:340, gold:274, red:261, hcp:12 },
      { num:7,  par:5, black:570, blue:525, white:490, gold:437, red:435, hcp:3  },
      { num:8,  par:3, black:180, blue:180, white:153, gold:135, red:90,  hcp:15 },
      { num:9,  par:4, black:429, blue:348, white:334, gold:250, red:250, hcp:7  },
      { num:10, par:5, black:539, blue:539, white:457, gold:414, red:410, hcp:4  },
      { num:11, par:3, black:210, blue:180, white:172, gold:152, red:146, hcp:16 },
      { num:12, par:4, black:445, blue:378, white:369, gold:296, red:330, hcp:11 },
      { num:13, par:4, black:320, blue:320, white:293, gold:272, red:265, hcp:14 },
      { num:14, par:4, black:470, blue:440, white:383, gold:330, red:325, hcp:2  },
      { num:15, par:4, black:460, blue:364, white:332, gold:242, red:220, hcp:13 },
      { num:16, par:3, black:200, blue:170, white:147, gold:120, red:127, hcp:18 },
      { num:17, par:5, black:570, blue:530, white:470, gold:423, red:412, hcp:6  },
      { num:18, par:4, black:460, blue:430, white:396, gold:373, red:306, hcp:1  }
    ]
  },
  {
    id: 'brennan', name: 'E. Gaynor Brennan',
    address: '451 Stillwater Rd, Stamford, CT 06902', phone: '(203) 324-4185', par: 71,
    group: 'other',
    link: 'https://www.brennangolf.com/-hole-by-hole',
    overview: 'https://cdn.cybergolf.com/images/2019/Course-Overview.jpg',
    tees: {
      blue:  { label: 'Blue (Back)',    yards: 5893, rating: 70.0, slope: 124 },
      white: { label: 'White (Middle)', yards: 5542, rating: 68.6, slope: 120 },
      red:   { label: 'Red (Forward)',  yards: 5017, rating: 71.4, slope: 122 }
    },
    holes: [
      { num:1,  par:4, blue:360, white:348, red:275, hcp:7,  img:'https://cdn.cybergolf.com/images/2019/Hole-1.jpg' },
      { num:2,  par:4, blue:392, white:382, red:322, hcp:5,  img:'https://cdn.cybergolf.com/images/2019/Hole-2.jpg' },
      { num:3,  par:3, blue:147, white:132, red:95,  hcp:13, img:'https://cdn.cybergolf.com/images/2019/Hole-3.jpg' },
      { num:4,  par:5, blue:460, white:432, red:400, hcp:11, img:'https://cdn.cybergolf.com/images/2019/Hole-4.jpg' },
      { num:5,  par:4, blue:368, white:355, red:343, hcp:1,  img:'https://cdn.cybergolf.com/images/2019/Hole-5.jpg' },
      { num:6,  par:5, blue:485, white:433, red:417, hcp:9,  img:'https://cdn.cybergolf.com/images/2019/Hole-6.jpg' },
      { num:7,  par:4, blue:372, white:350, red:305, hcp:3,  img:'https://cdn.cybergolf.com/images/2019/Hole-7.jpg' },
      { num:8,  par:4, blue:279, white:267, red:258, hcp:17, img:'https://cdn.cybergolf.com/images/2019/Hole-8.jpg' },
      { num:9,  par:3, blue:123, white:108, red:93,  hcp:15, img:'https://cdn.cybergolf.com/images/2019/Hole-9.jpg' },
      { num:10, par:5, blue:454, white:440, red:377, hcp:10, img:'https://cdn.cybergolf.com/images/2019/Hole-10.jpg' },
      { num:11, par:4, blue:373, white:317, red:300, hcp:4,  img:'https://cdn.cybergolf.com/images/2019/Hole-11.jpg' },
      { num:12, par:4, blue:312, white:300, red:286, hcp:16, img:'https://cdn.cybergolf.com/images/2019/Hole-12.jpg' },
      { num:13, par:4, blue:320, white:300, red:290, hcp:8,  img:'https://cdn.cybergolf.com/images/2019/Hole-13.jpg' },
      { num:14, par:4, blue:345, white:320, red:290, hcp:2,  img:'https://cdn.cybergolf.com/images/2019/Hole-14.jpg' },
      { num:15, par:3, blue:228, white:218, red:208, hcp:12, img:'https://cdn.cybergolf.com/images/2019/Hole-15.jpg' },
      { num:16, par:4, blue:398, white:385, red:332, hcp:6,  img:'https://cdn.cybergolf.com/images/2019/Hole-16.jpg' },
      { num:17, par:3, blue:176, white:160, red:140, hcp:18, img:'https://cdn.cybergolf.com/images/2019/Hole-17.jpg' },
      { num:18, par:4, blue:301, white:295, red:286, hcp:14, img:'https://cdn.cybergolf.com/images/2019/Hole-18.jpg' }
    ]
  }
];

// ==================== STORAGE ====================
const STORAGE_KEY = 'westchester-golf-v2';

function loadRounds() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved).rounds || [];
    // migrate from v1
    const old = localStorage.getItem('westchester-golf-tracker');
    if (old) {
      const parsed = JSON.parse(old);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ rounds: parsed.rounds || [] }));
      return parsed.rounds || [];
    }
  } catch(e) {}
  return [];
}

function saveRounds(rounds) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ rounds }));
}

function getActiveRound() {
  try {
    const data = localStorage.getItem('active-round-v2');
    return data ? JSON.parse(data) : null;
  } catch(e) { return null; }
}

function setActiveRound(round) {
  localStorage.setItem('active-round-v2', JSON.stringify(round));
}

function clearActiveRound() {
  localStorage.removeItem('active-round-v2');
}

function getCourse(courseId) {
  return COURSES.find(c => c.id === courseId);
}

// ==================== MOBILE KEYBOARD FIX ====================
// Inputs use readonly + onfocus="this.removeAttribute('readonly')" in HTML
// to prevent iOS from auto-focusing and opening the keyboard on page load.
// This blur is a safety net for any edge cases.
(function() {
  function blurActiveInput() {
    var el = document.activeElement;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
      el.blur();
    }
  }
  window.addEventListener('pageshow', blurActiveInput);
  setTimeout(blurActiveInput, 300);
})();

// ==================== HELPERS ====================
function getScoreClass(score, par) {
  if (!score) return '';
  const diff = score - par;
  if (diff <= -2) return 'eagle';
  if (diff === -1) return 'birdie';
  if (diff === 0) return 'par-score';
  if (diff === 1) return 'bogey';
  return 'double-plus';
}

function getScoreLabel(score, par) {
  if (!score) return '';
  const diff = score - par;
  if (diff <= -3) return 'Albatross';
  if (diff === -2) return 'Eagle';
  if (diff === -1) return 'Birdie';
  if (diff === 0) return 'Par';
  if (diff === 1) return 'Bogey';
  if (diff === 2) return 'Double';
  if (diff === 3) return 'Triple';
  return '+' + diff;
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });
}

function formatDiff(total, par) {
  const diff = total - par;
  if (diff === 0) return 'E';
  return diff > 0 ? '+' + diff : diff.toString();
}

// Create blank tracking data for a player (18 holes)
function createPlayerTracking() {
  return {
    putts: new Array(18).fill(0),
    fairway: new Array(18).fill(false),   // hit fairway?
    gir: new Array(18).fill(false),       // green in regulation?
    mulligans: new Array(18).fill(0),
    mulliganLocations: new Array(18).fill(null), // null or array of "tee"/"fairway"/"green"
    penalties: new Array(18).fill(0),
    penaltyLocations: new Array(18).fill(null) // null or array of "water"/"ob"/"lateral"/"unplayable"
  };
}

// ==================== USER HEADER ====================
function renderUserHeader(user) {
  const header = document.getElementById('userHeader');
  if (!header || !user) return;
  const name = user.displayName || user.email.split('@')[0];
  const initial = name.charAt(0).toUpperCase();
  const avatarUrl = getUserAvatar(user.uid);
  const avatarContent = avatarUrl
    ? '<img src="' + avatarUrl + '" class="user-avatar-img">'
    : initial;

  // Header just shows clickable avatar+name
  header.innerHTML =
    '<div class="profile-trigger" onclick="toggleProfilePanel()">' +
      '<div class="user-avatar' + (avatarUrl ? ' has-image' : '') + '">' +
        avatarContent +
      '</div>' +
      '<div><div class="user-name">' + name + '</div></div>' +
    '</div>' +
    '<input type="file" id="avatarInput" accept="image/*" style="display:none" onchange="handleAvatarUpload(this)">';

  // Create slide-out panel (once, appended to body)
  var existingPanel = document.getElementById('profilePanel');
  var existingBackdrop = document.getElementById('profileBackdrop');
  if (existingPanel) existingPanel.remove();
  if (existingBackdrop) existingBackdrop.remove();

  var panelAvatarContent = avatarUrl
    ? '<img src="' + avatarUrl + '">'
    : initial;

  var backdrop = document.createElement('div');
  backdrop.className = 'profile-backdrop';
  backdrop.id = 'profileBackdrop';
  backdrop.onclick = function() { closeProfilePanel(); };
  document.body.appendChild(backdrop);

  var panel = document.createElement('div');
  panel.className = 'profile-panel';
  panel.id = 'profilePanel';
  panel.innerHTML =
    '<div class="profile-panel-header">' +
      '<div class="profile-panel-avatar' + (avatarUrl ? ' has-image' : '') + '">' +
        panelAvatarContent +
      '</div>' +
      '<div class="profile-panel-name">' + name + '</div>' +
      '<div class="profile-panel-sub">Westchester Golf</div>' +
    '</div>' +
    '<div class="profile-panel-menu">' +
      '<button class="profile-menu-item" onclick="handleChangePhoto()"><span class="menu-icon">&#128247;</span> Change Photo</button>' +
      '<button class="profile-menu-item" onclick="handleChangeUsernameModal()"><span class="menu-icon">&#9998;</span> Change Username</button>' +
      '<button class="profile-menu-item" onclick="handleChangePasswordModal()"><span class="menu-icon">&#128274;</span> Change Password</button>' +
      '<div class="profile-menu-separator"></div>' +
      '<button class="profile-menu-item danger" onclick="signOut()"><span class="menu-icon">&#128682;</span> Sign Out</button>' +
    '</div>';
  document.body.appendChild(panel);
}

// ==================== PROFILE SLIDE PANEL ====================

window.toggleProfilePanel = function() {
  var panel = document.getElementById('profilePanel');
  var backdrop = document.getElementById('profileBackdrop');
  if (!panel) return;
  var isOpen = panel.classList.contains('open');
  if (isOpen) {
    closeProfilePanel();
  } else {
    panel.classList.add('open');
    if (backdrop) backdrop.classList.add('show');
    document.body.classList.add('profile-panel-open');
  }
};

window.closeProfilePanel = function() {
  var panel = document.getElementById('profilePanel');
  var backdrop = document.getElementById('profileBackdrop');
  if (panel) panel.classList.remove('open');
  if (backdrop) backdrop.classList.remove('show');
  document.body.classList.remove('profile-panel-open');
};

window.handleChangePhoto = function() {
  closeProfilePanel();
  var input = document.getElementById('avatarInput');
  if (input) input.click();
};

function handleAvatarUpload(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  var user = getCurrentUser();
  if (!user) return;
  processProfileImage(file)
    .then(function(dataUrl) {
      setUserAvatar(user.uid, dataUrl);
      renderUserHeader(user);
    })
    .catch(function(err) {
      alert(err.message || 'Could not process image.');
    });
  input.value = '';
}

// ==================== CHANGE USERNAME MODAL ====================

window.handleChangeUsernameModal = function() {
  closeProfilePanel();
  // Remove existing modal if any
  var old = document.getElementById('profileModal');
  if (old) old.remove();

  var modal = document.createElement('div');
  modal.className = 'modal-overlay show';
  modal.id = 'profileModal';
  modal.innerHTML =
    '<div class="modal">' +
      '<h3>Change Username</h3>' +
      '<div class="profile-modal-form">' +
        '<div class="form-group">' +
          '<label>New Username</label>' +
          '<input type="text" id="newUsernameInput" placeholder="Enter new username" maxlength="20" autocapitalize="none">' +
        '</div>' +
        '<div class="form-error" id="usernameError"></div>' +
      '</div>' +
      '<div class="modal-actions">' +
        '<button class="btn-secondary" onclick="closeProfileModal()">Cancel</button>' +
        '<button class="btn-gold" id="saveUsernameBtn" onclick="submitChangeUsername()">Save</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
};

window.submitChangeUsername = function() {
  var input = document.getElementById('newUsernameInput');
  var errEl = document.getElementById('usernameError');
  var btn = document.getElementById('saveUsernameBtn');
  if (!input || !errEl || !btn) return;

  var newName = input.value.trim();
  if (!newName) { errEl.textContent = 'Please enter a username.'; errEl.classList.add('show'); return; }

  btn.disabled = true;
  btn.style.opacity = '0.6';
  errEl.classList.remove('show');

  changeUsername(newName).then(function() {
    var user = getCurrentUser();
    renderUserHeader(user);
    closeProfileModal();
  }).catch(function(err) {
    btn.disabled = false;
    btn.style.opacity = '1';
    errEl.textContent = err.message || 'Could not change username.';
    errEl.classList.add('show');
  });
};

// ==================== CHANGE PASSWORD MODAL ====================

window.handleChangePasswordModal = function() {
  closeProfilePanel();
  var old = document.getElementById('profileModal');
  if (old) old.remove();

  var modal = document.createElement('div');
  modal.className = 'modal-overlay show';
  modal.id = 'profileModal';
  modal.innerHTML =
    '<div class="modal">' +
      '<h3>Change Password</h3>' +
      '<div class="profile-modal-form">' +
        '<div class="form-group">' +
          '<label>Current Password</label>' +
          '<input type="password" id="currentPwInput" placeholder="Enter current password">' +
        '</div>' +
        '<div class="form-group">' +
          '<label>New Password</label>' +
          '<input type="password" id="newPwInput" placeholder="At least 6 characters">' +
        '</div>' +
        '<div class="form-group">' +
          '<label>Confirm New Password</label>' +
          '<input type="password" id="confirmPwInput" placeholder="Confirm new password">' +
        '</div>' +
        '<div class="form-error" id="passwordError"></div>' +
      '</div>' +
      '<div class="modal-actions">' +
        '<button class="btn-secondary" onclick="closeProfileModal()">Cancel</button>' +
        '<button class="btn-gold" id="savePwBtn" onclick="submitChangePassword()">Save</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
};

window.submitChangePassword = function() {
  var currentPw = document.getElementById('currentPwInput');
  var newPw = document.getElementById('newPwInput');
  var confirmPw = document.getElementById('confirmPwInput');
  var errEl = document.getElementById('passwordError');
  var btn = document.getElementById('savePwBtn');
  if (!currentPw || !newPw || !confirmPw || !errEl || !btn) return;

  errEl.classList.remove('show');

  if (!currentPw.value) { errEl.textContent = 'Enter your current password.'; errEl.classList.add('show'); return; }
  if (newPw.value.length < 6) { errEl.textContent = 'New password must be at least 6 characters.'; errEl.classList.add('show'); return; }
  if (newPw.value !== confirmPw.value) { errEl.textContent = 'Passwords do not match.'; errEl.classList.add('show'); return; }

  btn.disabled = true;
  btn.style.opacity = '0.6';

  changeUserPassword(currentPw.value, newPw.value).then(function() {
    closeProfileModal();
    alert('Password changed successfully.');
  }).catch(function(err) {
    btn.disabled = false;
    btn.style.opacity = '1';
    errEl.textContent = err.message || 'Could not change password.';
    errEl.classList.add('show');
  });
};

window.closeProfileModal = function() {
  var modal = document.getElementById('profileModal');
  if (modal) modal.remove();
};

// ==================== NAV ====================
function renderBottomNav(activePage) {
  const nav = document.getElementById('bottomNav');
  if (!nav) return;
  var groupCode = localStorage.getItem('active-group-code');
  var liveHref = groupCode ? 'live-game.html?group=' + groupCode : 'live-game.html';
  const pages = [
    { id: 'courses',  label: 'Courses',  icon: '&#9971;',   href: 'index.html' },
    { id: 'live',     label: 'Live',     icon: '&#127942;', href: liveHref },
    { id: 'history',  label: 'History',  icon: '&#128203;', href: 'history.html' },
    { id: 'stats',    label: 'Board',  icon: '&#128202;', href: 'stats.html' },
    { id: 'personal', label: 'Personal', icon: '&#128100;', href: 'personal.html' }
  ];
  nav.innerHTML = pages.map(p => `
    <a href="${p.href}" class="${p.id === activePage ? 'active' : ''}">
      <span class="nav-icon">${p.icon}</span>
      ${p.label}
    </a>
  `).join('');
}

function renderActiveRoundBanner() {
  const banner = document.getElementById('activeRoundBanner');
  if (!banner) return;

  // Check for active group round first
  const groupCode = localStorage.getItem('active-group-code');
  if (groupCode) {
    banner.innerHTML = `
      <a href="scorecard.html?group=${groupCode}" class="active-round-banner">
        <span>&#127948; Live Group Round [${groupCode}]</span>
        <span>Resume &rarr;</span>
      </a>
    `;
    return;
  }

  // Check for solo active round
  const active = getActiveRound();
  if (active) {
    const course = getCourse(active.courseId);
    const holesScored = active.players.reduce((max, p) => {
      const count = active.scores[p].filter(s => s > 0).length;
      return Math.max(max, count);
    }, 0);
    banner.innerHTML = `
      <a href="scorecard.html" class="active-round-banner">
        <span>&#127948; Live: ${course ? course.name : 'Round'} (${holesScored}/18)</span>
        <span>Resume &rarr;</span>
      </a>
    `;
  } else {
    banner.innerHTML = '';
  }
}

// ==================== PROFILE PICTURE ====================
function processProfileImage(file) {
  return new Promise(function(resolve, reject) {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Please select an image file.'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('Image is too large. Please choose one under 10MB.'));
      return;
    }
    var reader = new FileReader();
    reader.onerror = function() { reject(new Error('Could not read file.')); };
    reader.onload = function(e) {
      var img = new Image();
      img.onerror = function() { reject(new Error('Could not load image.')); };
      img.onload = function() {
        var SIZE = 128;
        var canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        var ctx = canvas.getContext('2d');
        // Center-crop to square
        var sx, sy, sSize;
        if (img.width > img.height) {
          sSize = img.height;
          sx = (img.width - sSize) / 2;
          sy = 0;
        } else {
          sSize = img.width;
          sx = 0;
          sy = (img.height - sSize) / 2;
        }
        ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, SIZE, SIZE);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ==================== SUPPORT / ISSUE CENTER ====================
// Renders a floating ⚠️ button on every authenticated page.
// Tapping opens a support modal. Tickets are saved to Firebase.

(function() {
  // Wait for auth to be ready before rendering
  onAuthReady(function(user) {
    if (!user) return; // Only show on authenticated pages

    // Don't add if already exists
    if (document.getElementById('supportFab')) return;

    // Create the floating button container (holds both FABs)
    var fabWrap = document.createElement('div');
    fabWrap.className = 'fab-group';
    fabWrap.id = 'fabGroup';

    // Cache nuke button 💣
    var nukeFab = document.createElement('div');
    nukeFab.className = 'support-fab nuke-fab';
    nukeFab.id = 'nukeFab';
    nukeFab.innerHTML = '\uD83D\uDCA3';
    nukeFab.setAttribute('role', 'button');
    nukeFab.setAttribute('aria-label', 'Force clear cache and reload');
    nukeFab.onclick = function() { openNukeModal(); };

    // Support / issue button ⚠️
    var fab = document.createElement('div');
    fab.className = 'support-fab';
    fab.id = 'supportFab';
    fab.innerHTML = '\u26A0\uFE0F';
    fab.setAttribute('role', 'button');
    fab.setAttribute('aria-label', 'Report an issue');
    fab.onclick = function() { openSupportModal(); };

    fabWrap.appendChild(nukeFab);
    fabWrap.appendChild(fab);
    document.body.appendChild(fabWrap);
  });
})();

window.openSupportModal = function() {
  // Remove existing if any
  var old = document.getElementById('supportModal');
  if (old) old.remove();

  var currentPage = window.location.pathname.split('/').pop() || 'index.html';

  var modal = document.createElement('div');
  modal.className = 'modal-overlay show';
  modal.id = 'supportModal';
  modal.innerHTML =
    '<div class="modal">' +
      '<h3>\u26A0\uFE0F Report an Issue</h3>' +
      '<div class="support-tab-row">' +
        '<button class="support-tab active" id="supportTabIssue" onclick="switchSupportTab(\'issue\')">Issue</button>' +
        '<button class="support-tab" id="supportTabSuggestion" onclick="switchSupportTab(\'suggestion\')">Suggestion</button>' +
      '</div>' +
      '<input type="hidden" id="supportType" value="issue">' +
      '<div class="support-form-group">' +
        '<label id="supportDescLabel">What\'s not working?</label>' +
        '<textarea id="supportDesc" placeholder="Describe the issue..." maxlength="500"></textarea>' +
      '</div>' +
      '<div class="support-form-group">' +
        '<div class="support-page-info">' +
          '<span class="page-label">Page:</span>' +
          '<span>' + currentPage + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="form-error" id="supportError" style="margin-bottom:12px"></div>' +
      '<div class="modal-actions">' +
        '<button class="btn-secondary" onclick="closeSupportModal()">Cancel</button>' +
        '<button class="btn-gold" id="supportSubmitBtn" onclick="submitSupportForm()">Submit</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
};

window.switchSupportTab = function(tab) {
  var issueBtn = document.getElementById('supportTabIssue');
  var suggBtn = document.getElementById('supportTabSuggestion');
  var typeInput = document.getElementById('supportType');
  var label = document.getElementById('supportDescLabel');
  var desc = document.getElementById('supportDesc');
  if (!issueBtn || !suggBtn) return;

  if (tab === 'issue') {
    issueBtn.classList.add('active');
    suggBtn.classList.remove('active');
    if (typeInput) typeInput.value = 'issue';
    if (label) label.textContent = "What's not working?";
    if (desc) desc.placeholder = 'Describe the issue...';
  } else {
    suggBtn.classList.add('active');
    issueBtn.classList.remove('active');
    if (typeInput) typeInput.value = 'suggestion';
    if (label) label.textContent = "What's your suggestion?";
    if (desc) desc.placeholder = 'Describe your idea...';
  }
};

window.submitSupportForm = function() {
  var descEl = document.getElementById('supportDesc');
  var errEl = document.getElementById('supportError');
  var btn = document.getElementById('supportSubmitBtn');
  if (!descEl || !errEl || !btn) return;

  var description = descEl.value.trim();
  if (!description) {
    errEl.textContent = 'Please describe the issue.';
    errEl.classList.add('show');
    errEl.style.display = 'block';
    return;
  }

  errEl.classList.remove('show');
  errEl.style.display = 'none';
  btn.disabled = true;
  btn.style.opacity = '0.6';
  btn.textContent = 'Submitting...';

  var user = getCurrentUser();
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';

  var typeEl = document.getElementById('supportType');
  var ticketData = {
    username: user ? (user.displayName || user.email.split('@')[0]) : 'unknown',
    type: typeEl ? typeEl.value : 'issue',
    description: description,
    page: currentPage
  };

  submitSupportTicket(ticketData).then(function() {
    // Show success state
    var modalContent = document.querySelector('#supportModal .modal');
    if (modalContent) {
      modalContent.innerHTML =
        '<div class="support-success">' +
          '<div class="success-icon">\u2705</div>' +
          '<div class="success-text">Submitted!</div>' +
          '<div class="success-sub">Thanks for your feedback.</div>' +
        '</div>';
    }
    // Auto-close after 1.5s
    setTimeout(function() {
      closeSupportModal();
    }, 1500);
  }).catch(function(err) {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.textContent = 'Submit';
    errEl.textContent = err.message || 'Could not submit. Try again.';
    errEl.classList.add('show');
    errEl.style.display = 'block';
  });
};

window.closeSupportModal = function() {
  var modal = document.getElementById('supportModal');
  if (modal) modal.remove();
};

// ==================== NUKE WARNING MODAL ====================
window.openNukeModal = function() {
  var old = document.getElementById('nukeModal');
  if (old) old.remove();

  var modal = document.createElement('div');
  modal.className = 'modal-overlay show';
  modal.id = 'nukeModal';
  modal.innerHTML =
    '<div class="modal">' +
      '<h3>\uD83D\uDCA3 Force Update</h3>' +
      '<p style="color:var(--text-dim);font-size:14px;margin:12px 0 16px;">This will:</p>' +
      '<ul style="color:var(--text);font-size:14px;margin:0 0 20px;padding-left:20px;line-height:1.8;">' +
        '<li>Update the app to the newest version</li>' +
        '<li>Clear the website cache for this app only</li>' +
        '<li>Bring you back to the login page</li>' +
      '</ul>' +
      '<div class="modal-actions">' +
        '<button class="btn-secondary" onclick="closeNukeModal()">Cancel</button>' +
        '<button class="btn-gold" style="background:var(--red);border-color:var(--red);" onclick="proceedNuke()">Proceed</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
};

window.closeNukeModal = function() {
  var modal = document.getElementById('nukeModal');
  if (modal) modal.remove();
};

window.proceedNuke = function() {
  window.location.href = 'force-update.html?_=' + Date.now();
};

// ==================== LIVE VERSION CHECK ====================
// Compares local APP_VERSION against Firebase to detect outdated code
(function() {
  // Skip on login and cache pages
  var page = window.location.pathname;
  if (page.indexOf('login') !== -1 || page.indexOf('clear-cache') !== -1 || page.indexOf('force-update') !== -1) return;

  // Wait for Firebase to load, then check version
  if (typeof _firebaseLoadPromise !== 'undefined') {
    _firebaseLoadPromise.then(function() {
      if (!_firebaseReady || !_firebaseDB) return;

      // Write our version so the latest deployer always sets the truth
      _firebaseDB.ref('appVersion').set(parseInt(APP_VERSION) || 0);

      // Read the latest version
      _firebaseDB.ref('appVersion').once('value').then(function(snap) {
        var latest = snap.val();
        if (!latest) return;
        var local = parseInt(APP_VERSION) || 0;
        if (local < latest) {
          showUpdateBanner();
        }
      });
    });
  }

  function showUpdateBanner() {
    // Don't show twice
    if (document.getElementById('updateBanner')) return;

    var banner = document.createElement('div');
    banner.id = 'updateBanner';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#b8860b;color:#fff;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;font-size:13px;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.3);';

    var text = document.createElement('span');
    text.textContent = 'Update available — tap to update';

    var btn = document.createElement('button');
    btn.textContent = 'Update';
    btn.style.cssText = 'background:#fff;color:#b8860b;border:none;border-radius:6px;padding:6px 14px;font-size:12px;font-weight:700;cursor:pointer;margin-left:12px;';
    btn.onclick = function() {
      window.location.href = 'force-update.html?_=' + Date.now();
    };

    banner.appendChild(text);
    banner.appendChild(btn);

    // Push page content down
    document.body.style.paddingTop = '44px';
    document.body.insertBefore(banner, document.body.firstChild);
  }
})();
