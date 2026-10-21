// Focused website: the phone menu, the footer year and the shul request form.
// No libraries and no tracking.

(function () {
  // Lets the CSS hide the menu links behind the menu button on phones.
  // Without JavaScript the links simply stay visible.
  document.documentElement.classList.add('js');

  // ---------- Phone menu ----------

  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.menu-toggle');

  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    // Close the menu after a link inside it is used, so it does not cover the section.
    nav.querySelectorAll('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  // ---------- Video ----------
  // The page shows its own preview, so nothing is loaded from YouTube until someone
  // presses play. Then the preview is swapped for the player. Without JavaScript the
  // preview is a plain link to the video on YouTube.

  document.querySelectorAll('[data-video-id]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();

      var player = document.createElement('iframe');
      player.src = 'https://www.youtube-nocookie.com/embed/' + link.getAttribute('data-video-id') +
        '?autoplay=1&rel=0&playsinline=1';
      player.title = 'How Focused works';
      player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      player.allowFullscreen = true;

      var box = document.createElement('div');
      box.className = 'video';
      box.appendChild(player);

      link.replaceWith(box);
      player.focus();
    });
  });

  // ---------- Footer year ----------

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  // ---------- Shul request form ----------
  // GitHub Pages cannot receive a form. Two ways to send it:
  //  1. A form service: put its address in the form's data-endpoint
  //     (for example https://formspree.io/f/abcdwxyz). The request is posted there.
  //  2. No service set up: the visitor's email app opens with the request filled in,
  //     addressed to the form's data-email.

  var form = document.querySelector('#shul-request');

  if (form) {
    var status = form.querySelector('.form-status');

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!form.reportValidity()) {
        return;
      }

      var data = new FormData(form);
      var endpoint = form.getAttribute('data-endpoint') || '';

      if (endpoint.indexOf('https://') === 0) {
        sendToService(endpoint, data);
      } else {
        openEmail(data);
      }
    });

    function sendToService(endpoint, data) {
      setStatus('Sending…', '');

      fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            form.reset();
            setStatus('Thank you. We got your request and will be in touch soon.', 'ok');
          } else {
            setStatus('That didn\'t go through. Please try again, or email ' + form.getAttribute('data-email') + '.', 'error');
          }
        })
        .catch(function () {
          setStatus('That didn\'t go through. Check your connection and try again, or email ' + form.getAttribute('data-email') + '.', 'error');
        });
    }

    function openEmail(data) {
      var to = form.getAttribute('data-email');
      var shul = data.get('shul') || 'our shul';

      var lines = [
        'Shul: ' + data.get('shul'),
        'City: ' + data.get('city'),
        'Name: ' + data.get('name'),
        'Email or phone: ' + data.get('contact'),
        'Entrances: ' + data.get('entrances'),
        '',
        data.get('notes')
      ];

      var subject = 'Focused doors for ' + shul;
      var href = 'mailto:' + to +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));

      window.location.href = href;
      setStatus('Your email app should open with the request filled in. If it doesn\'t, write to ' + to + '.', '');
    }

    function setStatus(message, kind) {
      if (!status) {
        return;
      }

      status.textContent = message;
      status.classList.remove('form-status--ok', 'form-status--error');

      if (kind) {
        status.classList.add('form-status--' + kind);
      }
    }
  }
})();
