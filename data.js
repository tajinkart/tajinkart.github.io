/**
 * TAJINKART Master Spec v2.1 Data Store
 * مدیر استودیو و طراح دنیا: سید سروش تاج
 */

window.KEYS = {
  ORDERS: 'tajinkart_orders_fa_v2',
  SETTINGS: 'tajinkart_settings_fa_v2',
  ARTWORKS: 'tajinkart_artworks_fa_v2',
  PIPELINES: 'tajinkart_pipelines_fa_v2',
  PRODUCTS: 'tajinkart_products_fa_v2',
  MEMBERS: 'tajinkart_members_fa_v2'
};
var KEYS = window.KEYS;

window.currentView = 'showcase';
var currentView = window.currentView;

window.currentMember = null;
var currentMember = window.currentMember;

window.comicCurrentPage = 1;
var comicCurrentPage = window.comicCurrentPage;

window.activeModalItem = {};
var activeModalItem = window.activeModalItem;

window.currencyMode = 'USD';
var currencyMode = window.currencyMode;

window.activeCaseStudyArt = null;
var activeCaseStudyArt = window.activeCaseStudyArt;

window.activeCaseStudyPhaseIdx = 0;
var activeCaseStudyPhaseIdx = window.activeCaseStudyPhaseIdx;

window.currentSelectedPipeKey = 'sketch1';
var currentSelectedPipeKey = window.currentSelectedPipeKey;

window.currentSelectedStageIdx = 0;
var currentSelectedStageIdx = window.currentSelectedStageIdx;

window.currentSelectedArtIdx = 0;
var currentSelectedArtIdx = window.currentSelectedArtIdx;

window.currentSelectedProductIdx = 0;
var currentSelectedProductIdx = window.currentSelectedProductIdx;

window.selectedMemberIdx = 0;
var selectedMemberIdx = window.selectedMemberIdx;

window.currentMemberTierFilter = 'all';
var currentMemberTierFilter = window.currentMemberTierFilter;

// پیش‌فرض‌های امن و دائمی ناوبری داک راست
window.DEFAULT_NAV_ITEMS = [
  { id: 'members', label: 'پورتال اعضا', sub: 'ورود / عضویت', color: 'var(--cyan-electric)', theme: 'cyan-theme', visible: true, action: 'handleMembersIconClick()' },
  { id: 'store', label: 'فروشگاه و آتلیه', sub: 'ثبت سفارش کانسپت', color: 'var(--gold)', theme: 'gold-theme', visible: true, action: "switchView('store')" },
  { id: 'genesis', label: 'جهان جنسیس', sub: 'کمیک و داستان', color: 'var(--crimson)', theme: 'crimson-theme', visible: true, action: "switchView('genesis')" },
  { id: 'academy', label: 'آکادمی طراحی', sub: 'دوره‌های تخصصی', color: 'var(--violet)', theme: 'purple-theme', visible: true, action: "switchView('academy')" },
  { id: 'society', label: 'جامعه هنری', sub: 'شبکه‌های رسمی', color: 'var(--emerald)', theme: 'emerald-theme', visible: true, action: "switchView('society')" }
];

var storedSettings = {};
try {
  storedSettings = JSON.parse(localStorage.getItem(KEYS.SETTINGS)) || {};
} catch(e) {}

window.siteSettings = Object.assign({
  usdRate: 72000,
  tgToken: '',
  tgChat: '',
  adminPass: 'tajinkart',
  commissionCapacity: '۲ از ۳ ظرفیت آتلیه رزرو شده',
  sectionVisibility: {
    showcase: true,
    store: true,
    genesis: true,
    academy: true,
    society: true
  },
  navItems: window.DEFAULT_NAV_ITEMS
}, storedSettings);

// اطمینان از اینکه حتی با تنظیمات ذخیره شده قبلی، navItems و sectionVisibility خالی نمانند
if (!window.siteSettings.navItems || !window.siteSettings.navItems.length) {
  window.siteSettings.navItems = window.DEFAULT_NAV_ITEMS;
}
if (!window.siteSettings.sectionVisibility) {
  window.siteSettings.sectionVisibility = { showcase: true, store: true, genesis: true, academy: true, society: true };
}
var siteSettings = window.siteSettings;

// گالری آثار همراه با لایت‌باکس مطالعه موردی چندمرحله‌ای (Case-Study) و دیپ‌لینک به آتلیه
var showcaseArtworks = window.showcaseArtworks = JSON.parse(localStorage.getItem(KEYS.ARTWORKS)) || [
  {
    id: 1,
    tag: 'environment',
    shortSlug: 'محراب آبسیدین',
    title: 'محراب آبسیدین — محراب سرخ کهن',
    desc: 'محراب باستانی کنده شده در دل صخره‌های آتشفشانی کاتالیزور که امواج اتر را به قلب ژیروسکوپ‌های زیرزمینی هدایت می‌کند.',
    pipelineKey: 'sketch2',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    colorSpace: 'مستر 4K / ۱۶ بیتی ProPhoto RGB',
    lore: 'جهان اکستوپیا • منطقه تفتیده پیرامون کلونی کلسینا',
    phases: [
      { name: 'اتود اولیه و سیلوئت', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80' },
      { name: 'پرسپکتیو و لاین‌آرت', img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80' },
      { name: 'مطالعه نور و تیرگی/روشنی', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' },
      { name: 'رندر متریال و مات‌پینتینگ نهایی', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80' }
    ]
  },
  {
    id: 2,
    tag: 'character',
    shortSlug: 'شوالیه سرخ',
    title: 'سرگردان سرخ — محافظ سوگند خون',
    desc: 'پیش‌قراول پوشیده در زره کامپوزیتی تیتانیوم مقاوم در برابر باران‌های اسیدی سنگین با ماسک منقاری فیلتردار.',
    pipelineKey: 'sketch1',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
    colorSpace: 'مستر 4K / ۱۶ بیتی ProPhoto RGB',
    lore: 'اسکواد پروازی کلاغ‌ها (Rook Unit) • کلونی رووکری',
    phases: [
      { name: 'اکتشاف سیلوئت و فرم', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80' },
      { name: 'شیت ترن‌اراند سه‌نما', img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80' },
      { name: 'تکسچرینگ زره و پولادین', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80' },
      { name: 'رندر سینمایی و ریم‌لایت', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80' }
    ]
  },
  {
    id: 3,
    tag: 'creature',
    shortSlug: 'کایمرای مغاک',
    title: 'کایمرای اعماق — درنده بیومکانیکال',
    desc: 'ارگانیسم درنده مهندسی‌شده برای اکوسیستم‌های سمی اسیدی با صفحات محافظ کیتینی و دیاگرام تشریحی آرواره‌های دوگانه.',
    pipelineKey: 'sketch_creature',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
    colorSpace: 'مستر 4K / ۱۶ بیتی ProPhoto RGB',
    lore: 'جهان اکستوپیا • فیزیولوژی جهش اسیدی',
    phases: [
      { name: 'آناتومی اسکلتی و فیزیولوژی', img: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80' },
      { name: 'طرح زوائد و ساختار آرواره', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
      { name: 'مقیاس در برابر انسان', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' },
      { name: 'رندر نهایی زیستگاه غبارآلود', img: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80' }
    ]
  },
  {
    id: 4,
    tag: 'keyframe',
    shortSlug: 'مونولیت سپید',
    title: 'مونولیت سپید — نسخه ویرایش کاور',
    desc: 'کاور مینیمال برای کتاب وقایع‌نگاری دارک فانتزی با تاکید بر فضای منفی، کانون‌های نوری و هماهنگی با تایپوگرافی.',
    pipelineKey: 'sketch3',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    colorSpace: 'Master Print Ready 4K / 300DPI',
    lore: 'جهان جنسیس • وقایع‌نگاری سقوط ارگ سپید',
    phases: [
      { name: 'تامب‌نیل‌های ترکیب‌بندی', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80' },
      { name: 'تعیین زاویه لنز و کالرکی', img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80' },
      { name: 'تنظیم حاشیه عطف کتاب', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80' },
      { name: 'رندر مستر چاپی', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80' }
    ]
  },
  {
    id: 5,
    tag: 'environment',
    shortSlug: 'ارگ یخی',
    title: 'ارگ کریستالی — دژ شمالی',
    desc: 'دژ کوهستانی مستقر بر فراز قله‌های یخی در جریان پدیده انجماد اسیدی و خورشیدگرفتگی بزرگ تمدن کهن.',
    pipelineKey: 'sketch2',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    colorSpace: 'مستر 4K / ۱۶ بیتی ProPhoto RGB',
    lore: 'جهان جنسیس • باروی قلیایی شمال',
    phases: [
      { name: 'اسکچ و زاویه دوربین', img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80' },
      { name: 'طراحی سازه‌های مدولار', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' },
      { name: 'نورپردازی حجمی و مه', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80' },
      { name: 'چشم‌انداز نهایی مات‌پینتینگ', img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80' }
    ]
  },
  {
    id: 6,
    tag: 'keyframe',
    shortSlug: 'طلایه‌دار سقوط',
    title: 'طلایه‌دار سقوط — کی‌فریم سینمایی',
    desc: 'صحنه دراماتیک روایت آخرین ایستادگی در دروازه آبسیدین با هدایت نگاه مخاطب و پرسپکتیو داینامیک نبرد.',
    pipelineKey: 'sketch3',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
    colorSpace: 'Standard Digital 4K / Cinematic Wide',
    lore: 'جهان اکستوپیا • عملیات فرود بر فونداسیون',
    phases: [
      { name: 'دکوپاژ صحنه و ریتم نما', img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80' },
      { name: 'لاین‌آرت کاراکترها و زاویه', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80' },
      { name: 'تعادل تیرگی و افکت نوری', img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80' },
      { name: 'رندر اکشن نهایی', img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80' }
    ]
  },
  {
    id: 7,
    tag: 'props',
    shortSlug: 'سلاح‌های اتر',
    title: 'سلاح‌های باستانی اتر — کیت پراپ و UI',
    desc: 'مطالعه طراحی مدولار تجهیزات جنگی، کاتالیزورهای جادویی و فریم‌های اینترفیس با حکاکی خطوط رونیک.',
    pipelineKey: 'sketch4',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    colorSpace: 'مستر 4K / Alpha Cutouts PNG',
    lore: 'تکنولوژی اتر • اسست‌های بازی کایلو',
    phases: [
      { name: 'اکتشاف فرم و سیلوئت سلاح', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
      { name: 'خطوط فنی و متریال‌شناسی', img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80' },
      { name: 'افکت‌های نوری و درخشش VFX', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
      { name: 'شیت ارتوگرافیک ابعاد ۳D', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' }
    ]
  },
  {
    id: 8,
    tag: 'comic',
    shortSlug: 'هنر متوالی جنسیس',
    title: 'چپتر پیش‌درآمد: مبدأ بازمانده',
    desc: 'صفحات روایی تمام‌رنگی وب‌تون و مانگا شامل خطوط دینامیک جوهرزنی، ریتم پنل‌ها و لایه‌های تفکیک‌شده موشن.',
    pipelineKey: 'sketch5',
    image: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=1200&q=80',
    colorSpace: 'Master Webtoon & Print 300DPI',
    lore: 'جهان جنسیس • خط داستانی کایلو رزالین',
    phases: [
      { name: 'تامب‌نیل دکوپاژ و دیالوگ‌ها', img: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=1200&q=80' },
      { name: 'جوهرزنی قلمی و خطوط سرعت', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80' },
      { name: 'هافتون‌ها و ترام اصیل مانگا', img: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=1200&q=80' },
      { name: 'رنگ‌آمیزی کامل و نور سینمایی', img: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=1200&q=80' }
    ]
  }
];

// ۶ پایپلاین تخصصی آتلیه طبق سند مستر با زیرشاخه‌ها و مراحل شفاف
var PIPELINE_DATA = window.PIPELINE_DATA = JSON.parse(localStorage.getItem(KEYS.PIPELINES)) || {
  sketch1: {
    id: 'sketch1',
    topSub: 'طراحی کاراکتر و شخصیت',
    badgeSlug: '۰۱ • کاراکتر دیزاین',
    subcategories: ['هیرو/کاراکتر اصلی (جزئیات بالا)', 'NPC و کلاس‌های بازی (ماژولار)', 'طراحی اسکین و زره'],
    note: 'پایپلاین استاندارد شامل ورودی مشخصات فیزیکی، ضریب پیچیدگی دیزاین، کادربندی (پرتره/تمام‌قد/سه‌نما)، اتودهای اولیه و رندر مستر نهایی.',
    tiles: [
      { span: 'col-span-4', badge: 'فاز ۱ • اتود اولیه', title: 'اکتشاف فرم، سیلوئت و لور کاراکتر', desc: 'تولید حداقل ۲ اتود مفهومی اولیه، بررسی تناسبات، لباس و پیش‌زمینه داستانی.', price: '0 - 0', usdVal: 70, timeline: '۳ تا ۴ روز کاری', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80' },
      { span: 'col-span-4', badge: 'فاز ۲ • لاین‌آرت و شیت', title: 'مدل‌شیت ارتوگرافیک و حالات چهره', desc: 'زوایای سه‌بعدی ارتوگرافیک (روبرو، نیم‌رخ، پشت) همراه با اکسپرشن‌های پویا چهره.', price: '20 - 50', usdVal: 135, timeline: '۵ تا ۷ روز کاری', img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=900&q=80' },
      { span: 'col-span-4', badge: 'فاز ۳ • رندر مستر نهایی', title: 'رندر تمام‌قد سینمایی + فایل PSD', desc: 'جداسازی متریال‌ها، نورپردازی مقداری، پوز اکشن داینامیک و تحویل سورس لایه‌باز رزولوشن اصلی.', price: '80 - 60', usdVal: 220, timeline: '۷ تا ۱۰ روز کاری', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1100&q=80' }
    ]
  },
  sketch_creature: {
    id: 'sketch_creature',
    topSub: 'طراحی موجودات و هیولاها',
    badgeSlug: '۰۲ • کانسپت موجودات',
    subcategories: ['باس‌فایت و تیتان‌ها (پیچیدگی شدید)', 'موجودات سواری و همراه (Mounts/Pets)', 'دشمنان عادی (Mobs)'],
    note: 'زیست‌شناسی تخیلی، تیپولوژی استخوان‌بندی، دیاگرام تشریحی آرواره‌ها، متریال پوست و فیگور مقایسه ابعاد انسانی رایگان.',
    tiles: [
      { span: 'col-span-4', badge: 'فاز ۱ • آناتومی و فرم', title: 'اتودهای فیزیولوژی و تیپولوژی استخوان‌بندی', desc: 'بررسی چهارپا/درنده، بال‌دار/اژدهاسان یا بندپا همراه با سیلوئت مقیاس انسانی رایگان.', price: '5 - 5', usdVal: 85, timeline: '۳ تا ۵ روز کاری', img: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80' },
      { span: 'col-span-4', badge: 'فاز ۲ • دیاگرام ارتوگرافیک', title: 'دیاگرام آرواره، چشم‌ها و زوائد بیولوژیک', desc: 'نقشه مکانیک باز و بسته شدن فک، فلس‌ها، کیسه‌های اسیدی و ساختار پوست برای تیم سه‌بعدی.', price: '40 - 80', usdVal: 160, timeline: '۵ تا ۸ روز کاری', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' },
      { span: 'col-span-4', badge: 'فاز ۳ • رندر مستر متریال', title: 'رندر متریال پوست هیولا در زیستگاه', desc: 'نورپردازی دراماتیک با افکت‌های خیسی، بافت کیتین/فلس و پس‌زمینه محیطی لانه.', price: '00 - 20', usdVal: 260, timeline: '۸ تا ۱۲ روز کاری', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1100&q=80' }
    ]
  },
  sketch2: {
    id: 'sketch2',
    topSub: 'طراحی فضا و معماری دنیا',
    badgeSlug: '۰۳ • طراحی دنیا',
    subcategories: ['نمای باز و اتمسفریک (Establishing Shot)', 'معماری و اسست‌های ماژولار', 'کانسپت لول‌دیزاین و دیاگرام'],
    note: 'معماری دارک‌فانتزی، شات اصلی محیط با نسبت عریض ۱۶:۹ یا ۲۱:۹، حداقل ۳ تامب‌نیل ارزشی اولیه و تفکیک لایه‌های پارالاکس.',
    tiles: [
      { span: 'col-span-4', badge: 'فاز ۱ • تامب‌نیل ترکیب‌بندی', title: '۳ تامب‌نیل ارزشی سیاه و سفید', desc: 'انتخاب کادر دوربین، نقاط کانونی، خط افق و هدایت نگاه بیننده با فیگور مقیاس رایگان.', price: '5 - 00', usdVal: 90, timeline: '۴ تا ۶ روز کاری', img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80' },
      { span: 'col-span-4', badge: 'فاز ۲ • کانسپت ارتوگرافیک', title: 'طراحی سازه‌های مدولار و پرسپکتیو', desc: 'ستون‌های باستانی، ابلیسک‌ها و المان‌های قابل استفاده در ساخت جهان بازی برای مدل‌سازان.', price: '10 - 40', usdVal: 125, timeline: '۴ تا ۶ روز کاری', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
      { span: 'col-span-4', badge: 'فاز ۳ • رندر مستر مات‌پینتینگ', title: 'رندر سینمایی با نورپردازی حجمی و مه', desc: 'نقاشی کامل محیطی با پراکندگی پرتوهای نور، مه سنگین و واریاسیون شب/روز/سمی.', price: '95 - 20', usdVal: 250, timeline: '۷ تا ۱۲ روز کاری', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1100&q=80' }
    ]
  },
  sketch3: {
    id: 'sketch3',
    topSub: 'کاور، پوستر و کی‌فریم سینمایی',
    badgeSlug: '۰۴ • کاور و کی‌فریم',
    subcategories: ['اسپلش آرت بازی (تمرکز روی کاراکتر)', 'کی‌فریم سینمایی و اکشن (تمرکز روی روایت)', 'کاور تجاری و کتاب (همراه با فضای تایپوگرافی)'],
    note: 'تصاویر محوری با رزولوشن پولیش مستر چاپ (300DPI)، مدیریت تراکم کاراکترها (تک‌کاراکتر/دوئل/گروهی) و تفکیک لایه‌های انیمیشن.',
    tiles: [
      { span: 'col-span-4', badge: 'فاز ۱ • کالرکی و کمپوزیشن', title: '۲ اتود ترکیب‌بندی نوری کوچک', desc: 'انتخاب زاویه لنز، پالت رنگی پایه، در نظر گرفتن فضای تیغ و عطف جلد کتاب.', price: '50 - 90', usdVal: 170, timeline: '۵ تا ۷ روز کاری', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80' },
      { span: 'col-span-4', badge: 'فاز ۲ • پرداخت کاراکتر و صحنه', title: 'پوستر داستانی با هماهنگی تایپوگرافی', desc: 'سلسله‌مراتب بصری پرکشش، کانون‌های نوری و جداسازی لایه‌های کاراکتر و پس‌زمینه.', price: '75 - 20', usdVal: 195, timeline: '۶ تا ۸ روز کاری', img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80' },
      { span: 'col-span-4', badge: 'فاز ۳ • اسپلش مستر چاپ', title: 'رندر نهایی 4K/300DPI بدون سربار 8K', desc: 'خروجی آماده چاپ تجاری با تفکیک لایه‌های موشن‌گرافیک و واریاسیون نوری و مود صحنه.', price: '30 - 50', usdVal: 290, timeline: '۸ تا ۱۴ روز کاری', img: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=800&q=80' }
    ]
  },
  sketch4: {
    id: 'sketch4',
    topSub: 'تجهیزات، پراپ، آبجکت و UI',
    badgeSlug: '۰۵ • پراپ و UI',
    subcategories: ['سلاح‌های افسانه‌ای (Hero Props)', 'ست آیتم‌های خرد و لوت (Consumables)', 'فریم‌ها و آیکون‌های مهارت (UI/HUD)'],
    note: 'تعیین آزادانه تعداد و سری بر اساس نیاز پروژه همراه با تخفیف پله‌ای، اتودهای اولیه فرم و خروجی ترنسپرنت آماده بازی (PNG Alpha Cutouts).',
    tiles: [
      { span: 'col-span-4', badge: 'فاز ۱ • کشف فرم و سیلوئت', title: 'اتودهای خطی و ساختار آبجکت', desc: 'حداقل ۲ اتود اولیه خطی/سیلوئت برای هر آیتم، سلاح‌های جادویی، زره و پوشیدنی.', price: '0 - 20', usdVal: 100, timeline: '۳ تا ۵ روز کاری', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' },
      { span: 'col-span-4', badge: 'فاز ۲ • طراحی شیت ارتوگرافیک', title: 'شیت ابعاد ۳D و تشریح متریال', desc: 'تشریح بافت مواد، فازهای ارتقاء سطح تجهیزات و فریم‌های اینونتوری و نوارهای مانا.', price: '5 - 10', usdVal: 90, timeline: '۳ تا ۵ روز کاری', img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80' },
      { span: 'col-span-4', badge: 'فاز ۳ • رندر مستر متریال', title: 'رندر واقع‌گرایانه متریال + افکت VFX', desc: 'برق فلز زنگ‌زده، معجون‌های درخشان، رندر کامل با خروجی برش ترنسپرنت PNG آماده بازی.', price: '0 - 30', usdVal: 110, timeline: '۴ تا ۶ روز کاری', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80' }
    ]
  },
  sketch5: {
    id: 'sketch5',
    topSub: 'کمیک، مانگا و هنر متوالی',
    badgeSlug: '۰۶ • هنر روایت متوالی',
    subcategories: ['صفحه استاندارد کمیک/مانگا', 'فرمت وب‌تون (اسکرول عمودی)', 'استوری‌بورد خام (جهت کارگردانی سینماتیک)'],
    note: 'تعیین تعداد صفحات/پنل‌ها، اتود دکوپاژ و جایگذاری حباب‌های گفتگو، جوهرزنی خطی مانگا و خروجی پنل‌های تفکیک‌شده برای کمیک‌موشن.',
    tiles: [
      { span: 'col-span-4', badge: 'فاز ۱ • دکوپاژ و استوری‌بورد', title: 'اتودهای چیدمان پنل‌ها و ریتم خوانش', desc: 'حداقل ۲ مرحله اتود ساختار نماها، زاویه نگاه و تعیین دقیق جایگاه حباب‌های دیالوگ.', price: '5 - 10', usdVal: 95, timeline: '۳ تا ۵ روز کاری', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80' },
      { span: 'col-span-4', badge: 'فاز ۲ • جوهرزنی خطی اصیل', title: 'لاین‌آرت مانگا و ترام‌های هافتون', desc: 'جوهرزنی قلمی با حس فشار دست، خطوط سرعت، سایه‌های مشکی و متن‌گذاری افکت صوتی SFX.', price: '35 - 65', usdVal: 150, timeline: '۴ تا ۶ روز کاری', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
      { span: 'col-span-4', badge: 'فاز ۳ • رنگ‌آمیزی کامل سینمایی', title: 'صفحات تمام‌رنگی وب‌تون + فایل PSD', desc: 'نورپردازی ریم‌لایت، عمق رنگی سینمایی و نسخه لایه‌باز تفکیک‌شده پنل‌ها برای کمیک‌موشن.', price: '70 - 50', usdVal: 210, timeline: '۶ تا ۹ روز کاری', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1100&q=80' }
    ]
  }
};

// مخزن دارایی‌های دیجیتال مبتنی بر ۷ شاخه استاندارد سند مستر TAJINKART
var digitalStoreProducts = window.digitalStoreProducts = JSON.parse(localStorage.getItem(KEYS.PRODUCTS)) || [
  {
    id: 1,
    title: 'بسته اسپرایت و انیمیشن دوبعدی شوالیه کلاغ (Rook Knight)',
    price: 39,
    type: 'بسته‌های اسست بازی و اسپریت ۲D',
    loreKey: 'جهان اکستوپیا • آنلاک لور اسکواد کلاغ‌ها',
    img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=700&q=80',
    desc: 'اسپرایت‌شیت‌های کاراکتر همراه با انیمیشن‌های چندجهته (حرکت، حمله خنجری، شیرجه هوایی و مرگ)، بهینه‌شده برای Unity و Godot همراه با لایه‌های پس‌زمینه پارالاکس.'
  },
  {
    id: 2,
    title: 'موتور براش، بافت و آلفای زنگ‌زدگی و پوست هیولا (۶۴ عددی)',
    price: 19,
    type: 'موتور براش، تکسچر و استمپ‌های کانسپت آرت',
    loreKey: 'جهان اکستوپیا • تکنیک‌های مات‌پینتینگ استودیو',
    img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=700&q=80',
    desc: 'ست براش فتوشاپ (.ABR) و پروکریت برای رندر متریال‌های زنگ‌زدگی، چرم کهنه، فلس و پوست لجن‌گرفته هیولاها به همراه بافت‌های آلفا یکپارچه (Seamless Alphas).'
  },
  {
    id: 3,
    title: 'کیت پراپ و المان‌های HUD دارک‌فانتزی (۱۲۰ آیکون + فریم)',
    price: 34,
    type: 'کیت‌های پراپ، آیکون و اینترفیس بازی',
    loreKey: 'جهان جنسیس • نشان‌های رونیک باستانی',
    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80',
    desc: 'پکیج آیکون‌های مهارت جادویی، معجون‌ها، تجهیزات افسانه‌ای، فریم اینونتوری و نوارهای مانا و سلامت در فرمت PNG ترنسپرنت (رزولوشن 256x256 و 512x512).'
  },
  {
    id: 4,
    title: 'کمیک دیجیتال و ناول مصور جنسیس: فصل ۱ تا ۳ + مستر PSD',
    price: 24,
    type: 'کمیک دیجیتال، آرت‌بوک و سورس‌فایل‌های مستر',
    loreKey: 'جهان جنسیس • دسترسی به قلب تپنده لور کایلو',
    img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=80',
    desc: 'چپترهای کمیک با رزولوشن فوق‌العاده بالا به همراه فایل‌های تفکیک‌شده لایه‌باز PSD برای تحلیل لایه‌ها، آرت‌بوک لور و اتودهای اولیه به صورت PDF آماده چاپ.'
  },
  {
    id: 5,
    title: 'لوپ‌های ویدیویی منوی بازی و اسپلش سینمایی 4K بی‌پایان',
    price: 29,
    type: 'فوتیج‌های متحرک، لوپ‌های سینمایی و اسپلش',
    loreKey: 'جهان اکستوپیا • اتمسفر مگاسازه رووکری',
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=80',
    desc: 'ویدیوهای لوپ پیوسته بدون درز (Seamless 4K MP4 / WebM) مناسب برای منوی اصلی بازی‌ها، پس‌زمینه استیم، اوورلی استریم توییچ و تیزرهای تبلیغاتی.'
  },
  {
    id: 6,
    title: 'فایل پرینت ۳ بعدی مینیاتوری کایمرای اعماق (.STL و .OBJ)',
    price: 28,
    type: 'فایل‌های پرینت سه‌بعدی STL و مینیاتوری‌های رزینی',
    loreKey: 'جهان جنسیس • مینیاتوری رومیزی و بیس‌مش ZBrush',
    img: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=700&q=80',
    desc: 'فایل‌های بهینه‌سازی‌شده .STL و .OBJ سر و پیکره کایمرا مناسب برای پرینترهای رزینی به همراه بیس‌مش خام (Base Mesh) با توپولوژی استاندارد جهت مجسمه‌سازی ZBrush.'
  },
  {
    id: 7,
    title: 'بسته اوورلی ذرات، مه سمی و باران گوگردی (Atmospheric FX Pack)',
    price: 22,
    type: 'اوورلی‌های اتمسفریک، ذرات و افکت‌های بصری',
    loreKey: 'جهان اکستوپیا • چرخه‌های اقلیمی چهارگانه',
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=700&q=80',
    desc: 'فایل‌های PNG ترنسپرنت و ویدیوهای لوپ بلک‌اسکرین از ذرات معلق اتر، مه سنگین گوگردی، باران اسیدی و پاشش خون آماده استفاده با مد Screen یا Linear Dodge.'
  }
];

var academyCourses = window.academyCourses = [
  {
    id: 1,
    title: 'مسترکلاس: طراحی کاراکتر فانتزی و متریال زره',
    price: 59,
    duration: '۱۴ ساعت ویدیو HD + فایل‌های PSD',
    img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    desc: 'از اتودزنی سیلوئت تا مدل‌شیت سه‌نما و تکنیک‌های پیشرفته رندر فلز و چرم طبق پایپلاین استودیو.'
  },
  {
    id: 2,
    title: 'جهان‌سازی و کانسپت آرت محیط‌های سینمایی',
    price: 65,
    duration: '۱۲ ساعت ویدیو HD + براش اختصاصی',
    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    desc: 'پرسپکتیو کاربردی، نورپردازی حجمی، تعادل تیرگی و روشن و مدیریت نقاط کانونی در شات‌های عریض.'
  },
  {
    id: 3,
    title: 'نقشه راه فریلنسری کانسپت آرتیست‌ها در بازار جهانی',
    price: 49,
    duration: '۸ ساعت ویدیو + قالب قراردادها',
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    desc: 'تنظیم پورتفولیو استاندارد، ارتباط با کارفرمای خارجی، تعریف مایل‌استون‌ها و عقد قرارداد بین‌المللی.'
  }
];

var ordersList = window.ordersList = JSON.parse(localStorage.getItem(KEYS.ORDERS)) || [
  {
    id: 501,
    client: 'استودیو نوا',
    contact: '۰۹۱۲۰۰۰۰۰۰۰',
    pkg: 'مدل‌شیت ارتوگرافیک و حالات چهره',
    phase: 'فاز ۳: رندر مستر نهایی سینمایی + فایل لایه‌باز PSD',
    brief: 'کاراکتر روگ سایبرپانک با شنل تیره و قطعات بیومکانیکال زره',
    status: 'در حال تولید',
    price: '80'
  }
];

var comicPages = window.comicPages = [
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
];

var siteMembersData = window.siteMembersData = JSON.parse(localStorage.getItem(KEYS.MEMBERS)) || [
  {
    id: 101,
    name: 'سید سروش تاج',
    email: 'soroush@tajinkart.com',
    contact: '09120000000',
    tier: 'VIP',
    balance: ',450',
    withdrawn: ',200',
    assetsBought: [
      'کمیک دیجیتال و ناول مصور جنسیس: فصل ۱ تا ۳ + مستر PSD',
      'موتور براش، بافت و آلفای زنگ‌زدگی (۶۴ عددی)',
      'بسته اسپرایت و انیمیشن دوبعدی شوالیه کلاغ'
    ],
    totalSpent: '20'
  },
  {
    id: 102,
    name: 'استودیو پایا گیمز',
    email: 'director@payagames.ir',
    contact: '09350000000',
    tier: 'PRO',
    balance: '50',
    withdrawn: '50',
    assetsBought: [
      'بسته اسپرایت و انیمیشن دوبعدی شوالیه کلاغ',
      'لوپ‌های ویدیویی منوی بازی و اسپلش سینمایی 4K'
    ],
    totalSpent: '90'
  },
  {
    id: 103,
    name: 'آریا کیان',
    email: 'aria@gmail.com',
    contact: '09190000000',
    tier: 'STANDARD',
    balance: '/usr/bin/bash',
    withdrawn: '/usr/bin/bash',
    assetsBought: ['موتور براش، بافت و آلفای زنگ‌زدگی و پوست هیولا'],
    totalSpent: '9'
  }
];
