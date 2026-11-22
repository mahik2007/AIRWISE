import { ChatRecommendationResponse } from '../types/airQuality.js';

export interface FallbackQueryContext {
  location: string;
  aqiStr: string;
  isSevere: boolean;
  isModerateOrElevated: boolean;
  aqi?: number;
  locale?: 'en' | 'hi';
}

export function getChildProtectionFallback(ctx: FallbackQueryContext): ChatRecommendationResponse {
  if (ctx.locale === 'hi') {
    return {
      recommendation: ctx.isSevere
        ? `${ctx.location} के लिए उच्च प्रदूषण चेतावनी ${ctx.aqiStr}। बच्चों और संवेदनशील व्यक्तियों को बाहरी जोखिम से सख्ती से बचाएं और इनडोर स्वच्छ हवा क्षेत्र सुरक्षित रखें।`
        : `${ctx.location} में बच्चों और संवेदनशील व्यक्तियों के लिए सुरक्षात्मक वायु गुणवत्ता सलाह ${ctx.aqiStr}।`,
      whyItMatters: `बच्चे वयस्कों की तुलना में शरीर के प्रति इकाई वजन अधिक हवा सांस में लेते हैं, और बुजुर्गों या अस्थमा के मरीजों के वायुमार्ग बढ़े हुए PM2.5 कणों के संपर्क में आने पर तेजी से सिकुड़ते हैं।`,
      practicalSteps: [
        `सुबह और शाम के चरम स्मॉग के समय बच्चों को घर के अंदर रखें; बाहरी खेलों के स्थान पर इनडोर गतिविधियों को प्राथमिकता दें।`,
        `यदि यातायात के बीच आवागमन आवश्यक हो, तो स्कूल जाने वाले बच्चों और वरिष्ठ नागरिकों को छोटे या बाल-आकार के प्रमाणित N95 मास्क पहनाएं।`,
        `एयर प्यूरीफायर का उपयोग करके बेडरूम को एक स्वच्छ-हवा क्षेत्र बनाएं और अस्थमा से पीड़ित आश्रितों के लिए तुरंत राहत देने वाले इनहेलर पास रखें।`,
        `घर के अंदर संतुलित आर्द्रता बनाए रखें और बच्चों के आसपास अगरबत्ती, मच्छर भगाने वाली कॉइल या बिना वेंटिलेशन वाले गैस हीटर जलाने से बचें।`
      ],
      expectedBenefit: `उपयोगकर्ताओं को सही निर्णय लेने में मदद करता है और चरम प्रदूषण घंटों के दौरान बच्चों व संवेदनशील लोगों के हानिकारक कणों के संपर्क को कम करता है।`,
      relevantLimitations: `[Rule-Based Fallback Advisory] सलाह ${ctx.location} के वायुमंडलीय डेटा पर आधारित है। यह बाल चिकित्सा या श्वसन रोग विशेषज्ञ के परामर्श का विकल्प नहीं है।`
    };
  }

  return {
    recommendation: ctx.isSevere
      ? `High pollution alert for ${ctx.location} ${ctx.aqiStr}. Strictly protect children and vulnerable individuals by suspending outdoor exposure and sealing clean indoor air zones.`
      : `Protective air quality guidance for children and sensitive individuals in ${ctx.location} ${ctx.aqiStr}.`,
    whyItMatters: `Children inhale more air per unit of body weight than adults, and elderly or asthmatic airways experience acute bronchial constriction when exposed to elevated PM2.5 concentrations.`,
    practicalSteps: [
      `Keep children indoors during early morning and late evening thermal smog peaks; substitute outdoor sports with indoor active play.`,
      `Equip school-going children and seniors with pediatric- or small-sized certified N95 respirators if transit through traffic is unavoidable.`,
      `Maintain a designated clean-air bedroom using an air purifier, and keep quick-relief inhalers easily accessible for asthmatic dependents.`,
      `Maintain balanced indoor humidity and avoid burning incense, mosquito coils, or unvented gas heaters around children.`
    ],
    expectedBenefit: `Helps users make informed decisions and limit avoidable pediatric and respiratory particulate exposure during peak pollution hours.`,
    relevantLimitations: `[Rule-Based Fallback Advisory] Guidance is grounded in atmospheric data for ${ctx.location}. Not a substitute for clinical pediatric or pulmonary consultation.`
  };
}

export function getExerciseFallback(ctx: FallbackQueryContext): ChatRecommendationResponse {
  if (ctx.locale === 'hi') {
    return {
      recommendation: ctx.isSevere
        ? `${ctx.location} ${ctx.aqiStr} में बाहरी व्यायाम की सिफारिश नहीं की जाती है। भारी प्रदूषण स्तर तीव्र श्वसन वर्कआउट के दौरान हृदय और फेफड़ों पर गंभीर तनाव डालते हैं।`
        : ctx.isModerateOrElevated
        ? `${ctx.location} ${ctx.aqiStr} में वर्कआउट की तीव्रता और स्थान समायोजित करें। सुबह की कठिन दौड़ को इनडोर शिफ्ट करने पर विचार करें, और किसी भी बाहरी गतिविधि से पहले प्रति घंटे का स्थानीय AQI जांचें।`
        : `${ctx.location} ${ctx.aqiStr} में वायु गुणवत्ता सामान्य बाहरी वर्कआउट और व्यायाम के लिए अनुकूल है।`,
      whyItMatters: `तीव्र एरोबिक श्वसन से आराम की तुलना में फेफड़ों में गहराई तक बारीक कण जमा होते हैं, जिससे वायुमार्ग और रक्त वाहिकाओं पर खिंचाव बढ़ता है।`,
      practicalSteps: [
        ctx.isSevere
          ? `बाहरी दौड़ को इनडोर बॉडीवेट ट्रेनिंग, ट्रेडमिल रूटीन या जिम वर्कआउट से बदलें।`
          : `सुबह और शाम के समय व्यस्त मुख्य सड़कों के किनारे दौड़ने से बचें जहां वाहनों का धुआं जमा रहता है।`,
        `बाहर व्यायाम करने से पहले वास्तविक समय का प्रति घंटे का स्थानीय प्रदूषण स्तर जांचें, क्योंकि दिनभर में वायुमंडलीय स्थितियां तेजी से बदल सकती हैं।`,
        `यदि तेज चलना आवश्यक हो तो N95 रेस्पिरेटर पहनें, लेकिन टाइट-फिटिंग मास्क पहनकर अत्यधिक हांफने वाले व्यायाम से बचें।`,
        `वायुमार्ग की श्लेष्मा परत को मजबूत बनाए रखने के लिए सत्र से पहले और बाद में पर्याप्त पानी पिएं।`
      ],
      expectedBenefit: `फेफड़ों के एल्वियोली में जहरीले कणों के जमाव को रोकने में मदद करता है और व्यायाम-प्रेरित वायुमार्ग जलन को कम करता है।`,
      relevantLimitations: `[Rule-Based Fallback Advisory] व्यायाम संबंधी सिफारिशें ${ctx.location} के परिवेशी PM2.5 स्तर को दर्शाती हैं; हृदय या फेफड़ों की बीमारी वाले व्यक्तियों को चिकित्सकीय सलाह का पालन करना चाहिए।`
    };
  }

  return {
    recommendation: ctx.isSevere
      ? `Outdoor exercise is NOT recommended in ${ctx.location} ${ctx.aqiStr}. Heavy particulate levels pose significant cardiovascular and pulmonary strain during high-ventilation workouts.`
      : ctx.isModerateOrElevated
      ? `Adjust workout intensity and location in ${ctx.location} ${ctx.aqiStr}. Consider shifting strenuous morning runs indoors, and check hourly local AQI before any outdoor activity.`
      : `Air quality in ${ctx.location} ${ctx.aqiStr} is favorable for normal outdoor workouts and cardiovascular activities.`,
    whyItMatters: `Heavy aerobic respiration increases deep lung particulate deposition compared to rest, causing airway and systemic vascular strain during elevated smog.`,
    practicalSteps: [
      ctx.isSevere
        ? `Replace outdoor running with indoor bodyweight training, treadmill routines, or gym workouts.`
        : `Avoid dawn and dusk routes alongside congested arterial roadways where vehicle exhaust stagnates.`,
      `Check real-time hourly local pollution readings before exercising outdoors, as atmospheric conditions can change rapidly throughout the day.`,
      `Wear an N95 respirator if brisk walking is necessary, but avoid heavy breathless exertion while wearing tight-fitting respirators.`,
      `Hydrate thoroughly before and after sessions to maintain protective airway mucosal clearance.`
    ],
    expectedBenefit: `Helps prevent deep alveolar particulate accumulation and reduces exercise-induced airway irritation.`,
    relevantLimitations: `[Rule-Based Fallback Advisory] Exercise recommendations reflect ambient PM2.5 levels in ${ctx.location}; individuals with underlying heart or lung conditions should follow medical advice.`
  };
}

export function getMaskFallback(ctx: FallbackQueryContext): ChatRecommendationResponse {
  if (ctx.locale === 'hi') {
    return {
      recommendation: `${ctx.location} ${ctx.aqiStr} के लिए रेस्पिरेटर सलाह: बारीक कणों से सुरक्षा के लिए प्रमाणित N95, KN95, या FFP2 रेस्पिरेटर का उपयोग करें; साधारण कपड़े या सर्जिकल मास्क सब-माइक्रोन PM2.5 को नहीं रोकते।`,
      whyItMatters: `परिवेशी PM2.5 कण एरोडायनामिक व्यास में 2.5 माइक्रोन से छोटे होते हैं। ढीले कपड़े और सर्जिकल मास्क चेहरे के किनारों से बिना छनी हवा को आने देते हैं और इनमें इलेक्ट्रोस्टैटिक फिल्ट्रेशन परत नहीं होती।`,
      practicalSteps: [
        `एडजस्टेबल नोज क्लिप वाला N95 या FFP2 रेस्पिरेटर चुनें और नाक, गाल और ठुड्डी के चारों ओर एयरटाइट सील की जांच करें।`,
        `भीड़भाड़ वाले स्थानों में दूसरों की सुरक्षा के लिए वाल्व वाले मास्क से बचें; प्रत्येक उपयोग से पहले जांचें और गंदा या खराब होने पर निर्माता के निर्देशानुसार बदलें।`,
        `सुनिश्चित करें कि बच्चों के मास्क विशेष रूप से छोटे चेहरे पर बिना किसी गैप के ठीक से फिट हों।`,
        `उपयोग के बीच साफ रेस्पिरेटर को हवादार पेपर बैग में रखें; साबुन या पानी से न धोएं क्योंकि नमी इलेक्ट्रोस्टैटिक फिल्टर को खराब कर देती है।`
      ],
      expectedBenefit: `मानक प्रमाणीकरण परीक्षणों के अनुसार ठीक से फिट और सील होने पर हवा में मौजूद 95% तक हानिकारक कणों (PM2.5) को फिल्टर करता है।`,
      relevantLimitations: `[Rule-Based Fallback Advisory] रेस्पिरेटर परिवेशी धूल कणों से बचाते हैं लेकिन हानिकारक गैसों (जैसे कार्बन मोनोऑक्साइड या नाइट्रोजन डाइऑक्साइड) को फिल्टर नहीं करते हैं।`
    };
  }

  return {
    recommendation: `Respirator guidance for ${ctx.location} ${ctx.aqiStr}: Use certified N95, KN95, or FFP2 respirators for particulate protection; standard cloth or surgical masks do not block sub-micron PM2.5.`,
    whyItMatters: `Ambient PM2.5 particles are under 2.5 microns in aerodynamic diameter. Loose-fitting cloth and surgical masks allow unfiltered bypass around facial edges and lack electrostatic particulate filtration layers.`,
    practicalSteps: [
      `Select an N95 or FFP2 respirator with an adjustable nose clip and verify an airtight seal around nose, cheeks, and chin.`,
      `Avoid exhalation valves if protecting others in crowded indoor spaces; inspect respirators before each use and replace them if damaged, soiled, deformed, or when breathing resistance increases, following manufacturer instructions.`,
      `Ensure pediatric masks specifically fit smaller faces without perimeter air gaps for maximum efficacy.`,
      `Store clean respirators in breathable paper bags between uses; do not wash with soap or water as moisture ruins electrostatic filter media.`
    ],
    expectedBenefit: `Filters up to 95% of airborne particulate matter (PM2.5) when properly fitted and sealed according to standard certification tests.`,
    relevantLimitations: `[Rule-Based Fallback Advisory] Respirators mitigate ambient particulate exposure but do not filter hazardous gases (e.g., carbon monoxide or nitrogen dioxide).`
  };
}

export function getIndoorFallback(ctx: FallbackQueryContext, isVentilationSpecific: boolean): ChatRecommendationResponse {
  if (ctx.locale === 'hi') {
    return {
      recommendation: ctx.isSevere
        ? `${ctx.location} ${ctx.aqiStr} के लिए इनडोर वायु सुरक्षा प्रोटोकॉल: स्मॉग को अंदर आने से रोकने के लिए बाहरी खिड़कियां बंद रखें और मुख्य कमरों में एयर फिल्ट्रेशन चलाएं।`
        : isVentilationSpecific && ctx.aqi === undefined
        ? `${ctx.location} के लिए वेंटिलेशन मार्गदर्शन: वर्तमान प्रति घंटे का बाहरी AQI डेटा अनुपलब्ध है। सत्यापित स्थानीय रीडिंग के बिना सुरक्षित वेंटिलेशन विंडो निर्धारित नहीं की जा सकती; जब तक विश्वसनीय डेटा न मिले, खिड़कियां बंद रखें।`
        : `${ctx.location} ${ctx.aqiStr} के लिए इनडोर वेंटिलेशन रणनीति: खिड़कियां खोलने से पहले वर्तमान प्रति घंटे का बाहरी AQI जांचें, और केवल तभी थोड़ी देर के लिए कमरे हवादार करें जब बाहरी हवा साफ हो। इनडोर स्थानों को गीले पोंछे से साफ रखें।`,
      whyItMatters: `यदि तापमान उलटाव के दौरान खिड़कियां खुली रहती हैं तो इनडोर कणों की सांद्रता बाहरी स्मॉग स्तर के बराबर पहुंच सकती है, जबकि खाना पकाने और सूखे झाड़ू से खतरा और बढ़ जाता है।`,
      practicalSteps: [
        ctx.isSevere
          ? `रात और सुबह के स्मॉग के घंटों के दौरान खिड़कियों के किनारों को ड्राफ्ट टेप या गीले तौलियों से सील करें।`
          : ctx.aqi === undefined
          ? `खिड़कियां खोलने से पहले सत्यापित स्थानीय स्टेशन रीडिंग जांचें; वर्तमान प्रति घंटे के माप के बिना दोपहर को स्वतः सुरक्षित न मानें।`
          : `खिड़कियां खोलने से पहले सत्यापित प्रति घंटे का बाहरी AQI जांचें; केवल तभी आमने-सामने की खिड़कियां थोड़ी देर के लिए खोलें जब बाहरी हवा अच्छी हो।`,
        `सूखे झाड़ू के बजाय नम माइक्रोफाइबर पोंछे का उपयोग करें ताकि धूल हवा में उड़े बिना साफ हो सके।`,
        `खाना बनाते समय रसोई की चिमनी चलाएं और तेल के बारीक कणों को हवा में फैलने से रोकने के लिए बर्तनों को ढकें।`,
        `बेडरूम में HEPA प्यूरीफायर को बीच में रखें, और ध्यान दें कि घरेलू पौधों की PM2.5 फिल्ट्रेशन क्षमता मैकेनिकल HEPA फिल्टर की तुलना में नगण्य होती है।`
      ],
      expectedBenefit: `उपयोगकर्ताओं को सही निर्णय लेने में मदद करता है और अनियंत्रित बाहरी स्थितियों की तुलना में घर के अंदर हानिकारक कणों के जमाव को सीमित करता है।`,
      relevantLimitations: `[Rule-Based Fallback Advisory] इनडोर वायु गुणवत्ता की निगरानी नहीं की जाती है (कोई इनडोर सेंसर नहीं); सिफारिशें ${ctx.location} के लिए Open-Meteo/CAMS मॉडल डेटा पर आधारित हैं। नियमित फिल्टर रखरखाव आवश्यक है।`
    };
  }

  return {
    recommendation: ctx.isSevere
      ? `Indoor air containment protocol for ${ctx.location} ${ctx.aqiStr}: Keep exterior windows sealed against smog penetration and operate air filtration in high-use rooms.`
      : isVentilationSpecific && ctx.aqi === undefined
      ? `Ventilation guidance for ${ctx.location}: Current outdoor hourly AQI data is unavailable. A safe ventilation window cannot be determined without verified local air quality readings; keep windows latched until reliable outdoor data is confirmed.`
      : `Indoor ventilation strategy for ${ctx.location} ${ctx.aqiStr}: Check current hourly outdoor AQI before opening windows, and air rooms briefly only if outdoor air is clean. Keep unmonitored indoor spaces clean with wet dusting.`,
    whyItMatters: `Indoor particulate concentrations can reach a significant fraction of outdoor smog levels if windows remain open during thermal inversions, while indoor cooking and dry dusting further compound particulate hazard.`,
    practicalSteps: [
      ctx.isSevere
        ? `Seal perimeter window cracks with draft tape or rolled damp towels during night and early morning inversion hours.`
        : ctx.aqi === undefined
        ? `Check verified local municipal station readings before opening windows; do not assume midday is safe without current hourly measurements.`
        : `Check verified hourly outdoor AQI before opening windows; open opposite windows briefly only when outdoor air quality is favorable.`,
      `Use damp microfiber mopping rather than dry sweeping to trap settled particulate matter without resuspending it into the breathing zone.`,
      `Run kitchen exhaust fans during cooking and keep lids on pans to minimize aerosolized oil droplet dispersion.`,
      `Position HEPA purifiers centrally in bedrooms away from open doors, and note that household plants have negligible PM2.5 filtration capacity compared to mechanical HEPA filters.`
    ],
    expectedBenefit: `Helps users make informed decisions and limit avoidable indoor particulate buildup relative to unmitigated outdoor conditions.`,
    relevantLimitations: `[Rule-Based Fallback Advisory] Indoor air quality is unmonitored (no connected indoor sensors); recommendations reflect ambient Open-Meteo/CAMS atmospheric model data for ${ctx.location}. Regular filter maintenance is essential.`
  };
}

export function getCommuteFallback(ctx: FallbackQueryContext): ChatRecommendationResponse {
  if (ctx.locale === 'hi') {
    return {
      recommendation: `${ctx.location} ${ctx.aqiStr} के लिए आवागमन और यात्रा सलाह: सड़क किनारे प्रदूषण और टेलपाइप उत्सर्जन को कम करने के लिए बंद सार्वजनिक मेट्रो रेल या AC रीसर्क्युलेशन वाली शेयर्ड कैब चुनें।`,
      whyItMatters: `वाहन के अंदर और सड़क किनारे का आवागमन शहरी यात्रियों के लिए रोजाना PM2.5 और NO2 के तीव्र संपर्क का मुख्य कारण बनता है।`,
      practicalSteps: [
        `सुबह के व्यस्त समय में खुले दोपहिया या ऑटो-रिक्शा के बजाय इलेक्ट्रिक मेट्रो रेल या वातानुकूलित बसें चुनें।`,
        `ट्रैफिक जाम या व्यस्त सड़कों पर वाहन के वेंटिलेशन सिस्टम को इंटरनल रीसर्क्युलेशन मोड पर सेट करें।`,
        `बस स्टॉप पर प्रतीक्षा करते समय या व्यस्त सड़कों पर चलते समय N95 रेस्पिरेटर पहनें।`,
        `कोल्ड-स्टार्ट इंजन उत्सर्जन को कम करने के लिए कई छोटी यात्राओं को एक साथ मिलाएं या कारपूल करें।`
      ],
      expectedBenefit: `व्यक्तिगत वाहन के कार्बन और धूल उत्सर्जन को रोकने के साथ-साथ आवागमन के दौरान प्रदूषण के संपर्क को कम करता है।`,
      relevantLimitations: `[Rule-Based Fallback Advisory] सलाह ${ctx.location} के वायुमंडलीय मॉडलिंग पर आधारित है। व्यस्त राजमार्गों के आसपास स्थानीय प्रदूषण स्तर अधिक हो सकता है।`
    };
  }

  return {
    recommendation: `Commute and transit advisory for ${ctx.location} ${ctx.aqiStr}: Minimize roadside exposure and tailpipe emissions by switching to closed public rail or carpools with AC recirculation.`,
    whyItMatters: `In-cabin and roadside commute corridors represent frequent daily acute PM2.5 and NO2 exposure spikes for urban commuters.`,
    practicalSteps: [
      `Opt for electric metro rail or enclosed public buses over open two-wheelers and auto-rickshaws during peak morning rush.`,
      `Set vehicle ventilation systems to internal recirculation mode when idling or navigating dense traffic corridors.`,
      `Wear an N95 respirator when waiting on exposed bus platforms or walking along busy roads.`,
      `Consolidate multiple short vehicle trips or share rides to eliminate cold-start engine emissions.`
    ],
    expectedBenefit: `Lowers personal commute particulate exposure while preventing personal vehicle carbon and particulate emissions.`,
    relevantLimitations: `[Rule-Based Fallback Advisory] Advisory utilizes atmospheric modeling for ${ctx.location}. Micro-climate hotspots along busy expressways may exhibit higher localized concentrations.`
  };
}

export function getGeneralFallback(ctx: FallbackQueryContext): ChatRecommendationResponse {
  if (ctx.aqi === undefined) {
    if (ctx.locale === 'hi') {
      return {
        recommendation: `${ctx.location} के लिए वर्तमान में लाइव वायु गुणवत्ता टेलीमेट्री अनुपलब्ध है। जब तक स्थानीय रीडिंग बहाल न हो, मानक शहरी स्मॉग सावधानियां बरतें।`,
        whyItMatters: `सक्रिय निरंतर निगरानी डेटा के बिना, स्थानीय बारीक कणों (PM2.5/PM10) की पुष्टि नहीं की जा सकती। यातायात घनत्व और मौसम के आधार पर शहरी प्रदूषण स्तर में काफी बदलाव हो सकता है।`,
        practicalSteps: [
          `वास्तविक समय के स्मॉग अलर्ट के लिए स्थानीय नगरपालिका स्टेशन रिपोर्ट या मौसम बुलेटिन देखें।`,
          `एहतियात के तौर पर व्यस्त ट्रैफिक घंटों के दौरान प्रमाणित N95 या FFP2 रेस्पिरेटर पहनें।`,
          `कमरों को हवादार करने के लिए खिड़कियां खोलने से पहले वर्तमान स्थानीय वायु गुणवत्ता रीडिंग जांचें।`,
          `प्रदूषण के संपर्क और वाहन उत्सर्जन को कम करने के लिए सार्वजनिक परिवहन, इलेक्ट्रिक मेट्रो या शेयर्ड आवागमन चुनें।`
        ],
        expectedBenefit: `अनियंत्रित प्रदूषण जोखिम से बचाता है और बुनियादी सुरक्षात्मक श्वसन स्वास्थ्य को बढ़ावा देता है।`,
        relevantLimitations: `[Rule-Based Fallback Advisory] लाइव वायुमंडलीय माप अनुपलब्ध हैं; सिफारिशें सामान्य सावधानियां हैं और चिकित्सकीय मूल्यांकन नहीं हैं।`
      };
    }

    return {
      recommendation: `Live air quality telemetry is currently unavailable for ${ctx.location}. Exercise standard urban smog precautions until verified local readings are restored.`,
      whyItMatters: `Without active continuous air quality monitoring data, local particulate concentrations (PM2.5/PM10) cannot be confirmed. Ambient urban exposure can vary significantly based on traffic density and weather conditions.`,
      practicalSteps: [
        `Check local municipal air quality station reports or weather bulletins for real-time smog advisories.`,
        `Wear a certified N95 or FFP2 respirator during high-traffic commute hours as a precautionary measure.`,
        `Check current local air quality readings before opening windows to ventilate living spaces.`,
        `Opt for public transit, electric rail, or shared commuting to minimize exposure and personal vehicle emissions.`
      ],
      expectedBenefit: `Prevents unmonitored particulate exposure while promoting baseline protective respiratory health.`,
      relevantLimitations: `[Rule-Based Fallback Advisory] Live atmospheric measurements are unavailable; recommendations are general precautions and not a clinical assessment.`
    };
  }

  if (ctx.isSevere) {
    if (ctx.locale === 'hi') {
      return {
        recommendation: `${ctx.location} (US AQI: ${ctx.aqi}) के लिए उच्च प्रदूषण अलर्ट। कठिन बाहरी गतिविधियों को सीमित करें और इनडोर हवा को सुरक्षित रखें।`,
        whyItMatters: `US AQI ${ctx.aqi} पर, गंभीर सर्दियों का स्मॉग PM2.5 कणों का उच्च स्तर बनाता है जो सभी आयु समूहों में श्वसन नलियों में सूजन और तनाव उत्पन्न करता है।`,
        practicalSteps: [
          `सुबह की सैर या व्यायाम को घर के अंदर करें; सुबह के तापमान उलटाव में जहरीले कण जमीन के पास जमा रहते हैं।`,
          `बाहर निकलते समय परिवार के सदस्यों को फिटेड N95/FFP2 रेस्पिरेटर पहनाएं; साधारण कपड़े या सर्जिकल मास्क बारीक कणों को नहीं रोकते।`,
          `खिड़कियों के गैप बंद करें, उपलब्ध हो तो एयर प्यूरीफायर चलाएं, और बिना चिमनी के तलने या सूखा झाड़ू लगाने से बचें।`,
          `खुले दोपहिया वाहनों के बजाय सार्वजनिक मेट्रो या कारपूल का विकल्प चुनें।`
        ],
        expectedBenefit: `उपयोगकर्ताओं को सही निर्णय लेने में मदद करता है और असुरक्षित बाहरी संपर्क की तुलना में तीव्र कण श्वसन को सीमित करता है।`,
        relevantLimitations: `[Rule-Based Fallback Advisory] सलाह ${ctx.location} के वायुमंडलीय मॉडल डेटा पर आधारित है। यह चिकित्सीय मूल्यांकन का विकल्प नहीं है।`
      };
    }

    return {
      recommendation: `High pollution alert for ${ctx.location} (US AQI: ${ctx.aqi}). Strictly curtail strenuous outdoor activities and protect indoor air.`,
      whyItMatters: `At US AQI ${ctx.aqi}, severe winter smog creates elevated concentrations of PM2.5 particles that trigger bronchial inflammation and systemic oxidative stress across all age groups.`,
      practicalSteps: [
        `Reschedule early morning workouts or walks indoors; morning temperature inversions trap heavy surface particulate matter.`,
        `Equip family members with fitted N95/FFP2 respirators if stepping outside; ordinary cloth or surgical masks do not filter sub-micron particles.`,
        `Seal window drafts, run an air purifier if available, and avoid dry dusting or frying foods without exhaust ventilation.`,
        `Opt for public metro or carpool options rather than open two-wheelers.`
      ],
      expectedBenefit: `Helps users make informed decisions and limit avoidable acute particulate inhalation compared to unprotected outdoor exposure.`,
      relevantLimitations: `[Rule-Based Fallback Advisory] Guidance based on atmospheric model data for ${ctx.location}. Not a substitute for clinical medical evaluation.`
    };
  } else if (ctx.isModerateOrElevated) {
    if (ctx.locale === 'hi') {
      return {
        recommendation: `${ctx.location} (US AQI: ${ctx.aqi}) में मध्यम से संवेदनशील वायु गुणवत्ता। संवेदनशील समूहों को व्यस्त ट्रैफिक के घंटों में सावधानी बरतनी चाहिए।`,
        whyItMatters: `हवा में बारीक कण सामान्य स्तर से अधिक हैं, जिससे संवेदनशील व्यक्तियों में गले में जलन और थकान हो सकती है।`,
        practicalSteps: [
          `घर हवादार करने से पहले वर्तमान प्रति घंटे का बाहरी AQI जांचें; यदि स्मॉग बढ़े तो खिड़कियां खोलने से बचें।`,
          `बाहरी खेलों या दौड़ की योजना उस समय बनाएं जब सत्यापित स्थानीय प्रति घंटे की रीडिंग कम प्रदूषण दर्शाए।`,
          `व्यस्त समय में ट्रैफिक जाम और वाहनों के धुएं को कम करने के लिए सार्वजनिक परिवहन या कारपूल का उपयोग करें।`
        ],
        expectedBenefit: `उपयोगकर्ताओं को सही निर्णय लेने में मदद करता है और दैनिक आवागमन के दौरान अनावश्यक प्रदूषण जोखिम को रोकता है।`,
        relevantLimitations: `[Rule-Based Fallback Advisory] सलाह Open-Meteo वायुमंडलीय पूर्वानुमान का उपयोग करती है; उपलब्ध होने पर स्थानीय स्टेशन देखें। स्थानीय इनडोर हवा अनियंत्रित है।`
      };
    }

    return {
      recommendation: `Moderate to sensitive air quality in ${ctx.location} (US AQI: ${ctx.aqi}). Sensitive groups should take precautions during peak rush hours.`,
      whyItMatters: `Particulate matter is elevated above standard baseline levels, which can cause throat irritation and fatigue in sensitive individuals.`,
      practicalSteps: [
        `Check current hourly outdoor AQI before ventilating living spaces; avoid opening windows if outdoor smog levels rise.`,
        `Plan outdoor sports or jogging for times when verified local hourly readings indicate lower particulate density.`,
        `Use public transit or share rides to avoid contributing to peak vehicle idle emissions.`,
        `Keep indoor spaces damp-mopped rather than dry-swept to prevent resuspending settled dust.`
      ],
      expectedBenefit: `Helps users make informed decisions and limit avoidable personal exposure during daily commute and peak traffic hours.`,
      relevantLimitations: `[Rule-Based Fallback Advisory] Advisory utilizes Open-Meteo atmospheric forecast; check local observed stations if available. Local indoor air quality is unmonitored.`
    };
  } else {
    if (ctx.locale === 'hi') {
      return {
        recommendation: `${ctx.location} में वायु गुणवत्ता वर्तमान में स्वीकार्य सीमा में है (US AQI: ${ctx.aqi})। सामान्य दिनचर्या के लिए उपयुक्त।`,
        whyItMatters: `हवा में बारीक कणों का कम स्तर प्रदूषण के बिना आरामदायक बाहरी वेंटिलेशन और व्यायाम की अनुमति देता है।`,
        practicalSteps: [
          `प्राकृतिक क्रॉस-वेंटिलेशन के लिए कमरे खोलने से पहले वर्तमान प्रति घंटे का बाहरी AQI जांचें।`,
          `3 किमी से कम की छोटी यात्राओं के लिए पैदल चलने या साइकिल चलाने जैसे सक्रिय आवागमन को बढ़ावा दें।`,
          `कम उत्सर्जन बनाए रखने के लिए वाहनों की नियमित सर्विसिंग और टायर का उचित दबाव बनाए रखें।`
        ],
        expectedBenefit: `स्वच्छ हवा बनाए रखने के साथ-साथ कम उत्सर्जन वाले विकल्पों के माध्यम से हृदय स्वास्थ्य को बढ़ावा देता है।`,
        relevantLimitations: `[Rule-Based Fallback Advisory] व्यस्त चौराहों के पास वाहनों के धुएं में स्थानीय वृद्धि हो सकती है। स्थानीय इनडोर हवा अनियंत्रित है।`
      };
    }

    return {
      recommendation: `Air quality in ${ctx.location} is currently within acceptable ranges (US AQI: ${ctx.aqi}). Ideal for normal daily routines.`,
      whyItMatters: `Low atmospheric particulate levels allow comfortable outdoor ventilation and cardiovascular activity without significant pollution burden.`,
      practicalSteps: [
        `Check current hourly outdoor AQI before airing rooms for natural cross-ventilation.`,
        `Encourage active commuting such as walking or cycling for short trips under 3 km.`,
        `Maintain regular car servicing and tire pressure to preserve fuel efficiency and low emissions.`
      ],
      expectedBenefit: `Promotes cardiovascular health while sustaining clean ambient air quality through low-emission choices.`,
      relevantLimitations: `[Rule-Based Fallback Advisory] Local micro-climates near busy intersections may experience localized spikes in vehicle exhaust. Local indoor air quality is unmonitored.`
    };
  }
}
