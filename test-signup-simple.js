const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testSignup() {
  console.log('🚀 Démarrage des tests de création de compte...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    args: ['--window-size=1920,1080']
  });

  try {
    // Test 1: Création d'un compte Acheteur
    console.log('📝 Test 1: Création d\'un compte Acheteur');
    console.log('=' .repeat(50));
    
    const page1 = await browser.newPage();
    await page1.setViewport({ width: 1920, height: 1080 });
    
    console.log('→ Navigation vers http://localhost:8080/signup');
    await page1.goto('http://localhost:8080/signup', { waitUntil: 'networkidle2' });
    await delay(2000);
    await page1.screenshot({ path: 'screenshot-1-initial.png' });
    
    // Sélectionner le rôle "Acheteur"
    console.log('→ Sélection du rôle "Acheteur"');
    await page1.evaluate(() => {
      const buyerRadio = document.querySelector('input[value="buyer"]');
      if (buyerRadio) buyerRadio.click();
    });
    await delay(1000);
    await page1.screenshot({ path: 'screenshot-2-buyer-selected.png' });
    
    // Sélectionner "Particulier"
    console.log('→ Sélection du type "Particulier"');
    await page1.evaluate(() => {
      const particulierRadio = document.querySelector('input[value="particulier"]');
      if (particulierRadio) particulierRadio.click();
    });
    await delay(1000);
    
    // Sélectionner le pays "Madagascar"
    console.log('→ Sélection du pays "Madagascar"');
    await page1.evaluate(() => {
      const combobox = document.querySelector('button[role="combobox"]');
      if (combobox) combobox.click();
    });
    await delay(1000);
    
    await page1.evaluate(() => {
      const options = Array.from(document.querySelectorAll('[role="option"]'));
      const madagascarOption = options.find(opt => opt.textContent.includes('Madagascar'));
      if (madagascarOption) madagascarOption.click();
    });
    await delay(1000);
    await page1.screenshot({ path: 'screenshot-3-country-selected.png' });
    
    // Remplir les informations personnelles
    const buyerData = {
      name: 'Jean Rakoto',
      email: `acheteur.test.${Date.now()}@example.com`,
      password: 'Test123456',
      phone: '+261341234567',
      city: 'Antananarivo'
    };
    
    console.log('→ Remplissage des informations personnelles');
    console.log(`   Nom: ${buyerData.name}`);
    console.log(`   Email: ${buyerData.email}`);
    
    await page1.type('#name', buyerData.name, { delay: 50 });
    await page1.type('#email', buyerData.email, { delay: 50 });
    await page1.type('#password', buyerData.password, { delay: 50 });
    await page1.type('#confirmPassword', buyerData.password, { delay: 50 });
    await page1.type('#phone', buyerData.phone, { delay: 50 });
    await page1.type('#city', buyerData.city, { delay: 50 });
    
    await delay(1000);
    await page1.screenshot({ path: 'screenshot-4-form-filled.png' });
    
    // Soumettre le formulaire
    console.log('→ Soumission du formulaire...');
    await page1.click('button[type="submit"]');
    
    // Attendre la réponse
    await delay(5000);
    await page1.screenshot({ path: 'screenshot-5-after-submit.png' });
    
    const currentUrl = page1.url();
    console.log(`→ URL actuelle: ${currentUrl}`);
    
    // Vérifier s'il y a des messages d'erreur ou de succès
    const pageContent = await page1.content();
    if (pageContent.includes('succès') || pageContent.includes('success')) {
      console.log('✅ Compte Acheteur créé avec succès!\n');
    } else if (pageContent.includes('erreur') || pageContent.includes('error')) {
      console.log('❌ Erreur lors de la création du compte Acheteur\n');
    } else {
      console.log('⚠️  Statut incertain - vérifiez les captures d\'écran\n');
    }
    
    await delay(2000);
    await page1.close();
    
    // Test 2: Création d'un compte Artisan
    console.log('\n📝 Test 2: Création d\'un compte Artisan');
    console.log('=' .repeat(50));
    
    const page2 = await browser.newPage();
    await page2.setViewport({ width: 1920, height: 1080 });
    
    console.log('→ Navigation vers http://localhost:8080/signup');
    await page2.goto('http://localhost:8080/signup', { waitUntil: 'networkidle2' });
    await delay(2000);
    await page2.screenshot({ path: 'screenshot-artisan-1-initial.png' });
    
    // Sélectionner le rôle "Artisan"
    console.log('→ Sélection du rôle "Artisan"');
    await page2.evaluate(() => {
      const artisanRadio = document.querySelector('input[value="artisan"]');
      if (artisanRadio) artisanRadio.click();
    });
    await delay(2000);
    await page2.screenshot({ path: 'screenshot-artisan-2-role-selected.png' });
    
    // Remplir les informations de base
    const artisanData = {
      name: 'Marie Rasoamalala',
      email: `artisan.test.${Date.now()}@example.com`,
      password: 'Test123456',
      phone: '+261339876543',
      city: 'Fianarantsoa'
    };
    
    console.log('→ Remplissage des informations de base');
    console.log(`   Nom: ${artisanData.name}`);
    console.log(`   Email: ${artisanData.email}`);
    
    await page2.type('#name', artisanData.name, { delay: 50 });
    await page2.type('#email', artisanData.email, { delay: 50 });
    await page2.type('#password', artisanData.password, { delay: 50 });
    await page2.type('#confirmPassword', artisanData.password, { delay: 50 });
    await page2.type('#phone', artisanData.phone, { delay: 50 });
    await page2.type('#city', artisanData.city, { delay: 50 });
    
    await delay(1000);
    await page2.screenshot({ path: 'screenshot-artisan-3-basic-info.png' });
    
    // Navigation à travers les étapes
    for (let step = 1; step <= 4; step++) {
      console.log(`→ Étape ${step}/5`);
      await delay(1000);
      
      // Remplir les champs selon l'étape
      if (step === 2) {
        // Langues
        await page2.evaluate(() => {
          const francais = document.querySelector('#Français');
          const malagasy = document.querySelector('#Malagasy');
          if (francais) francais.click();
          if (malagasy) malagasy.click();
        });
      } else if (step === 3) {
        // Nom de l'entreprise
        try {
          await page2.waitForSelector('#artisanCompanyName', { timeout: 5000 });
          await page2.type('#artisanCompanyName', 'Atelier Marie Vannerie', { delay: 50 });
        } catch (e) {
          console.log('   ⚠️  Champ artisanCompanyName non trouvé, passage à l\'étape suivante');
        }
      } else if (step === 4) {
        // Informations artisanales
        await delay(500);
        
        try {
          // Spécialité
          await page2.evaluate(() => {
            const comboboxes = document.querySelectorAll('button[role="combobox"]');
            if (comboboxes[0]) comboboxes[0].click();
          });
          await delay(1000);
          await page2.evaluate(() => {
            const options = Array.from(document.querySelectorAll('[role="option"]'));
            const vannerie = options.find(opt => opt.textContent.includes('Vannerie'));
            if (vannerie) vannerie.click();
          });
          await delay(1000);
          
          // Compétences
          await page2.evaluate(() => {
            const vannerie = document.querySelector('#Vannerie');
            const textile = document.querySelector('#Textile');
            if (vannerie) vannerie.click();
            if (textile) textile.click();
          });
          await delay(500);
          
          // Expérience
          await page2.evaluate(() => {
            const comboboxes = document.querySelectorAll('button[role="combobox"]');
            if (comboboxes.length > 1) comboboxes[1].click();
          });
          await delay(1000);
          await page2.evaluate(() => {
            const options = Array.from(document.querySelectorAll('[role="option"]'));
            const exp = options.find(opt => opt.textContent.includes('5 à 10 ans'));
            if (exp) exp.click();
          });
          await delay(1000);
          
          // Description
          await page2.waitForSelector('#activityDescription', { timeout: 5000 });
          await page2.type('#activityDescription', 'Je crée des paniers et objets décoratifs en raphia et fibres naturelles de Madagascar.', { delay: 30 });
        } catch (e) {
          console.log('   ⚠️  Erreur lors du remplissage de l\'étape 4:', e.message);
        }
      }
      
      await delay(1000);
      await page2.screenshot({ path: `screenshot-artisan-step-${step}.png` });
      
      // Cliquer sur Suivant
      await page2.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const nextButton = buttons.find(btn => btn.textContent.includes('Suivant'));
        if (nextButton) nextButton.click();
      });
      await delay(2000);
    }
    
    // Étape 5: Offres et documents
    console.log('→ Étape 5/5: Offres et documents');
    await page2.evaluate(() => {
      const both = document.querySelector('#both');
      if (both) both.click();
    });
    await delay(500);
    
    await page2.evaluate(() => {
      const noDocuments = document.querySelector('#documentsNotAvailable');
      if (noDocuments) noDocuments.click();
    });
    await delay(1000);
    await page2.screenshot({ path: 'screenshot-artisan-step-5.png' });
    
    // Soumettre le formulaire final
    console.log('→ Soumission du formulaire artisan...');
    await page2.click('button[type="submit"]');
    
    await delay(5000);
    await page2.screenshot({ path: 'screenshot-artisan-final.png' });
    
    const currentUrl2 = page2.url();
    console.log(`→ URL actuelle: ${currentUrl2}`);
    
    const pageContent2 = await page2.content();
    if (pageContent2.includes('succès') || pageContent2.includes('success') || pageContent2.includes('validation')) {
      console.log('✅ Compte Artisan créé avec succès!\n');
    } else if (pageContent2.includes('erreur') || pageContent2.includes('error')) {
      console.log('❌ Erreur lors de la création du compte Artisan\n');
    } else {
      console.log('⚠️  Statut incertain - vérifiez les captures d\'écran\n');
    }
    
    await delay(3000);
    
    console.log('\n' + '='.repeat(50));
    console.log('✨ Tests terminés!');
    console.log('📸 Captures d\'écran sauvegardées dans le répertoire courant');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

testSignup().catch(console.error);

// Made with Bob
