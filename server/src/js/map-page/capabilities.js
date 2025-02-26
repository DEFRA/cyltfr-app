import { mapPageConsts } from './constants.js'

// This module is used to check the capabilities of the user's device checking WebGL support
// and display a message if the device is not supported
const getWebGL = names => {
  if (!window.WebGLRenderingContext) {
    // WebGL is not supported
    return { isEnabled: false, error: 'WebGL is not supported' }
  }
  const canvas = document.createElement('canvas')
  let context = false
  for (const name of names) {
    try {
      context = canvas.getContext(name)
      if (context && typeof context.getParameter === 'function') {
        // WebGL is enabled
        return { isEnabled: true }
      }
    } catch (e) {
      // WebGL is supported, but disabled
    }
  }
  // WebGL is supported, but disabled
  return { isEnabled: false, error: 'WebGL is supported, but disabled' }
}

const getArrayFindLast = () => {
  if (Array.prototype.findLast) {
    return { isSupported: true }
  }
  return {
    isSupported: false,
    error: 'Array.prototype.findLast() is not supported'
  }
}

export const capabilities = {
  default: {
    srid: '4326',
    hasSize: !!window.globalThis,
    isLatest: !!window.globalThis,
    getDevice: () => {
      const webGL = getWebGL(['webgl2', 'webgl1'])
      const isIE = document.documentMode
      return {
        isSupported: webGL.isEnabled,
        error: (isIE && 'Internet Explorer is not supported') || webGL.error
      }
    }
  },
  esri: {
    srid: '27700',
    hasSize: false,
    getDevice: () => {
      const webGL = getWebGL(['webgl2'])
      const arrayFindLast = getArrayFindLast()
      return {
        isSupported: webGL.isEnabled && arrayFindLast.isSupported,
        error: arrayFindLast.error || webGL.error
      }
    }
  }
}

const checkCapabilities = () => {
  if (capabilities.esri.getDevice().isSupported === false) {
    // Hide the map and show the message
    mapPageConsts.mapNotSupported.style.display = 'block'
    mapPageConsts.mapContainer[0].style.display = 'none'
  }
}

checkCapabilities()
