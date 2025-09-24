import React, { useState } from "react";

type Language = "fr" | "en" | "mfe" | "rcf";
type Page = "splash" | "auth" | "register" | "home" | "addMeal" | "profile" | "notifications" | "supplies";

interface SuppliesPageProps {
  language: Language;
  onBack: () => void;
  onNavigate: (page: Page) => void;
}

interface ShoppingLocation {
  key: string;
  label: string;
  often: boolean;
  sometimes: boolean;
}

interface ShoppingReasons {
  prices: boolean;
  proximity: boolean;
  practicality: boolean;
  advertising: boolean;
  quality: boolean;
  other: boolean;
}

const translations = {
  fr: {
    supplies: "Approvisionnements",
    question1: "Où faites-vous vos courses ?",
    question2: "Quelles sont parmi les suivantes les raisons pour lesquelles vous avez fréquenté ces lieux durant ces 4 dernières semaines (plusieurs raisons possibles) ?",
    question3: "Utilisez-vous le STC (subventionnés) pour faire vos achats alimentaires ?",
    often: "Souvent",
    sometimes: "Parfois",
    yes: "Oui",
    no: "Non",
    reasons: {
      prices: "Les prix",
      proximity: "La proximité", 
      practicality: "La praticité",
      advertising: "La publicité/Promotion",
      quality: "La qualité",
      other: "Autres"
    },
    locations: {
      supermarket: "Supermarché / Hypermarché hors discount",
      discount: "Magasin hard discount",
      grocery: "Épicerie Supérette",
      bakery: "Boulangerie - pâtisserie",
      specialized: "Comm. de proximité spécialisés (boucherie, poissonnerie.)",
      frozen: "Magasin de surgelés",
      bio: "Magasin BIO",
      market: "Marché forain",
      roadside: "Vendeur en bord de route",
      produce: "Primeur (magasin spécialisé en fruits et légumes)",
      baskets: "Paniers de producteurs",
      mobile: "Commerçant ambulant",
      gas: "Station-service",
      food_aid: "Centre d'aide alimentaire",
      online: "Achat par internet, téléphone ou catalogue",
      personal: "Jardin, verger, élevage personnel",
      fishing: "Pêche / cueillette personnelle en dehors de votre propriété privée",
      received: "Produits reçus (jardin, verger, élevage, pêche/cueillette en dehors d'une propriété privée)"
    },
    submit: "Soumettre",
    next: "Suivant",
    previous: "Précédent",
    back: "Retour",
    thankYou: "Merci pour votre participation !",
    surveyComplete: "Votre réponse a été enregistrée avec succès.",
    questionProgress: "Question {{current}} sur {{total}}"
  },
  en: {
    supplies: "Supplies",
    question1: "Where do you do your shopping?",
    question2: "Which of the following are the reasons why you frequented these places during the last 4 weeks (multiple reasons possible)?",
    question3: "Do you use subsidized STC for your food purchases?",
    often: "Often",
    sometimes: "Sometimes",
    yes: "Yes",
    no: "No",
    reasons: {
      prices: "Prices",
      proximity: "Proximity",
      practicality: "Practicality",
      advertising: "Advertising/Promotion",
      quality: "Quality",
      other: "Other"
    },
    locations: {
      supermarket: "Supermarket / Hypermarket non-discount",
      discount: "Hard discount store",
      grocery: "Grocery store",
      bakery: "Bakery - pastry shop",
      specialized: "Specialized local shops (butcher, fishmonger, etc.)",
      frozen: "Frozen food store",
      bio: "Organic store",
      market: "Market",
      roadside: "Roadside vendor",
      produce: "Produce store (specialized in fruits and vegetables)",
      baskets: "Producer baskets",
      mobile: "Mobile merchant",
      gas: "Gas station",
      food_aid: "Food aid center",
      online: "Online, phone or catalog purchase",
      personal: "Personal garden, orchard, livestock",
      fishing: "Personal fishing/foraging outside your private property",
      received: "Received products (garden, orchard, livestock, fishing/foraging outside private property)"
    },
    submit: "Submit",
    next: "Next",
    previous: "Previous",
    back: "Back",
    thankYou: "Thank you for your participation!",
    surveyComplete: "Your response has been successfully recorded.",
    questionProgress: "Question {{current}} of {{total}}"
  },
  mfe: {
    supplies: "Aprovizyon",
    question1: "Kot ou pe fer ou kours?",
    question2: "Ki raison parmi sa bann-la ki fer ou finn al dan sa bann kote-la pendant sa 4 semaine ki finn pase la (kapav ena plisier raison)?",
    question3: "Ou pe servi STC (subventionne) pou fer ou aste manze?",
    often: "Souvan",
    sometimes: "Parfwa",
    yes: "Wi",
    no: "Non",
    reasons: {
      prices: "Prix-la",
      proximity: "Proximite",
      practicality: "Pratik",
      advertising: "Piblisité/Promotion", 
      quality: "Kalité",
      other: "Lot bagay"
    },
    locations: {
      supermarket: "Supermarché / Hypermarché or discount",
      discount: "Magazin hard discount",
      grocery: "Episri Superet",
      bakery: "Bulanzri - patisri",
      specialized: "Komersan proximité spésialisé (busri, pwasonri)",
      frozen: "Magazin sirkèlé",
      bio: "Magazin BIO",
      market: "Marsé forain",
      roadside: "Vandèr lor bor smin",
      produce: "Primèr (magazin spésialisé dan fwi ek legim)",
      baskets: "Panye produktèr",
      mobile: "Komersan ambiulan",
      gas: "Stasyon sèrvis",
      food_aid: "Santr èd alimantèr",
      online: "Aste par internet, telefon u katalog",
      personal: "Zardin, verzé, elevaz persinel",
      fishing: "Pès / kweyèt persinel deor ou propriété privé",
      received: "Prodwi reswi (zardin, verzé, elevaz, pès/kweyèt deor propriété privé)"
    },
    submit: "Voy",
    next: "Sivan",
    previous: "Avan",
    back: "Retour",
    thankYou: "Mersi pou ou partisipasyon!",
    surveyComplete: "Ou repons finn anrezistre avek sikse.",
    questionProgress: "Kesyon {{current}} lor {{total}}"
  },
  rcf: {
    supplies: "Aprovizyon", 
    question1: "Kot ou pé fèr ou kours?",
    question2: "Ki raison parmi sa bann-la ki fèr ou finn al dan sa bann kotè-la pandan sa 4 sèmèn ki finn pasé la (kapav éna plisièr raison)?",
    question3: "Ou pé sèrvi STC (subvèntionné) pou fèr ou astè manzé?",
    often: "Souvan",
    sometimes: "Parfwa",
    yes: "Wi",
    no: "Non", 
    reasons: {
      prices: "Prix-la",
      proximity: "Proximité",
      practicality: "Pratik",
      advertising: "Piblisité/Promotion",
      quality: "Kalité", 
      other: "Lot bagay"
    },
    locations: {
      supermarket: "Supèrmarsé / Hypèrmarsé or discount",
      discount: "Magazin hard discount",
      grocery: "Épisri Supèrèt",
      bakery: "Bulanzri - patisri",
      specialized: "Komèrsan proximité spésialisé (busri, pwasonri)",
      frozen: "Magazin sirkèlé",
      bio: "Magazin BIO",
      market: "Marsé forain",
      roadside: "Vandèr lor bor smin",
      produce: "Primèr (magazin spésialisé dan fwi èk légim)",
      baskets: "Panyé produktèr",
      mobile: "Komèrsan ambiulan",
      gas: "Stasyon sèrvis",
      food_aid: "Santèr èd alimantèr",
      online: "Astè par internet, téléfon u katalog",
      personal: "Zardin, vèrzé, élèvaz pèrsinèl",
      fishing: "Pès / kwèyèt pèrsinèl déor ou propriété privé",
      received: "Prodwi rèswi (zardin, vèrzé, élèvaz, pès/kwèyèt déor propriété privé)"
    },
    submit: "Voy",
    next: "Sivan",
    previous: "Avan",
    back: "Rètour",
    thankYou: "Mèrsi pou ou partisipasyon!",
    surveyComplete: "Ou répons finn anrèzistrè avèk siksè.",
    questionProgress: "Kèsyon {{current}} lor {{total}}"
  }
};

const SuppliesPage: React.FC<SuppliesPageProps> = ({
  language,
  onBack,
  onNavigate,
}) => {
  const t = translations[language];
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Initialize locations state
  const [locations, setLocations] = useState<ShoppingLocation[]>([
    { key: 'supermarket', label: t.locations.supermarket, often: false, sometimes: false },
    { key: 'discount', label: t.locations.discount, often: false, sometimes: false },
    { key: 'grocery', label: t.locations.grocery, often: false, sometimes: false },
    { key: 'bakery', label: t.locations.bakery, often: false, sometimes: false },
    { key: 'specialized', label: t.locations.specialized, often: false, sometimes: false },
    { key: 'frozen', label: t.locations.frozen, often: false, sometimes: false },
    { key: 'bio', label: t.locations.bio, often: false, sometimes: false },
    { key: 'market', label: t.locations.market, often: false, sometimes: false },
    { key: 'roadside', label: t.locations.roadside, often: false, sometimes: false },
    { key: 'produce', label: t.locations.produce, often: false, sometimes: false },
    { key: 'baskets', label: t.locations.baskets, often: false, sometimes: false },
    { key: 'mobile', label: t.locations.mobile, often: false, sometimes: false },
    { key: 'gas', label: t.locations.gas, often: false, sometimes: false },
    { key: 'food_aid', label: t.locations.food_aid, often: false, sometimes: false },
    { key: 'online', label: t.locations.online, often: false, sometimes: false },
    { key: 'personal', label: t.locations.personal, often: false, sometimes: false },
    { key: 'fishing', label: t.locations.fishing, often: false, sometimes: false },
    { key: 'received', label: t.locations.received, often: false, sometimes: false }
  ]);

  // Initialize reasons state for each location
  const [locationReasons, setLocationReasons] = useState<Record<string, ShoppingReasons>>({});

  // STC usage
  const [stcUsage, setStcUsage] = useState<'yes' | 'no' | ''>('');

  const handleLocationChange = (locationKey: string, frequency: 'often' | 'sometimes', checked: boolean) => {
    setLocations(prevLocations => 
      prevLocations.map(location => {
        if (location.key === locationKey) {
          const updated = { ...location };
          if (frequency === 'often') {
            updated.often = checked;
            if (checked) updated.sometimes = false; // Mutual exclusion
          } else {
            updated.sometimes = checked;
            if (checked) updated.often = false; // Mutual exclusion
          }
          return updated;
        }
        return location;
      })
    );
  };

  const handleReasonChange = (locationKey: string, reason: keyof ShoppingReasons, checked: boolean) => {
    setLocationReasons(prev => ({
      ...prev,
      [locationKey]: {
        ...prev[locationKey],
        [reason]: checked
      }
    }));
  };

  const handleNext = () => {
    if (currentQuestion < 3) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    console.log('Survey Data:', {
      locations,
      locationReasons,
      stcUsage
    });
    setSubmitted(true);
  };

  const getSelectedLocations = () => {
    return locations.filter(location => location.often || location.sometimes);
  };

  const canProceedFromQuestion1 = () => {
    return getSelectedLocations().length > 0;
  };

  const canProceedFromQuestion2 = () => {
    const selectedLocations = getSelectedLocations();
    return selectedLocations.every(location => 
      locationReasons[location.key] && 
      Object.values(locationReasons[location.key]).some(Boolean)
    );
  };

  const canSubmit = () => {
    return stcUsage !== '';
  };

  if (submitted) {
    return (
      <>
        <div className="app-header">
          <button onClick={onBack} className="header-icon">
            ←
          </button>
          <h1 className="app-header-title">
            {t.supplies}
          </h1>
          <div></div>
        </div>
        
        <div className="page-content-full">
          <div style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #f0f0f0'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: '#51cf66', marginBottom: '1rem' }}>{t.thankYou}</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>{t.surveyComplete}</p>
            <button 
              onClick={() => onNavigate('home')}
              className="btn btn-primary"
            >
              {t.back}
            </button>
          </div>
        </div>
      </>
    );
  }

  const renderQuestion = () => {
    switch (currentQuestion) {
      case 1:
        return (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #f0f0f0'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#333', fontSize: '1.2rem' }}>
              {t.question1}
            </h2>
            
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '2rem', fontWeight: '600', color: '#667eea' }}>
              <span style={{ flex: 1 }}></span>
              <span style={{ width: '80px', textAlign: 'center' }}>{t.often}</span>
              <span style={{ width: '80px', textAlign: 'center' }}>{t.sometimes}</span>
            </div>

            {locations.map((location) => (
              <div key={location.key} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem',
                borderBottom: '1px solid #f0f0f0',
                fontSize: '0.95rem'
              }}>
                <span style={{ flex: 1, color: '#333' }}>{location.label}</span>
                <div style={{ width: '80px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={location.often}
                    onChange={(e) => handleLocationChange(location.key, 'often', e.target.checked)}
                    style={{ transform: 'scale(1.2)' }}
                  />
                </div>
                <div style={{ width: '80px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={location.sometimes}
                    onChange={(e) => handleLocationChange(location.key, 'sometimes', e.target.checked)}
                    style={{ transform: 'scale(1.2)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 2:
        return (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #f0f0f0'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#333', fontSize: '1.2rem' }}>
              {t.question2}
            </h2>
            
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', fontWeight: '600', color: '#667eea', fontSize: '0.9rem' }}>
              <span style={{ flex: 1 }}></span>
              <span style={{ width: '70px', textAlign: 'center' }}>{t.reasons.prices}</span>
              <span style={{ width: '70px', textAlign: 'center' }}>{t.reasons.proximity}</span>
              <span style={{ width: '70px', textAlign: 'center' }}>{t.reasons.practicality}</span>
              <span style={{ width: '70px', textAlign: 'center' }}>{t.reasons.advertising}</span>
              <span style={{ width: '70px', textAlign: 'center' }}>{t.reasons.quality}</span>
              <span style={{ width: '70px', textAlign: 'center' }}>{t.reasons.other}</span>
            </div>

            {getSelectedLocations().map((location) => (
              <div key={location.key} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderBottom: '1px solid #f0f0f0',
                fontSize: '0.9rem'
              }}>
                <span style={{ flex: 1, color: '#333' }}>{location.label}</span>
                {Object.keys(t.reasons).map((reason) => (
                  <div key={reason} style={{ width: '70px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={locationReasons[location.key]?.[reason as keyof ShoppingReasons] || false}
                      onChange={(e) => handleReasonChange(location.key, reason as keyof ShoppingReasons, e.target.checked)}
                      style={{ transform: 'scale(1.1)' }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        );

      case 3:
        return (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #f0f0f0'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#333', fontSize: '1.2rem' }}>
              {t.question3}
            </h2>
            
            <div style={{ display: 'flex', gap: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="stc"
                  value="yes"
                  checked={stcUsage === 'yes'}
                  onChange={() => setStcUsage('yes')}
                  style={{ transform: 'scale(1.2)' }}
                />
                <span style={{ color: '#333', fontWeight: '500' }}>{t.yes}</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="stc"
                  value="no"
                  checked={stcUsage === 'no'}
                  onChange={() => setStcUsage('no')}
                  style={{ transform: 'scale(1.2)' }}
                />
                <span style={{ color: '#333', fontWeight: '500' }}>{t.no}</span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="app-header">
        <button onClick={onBack} className="header-icon">
          ←
        </button>
        <h1 className="app-header-title">
          {t.supplies}
        </h1>
        <div></div>
      </div>
      
      <div className="page-content-full">
        {/* Progress indicator */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '1rem',
          color: '#667eea',
          fontWeight: '500'
        }}>
          Question {currentQuestion} sur 3
        </div>

        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: '#f0f0f0',
          borderRadius: '3px',
          marginBottom: '2rem',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(currentQuestion / 3) * 100}%`,
            height: '100%',
            backgroundColor: '#667eea',
            borderRadius: '3px',
            transition: 'width 0.3s ease'
          }}></div>
        </div>

        {renderQuestion()}

        {/* Navigation buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          justifyContent: 'space-between'
        }}>
          {currentQuestion > 1 && (
            <button 
              onClick={handlePrevious}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              {t.previous}
            </button>
          )}
          
          {currentQuestion < 3 ? (
            <button 
              onClick={handleNext}
              className="btn btn-primary"
              style={{ flex: 1, marginLeft: currentQuestion === 1 ? 'auto' : '0' }}
              disabled={
                currentQuestion === 1 ? !canProceedFromQuestion1() :
                currentQuestion === 2 ? !canProceedFromQuestion2() : false
              }
            >
              {t.next}
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={!canSubmit()}
            >
              {t.submit}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default SuppliesPage;