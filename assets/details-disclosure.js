class DetailsDisclosure extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector('details');
    this.content = this.mainDetailsToggle.querySelector('summary').nextElementSibling;

    this.mainDetailsToggle.addEventListener('focusout', this.onFocusOut.bind(this));
    this.mainDetailsToggle.addEventListener('toggle', this.onToggle.bind(this));
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    });
  }

  onToggle() {
    if (!this.animations) this.animations = this.content.getAnimations();

    if (this.mainDetailsToggle.hasAttribute('open')) {
      this.animations.forEach((animation) => animation.play());
    } else {
      this.animations.forEach((animation) => animation.cancel());
    }
  }

  close() {
    this.mainDetailsToggle.removeAttribute('open');
    this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', false);
  }
}

customElements.define('details-disclosure', DetailsDisclosure);

class HeaderMenu extends DetailsDisclosure {
  constructor() {
    super();
    this.header = document.querySelector('.header-wrapper');
  }

  connectedCallback() {
    if (this.hoverListenersAttached) return;
    this.hoverListenersAttached = true;
    this.desktopHoverMedia = window.matchMedia('(min-width: 990px) and (hover: hover)');
    this.onDetailsMouseEnter = this.onDetailsMouseEnter.bind(this);
    this.onDetailsMouseLeave = this.onDetailsMouseLeave.bind(this);
    this.mainDetailsToggle.addEventListener('mouseenter', this.onDetailsMouseEnter);
    this.mainDetailsToggle.addEventListener('mouseleave', this.onDetailsMouseLeave);
  }

  disconnectedCallback() {
    if (!this.hoverListenersAttached) return;
    this.hoverListenersAttached = false;
    this.mainDetailsToggle.removeEventListener('mouseenter', this.onDetailsMouseEnter);
    this.mainDetailsToggle.removeEventListener('mouseleave', this.onDetailsMouseLeave);
    if (this.hoverCloseTimer) clearTimeout(this.hoverCloseTimer);
  }

  onDetailsMouseEnter() {
    if (!this.desktopHoverMedia.matches) return;
    if (this.hoverCloseTimer) {
      clearTimeout(this.hoverCloseTimer);
      this.hoverCloseTimer = null;
    }
    document.querySelectorAll('header-menu').forEach((menu) => {
      if (menu !== this && menu.mainDetailsToggle?.hasAttribute('open')) {
        menu.close();
      }
    });
    this.mainDetailsToggle.setAttribute('open', '');
    const summary = this.mainDetailsToggle.querySelector('summary');
    if (summary) summary.setAttribute('aria-expanded', 'true');
  }

  onDetailsMouseLeave() {
    if (!this.desktopHoverMedia.matches) return;
    this.hoverCloseTimer = setTimeout(() => {
      this.close();
      this.hoverCloseTimer = null;
    }, 120);
  }

  onToggle() {
    super.onToggle();
    if (!this.header) return;
    this.header.preventHide = this.mainDetailsToggle.open;

    if (document.documentElement.style.getPropertyValue('--header-bottom-position-desktop') !== '') return;
    document.documentElement.style.setProperty(
      '--header-bottom-position-desktop',
      `${Math.floor(this.header.getBoundingClientRect().bottom)}px`
    );
  }
}

customElements.define('header-menu', HeaderMenu);
