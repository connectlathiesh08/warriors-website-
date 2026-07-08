// About Us Content Loader - Rotaract Bangalore Warriors
document.addEventListener('DOMContentLoaded', function() {
  var rawData = localStorage.getItem('warriors_about_us');
  if (rawData) {
    try {
      var data = JSON.parse(rawData);
      
      // Override Hero
      if (data.heroDesc) {
        var heroDescEl = document.getElementById('cms-hero-desc');
        if (heroDescEl) heroDescEl.textContent = data.heroDesc;
      }
      
      // Override Who We Are
      if (data.whoTitle) {
        var whoTitleEl = document.getElementById('cms-who-title');
        if (whoTitleEl) whoTitleEl.innerHTML = data.whoTitle.replace(/\n/g, '<br/>');
      }
      if (data.whoDesc) {
        var whoDescEl = document.getElementById('cms-who-desc');
        if (whoDescEl) whoDescEl.textContent = data.whoDesc;
      }
      
      // Override Mission/Vision/Purpose
      if (data.mission) {
        var missionEl = document.getElementById('cms-mission');
        if (missionEl) missionEl.textContent = data.mission;
      }
      if (data.vision) {
        var visionEl = document.getElementById('cms-vision');
        if (visionEl) visionEl.textContent = data.vision;
      }
      if (data.purpose) {
        var purposeEl = document.getElementById('cms-purpose');
        if (purposeEl) purposeEl.textContent = data.purpose;
      }
    } catch (e) {
      console.error('Failed to parse warriors_about_us from localStorage:', e);
    }
  }
});
