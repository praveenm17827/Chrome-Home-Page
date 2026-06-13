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
      // Clean domain URL for Google Favicon extractor fallback
      const domain = item.url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
      const faviconUrl = item.icon && item.icon.trim() !== "" 
        ? item.icon 
        : `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

      const card = document.createElement('div');
      card.className = 'glass-card group relative p-1.5 w-[72px] sm:w-[84px] h-[76px] sm:h-[88px] flex flex-col items-center justify-center text-center cursor-pointer select-none';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'link');
      card.setAttribute('aria-label', `Open ${item.title}`);

      // Click to open URL in new tab
      card.addEventListener('click', (e) => {
        // Prevent action if clicked edit button
        if (e.target.closest('.edit-btn-click')) return;
        card.classList.add('active-shortcut-click');
        setTimeout(() => {
          card.classList.remove('active-shortcut-click');
          window.open(item.url, '_blank', 'noopener,noreferrer');
        }, 120);
      });

      // Keyboard space/enter support
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.open(item.url, '_blank', 'noopener,noreferrer');
        }
      });

      card.innerHTML = `
        <button class="edit-btn-click absolute top-0.5 right-0.5 p-0.5 rounded-md hover:bg-white/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-10 text-white/60 hover:text-white" aria-label="Edit shortcut details">
          <i data-lucide="edit" class="w-3 h-3"></i>
        </button>
        <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden mb-1 shadow-inner border border-white/5">
          <img src="${faviconUrl}" alt="" onerror="this.src='https://unpkg.com/lucide-static@latest/icons/globe.svg';" class="w-5 h-5 object-contain">
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
    this.render();
    this.closeModal();
  },

  deleteShortcut() {
    const index = parseInt(this.editIndexInput.value);
    if (index > -1) {
      this.shortcuts.splice(index, 1);
      Storage.set('dashboard_shortcuts', this.shortcuts);
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
    this.appOrder = Storage.get('apps_order', defaultOrder);
    
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
    
    // Bind Drag & Drop Events
    this.setupDragAndDrop();
    
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },
  
  createAppCard(app, isFavoriteGrid = false, isPinned = false) {
    const card = document.createElement('div');
    card.className = 'glass-card group relative p-2.5 flex flex-col items-center justify-center text-center cursor-pointer select-none';
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-app-id', app.id);
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'link');
    card.setAttribute('aria-label', `Open ${app.name}`);
    
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${app.domain}&sz=64`;
    const starFilled = isFavoriteGrid || isPinned;
    
    card.innerHTML = `
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
      <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden mb-1.5 shadow-inner border border-white/5 pointer-events-none">
        <img src="${faviconUrl}" alt="" onerror="this.src='https://unpkg.com/lucide-static@latest/icons/globe.svg';" class="w-5 h-5 sm:w-6 sm:h-6 object-contain">
      </div>
      
      <!-- App Name -->
      <span class="app-title text-[9px] sm:text-[10px] font-semibold tracking-tight truncate max-w-full text-white/90 group-hover:text-white pointer-events-none">${app.name}</span>
    `;
    
    // Click card opens link in new tab
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      window.open(app.url, '_blank', 'noopener,noreferrer');
    });
    
    // Keyboard support
    card.addEventListener('keydown', (e) => {
      if (e.target.closest('button')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.open(app.url, '_blank', 'noopener,noreferrer');
      }
    });
    
    // Pin action click
    card.querySelector('.pin-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePin(app.id);
    });
    
    // Hide action click
    card.querySelector('.hide-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.hideApp(app.id);
    });
    
    return card;
  },
  
  setupDragAndDrop() {
    let draggedItem = null;
    const self = this;
    
    const grids = [this.favoritesGrid, this.allGrid];
    
    grids.forEach(grid => {
      const cards = grid.querySelectorAll('[draggable="true"]');
      
      cards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
          draggedItem = card;
          card.classList.add('app-card-dragging');
          e.dataTransfer.effectAllowed = 'move';
        });
        
        card.addEventListener('dragend', () => {
          if (draggedItem) {
            draggedItem.classList.remove('app-card-dragging');
          }
          draggedItem = null;
          self.saveOrders();
        });
        
        card.addEventListener('dragover', (e) => {
          e.preventDefault();
        });
        
        card.addEventListener('dragenter', (e) => {
          e.preventDefault();
          if (draggedItem && draggedItem !== card) {
            const draggedGrid = draggedItem.parentNode;
            const targetGrid = card.parentNode;
            
            // Reorder dynamically inside same grid container
            if (draggedGrid === targetGrid) {
              const children = Array.from(targetGrid.children);
              const draggedIndex = children.indexOf(draggedItem);
              const targetIndex = children.indexOf(card);
              
              if (draggedIndex < targetIndex) {
                targetGrid.insertBefore(draggedItem, card.nextSibling);
              } else {
                targetGrid.insertBefore(draggedItem, card);
              }
            }
          }
        });
      });
    });
  },
  
  saveOrders() {
    // Save favorites order
    const favoriteCards = Array.from(this.favoritesGrid.children);
    const newFavoritesOrder = favoriteCards.map(c => c.getAttribute('data-app-id'));
    this.pinnedApps = newFavoritesOrder;
    Storage.set('apps_pinned', this.pinnedApps);
    
    // Save all apps order
    const allCards = Array.from(this.allGrid.children);
    const newAllOrder = allCards.map(c => c.getAttribute('data-app-id'));
    
    const currentOrderSet = new Set(newAllOrder);
    const fullOrder = [...newAllOrder];
    
    this.appOrder.forEach(id => {
      if (!currentOrderSet.has(id)) {
        fullOrder.push(id);
      }
    });
    
    this.appOrder = fullOrder;
    Storage.set('apps_order', this.appOrder);
  }
};
