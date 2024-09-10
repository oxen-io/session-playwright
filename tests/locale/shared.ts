import { en } from '../localization/locales';
import { LocalizerDictionary } from './localizerType';
import { timeLocaleMap } from './timeLocaleMap';

let mappedBrowserLocaleDisplayed = false;
let initialLocale: Locale | undefined;

let translationDictionary: LocalizerDictionary | undefined;

/**
 * Only exported for testing, reset the dictionary to use for translations and the locale set
 */
export function resetLocaleAndTranslationDict() {
  translationDictionary = undefined;
  initialLocale = undefined;
}

/**
 * Returns the current dictionary to use for translations.
 */
export function getTranslationDictionary(): LocalizerDictionary {
  if (translationDictionary) {
    return translationDictionary;
  }

  console.log('getTranslationDictionary: dictionary not init yet. Using en.');
  return en;
}

export function getFallbackDictionary(): LocalizerDictionary {
  return en;
}

export type Locale = keyof typeof timeLocaleMap;

export function getTimeLocaleDictionary() {
  return timeLocaleMap[getLocale()];
}

/**
 * Returns the current locale.
 */
export function getLocale(): Locale {
  if (!initialLocale) {
    console.log(`getLocale: using initialLocale: ${initialLocale}`);

    throw new Error('initialLocale is unset');
  }
  return initialLocale;
}

/**
 * Returns the closest supported locale by the browser.
 */
export function getBrowserLocale() {
  const userLocaleDashed = getLocale();

  const matchinglocales =
    Intl.DateTimeFormat.supportedLocalesOf(userLocaleDashed);
  const mappingTo = matchinglocales?.[0] || 'en';

  if (!mappedBrowserLocaleDisplayed) {
    mappedBrowserLocaleDisplayed = true;
    console.log(
      `userLocaleDashed: '${userLocaleDashed}', mapping to browser locale: ${mappingTo}`,
    );
  }

  return mappingTo;
}

export function setInitialLocale(
  locale: Locale,
  dictionary: LocalizerDictionary,
) {
  if (translationDictionary) {
    throw new Error(
      'setInitialLocale: translationDictionary or initialLocale is already init',
    );
  }
  translationDictionary = dictionary;
  initialLocale = locale;
}

export function isLocaleSet() {
  return initialLocale !== undefined;
}

export function getStringForCardinalRule(
  localizedString: string,
  cardinalRule: Intl.LDMLPluralRule,
): string | undefined {
  // TODO: investigate if this is the best way to handle regex like this
  // We need block scoped regex to avoid running into this issue:
  // https://stackoverflow.com/questions/18462784/why-is-javascript-regex-matching-every-second-time
  const cardinalPluralRegex: Record<Intl.LDMLPluralRule, RegExp> = {
    zero: /zero \[(.*?)\]/g,
    one: /one \[(.*?)\]/g,
    two: /two \[(.*?)\]/g,
    few: /few \[(.*?)\]/g,
    many: /many \[(.*?)\]/g,
    other: /other \[(.*?)\]/g,
  };
  const regex = cardinalPluralRegex[cardinalRule];
  const match = regex.exec(localizedString);
  return match?.[1] ?? undefined;
}
