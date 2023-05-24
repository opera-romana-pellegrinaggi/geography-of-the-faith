/** I18n for Geography of the Faith */

//We determine the locale from the hostname
const thirdlevelMap = {
    geographyofthefaith:    'en',
    geografiadellafede:     'it',
    geografiadelafe:        'es',
    geographiedelafoi:      'fr',
    geographiedesglaubens:  'de',
    geografiadafe:          'pt'
}


const hostnameToLocale = () => {
    const hostname = location.hostname.split('.');
    let thirdlevel;
    let lang;
    if( hostname[1] === 'bibleget' ) {
        thirdlevel = hostname[0];
        lang = thirdlevelMap[thirdlevel] ?? 'en';
    }
    else if ( hostname[1] === 'orp' ) {
        if( location.pathname.includes('geography') ) {
            lang = 'en';
        }
        else if( location.pathname.includes('geografia') && location.pathname.includes('fede') ) {
            lang = 'it';
        }
        else if( location.pathname.includes('geografia') && location.pathname.includes('de') && location.pathname.includes('fe') ) {
            lang = 'es';
        }
        else if( location.pathname.includes('geographie') ) {
            lang = 'fr';
        }
        else if( location.pathname.includes('geographie') && location.pathname.includes('glaubens') ) {
            lang = 'de';
        }
        else if( location.pathname.includes('geografia') && location.pathname.includes('da') && location.pathname.includes('fe') ) {
            lang = 'pt';
        }
        else {
            thirdlevel = hostname[0];
            lang = thirdlevelMap[thirdlevel] ?? 'en';
        }
    }
    return lang;
}

const lang = hostnameToLocale();

export { lang };
