(function () {
  var widgets = document.querySelectorAll('[data-owner-signup]');
  if (!widgets.length) return;

  function px(value) {
    return Math.round(value) + 'px';
  }

  function setFormInteractive(form, interactive) {
    if (!form) return;
    form.setAttribute('aria-hidden', interactive ? 'false' : 'true');
    form.inert = !interactive;

    form.querySelectorAll('input, button, select, textarea, a[href]').forEach(function (element) {
      if (interactive) {
        if (element.hasAttribute('data-owner-signup-tabindex')) {
          var original = element.getAttribute('data-owner-signup-tabindex');
          if (original) {
            element.setAttribute('tabindex', original);
          } else {
            element.removeAttribute('tabindex');
          }
          element.removeAttribute('data-owner-signup-tabindex');
        }
      } else {
        if (!element.hasAttribute('data-owner-signup-tabindex')) {
          element.setAttribute('data-owner-signup-tabindex', element.getAttribute('tabindex') || '');
        }
        element.setAttribute('tabindex', '-1');
      }
    });
  }

  widgets.forEach(function (widget) {
    var compact = widget.querySelector('[data-owner-signup-toggle]');
    var collapseControl = widget.querySelector('[data-owner-signup-collapse]');
    var form = widget.querySelector('[data-owner-signup-form]');
    var manuallyExpanded = false;

    if (!compact || !collapseControl || !form) return;

    function setWidgetGeometry() {
      var margin = window.innerWidth <= 640 ? 12 : 24;
      var compactWidth = window.innerWidth <= 480 ? 178 : 224;
      var compactHeight = window.innerWidth <= 480 ? 58 : 64;
      var floatingWidth = Math.min(448, window.innerWidth - margin * 2);
      var formInner = form.querySelector('.owner-signup-form-inner');
      var measuredHeight = Math.max(form.scrollHeight, formInner ? formInner.scrollHeight : 0) + 2;
      var fallbackHeight = window.innerWidth <= 640 ? 500 : 540;
      var desiredHeight = measuredHeight > 2 ? measuredHeight : fallbackHeight;
      var availableHeight = Math.max(260, window.innerHeight - margin * 2);
      var floatingHeight = Math.min(desiredHeight, availableHeight);
      var floatingTop = Math.max(margin, window.innerHeight - floatingHeight - margin);
      var floatingMaxHeight = Math.max(220, window.innerHeight - floatingTop - margin);

      widget.style.setProperty('--signup-compact-left', px(window.innerWidth - compactWidth - margin));
      widget.style.setProperty('--signup-compact-top', px(window.innerHeight - compactHeight - margin));
      widget.style.setProperty('--signup-compact-width', px(compactWidth));
      widget.style.setProperty('--signup-floating-left', px(window.innerWidth - floatingWidth - margin));
      widget.style.setProperty('--signup-floating-top', px(floatingTop));
      widget.style.setProperty('--signup-floating-width', px(floatingWidth));
      widget.style.setProperty('--signup-floating-max-height', px(floatingMaxHeight));
    }

    function setMode(mode) {
      widget.classList.toggle('is-collapsed', mode === 'collapsed');
      widget.classList.toggle('is-floating-expanded', mode === 'floating');
      compact.setAttribute('aria-expanded', mode === 'collapsed' ? 'false' : 'true');
      compact.tabIndex = mode === 'collapsed' ? 0 : -1;
      collapseControl.tabIndex = mode === 'floating' ? 0 : -1;
      setFormInteractive(form, mode !== 'collapsed');
    }

    function updateWidgetState() {
      setWidgetGeometry();
      if (manuallyExpanded) {
        setMode('floating');
      } else {
        setMode('collapsed');
      }
    }

    compact.addEventListener('click', function () {
      if (!widget.classList.contains('is-collapsed')) return;
      manuallyExpanded = true;
      updateWidgetState();
      window.setTimeout(function () {
        var email = widget.querySelector('input[name="email_address"]');
        if (email) email.focus();
      }, 220);
    });

    collapseControl.addEventListener('click', function () {
      manuallyExpanded = false;
      setMode('collapsed');
      compact.focus();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !widget.classList.contains('is-floating-expanded')) return;
      manuallyExpanded = false;
      updateWidgetState();
      compact.focus();
    });

    var refreshQueued = false;
    function queueRefresh() {
      if (refreshQueued) return;
      refreshQueued = true;
      window.requestAnimationFrame(function () {
        refreshQueued = false;
        updateWidgetState();
      });
    }

    if ('MutationObserver' in window) {
      new MutationObserver(queueRefresh).observe(form, {
        attributes: true,
        childList: true,
        subtree: true
      });
    }

    updateWidgetState();
    widget.classList.add('is-ready');
    window.addEventListener('scroll', updateWidgetState, { passive: true });
    window.addEventListener('resize', updateWidgetState);
  });
})();
