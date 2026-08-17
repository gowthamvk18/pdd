/**
 * Appium Driver Capabilities & WebdriverIO Configuration
 * Target Platform: Android
 */

const path = require('path');

const appiumCapabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Android Emulator',
  'appium:appPackage': 'com.skillsync.app',
  'appium:appActivity': '.MainActivity',
  'appium:noReset': true,
  'appium:newCommandTimeout': 3600,
  'appium:ensureWebviewsHavePages': true,
  'appium:nativeWebScreenshot': true,
  'appium:connectHardwareKeyboard': true
};

const wdioOpts = {
  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: parseInt(process.env.APPIUM_PORT || '4723', 10),
  path: '/',
  capabilities: appiumCapabilities,
  logLevel: 'error'
};

module.exports = {
  appiumCapabilities,
  wdioOpts
};
