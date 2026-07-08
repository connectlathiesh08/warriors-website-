document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('join-form');
  const successContainer = document.getElementById('success-container');
  
  // Navigation Buttons
  const backBtn = document.getElementById('back-btn');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');
  
  // Step Containers & Indicators
  const sections = [
    document.getElementById('form-section-1'),
    document.getElementById('form-section-2'),
    document.getElementById('form-section-3')
  ];
  
  const indicators = [
    document.getElementById('step-indicator-1'),
    document.getElementById('step-indicator-2'),
    document.getElementById('step-indicator-3')
  ];

  let currentStep = 0; // 0-indexed corresponding to Step 1

  function showStep(stepIndex) {
    sections.forEach((sec, idx) => {
      if (idx === stepIndex) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Update Indicators
    indicators.forEach((ind, idx) => {
      ind.className = 'form-step-item';
      if (idx === stepIndex) {
        ind.classList.add('active');
      } else if (idx < stepIndex) {
        ind.classList.add('completed');
        ind.innerHTML = '✔';
      } else {
        ind.innerHTML = idx + 1;
      }
    });

    // Toggle Navigation Buttons
    if (stepIndex === 0) {
      backBtn.style.display = 'none';
      nextBtn.style.display = 'inline-flex';
      submitBtn.style.display = 'none';
    } else if (stepIndex === sections.length - 1) {
      backBtn.style.display = 'inline-flex';
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'inline-flex';
    } else {
      backBtn.style.display = 'inline-flex';
      nextBtn.style.display = 'inline-flex';
      submitBtn.style.display = 'none';
    }
  }

  function validateCurrentStep() {
    const currentSection = sections[currentStep];
    const inputs = currentSection.querySelectorAll('input, select, textarea');
    let isValid = true;

    inputs.forEach(input => {
      // Basic check
      if (!input.checkValidity()) {
        isValid = false;
        input.style.borderColor = 'var(--color-secondary)';
        input.style.boxShadow = '0 0 0 3px rgba(216, 27, 96, 0.15)';
      } else {
        input.style.borderColor = '';
        input.style.boxShadow = '';
      }
    });

    return isValid;
  }

  // Next Button Click
  nextBtn.addEventListener('click', () => {
    if (validateCurrentStep()) {
      currentStep++;
      showStep(currentStep);
    }
  });

  // Back Button Click
  backBtn.addEventListener('click', () => {
    currentStep--;
    showStep(currentStep);
  });

  // Form Submit Handling
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateCurrentStep()) return;

    // Collect all data
    const registration = {
      id: "reg_" + Date.now(),
      name: document.getElementById('full-name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      age: document.getElementById('age').value,
      occupation: document.getElementById('occupation').value,
      institution: document.getElementById('institution').value,
      interest: document.getElementById('interest').value,
      motivation: document.getElementById('motivation').value,
      date: new Date().toISOString().split('T')[0],
      status: "Pending Review"
    };

    // Save to LocalStorage
    let registrations = JSON.parse(localStorage.getItem('warriors_registrations')) || [];
    registrations.push(registration);
    localStorage.setItem('warriors_registrations', JSON.stringify(registrations));

    // Hide form, show success
    form.style.display = 'none';
    successContainer.style.display = 'block';
  });
});
