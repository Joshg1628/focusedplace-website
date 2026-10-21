// Focused website: the phone menu, the header shade, the scroll animations, the demo video,
// the question answers, the footer year and the shul request form.
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

  // Visitors who asked their device for less motion get none of the animations below.
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Header shade ----------
  // The header stays at the top. Once the page scrolls, it gets a soft blur and shadow
  // so it stands apart from what's underneath.

  var header = document.querySelector('.site-header');

  if (header) {
    var shadeHeader = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };

    shadeHeader();
    window.addEventListener('scroll', shadeHeader, { passive: true });
  }

  // ---------- Scroll animations ----------
  // Sections and cards fade up the first time they scroll into view, cards in a row one
  // after another. The bars under section labels draw in, and the shul setup steps
  // light up in order. Anything already on screen when the page opens is left alone.

  var revealTargets = '.section-head, .video, .door-demo, .feature, .split__main, ' +
    '.split__side:not(.reassurances), .reassurances li, .join, .cta-panel, .faq details, ' +
    '.step, .price, .form';

  if (reduceMotion || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.eyebrow').forEach(function (label) {
      label.classList.add('bar-in');
    });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        var el = entry.target;
        observer.unobserve(el);

        if (el.classList.contains('eyebrow')) {
          el.classList.add('bar-in');
        } else if (el.classList.contains('steps')) {
          el.classList.add('is-lit');
        } else {
          reveal(el);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });

    document.querySelectorAll(revealTargets).forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        return;
      }

      // Cards side by side arrive a beat apart
      var place = Array.prototype.indexOf.call(el.parentElement.children, el);
      el.style.setProperty('--reveal-delay', Math.min(place, 4) * 90 + 'ms');
      el.classList.add('reveal');
      observer.observe(el);
    });

    document.querySelectorAll('.eyebrow, .steps').forEach(function (el) {
      observer.observe(el);
    });
  }

  function reveal(el) {
    el.classList.add('is-visible');

    // Once it has arrived, take the classes off so the card's own hover lift works again
    setTimeout(function () {
      el.classList.remove('reveal', 'is-visible');
      el.style.removeProperty('--reveal-delay');
    }, 1200);
  }

  // ---------- Demo video ----------
  // It plays on a loop by itself. With less motion asked for, it waits paused instead,
  // with play controls so the visitor can start it when they want.

  if (reduceMotion) {
    document.querySelectorAll('.video video').forEach(function (video) {
      video.removeAttribute('autoplay');
      video.pause();
      video.controls = true;
    });
  }

  // ---------- Question answers ----------
  // Answers slide open and closed instead of popping.

  if (!reduceMotion) {
    document.querySelectorAll('.faq details').forEach(function (details) {
      var summary = details.querySelector('summary');
      var answer = details.querySelector('summary + *');
      var moving = false;

      if (!summary || !answer || !answer.animate) {
        return;
      }

      summary.addEventListener('click', function (event) {
        event.preventDefault();

        if (moving) {
          return;
        }

        moving = true;

        if (details.open) {
          var closing = answer.animate([
            { height: answer.offsetHeight + 'px', marginTop: getComputedStyle(answer).marginTop, opacity: 1 },
            { height: '0px', marginTop: '0px', opacity: 0 }
          ], { duration: 220, easing: 'ease-in', fill: 'forwards' });

          details.classList.add('is-closing');

          closing.onfinish = function () {
            details.open = false;
            details.classList.remove('is-closing');
            closing.cancel();
            moving = false;
          };
        } else {
          details.open = true;

          answer.animate([
            { height: '0px', marginTop: '0px', opacity: 0 },
            { height: answer.offsetHeight + 'px', marginTop: getComputedStyle(answer).marginTop, opacity: 1 }
          ], { duration: 260, easing: 'ease-out' }).onfinish = function () {
            moving = false;
          };
        }
      });
    });
  }

  // ---------- Footer year ----------

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  // ---------- Shul request form ----------
  // GitHub Pages cannot receive a form, so the request goes to FormSubmit (the form's
  // data-endpoint), which emails it to the form's data-email. If data-endpoint is ever
  // left empty, the visitor's email app opens with the request filled in instead.

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
      var button = form.querySelector('[type="submit"]');
      var to = form.getAttribute('data-email');
      var contact = data.get('contact') || '';

      // Readable names, because they become the rows of the email we receive.
      // The names starting with _ are settings for FormSubmit.
      var request = new FormData();
      request.append('Shul', data.get('shul'));
      request.append('City', data.get('city'));
      request.append('Name', data.get('name'));
      request.append('Email or phone', contact);
      request.append('Entrances', data.get('entrances'));
      request.append('Notes', data.get('notes'));
      request.append('_subject', 'Focused doors for ' + (data.get('shul') || 'a shul'));
      request.append('_template', 'table');

      // Lets us just press Reply when they left an email address
      if (contact.indexOf('@') > 0) {
        request.append('_replyto', contact);
      }

      button.disabled = true;
      setStatus('Sending…', '');

      fetch(endpoint, {
        method: 'POST',
        body: request,
        headers: { Accept: 'application/json' }
      })
        .then(function (response) {
          return response.json().catch(function () { return {}; }).then(function (result) {
            // FormSubmit can answer "OK" without sending, with success "false" and a message
            if (response.ok && String(result.success) !== 'false') {
              form.reset();
              setStatus('Thank you. We got your request and will be in touch soon.', 'ok');
            } else if (/activat/i.test(result.message || '')) {
              // Only before the very first request is confirmed by the inbox owner
              setStatus('Almost ready: FormSubmit sent an activation email to ' + to + '. Click Activate Form in it, then send again.', 'error');
            } else {
              setStatus('That didn\'t go through. Please try again, or email ' + to + '.', 'error');
            }
          });
        })
        .catch(function () {
          setStatus('That didn\'t go through. Check your connection and try again, or email ' + to + '.', 'error');
        })
        .then(function () {
          button.disabled = false;
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
