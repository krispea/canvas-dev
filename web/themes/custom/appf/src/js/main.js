/**
 * @file
 * Main JavaScript entry point for APPF theme.
 */

// Import Alpine.js for lightweight interactivity
import Alpine from 'alpinejs';

// Make Alpine available globally
window.Alpine = Alpine;

// Initialize Alpine
Alpine.start();

/**
 * Drupal behaviors for theme initialization.
 */
(function (Drupal) {
  'use strict';

  /**
   * APPF theme behavior.
   */
  Drupal.behaviors.appfTheme = {
    attach: function (context, settings) {
      // Theme initialization code here
      console.log('APPF theme initialized');

      // Example: Add smooth scroll behavior
      const smoothScrollLinks = context.querySelectorAll('a[href^="#"]');
      smoothScrollLinks.forEach(link => {
        if (link.dataset.appfProcessed) {
          return;
        }
        link.dataset.appfProcessed = true;

        link.addEventListener('click', function(e) {
          const targetId = this.getAttribute('href');
          if (targetId === '#') return;

          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    }
  };

})(Drupal);
