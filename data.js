/**
 * TAJINKART Master Spec v2.1 Data Store
 * مدیر استودیو و طراح دنیا: سید سروش تاج
 */

// حافظه پشتیبان موقت در صورت مسدود بودن یا پرایوت بودن حافظه مرورگر
window._tajinMemoryStorage = window._tajinMemoryStorage || {};

function safeGetStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (e) {
    return (window._tajinMemoryStorage && window._tajinMemoryStorage[key]) || null;
  }
}

function safeSetStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (!window._tajinMemoryStorage) window._tajinMemoryStorage = {};
    window._tajinMemoryStorage[key] = String(value);
    return false;
  }
}
window.safeGetStorage = safeGetStorage;
window.safeSetStorage = safeSetStorage;


const KEYS = {
  ORDERS: 'tajinkart_orders_fa_v2',
  SETTINGS: 'tajinkart_settings_fa_v2',
  ARTWORKS: 'tajinkart_artworks_fa_v2',
  PIPELINES: 'tajinkart_pipelines_fa_v2',
  PRODUCTS: 'tajinkart_products_fa_v2',
  MEMBERS: 'tajinkart_members_fa_v2',
  DELETED_ARTWORKS: 'tajinkart_deleted_artworks_v2'
};

var currentView = 'showcase';
var currentMember = null;
var comicCurrentPage = 1;
var activeModalItem = {};
var currencyMode = 'USD'; // 'USD' or 'TOMAN'
var activeCaseStudyArt = null;
var activeCaseStudyPhaseIdx = 0;

var currentSelectedPipeKey = 'sketch1';
var currentSelectedStageIdx = 0;
var currentSelectedArtIdx = 0;
var currentSelectedProductIdx = 0;
var selectedMemberIdx = 0;
var currentMemberTierFilter = 'all';

var siteSettings = {
  usdRate: 72000,
  tgToken: '',
  tgChat: '',
  adminPass: 'tajinkart',
  commissionCapacity: '۲ از ۳ ظرفیت آتلیه رزرو شده'
};
try {
  const _s = safeGetStorage(KEYS.SETTINGS);
  if (_s) {
    const _p = JSON.parse(_s);
    if (_p && typeof _p === 'object') {
      siteSettings = Object.assign(siteSettings, _p);
    }
  }
} catch(e) {}
window.siteSettings = siteSettings;

// گالری آثار همراه با لایت‌باکس مطالعه موردی چندمرحله‌ای (Case-Study) و دیپ‌لینک به آتلیه
// بارگذاری آثار ثبت‌شده هنرمند (فیلتر و پاکسازی کامل آثار ماک‌آپ آزمایشی قدیمی ۱ تا ۸)
// کانسپت‌های پیش‌فرض و غنی استودیو (Fallback جهت تضمین عدم خالی شدن گالری)
const DEFAULT_STUDIO_ARTWORKS = [];

var storedArtworks = [];
try {
  const rawArt = localStorage.getItem(KEYS.ARTWORKS);
  storedArtworks = rawArt ? JSON.parse(rawArt) : [];
  if (!Array.isArray(storedArtworks)) storedArtworks = [];
} catch(e) {
  storedArtworks = [];
}
var showcaseArtworks = storedArtworks.filter(a => a && typeof a === 'object' && Number(a.id) > 8);
if (showcaseArtworks.length === 0) {
  showcaseArtworks = JSON.parse(JSON.stringify(DEFAULT_STUDIO_ARTWORKS));
}
window.showcaseArtworks = showcaseArtworks;

// ۶ پایپلاین تخصصی آتلیه طبق سند مستر با زیرشاخه‌ها و مراحل شفاف
var PIPELINE_DATA = {
  sketch1: {
    id: 'sketch1',
    topSub: 'طراحی کاراکتر و قهرمانان',
    badgeSlug: '۰۱ • کاراکتر دیزاین',
    subcategories: ['هیرو / کاراکتر اصلی (Full IP Concept)', 'مدل‌شیت سه‌نما ارتوگرافیک برای ۳D', 'خط زمانی سن و سال (Age Timeline)', 'پکیج گروهی / فکشن (Party Bundle)', 'بازطراحی کاراکتر قدیمی (Redesign)'],
    note: 'پایپلاین استاندارد کاراکتر با استاندارد چاپ تجاری ۳۰۰DPI و ابعاد ۲K-۳K همراه با لایه‌باز PSD، سیلوئت‌های ۵ تایی، مدل‌شیت ۳۶۰ درجه و افزونه‌های سلاح و چهره.',
    tiles: [
      {
        span: 'col-span-4',
        badge: 'پکیج ۱ • خلق از صفر',
        title: 'خلق کانسپت کاراکتر از صفر (Full IP Creation)',
        desc: '۱۰ اتود سیلوئت مفهومی اولیه ➔ ارائه ۵ اتود برتر ➔ انتخاب فرم و طراحی کاستوم ➔ رندر نهایی با کیفیت ۳۰۰DPI و فایل لایه‌باز PSD.',
        price: '90 - 150',
        usdVal: 95,
        timeline: '۴ تا ۶ روز کاری',
        img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'پکیج ۲ • مدل‌شیت سه‌نما ۳D',
        title: 'مدل‌شیت سه‌نما ارتوگرافیک برای ساخت سه‌بعدی و انیمیشن',
        desc: '۳ نمای ارتوگرافیک دقیق (روبرو، نیم‌رخ، پشت) همراه با تشریح ساختار متریال‌ها، کالبدشکافی لباس و نقاط اتصال مفاصل برای مدلسازان ۳D.',
        price: '110 - 180',
        usdVal: 120,
        timeline: '۵ تا ۷ روز کاری',
        img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=900&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'پکیج ۳ • بازطراحی و ارتقا',
        title: 'بازطراحی و ارتقای کاراکتر قدیمی (Redesign & Evolution)',
        desc: 'مدرن‌سازی، ارتقای فیدلیتی و بازآفرینی نسخه دارک/خشن کاراکترهای نسل گذشته به استانداردهای بازی‌ها و پروداکشن نسل جدید.',
        price: '80 - 130',
        usdVal: 85,
        timeline: '۳ تا ۵ روز کاری',
        img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1100&q=80'
      }
    ]
  },
  sketch_creature: {
    id: 'sketch_creature',
    topSub: 'موجودات، تایتان‌ها و هیولاها',
    badgeSlug: '۰۲ • کانسپت موجودات',
    subcategories: ['باس‌فایت و تایتان‌های غول‌پیکر', 'موجودات و درندگان زیست‌بوم', 'همراهان و مانت‌های سواری (Mounts)'],
    note: 'زیست‌شناسی تخیلی، آناتومی مفاصل و استخوان‌بندی، دیاگرام مکانیک حرکتی بال‌ها و پنجه‌ها، بافت کیتین و فلس همراه با فیگور مقیاس انسانی رایگان.',
    tiles: [
      {
        span: 'col-span-4',
        badge: 'پکیج ۱ • کانسپت بیولوژی',
        title: 'خلق کانسپت هیولا و موجود از صفر (Creature Biology & Form)',
        desc: 'اتودهای اولیه فیزیولوژی استخوان‌بندی و عضلات درندگان با مقیاس انسانی رایگان، پرداخت بافت پوست/کیتین و رندر زیست‌بوم.',
        price: '95 - 160',
        usdVal: 100,
        timeline: '۴ تا ۶ روز کاری',
        img: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'پکیج ۲ • مکانیک حرکتی ریگ',
        title: 'شیت مکانیک حرکتی و کالبدشکافی مفاصل (Locomotion & Rigging Sheet)',
        desc: 'دیاگرام فنی نحوه باز شدن بال‌ها، مفاصل پنجه‌ها، دُم و ساختار حرکتی برای تیم‌های ریگ سه‌بعدی و انیماتورهای بازی.',
        price: '110 - 170',
        usdVal: 125,
        timeline: '۵ تا ۷ روز کاری',
        img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'پکیج ۳ • ساب‌گونه‌ها',
        title: 'طراحی ساب‌گونه‌ها و واریانت‌های جهش‌یافته (Sub-Species Variants)',
        desc: 'توسعه ۳ واریانت منطقه‌ای از یک هیولای پایه (مانند گونه سمی، گونه برفی، گونه آلفا/لیدر) با تم رنگی و بافت اختصاصی.',
        price: '85 - 140',
        usdVal: 90,
        timeline: '۴ تا ۶ روز کاری',
        img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1100&q=80'
      }
    ]
  },
  sketch2: {
    id: 'sketch2',
    topSub: 'طراحی فضا، معماری و دنیاسازی',
    badgeSlug: '۰۳ • طراحی دنیا',
    subcategories: ['نمای باز سینمایی (Establishing Shot)', 'کیت معماری مدولار برای لول‌دیزاین', 'فضاهای داخلی و کانسپت دانجن'],
    note: 'معماری دارک‌فانتزی، شات عریض اتمسفریک، انتخاب کادر با ۳ تامب‌نیل ارزشی اولیه و تفکیک لایه‌های عمق، نور و مه.',
    tiles: [
      {
        span: 'col-span-4',
        badge: 'پکیج ۱ • نمای باز سینمایی',
        title: 'نمای باز و اتمسفریک دنیا (Establishing Cinematic Shot)',
        desc: '۳ تامب‌نیل ترکیب‌بندی ارزشی ➔ انتخاب کادر عریض ۱۶:۹ یا ۲۱:۹ ➔ رندر نهایی چشم‌انداز اقلیم با لایه‌های تفکیک‌شده عمق و مه.',
        price: '95 - 170',
        usdVal: 105,
        timeline: '۴ تا ۶ روز کاری',
        img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'پکیج ۲ • کیت مدولار سازه‌ها',
        title: 'کانسپت ارتوگرافیک سازه‌های مدولار (Modular Architecture Kit)',
        desc: 'طراحی هندسی بناهای باستانی، ابلیسک‌ها، ستون‌ها و المان‌های قابل استفاده مستقیم لول‌دیزاینرها در موتور بازی.',
        price: '110 - 180',
        usdVal: 120,
        timeline: '۵ تا ۷ روز کاری',
        img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'پکیج ۳ • رندر سینمایی فضا',
        title: 'رندر سینمایی فضا با اتمسفر و نورپردازی کامل (Atmospheric Environment)',
        desc: 'نقاشی محیطی کامل با شکست پرتوهای نوری، ذرات معلق، مه سنگین و واریاسیون شب/روز با لایه‌باز PSD کیفیت ۳۰۰DPI.',
        price: '120 - 210',
        usdVal: 135,
        timeline: '۶ تا ۸ روز کاری',
        img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1100&q=80'
      }
    ]
  },
  sketch3: {
    id: 'sketch3',
    topSub: 'کاور، پوستر و کی‌فریم سینمایی',
    badgeSlug: '۰۴ • کاور و کی‌فریم',
    subcategories: ['اسپلش آرت پرچمدار بازی', 'کی‌فریم سینمایی و لحظه نبرد', 'کاور تجاری کتاب و آلبوم'],
    note: 'تصاویر محوری با رزولوشن پولیش مستر چاپ ۳۰۰DPI تجاری، در نظر گرفتن فضای تیغ و عطف جلد و تفکیک لایه‌های انیمیشن موشن.',
    tiles: [
      {
        span: 'col-span-4',
        badge: 'پکیج ۱ • اسپلش آرت بازی',
        title: 'اسپلش آرت پرچمدار بازی و کاراکتر (Hero Splash Art 300DPI)',
        desc: 'تصویرگری با حداکثر جزییات پولیش چاپ با کانون نوری دراماتیک جهت مارکتینگ، پوستر استیم و کاور بازی.',
        price: '140 - 240',
        usdVal: 150,
        timeline: '۶ تا ۹ روز کاری',
        img: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'پکیج ۲ • کی‌فریم روایی',
        title: 'کی‌فریم روایی و صحنه نبرد (Story Moment & Battle Keyframe)',
        desc: 'تصویرگری لحظات اوج داستان، دوئل‌ها و نقاط عطف سناریو با دینامیک بالای حرکتی و زاویه لنز سینمایی.',
        price: '120 - 200',
        usdVal: 130,
        timeline: '۵ تا ۸ روز کاری',
        img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'پکیج ۳ • کاور تجاری',
        title: 'کاور تجاری کتاب، کمیک و آلبوم با چینش تایپوگرافی',
        desc: 'طراحی اختصاصی جلد با در نظر گرفتن فضای عطف، تیغ چاپ و سلسله‌مراتب تایپوگرافی عنوان اثر.',
        price: '110 - 180',
        usdVal: 120,
        timeline: '۵ تا ۷ روز کاری',
        img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  sketch4: {
    id: 'sketch4',
    topSub: 'تجهیزات، سلاح‌های افسانه‌ای و پراپ',
    badgeSlug: '۰۵ • پراپ و سلاح',
    subcategories: ['سلاح‌های افسانه‌ای قهرمان (Hero Weapons)', 'ست آیتم‌های لوت و معجون‌ها', 'فریم‌های اینترفیس و آیکون HUD'],
    note: 'طراحی فرم سلاح‌ها، متریال آلیاژها، اتودهای اولیه و خروجی ترنسپرنت PNG آماده ورود مستقیم به موتور بازی.',
    tiles: [
      {
        span: 'col-span-4',
        badge: 'پکیج ۱ • سلاح قهرمان',
        title: 'سلاح قهرمان و عتیقه‌های باستانی (Hero Weapon & Relic Concept)',
        desc: 'اکتشاف سیلوئت خطی سلاح ➔ مدل‌شیت ابعاد ۳D و تشریح آلیاژها ➔ رندر نهایی با جلوه‌های درخشش جادویی VFX.',
        price: '70 - 120',
        usdVal: 75,
        timeline: '۳ تا ۵ روز کاری',
        img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'پکیج ۲ • ست آیتم‌های لوت',
        title: 'ست آیتم‌های لوت، بقا و معجون‌ها (Loot & Consumables Set)',
        desc: 'مجموعه‌های چندتایی آیتم‌های جادویی، معجون‌ها، بسته‌های اینونتوری با خروجی ترنسپرنت PNG آماده بازی.',
        price: '60 - 110',
        usdVal: 65,
        timeline: '۳ تا ۵ روز کاری',
        img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'پکیج ۳ • کیت آیکون و UI',
        title: 'کیت آیکون‌های مهارت و اینترفیس فانتزی (Skill Icons & HUD Frames)',
        desc: 'طراحی فریم‌های دارک‌فانتزی رابط کاربری، آیکون‌های مهارت طلایی/جادویی و نشان‌های قبیله‌ای.',
        price: '55 - 100',
        usdVal: 60,
        timeline: '۳ تا ۴ روز کاری',
        img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  sketch5: {
    id: 'sketch5',
    topSub: 'کمیک، مانگا و هنر متوالی',
    badgeSlug: '۰۶ • هنر روایت متوالی',
    subcategories: ['استوری‌بورد سینمایی', 'صفحات اصیل جوهرزنی مانگا', 'صفحات تمام‌رنگی وب‌تون'],
    note: 'دکوپاژ و پنینگ صحنه‌ها، چینش حباب‌های گفتگو، جوهرزنی خطی مانگا و خروجی پنل‌های تفکیک‌شده برای کمیک‌موشن.',
    tiles: [
      {
        span: 'col-span-4',
        badge: 'پکیج ۱ • دکوپاژ و استوری‌بورد',
        title: 'استوری‌بورد و دکوپاژ سینماتیک (Cinematic Storyboard)',
        desc: 'طراحی ریتم بصری صحنه‌ها، زوایای دوربین، ترکیب‌بندی نماها و تعیین جایگاه حباب‌های دیالوگ.',
        price: '75 - 130',
        usdVal: 80,
        timeline: '۳ تا ۵ روز کاری',
        img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'پکیج ۲ • جوهرزنی خطی مانگا',
        title: 'جوهرزنی خطی اصیل مانگا و کمیک (Inked Line-Art & Halftone)',
        desc: 'لاین‌آرت قلمی اصیل با هاشورهای پرکشش، خطوط سرعت اکشن و ترام‌های هافتون مشکی.',
        price: '90 - 150',
        usdVal: 95,
        timeline: '۴ تا ۶ روز کاری',
        img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'پکیج ۳ • صفحات رنگی وب‌تون',
        title: 'صفحات تمام‌رنگی وب‌تون و کمیک‌موشن (Full Color Webtoon)',
        desc: 'صفحات رنگ‌آمیزی‌شده با نورهای دراماتیک و تفکیک لایه‌های کاراکتر و صحنه برای انیمیشن‌های موشن‌کمیک.',
        price: '120 - 200',
        usdVal: 130,
        timeline: '۵ تا ۸ روز کاری',
        img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1100&q=80'
      }
    ]
  },
  sketch_mascot: {
    id: 'sketch_mascot',
    topSub: 'طراحی مسکات، نشان تجاری و کرست',
    badgeSlug: '۰۷ • مسکات و برندینگ',
    subcategories: ['مسکات دوبعدی/سه‌بعدی تجاری', 'لوگو-مسکات استودیو', 'راهنمای هویت بصری'],
    note: 'طراحی نماد انحصاری برای بازی‌ها، استارت‌آپ‌ها و برندهای تجاری با متریال‌های لوکس طلایی و کتابچه راهنمای هویت بصری.',
    tiles: [
      {
        span: 'col-span-4',
        badge: 'پکیج ۱ • مسکات تجاری',
        title: 'طراحی مسکات تجاری برند و بازی (Brand Mascot Design)',
        desc: 'خلق نماد تجاری در حالات مختلف، مدل‌شیت سه‌نما و فایل‌های وکتور و رزولوشن اصلی آماده استفاده تجاری.',
        price: '95 - 160',
        usdVal: 100,
        timeline: '۴ تا ۶ روز کاری',
        img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'پکیج ۲ • نشان استودیو و کرست',
        title: 'طراحی نشان رسمی استودیو و لوگو-مسکات (Studio Crest & Mascot Guide)',
        desc: 'طراحی کرست باوقار با پالت رنگ طلایی/دارک و کتابچه راهنمای هویت بصری و متریال‌ها.',
        price: '110 - 180',
        usdVal: 120,
        timeline: '۵ تا ۷ روز کاری',
        img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
      }
    ]
  }
};

// مخزن دارایی‌های دیجیتال مبتنی بر ۷ شاخه استاندارد سند مستر TAJINKART
var digitalStoreProducts = [];
let _initialProds = [

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

digitalStoreProducts = _initialProds;
try {
  const _sp = safeGetStorage(KEYS.PRODUCTS);
  if (_sp) {
    const _parsed = JSON.parse(_sp);
    if (Array.isArray(_parsed) && _parsed.length > 0) digitalStoreProducts = _parsed;
  }
} catch(e) {}
window.digitalStoreProducts = digitalStoreProducts;

var academyCourses = [
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

var ordersList = [];
try {
  const _storedOrders = JSON.parse(localStorage.getItem(KEYS.ORDERS));
  if (Array.isArray(_storedOrders)) {
    ordersList = _storedOrders.filter(o => o && o.id !== 501 && o.client !== 'استودیو نوا' && !String(o.client).includes('نوا'));
  }
} catch(e) {
  ordersList = [];
}
try {
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(ordersList));
} catch(e) {}

var comicPages = [
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
];

var siteMembersData = [];
let _defaultMembers = [
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
