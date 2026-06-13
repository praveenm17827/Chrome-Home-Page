/**
 * Chrome Home Page - Configuration Settings
 * Contains all editable configuration for the homepage.
 */

const CONFIG = {
  userName: "MR. STARK",
  tagline: "Build. Learn. Create.",
  profileImage: "https://ik.imagekit.io/Praveen1708/Chrome%20Home%20Page/Background%20Images/My%20Pic.jpeg",

  // Fullscreen cinematic background images (Premium Dark Theme Unsplash CDNs)
  slideshowImages: [
    "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&w=1920&q=80", // Milky Way Starry Night
    "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&w=1920&q=80", // Dark Mountain Lake
    // https://plus.unsplash.com/premium_photo-1675873580289-213b32be1f1a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fGRhcmslMjBuYXR1cmV8ZW58MHx8MHx8fDA%3D
  ],

  // Default Chrome-inspired shortcuts (12-16)
  shortcuts: [
    { title: "YouTube", url: "https://youtube.com" },
    { title: "ChatGPT", url: "https://chatgpt.com" },
    { title: "GitHub", url: "https://github.com" },
    { title: "LinkedIn", url: "https://www.linkedin.com/in/praveenm1708/" },
    { title: "My Portfolio", url: "https://praveenmurugan.me/" },
    { title: "LeetCode", url: "https://leetcode.com/problemset/" },
    { title: "Overleaf", url: "https://www.overleaf.com/project" },
    { title: "Gemini", url: "https://gemini.google.com/app?is_sa=1&is_sa=1&android-min-version=301356232&ios-min-version=322.0&campaign_id=bkws&utm_source=sem&utm_source=google&utm_medium=paid-media&utm_medium=cpc&utm_campaign=bkws&utm_campaign=2024enIN_gemfeb&pt=9008&mt=8&ct=p-growth-sem-bkws&gad_source=1&gclid=CjwKCAiA2cu9BhBhEiwAft6IxLDtie60dqbStE11pGlEa6ZU4XbU9q8jUchN3uWUCFB17H3gCm5dWhoCkqIQAvD_BwE&gclsrc=aw.ds" },
    { title: "Whatsapp", url: "https://web.whatsapp.com/" }
  ],

  // Google Apps configuration for the Google App Launcher (9-Dot Apps Menu)
  googleApps: [
    { id: "account", name: "Account", domain: "myaccount.google.com", url: "https://myaccount.google.com" },
    { id: "search", name: "Search", domain: "google.com", url: "https://google.com" },
    { id: "gmail", name: "Gmail", domain: "mail.google.com", url: "https://mail.google.com" },
    { id: "youtube", name: "YouTube", domain: "youtube.com", url: "https://youtube.com" },
    { id: "gemini", name: "Gemini", domain: "gemini.google.com", url: "https://gemini.google.com" },
    { id: "maps", name: "Maps", domain: "maps.google.com", url: "https://maps.google.com" },
    { id: "drive", name: "Drive", domain: "drive.google.com", url: "https://drive.google.com" },
    { id: "calendar", name: "Calendar", domain: "calendar.google.com", url: "https://calendar.google.com" },
    { id: "news", name: "News", domain: "news.google.com", url: "https://news.google.com" },
    { id: "photos", name: "Photos", domain: "photos.google.com", url: "https://photos.google.com" },
    { id: "meet", name: "Meet", domain: "meet.google.com", url: "https://meet.google.com" },
    { id: "translate", name: "Translate", domain: "translate.google.com", url: "https://translate.google.com" },
    { id: "slides", name: "Slides", domain: "slides.google.com", url: "https://slides.google.com" },
    { id: "google-one", name: "Google One", domain: "one.google.com", url: "https://one.google.com" },
    { id: "shopping", name: "Shopping", domain: "shopping.google.com", url: "https://shopping.google.com" },
    { id: "store", name: "Store", domain: "store.google.com", url: "https://store.google.com" },
    { id: "play", name: "Play", domain: "play.google.com", url: "https://play.google.com" },
    { id: "finance", name: "Finance", domain: "finance.google.com", url: "https://finance.google.com" },
    { id: "keep", name: "Keep", domain: "keep.google.com", url: "https://keep.google.com" },
    { id: "my-ad-center", name: "My Ad Center", domain: "myadcenter.google.com", url: "https://myadcenter.google.com" },
    { id: "classroom", name: "Classroom", domain: "classroom.google.com", url: "https://classroom.google.com" },
    { id: "chat", name: "Chat", domain: "chat.google.com", url: "https://chat.google.com" },
    { id: "earth", name: "Earth", domain: "earth.google.com", url: "https://earth.google.com" },
    { id: "saved", name: "Saved", domain: "www.google.com/save", url: "https://www.google.com/save" },
    { id: "arts-culture", name: "Arts & Culture", domain: "artsandculture.google.com", url: "https://artsandculture.google.com" },
    { id: "google-ads", name: "Google Ads", domain: "ads.google.com", url: "https://ads.google.com" },
    { id: "merchant-center", name: "Merchant Center", domain: "merchants.google.com", url: "https://merchants.google.com" },
    { id: "contacts", name: "Contacts", domain: "contacts.google.com", url: "https://contacts.google.com" },
    { id: "travel", name: "Travel", domain: "travel.google.com", url: "https://travel.google.com" },
    { id: "forms", name: "Forms", domain: "forms.google.com", url: "https://forms.google.com" },
    { id: "books", name: "Books", domain: "books.google.com", url: "https://books.google.com" },
    { id: "chrome-web-store", name: "Chrome Web Store", domain: "chromewebstore.google.com", url: "https://chromewebstore.google.com" },
    { id: "password-manager", name: "Password Manager", domain: "passwords.google.com", url: "https://passwords.google.com" },
    { id: "google-analytics", name: "Google Analytics", domain: "analytics.google.com", url: "https://analytics.google.com" },
    { id: "blogger", name: "Blogger", domain: "blogger.com", url: "https://blogger.com" },
    { id: "youtube-music", name: "YouTube Music", domain: "music.youtube.com", url: "https://music.youtube.com" },
    { id: "wallet", name: "Wallet", domain: "wallet.google.com", url: "https://wallet.google.com" },
    { id: "notebooklm", name: "NotebookLM", domain: "notebooklm.google.com", url: "https://notebooklm.google.com" },
    { id: "tasks", name: "Tasks", domain: "tasks.google.com", url: "https://tasks.google.com" },
    { id: "docs", name: "Docs", domain: "docs.google.com", url: "https://docs.google.com/document/u/0/" }
  ],
};
