import bigRock from 'assets/icons/space/icon-big-rock.png';
import exSmallRock from 'assets/icons/space/icon-exsmall-rock.png';
import mediumRock from 'assets/icons/space/iconn-medium-rock.png';
import smallRock from 'assets/icons/space/icon-small-rock.png';

export const spaceThemeConfig = {
  floatingElements: {
    images: [bigRock, exSmallRock, mediumRock, smallRock],
    numElements: 12,
    safeZone: 80,
    waveAmplitude: 18,
    waveFrequency: 2.2,
    driftRange: 10,
    mouseAttractRadius: 120,
    mouseAttractStrength: 12,
    glowColor: 'var(--accent-color, #6c5ce7)',
    glowIntensity: '0 0 8px'
  },
  background: {
    type: 'canvas',
    component: 'SpaceBackground'
  }
};

export const wizardThemeConfig = {
  floatingElements: {
    images: [],
    numElements: 8,
    safeZone: 80,
    waveAmplitude: 15,
    waveFrequency: 1.8,
    driftRange: 8,
    mouseAttractRadius: 100,
    mouseAttractStrength: 10,
    glowColor: 'var(--accent-color, #a29bfe)',
    glowIntensity: '0 0 6px'
  },
  background: {
    type: 'svg',
    component: 'WizardBackground',
    blur: '4px',
    zIndex: -1
  }
};

export const detectiveThemeConfig = {
  floatingElements: {
    images: [],
    numElements: 6,
    safeZone: 80,
    waveAmplitude: 12,
    waveFrequency: 1.5,
    driftRange: 6,
    mouseAttractRadius: 80,
    mouseAttractStrength: 8,
    glowColor: 'var(--accent-color, #fd79a8)',
    glowIntensity: '0 0 4px'
  },
  background: {
    type: 'component',
    component: 'RainfallBackground'
  }
};

export const themeConfigs = {
  space: spaceThemeConfig,
  wizard: wizardThemeConfig,
  detective: detectiveThemeConfig
};

export const getThemeConfig = (theme) => {
  return themeConfigs[theme] || spaceThemeConfig;
}; 