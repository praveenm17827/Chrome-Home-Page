/**
 * Chrome Home Page - Dashboard Controller
 * Implements: Clock, Background Slideshow, Google Search, Shortcuts (CRUD & LocalStorage), Quotes, Reset Action.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Initialize Modules
  SlideshowModule.init();
  ClockModule.init();
  SearchModule.init();
  ShortcutsModule.init();
  QuoteModule.init();
  AppsLauncherModule.init();
  ResetModule.init();
  LayoutEditModule.init();
});

/* ==========================================
   LOCAL STORAGE UTILITY
   ========================================== */
const Storage = {
  get(key, defaultValue) {
    const val = localStorage.getItem(key);
    try {
      return val ? JSON.parse(val) : defaultValue;
    } catch {
      return val || defaultValue;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  clear() {
    localStorage.clear();
  }
};

/* ==========================================
   CENTRALIZED ICON SERVICE & REGISTRY
   ========================================== */
const IconService = {
  // Session-based status cache to prevent repeated network requests for broken URLs
  statusCache: {},

  // Local SVG Registry for popular brand logos
  shortcutSvgs: {
    youtube: `
      <svg viewBox="0 0 24 24" fill="#FF0000" class="w-5 h-5 object-contain" aria-hidden="true">
        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.516 3.5 12 3.5 12 3.5s-7.516 0-9.388.555a3.003 3.003 0 0 0-2.11 2.108C0 8.03 0 12 0 12s0 3.97.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.484 20.5 12 20.5 12 20.5s7.516 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.97 24 12 24 12s0-3.97-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>`,
    github: `
      <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 object-contain text-white" aria-hidden="true">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>`,
    linkedin: `
      <svg viewBox="0 0 24 24" fill="#0077B5" class="w-5 h-5 object-contain" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>`,
    gemini: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 object-contain" aria-hidden="true">
        <path d="M12 2C12 2 12.5 7.5 18 12C12.5 16.5 12 22 12 22C12 22 11.5 16.5 6 12C11.5 7.5 12 2 12 2Z" fill="url(#geminiGradService)"/>
        <defs>
          <linearGradient id="geminiGradService" x1="6" y1="2" x2="18" y2="22" gradientUnits="userSpaceOnUse">
            <stop stop-color="#9BC5FF"/>
            <stop offset="0.5" stop-color="#2B66FF"/>
            <stop offset="1" stop-color="#FF9B9B"/>
          </linearGradient>
        </defs>
      </svg>`,
    chatgpt: `
      <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 object-contain text-emerald-400" aria-hidden="true">
        <path d="M20.73 11.23a4.7 4.7 0 0 0-.4-2.8 4.7 4.7 0 0 0-2-2.1 4.75 4.75 0 0 0-4.6-.2 4.7 4.7 0 0 0-3.3-1.6 4.7 4.7 0 0 0-3.9 1.9 4.75 4.75 0 0 0-2 4.3 4.7 4.7 0 0 0-1.6 3.3 4.7 4.7 0 0 0 1.9 3.9 4.75 4.75 0 0 0 4.3 2 4.7 4.7 0 0 0 3.3 1.6 4.7 4.7 0 0 0 4.6-2.6 4.7 4.7 0 0 0 2-2 4.75 4.75 0 0 0 .3-4.7zm-8.73 8.13c-1.3 0-2.4-.7-3.1-1.7l3.8-2.2 3.8 2.2c-.7 1-1.8 1.7-3.1 1.7zM7.5 16.03c-.6-1-1-2.1-1-3.3 0-1.3.4-2.4 1-3.3l3.8 2.2-3.8 4.4zm2.1-7.83c.7-1 1.8-1.7 3.1-1.7 1.3 0 2.4.7 3.1 1.7l-3.8 2.2-2.4-2.2zm6.9 4.5c0 1.3-.4 2.4-1 3.3l-3.8-2.2 3.8-2.2c.6 1 1 2.1 1 3.3l-.0 1.1zM12 11.03l-3.8-2.2 3.8-2.2 3.8 2.2L12 11.03zm.7 2.4l-3.8 2.2v-4.4l3.8 2.2z"/>
      </svg>`,
    whatsapp: `
      <svg viewBox="0 0 24 24" fill="#25D366" class="w-5 h-5 object-contain" aria-hidden="true">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.455L0 24zm6.59-4.846c1.62.962 3.21 1.493 4.93 1.495 5.429.004 9.843-4.412 9.848-9.85.002-2.633-1.02-5.107-2.875-6.964C16.696 1.977 14.22 .953 11.59.95c-5.433 0-9.85 4.41-9.854 9.855-.002 1.83.498 3.626 1.447 5.185l-1.015 3.707 3.81-.998c1.516.827 3.067 1.31 4.669 1.31zM17.47.017c-.297-.15-1.758-.867-2.03-.967-.273-.099-.471-.15-.669.15-.198.297-.768.967-.941 1.165-.173.199-.347.223-.644.074-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.496.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      </svg>`,
    leetcode: `
      <svg viewBox="0 0 24 24" fill="#FFA116" class="w-5 h-5 object-contain" aria-hidden="true">
        <path d="M16.102 17.93l-2.697 2.607c-.466.451-1.211.451-1.677 0l-6.02-5.819a1.144 1.144 0 0 1 0-1.649l5.223-5.05c.466-.451 1.211-.451 1.677 0l2.583 2.497c.466.451 1.211.451 1.677 0a1.144 1.144 0 0 0 0-1.649L14.28 6.368c-.466-.451-1.211-.451-1.677 0L6.08 12.74a3.42 3.42 0 0 0 0 4.935l6.02 5.819c1.397 1.352 3.633 1.352 5.03 0l3.704-3.58a1.144 1.144 0 0 0 0-1.649c-.466-.451-1.211-.451-1.677 0l-3.055 2.955z"/>
        <path d="M14.28 10.434c-.466-.451-1.211-.451-1.677 0a1.144 1.144 0 0 0 0 1.649l2.846 2.753c.466.451 1.211.451 1.677 0a1.144 1.144 0 0 0 0-1.649l-2.846-2.753z"/>
      </svg>`,
    overleaf: `
      <svg viewBox="0 0 24 24" fill="#47a147" class="w-5 h-5 object-contain" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 18.5c-3.59 0-6.5-2.91-6.5-6.5S8.41 5.5 12 5.5s6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5z"/>
        <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
      </svg>`
  },

  // Fallback globe SVG
  fallbackGlobeSvg: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 sm:w-6 sm:h-6 object-contain text-white/50" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>`,

  // Google Apps name mapping for walkxcode/dashboard-icons CDN (SVG)
  googleAppSvgMap: {
    account: "google",
    search: "google",
    gmail: "google-gmail",
    youtube: "youtube",
    gemini: "google-gemini",
    maps: "google-maps",
    drive: "google-drive",
    calendar: "google-calendar",
    news: "google-news",
    photos: "google-photos",
    meet: "google-meet",
    translate: "google-translate",
    slides: "google-slides",
    "google-one": "google-one",
    shopping: "google-shopping",
    store: "google-store",
    play: "google-play",
    finance: "google-finance",
    keep: "google-keep",
    "my-ad-center": "google",
    classroom: "google-classroom",
    chat: "google-chat",
    earth: "google-earth",
    saved: "google",
    "arts-culture": "google-arts-and-culture",
    "google-ads": "google-ads",
    "merchant-center": "google-merchant-center",
    contacts: "google-contacts",
    travel: "google-travel",
    forms: "google-forms",
    books: "google-books",
    "chrome-web-store": "google-chrome",
    "password-manager": "google",
    "google-analytics": "google-analytics",
    blogger: "blogger",
    "youtube-music": "youtube-music",
    wallet: "google-pay",
    notebooklm: "google",
    tasks: "google-tasks"
  },

  // Map app names to gstatic product assets (Tier 2 fallback)
  getGStaticUrl(app) {
    const nameMap = {
      account: "avatar_square_blue",
      search: "gsa",
      store: "google_store",
      "google ads": "ads",
      "youtube music": "youtube_music",
      "my ad center": "my_ad_center",
      "chrome web store": "chrome_web_store",
      "google one": "google_one",
      "google analytics": "analytics",
      "arts & culture": "arts_culture",
      "merchant center": "merchant_center",
      "password manager": "password_manager"
    };
    const key = app.name.toLowerCase();
    const iconName = nameMap[key] || key;
    return `https://www.gstatic.com/images/branding/product/2x/${iconName}_96dp.png`;
  },

  // Render HTML for a Shortcut icon
  getShortcutIconHtml(item) {
    // If a custom local path/URL is supplied, try rendering it
    if (item.icon && item.icon.trim() !== "") {
      return `<img src="${item.icon}" alt="" class="w-5 h-5 object-contain" loading="lazy" onerror="IconService.handleShortcutError(this, '${item.url}')">`;
    }

    const titleKey = item.title.toLowerCase().trim();
    
    // Check if the shortcut is registered as a high-quality inline SVG
    if (this.shortcutSvgs[titleKey]) {
      return this.shortcutSvgs[titleKey];
    }

    // Default to the high-resolution Google Favicon Extractor
    const domain = item.url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    return `<img src="${faviconUrl}" alt="" class="w-5 h-5 object-contain" loading="lazy" onerror="IconService.handleShortcutError(this, '${item.url}')">`;
  },

  // Render HTML for a Google App Launcher icon
  getGoogleAppIconHtml(app) {
    const filename = this.googleAppSvgMap[app.id] || "google";
    const primarySvgUrl = `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/${filename}.svg`;

    // Render image element trying walkxcode SVG first, with a fallback chain
    return `<img src="${primarySvgUrl}" alt="" class="w-5 h-5 sm:w-6 sm:h-6 object-contain" loading="lazy" onerror="IconService.handleGoogleAppError(this, ${JSON.stringify(app).replace(/"/g, '&quot;')})">`;
  },

  // Error handler for Google App Launcher icons
  handleGoogleAppError(imgElement, app) {
    const currentSrc = imgElement.src;
    
    // Check if this source has already failed in this session
    if (this.statusCache[currentSrc] === 'failed') {
      const gstaticUrl = this.getGStaticUrl(app);
      if (this.statusCache[gstaticUrl] === 'failed') {
        const container = imgElement.parentNode;
        if (container) {
          container.innerHTML = this.fallbackGlobeSvg;
        }
        return;
      }
      imgElement.src = gstaticUrl;
      return;
    }
    
    // Mark the current source as failed in the session cache
    this.statusCache[currentSrc] = 'failed';

    const gstaticUrl = this.getGStaticUrl(app);
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${app.domain}&sz=128`;

    if (imgElement.dataset.fallbackStep === undefined) {
      console.warn(`[IconService] SVG load failed for '${app.name}':`, currentSrc, `Trying GStatic PNG...`);
      imgElement.dataset.fallbackStep = "1";
      imgElement.src = gstaticUrl;
    } else if (imgElement.dataset.fallbackStep === "1") {
      console.warn(`[IconService] GStatic PNG failed for '${app.name}':`, currentSrc, `Trying Google Favicon...`);
      imgElement.dataset.fallbackStep = "2";
      imgElement.src = faviconUrl;
    } else {
      console.error(`[IconService] All network fallbacks failed for '${app.name}'. Rendering local SVG globe.`);
      const container = imgElement.parentNode;
      if (container) {
        container.innerHTML = this.fallbackGlobeSvg;
      }
    }
  },

  // Error handler for Shortcuts (Quick Links)
  handleShortcutError(imgElement, url) {
    const currentSrc = imgElement.src;
    
    if (this.statusCache[currentSrc] === 'failed') {
      const container = imgElement.parentNode;
      if (container) {
        container.innerHTML = this.fallbackGlobeSvg;
      }
      return;
    }
    
    this.statusCache[currentSrc] = 'failed';
    const domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

    if (imgElement.dataset.fallbackStep === undefined && currentSrc !== faviconUrl) {
      console.warn(`[IconService] Shortcut icon failed:`, currentSrc, `Trying Google Favicon...`);
      imgElement.dataset.fallbackStep = "1";
      imgElement.src = faviconUrl;
    } else {
      console.error(`[IconService] Shortcut favicon failed:`, currentSrc, `. Rendering local SVG globe.`);
      const container = imgElement.parentNode;
      if (container) {
        container.innerHTML = this.fallbackGlobeSvg;
      }
    }
  }
};
window.IconService = IconService;

/* ==========================================
   CINEMATIC BACKGROUND SLIDESHOW MODULE
   ========================================== */
const SlideshowModule = {
  init() {
    this.slide1 = document.getElementById('bg-slide-1');
    this.slide2 = document.getElementById('bg-slide-2');
    this.prevBtn = document.getElementById('prev-bg-btn');
    this.nextBtn = document.getElementById('next-bg-btn');
    this.playPauseBtn = document.getElementById('play-pause-bg-btn');
    this.playPauseIcon = document.getElementById('play-pause-icon');
    this.statusText = document.getElementById('slideshow-status');

    this.images = CONFIG.slideshowImages || [];
    this.currentIndex = Storage.get('slideshow_index', 0);
    this.isPlaying = Storage.get('slideshow_playing', true);
    this.timer = null;
    this.transitionTime = 8000; // 8 seconds per slide
    this.activeSlide = this.slide1;
    this.inactiveSlide = this.slide2;
    this.isHovered = false;

    if (this.images.length === 0) return;

    // Load initial background image
    this.setSlideImage(this.activeSlide, this.images[this.currentIndex]);
    this.activeSlide.classList.add('kenburns-active');

    // Controls Action Listeners
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());
    if (this.playPauseBtn) {
      this.playPauseBtn.addEventListener('click', () => this.togglePlay());
    }

    // Force continuous automatic sliding (no hover pausing)
    this.isPlaying = true;
    this.isHovered = false;

    this.updatePlayPauseUI();
    this.startTimer();
  },

  setSlideImage(slide, url) {
    slide.style.backgroundImage = `url('${url}')`;
  },

  async next() {
    let nextIndex = (this.currentIndex + 1) % this.images.length;
    await this.transitionTo(nextIndex);
  },

  async prev() {
    let prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    await this.transitionTo(prevIndex);
  },

  async transitionTo(index, retryCount = 0) {
    // Prevent infinite retry loop if all images are broken
    if (retryCount >= this.images.length) {
      console.error("All slideshow image URLs failed to load.");
      return;
    }

    const url = this.images[index];

    try {
      // Preload image with broken URL handling
      await this.preloadImage(url);

      const oldActive = this.activeSlide;
      const newActive = this.inactiveSlide;

      this.setSlideImage(newActive, url);

      newActive.classList.add('kenburns-active');
      newActive.style.opacity = '1';
      oldActive.style.opacity = '0';

      // Remove Ken Burns class from old slide after transition completes
      setTimeout(() => {
        oldActive.classList.remove('kenburns-active');
      }, 1500);

      this.activeSlide = newActive;
      this.inactiveSlide = oldActive;
      this.currentIndex = index;
      Storage.set('slideshow_index', index);

      if (this.isPlaying && !this.isHovered) {
        this.resetTimer();
      }
    } catch (err) {
      console.warn(`Slideshow image failed to load: ${url}. Skipping to next...`);
      // Failover to next image index and increment retry counter
      const nextIndex = (index + 1) % this.images.length;
      await this.transitionTo(nextIndex, retryCount + 1);
    }
  },

  preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error('Image load failed'));
    });
  },

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    Storage.set('slideshow_playing', this.isPlaying);
    this.updatePlayPauseUI();
    if (this.isPlaying) {
      if (!this.isHovered) {
        this.startTimer();
      }
      this.updateStatusText("Slideshow Active");
    } else {
      this.pauseTimer();
      this.updateStatusText("Slideshow Paused");
    }
  },

  updatePlayPauseUI() {
    if (this.playPauseIcon) {
      if (this.isPlaying) {
        this.playPauseIcon.setAttribute('data-lucide', 'pause');
      } else {
        this.playPauseIcon.setAttribute('data-lucide', 'play');
      }
    }
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  updateStatusText(text) {
    if (this.statusText) {
      this.statusText.textContent = text;
    }
  },

  startTimer() {
    this.pauseTimer();
    this.timer = setInterval(() => this.next(), this.transitionTime);
  },

  pauseTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },

  resetTimer() {
    this.startTimer();
  }
};

/* ==========================================
   LIVE CLOCK MODULE
   ========================================== */
const ClockModule = {
  init() {
    this.clockContainer = document.getElementById('clock-container');
    this.timeDisplay = document.getElementById('live-time');
    this.dateDisplay = document.getElementById('live-date');
    this.greetingDisplay = document.getElementById('greeting-text');

    this.is24Hour = Storage.get('clock_format_24h', false);

    this.update();
    setInterval(() => this.update(), 1000);

    // Toggle clock format (12h/24h) on click
    this.clockContainer.addEventListener('click', () => {
      this.is24Hour = !this.is24Hour;
      Storage.set('clock_format_24h', this.is24Hour);
      this.update();
    });
  },

  update() {
    const now = new Date();

    // Time Formatting
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    let ampm = '';

    if (!this.is24Hour) {
      ampm = hours >= 12 ? ' PM' : ' AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // convert 0 to 12
    }
    hours = String(hours).padStart(2, '0');

    this.timeDisplay.textContent = `${hours}:${minutes}:${seconds}${ampm}`;

    // Date Formatting
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    this.dateDisplay.textContent = now.toLocaleDateString(undefined, dateOptions);

    // Greetings
    const hour = now.getHours();
    let greetingPrefix = "Good evening";
    if (hour < 12) {
      greetingPrefix = "Good morning";
    } else if (hour < 18) {
      greetingPrefix = "Good afternoon";
    }

    const name = CONFIG.userName || "MR. STARK";
    this.greetingDisplay.textContent = `${greetingPrefix}, ${name}`;
  }
};

/* ==========================================
   GOOGLE SEARCH BAR MODULE
   ========================================== */
const SearchModule = {
  init() {
    this.searchInput = document.getElementById('search-input');
    this.clearBtn = document.getElementById('clear-search-btn');

    // Autofocus input text field on page load
    setTimeout(() => {
      if (this.searchInput) {
        this.searchInput.focus();
      }
    }, 200);

    // Clear Search query
    this.clearBtn.addEventListener('click', () => {
      this.searchInput.value = '';
      this.searchInput.focus();
    });
  }
};

/* ==========================================
   WEBSITE SHORTCUTS CRUD SYSTEM
   ========================================== */
const ShortcutsModule = {
  init() {
    this.grid = document.getElementById('shortcuts-grid');
    this.addBtn = document.getElementById('add-shortcut-btn');

    // Modal elements
    this.modal = document.getElementById('shortcut-modal');
    this.modalTitle = document.getElementById('modal-title');
    this.form = document.getElementById('shortcut-form');
    this.closeBtn = document.getElementById('close-modal-btn');
    this.cancelBtn = document.getElementById('cancel-shortcut-btn');
    this.deleteBtn = document.getElementById('delete-shortcut-modal-btn');
    this.modalOverlay = document.getElementById('modal-overlay');

    // Form Inputs
    this.editIndexInput = document.getElementById('edit-shortcut-index');
    this.titleInput = document.getElementById('shortcut-title-input');
    this.urlInput = document.getElementById('shortcut-url-input');
    this.iconInput = document.getElementById('shortcut-icon-input');

    this.shortcuts = Storage.get('dashboard_shortcuts', CONFIG.shortcuts);

    // Sort based on quickLinksOrder to persist positions
    const quickLinksOrder = Storage.get('quickLinksOrder', null);
    if (quickLinksOrder && Array.isArray(quickLinksOrder)) {
      this.shortcuts.sort((a, b) => {
        let indexA = quickLinksOrder.indexOf(a.url);
        let indexB = quickLinksOrder.indexOf(b.url);
        if (indexA === -1) indexA = 999;
        if (indexB === -1) indexB = 999;
        return indexA - indexB;
      });
    }

    this.render();

    // Event Bindings
    this.addBtn.addEventListener('click', () => this.openAddModal());
    this.closeBtn.addEventListener('click', () => this.closeModal());
    this.cancelBtn.addEventListener('click', () => this.closeModal());
    this.modalOverlay.addEventListener('click', () => this.closeModal());
    this.deleteBtn.addEventListener('click', () => this.deleteShortcut());

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveShortcut();
    });
  },

  render() {
    this.grid.innerHTML = '';

    // Apply custom avatar image from CONFIG
    const profileImg = document.getElementById('profile-img');
    if (profileImg) {
      profileImg.src = CONFIG.profileImage || '';
    }

    // Apply tagline from CONFIG
    const taglineText = document.getElementById('tagline-text');
    if (taglineText) {
      taglineText.textContent = CONFIG.tagline || '';
    }

    this.shortcuts.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'glass-card group relative p-1.5 w-[72px] sm:w-[84px] h-[76px] sm:h-[88px] flex flex-col items-center justify-center text-center cursor-pointer select-none';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'link');
      card.setAttribute('aria-label', `Open ${item.title}`);
      card.setAttribute('data-original-index', index);

      // Click to open URL in same tab
      card.addEventListener('click', (e) => {
        // Prevent action if clicked edit button or if currently dragging
        if (e.target.closest('.edit-btn-click')) return;
        if (window.isDraggingLayout) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        card.classList.add('active-shortcut-click');
        setTimeout(() => {
          card.classList.remove('active-shortcut-click');
          window.location.href = item.url;
        }, 120);
      });

      // Keyboard space/enter support
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (window.isDraggingLayout) return;
          window.location.href = item.url;
        }
      });

      const iconHtml = IconService.getShortcutIconHtml(item);

      card.innerHTML = `
        <button class="edit-btn-click absolute top-0.5 right-0.5 p-0.5 rounded-md hover:bg-white/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-10 text-white/60 hover:text-white" aria-label="Edit shortcut details">
          <i data-lucide="edit" class="w-3 h-3"></i>
        </button>
        <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden mb-1 shadow-inner border border-white/5 relative z-0">
          ${iconHtml}
        </div>
        <span class="text-[9px] sm:text-[10px] font-semibold tracking-tight truncate max-w-full text-white/90 group-hover:text-white">${item.title}</span>
      `;

      // Attach edit action trigger
      const editBtn = card.querySelector('.edit-btn-click');
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openEditModal(index);
      });

      this.grid.appendChild(card);
    });

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  openAddModal() {
    this.modalTitle.textContent = "Add Shortcut";
    this.editIndexInput.value = "-1";
    this.titleInput.value = "";
    this.urlInput.value = "";
    this.iconInput.value = "";
    this.deleteBtn.classList.add('hidden');

    this.modal.classList.remove('pointer-events-none');
    this.modal.classList.add('opacity-100');
    setTimeout(() => this.titleInput.focus(), 150);
  },

  openEditModal(index) {
    const item = this.shortcuts[index];
    this.modalTitle.textContent = "Edit Shortcut";
    this.editIndexInput.value = index;
    this.titleInput.value = item.title;
    this.urlInput.value = item.url;
    this.iconInput.value = item.icon || "";
    this.deleteBtn.classList.remove('hidden');

    this.modal.classList.remove('pointer-events-none');
    this.modal.classList.add('opacity-100');
    setTimeout(() => this.titleInput.focus(), 150);
  },

  closeModal() {
    this.modal.classList.add('pointer-events-none');
    this.modal.classList.remove('opacity-100');
  },

  saveShortcut() {
    const index = parseInt(this.editIndexInput.value);
    let url = this.urlInput.value.trim();

    // Enforce protocol prefix
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    const item = {
      title: this.titleInput.value.trim(),
      url: url,
      icon: this.iconInput.value.trim() || null
    };

    if (index === -1) {
      this.shortcuts.push(item);
    } else {
      this.shortcuts[index] = item;
    }

    Storage.set('dashboard_shortcuts', this.shortcuts);
    Storage.set('quickLinksOrder', this.shortcuts.map(s => s.url));
    this.render();
    this.closeModal();
  },

  deleteShortcut() {
    const index = parseInt(this.editIndexInput.value);
    if (index > -1) {
      this.shortcuts.splice(index, 1);
      Storage.set('dashboard_shortcuts', this.shortcuts);
      Storage.set('quickLinksOrder', this.shortcuts.map(s => s.url));
      this.render();
    }
    this.closeModal();
  }
};

/* ==========================================
   RANDOM QUOTE WIDGET MODULE
   ========================================== */
const QuoteModule = {
  init() {
    this.widget = document.getElementById('quote-widget');
    this.textEl = document.getElementById('quote-text');
    this.authorEl = document.getElementById('quote-author');

    if (!this.widget || !this.textEl || !this.authorEl) return;

    this.quotes = CONFIG.quotes || ["Simplicity is the ultimate sophistication. — Leonardo da Vinci"];

    this.renderRandom();

    // Click widget to transition and load another random quote
    this.widget.addEventListener('click', () => {
      this.textEl.style.opacity = '0';
      this.authorEl.style.opacity = '0';
      setTimeout(() => {
        this.renderRandom();
        this.textEl.style.opacity = '1';
        this.authorEl.style.opacity = '1';
      }, 250);
    });
  },

  renderRandom() {
    const randomIndex = Math.floor(Math.random() * this.quotes.length);
    const rawQuote = this.quotes[randomIndex];

    // Splitting quote text and author (expects format: "Quote — Author")
    const parts = rawQuote.split(' — ');
    this.textEl.textContent = `"${parts[0]}"`;
    this.authorEl.textContent = parts[1] ? `— ${parts[1]}` : '— Unknown';
  }
};

/* ==========================================
   RESET CORE MODULE
   ========================================== */
const ResetModule = {
  init() {
    this.resetBtn = document.getElementById('reset-dashboard-btn');
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        if (confirm("Reset dashboard shortcuts, background slideshow indices, and format settings to default values?")) {
          Storage.clear();
          location.reload();
        }
      });
    }
  }
};

/* ==========================================
   GOOGLE APPS LAUNCHER MODULE
   ========================================== */
const AppsLauncherModule = {
  init() {
    this.btn = document.getElementById('apps-launcher-btn');
    this.modal = document.getElementById('apps-launcher-modal');
    this.closeBtn = document.getElementById('close-apps-btn');
    this.overlay = document.getElementById('apps-modal-overlay');
    this.searchInput = document.getElementById('apps-search-input');
    this.clearSearchBtn = document.getElementById('clear-apps-search-btn');
    this.scrollContainer = document.getElementById('apps-scroll-container');

    this.favoritesGrid = document.getElementById('apps-favorites-grid');
    this.favoritesSection = document.getElementById('apps-favorites-section');
    this.allGrid = document.getElementById('apps-all-grid');
    this.restoreBtn = document.getElementById('restore-hidden-apps-btn');

    this.apps = CONFIG.googleApps || [];

    // Load local storage states
    this.pinnedApps = Storage.get('apps_pinned', ['search', 'gmail', 'drive', 'youtube']);
    this.hiddenApps = Storage.get('apps_hidden', []);

    // Load app order or default
    const defaultOrder = this.apps.map(a => a.id);
    this.appOrder = Storage.get('appLauncherOrder', defaultOrder);

    // Align order in case config apps list changed
    this.appOrder = this.appOrder.filter(id => defaultOrder.includes(id));
    defaultOrder.forEach(id => {
      if (!this.appOrder.includes(id)) {
        this.appOrder.push(id);
      }
    });

    this.searchQuery = Storage.get('apps_search_query', '');

    // Bind modal actions
    this.btn.addEventListener('click', () => this.openModal());
    this.closeBtn.addEventListener('click', () => this.closeModal());
    this.overlay.addEventListener('click', () => this.closeModal());

    // Bind search actions
    this.searchInput.value = this.searchQuery;
    this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    this.clearSearchBtn.addEventListener('click', () => {
      this.searchInput.value = '';
      this.handleSearch('');
      this.searchInput.focus();
    });

    // Bind restore action
    this.restoreBtn.addEventListener('click', () => this.restoreHidden());

    this.render();

    // Apply initial search filtering if search query was saved
    if (this.searchQuery) {
      this.handleSearch(this.searchQuery);
    }
  },

  openModal() {
    this.modal.classList.remove('pointer-events-none');
    this.modal.classList.add('opacity-100');
    // autofocus search box
    setTimeout(() => this.searchInput.focus(), 150);
  },

  closeModal() {
    this.modal.classList.add('pointer-events-none');
    this.modal.classList.remove('opacity-100');
  },

  handleSearch(query) {
    this.searchQuery = query.trim();
    Storage.set('apps_search_query', this.searchQuery);

    if (this.searchQuery !== '') {
      this.clearSearchBtn.classList.remove('opacity-0');
      this.clearSearchBtn.classList.add('opacity-100');
    } else {
      this.clearSearchBtn.classList.remove('opacity-100');
      this.clearSearchBtn.classList.add('opacity-0');
    }

    // Filter cards in both grids
    const term = this.searchQuery.toLowerCase();
    const allCards = this.modal.querySelectorAll('[data-app-id]');
    allCards.forEach(card => {
      const appName = card.querySelector('.app-title').textContent.toLowerCase();
      if (appName.includes(term)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  },

  restoreHidden() {
    this.hiddenApps = [];
    Storage.set('apps_hidden', this.hiddenApps);
    this.render();
    if (this.searchQuery) {
      this.handleSearch(this.searchQuery);
    }
  },

  togglePin(appId) {
    const idx = this.pinnedApps.indexOf(appId);
    if (idx > -1) {
      this.pinnedApps.splice(idx, 1);
    } else {
      this.pinnedApps.push(appId);
    }
    Storage.set('apps_pinned', this.pinnedApps);
    this.render();
    if (this.searchQuery) {
      this.handleSearch(this.searchQuery);
    }
  },

  hideApp(appId) {
    if (!this.hiddenApps.includes(appId)) {
      this.hiddenApps.push(appId);
      // Remove pin if hidden
      const pinIdx = this.pinnedApps.indexOf(appId);
      if (pinIdx > -1) {
        this.pinnedApps.splice(pinIdx, 1);
        Storage.set('apps_pinned', this.pinnedApps);
      }
      Storage.set('apps_hidden', this.hiddenApps);
      this.render();
      if (this.searchQuery) {
        this.handleSearch(this.searchQuery);
      }
    }
  },

  render() {
    this.favoritesGrid.innerHTML = '';
    this.allGrid.innerHTML = '';

    // Toggle restore button visibility
    if (this.hiddenApps.length > 0) {
      this.restoreBtn.classList.remove('hidden');
    } else {
      this.restoreBtn.classList.add('hidden');
    }

    // Sort all apps based on appOrder
    const sortedApps = [...this.apps].sort((a, b) => {
      return this.appOrder.indexOf(a.id) - this.appOrder.indexOf(b.id);
    });

    // Sort favorites based on pinnedApps order
    const favoriteApps = [];
    this.pinnedApps.forEach(pinnedId => {
      const app = this.apps.find(a => a.id === pinnedId);
      if (app && !this.hiddenApps.includes(pinnedId)) {
        favoriteApps.push(app);
      }
    });

    // Show/Hide Favorites section
    if (favoriteApps.length > 0) {
      this.favoritesSection.style.display = '';
      favoriteApps.forEach(app => {
        const card = this.createAppCard(app, true);
        this.favoritesGrid.appendChild(card);
      });
    } else {
      this.favoritesSection.style.display = 'none';
    }

    // Render All Apps
    sortedApps.forEach(app => {
      if (!this.hiddenApps.includes(app.id)) {
        const isPinned = this.pinnedApps.includes(app.id);
        const card = this.createAppCard(app, false, isPinned);
        this.allGrid.appendChild(card);
      }
    });

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  createAppCard(app, isFavoriteGrid = false, isPinned = false) {
    const card = document.createElement('div');
    card.className = 'glass-card launcher-app-card group relative flex flex-col items-center justify-center text-center select-none';
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-app-id', app.id);

    const starFilled = isFavoriteGrid || isPinned;
    const iconHtml = IconService.getGoogleAppIconHtml(app);

    card.innerHTML = `
      <!-- Anchor tag for standard same-tab navigation -->
      <a href="${app.url}" class="absolute inset-0 z-10 rounded-xl" aria-label="Open ${app.name}"></a>

      <!-- Hover controls -->
      <div class="absolute top-1 right-1 flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <!-- Pin/Unpin button -->
        <button class="pin-btn p-0.5 rounded hover:bg-white/10 text-white/50 hover:text-amber-400 transition-colors focus:outline-none" title="${starFilled ? 'Unpin app' : 'Pin app'}">
          <i data-lucide="star" class="w-3.5 h-3.5 ${starFilled ? 'fill-amber-400 text-amber-400' : 'text-white/60'}"></i>
        </button>
        <!-- Hide button -->
        <button class="hide-btn p-0.5 rounded hover:bg-white/10 text-white/50 hover:text-red-400 transition-colors focus:outline-none" title="Hide app">
          <i data-lucide="eye-off" class="w-3.5 h-3.5 text-white/60"></i>
        </button>
      </div>
      
      <!-- Icon -->
      <div class="launcher-icon-container w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden mb-1.5 shadow-inner border border-white/5 pointer-events-none relative z-0">
        ${iconHtml}
      </div>
      
      <!-- App Name -->
      <span class="app-title text-[9px] sm:text-[10px] font-semibold tracking-tight truncate max-w-full text-white/90 group-hover:text-white pointer-events-none relative z-0">${app.name}</span>
    `;

    // Prevent default navigation if dragging
    card.querySelector('a').addEventListener('click', (e) => {
      if (window.isDraggingLayout) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    // Pin action click
    card.querySelector('.pin-btn').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.togglePin(app.id);
    });

    // Hide action click
    card.querySelector('.hide-btn').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.hideApp(app.id);
    });

    return card;
  }
};


/* ==========================================
   DRAG & DROP LAYOUT EDIT MODULE
   ========================================== */
const LayoutEditModule = {
  init() {
    this.editBtn = document.getElementById('edit-layout-btn');
    this.editText = document.getElementById('edit-layout-text');
    this.shortcutsGrid = document.getElementById('shortcuts-grid');
    this.favoritesGrid = document.getElementById('apps-favorites-grid');
    this.allGrid = document.getElementById('apps-all-grid');

    window.layoutEditMode = false;
    window.isDraggingLayout = false;

    if (!this.editBtn) return;

    // Bind Toggle Button click
    this.editBtn.addEventListener('click', () => this.toggleEditMode());

    // Initialize SortableJS instances
    this.initSortables();
  },

  initSortables() {
    const self = this;

    const baseOptions = {
      animation: 200,
      disabled: true,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      delay: 150,
      delayOnTouchOnly: true,
      onStart: () => {
        window.isDraggingLayout = true;
      },
      onEnd: () => {
        setTimeout(() => {
          window.isDraggingLayout = false;
        }, 50);
      }
    };

    // 1. Quick Links Sortable
    if (this.shortcutsGrid) {
      this.shortcutsSortable = new Sortable(this.shortcutsGrid, {
        ...baseOptions,
        onEnd: (evt) => {
          baseOptions.onEnd();
          self.saveShortcutsOrder();
        }
      });
    }

    // 2. Google Apps Favorites Sortable
    if (this.favoritesGrid) {
      this.favoritesSortable = new Sortable(this.favoritesGrid, {
        ...baseOptions,
        onEnd: (evt) => {
          baseOptions.onEnd();
          self.saveAppsOrder();
        }
      });
    }

    // 3. Google Apps All Sortable
    if (this.allGrid) {
      this.allAppsSortable = new Sortable(this.allGrid, {
        ...baseOptions,
        onEnd: (evt) => {
          baseOptions.onEnd();
          self.saveAppsOrder();
        }
      });
    }
  },

  toggleEditMode() {
    window.layoutEditMode = !window.layoutEditMode;
    
    // Toggle active classes
    document.body.classList.toggle('edit-mode-active', window.layoutEditMode);
    this.editBtn.classList.toggle('edit-layout-active-btn', window.layoutEditMode);

    // Update text and icon
    if (window.layoutEditMode) {
      this.editText.textContent = "Done";
      const icon = this.editBtn.querySelector('i');
      if (icon && typeof lucide !== 'undefined') {
        icon.setAttribute('data-lucide', 'check');
        lucide.createIcons({ attrs: { class: 'w-4 h-4 text-white/70 group-hover:scale-110 transition-transform' } });
      }
    } else {
      this.editText.textContent = "Edit Layout";
      const icon = this.editBtn.querySelector('i');
      if (icon && typeof lucide !== 'undefined') {
        icon.setAttribute('data-lucide', 'edit-3');
        lucide.createIcons({ attrs: { class: 'w-4 h-4 text-white/70 group-hover:scale-110 transition-transform' } });
      }
    }

    // Enable / Disable Sortable instances
    if (this.shortcutsSortable) this.shortcutsSortable.option('disabled', !window.layoutEditMode);
    if (this.favoritesSortable) this.favoritesSortable.option('disabled', !window.layoutEditMode);
    if (this.allAppsSortable) this.allAppsSortable.option('disabled', !window.layoutEditMode);
  },

  saveShortcutsOrder() {
    if (!this.shortcutsGrid) return;
    const cards = Array.from(this.shortcutsGrid.children);
    
    // Map cards to the original shortcuts array using in-place indices
    const originalShortcuts = ShortcutsModule.shortcuts;
    const newShortcuts = cards.map(card => {
      const originalIndex = parseInt(card.getAttribute('data-original-index'));
      return originalShortcuts[originalIndex];
    }).filter(Boolean);

    ShortcutsModule.shortcuts = newShortcuts;
    Storage.set('dashboard_shortcuts', ShortcutsModule.shortcuts);

    // Save separately to quickLinksOrder as required
    const quickLinksOrder = ShortcutsModule.shortcuts.map(s => s.url);
    Storage.set('quickLinksOrder', quickLinksOrder);

    // Update data-original-index attributes in place to sync
    cards.forEach((card, idx) => {
      card.setAttribute('data-original-index', idx);
    });

    console.log('[LayoutEditModule] Saved Quick Links layout:', quickLinksOrder);
  },

  saveAppsOrder() {
    // 1. Save Favorites order
    if (this.favoritesGrid) {
      const favoriteCards = Array.from(this.favoritesGrid.children);
      const newFavoritesOrder = favoriteCards.map(c => c.getAttribute('data-app-id')).filter(Boolean);
      AppsLauncherModule.pinnedApps = newFavoritesOrder;
      Storage.set('apps_pinned', AppsLauncherModule.pinnedApps);
    }

    // 2. Save All apps order
    if (this.allGrid) {
      const allCards = Array.from(this.allGrid.children);
      const newAllOrder = allCards.map(c => c.getAttribute('data-app-id')).filter(Boolean);

      const currentOrderSet = new Set(newAllOrder);
      const fullOrder = [...newAllOrder];

      AppsLauncherModule.appOrder.forEach(id => {
        if (!currentOrderSet.has(id)) {
          fullOrder.push(id);
        }
      });

      AppsLauncherModule.appOrder = fullOrder;
      Storage.set('appLauncherOrder', AppsLauncherModule.appOrder);
    }

    console.log('[LayoutEditModule] Saved App Launcher layout:', AppsLauncherModule.appOrder);
  }
};
