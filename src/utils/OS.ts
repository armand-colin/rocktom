
export enum OSType {
    MacOS = "MacOS",
    Windows = "Windows",
    Linux = "Linux",
    Mobile = "Mobile",
    Unknown = "Unknown",
}

const userAgent = window.navigator.userAgent,
    platform = window.navigator.platform,
    macosPlatforms = ['macOS', 'Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
    windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
    iosPlatforms = ['iPhone', 'iPad', 'iPod'];

let os = OSType.Unknown

if (macosPlatforms.indexOf(platform) !== -1) {
    os = OSType.MacOS
} else if (iosPlatforms.indexOf(platform) !== -1) {
    os = OSType.Mobile
} else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = OSType.Windows
} else if (/Android/.test(userAgent)) {
    os = OSType.Mobile
} else if (/Linux/.test(platform)) {
    os = OSType.Linux
}


export const OS = {
    current: os,
    isMacOS: os === OSType.MacOS,
}
