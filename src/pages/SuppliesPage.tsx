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

const SuppliesPage: React.FC<SuppliesPageProps> = ({
  language,
  onBack,
  onNavigate,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const totalQuestions = 10;

  // Q1: Shopping locations
  const locationLabels = {
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
  };

  const [locations, setLocations] = useState<ShoppingLocation[]>(
    Object.entries(locationLabels).map(([key, label]) => ({
      key,
      label,
      often: false,
      sometimes: false
    }))
  );

  // Q2: Reasons
  const [locationReasons, setLocationReasons] = useState<Record<string, ShoppingReasons>>({});

  // Q3: STC usage
  const [stcUsage, setStcUsage] = useState<'yes' | 'no' | ''>('');

  // Q4: Household expense attention
  const [expenseAttention, setExpenseAttention] = useState<'yes' | 'no' | ''>('');

  // Q5: Expense adjustments
  const [expenseAdjustments, setExpenseAdjustments] = useState<Record<string, number>>({});

  // Q6: Food security
  const [foodSecurity, setFoodSecurity] = useState<Record<string, boolean>>({});

  // Q7: Meal quality
  const [mealQuality, setMealQuality] = useState<Record<string, boolean>>({});

  // Q8: Cooking frequency
  const [cookingFreq, setCookingFreq] = useState<string>('');

  // Q9: Diet changes
  const [dietChanges, setDietChanges] = useState<Record<string, boolean>>({});

  // Q10: Food concerns
  const [foodConcerns, setFoodConcerns] = useState<Record<string, boolean>>({});

  const handleLocationChange = (locationKey: string, frequency: 'often' | 'sometimes', checked: boolean) => {
    setLocations(prevLocations => 
      prevLocations.map(location => {
        if (location.key === locationKey) {
          const updated = { ...location };
          if (frequency === 'often') {
            updated.often = checked;
            if (checked) updated.sometimes = false;
          } else {
            updated.sometimes = checked;
            if (checked) updated.often = false;
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
        ...(prev[locationKey] || {}),
        [reason]: checked
      }
    }));
  };

  const handleNext = () => {
    if (currentQuestion === 4 && expenseAttention === 'no') {
      setCurrentQuestion(6); // Skip Q5
    } else if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion === 6 && expenseAttention === 'no') {
      setCurrentQuestion(4); // Skip Q5 going back
    } else if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Survey Data:', {
      locations,
      locationReasons,
      stcUsage,
      expenseAttention,
      expenseAdjustments,
      foodSecurity,
      mealQuality,
      cookingFreq,
      dietChanges,
      foodConcerns
    });
    setSubmitted(true);
  };

  const getSelectedLocations = () => locations.filter(l => l.often || l.sometimes);

  if (submitted) {
    return (
      <>
        <div className="app-header">
          <button onClick={onBack} className="header-icon">←</button>
          <h1 className="app-header-title">Approvisionnements</h1>
          <div></div>
        </div>
        <div className="page-content-full">
          <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: '#51cf66', marginBottom: '1rem' }}>Merci pour votre participation !</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Votre réponse a été enregistrée avec succès.</p>
            <button onClick={() => onNavigate('home')} className="btn btn-primary">Retour</button>
          </div>
        </div>
      </>
    );
  }

  const renderQuestion = () => {
    const boxStyle = { background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' };
    const titleStyle = { marginBottom: '1.5rem', color: '#333', fontSize: '1.2rem' };

    switch (currentQuestion) {
      case 1:
        return (
          <div style={boxStyle}>
            <h2 style={titleStyle}>Où faites-vous vos courses ?</h2>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '2rem', fontWeight: '600', color: '#667eea' }}>
              <span style={{ flex: 1 }}></span>
              <span style={{ width: '80px', textAlign: 'center' }}>Souvent</span>
              <span style={{ width: '80px', textAlign: 'center' }}>Parfois</span>
            </div>
            {locations.map((location) => (
              <div key={location.key} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderBottom: '1px solid #f0f0f0', fontSize: '0.95rem' }}>
                <span style={{ flex: 1, color: '#333' }}>{location.label}</span>
                <div style={{ width: '80px', textAlign: 'center' }}>
                  <input type="checkbox" checked={location.often} onChange={(e) => handleLocationChange(location.key, 'often', e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                </div>
                <div style={{ width: '80px', textAlign: 'center' }}>
                  <input type="checkbox" checked={location.sometimes} onChange={(e) => handleLocationChange(location.key, 'sometimes', e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                </div>
              </div>
            ))}
          </div>
        );

      case 2:
        const reasons = ['prices', 'proximity', 'practicality', 'advertising', 'quality', 'other'];
        const reasonLabels = { prices: 'Les prix', proximity: 'La proximité', practicality: 'La praticité', advertising: 'La publicité/Promotion', quality: 'La qualité', other: 'Autres' };
        return (
          <div style={{...boxStyle, overflowX: 'auto'}}>
            <h2 style={titleStyle}>Quelles sont parmi les suivantes les raisons pour lesquelles vous avez fréquenté ces lieux durant ces 4 dernières semaines (plusieurs raisons possibles) ?</h2>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', fontWeight: '600', color: '#667eea', fontSize: '0.85rem' }}>
              <span style={{ flex: 1, minWidth: '150px' }}></span>
              {reasons.map(r => <span key={r} style={{ width: '60px', textAlign: 'center' }}>{reasonLabels[r as keyof typeof reasonLabels]}</span>)}
            </div>
            {getSelectedLocations().map((location) => (
              <div key={location.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderBottom: '1px solid #f0f0f0', fontSize: '0.85rem' }}>
                <span style={{ flex: 1, minWidth: '150px', color: '#333' }}>{location.label}</span>
                {reasons.map(reason => (
                  <div key={reason} style={{ width: '60px', textAlign: 'center' }}>
                    <input type="checkbox" checked={locationReasons[location.key]?.[reason as keyof ShoppingReasons] || false} onChange={(e) => handleReasonChange(location.key, reason as keyof ShoppingReasons, e.target.checked)} style={{ transform: 'scale(1.1)' }} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        );

      case 3:
        return (
          <div style={boxStyle}>
            <h2 style={titleStyle}>Utilisez-vous le STC (subventionnés) pour faire vos achats alimentaires ?</h2>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="stc" checked={stcUsage === 'yes'} onChange={() => setStcUsage('yes')} style={{ transform: 'scale(1.2)' }} />
                <span style={{ color: '#333', fontWeight: '500' }}>Oui</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="stc" checked={stcUsage === 'no'} onChange={() => setStcUsage('no')} style={{ transform: 'scale(1.2)' }} />
                <span style={{ color: '#333', fontWeight: '500' }}>Non</span>
              </label>
            </div>
          </div>
        );

      case 4:
        return (
          <div style={boxStyle}>
            <h2 style={titleStyle}>Au cours des quatre dernières semaines, vous est-il arrivé de devoir faire attention à vos dépenses totales du foyer (loyer, factures diverses, alimentation, loisirs...) ?</h2>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="expense" checked={expenseAttention === 'yes'} onChange={() => setExpenseAttention('yes')} style={{ transform: 'scale(1.2)' }} />
                <span style={{ color: '#333', fontWeight: '500' }}>Oui</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="expense" checked={expenseAttention === 'no'} onChange={() => setExpenseAttention('no')} style={{ transform: 'scale(1.2)' }} />
                <span style={{ color: '#333', fontWeight: '500' }}>Non</span>
              </label>
            </div>
          </div>
        );

      case 5:
        const expensePosts = {
          food: "Alimentation (quantité, qualité, produits achetés)",
          housing: "Logement (loyer, réparations, charges)",
          transport: "Transports (essence, entretien, déplacements)",
          health: "Santé (consultations, soins, médicaments)",
          energy: "Énergie (gaz, climatisation,...)",
          communication: "Communication (téléphone, internet)",
          leisure: "Loisirs et sorties (restaurant...)",
          personal: "Achats personnels (vêtements, électroménager, etc.)",
          tobacco: "Cigarettes et Alcool",
          other: "Autre"
        };
        return (
          <div style={boxStyle}>
            <h2 style={titleStyle}>Si oui, dans quels domaines avez-vous ajusté vos dépenses ?</h2>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', fontWeight: '600', color: '#667eea' }}>
              <span style={{ flex: 1 }}>Poste</span>
              <span style={{ width: '100px', textAlign: 'center' }}>Classement</span>
            </div>
            {Object.entries(expensePosts).map(([key, label]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderBottom: '1px solid #f0f0f0', fontSize: '0.95rem' }}>
                <span style={{ flex: 1, color: '#333' }}>{label}</span>
                <div style={{ width: '100px', textAlign: 'center' }}>
                  <input type="number" min="0" max="10" value={expenseAdjustments[key] || ''} onChange={(e) => setExpenseAdjustments(prev => ({...prev, [key]: parseInt(e.target.value) || 0}))} style={{ width: '60px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e0e0e0', textAlign: 'center' }} />
                </div>
              </div>
            ))}
          </div>
        );

      case 6:
        const foodSecItems = {
          worried: "Vous avez été inquiet(e) de ne pas avoir assez à manger (pour vous ou vos proches).",
          noNutritious: "Vous ne pouviez pas manger des aliments nourrissants.",
          noHealthy: "Vous ne pouviez pas manger des aliments bons pour la santé.",
          sameThing: "Vous mangiez presque toujours la même chose.",
          skippedMeal: "Vous aviez dû sauter un repas.",
          notEnough: "Vous n'avez pas mangé autant qu'il aurait fallu.",
          nothingHome: "Il n'y avait plus rien à manger à la maison.",
          hungry: "Vous aviez faim mais n'avez pas mangé.",
          nothingAllDay: "Vous n'aviez rien mangé de toute la journée."
        };
        return (
          <div style={boxStyle}>
            <h2 style={titleStyle}>À un moment au cours des 4 dernières semaines, vous êtes-vous trouvé(e) dans une situation où, faute de moyens :</h2>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '2rem', fontWeight: '600', color: '#667eea' }}>
              <span style={{ flex: 1 }}></span>
              <span style={{ width: '80px', textAlign: 'center' }}>Oui</span>
              <span style={{ width: '80px', textAlign: 'center' }}>Non</span>
            </div>
            {Object.entries(foodSecItems).map(([key, item]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderBottom: '1px solid #f0f0f0', fontSize: '0.95rem' }}>
                <span style={{ flex: 1, color: '#333' }}>{item}</span>
                <div style={{ width: '80px', textAlign: 'center' }}>
                  <input type="radio" name={`fs_${key}`} checked={foodSecurity[key] === true} onChange={() => setFoodSecurity(prev => ({ ...prev, [key]: true }))} style={{ transform: 'scale(1.2)' }} />
                </div>
                <div style={{ width: '80px', textAlign: 'center' }}>
                  <input type="radio" name={`fs_${key}`} checked={foodSecurity[key] === false} onChange={() => setFoodSecurity(prev => ({ ...prev, [key]: false }))} style={{ transform: 'scale(1.2)' }} />
                </div>
              </div>
            ))}
          </div>
        );

      case 7:
        const mealQualityReasons = {
          unexpected: "Imprévus",
          contextConstraint: "Contrainte de contexte, de lieu",
          insufficientTime: "Temps insuffisant",
          tempting: "Aspect ou odeur attractifs et tentant",
          insufficientMeans: "Moyens insuffisants",
          notAloneDeciding: "Pas seul.e à décider",
          inadequateOffer: "Offre inadaptée",
          will: "Volonté",
          unavailableFamily: "Indisponibilité des proches",
          emotions: "Les émotions (angoisses, tristesse, ...)",
          other: "Autre"
        };
        return (
          <div style={boxStyle}>
            <h2 style={titleStyle}>Au cours des quatre dernières semaines, pouvez-vous indiquer les éléments qui ont pu vous amener à penser que ce que vous mangiez n'était pas un "bon repas" tel que vous l'envisagez ?</h2>
            {Object.entries(mealQualityReasons).map(([key, reason]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderBottom: '1px solid #f0f0f0', fontSize: '0.95rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}>
                  <input type="checkbox" checked={mealQuality[key] || false} onChange={(e) => setMealQuality(prev => ({ ...prev, [key]: e.target.checked }))} style={{ transform: 'scale(1.2)' }} />
                  <span style={{ color: '#333' }}>{reason}</span>
                </label>
              </div>
            ))}
          </div>
        );

      case 8:
        const cookingOptions = {
          everyday: "Tous les jours",
          twoThree: "2 ou 3 fois par semaine",
          once: "1 fois par semaine",
          never: "0 fois"
        };
        return (
          <div style={boxStyle}>
            <h2 style={titleStyle}>Au cours des quatre dernières semaines, à quelle fréquence avez-vous cuisiné ?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(cookingOptions).map(([key, freq]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="cooking" value={key} checked={cookingFreq === key} onChange={() => setCookingFreq(key)} style={{ transform: 'scale(1.2)' }} />
                  <span style={{ color: '#333', fontWeight: '500' }}>{freq}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 9:
        const dietChangeReasons = {
          wellness: "Pour améliorer ma forme et mon bien-être.",
          lifeThreat: "Parce que ma vie ou celle de mes proches est en jeu.",
          ethics: "Pour des raisons de convictions et d'éthique (écologie, BEA…).",
          lifestyleChange: "Du fait d'un changement de mode de vie (travail, horaires, déménagement).",
          familyChange: "Suite à un changement de schéma familial (vie en couple, séparation, naissance…).",
          alone: "Du fait de me retrouver seul.e.",
          noAlternative: "Parce que je n'avais pas d'autres alternatives : pénurie alimentaire, obligation réglementaire…"
        };
        return (
          <div style={boxStyle}>
            <h2 style={titleStyle}>Lors des 4 dernières semaines, avez-vous modifié ou voulu modifier votre alimentation pour une des raisons suivantes ?</h2>
            {Object.entries(dietChangeReasons).map(([key, reason]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderBottom: '1px solid #f0f0f0', fontSize: '0.95rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}>
                  <input type="checkbox" checked={dietChanges[key] || false} onChange={(e) => setDietChanges(prev => ({ ...prev, [key]: e.target.checked }))} style={{ transform: 'scale(1.2)' }} />
                  <span style={{ color: '#333' }}>{reason}</span>
                </label>
              </div>
            ))}
          </div>
        );

      case 10:
        const concerns = {
          none: "Aucune préoccupation",
          priceIncrease: "Hausse des prix",
          health: "Effets sur la santé",
          tradition: "Perte de tradition et d'identité",
          body: "Effets sur le corps (prise de poids,...)",
          shortage: "Pénuries, crises, manque de nourriture",
          quality: "Qualité ou fraîcheur des produits vendus",
          imported: "Produits importés (traçabilité, qualité, conditions de production)",
          recalls: "Rappels de produits pour des raisons sanitaires",
          equity: "Équité du système alimentaire",
          future: "Avenir pour nos enfants",
          processed: "Produits (ultra) transformés",
          environment: "Effets sur l'environnement"
        };
        return (
          <div style={boxStyle}>
            <h2 style={titleStyle}>Au cours des quatre dernières semaines, avez-vous eu des préoccupations par rapport à l'alimentation ?</h2>
            {Object.entries(concerns).map(([key, concern]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderBottom: '1px solid #f0f0f0', fontSize: '0.95rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}>
                  <input type="checkbox" checked={foodConcerns[key] || false} onChange={(e) => setFoodConcerns(prev => ({ ...prev, [key]: e.target.checked }))} style={{ transform: 'scale(1.2)' }} />
                  <span style={{ color: '#333' }}>{concern}</span>
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="app-header">
        <button onClick={onBack} className="header-icon">←</button>
        <h1 className="app-header-title">Approvisionnements</h1>
        <div></div>
      </div>
      
      <div className="page-content-full">
        <div style={{ textAlign: 'center', marginBottom: '1rem', color: '#667eea', fontWeight: '500' }}>
          Question {currentQuestion} sur {totalQuestions}
        </div>

        <div style={{ width: '100%', height: '6px', backgroundColor: '#f0f0f0', borderRadius: '3px', marginBottom: '2rem', overflow: 'hidden' }}>
          <div style={{ width: `${(currentQuestion / totalQuestions) * 100}%`, height: '100%', backgroundColor: '#667eea', borderRadius: '3px', transition: 'width 0.3s ease' }}></div>
        </div>

        {renderQuestion()}

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'space-between' }}>
          {currentQuestion > 1 && (
            <button onClick={handlePrevious} className="btn btn-secondary" style={{ flex: 1 }}>Précédent</button>
          )}
          
          {currentQuestion < totalQuestions ? (
            <button onClick={handleNext} className="btn btn-primary" style={{ flex: 1, marginLeft: currentQuestion === 1 ? 'auto' : '0' }}>Suivant</button>
          ) : (
            <button onClick={handleSubmit} className="btn btn-primary" style={{ flex: 1 }}>Soumettre</button>
          )}
        </div>
      </div>
    </>
  );
};

export default SuppliesPage;
