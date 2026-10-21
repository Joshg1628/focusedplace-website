// Shuls with Focused doors: the list on doors.html.
// It reads devices.json, the same file every copy of the app downloads, so adding a shul
// there is all it takes for it to show here. GitHub may take up to 10 minutes to pass on
// a change. No libraries and no tracking.
//
// Besides shulId, major and name, each shul in devices.json can carry these fields for this
// page. The app ignores them.
//   "city": "Lakewood, NJ"     groups the list
//   "address": "123 Main St"   shown under the name
//   "doors": 2                 how many entrances have devices
//   "since": "2026-10"         year and month the devices went in
//   "hidden": true             keeps a shul (or a test entry) off this page; the app still uses it
//
// The shul ID and the major number are never shown.

(function () {
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var list = document.querySelector('#doors-list');

  if (!list) {
    return;
  }

  var stats = document.querySelector('.doors-stats');
  var search = document.querySelector('.doors-search');
  var input = document.querySelector('#doors-q');
  var shuls = [];

  input.addEventListener('input', render);
  load();

  function load() {
    stats.hidden = true;
    search.hidden = true;
    showMessage('Loading the list…');

    fetch(list.getAttribute('data-src'), { cache: 'no-cache' })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }

        return response.text();
      })
      .then(function (text) {
        var entries = parseLoose(text);

        if (!Array.isArray(entries)) {
          throw new Error('devices.json is not a list');
        }

        shuls = entries.map(readShul).filter(function (shul) {
          return shul !== null;
        });

        showCounts();
        render();
      })
      .catch(function () {
        showMessage('Couldn\'t load the list right now.', function (box) {
          var retry = document.createElement('button');
          retry.type = 'button';
          retry.className = 'btn btn--ghost btn--small';
          retry.textContent = 'Try again';
          retry.addEventListener('click', load);
          box.appendChild(retry);
        });
      });
  }

  // One entry of the file as this page needs it, or null to leave it out.
  // Field names in any case, like the app reads them ("Name" works as well as "name").
  function readShul(entry) {
    if (!entry || typeof entry !== 'object') {
      return null;
    }

    var fields = {};

    Object.keys(entry).forEach(function (key) {
      fields[key.toLowerCase()] = entry[key];
    });

    var name = text(fields.name);

    if (!name || fields.hidden === true) {
      return null;
    }

    var doors = parseInt(fields.doors, 10);

    return {
      name: name,
      city: text(fields.city),
      address: text(fields.address),
      doors: doors > 0 ? doors : 0,
      since: sinceLabel(text(fields.since))
    };
  }

  function text(value) {
    return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
  }

  // "2026-10" (or a full date) reads as "Since Oct 2026"; anything else is shown as written
  function sinceLabel(value) {
    var match = /^(\d{4})-(\d{1,2})/.exec(value);

    if (match && match[2] >= 1 && match[2] <= 12) {
      return 'Since ' + MONTHS[match[2] - 1] + ' ' + match[1];
    }

    return value ? 'Since ' + value : '';
  }

  function showCounts() {
    if (shuls.length === 0) {
      return;
    }

    var entrances = 0;
    var cities = {};

    shuls.forEach(function (shul) {
      entrances += shul.doors || 1; // every listed shul has at least one door
      if (shul.city) {
        cities[shul.city.toLowerCase()] = true;
      }
    });

    setCount('#doors-shuls', shuls.length, 'shul', 'shuls');
    setCount('#doors-entrances', entrances, 'entrance', 'entrances');
    setCount('#doors-cities', Object.keys(cities).length, 'city', 'cities');

    stats.hidden = false;
    search.hidden = false;
  }

  // The number, and the word under it in singular or plural
  function setCount(selector, count, one, many) {
    var number = document.querySelector(selector);
    number.textContent = count;
    number.nextElementSibling.textContent = count === 1 ? one : many;
  }

  function render() {
    if (shuls.length === 0) {
      showMessage('No shuls yet. Yours could be the first.', function (box) {
        var link = document.createElement('a');
        link.className = 'btn btn--primary btn--small';
        link.href = 'shuls.html#ask';
        link.textContent = 'Get Focused doors';
        box.appendChild(link);
      });
      return;
    }

    var query = input.value.trim().toLowerCase();

    var matches = shuls.filter(function (shul) {
      return !query || (shul.name + ' ' + shul.city + ' ' + shul.address).toLowerCase().indexOf(query) !== -1;
    });

    if (matches.length === 0) {
      showMessage('No shuls match "' + input.value.trim() + '".');
      return;
    }

    // Grouped by city, cities A to Z, shuls without a city last
    var groups = {};

    matches.forEach(function (shul) {
      (groups[shul.city] = groups[shul.city] || []).push(shul);
    });

    var cities = Object.keys(groups).sort(function (a, b) {
      if (!a) return 1;
      if (!b) return -1;
      return a.localeCompare(b);
    });

    list.textContent = '';

    cities.forEach(function (city) {
      var heading = document.createElement('h2');
      heading.className = 'doors-city';
      heading.textContent = city || 'More shuls';
      list.appendChild(heading);

      var group = document.createElement('ul');
      group.className = 'doors-group';

      groups[city]
        .sort(function (a, b) { return a.name.localeCompare(b.name); })
        .forEach(function (shul) {
          group.appendChild(shulRow(shul));
        });

      list.appendChild(group);
    });
  }

  // Everything from the file goes in as plain text, so a typo can't break the page
  function shulRow(shul) {
    var row = document.createElement('li');
    row.className = 'doors-shul';

    var name = document.createElement('strong');
    name.textContent = shul.name;
    row.appendChild(name);

    if (shul.address) {
      var address = document.createElement('span');
      address.className = 'doors-shul__address';
      address.textContent = shul.address;
      row.appendChild(address);
    }

    var chips = [];

    if (shul.doors) {
      chips.push(shul.doors === 1 ? '1 entrance' : shul.doors + ' entrances');
    }

    if (shul.since) {
      chips.push(shul.since);
    }

    if (chips.length) {
      var holder = document.createElement('span');
      holder.className = 'doors-chips';

      chips.forEach(function (label) {
        var chip = document.createElement('span');
        chip.className = 'doors-chip';
        chip.textContent = label;
        holder.appendChild(chip);
      });

      row.appendChild(holder);
    }

    return row;
  }

  // A message box in place of the list, with room for a button underneath
  function showMessage(message, addButton) {
    var box = document.createElement('div');
    box.className = 'doors-message';

    var line = document.createElement('p');
    line.textContent = message;
    box.appendChild(line);

    if (addButton) {
      addButton(box);
    }

    list.textContent = '';
    list.appendChild(box);
  }

  // devices.json is edited by hand, and the app forgives comments and a comma before
  // a closing bracket. JSON.parse doesn't, so take those out first (never inside a name).
  function parseLoose(source) {
    var out = '';
    var inString = false;
    var i = 0;

    source = source.replace(/^﻿/, '');

    while (i < source.length) {
      var c = source[i];
      var next = source[i + 1];

      if (inString) {
        out += c;
        if (c === '\\') {
          out += next || '';
          i += 2;
          continue;
        }
        if (c === '"') {
          inString = false;
        }
        i++;
      } else if (c === '"') {
        inString = true;
        out += c;
        i++;
      } else if (c === '/' && next === '/') {
        while (i < source.length && source[i] !== '\n') i++;
      } else if (c === '/' && next === '*') {
        var end = source.indexOf('*/', i + 2);
        i = end === -1 ? source.length : end + 2;
      } else if (c === ',' && closesNext(source, i + 1)) {
        i++; // a comma right before ] or }
      } else {
        out += c;
        i++;
      }
    }

    return JSON.parse(out);
  }

  // True when the next thing from position i, past spaces and comments, is ] or }
  function closesNext(source, i) {
    while (i < source.length) {
      if (/\s/.test(source[i])) {
        i++;
      } else if (source.startsWith('//', i)) {
        while (i < source.length && source[i] !== '\n') i++;
      } else if (source.startsWith('/*', i)) {
        var end = source.indexOf('*/', i + 2);
        i = end === -1 ? source.length : end + 2;
      } else {
        return source[i] === ']' || source[i] === '}';
      }
    }

    return false;
  }
})();
