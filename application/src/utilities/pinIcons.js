/**
 * Builds a round marker image (SVG data URL) for deck.gl's IconLayer.
 *
 * @param {string} fill - Circle colour.
 * @param {string} icon - SVG markup of the icon, drawn in a 24 x 24 box.
 * @returns {string} The image URL.
 */
const pinUrl = (fill, icon) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.6" fill="${fill}" stroke="#0b1020" stroke-width="1.6"/><g transform="translate(6 6) scale(0.5)">${icon}</g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

// Two water drops, the big one with a light glint
const FLOOD_ICON = `<g fill="#ffffff"><path d="M10 3c0 0 -6 7 -6 11.5a6 6 0 0 0 12 0c0 -4.5 -6 -11.5 -6 -11.5z"/><path d="M18.5 2.5c0 0 -3 3.6 -3 5.8a3 3 0 0 0 6 0c0 -2.2 -3 -5.8 -3 -5.8z"/></g><path d="M7 15a3 3 0 0 0 3 3" fill="none" stroke="#1e6fd9" stroke-width="1.8" stroke-linecap="round"/>`;

// Tabler IconFlameFilled
const FIRE_ICON = `<path fill="#ffffff" d="M10 2c0 -.88 1.056 -1.331 1.692 -.722c1.958 1.876 3.096 5.995 1.75 9.12l-.08 .174l.012 .003c.625 .133 1.203 -.43 2.303 -2.173l.14 -.224a1 1 0 0 1 1.582 -.153c1.334 1.435 2.601 4.377 2.601 6.27c0 4.265 -3.591 7.705 -8 7.705s-8 -3.44 -8 -7.706c0 -2.252 1.022 -4.716 2.632 -6.301l.605 -.589c.241 -.236 .434 -.43 .618 -.624c1.43 -1.512 2.145 -2.924 2.145 -4.78"/>`;

// Tabler IconMountainFilled
const GLACIER_ICON = `<path fill="#ffffff" d="M6.18 10.95l2.54 3.175l.084 .093a1 1 0 0 0 1.403 -.01l1.637 -1.638l1.324 1.985a1 1 0 0 0 1.457 .226l3.632 -2.906l3.647 7.697a1 1 0 0 1 -.904 1.428h-18a1 1 0 0 1 -.904 -1.428zm5.82 -7.878a3.3 3.3 0 0 1 2.983 1.888l2.394 5.057l-3.15 2.52l-1.395 -2.092l-.075 -.099a1 1 0 0 0 -1.464 -.053l-1.711 1.709l-1.301 -1.627l-1.151 -1.435l1.888 -3.98a3.3 3.3 0 0 1 2.982 -1.888"/>`;

// Tabler IconDropletFilled
const OIL_ICON = `<path fill="#0b1020" d="M12 2c0 0 -7 8.2 -7 13a7 7 0 0 0 14 0c0 -4.8 -7 -13 -7 -13z"/>`;

// Tabler IconAlertTriangleFilled
const DEFAULT_ICON = `<path fill="#ffffff" d="M12 1.67c.955 0 1.845 .467 2.39 1.247l.105 .16l8.114 13.548a2.914 2.914 0 0 1 -2.307 4.363l-.195 .008h-16.225a2.914 2.914 0 0 1 -2.582 -4.2l.099 -.185l8.11 -13.538a2.914 2.914 0 0 1 2.491 -1.403zm.01 13.33l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -7a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z"/>`;

// Event pins for different types of disasters
export const EVENT_PINS = {
  flood: {
    label: "Flood",
    color: [30, 111, 217],
    url: pinUrl("#1e6fd9", FLOOD_ICON),
  },
  fire: {
    label: "Wildfire",
    color: [244, 81, 30],
    url: pinUrl("#f4511e", FIRE_ICON),
  },
  glacier: {
    label: "Glacier collapse",
    color: [0, 151, 167],
    url: pinUrl("#0097a7", GLACIER_ICON),
  },
  oilspill: {
    label: "Oil Spill",
    color: [245, 196, 0],
    url: pinUrl("#f5c400", OIL_ICON),
  },
  default: {
    label: "Disaster",
    color: [229, 50, 45],
    url: pinUrl("#e5322d", DEFAULT_ICON),
  },
};

/**
 * Returns the marker for a case study, or the default marker if it has none.
 *
 * @param {string} [pinIcon] - The study's pinIcon key, e.g. "flood".
 * @returns {{color: number[], url: string}} The marker colour and image.
 */
export const getPinIcon = (pinIcon) =>
  EVENT_PINS[pinIcon] ?? EVENT_PINS.default;
