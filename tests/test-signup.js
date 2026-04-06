const puppeteer = require('puppeteer');

// Helper function pour remplacer waitForTimeout
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testSignup() {
  console.log('🚀 Démarrage des tests de création de compte...\n');
  
  const browser = await puppeteer.launch({
    headless: false, // Mode visible pour voir les actions
    slowMo: 100, // Ralentir pour mieux voir
    args: ['--window-size=1920,1080']
  });

  try {
    // Test 1: Création d'un compte Acheteur
    console.log('📝 Test 1: Création d\'un compte Acheteur');
    console.log('=' .repeat(50));
    
    const page1 = await browser.newPage();
    await page1.setViewport({ width: 1920, height: 1080 });
    
    // Naviguer vers la page d'inscription
    console.log('→ Navigation vers http://localhost:8080/signup');
    await page1.goto('http://localhost:8080/signup', { waitUntil: 'networkidle2' });
    await delay(1000);
    
    // Sélectionner le rôle "Acheteur"
    console.log('→ Sélection du rôle "Acheteur"');
    await page1.click('input[value="buyer"]');
    await delay(500);
    
    // Sélectionner "Particulier"
    console.log('→ Sélection du type "Particulier"');
    await page1.click('input[value="particulier"]');
    await delay(500);
    
    // Sélectionner le pays "Madagascar"
    console.log('→ Sélection du pays "Madagascar"');
    await page1.click('button[role="combobox"]'); // Ouvrir le select
    await delay(1000);
    // Attendre que le menu soit visible et cliquer sur Madagascar
    await page1.waitForSelector('[role="option"]');
    const options = await page1.$$('[role="option"]');
    for (const option of options) {
      const text = await option.evaluate(el => el.textContent);
      if (text && text.includes('Madagascar')) {
        await option.click();
        break;
      }
    }
    await delay(500);
    
    // Remplir les informations personnelles
    const buyerData = {
      name: 'Jean Rakoto',
      email: `acheteur.test.${Date.now()}@example.com`,
      password: 'Test123456',
      phone: '+261 34 12 345 67',
      city: 'Antananarivo'
    };
    
    console.log('→ Remplissage des informations personnelles');
    console.log(`   Nom: ${buyerData.name}`);
    console.log(`   Email: ${buyerData.email}`);
    
    await page1.type('#name', buyerData.name);
    await page1.type('#email', buyerData.email);
    await page1.type('#password', buyerData.password);
    await page1.type('#confirmPassword', buyerData.password);
    await page1.type('#phone', buyerData.phone);
    await page1.type('#city', buyerData.city);
    
    await delay(1000);
    
    // Soumettre le formulaire
    console.log('→ Soumission du formulaire...');
    await page1.click('button[type="submit"]');
    
    // Attendre la réponse (succès ou erreur)
    await delay(3000);
    
    // Vérifier si on est redirigé ou s'il y a un message
    const currentUrl = page1.url();
    console.log(`→ URL actuelle: ${currentUrl}`);
    
    if (currentUrl.includes('/products') || currentUrl.includes('/dashboard')) {
      console.log('✅ Compte Acheteur créé avec succès!\n');
    } else {
      console.log('⚠️  Vérification du résultat nécessaire\n');
    }
    
    await delay(2000);
    await page1.close();
    
    // Test 2: Création d'un compte Artisan
    console.log('\n📝 Test 2: Création d\'un compte Artisan');
    console.log('=' .repeat(50));
    
    const page2 = await browser.newPage();
    await page2.setViewport({ width: 1920, height: 1080 });
    
    // Naviguer vers la page d'inscription
    console.log('→ Navigation vers http://localhost:8080/signup');
    await page2.goto('http://localhost:8080/signup', { waitUntil: 'networkidle2' });
    await delay(1000);
    
    // Sélectionner le rôle "Artisan"
    console.log('→ Sélection du rôle "Artisan"');
    await page2.click('input[value="artisan"]');
    await delay(1000);
    
    // Remplir les informations de base
    const artisanData = {
      name: 'Marie Rasoamalala',
      email: `artisan.test.${Date.now()}@example.com`,
      password: 'Test123456',
      phone: '+261 33 98 765 43',
      city: 'Fianarantsoa'
    };
    
    console.log('→ Remplissage des informations de base');
    console.log(`   Nom: ${artisanData.name}`);
    console.log(`   Email: ${artisanData.email}`);
    
    await page2.type('#name', artisanData.name);
    await page2.type('#email', artisanData.email);
    await page2.type('#password', artisanData.password);
    await page2.type('#confirmPassword', artisanData.password);
    await page2.type('#phone', artisanData.phone);
    await page2.type('#city', artisanData.city);
    
    await delay(1000);
    
    // Étape 1: Photos (optionnel - on passe)
    console.log('→ Étape 1/5: Photos (passée)');
    const nextButton1 = await page2.waitForSelector('xpath/.//button[contains(text(), "Suivant")]');
    await nextButton1.click();
    await delay(1000);
    
    // Étape 2: Informations complémentaires (optionnel)
    console.log('→ Étape 2/5: Informations complémentaires');
    // Sélectionner quelques langues
    await page2.click('#Français');
    await page2.click('#Malagasy');
    await delay(500);
    const nextButton2 = await page2.waitForSelector('xpath/.//button[contains(text(), "Suivant")]');
    await nextButton2.click();
    await delay(1000);
    
    // Étape 3: Compte artisan
    console.log('→ Étape 3/5: Compte artisan');
    await page2.type('#artisanCompanyName', 'Atelier Marie Vannerie');
    await delay(500);
    const nextButton3 = await page2.waitForSelector('xpath/.//button[contains(text(), "Suivant")]');
    await nextButton3.click();
    await delay(1000);
    
    // Étape 4: Informations artisanales
    console.log('→ Étape 4/5: Informations artisanales');
    
    // Sélectionner la spécialité
    await page2.click('button[role="combobox"]'); // Ouvrir le select de spécialité
    await delay(1000);
    await page2.waitForSelector('[role="option"]');
    const specialtyOptions = await page2.$$('[role="option"]');
    for (const option of specialtyOptions) {
      const text = await option.evaluate(el => el.textContent);
      if (text && text.includes('Vannerie')) {
        await option.click();
        break;
      }
    }
    await delay(500);
    
    // Sélectionner quelques compétences
    await page2.click('#Vannerie');
    await page2.click('#Textile');
    await delay(500);
    
    // Années d'expérience
    const comboboxes = await page2.$$('button[role="combobox"]');
    if (comboboxes.length > 1) {
      await comboboxes[1].click(); // Le deuxième combobox est pour l'expérience
    }
    await delay(1000);
    await page2.waitForSelector('[role="option"]');
    const expOptions = await page2.$$('[role="option"]');
    for (const option of expOptions) {
      const text = await option.evaluate(el => el.textContent);
      if (text && text.includes('5 à 10 ans')) {
        await option.click();
        break;
      }
    }
    await delay(500);
    
    // Description
    await page2.type('#activityDescription', 'Je crée des paniers et objets décoratifs en raphia et fibres naturelles de Madagascar. Mon travail allie tradition et modernité.');
    await delay(500);
    
    const nextButton4 = await page2.waitForSelector('xpath/.//button[contains(text(), "Suivant")]');
    await nextButton4.click();
    await delay(1000);
    
    // Étape 5: Offres et documents
    console.log('→ Étape 5/5: Offres et documents');
    
    // Sélectionner les offres
    await page2.click('#both'); // Produits et ateliers
    await delay(500);
    
    // Documents (optionnel)
    await page2.click('#documentsNotAvailable');
    await delay(1000);
    
    // Soumettre le formulaire final
    console.log('→ Soumission du formulaire artisan...');
    await page2.click('button[type="submit"]');
    
    // Attendre la réponse
    await delay(3000);
    
    // Vérifier le résultat
    const currentUrl2 = page2.url();
    console.log(`→ URL actuelle: ${currentUrl2}`);
    
    if (currentUrl2.includes('/artisan-dashboard') || currentUrl2.includes('/dashboard')) {
      console.log('✅ Compte Artisan créé avec succès!\n');
    } else {
      console.log('⚠️  Vérification du résultat nécessaire\n');
    }
    
    await delay(3000);
    
    console.log('\n' + '='.repeat(50));
    console.log('✨ Tests terminés!');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

// Exécuter les tests
testSignup().catch(console.error);

// Made with Bob
