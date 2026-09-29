const fs = require('fs');
const path = 'c:/Users/CterBoy/Downloads/vocal-recording-studio/src/styles.scss';
let content = fs.readFileSync(path, 'utf8');

// 1. Update Tokens
content = content.replace(
  /\$plum-900: #140c22;\s*\$plum-800: #1d1231;\s*\$plum-700: #2a1b45;/,
  `$plum-900: #0a0b1a;\n$plum-800: #12132b;\n$plum-700: #1a1c3d;\n$indigo: #5c33ff;\n$purple: #a64aff;`
);

// 2. Background update
content = content.replace(
  /radial-gradient\(60vw 40vh at 75% -10%, rgba\(\$neon, \.22\), transparent 70%\),\s*radial-gradient\(50vw 40vh at 0% 100%, rgba\(\$amber, \.10\), transparent 70%\),\s*\$plum-900;/g,
  `radial-gradient(60vw 40vh at 75% -10%, rgba($purple, .15), transparent 70%),
    radial-gradient(50vw 40vh at 0% 100%, rgba($indigo, .15), transparent 70%),
    $plum-900;`
);

// 3. Bottom nav
const bottomNavStr = `
// ============ Bottom Nav (Mobile) ============
.bottom-nav {
  display: none;
  @include down($bp-mobile) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    background: rgba($plum-900, 0.95);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(#fff, 0.05);
    padding: 12px 24px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    justify-content: space-around;
    align-items: center;

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: $ink-dim;
      font-size: 0.75rem;
      text-decoration: none;
      
      &.active {
        color: $neon;
      }
      
      i {
        font-size: 1.2rem;
      }
    }
  }
}
`;
content += '\n' + bottomNavStr;

// 4. Update Player
content = content.replace(
  /\.player \{\s*overflow: hidden;\s*background: rgba\(\$plum-800, \.7\);\s*border: 1px solid rgba\(#fff, \.07\);\s*border-radius: \$radius-lg;/,
  `.player {
  overflow: hidden;
  background: rgba($plum-800, .7);
  border: 1px solid rgba(#fff, .07);
  border-radius: $radius-lg;
  
  @include down($bp-mobile) {
    display: flex;
    flex-direction: column;
    background: transparent;
    border: none;
    border-radius: 0;
    overflow: visible;
  }`
);

// .player__screen
content = content.replace(
  /&__screen \{\s*position: relative;\s*aspect-ratio: 16 \/ 9;\s*background: #000;\s*overflow: hidden;/,
  `&__screen {
    position: relative;
    aspect-ratio: 16 / 9;
    background: #000;
    overflow: hidden;
    @include down($bp-mobile) {
      order: 1;
      width: 100%;
      border-radius: 24px;
      box-shadow: 0 16px 40px rgba(#000, 0.5), 0 0 20px rgba($indigo, 0.2);
      margin-top: 20px;
    }`
);

// .player__now
content = content.replace(
  /&__now \{\s*margin: 0; padding: 10px 16px;\s*font-size: \.8rem; color: \$ink-dim;\s*background: rgba\(#000, \.2\);\s*white-space: nowrap; overflow: hidden; text-overflow: ellipsis;\s*span \{ color: \$amber; font-weight: 600; margin-right: 8px; \}/,
  `&__now {
    margin: 0; padding: 10px 16px;
    font-size: .8rem; color: $ink-dim;
    background: rgba(#000, .2);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    span { color: $amber; font-weight: 600; margin-right: 8px; }

    @include down($bp-mobile) {
      order: 2;
      background: transparent;
      text-align: center;
      font-size: 1.2rem;
      font-weight: 700;
      color: $ink;
      padding: 16px 0 0 0;
      white-space: normal;
      
      span { display: none; }
      i { display: none; }
    }`
);

// .player__bar
content = content.replace(
  /&__bar \{\s*display: flex; align-items: center; gap: 12px;\s*padding: 12px 16px;\s*@include down\(\$bp-mobile\) \{ gap: 8px; padding: 10px 12px; \}\s*\}/,
  `&__bar {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px;
    
    @include down($bp-mobile) { 
      order: 3;
      display: grid;
      grid-template-columns: auto 1fr auto;
      grid-template-areas: 
        "time-start progress time-end"
        "controls controls controls"
        "actions actions actions";
      gap: 16px;
      width: 100%;
      padding: 24px 0;
      
      > div:first-child { 
        grid-area: controls; 
        justify-content: center;
        gap: 24px;
      }
      
      > .time:first-of-type { grid-area: time-start; }
      > .range:not(.range--volume) { grid-area: progress; align-self: center; }
      > .time:last-of-type { grid-area: time-end; }
      
      > div:last-child { 
        grid-area: actions; 
        justify-content: center;
      }
    }
  }`
);

// .icon-btn
content = content.replace(
  /\.icon-btn \{/,
  `.icon-btn {
  &--play {
    @include down($bp-mobile) {
      width: 64px !important;
      height: 64px !important;
      background: $indigo !important;
      font-size: 1.5rem !important;
      box-shadow: 0 8px 24px rgba($indigo, 0.4) !important;
    }
  }`
);

// .rec__controls
content = content.replace(
  /&__controls \{\s*display: flex; align-items: center; justify-content: center; gap: clamp\(20px, 6vw, 56px\);\s*@include down\(\$bp-mobile\) \{ flex-direction: column; gap: 16px; \}/,
  `&__controls {
    display: flex; align-items: center; justify-content: center; gap: clamp(20px, 6vw, 56px);
    @include down($bp-mobile) {
      flex-direction: row;
      justify-content: space-evenly;
      gap: 16px;
      padding: 32px 0;
    }`
);

// .rec-btn
content = content.replace(
  /\.rec-btn \{\s*display: inline-flex; align-items: center; gap: 12px;\s*padding: 16px 32px; border: 0; border-radius: 999px;\s*background: \$neon; color: #fff; font-weight: 800; font-size: 1\.05rem;\s*box-shadow: 0 0 0 0 rgba\(\$neon, \.5\), 0 10px 30px rgba\(\$neon, \.35\);\s*transition: transform \.15s;\s*@include focus-ring;\s*&:active \{ transform: scale\(\.97\); \}\s*@include down\(\$bp-mobile\) \{ width: 100%; justify-content: center; \}/,
  `.rec-btn {
  display: inline-flex; align-items: center; gap: 12px;
  padding: 16px 32px; border: 0; border-radius: 999px;
  background: $neon; color: #fff; font-weight: 800; font-size: 1.05rem;
  box-shadow: 0 0 0 0 rgba($neon, .5), 0 10px 30px rgba($neon, .35);
  transition: transform .15s;
  @include focus-ring;

  &:active { transform: scale(.97); }
  @include down($bp-mobile) { 
    width: 80px; 
    height: 80px; 
    border-radius: 50%; 
    padding: 0; 
    justify-content: center;
    background: #ff3333;
    box-shadow: 0 0 0 0 rgba(#ff3333, .5), 0 10px 30px rgba(#ff3333, .35);
    
    .rec-btn__label { display: none; }
    i { font-size: 1.8rem; margin: 0; }
  }`
);

fs.writeFileSync(path, content, 'utf8');
