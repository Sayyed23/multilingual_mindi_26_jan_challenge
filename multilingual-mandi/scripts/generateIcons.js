// Icon Generation Script for PWA
// Generates placeholder icons for the Multilingual Mandi Platform

import fs from 'fs';
import path from 'path';

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(process.cwd(), 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icon template
function generateSVGIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#059669;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#047857;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
  <g transform="translate(${size * 0.2}, ${size * 0.2})">
    <!-- Leaf icon representing agriculture -->
    <path d="M${size * 0.3} ${size * 0.1} Q${size * 0.5} ${size * 0.05} ${size * 0.6} ${size * 0.3} Q${size * 0.55} ${size * 0.5} ${size * 0.3} ${size * 0.45} Q${size * 0.15} ${size * 0.3} ${size * 0.3} ${size * 0.1}Z" fill="white" opacity="0.9"/>
    <!-- Market/building icon -->
    <rect x="${size * 0.1}" y="${size * 0.35}" width="${size * 0.15}" height="${size * 0.25}" fill="white" opacity="0.8"/>
    <rect x="${size * 0.3}" y="${size * 0.35}" width="${size * 0.15}" height="${size * 0.25}" fill="white" opacity="0.8"/>
    <rect x="${size * 0.5}" y="${size * 0.35}" width="${size * 0.15}" height="${size * 0.25}" fill="white" opacity="0.8"/>
    <!-- Roof -->
    <polygon points="${size * 0.05},${size * 0.35} ${size * 0.35},${size * 0.25} ${size * 0.65},${size * 0.35}" fill="white" opacity="0.9"/>
  </g>
</svg>`;
}

// Generate icons for each size
iconSizes.forEach(size => {
  const svgContent = generateSVGIcon(size);
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  
  fs.writeFileSync(svgPath, svgContent);
  console.log(`Generated icon-${size}x${size}.svg`);
});

// Generate additional icons for shortcuts and badges
const shortcutIcons = [
  { name: 'shortcut-prices', icon: 'chart' },
  { name: 'shortcut-deals', icon: 'handshake' },
  { name: 'shortcut-messages', icon: 'message' }
];

shortcutIcons.forEach(({ name, icon }) => {
  const svgContent = generateShortcutIcon(96, icon);
  const svgPath = path.join(iconsDir, `${name}.svg`);
  fs.writeFileSync(svgPath, svgContent);
  console.log(`Generated ${name}.svg`);
});

// Generate badge icon
const badgeContent = generateBadgeIcon(72);
const badgePath = path.join(iconsDir, 'badge-72x72.svg');
fs.writeFileSync(badgePath, badgeContent);
console.log('Generated badge-72x72.svg');

function generateShortcutIcon(size, iconType) {
  let iconPath = '';
  
  switch (iconType) {
    case 'chart':
      iconPath = `<path d="M${size * 0.2} ${size * 0.7} L${size * 0.4} ${size * 0.5} L${size * 0.6} ${size * 0.6} L${size * 0.8} ${size * 0.3}" stroke="white" stroke-width="3" fill="none"/>`;
      break;
    case 'handshake':
      iconPath = `<path d="M${size * 0.2} ${size * 0.5} Q${size * 0.5} ${size * 0.3} ${size * 0.8} ${size * 0.5}" stroke="white" stroke-width="3" fill="none"/>`;
      break;
    case 'message':
      iconPath = `<rect x="${size * 0.2}" y="${size * 0.3}" width="${size * 0.6}" height="${size * 0.4}" rx="${size * 0.05}" fill="white" opacity="0.9"/>`;
      break;
  }
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#059669"/>
  ${iconPath}
</svg>`;
}

function generateBadgeIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.4}" fill="#059669"/>
  <text x="${size/2}" y="${size * 0.6}" text-anchor="middle" fill="white" font-size="${size * 0.3}" font-weight="bold">M</text>
</svg>`;
}

console.log('All PWA icons generated successfully!');