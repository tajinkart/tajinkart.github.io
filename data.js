const KEYS = {
      ORDERS: 'tajinkart_orders_fa_v1',
      SETTINGS: 'tajinkart_settings_fa_v1',
      ARTWORKS: 'tajinkart_artworks_fa_v1',
      PIPELINES: 'tajinkart_pipelines_fa_v1',
      PRODUCTS: 'tajinkart_products_fa_v1',
      MEMBERS: 'tajinkart_members_v1'
    };

    let currentView = 'showcase';
    let currentMember = null;
    let comicCurrentPage = 1;
    let activeModalItem = {};
    let currencyMode = 'USD'; // 'USD' or 'TOMAN'
    let currentGalleryTag = 'all';

    let siteSettings = JSON.parse(localStorage.getItem(KEYS.SETTINGS)) || {
      usdRate: 72000,
      tgToken: '',
      tgChat: '',
      adminPass: 'tajinkart'
    };

    let showcaseArtworks = JSON.parse(localStorage.getItem(KEYS.ARTWORKS)) || [
      { id: 1, tag: 'environment', shortSlug: 'محراب آتشین', title: 'محراب آبسیدین — محراب سرخ کهن', desc: 'محراب باستانی کنده شده در دل سنگ‌های آتشفشانی که انرژی اتر را هدایت می‌کند.', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80' },
      { id: 2, tag: 'environment', shortSlug: 'ارگ یخی', title: 'ارگ کریستالی — دژ شمالی', desc: 'دژ کوهستانی مستقر بر فراز قله‌های یخی در جریان خورشیدگرفتگی بزرگ.', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80' },
      { id: 3, tag: 'keyframe', shortSlug: 'مونولیت سپید', title: 'مونولیت سپید — نسخه ویرایش کاور', desc: 'کاور مینیمال برای کتاب وقایع‌نگاری دارک فانتزی با تاکید بر فضای منفی.', image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80' },
      { id: 4, tag: 'character', shortSlug: 'شوالیه سرخ', title: 'سرگردان سرخ — محافظ سوگند خون', desc: 'پیش‌قراول پوشیده در زره پولادین برای پاسداری از مرزهای تمدن کهن.', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=900&q=80' },
      { id: 5, tag: 'keyframe', shortSlug: 'طلایه‌دار سقوط', title: 'طلایه‌دار سقوط — کی‌فریم سینمایی', desc: 'صحنه دراماتیک روایت آخرین ایستادگی در دروازه آبسیدین قبل از فرورفتن در سایه‌ها.', image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=900&q=80' },
      { id: 6, tag: 'character', shortSlug: 'عتیقه‌های اتر', title: 'سلاح‌های افسانه‌ای اتر — کانسپت ست', desc: 'مطالعه طراحی مدولار اسست بازی با حکاکی نشان‌های رونیک باستانی.', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80' },
      { id: 7, tag: 'character', shortSlug: 'کایمرای مغاک', title: 'کایمرای اعماق — درنده بیومکانیکال', desc: 'ارگانیسم درنده مهندسی‌شده برای اکوسیستم‌های سمی با صفحات کیتینی.', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=900&q=80' },
      { id: 8, tag: 'environment', shortSlug: 'کلیسای تاریک', title: 'کلیسای گوتیک تاریک — معماری فانتزی', desc: 'مطالعه سقف‌های طاق‌دار گوتیک همراه با پرتوهای حجمی نور مهتاب و سایه‌ها.', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80' }
    ];

    let PIPELINE_DATA = JSON.parse(localStorage.getItem(KEYS.PIPELINES)) || {
      sketch1: {
        topSub: 'طراحی کاراکتر و شخصیت',
        badgeSlug: '۰۱ • کاراکتر دیزاین',
        note: 'پایپلاین گام‌به‌گام شامل اتودهای اولیه سیلوئت، مدل‌شیت سه‌نمای ارتوگرافیک، احساسات چهره و رندر نهایی پرتره یا تمام‌قد.',
        tiles: [
          { span: 'col-span-5', badge: 'مرحله ۱ • اتود مفهومی', title: 'اکتشاف فرم، سیلوئت و لور کاراکتر', desc: 'جستجوی تناسبات، اتودهای اولیه لباس، حس حجم و پیش‌زمینه داستانی شخصیت.', price: '$60 - $80', usdVal: 70, timeline: '۳ تا ۴ روز کاری', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80' },
          { span: 'col-span-7', badge: 'مرحله ۲ • مدل‌شیت فنی', title: 'مدل‌شیت ارتوگرافیک و حالات چهره', desc: 'زوایای دقیق سه‌بعدی (روبرو، نیم‌رخ، پشت) همراه با میمیک‌های پویا و اکسپرشن چهره.', price: '$120 - $150', usdVal: 135, timeline: '۵ تا ۷ روز کاری', img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=900&q=80' },
          { span: 'col-span-12', badge: 'مرحله ۳ • رندر مستر نهایی', title: 'رندر تمام‌قد سینمایی + فایل لایه‌باز PSD', desc: 'جداسازی متریال‌ها، افکت‌های نوری، تکسچرهای پوست/زره و تحویل فایل مستر رزولوشن بالا.', price: '$180 - $260', usdVal: 220, timeline: '۷ تا ۱۰ روز کاری', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1100&q=80' }
        ]
      },
      sketch_creature: {
        topSub: 'طراحی موجودات و هیولاها',
        badgeSlug: '۰۲ • کانسپت موجودات',
        note: 'زیست‌شناسی تخیلی، بررسی اسکلتی، بافت‌های پوستی، پولک‌ها و ارگان‌های شکارگری برای سینما و بازی.',
        tiles: [
          { span: 'col-span-6', badge: 'مرحله ۱ • آناتومی', title: 'اتودهای اولیه فیزیولوژی و سیلوئت هیولا', desc: 'بررسی عضلانی اسکلتی، نحوه حرکت، بال‌ها و فرم کلی درنده در اتمسفر محیطی.', price: '$75 - $95', usdVal: 85, timeline: '۳ تا ۵ روز کاری', img: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80' },
          { span: 'col-span-6', badge: 'مرحله ۲ • بررسی جزئیات', title: 'ارتوگرافیک ساختار پوست و زوائد', desc: 'نقشه دقیق شاخک‌ها، فلس‌ها، کیسه‌های اسیدی و الگوهای پوست برای تیم سه‌بعدی.', price: '$140 - $180', usdVal: 160, timeline: '۵ تا ۸ روز کاری', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' },
          { span: 'col-span-12', badge: 'مرحله ۳ • کی‌فریم سینمایی', title: 'تصویرسازی سینمایی هیولا در زیستگاه', desc: 'نورپردازی دراماتیک با افکت‌های خیسی و بزاق، اتمسفر غبارآلود و عمق میدان کامل.', price: '$200 - $320', usdVal: 260, timeline: '۸ تا ۱۲ روز کاری', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1100&q=80' }
        ]
      },
      sketch2: {
        topSub: 'طراحی فضا و محیط',
        badgeSlug: '۰۳ • طراحی دنیا',
        note: 'معماری، کانسپت سازه‌ها، تنظیم پرسپکتیو تک‌نقطه‌ای و سه‌نقطه‌ای و پالت‌های نوری مات.',
        tiles: [
          { span: 'col-span-6', badge: 'مرحله ۱ • المان‌های صحنه', title: 'طراحی دارایی‌ها و سازه‌های مدولار', desc: 'ستون‌های باستانی، ابلیسک‌ها، صخره‌ها و المان‌های قابل استفاده در ساخت جهان بازی.', price: '$75 - $100', usdVal: 90, timeline: '۴ تا ۶ روز کاری', img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80' },
          { span: 'col-span-6', badge: 'مرحله ۲ • ترکیب‌بندی', title: 'تنظیم پرسپکتیو و تعادل تیرگی/روشنی', desc: 'کادربندی سینمایی دوربین، هدایت چشم مخاطب و تفکیک لایه‌های جلو و پس‌زمینه.', price: '$110 - $140', usdVal: 125, timeline: '۴ تا ۶ روز کاری', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
          { span: 'col-span-12', badge: 'مرحله ۳ • چشم‌انداز نهایی', title: 'رندر کامل منظره با اتمسفر و مه سینمایی', desc: 'نقاشی کامل محیطی با پراکندگی پرتوهای نور، مه حجمی و مات‌پینتینگ حرفه‌ای.', price: '$195 - $320', usdVal: 250, timeline: '۷ تا ۱۲ روز کاری', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1100&q=80' }
        ]
      },
      sketch3: {
        topSub: 'کاور، پوستر و کی‌فریم',
        badgeSlug: '۰۴ • کاور و پوستر',
        note: 'طراحی تصاویر محوری با کنتراست بالا برای جلد کتاب، موسیقی، اسپلش‌اسکرین و پوسترهای سینمایی.',
        tiles: [
          { span: 'col-span-4', badge: 'مرحله ۱ • جلد کتاب/آلبوم', title: 'کاور آلبوم موسیقی و کاور کتاب', desc: 'طراحی مربع یا پرینت استاندارد با در نظر گرفتن لبه‌های تیغ و عطف جلد کتاب.', price: '$150 - $190', usdVal: 170, timeline: '۵ تا ۷ روز کاری', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80' },
          { span: 'col-span-4', badge: 'مرحله ۲ • پوستر روایی', title: 'پوستر داستانی با هماهنگی تایپوگرافی', desc: 'سلسله‌مراتب بصری پرکشش برای جلب مخاطب، کانون‌های نوری و فضا برای متن.', price: '$175 - $220', usdVal: 195, timeline: '۶ تا ۸ روز کاری', img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80' },
          { span: 'col-span-4', badge: 'مرحله ۳ • اسپلش بازی', title: 'صفحه لودینگ و لاین‌آپ کاراکترها', desc: 'تصویر اصلی اسپلش‌اسکرین بازی همراه با چینش مقایسه ابعاد شخصیت‌ها.', price: '$230 - $350', usdVal: 290, timeline: '۸ تا ۱۴ روز کاری', img: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=800&q=80' }
        ]
      },
      sketch4: {
        topSub: 'پراپ و المان‌های رابط کاربری',
        badgeSlug: '۰۵ • تجهیزات و UI',
        note: 'فریم‌های دارک‌فانتزی اینترفیس، سلاح‌های جادویی، کاتالوگ آیکون‌های مهارت و المان‌های مدولار.',
        tiles: [
          { span: 'col-span-6', badge: 'مرحله ۱ • کادرهای UI', title: 'پنل‌ها و فریم‌های اینترفیس دارک‌فانتزی', desc: 'نوارهای سلامت و مانا، فریم اینونتوری و ویجت‌های آماده اسلایس برای بازی.', price: '$80 - $120', usdVal: 100, timeline: '۳ تا ۵ روز کاری', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' },
          { span: 'col-span-6', badge: 'مرحله ۲ • طراحی سلاح', title: 'کانسپت سلاح‌ها و کاتالیزورهای جادویی', desc: 'سلاح‌های سرد و دوربرد، تشریح بافت مواد و فازهای ارتقاء سطح تجهیزات.', price: '$75 - $110', usdVal: 90, timeline: '۳ تا ۵ روز کاری', img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80' },
          { span: 'col-span-6', badge: 'مرحله ۳ • آیکون مهارت', title: 'بسته آیکون‌های جادو و تجهیزات', desc: 'آیکون‌های شارپ و خوش‌رنگ اسپل‌ها، باف‌ها، معجون‌ها و گوهرها برای اینونتوری.', price: '$65 - $90', usdVal: 75, timeline: '۲ تا ۴ روز کاری', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80' },
          { span: 'col-span-6', badge: 'مرحله ۴ • شیت هویت بصری', title: 'پترن‌های قبیله‌ای و کتابچه راهنمای سبک', desc: 'الگوهای تکرارشونده وکتور، نشان‌های خاندانی و استایل‌گاید تداوم جهان پروژه.', price: '$90 - $130', usdVal: 110, timeline: '۴ تا ۶ روز کاری', img: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80' }
        ]
      },
      sketch5: {
        topSub: 'کمیک و استوری‌بورد',
        badgeSlug: '۰۶ • هنر روایت متوالی',
        note: 'از تامب‌نیل‌های کارگردانی پلان‌ها و جایگذاری بالن‌های گفت‌وگو تا جوهرزنی خطی مانگا و صفحات رنگی وب‌تون.',
        tiles: [
          { span: 'col-span-6', badge: 'مرحله ۱ • کارگردانی', title: 'استوری‌بورد و جریان خوانش صفحات', desc: 'ریتم نماها، زاویه‌بندی پنل‌ها و هدایت نگاه با محل بالن‌های متن.', price: '$85 - $110', usdVal: 95, timeline: '۳ تا ۵ روز کاری', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80' },
          { span: 'col-span-6', badge: 'مرحله ۲ • جوهرزنی', title: 'لاین‌آرت مانگا و ترام‌های هافتون', desc: 'جوهرزنی قلمی با حس فشار دست، خطوط سرعت، سایه‌های مشکی و ترام اصیل.', price: '$135 - $165', usdVal: 150, timeline: '۴ تا ۶ روز کاری', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
          { span: 'col-span-12', badge: 'مرحله ۳ • رنگ‌آمیزی', title: 'صفحات تمام‌رنگی وب‌تون و ناول مصور', desc: 'نورپردازی ریم‌لایت، عمق رنگی سینمایی و خروجی مناسب چاپ یا وب‌تون.', price: '$170 - $250', usdVal: 210, timeline: '۶ تا ۹ روز کاری', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1100&q=80' }
        ]
      }
    };

    let digitalStoreProducts = JSON.parse(localStorage.getItem(KEYS.PRODUCTS)) || [
      { id: 1, title: 'اشتراک کمیک و مانگای دیجیتال (فصل ۱ تا ۳ + فایل PSD)', price: 24, type: 'کمیک دیجیتال', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=80', desc: 'نسخه‌های باکیفیت بالا، اتودهای استوری‌بورد، یادداشت‌های کارگردانی و فایل‌های لایه‌باز کمیک.' },
      { id: 2, title: 'بسته اسپریت و آرت پیکسلی دوبعدی (۶ کاراکتر + ۱۲ دشمن)', price: 39, type: 'پک اسست بازی', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=700&q=80', desc: 'انیمیشن‌های ۸ جهته راه رفتن، حمله سنگین، جاخالی و مرگ، آماده برای یونتی و گودو.' },
      { id: 3, title: 'اسپلش‌های انیمیشنی لوپ پیکسلی (کیفیت 4K)', price: 29, type: 'انیمیشن لوپ', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=80', desc: 'لوپ‌های متوالی منوی اصلی بازی، کمپ‌فایر دارک فانتزی و راهروهای سیاه‌چال.' },
      { id: 4, title: 'موتور براش‌های دارک‌فانتزی فتوشاپ و پروکریت', price: 19, type: 'موتور براش', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=700&q=80', desc: '۶۴ براش ساختارمند برای اتودزنی بافت زره زنگ‌زده، مه، خون و هایلایت‌های درخشان لبه‌ها.' },
      { id: 5, title: 'کیت پراپ و المان‌های RPG دارک‌فانتزی (۱۲۰ آیکون + فریم)', price: 34, type: 'پراپ و رابط کاربری', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80', desc: 'آیکون‌های طلسم، معجون‌ها، تجهیزات افسانه‌ای، فریم اینونتوری و نوارهای مانا و سلامت.' }
    ];

    let academyCourses = [
      { id: 1, title: 'مسترکلاس: طراحی کاراکتر فانتزی و متریال زره', price: 59, duration: '۱۴ ساعت ویدیو HD + فایل‌های PSD', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80', desc: 'از اتودزنی سیلوئت تا مدل‌شیت سه‌نما و تکنیک‌های پیشرفته رندر فلز و چرم.' },
      { id: 2, title: 'جهان‌سازی و کانسپت آرت محیط‌های سینمایی', price: 65, duration: '۱۲ ساعت ویدیو HD + براش اختصاصی', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', desc: 'پرسپکتیو کاربردی، نورپردازی حجمی، تعادل تیرگی و روشن و مدیریت نقاط کانونی.' },
      { id: 3, title: 'نقشه راه فریلنسری کانسپت آرتیست‌ها در بازار جهانی', price: 49, duration: '۸ ساعت ویدیو + قالب قراردادها', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', desc: 'تنظیم پورتفولیو، ارتباط با کارفرما، تخمین قیمت، تعریف مایل‌استون‌ها و عقد قرارداد بین‌المللی.' }
    ];

    let ordersList = JSON.parse(localStorage.getItem(KEYS.ORDERS)) || [
      { id: 501, client: 'استودیو نوا', contact: '۰۹۱۲۰۰۰۰۰۰۰', pkg: 'مدل‌شیت ارتوگرافیک و حالات چهره', phase: 'فاز ۴: رندر کامل سینمایی + فایل لایه‌باز PSD', brief: 'کاراکتر روگ سایبرپانک با شنل تیره و قطعات بیومکانیکال', status: 'در حال تولید' }
    ];

    let comicPages = [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
    ];

    let siteMembersData = JSON.parse(localStorage.getItem(KEYS.MEMBERS)) || [
      { 
        id: 101, 
        name: 'سید سروش تاج', 
        email: 'soroush@tajinkart.com', 
        contact: '09120000000', 
        tier: 'VIP', 
        balance: '$2,450', 
        withdrawn: '$1,200',
        assetsBought: ['اشتراک کمیک و مانگا (فصل ۱ تا ۳)', 'موتور براش دارک‌فانتزی ۶۴ عددی', 'پک اسپرایت دوبعدی'], 
        totalSpent: '$420' 
      },
      { 
        id: 102, 
        name: 'استودیو پایا گیمز', 
        email: 'director@payagames.ir', 
        contact: '09350000000', 
        tier: 'PRO', 
        balance: '$850', 
        withdrawn: '$350',
        assetsBought: ['بسته اسپریت و آرت پیکسلی دوبعدی', 'اسپلش‌های انیمیشنی لوپ پیکسلی'], 
        totalSpent: '$190' 
      },
      { 
        id: 103, 
        name: 'آریا کیان', 
        email: 'aria@gmail.com', 
        contact: '09190000000', 
        tier: 'STANDARD', 
        balance: '$0', 
        withdrawn: '$0',
        assetsBought: ['موتور براش‌های دارک‌فانتزی فتوشاپ و پروکریت'], 
        totalSpent: '$19' 
      }
    ];

    let currentSelectedPipeKey = 'sketch1';
    let currentSelectedStageIdx = 0;
    let currentSelectedArtIdx = 0;
    let currentSelectedProductIdx = 0;
    let selectedMemberIdx = 0;
    let currentMemberTierFilter = 'all';

    // تبدیل قیمت زنده دلار / تومان