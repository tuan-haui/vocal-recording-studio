import { Injectable, signal, computed } from '@angular/core';

type Lang = 'vi' | 'en';

export const TRANSLATIONS = {
  vi: {
    // Header & Layout
    'APP_NAME': 'Nutiz Musicbox',
    'MIC_CONNECTED': 'Mic đã kết nối',
    'MIC_DISCONNECTED': 'Chưa cấp quyền mic',
    'YOUTUBE_TAB': 'YouTube',
    'LOCAL_TAB': 'Beat máy',
    'FAVORITES_TAB': 'Yêu thích',
    'LISTEN_MODE': 'Nghe nhạc',
    'BACK': 'Quay lại',
    'CHOOSE_SONG': 'Chọn bài',
    'HOME': 'Trang chủ',
    'SONGS': 'Bài hát',
    'LIBRARY': 'Thư viện',

    // Youtube Search Modal
    'SEARCH_PLACEHOLDER': 'Tìm bài hát trên YouTube',
    'SEARCHING': 'Đang tìm kiếm...',
    'SEARCH_ERROR': 'Không thể tải kết quả tìm kiếm.',
    'KARAOKE_TOGGLE': 'Karaoke',
    'KARAOKE_TOGGLE_TITLE': 'Bật/tắt tự động thêm chữ "karaoke" vào từ khóa tìm kiếm',
    'UNFAVORITE': 'Bỏ thích',
    'FAVORITE': 'Thêm vào yêu thích',

    // Local Beat
    'UPLOAD_LOCAL_TITLE': 'Tải beat từ máy tính',
    'UPLOAD_LOCAL_SUB': 'Hỗ trợ file MP3, WAV, AAC, M4A, MP4',
    'CHOOSE_FILE': 'Chọn file',
    'UPLOADED_LIST': 'Danh sách beat đã tải',
    'LOCAL_VIDEO': 'Video từ máy',
    'LOCAL_AUDIO': 'Beat âm thanh từ máy',
    'EMPTY_LOCAL_TITLE': 'Chưa có beat nào',
    'EMPTY_LOCAL_HINT': 'Nhấn vào ô trên để tải beat nhạc từ thiết bị của bạn.',

    // Favorites
    'FAVORITES_PLAYLIST': 'Playlist yêu thích',
    'EXPAND': 'Mở rộng',
    'REMOVE_FAVORITE': 'Xóa khỏi yêu thích',
    'EMPTY_FAV_TITLE': 'Danh sách yêu thích trống',
    'EMPTY_FAV_HINT': 'Nhấn biểu tượng trái tim (❤️) trên bất kỳ bài hát nào để lưu vào đây nghe bất cứ lúc nào!',
    'EMPTY_FAV_LISTEN_HINT': 'Hãy quay lại Studio và thả tim cho các bài hát để tạo playlist nhé!',

    // Player
    'PREV_SONG': 'Bài trước',
    'NEXT_SONG': 'Bài tiếp theo',
    'PLAY': 'Phát',
    'PAUSE': 'Tạm dừng',
    'AUTOPLAY_ON': 'Tự chuyển bài tiếp theo: BẬT',
    'AUTOPLAY_OFF': 'Tự chuyển bài tiếp theo: TẮT',
    'MUTE_TOGGLE': 'Bật/Tắt âm lượng',
    'NOW_PLAYING': 'Đang phát:',
    'LOCAL_BEAT_TAG': 'Beat nhạc từ thiết bị',
    'EMPTY_PLAYER_MSG': 'Chọn bài hát từ YouTube hoặc tải beat từ máy tính để bắt đầu',
    'PLAYLIST_YOURS': 'Playlist của bạn',

    // Recorder
    'MIC_ENABLE': 'Bật Microphone',
    'GET_READY': 'Chuẩn bị...',
    'INPUT_LEVEL': 'Âm lượng Input',
    'RECORD_BTN': 'Thu âm',
    'STOP_BTN': 'Dừng thu',
    
    // Current Take
    'EMPTY_TAKES_TITLE': 'Chưa có bản thu nào',
    'EMPTY_TAKES_HINT': 'Nhấn Thu âm và hát cùng bài đang phát.',
    'TAKE_LABEL': 'Bản thu chưa lưu',
    'SAVE': 'Lưu về máy',
    'DELETE': 'Xóa bỏ',
    'RERECORD': 'Thu âm lại',

    // Guard Modal
    'GUARD_TITLE': '⚠️ Cảnh báo bản thu',
    'GUARD_MSG': 'Bạn đang có một bản thu chưa được lưu. Nếu chuyển bài hát mới, bản thu này sẽ bị mất.',
    'GUARD_SAVE_CONT': 'Lưu bản thu & Chuyển bài',
    'GUARD_DISCARD_CONT': 'Xóa bản thu & Chuyển bài',
    'GUARD_CANCEL': 'Hủy (Ở lại bài hiện tại)'
  },
  en: {
    // Header & Layout
    'APP_NAME': 'Nutiz Musicbox',
    'MIC_CONNECTED': 'Mic Connected',
    'MIC_DISCONNECTED': 'Mic Permission Denied',
    'YOUTUBE_TAB': 'YouTube',
    'LOCAL_TAB': 'Local Beat',
    'FAVORITES_TAB': 'Favorites',
    'LISTEN_MODE': 'Listen Mode',
    'BACK': 'Back',
    'CHOOSE_SONG': 'Choose Song',
    'HOME': 'Home',
    'SONGS': 'Songs',
    'LIBRARY': 'Library',

    // Youtube Search Modal
    'SEARCH_PLACEHOLDER': 'Search for a song on YouTube',
    'SEARCHING': 'Searching...',
    'SEARCH_ERROR': 'Cannot load search results.',
    'KARAOKE_TOGGLE': 'Karaoke',
    'KARAOKE_TOGGLE_TITLE': 'Toggle auto-appending "karaoke" to search query',
    'UNFAVORITE': 'Unfavorite',
    'FAVORITE': 'Add to favorites',

    // Local Beat
    'UPLOAD_LOCAL_TITLE': 'Upload local beat',
    'UPLOAD_LOCAL_SUB': 'Supports MP3, WAV, AAC, M4A, MP4',
    'CHOOSE_FILE': 'Choose File',
    'UPLOADED_LIST': 'Uploaded Beats',
    'LOCAL_VIDEO': 'Local Video',
    'LOCAL_AUDIO': 'Local Audio',
    'EMPTY_LOCAL_TITLE': 'No local beats',
    'EMPTY_LOCAL_HINT': 'Click the area above to upload a beat from your device.',

    // Favorites
    'FAVORITES_PLAYLIST': 'Favorites Playlist',
    'EXPAND': 'Expand',
    'REMOVE_FAVORITE': 'Remove from favorites',
    'EMPTY_FAV_TITLE': 'Favorites list is empty',
    'EMPTY_FAV_HINT': 'Click the heart icon (❤️) on any song to save it here for later!',
    'EMPTY_FAV_LISTEN_HINT': 'Go back to Studio and like some songs to create your playlist!',

    // Player
    'PREV_SONG': 'Previous track',
    'NEXT_SONG': 'Next track',
    'PLAY': 'Play',
    'PAUSE': 'Pause',
    'AUTOPLAY_ON': 'Auto-next track: ON',
    'AUTOPLAY_OFF': 'Auto-next track: OFF',
    'MUTE_TOGGLE': 'Toggle mute',
    'NOW_PLAYING': 'Now playing:',
    'LOCAL_BEAT_TAG': 'Local device beat',
    'EMPTY_PLAYER_MSG': 'Select a song from YouTube or upload a local beat to start',
    'PLAYLIST_YOURS': 'Your Playlist',

    // Recorder
    'MIC_ENABLE': 'Enable Microphone',
    'GET_READY': 'Get Ready...',
    'INPUT_LEVEL': 'Input Level',
    'RECORD_BTN': 'Record',
    'STOP_BTN': 'Stop',
    
    // Current Take
    'EMPTY_TAKES_TITLE': 'No recordings yet',
    'EMPTY_TAKES_HINT': 'Click Record and sing along with the playing song.',
    'TAKE_LABEL': 'Unsaved Take',
    'SAVE': 'Save to device',
    'DELETE': 'Delete',
    'RERECORD': 'Re-record',

    // Guard Modal
    'GUARD_TITLE': '⚠️ Recording Warning',
    'GUARD_MSG': 'You have an unsaved recording. If you switch to a new song, this recording will be lost.',
    'GUARD_SAVE_CONT': 'Save Take & Switch',
    'GUARD_DISCARD_CONT': 'Delete Take & Switch',
    'GUARD_CANCEL': 'Cancel (Stay on current song)'
  }
};

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  private readonly LANG_KEY = 'vocal_studio_lang';
  
  currentLang = signal<Lang>(this.loadLang());

  constructor() { }

  private loadLang(): Lang {
    const saved = localStorage.getItem(this.LANG_KEY);
    if (saved === 'en' || saved === 'vi') return saved as Lang;
    return 'vi'; // Default
  }

  setLang(lang: Lang) {
    this.currentLang.set(lang);
    localStorage.setItem(this.LANG_KEY, lang);
  }

  toggleLang() {
    this.setLang(this.currentLang() === 'vi' ? 'en' : 'vi');
  }

  // Synchronous translation for templates
  get(key: keyof typeof TRANSLATIONS['vi']): string {
    const lang = this.currentLang();
    return TRANSLATIONS[lang][key] || key;
  }
}
