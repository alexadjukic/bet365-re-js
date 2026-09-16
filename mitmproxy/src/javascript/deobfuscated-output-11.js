var SITE_ROOT_PATH, ns_betslipstandarduilib_accessibility, ns_betslipstandarduilib_ui_util, StandardLocaleHelper, ns_betslipstandarduilib_ui_offerbadges_models, ns_betslipstandarduilib_ui_offerbadges, ns_betslipstandarduilib_ui_bet_controls_common, ns_betslipstandarduilib_ui_bet_controls_standard, ns_betslipstandarduilib_ui_slip_controls_standard, ns_betslipstandarduilib_ui_bet_standard, ns_betslipstandarduilib_ui_bet, ns_betslipstandarduilib_events, ns_betslipstandarduilib_ui_participant, ns_betslipstandarduilib_ui_slip_controls_common, ns_betslipstandarduilib_ui_slip_header, ns_betslipstandarduilib_ui_slip;
function localeLib(e) {
    var t = boot.getLocale();
    return t.stateLocale && window[e + t.stateLocale] ? ns_gen5_util.Singleton.getInstance(window[e + t.stateLocale]) : t.countryLocale && window[e + t.countryLocale] ? ns_gen5_util.Singleton.getInstance(window[e + t.countryLocale]) : ns_gen5_util.Singleton.getInstance(window[e + 'Default']);
}
function languageDefinition(e) {
    return window[e + 'Language'];
}
function appLib(e) {
    var t = window['ns_' + e.toLowerCase().substr(0, e.length - 3) + e.toLowerCase().substr(-3).replace('app', '_app')];
    return t && t[e] && ns_gen5_util.Singleton.getInstance(t[e]);
}
SITE_ROOT_PATH = 'sports', (ns_betslipstandarduilib_accessibility || (ns_betslipstandarduilib_accessibility = {})).BetslipCheckboxAccessibilityDelegate = class {
    constructor(e, t) {
        this.el = e, this.props = t;
    }
    makeAccessible() {
        this.el && !this.props.isDisabled() && this.setAttributes();
    }
    setAttributes() {
        this.el.setAttribute('role', 'checkbox'), this.el.setAttribute('tabindex', '0'), this.setChecked(), this.props.label && this.el.setAttribute('aria-label', this.props.label);
    }
    setDisabled() {
        this.el && (this.props.isDisabled() ? (this.el.removeAttribute('role'), this.el.removeAttribute('tabindex'), this.el.removeAttribute('aria-label'), this.el.removeAttribute('aria-checked')) : this.setAttributes());
    }
    setChecked() {
        this.props.isPressed() ? this.el.setAttribute('aria-checked', 'true') : this.el.setAttribute('aria-checked', 'false');
    }
}, (e => {
    class t {
        static GetTranslation(e) {
            return e;
        }
        static ShowTaxMessage(e) {
        }
        static RequiresReferralOnBet() {
            return !1;
        }
        static RequiresBetConfirmation() {
            return !1;
        }
        static RequiresReferenceOnBetItem() {
            return !1;
        }
        static RequiresTaxMessage() {
            return !1;
        }
        static GetBetBuilderRacingLogoPath() {
            return '';
        }
        static GetBetBuilderPlusRacingLogoPath() {
            return '';
        }
        static getSuperBoostText() {
            return localeLib('BetslipStandardUILib').getSuperBoostText();
        }
    }
    t.RetainEachWayNoStake = !1, e.StandardLocaleHelper = t;
})(ns_betslipstandarduilib_ui_util = ns_betslipstandarduilib_ui_util || {}), StandardLocaleHelper = ns_betslipstandarduilib_ui_util.StandardLocaleHelper, ns_betslipstandarduilib_ui_offerbadges_models = ns_betslipstandarduilib_ui_offerbadges_models || {}, (n => {
    var r = ns_gen5_ui.Component, d = ns_postbootlib_util.OfferBadgesUtil, o = ns_betslipcorelib_data.OfferTypeEnum, h = ns_betslipcorelib_data.SoccerExtraTimeEnum;
    class p extends r {
        constructor(e, t = 'bss-OfferBadgesContainer') {
            super(), this.offersList = e, this.defaultStyle = t, this.badges = [];
        }
        static InitCleanupDelegate(e) {
            p.RegisterCleanupDelegate = e;
        }
        createChildren() {
            this.addStyle(this.defaultStyle);
            var e, t, s = [], i = [];
            for (e of this.offersList)
                (d.IsAccumulator(e.offerCode) ? s : i).push(e);
            for (t of [
                    ...i,
                    ...s
                ]) {
                let e;
                switch (t.offerType) {
                case o.ACCUMULATOR_OFFER:
                    e = new n.OfferBadgeAccumulator(t);
                    var a = new r();
                    a.addStyle(this.defaultStyle + '_BadgeWrapper'), a.appendChild(e), this.appendChild(a), a.clickHandler = () => e.showOfferDetails();
                    break;
                case o.SUB_ON_OFFER:
                case o.SUB_ON_OFFER_SO:
                    if ('1' != Locator.pushedConfig.getAttributeValue('SSO'))
                        continue;
                    e = new n.OfferBadgeSubOn(t);
                    a = new r();
                    a.addStyle(this.defaultStyle + '_BadgeWrapper'), this.appendChild(a), a.clickHandler = () => e.showOfferDetails(), a.appendChild(e);
                    break;
                case o.SOCCER_TIME_OFFERS:
                    t.offerCode === h.INCLUDED_EXTRA_TIME_OFFER ? e = this.createIncludesExtraTimeBadge(t) : t.offerCode === h.NINETY_PLUS_STOPPAGE_TIME_OFFER && (e = this.createNinetyPlusStoppageTimeBadge(t));
                    break;
                case o.NONE:
                    var l = new r();
                    l.addStyle(this.defaultStyle + '_BadgeWrapper'), e = new n.OfferBadgeEnchancedPrice(t), l.appendChild(e), this.appendChild(l);
                    break;
                default:
                    e = new n.OfferBadgeStandard(t);
                    l = new r();
                    l.addStyle(this.defaultStyle + '_BadgeWrapper'), this.appendChild(l), l.clickHandler = () => e.showOfferDetails(), l.appendChild(e);
                }
                this.badges.push(e);
            }
            p.Instance = this, p.RegisterCleanupDelegate && p.RegisterCleanupDelegate(() => p.Instance.dispose());
        }
        createIncludesExtraTimeBadge(e) {
            return this.createTimeOfferBadge(new n.OfferBadgeIncludesExtraTime(e));
        }
        createNinetyPlusStoppageTimeBadge(e) {
            return this.createTimeOfferBadge(new n.OfferBadgeNinetyPlusStoppageTime(e));
        }
        createTimeOfferBadge(e) {
            var t = new r();
            return t.addStyle(this.defaultStyle + '_BadgeWrapper'), this.appendChild(t), t.clickHandler = () => e.showOfferDetails(), t.appendChild(e), e;
        }
        dispose() {
            for (var e of this.badges)
                e.removeOfferTermsPopup();
        }
    }
    n.OfferBadgesContainer = p;
})(ns_betslipstandarduilib_ui_offerbadges = ns_betslipstandarduilib_ui_offerbadges || {}), (e => {
    class t extends e.OfferBadgesContainer {
        constructor(e, t = 'bss-MultipleHeaderOfferBadgesContainer') {
            super(e, t), this.offersList = e, this.defaultStyle = t, this.addStyle(this.defaultStyle + '_Closed');
        }
        showOfferBadge() {
            this.removeStyle(this.defaultStyle + '_Closed'), Locator.validationManager.callLater(() => {
                this.removeStyle(this.defaultStyle + '_Hide');
            });
        }
        hideOfferBadge() {
            Locator.validationManager.callNewContext(() => {
                this.addStyle(this.defaultStyle + '_Hide');
            });
        }
    }
    e.MultipleHeaderOfferBadgesContainer = t;
})(ns_betslipstandarduilib_ui_offerbadges = ns_betslipstandarduilib_ui_offerbadges || {}), (a => {
    var l = ns_gen5_ui.Component;
    class n extends l {
        constructor(e) {
            super(), this.offersList = e, this.badges = [];
        }
        static InitCleanupDelegate(e) {
            n.RegisterCleanupDelegate = e;
        }
        createChildren() {
            this.addStyle('bss-OfferBadgesBetBuilderContainer');
            let e = [];
            for (var t of this.offersList)
                e.push(t);
            var s;
            for (s of [...e]) {
                let e = new a.OfferBadgeBetBuilder(s);
                var i = new l();
                i.addStyle('bss-OfferBadgesBetBuilderContainer_BadgeWrapper'), this.appendChild(i), i.appendChild(e), this.badges.push(e);
            }
            n.Instance = this, n.RegisterCleanupDelegate && n.RegisterCleanupDelegate(() => n.Instance.dispose());
        }
        dispose() {
            for (var e of this.badges)
                e.removeOfferTermsPopup();
        }
    }
    a.OfferBadgesBetBuilderContainer = n;
})(ns_betslipstandarduilib_ui_offerbadges = ns_betslipstandarduilib_ui_offerbadges || {}), (a => {
    var l = ns_webconsolelib_util.Browser, n = ns_postbootlib_util.OfferBadgesUtil, r = ns_betslipcorelib_data.OfferTypeEnum, e = ns_scrollerlib_ui.ScrollableHorizontalNavBar, d = ns_betslipcorelib_data.SoccerExtraTimeEnum;
    class o extends e {
        constructor(e) {
            super(), this.offersList = e, this.badges = [];
        }
        static InitCleanupDelegate(e) {
            o.RegisterCleanupDelegate = e;
        }
        createChildren() {
            super.createChildren(), this.scrollable.addArrowButtonStyle('bss-OfferBadgesDesktopContainer_Arrows'), this.scrollable.addArrowButtonStyle('bss-OfferBadgesDesktopContainer_Hidden'), this.addStyle('bss-OfferBadgesDesktopContainer_Scroll'), this.buttonContainer.addStyle('bss-OfferBadgesDesktopContainer'), this.getElement().addEventListener('touchmove', e => {
                e.stopPropagation();
            }, { passive: !0 }), l.addMouseModeDelegate(this);
            var e, t, s = [], i = [];
            for (e of this.offersList)
                (n.IsAccumulator(e.offerCode) ? s : i).push(e);
            for (t of [
                    ...i,
                    ...s
                ]) {
                let e;
                switch (t.offerType) {
                case r.ACCUMULATOR_OFFER:
                    e = new a.OfferBadgeAccumulator(t);
                    break;
                case r.SUB_ON_OFFER:
                case r.SUB_ON_OFFER_SO:
                    if ('1' != Locator.pushedConfig.getAttributeValue('SSO'))
                        continue;
                    e = new a.OfferBadgeSubOn(t);
                    break;
                case r.SOCCER_TIME_OFFERS:
                    t.offerCode === d.INCLUDED_EXTRA_TIME_OFFER ? e = new a.OfferBadgeIncludesExtraTime(t) : t.offerCode === d.NINETY_PLUS_STOPPAGE_TIME_OFFER && (e = new a.OfferBadgeNinetyPlusStoppageTime(t));
                    break;
                case r.NONE:
                    e = new a.OfferBadgeEnchancedPrice(t);
                    break;
                default:
                    e = new a.OfferBadgeStandard(t);
                }
                this.badges.push(e), this.buttonContainer.appendChild(e);
            }
            Locator.validationManager.callNewContext(() => {
                this.scrollable.recalibrate();
            }), o.Instance = this, o.RegisterCleanupDelegate && o.RegisterCleanupDelegate(() => o.Instance.dispose());
        }
        dispose() {
            for (var e of this.badges)
                e.removeOfferTermsPopup();
            l.removeMouseModeDelegate(this);
        }
        mouseModeEnabled() {
            this.addStyle('bss-OfferBadgesDesktopContainer_MouseMode');
        }
        mouseModeDisabled() {
            this.removeStyle('bss-OfferBadgesDesktopContainer_MouseMode');
        }
    }
    a.OfferBadgesDesktopContainer = o;
})(ns_betslipstandarduilib_ui_offerbadges = ns_betslipstandarduilib_ui_offerbadges || {}), (e => {
    var n, t = ns_gen5_ui.ComponentStemBase, r = ns_gen5_ui.Component, d = ns_gen5_ui.Label, o = ns_gen5_ui.Application, h = ns_gen5_events.ApplicationEvent, p = ns_gen5_util.Delegate, c = ns_navlib_util.WebsiteNavigationManager, u = ns_sitepreferenceslib_util.UserPreferences, b = ns_postbootlib_preferences_local.OfferPreferences, s = ns_accessibilityuilib_ui_popup.PopupAccessibilityDelegate, i = ns_betslipuilib_util.PopupHelper, a = ns_accessibilityuilib_ui.LinkAccessibilityDelegate, l = ns_navlib_util.ExternalLinkManager;
    let m = n = class extends t {
        static BuildSoccerRulesUrl() {
            var e = n.IdToLang[Locator.user.languageId] || 'en';
            return Locator.config.domain.helpHost + `/${ e }/sportsrules/soccer`;
        }
        constructor(e) {
            super(), this.parentElem = e, this.popupHelper = new i(this, this.parentElem, this);
        }
        createChildren() {
            if (this.addStyle('bss-OfferBadgesPopup'), this.contentContainer = new r(), this.contentContainer.addStyle('bss-OfferBadgesPopup_ContentContainer'), this.staticContent)
                this.renderStaticContent(this.staticContent);
            else
                for (var e of this.stems) {
                    var s = e.data.DE || '', s = n.EncodedRegex.test(s) ? decodeURIComponent(s) : s, i = (this.resetLastIndex(), e.data.IN || ''), i = n.EncodedRegex.test(i) ? decodeURIComponent(i) : i;
                    this.resetLastIndex();
                    let t = e.data.EX || '';
                    t = n.EncodedRegex.test(t) ? decodeURIComponent(t) : t, this.resetLastIndex();
                    var e = e.data.ED || '', e = n.EncodedRegex.test(e) ? decodeURIComponent(e) : e, a = (this.resetLastIndex(), new d()), l = new d();
                    a.setText(s), a.addStyle('bss-OfferBadgesPopup_Header'), this.contentContainer.appendChild(a), l.setText(i), l.addStyle('bss-OfferBadgesPopup_Text'), this.contentContainer.appendChild(l), this.linkLabel = new d(), this.linkLabel.setText(e), this.linkLabel.addStyle('bss-OfferBadgesPopup_Footer'), this.contentContainer.appendChild(this.linkLabel), this.linkLabel.clickHandler = () => {
                        var e;
                        t && ((e = u.AdditionalPreferences(b)).breadcrumbUrl = '', e.offerUrl = t, c.NavigateTo('#OF#', { data: { needsCard: !1 } }), this.parentElem.removeOfferTermsPopup());
                    };
                }
            super.createChildren(), this.appendChild(this.contentContainer), this.widthDelegate = new p(this, this.setTextPosition), o.currentApplication.addEventListener(h.WIDTH_CHANGED, this.widthDelegate), this.setTextPosition(), this.parentElem.setActive(!0);
        }
        showPopup() {
            Locator.validationManager.callNewContext(() => {
                this.popupHelper.showPopup(10);
            });
        }
        hidePopup() {
            this.popupHelper.hidePopup();
        }
        popupHelperHideMessage() {
        }
        setTextPosition() {
            Locator.validationManager.callPostValidation(() => {
                950 <= o.currentApplication.width ? this.addStyle('bss-OfferBadgesPopup-wide') : this.removeStyle('bss-OfferBadgesPopup-wide'), this.deferredSetTextPosition();
            });
        }
        deferredSetTextPosition() {
            var e = this.parentElem.getElement().getBoundingClientRect(), t = this.getElement().offsetWidth, t = e.left - t / 2 + e.width / 2, t = (this.getInlineStyle().left = t + 'px', o.currentApplication.height);
            e.top - this.contentContainer.getElement().scrollHeight - 12 < 0 ? (this.getInlineStyle().top = e.top + 30 + 'px', Math.round(e.top + this.getElement().offsetHeight) >= t && (this.getInlineStyle().bottom = '10px')) : (this.getInlineStyle().bottom = null, t = e.top - this.getElement().offsetHeight - 12, this.getInlineStyle().top = t + 'px');
        }
        renderStaticContent(e) {
            var t = new d(), t = (t.setText(e.headerText), t.addStyle('bss-OfferBadgesPopup_Header'), this.contentContainer.appendChild(t), new d());
            t.setText(e.bodyText), t.addStyle('bss-OfferBadgesPopup_Text'), this.contentContainer.appendChild(t), this.linkLabel = new d(), this.linkLabel.setText(e.linkText), this.linkLabel.addStyle('bss-OfferBadgesPopup_Footer'), this.contentContainer.appendChild(this.linkLabel), this.linkLabel.clickHandler = () => {
                e.linkUrl && (l.Go(e.linkUrl, '_blank'), this.parentElem.removeOfferTermsPopup());
            };
        }
        dispose() {
            o.currentApplication.removeEventListener(h.WIDTH_CHANGED, this.widthDelegate), this.detatchStem(), this.parentElem.removeChild(this), Locator.validationManager.callPostValidation(() => {
                this.parentElem.removeOfferTermsPopup();
            });
        }
        clickOutsideHandler(e) {
            this.popupHelper.hidePopup(), this.accessibility && this.accessibility.dispose(), Locator.validationManager.callPostValidation(() => {
                this.parentElem.removeOfferTermsPopup();
            }), this.parentElem.setActive(!1);
        }
        static MakeAccessible(e) {
            e.linkLabel ? a.MakeAccessible(e.linkLabel) : a.MakeAccessible(e.parentElem);
            var t = new s(e, { triggerButton: e.parentElem });
            (e.accessibility = t).makeAccessible();
        }
        overlayHoverHandler(e) {
            var t = this.getElement().getBoundingClientRect(), s = this.parentElem.getElement().getBoundingClientRect();
            (e.clientY < s.top || e.clientY > s.bottom || e.clientX < s.left || e.clientX > s.right) && (100 < t.top - e.clientY || 100 < e.clientY - t.bottom || 100 < t.left - e.clientX || 100 < e.clientX - t.right) && this.clickOutsideHandler();
        }
        resetLastIndex() {
            n.EncodedRegex.lastIndex = 0;
        }
    };
    m.EncodedRegex = /.*%[0-9a-fA-F]+/g, m.IdToLang = {
        1: 'en',
        2: 'zh',
        3: 'es',
        4: 'fr',
        5: 'de',
        6: 'it',
        7: 'da',
        8: 'sv',
        9: 'nb',
        10: 'zh',
        19: 'bg',
        20: 'el',
        21: 'pl',
        22: 'pt',
        23: 'ro',
        24: 'cs',
        25: 'hu',
        26: 'sk',
        28: 'nl',
        29: 'et',
        30: 'en',
        31: 'ru',
        32: 'en-us',
        33: 'pt-br',
        34: 'ja',
        36: 'es-419',
        37: 'rs'
    }, m = n = __decorate([AccessibilityDelegate(m)], m), e.OfferBadgesPopup = m;
})(ns_betslipstandarduilib_ui_offerbadges = ns_betslipstandarduilib_ui_offerbadges || {}), (e => {
    var s = ns_postbootlib_util.OfferBadgesUtil, i = ns_gen5_ui.Component, a = ns_gen5_ui.Label, n = ns_webconsolelib_util.Browser, r = ns_gen5_ui.Application, l = ns_gen5_events.ApplicationEvent, d = ns_gen5_util.Delegate;
    class t extends i {
        constructor(e, t) {
            super(), this.parentElem = e, this.headerText = t;
        }
        createChildren() {
            this.addStyle('bss-OfferBadgesPopupEnhancedPrices'), this.nib = new i(), this.nib.addStyle('bss-OfferBadgesPopupEnhancedPrices_Nib'), this.appendChild(this.nib);
            var e = new a(), t = new a();
            e.setText(this.headerText), e.addStyle('bss-OfferBadgesPopupEnhancedPrices_Header'), this.appendChild(e), t.setText(s.GetTranslation('enhancedPopup')), t.addStyle('bss-OfferBadgesPopupEnhancedPrices_Text'), this.appendChild(t), super.createChildren(), this.widthDelegate = new d(this, this.setTextPosition), r.currentApplication.addEventListener(l.WIDTH_CHANGED, this.widthDelegate), this.setTextPosition();
        }
        setTextPosition() {
            Locator.validationManager.callPostValidation(() => this.deferSetTextPos());
        }
        deferSetTextPos() {
            var e, t = this.parentElem.getElement().getBoundingClientRect(), s = this.parentElem.parent.parent.parent.getElement().getBoundingClientRect(), i = n.getScrollY(), a = this.getElement().offsetWidth, s = s.left + s.width;
            let l = t.left - a / 2 + t.width / 2;
            l + a > s && (e = (e = l - 6) - (l = s - a - 10) + a / 2, this.nib.getInlineStyle().left = e + 'px'), l < 0 && (l = 10, this.nib.getInlineStyle().left = t.left + t.width / 2 - 10 + 'px'), this.getInlineStyle().left = l + 'px', r.currentApplication.height / 2 > t.top ? this.getInlineStyle().top = t.top + i + 30 + 'px' : (this.getInlineStyle().top = t.top - this.getElement().offsetHeight - 12 + 'px', this.nib.removeStyle('bss-OfferBadgesPopupEnhancedPrices_Nib'), this.nib.addStyle('bss-OfferBadgesPopupEnhancedPrices_Nib-bottom'));
        }
        dispose() {
            r.currentApplication.removeEventListener(l.WIDTH_CHANGED, this.widthDelegate);
        }
        clickOutsideHandler(e) {
            Locator.validationManager.callPostValidation(() => {
                this.parentElem.removeOfferTermsPopup();
            });
        }
    }
    e.OfferBadgesPopupEnhancedPrices = t;
})(ns_betslipstandarduilib_ui_offerbadges = ns_betslipstandarduilib_ui_offerbadges || {}), (t => {
    var s, e = ns_gen5_ui.Component, a = ns_gen5_data.DataUtil, i = ns_accessibilityuilib_ui_popup.PopupButtonAccessibilityDelegate;
    let l = s = class extends e {
        constructor(e) {
            super(), this.offer = e, this.loading = !1, this.cachedOffer = !1;
        }
        buildTermsLink(e) {
            var t = '0' !== Locator.user.countryStateId ? '&countrystateid=' + Locator.user.countryStateId : '';
            return s.TermsURL + '?languageid=' + Locator.user.languageId + '&countryid=' + Locator.user.countryId + '&offerkey=' + e + t;
        }
        completeHandler(e, t, s, i) {
            this.loading = !1, e && 200 === t && (a.ParseMessage(e, '#OFFER_TCS_' + s), this.getStemOfOffers(i, s));
        }
        filterOfferCodes(e) {
            var t, s = {};
            for (t of e)
                s[t] = t;
            var i, a = [];
            for (i in s)
                a.push(s[i]);
            return a;
        }
        getStemOfOffers(e, t) {
            t = Locator.treeLookup.getReference('#OFFER_TCS_' + t);
            t && e.push(t.getChildren()[0]), e.length === this.offer.offerCodesTermsList.length && (this.createOfferTermsPopup(e), this.cachedOffer = !0);
        }
        createOfferTermsPopup(e) {
            this.offerPopup = new t.OfferBadgesPopup(this), this.offerPopup.stems = e, this.offerPopup.showPopup();
        }
        removeOfferTermsPopup() {
            this.offerPopup && (this.removeChild(this.offerPopup), this.offerPopup = null);
        }
        setActive(e) {
        }
        clickHandler() {
            this.showOfferDetails();
        }
        showOfferDetails() {
        }
        static MakeAccessible(e) {
            e.offer && e.offer.offerCode && e.offer.offerText && i.MakeAccessible(e);
        }
    };
    l.TermsURL = '/offersapi/offerterms/', l = s = __decorate([AccessibilityDelegate(l)], l), t.OfferBadge = l;
})(ns_betslipstandarduilib_ui_offerbadges = ns_betslipstandarduilib_ui_offerbadges || {}), (e => {
    var t = e.OfferBadgesPopupEnhancedPrices, s = ns_gen5_ui.Component, i = e.OfferBadge, a = ns_gen5_ui.TextNode, l = ns_gen5_ui_managers.PopupManager, n = ns_fontloaderlib.FontLoader, r = ns_fontloaderlib_enum.AvailableFontsEnum;
    class d extends i {
        constructor(e) {
            super(e), this.offer = e;
        }
        createChildren() {
            var e;
            this.offer && this.offer.offerCode && this.offer.offerText && (n.LoadFont(this, r.FuturaPTWebBold), this.addStyle('bss-OfferBadgeEnchancedPrice'), (e = new s()).addStyle('bss-OfferBadgeEnchancedPrice_ArrowUp'), this.appendChild(e), (e = new a()).setText(this.offer.offerText), this.appendChild(e), super.createChildren());
        }
        clickHandler() {
            var e;
            this.offerEPPopup ? this.removeOfferTermsPopup() : (e = this.offerEPPopup = new t(this, this.offer.offerText), this.appendChild(e), l.AddPopup(e, !0, l.Root, !1), l.AddDelegate(e));
        }
        fontLoaderCompleted(e) {
        }
        removeOfferTermsPopup() {
            this.offerEPPopup && l.HasPopup() && l.ContainsPopup(this.offerEPPopup) && (this.removeChild(this.offerEPPopup), l.RemovePopup(this.offerEPPopup), l.RemoveDelegate(this.offerEPPopup), this.offerEPPopup = null);
        }
    }
    e.OfferBadgeEnchancedPrice = d;
})(ns_betslipstandarduilib_ui_offerbadges = ns_betslipstandarduilib_ui_offerbadges || {}), (e => {
    var t = e.OfferBadge, a = ns_gen5_net.Loader, s = ns_gen5_ui.Label, i = ns_fontloaderlib.FontLoader, l = ns_fontloaderlib_enum.AvailableFontsEnum;
    class n extends t {
        constructor(e) {
            super(e), this.offer = e;
        }
        createChildren() {
            var e;
            this.offer && this.offer.offerCode && this.offer.offerText && (this.addStyle('bss-OfferBadgeStandard'), i.LoadFont(this, l.FuturaPTWebBold), this.offer.offerTextMini && (e = new s(), this.addStyle('bss-OfferBadgeStandard_HasMiniText'), e.addStyle('bss-OfferBadgeStandard_MiniText'), e.setText(this.offer.offerTextMini), this.appendChild(e)), (e = new s()).addStyle('bss-OfferBadgeStandard_StandardText'), e.setText(this.offer.offerText), this.appendChild(e), super.createChildren());
        }
        setActive(e) {
            e ? this.addStyle('bss-OfferBadgeStandard-clicked') : this.removeStyle('bss-OfferBadgeStandard-clicked');
        }
        clickHandler() {
            if (this.offerPopup)
                this.removeOfferTermsPopup();
            else {
                var e, t = this.filterOfferCodes(this.offer.offerCodesTermsList);
                let i = [];
                for (let s of t)
                    this.getStemOfOffers(i, s), this.loading || this.cachedOffer || ((e = new a()).completeHandler = (e, t) => {
                        this.completeHandler(e, t, s, i);
                    }, e.errorHandler = () => {
                        this.loading = !1;
                    }, e.load(this.buildTermsLink(s)));
            }
        }
        fontLoaderCompleted(e) {
        }
        removeOfferTermsPopup() {
            this.setActive(!1), super.removeOfferTermsPopup();
        }
    }
    e.OfferBadgeStandard = n;
})(ns_betslipstandarduilib_ui_offerbadges = ns_betslipstandarduilib_ui_offerbadges || {}), (e => {
    var t = e.OfferBadge, i = ns_gen5_ui.TextNode, a = ns_postbootlib_util.OfferBadgesUtil, l = ns_gen5_ui.Component;
    class s extends t {
        constructor(e) {
            super(e), this.offer = e;
        }
        createChildren() {
            var e, t, s;
            this.offer && this.offer.offerCode && this.offer.offerText && (this.isSubOnOffer = !1, this.addStyle('bss-OfferBadgeBetBuilder'), a.IsSubOn(this.offer.offerCode) && (this.isSubOnOffer = !0), (e = a.GetBadgeTranslation(this.offer.offerCode, !0)) ? this.isSubOnOffer ? (t = new l(), this.appendChild(t), t.addStyle('bss-OfferBadgeBetBuilder_OfferIconWrapper'), (s = new l('span')).addStyle('bss-OfferBadgeBetBuilder_OfferIcon'), t.appendChild(s)) : ((t = new i()).setText(e), this.appendChild(t), this.addStyle('bss-OfferBadgeBetBuilder-mini')) : ((s = new i()).setText(this.offer.offerText), this.appendChild(s)), super.createChildren());
        }
    }
    e.OfferBadgeBetBuilder = s;
})(ns_betslipstandarduilib_ui_offerbadges = ns_betslipstandarduilib_ui_offerbadges || {}), (e => {
    var t = e.OfferBadge, s = ns_gen5_ui.Label, a = ns_gen5_net.Loader, i = ns_fontloaderlib.FontLoader, l = ns_fontloaderlib_enum.AvailableFontsEnum;
    class n extends t {
        constructor(e) {
            super(e), this.offer = e;
        }
        createChildren() {
            var e;
            this.offer && this.offer.offerCode && this.offer.offerText && this.offer.offerValue && (i.LoadFont(this, l.FuturaPTWebBold), this.addStyle('bss-OfferBadgeAccumulator'), (e = new s()).addStyle('bss-OfferBadgeAccumulator_Percentage'), e.setText(`+ ${ this.offer.offerValue }%`), this.appendChild(e), (e = new s()).addStyle('bss-OfferBadgeAccumulator_OfferText'), e.setText(this.offer.offerText), this.appendChild(e), super.createChildren());
        }
        setActive(e) {
            e ? this.addStyle('bss-OfferBadgeAccumulator-clicked') : this.removeStyle('bss-OfferBadgeAccumulator-clicked');
        }
        clickHandler() {
            if (this.offerPopup)
                this.removeOfferTermsPopup();
            else {
                var e, t = this.filterOfferCodes(this.offer.offerCodesTermsList);
                let i = [];
                for (let s of t)
                    this.getStemOfOffers(i, s), this.loading || this.cachedOffer || ((e = new a()).completeHandler = (e, t) => {
                        this.completeHandler(e, t, s, i);
                    }, e.errorHandler = () => {
                        this.loading = !1;
                    }, e.load(this.buildTermsLink(s)));
            }
        }
        fontLoaderCompleted(e) {
        }
        removeOfferTermsPopup() {
            this.setActive(!1), super.removeOfferTermsPopup();
        }
    }
    e.OfferBadgeAccumulator = n;
})(ns_betslipstandarduilib_ui_offerbadges = ns_betslipstandarduilib_ui_offerbadges || {}), (e => {
    var t = e.OfferBadge, s = ns_postbootlib_util.OfferBadgesUtil, i = ns_gen5_ui.Label, a = ns_fontloaderlib.FontLoader, l = ns_fontloaderlib_enum.AvailableFontsEnum, n = ns_gen5_ui.Component, r = ns_gen5_net.Loader;
    class d extends t {
        constructor(e) {
            super(e), this.offer = e, this.offerBadgeText = s.GetTranslation('subOnPlayOn');
        }
        createChildren() {
            var e;
            this.offer && this.offer.offerCode && this.offer.offerText && (a.LoadFont(this, l.FuturaPTWebBold), this.addStyle('bss-OfferBadgeSubOn'), (e = new n()).addStyle('bss-OfferBadgeSubOn_OfferIcon'), this.appendChild(e), (e = new i()).addStyle('bss-OfferBadgeSubOn_OfferText'), e.setText(this.offerBadgeText), this.appendChild(e), super.createChildren(), Locator.pushedConfig.getArePropertiesInitialised() || (this.delegate_pushedConfigInitialisedHandler = new ns_gen5_util.EventListener(this, () => {
                Locator.pushedConfig.removeEventListener('SSO', this.delegate_pushedConfigInitialisedHandler), this.delegate_pushedConfigInitialisedHandler = null, this.checkPushConfigToHideBadge();
            }), Locator.pushedConfig.addEventListener('SSO', this.delegate_pushedConfigInitialisedHandler)));
        }
        checkPushConfigToHideBadge() {
            '1' === Locator.pushedConfig.getAttributeValue('SSO') ? this.unsuspendElementFromDom() : this.suspendElementFromDom();
        }
        setActive(e) {
            e ? this.addStyle('bss-OfferBadgeSubOn-clicked') : this.removeStyle('bss-OfferBadgeSubOn-clicked');
        }
        clickHandler() {
            if (this.offerPopup)
                this.removeOfferTermsPopup();
            else {
                var e, t = this.filterOfferCodes(this.offer.offerCodesTermsList);
                let i = [];
                for (let s of t)
                    this.getStemOfOffers(i, s), this.loading || this.cachedOffer || ((e = new r()).completeHandler = (e, t) => {
                        this.completeHandler(e, t, s, i);
                    }, e.errorHandler = () => {
                        this.loading = !1;
                    }, e.load(this.buildTermsLink(s)));
            }
        }
        fontLoaderCompleted(e) {
        }
        removeOfferTermsPopup() {
            this.setActive(!1), super.removeOfferTermsPopup();
        }
        dispose() {
            this.delegate_pushedConfigInitialisedHandler && (Locator.pushedConfig.removeEventListener('SSO', this.delegate_pushedConfigInitialisedHandler), this.delegate_pushedConfigInitialisedHandler = null), super.detatchStem();
        }
    }
    e.OfferBadgeSubOn = d;
})(ns_betslipstandarduilib_ui_offerbadges = ns_betslipstandarduilib_ui_offerbadges || {}), (t => {
    var e = t.OfferBadge, s = ns_gen5_ui.Label, i = ns_fontloaderlib.FontLoader, a = ns_fontloaderlib_enum.AvailableFontsEnum;
    class l extends e {
        constructor(e) {
            super(e), this.offer = e;
        }
        createChildren() {
            var e;
            this.offer && this.offer.offerCode && this.offer.offerText && (this.addStyle('bss-OfferBadgeIncludesExtraTime'), i.LoadFont(this, a.FuturaPTWebBold), this.offer.offerTextMini && (e = new s(), this.addStyle('bss-OfferBadgeIncludesExtraTime_HasMiniText'), e.addStyle('bss-OfferBadgeIncludesExtraTime_MiniText'), e.setText(this.offer.offerTextMini), this.appendChild(e)), (e = new s()).addStyle('bss-OfferBadgeIncludesExtraTime_StandardText'), e.setText(this.offer.offerText), this.appendChild(e), super.createChildren());
        }
        fontLoaderCompleted(e) {
        }
        showOfferDetails() {
            var e;
            this.offerPopup ? this.removeOfferTermsPopup() : (e = languageDefinition('BetslipStandardUILib'), this.offerPopup = new t.OfferBadgesPopup(this), this.offerPopup.staticContent = {
                headerText: e.getValue('120M'),
                bodyText: e.getValue('120MBody'),
                linkUrl: t.OfferBadgesPopup.BuildSoccerRulesUrl(),
                linkText: e.getValue('BetRestrictionTC')
            }, this.offerPopup.showPopup());
        }
    }
    t.OfferBadgeIncludesExtraTime = l;
})(ns_betslipstandarduilib_ui_offerbadges = ns_betslipstandarduilib_ui_offerbadges || {}), (t => {
    var e = t.OfferBadge, i = ns_gen5_ui.Label, a = ns_fontloaderlib.FontLoader, l = ns_fontloaderlib_enum.AvailableFontsEnum;
    class s extends e {
        constructor(e) {
            super(e), this.offer = e;
        }
        createChildren() {
            var e, t, s;
            this.offer && this.offer.offerCode && this.offer.offerText && ([s, e] = (this.addStyle('bss-OfferBadgeNinetyPlusStoppageTime'), a.LoadFont(this, l.FuturaPTWebBold), this.offer.offerTextMini && (s = new i(), this.addStyle('bss-OfferBadgeNinetyPlusStoppageTime_HasMiniText'), s.addStyle('bss-OfferBadgeNinetyPlusStoppageTime_MiniText'), s.setText(this.offer.offerTextMini), this.appendChild(s)), this.offer.offerText.split(/(?=\+)/)), (t = new i()).addStyle('bss-OfferBadgeNinetyPlusStoppageTime_StandardText'), t.setText(s), this.appendChild(t), e && ((s = new i()).addStyle('bss-OfferBadgeNinetyPlusStoppageTime_SuffixText'), s.setText(e), this.appendChild(s)), super.createChildren());
        }
        fontLoaderCompleted(e) {
        }
        showOfferDetails() {
            var e;
            this.offerPopup ? this.removeOfferTermsPopup() : (e = languageDefinition('BetslipStandardUILib'), this.offerPopup = new t.OfferBadgesPopup(this), this.offerPopup.staticContent = {
                headerText: e.getValue('90M'),
                bodyText: e.getValue('90MBody'),
                linkUrl: t.OfferBadgesPopup.BuildSoccerRulesUrl(),
                linkText: e.getValue('BetRestrictionTC')
            }, this.offerPopup.showPopup());
        }
    }
    t.OfferBadgeNinetyPlusStoppageTime = s;
})(ns_betslipstandarduilib_ui_offerbadges = ns_betslipstandarduilib_ui_offerbadges || {}), (e => {
    var t = ns_gen5_ui.Component, s = ns_gen5_ui.Label, a = ns_betslipuilib_util.DropdownHelper, i = ns_betslipuilib_ui_bet.OddsLabel, l = ns_accessibilityuilib_ui_dropdown.ItemRadioAccessibilityDelegate;
    let n = class extends t {
        constructor(e, t, s, i) {
            super(), this.oddsVal = e, this.spSelected = t, this.target = s, this.delegate = i, this.oddsChanged = !0, this.dropdownHelper = new a(this, s);
        }
        createChildren() {
            this.addStyle('bsc-OddsDropdown'), this.oddsLabel = new i(), this.oddsLabel.addStyle('bsc-OddsDropdown_Item'), this.spLabel = new s();
            var e = StandardLocaleHelper.GetTranslation('sp');
            this.spLabel.setText(e), this.spLabel.addStyle('bsc-OddsDropdown_Item'), (this.oddsVal == e || this.spSelected ? this.spLabel : this.oddsLabel).addStyle('bsc-OddsDropdown_Item-selected'), this.oddsLabel.clickHandler = () => {
                this.delegate.oddsDropdownSpOddsDeselected(), this.spLabel.removeStyle('bsc-OddsDropdown_Item-selected'), this.oddsLabel.addStyle('bsc-OddsDropdown_Item-selected'), this.dropdownHelper.setSelecteItem(this.oddsLabel), this.dropdownHelper.hideDropDown(), this.oddsItemAccessibility && this.oddsItemAccessibility.clicked();
            }, this.spLabel.clickHandler = () => {
                this.delegate.oddsDropdownSpOddsSelected(), this.spLabel.addStyle('bsc-OddsDropdown_Item-selected'), this.oddsLabel.removeStyle('bsc-OddsDropdown_Item-selected'), this.dropdownHelper.setSelecteItem(this.spLabel), this.dropdownHelper.hideDropDown(), this.spItemAccessibility && this.spItemAccessibility.clicked();
            }, this.appendChild(this.oddsLabel), this.appendChild(this.spLabel);
        }
        commitProperties() {
            this.oddsChanged && (this.oddsChanged = !1, this.oddsLabel.setOdds(this.oddsVal, this.oddsTypeOverride));
        }
        showDropdown() {
            this.dropdownHelper.showDropDown(8, 4), this.isShowing = !0;
        }
        hideDropdown() {
            this.isShowing && (this.dropdownHelper.hideDropDown(), this.isShowing = !1);
        }
        setOdds(e, t) {
            this.oddsVal = e, this.oddsTypeOverride = t, this.oddsChanged = !0, this.invalidateProperties();
        }
        disable() {
            this.spLabel.removeStyle('bsc-OddsDropdown_Item-selected'), this.oddsLabel.addStyle('bsc-OddsDropdown_Item-selected');
        }
        dispose() {
            this.isShowing = !1;
        }
        static MakeAccessible(e) {
            let t = e.oddsVal == StandardLocaleHelper.GetTranslation('sp') || e.spSelected;
            var s = {
                    isSelected: () => t,
                    dropDownTriggerButton: e.target
                }, s = (e.spItemAccessibility = new l(e.spLabel, s), e.spItemAccessibility.makeAccessible(), {
                    isSelected: () => !t,
                    dropDownTriggerButton: e.target
                });
            e.oddsItemAccessibility = new l(e.oddsLabel, s), e.oddsItemAccessibility.makeAccessible();
        }
    };
    n = __decorate([AccessibilityDelegate(n)], n), e.OddsDropdown = n;
})(ns_betslipstandarduilib_ui_bet_controls_common = ns_betslipstandarduilib_ui_bet_controls_common || {}), (e => {
    var t = ns_betslipuilib_ui_bet.OddsLabel, s = e.OddsDropdown, i = ns_betslipuilib_accessibility.OddsDropdownAccessibilityDelegate, a = ns_betslipuilib_accessibility.BetBoostAccessibilityDelegate, l = ns_betslipcorelib_util.OddsFormatter, n = ns_gen5_ui.Label, r = ns_gen5_ui.Component;
    let d = class extends t {
        constructor(e, t) {
            super(t), this.model = e, this.disabled = !1, this.receiptMode = !1;
        }
        createChildren() {
            this.addStyle('bsc-OddsDropdownLabel'), super.createChildren();
        }
        setOddsChanged() {
            this.disabled = !0, this.addStyle('bsc-OddsDropdownLabel_OddsChanged'), this.dropdown && this.dropdown.hideDropdown(), super.setOddsChanged();
        }
        acceptOddsChange() {
            this.disabled = !1, this.removeStyle('bsc-OddsDropdownLabel_OddsChanged'), super.acceptOddsChange();
        }
        clickHandler() {
            this.showOddsSelection();
        }
        showOddsSelection() {
            this.disabled || this.receiptMode || (this.dropdown || (this.dropdown = new s(this.itemOdds, this.spOdds, this, this), this.appendChild(this.dropdown)), this.dropdown.setOdds(this.itemOdds, this.oddsTypeOverride), this.dropdown.showDropdown());
        }
        setSPOdds(e, t, s) {
            this.spOdds = t, this.dropdown && this.dropdown.setOdds(e, s), this.itemOdds = e, this.spOdds ? super.setOdds('0/0', s) : super.setOdds(e, s);
        }
        setBoostedOdds(e, t, s) {
            var i, a;
            this.oddsBeforeBoost || (this.disabled = !0, this.addStyle('bsc-OddsDropdownLabel_BoostedOdds'), this.oddsBeforeBoost = new n('span'), this.oddsBeforeBoost.addStyle('bsc-OddsDropdownLabel_OddsBeforeBoost'), this.appendChildAt(this.oddsBeforeBoost, 0), (i = new r()).addStyle('bsc-OddsDropdownLabel_BoostedOddsContainer'), this.appendChildAt(i, 1), (a = new r('span')).addStyle('bsc-OddsDropdownLabel_Chevron'), i.appendChild(a), i.appendChild(this.label)), this.oddsBeforeBoostValue = l.FormatOdds(t, this.spText, this.oddsTypeOverride) || t || '', this.oddsBeforeBoost.setText(this.oddsBeforeBoostValue), this.oddsBeforeBoostValue = t, super.setOdds(e, s);
        }
        disableDropdown() {
            this.disabled = !0, this.addStyle('bsc-OddsDropdownLabel-disabled'), this.dropdown && this.dropdown.disable(), this.accessibility && this.accessibility.setDisabled();
        }
        enableDropdown() {
            this.disabled = !1, this.removeStyle('bsc-OddsDropdownLabel-disabled'), this.accessibility && this.accessibility.setDisabled();
        }
        oddsDropdownSpOddsSelected() {
            this.model.oddsDropdownLabelSpOddsSelected();
        }
        oddsDropdownSpOddsDeselected() {
            this.model.oddsDropdownLabelSpOddsDeselected();
        }
        setStateForReceipt() {
            this.receiptMode = !0, this.accessibility && this.accessibility.setDisabled();
        }
        revertReceiptState() {
            this.receiptMode = !1, this.accessibility && this.accessibility.setDisabled();
        }
        static MakeAccessible(e) {
            e.accessibility = new i(e, { isDisabled: () => e.disabled }), e.accessibility.makeAccessible(), e.oddsBeforeBoost && a.MakeAccessible(e.oddsBeforeBoost);
        }
    };
    d = __decorate([AccessibilityDelegate(d)], d), e.OddsDropdownLabel = d;
})(ns_betslipstandarduilib_ui_bet_controls_common = ns_betslipstandarduilib_ui_bet_controls_common || {}), (e => {
    var t = ns_gen5_ui.Component, s = ns_gen5_ui.Label, i = ns_accessibilityuilib_ui_dropdown.ItemRadioAccessibilityDelegate;
    let a = class extends t {
        constructor(e, t, s, i) {
            super(), this.pitcher = e, this.selectedPitcher = t, this.triggerButton = s, this.delegate = i;
        }
        createChildren() {
            this.addStyle('bss-PitcherDropdownItem');
            var e = new s();
            e.addStyle('bss-PitcherDropdownItem_Label');
            let t = this.pitcher.description;
            t = t || StandardLocaleHelper.GetTranslation('listedPitchers'), e.setText(t), this.appendChild(e), this.pitcher.pitcherId === this.selectedPitcher && this.setSelected();
        }
        setSelected() {
            this.isSelected = !0, this.addStyle('bss-PitcherDropdownItem-selected'), this.delegate.pitcherDropdownItemSetSelected(this), this.accessibility && this.accessibility.clickHandler();
        }
        clickHandler(e) {
            this.isSelected || this.setSelected();
        }
        deselect() {
            this.isSelected = !1, this.removeStyle('bss-PitcherDropdownItem-selected');
        }
        static MakeAccessible(e) {
            var t = {
                    isSelected: () => e.isSelected,
                    dropDownTriggerButton: e.triggerButton
                }, t = new i(e, t);
            (e.accessibility = t).makeAccessible();
        }
    };
    a = __decorate([AccessibilityDelegate(a)], a), e.PitcherDropdownItem = a;
})(ns_betslipstandarduilib_ui_bet_controls_common = ns_betslipstandarduilib_ui_bet_controls_common || {}), (l => {
    var e = ns_gen5_ui.Component, n = ns_betslipuilib_util.DropdownHelper;
    class t extends e {
        constructor(e, t, s, i) {
            super(), this.data = e, this.target = s, this.delegate = i, this.addStyle('bss-PitcherDropdown'), this.dropDownHelper = new n(this, this.target);
            for (var a of this.data) {
                a = new l.PitcherDropdownItem(a, t, s, this);
                this.appendChild(a);
            }
        }
        showDropDown() {
            this.dropDownHelper.showDropDown(8);
        }
        pitcherDropdownItemSetSelected(e) {
            this.selectedItem && (this.selectedItem.deselect(), this.dropDownHelper.hideDropDown()), this.selectedItem = e, this.dropDownHelper.setSelecteItem(this.selectedItem), this.delegate.pitcherDropdownUpdatePitcherActionCallBack(e.pitcher);
        }
        dispose() {
        }
    }
    l.PitcherDropdown = t;
})(ns_betslipstandarduilib_ui_bet_controls_common = ns_betslipstandarduilib_ui_bet_controls_common || {}), (e => {
    var s = ns_gen5_ui.Component, i = ns_gen5_ui.Label, t = ns_betslipstandarduilib_ui_bet_controls_common.PitcherDropdown, a = ns_accessibilityuilib_ui_popup.PopupButtonAccessibilityDelegate;
    let l = class extends s {
        constructor(e, t, s, i, a) {
            super(), this.model = e, this.delegate = t, this.pitcherDescription = s, this.selectedPitcher = i, this.showDisclaimer = a, this.receiptMode = !1;
        }
        createChildren() {
            this.defaultStyle = this.defaultStyle || 'bss-PitcherDetails', this.addStyle(this.defaultStyle), this.defaultPitcherText = StandardLocaleHelper.GetTranslation('listedPitchers');
            var e = new s(), t = (e.addStyle(this.defaultStyle + '_Wrapper'), this.appendChild(e), new i());
            t.addStyle(this.defaultStyle + '_Label'), t.setText(StandardLocaleHelper.GetTranslation('pitcherAction')), e.appendChild(t), this.pitcherActionButton = new i(), this.pitcherActionButton.addStyle(this.defaultStyle + '_Button'), this.pitcherText = new i(), this.pitcherText.addStyle(this.defaultStyle + '_ButtonText'), this.pitcherText.setText(this.pitcherDescription), this.pitcherActionButton.appendChild(this.pitcherText), e.appendChild(this.pitcherActionButton), this.pitcherActionButton.clickHandler = () => {
                this.receiptMode || this.model.getPitcherActions(e => this.getPitcherOptionsCallback(e));
            }, this.pitcherActionDisclaimer = new i(), this.pitcherActionDisclaimer.addStyle(this.defaultStyle + '_Disclaimer'), this.pitcherActionDisclaimer.setText(StandardLocaleHelper.GetTranslation('adjustedLine')), this.showDisclaimer ? this.addStyle(this.defaultStyle + '-disclaimer') : this.pitcherActionDisclaimer.suspendElementFromDom(), this.appendChild(this.pitcherActionDisclaimer);
        }
        show() {
            this.receiptMode = !1, this.accessibility && this.accessibility.setDisabled();
        }
        hide() {
            this.receiptMode = !0, this.accessibility && this.accessibility.setDisabled();
        }
        getPitcherOptionsCallback(e) {
            e && !this.receiptMode && (this.data = e, this.pitcherDropdown || (this.pitcherDropdown = new t(e, this.selectedPitcher, this.pitcherActionButton, this)), this.pitcherDropdown.showDropDown());
        }
        pitcherDropdownUpdatePitcherActionCallBack(t) {
            if (this.currentPitcher) {
                let e = t.description;
                e = e || this.defaultPitcherText, this.pitcherText.setText(e), this.delegate.pitcherDetailsPitcherSelectionChanged(t.pitcherId, e);
            }
            (this.currentPitcher = t) == this.data[0] ? (this.pitcherActionDisclaimer.suspendElementFromDom(), this.removeStyle(this.defaultStyle + '-disclaimer')) : (this.pitcherActionDisclaimer.unsuspendElementFromDom(), this.addStyle(this.defaultStyle + '-disclaimer'));
        }
        updatePitcher(e) {
            this.pitcherText.setText(e);
        }
        static MakeAccessible(e) {
            e.accessibility = new a(e.pitcherActionButton, { isDisabled: () => e.receiptMode }), e.accessibility.makeAccessible();
        }
    };
    l = __decorate([AccessibilityDelegate(l)], l), e.PitcherDetails = l;
})(ns_betslipstandarduilib_ui_bet_controls_standard = ns_betslipstandarduilib_ui_bet_controls_standard || {}), (e => {
    var i, a = ns_gen5_ui.Component, l = ns_gen5_ui.DomElement, n = ns_gen5_ui.Label, r = ns_gen5_util.StringUtil, t = ns_betslipuilib_util.TransitionHelper, d = ns_navlib_util.WebsiteNavigationManager, s = ns_betslipstandarduilib_accessibility.BetslipCheckboxAccessibilityDelegate;
    let o = i = class extends a {
        constructor(e) {
            super(), this.delegate = e, this.isHidden = !1, this.isDisabled = !1, this.isSelected = !1, this.defaultStyle = 'bsc-EachWayCheckbox', this.raceLookup = [
                '2',
                '4',
                '2030',
                '2031'
            ];
        }
        createChildren() {
            this.addStyle(this.defaultStyle);
            var e = this.wrapper = new l(), t = (e.setAttribute('class', this.defaultStyle + '_Wrapper'), new a()), s = (t.addStyle(this.defaultStyle + '_Box'), e.appendChild(t), new a()), t = (s.addStyle(this.defaultStyle + '_Tick'), t.appendChild(s), new n()), s = '32' === Locator.user.languageId && -1 < this.raceLookup.indexOf(d.CurrentClassification);
            t.setText(s ? 'W/P' : StandardLocaleHelper.GetTranslation('EW')), t.addStyle(this.defaultStyle + '_EwLabel'), e.appendChild(t), this.oddsLabel = new n(), this.oddsLabel.addStyle(this.defaultStyle + '_Odds'), e.appendChild(this.oddsLabel), this.placesLabel = new n(), this.placesLabel.addStyle(this.defaultStyle + '_Places'), e.appendChild(this.placesLabel), this.appendChild(e);
        }
        clickHandler() {
            this.isDisabled || (this.isSelected ? (this.setUnchecked(), this.delegate.eachwayCheckboxUnchecked()) : (this.setChecked(), this.delegate.eachwayCheckboxChecked()));
        }
        setChecked() {
            this.addStyle(this.defaultStyle + '-checked'), this.isSelected = !0, this.accessibility && this.accessibility.setChecked();
        }
        setUnchecked() {
            this.removeStyle(this.defaultStyle + '-checked'), this.isSelected = !1, this.accessibility && this.accessibility.setChecked();
        }
        getChecked() {
            return this.isSelected;
        }
        setTerms(e) {
            e = e.split('\xAC');
            let t;
            var s = e[0], e = e[1];
            s && this.oddsLabel.setText(s), t = e === i.GOALSCORER_PLACE_COUNT ? StandardLocaleHelper.GetTranslation('UnlimitedPlaces') : r.Format(StandardLocaleHelper.GetTranslation(i.PLACES_ML_KEY), e + ''), this.placesLabel.setText(t);
        }
        enableCheckbox() {
            this.isDisabled = !1, this.removeStyle(this.defaultStyle + '-disabled'), this.accessibility && this.accessibility.setDisabled();
        }
        disableCheckbox() {
            this.isDisabled = !0, this.addStyle(this.defaultStyle + '-disabled'), this.accessibility && this.accessibility.setDisabled();
        }
        hide() {
            this.wrapper.suspendElementFromDom(), t.HideElementTransition(this), this.isHidden = !0;
        }
        show() {
            this.wrapper.unsuspendElementFromDom(), t.ShowElementTransition(this), this.isHidden = !1;
        }
        static MakeAccessible(e) {
            e.accessibility = new s(e, {
                isDisabled: () => e.isDisabled,
                isPressed: () => e.isSelected,
                isHidden: () => e.isHidden
            }), e.accessibility.makeAccessible();
        }
    };
    o.GOALSCORER_PLACE_COUNT = '98', o.PLACES_ML_KEY = 'Places', o = i = __decorate([AccessibilityDelegate(o)], o), e.EachWayCheckbox = o;
})(ns_betslipstandarduilib_ui_bet_controls_common = ns_betslipstandarduilib_ui_bet_controls_common || {}), (e => {
    var i = ns_gen5_ui.Component, a = ns_gen5_ui.DomElement, l = ns_gen5_ui.Label, s = ns_accessibilityuilib_ui.CheckboxAccessibilityDelegate;
    let t = class extends i {
        constructor(e) {
            super(), this.delegate = e, this.isSelected = !1, this.isDisabled = !1;
        }
        createChildren() {
            this.addStyle('bsc-NoReservesCheckbox');
            var e = new a(), t = (e.setAttribute('class', 'bsc-NoReservesCheckbox_Wrapper'), new i()), s = (t.addStyle('bsc-NoReservesCheckbox_Box'), e.appendChild(t), new i()), t = (s.addStyle('bsc-NoReservesCheckbox_Tick'), t.appendChild(s), new l());
            t.setText(StandardLocaleHelper.GetTranslation('noReserves')), t.addStyle('bsc-NoReservesCheckbox_Label'), e.appendChild(t), this.appendChild(e);
        }
        clickHandler() {
            this.isDisabled || (this.isSelected ? (this.setUnchecked(), this.delegate.noReservesCheckboxUnchecked()) : (this.setChecked(), this.delegate.noReservesCheckboxChecked()));
        }
        setChecked() {
            this.addStyle('bsc-NoReservesCheckbox-checked'), this.isSelected = !0, this.accessibility && this.accessibility.setChecked();
        }
        setUnchecked() {
            this.removeStyle('bsc-NoReservesCheckbox-checked'), this.isSelected = !1, this.accessibility && this.accessibility.setChecked();
        }
        enableCheckbox() {
            this.isDisabled = !1, this.removeStyle('bsc-NoReservesCheckbox-disabled'), this.accessibility && (this.accessibility.setDisabled(), this.accessibility.setHidden());
        }
        disableCheckbox() {
            this.isDisabled = !0, this.addStyle('bsc-NoReservesCheckbox-disabled'), this.accessibility && (this.accessibility.setDisabled(), this.accessibility.setHidden());
        }
        static MakeAccessible(e) {
            var t = {
                isDisabled: () => e.isDisabled,
                isPressed: () => e.isSelected,
                isHidden: () => e.isDisabled,
                label: StandardLocaleHelper.GetTranslation('noReserves')
            };
            e.accessibility = new s(e, t), e.accessibility.makeAccessible();
        }
    };
    t = __decorate([AccessibilityDelegate(t)], t), e.NoReservesCheckbox = t;
})(ns_betslipstandarduilib_ui_bet_controls_common = ns_betslipstandarduilib_ui_bet_controls_common || {}), (e => {
    var i = ns_gen5_ui.Component, a = ns_gen5_ui.DomElement, l = ns_gen5_ui.Label, s = ns_accessibilityuilib_ui.CheckboxAccessibilityDelegate;
    let t = class extends i {
        constructor(e) {
            super(), this.delegate = e, this.isSelected = !1, this.isDisabled = !1;
        }
        createChildren() {
            this.addStyle('bsc-AutoVoidCheckbox');
            var e = new a(), t = (e.setAttribute('class', 'bsc-AutoVoidCheckbox_Wrapper'), new i()), s = (t.addStyle('bsc-AutoVoidCheckbox_Box'), e.appendChild(t), new i()), t = (s.addStyle('bsc-AutoVoidCheckbox_Tick'), t.appendChild(s), new l());
            t.setText(StandardLocaleHelper.GetTranslation('AutoVoid')), t.addStyle('bsc-AutoVoidCheckbox_Label'), e.appendChild(t), this.appendChild(e), this.suspendElementFromDom();
        }
        clickHandler() {
            this.isDisabled || (this.isSelected ? (this.setUnchecked(), this.delegate.autoVoidCheckboxUnchecked()) : (this.setChecked(), this.delegate.autoVoidCheckboxChecked()));
        }
        setChecked() {
            this.addStyle('bsc-AutoVoidCheckbox-checked'), this.isSelected = !0, this.accessibility && this.accessibility.setChecked();
        }
        setUnchecked() {
            this.removeStyle('bsc-AutoVoidCheckbox-checked'), this.isSelected = !1, this.accessibility && this.accessibility.setChecked();
        }
        enableCheckbox() {
            this.isDisabled = !1, this.removeStyle('bsc-AutoVoidCheckbox-disabled'), this.accessibility && this.accessibility.setDisabled();
        }
        disableCheckbox() {
            this.isDisabled = !0, this.addStyle('bsc-AutoVoidCheckbox-disabled'), this.accessibility && this.accessibility.setDisabled();
        }
        static MakeAccessible(e) {
            var t = {
                isDisabled: () => e.isDisabled,
                isPressed: () => e.isSelected,
                isHidden: () => !1,
                label: StandardLocaleHelper.GetTranslation('AutoVoid')
            };
            e.accessibility = new s(e, t), e.accessibility.makeAccessible();
        }
    };
    t = __decorate([AccessibilityDelegate(t)], t), e.AutoVoidCheckbox = t;
})(ns_betslipstandarduilib_ui_bet_controls_common = ns_betslipstandarduilib_ui_bet_controls_common || {}), (e => {
    var t = ns_gen5_ui.ComponentStemBase, s = ns_gen5_ui.Label, i = ns_gen5_util.Delegate, a = ns_betslipuilib_ui_bet.OddsLabel, l = ns_accessibilityuilib_ui.LinkAccessibilityDelegate, n = ns_pricevariancelib.PriceVariance;
    let r = class extends t {
        constructor(e, t) {
            super(), this.model = e, this.delegate = t, this.oddsChange = !1, this.suspendChange = !1;
        }
        createChildren() {
            this.addStyle('bsc-EwexDropdownItem');
            var e = StandardLocaleHelper.GetTranslation('Places').replace('{0}', this.model.placeCount.toString()), t = new s();
            t.addStyle('bsc-EwexDropdownItem_PlaceCount'), t.setText(e), this.oddsLabel = new a(), this.oddsLabel.defaultStyle = 'bsc-EwexDropdownItem_Odds', this.oddsLabel.setOdds(this.model.getOdds()), this.model.isSelected && this.addStyle('bsc-EwexDropdownItem-selected'), this.appendChild(t), this.appendChild(this.oddsLabel), Locator.subscriptionManager.sharedSubscribe(this.model.getTopic(), new i(this, this.subscriptionHandler), ns_gen5_data.SubscriptionManagerFlags.GLOBAL_CONTEXT);
        }
        commitProperties() {
            var e;
            this.oddsChange && (this.oddsChange = !1, this.model.setGlobalOdds(this.stem.data.OD), e = n.ApplyPriceVariance(this.stem.data.OD, {
                classificationId: this.model.classificationId,
                leagueCode: this.model.leagueCode,
                marketId: this.model.plbtid,
                fixtureStarted: this.model.fixtureStarted ? '1' : '0'
            }), this.oddsLabel.setOdds(e), this.model.setOdds(e)), this.suspendChange && (this.suspendChange = !1, '1' == this.stem.data.SU ? this.suspend() : this.unsuspend());
        }
        disable() {
            this.isDisabled = !0, this.addStyle('bsc-EwexDropdownItem-disabled');
        }
        suspend() {
            this.model.suspended = !0, this.addStyle('bsc-EwexDropdownItem-suspended');
        }
        unsuspend() {
            this.model.suspended = !1, this.removeStyle('bsc-EwexDropdownItem-suspended');
        }
        subscriptionHandler(e) {
            this.stem = Locator.treeLookup.getReference(e.type), this.stem ? (this.stem.addDelegate(this), this.oddsChange = !0, this.suspendChange = !0, this.invalidateProperties()) : this.suspendElementFromDom();
        }
        stemUpdateHandler(e, t) {
            'OD' in t && (this.oddsChange = !0), 'SU' in t && (this.suspendChange = !0), this.invalidateProperties();
        }
        stemDeleteHandler(e) {
            this.stem.removeDelegate(this), this.suspend();
        }
        stemInsertHandler(e, t) {
        }
        clickHandler() {
            this.model.suspended || this.isDisabled || this.delegate.ewexDropdownItemSelect(this, this.model);
        }
        dispose() {
            this.stem && (this.stem.removeDelegate(this), Locator.subscriptionManager.sharedUnsubscribe(this.stem.data.IT, ns_gen5_data.SubscriptionManagerFlags.GLOBAL_CONTEXT));
        }
        static MakeAccessible(e) {
            l.MakeAccessible(e);
        }
    };
    r = __decorate([AccessibilityDelegate(r)], r), e.EwexDropdownItem = r;
})(ns_betslipstandarduilib_ui_bet_controls_common = ns_betslipstandarduilib_ui_bet_controls_common || {}), (e => {
    var t = ns_gen5_ui.Component, s = e.EwexDropdownItem, i = ns_betslipuilib_util.DropdownHelper;
    class a extends t {
        constructor(e, t, s) {
            super(), this.ewexParticipants = e, this.model = t, this.target = s, this.children = [], this.dropDownHelper = new i(this, this.target);
        }
        createChildren() {
            this.addStyle('bsc-EwexDropdown');
            for (var e of this.ewexParticipants) {
                var t = new s(e, this);
                !e.isSelected && this.model.isOnSlip(e) && t.disable(), this.appendChild(t), this.children.push(t);
            }
        }
        ewexDropdownItemSelect(e, t) {
            this.dropDownHelper.hideDropDown(), this.model.ewexSelectionChanged(t);
        }
        showDropdown() {
            this.dropDownHelper.showDropDown(8);
        }
        dispose() {
            for (var e of this.children)
                e.dispose();
            this.removeAllChildren();
        }
    }
    e.EwexDropdown = a;
})(ns_betslipstandarduilib_ui_bet_controls_common = ns_betslipstandarduilib_ui_bet_controls_common || {}), (e => {
    var s, i = ns_gen5_ui.Component, a = ns_gen5_ui.Label, l = e.EwexDropdown, n = ns_gen5_util.StringUtil, r = ns_gen5_ui.DomElement, t = ns_accessibilityuilib_ui.CheckboxAccessibilityDelegate, d = ns_accessibilityuilib_ui_popup.PopupButtonAccessibilityDelegate;
    let o = s = class extends i {
        constructor(e, t) {
            super(), this.model = e, this.delegate = t, this.isSelected = !1, this.isDisabled = !1;
        }
        createChildren() {
            this.addStyle('bsc-EwexCheckbox');
            var e = new r(), t = (e.setAttribute('class', 'bsc-EwexCheckbox_CheckboxWrapper'), e.clickHandler = () => {
                    this.isDisabled || (this.isSelected ? (this.setUnchecked(), this.delegate.ewexCheckboxUnchecked()) : (this.setChecked(), this.delegate.ewexCheckboxChecked()));
                }, this.checkbox = new i(), this.checkbox.addStyle('bsc-EwexCheckbox_Box'), e.appendChild(this.checkbox), new i()), t = (t.addStyle('bsc-EwexCheckbox_Tick'), this.checkbox.appendChild(t), new a()), t = (t.setText(StandardLocaleHelper.GetTranslation('EW')), t.addStyle('bsc-EwexCheckbox_EwLabel'), e.appendChild(t), this.oddsLabel = new a(), this.oddsLabel.addStyle('bsc-EwexCheckbox_Odds'), e.appendChild(this.oddsLabel), this.model.hideEWPlaceLabelItem());
            t ? (this.placesLabel = new a(), this.placesLabel.addStyle('bsc-EachWayCheckbox_Places')) : (this.placesLabel = new a(), this.placesLabel.addStyle('bsc-EwexCheckbox_Places'), this.placesLabel.clickHandler = () => {
                this.isSelected && !this.model.isPopularBet() ? this.showDropdown() : (this.setChecked(), this.delegate.ewexCheckboxChecked());
            }), e.appendChild(this.placesLabel), this.appendChild(e);
        }
        setChecked() {
            this.model.isPopularBet() ? (this.accessibility && this.accessibility.setChecked(), this.isSelected = !0, this.addStyle('bsc-EwexCheckbox-checkedpopularbet')) : (this.isSelected = !0, this.addStyle('bsc-EwexCheckbox-checked'), this.accessibility && this.accessibility.setChecked());
        }
        setUnchecked() {
            this.model.isPopularBet() ? (this.accessibility && this.accessibility.setChecked(), this.isSelected = !1, this.removeStyle('bsc-EwexCheckbox-checkedpopularbet')) : (this.isSelected = !1, this.removeStyle('bsc-EwexCheckbox-checked'), this.accessibility && this.accessibility.setChecked());
        }
        getChecked() {
            return this.isSelected;
        }
        setTerms(e) {
            var e = e.split('\xAC'), t = e[0], e = e[1];
            t && this.oddsLabel.setText(t), e && this.placesLabel.setText(n.Format(StandardLocaleHelper.GetTranslation(s.PLACES_ML_KEY), e));
        }
        setPlaceCount(e) {
            e = n.Format(StandardLocaleHelper.GetTranslation(s.PLACES_ML_KEY), e + '');
            this.placesLabel.setText(e);
        }
        setCheckboxEnabled() {
            this.removeStyle('bsc-EwexCheckbox-disabled'), this.isDisabled = !1, this.accessibility && this.accessibility.setDisabled();
        }
        setCheckboxDisabled() {
            this.addStyle('bsc-EwexCheckbox-disabled'), this.isDisabled = !0, this.accessibility && this.accessibility.setDisabled();
        }
        showDropdown() {
            this.delegate.ewexCheckboxDisableSlip(), this.model.getEwexOptions(e => {
                e && this.buildEwexDropdown(e), this.delegate.ewexCheckboxEnableSlip();
            });
        }
        buildEwexDropdown(t) {
            if (t) {
                let e = this.ewexDropdown = new l(t, this.model, this.placesLabel);
                Locator.validationManager.callPostValidation(() => {
                    e.showDropdown();
                });
            }
        }
        dispose() {
            this.ewexDropdown && this.ewexDropdown.dispose();
        }
        static MakeAccessible(e) {
            e.accessibility = new t(e.checkbox, {
                isDisabled: () => e.isDisabled,
                isPressed: () => e.isSelected,
                isHidden: () => !1
            }), e.accessibility.makeAccessible(), d.MakeAccessible(e.placesLabel);
        }
    };
    o.PLACES_ML_KEY = 'Places', o = s = __decorate([AccessibilityDelegate(o)], o), e.EwexCheckbox = o;
})(ns_betslipstandarduilib_ui_bet_controls_common = ns_betslipstandarduilib_ui_bet_controls_common || {}), (e => {
    var t = ns_gen5_ui.Component, s = ns_betslipstandarduilib_ui_util.StandardLocaleHelper;
    class i extends t {
        constructor(e) {
            super('img'), this.isPlayerBuilder = e, this.languageId = Locator.user.languageId || '1';
        }
        setRacingLogo() {
            this.setAttribute('src', s.GetBetBuilderRacingLogoPath());
        }
        createChildren() {
            this.addStyle('bss-BetBuilderLogo'), this.setAttribute('src', `/sports-assets/${ SITE_ROOT_PATH }/BetslipStandardUILib/assets/betbuilder/${ i.Locale.getBetBuilderLogoName(this.isPlayerBuilder) }-${ this.languageId }.svg`);
        }
        resetLogoState(e) {
            this.isPlayerBuilder = e, this.setAttribute('src', `/sports-assets/${ SITE_ROOT_PATH }/BetslipStandardUILib/assets/betbuilder/${ i.Locale.getBetBuilderLogoName(this.isPlayerBuilder) }-${ this.languageId }.svg`);
        }
    }
    i.Locale = localeLib('BetslipStandardUILib'), e.BetBuilderLogo = i;
})(ns_betslipstandarduilib_ui_bet_controls_common = ns_betslipstandarduilib_ui_bet_controls_common || {}), (e => {
    var t, s = ns_gen5_ui.Component, i = ns_accessibilityuilib_ui.ButtonAccessibilityDelegate;
    let a = t = class extends s {
        constructor() {
            super();
        }
        static RegisterStateDelegate(e) {
            t.OtherMultiplesDelegates.push(e);
        }
        createChildren() {
            this.addStyle('bss-OtherMultiplesButton'), super.createChildren();
        }
    };
    a.OtherMultiplesDelegates = [], a = t = __decorate([AccessibilityDelegate(i)], a), e.OtherMultiplesButton = a;
})(ns_betslipstandarduilib_ui_bet_controls_standard = ns_betslipstandarduilib_ui_bet_controls_standard || {}), (e => {
    var s = ns_gen5_ui.Component, i = ns_gen5_ui.DomElement, a = ns_betslipstandarduilib_ui_util.StandardLocaleHelper, n = ns_gen5_ui.Label, r = ns_gen5_util.CurrencyFormatter, l = ns_betcalculationslib_rounding.RoundingHelper;
    class t extends s {
        constructor(e) {
            super(), this.slipDelegate = e;
        }
        createChildren() {
            this.addStyle('bss-ReferBetConfirmation'), this.wrapper = new i(), this.wrapper.setAttribute('class', 'bss-ReferBetConfirmation_Wrapper'), this.appendChild(this.wrapper);
            var e = new i(), t = (e.setAttribute('class', 'bss-ReferBetConfirmation_Header'), this.wrapper.appendChild(e), new s());
            t.addStyle('bss-ReferBetConfirmation_Close'), e.appendChild(t), a.RequiresTaxMessage() && t.addStyle('bss-ReferBetConfirmation_Close-tax'), t.clickHandler = () => {
                this.slipDelegate.referBetConfirmationReferBetCloseClicked();
            }, this.title = new n(), this.title.addStyle('bss-ReferBetConfirmation_Title'), this.title.setText(a.GetTranslation('MaxBetPartHeader')), this.wrapper.appendChild(this.title), this.placeNow = new i(), this.placeNow.setAttribute('class', 'bss-ReferBetConfirmation_PlaceNow'), this.wrapper.appendChild(this.placeNow), this.referred = new i(), this.referred.setAttribute('class', 'bss-ReferBetConfirmation_Referred'), this.wrapper.appendChild(this.referred), this.suspendElementFromDom();
        }
        setReferralAmounts(e, t) {
            0 == e ? (this.title.setText(a.GetTranslation('MaxBetFullReferral')), this.title.addStyle('bss-ReferBetConfirmation_Title-full'), this.wrapper.setAttribute('class', 'bss-ReferBetConfirmation_Wrapper-full'), this.referred.suspendElementFromDom(), this.placeNow.suspendElementFromDom()) : (this.placeNow.removeAllChildren(), this.processMultiElementTranslation(this.placeNow, a.GetTranslation('referralPlaceNow'), l.Round(e) + ''), this.processMultiElementTranslation(this.placeNow, a.GetTranslation('MaxBetReferralApprovalItemBody'), l.Round(t) + ''), this.addStyle('qbs-ReferBetConfirmation_Referred-show'), this.title.removeStyle('bss-ReferBetConfirmation_Title-full'), this.wrapper.setAttribute('class', 'bss-ReferBetConfirmation_Wrapper'), this.placeNow.unsuspendElementFromDom(), this.referred.unsuspendElementFromDom()), this.unsuspendElementFromDom();
        }
        processMultiElementTranslation(e, t, s) {
            var i, t = t.split('|'), a = new n('span');
            a.addStyle('bss-ReferBetConfirmation_Referred');
            for (i of t) {
                var l = new n('span');
                '{0}' === i ? (l.setText(r.ApplyCurrencySymbol(r.ApplyDelimiterAndGroupSeparator(s))), l.addStyle('bss-ReferBetConfirmation_Referred-value')) : (l.setText(i), l.addStyle('bss-ReferBetConfirmation_Referred-text')), a.appendChild(l);
            }
            e.appendChild(a);
        }
    }
    e.ReferBetConfirmation = t;
})(ns_betslipstandarduilib_ui_slip_controls_standard = ns_betslipstandarduilib_ui_slip_controls_standard || {}), (e => {
    var t = ns_gen5_ui.Label, s = ns_accessibilityuilib_ui.LabelAccessibilityDelegate;
    let i = class extends t {
        constructor() {
            super('h5');
        }
        setText(e) {
            super.setText(e), this.accessibilityEnabled && -1 < e.indexOf('\u2011') && s.MakeAccessible(this, e.replace('\u2011', '-'));
        }
        static MakeAccessible(e) {
            e.accessibilityEnabled = !0;
            var t = e.getText();
            -1 < t.indexOf('\u2011') && s.MakeAccessible(e, t.replace('\u2011', '-'));
        }
    };
    i = __decorate([AccessibilityDelegate(i)], i), e.BetItemTitleLabel = i;
})(ns_betslipstandarduilib_ui_bet_standard = ns_betslipstandarduilib_ui_bet_standard || {}), (e => {
    var t = ns_gen5_ui.Component, s = ns_accessibilityuilib_ui_image.ImageButtonAccessibilityDelegate, i = ns_betslipuilib_ml.Language;
    let a = class extends t {
        constructor(e) {
            super(), this.delegate = e;
        }
        createChildren() {
            this.addStyle('bss-RemoveButton');
        }
        clickHandler() {
            window.bet365.messageBus.postMessageRequest('firebase.logEvent', {
                name: 'remove_selection',
                parameters: { site_section: 'Betslip' }
            }), this.delegate.removeButtonClickHandler();
        }
        static MakeAccessible(e) {
            e.accessibility = new s(e, i.GetTranslation('delete')), e.accessibility.makeAccessible();
        }
    };
    a = __decorate([AccessibilityDelegate(a)], a), e.RemoveButton = a;
})(ns_betslipstandarduilib_ui_bet_standard = ns_betslipstandarduilib_ui_bet_standard || {}), (e => {
    var t = ns_gen5_ui.Label, s = ns_gen5_ui.Component, i = ns_betslipuilib_ml.Language, a = ns_gen5_ui.Application, l = ns_gen5_events.ApplicationEvent;
    class n extends s {
        constructor() {
            super(...arguments), this._delegate_applicationWidthChangedHandler = null;
        }
        createChildren() {
            this.addStyle('bss-RedundantSelectionSentence'), this.fullSentence = new t(), this.fullSentence.addStyle('bss-RedundantSelectionSentence_FullSentence'), this.fullSentence.setText(i.GetTranslation('redundantSelectionSentence')), this.appendChild(this.fullSentence);
        }
        dispose() {
            a.currentApplication.hasEventListenerWithDelegate(l.WIDTH_CHANGED, this._delegate_applicationWidthChangedHandler) && a.currentApplication.removeEventListener(l.WIDTH_CHANGED, this._delegate_applicationWidthChangedHandler);
        }
    }
    e.RedundantSelectionSentence = n;
})(ns_betslipstandarduilib_ui_bet = ns_betslipstandarduilib_ui_bet || {}), (s => {
    var t = ns_gen5_ui.Label, i = ns_gen5_ui.Component, a = ns_betslipuilib_ml.Language, l = ns_accessibilityuilib_ui.ButtonAccessibilityDelegate, n = ns_gen5_ui.Application, r = ns_gen5_events.ApplicationEvent, d = ns_gen5_util.Delegate;
    let e = class extends i {
        constructor(e = !0, t = !0) {
            super(), this.quickbetParent = e, this.modal = null, this.firstItemSelected = !0, this._delegate_applicationWidthChangedHandler = null, this.voidEditClickHandler = e => {
                e.stopPropagation(), this.openModal();
            }, this.closeModal = e => {
                e && (e.stopPropagation(), e.preventDefault()), this.modal && (this.modal.hidePopup(), this.clickableText.clickHandler = this.voidEditClickHandler, this.clickableText.addStyle('bss-PlayerVoidSentence_ClickableText-clickable'), this.clickableText.hasStyle('bss-PlayerVoidSentence_ClickableText-nonclickable') && this.clickableText.removeStyle('bss-PlayerVoidSentence_ClickableText-nonclickable'), this.removeStyle('bss-PlayerVoidSentence-open'), this.enableDeleteButtonLogic(this.quickbetParent), this.chevron.addStyle('bss-PlayerVoidSentence_Chevron-down'), this.chevron.removeStyle('bss-PlayerVoidSentence_Chevron-up'));
            }, this.openModal = () => {
                this.modal || (this.modal = new s.PlayerVoidModal(this, this.firstItemSelected)), this.modal.showPopup(), this.clickableText.clickHandler = function () {
                }, this.disableDeleteButtonLogic(this.quickbetParent), this.addStyle('bss-PlayerVoidSentence-open'), this.chevron.removeStyle('bss-PlayerVoidSentence_Chevron-down'), this.chevron.addStyle('bss-PlayerVoidSentence_Chevron-up');
            }, this.disableDeleteButtonLogic = e => {
                this.parent.parent.disableSwipe();
            }, this.enableDeleteButtonLogic = e => {
                this.parent.parent.enableSwipe();
            }, this.firstItemSelected = t;
        }
        createChildren() {
            this.addStyle('bss-PlayerVoidSentence'), this.ifPlayerVoidSentence = new i(), this.ifPlayerVoidSentence.addStyle('bss-PlayerVoidSentence_IfPlayerVoidSentence');
            var e = new t('span');
            e.setText(a.GetTranslation('playerDoesntStart') + ' '), e.addStyle('bss-PlayerVoidSentence_DoesntStartText'), this.popupSentence = new i(), this.popupSentence.addStyle('bss-PlayerVoidSentence_VoidPopupSentenceContainer'), this.clickableText = new i(), this.clickableText.addStyle('bss-PlayerVoidSentence_ClickableText'), this.selectionsWillVoidText = new t('span'), this.selectionsWillVoidText.addStyle('bss-PlayerVoidSentence_SelectionsWillVoidText'), this.clickableText.appendChild(this.selectionsWillVoidText), this.ifPlayerVoidSentence.appendChild(e), this.chevron = new i(), this.chevron.addStyle('bss-PlayerVoidSentence_Chevron'), this.chevron.addStyle('bss-PlayerVoidSentence_Chevron-down'), this.clickableText.appendChild(this.chevron), this.clickableText.clickHandler = this.voidEditClickHandler, this.ifPlayerVoidSentence.appendChild(this.clickableText), this.oddsRecalculatedText = new t(), this.oddsRecalculatedText.addStyle('bss-PlayerVoidSentence_OddsRecalculatedText'), this.appendChild(this.ifPlayerVoidSentence), this.appendChild(this.oddsRecalculatedText), this.fullSentence = new t(), this.fullSentence.addStyle('bss-PlayerVoidSentence_FullSentence'), this.firstItemSelected ? this.voidSelectionSelected() : this.voidEntireBetSelected(), this.appendChild(this.fullSentence), n.currentApplication.addEventListener(r.WIDTH_CHANGED, this._delegate_applicationWidthChangedHandler = new d(this, e => {
                this.closeModal();
            })), this.suspendElementFromDom();
        }
        updateState(e) {
            e ? this.removeStyle('bss-PlayerVoidSentence_Diabled') : this.addStyle('bss-PlayerVoidSentence_Diabled');
        }
        voidSelectionSelected() {
            this.selectionsWillVoidText.setText(a.GetTranslation('selectionVoid')), this.oddsRecalculatedText.setText(a.GetTranslation('oddsRecalculated')), this.firstItemSelected = !0, this.fullSentence.setText(a.GetTranslation('selectionVoidRecalculated'));
        }
        voidEntireBetSelected() {
            this.selectionsWillVoidText.setText(a.GetTranslation('selectionStand')), this.oddsRecalculatedText.setText(a.GetTranslation('entireBetVoid')), this.firstItemSelected = !1, this.fullSentence.setText(a.GetTranslation('selectionVoidWholeBetVoid'));
        }
        static MakeAccessible(e) {
            l.MakeAccessible(e.chevron), l.MakeAccessible(e.ifPlayerVoidSentence), l.MakeAccessible(e.clickableText);
        }
        dispose() {
            n.currentApplication.hasEventListenerWithDelegate(r.WIDTH_CHANGED, this._delegate_applicationWidthChangedHandler) && n.currentApplication.removeEventListener(r.WIDTH_CHANGED, this._delegate_applicationWidthChangedHandler);
        }
    };
    e = __decorate([AccessibilityDelegate(e)], e), s.PlayerVoidSentence = e;
})(ns_betslipstandarduilib_ui_bet = ns_betslipstandarduilib_ui_bet || {}), (e => {
    var h = ns_betslipstandarduilib_ui_util.StandardLocaleHelper, a = ns_gen5_ui.Component, p = ns_gen5_ui.Label, t = ns_betslipuilib_ui_bet.StakeBox, c = ns_betslipcorelib_constants.BetSlipResult, l = ns_betslipstandarduilib_ui_bet_controls_common.OddsDropdownLabel, n = ns_betslipuilib_ui_bet.DeleteButton, s = ns_betslipuilib_ui_bet_keypad.Controller, i = ns_betslipuilib_ui_bet.ReferralInfo, r = ns_betslipuilib_ui_bet.SwipeDelete, d = ns_betslipuilib_util.TransitionHelper, o = ns_gen5_ui.DomElement, u = ns_gen5_util.CurrencyFormatter, B = ns_postbootlib_util.OfferBadgesUtil, _ = ns_betslipcorelib_data.OfferTypeEnum, y = ns_betslipcorelib_data.SoccerExtraTimeEnum, b = ns_gen5_util.PromotionalFilter, m = ns_gen5_util.MathUtil, g = ns_betcalculationslib_rounding.RoundingHelper, C = ns_betslipstandardlib_enum.BetBoostType, S = ns_betcalculationslib_util.MinimumStakes, x = ns_betslipstandarduilib_ui_offerbadges.OfferBadgesContainer, f = ns_betslipuilib_ui_bet.BetCreditsInfo, k = ns_betslipuilib_util.BetCreditsMessageKey, M = ns_accessibilityuilib_ui.ButtonAccessibilityDelegate, v = ns_betslipuilib_ml.Language, w = e.RemoveButton, T = ns_betslipuilib_accessibility.SwipeDeleteButtonAccessibilityDelegate, I = e.BetItemTitleLabel, E = ns_betslipstandarduilib_ui_bet.RedundantSelectionSentence, A = ns_betslipofferslib.BetslipOffersLib, D = ns_betslipreactlib_context.BetslipBetStakeContextManager, R = ns_betslipreactlib_context.OddsContextManager, H = ns_betslipreactlib_context.BetslipBetReturnsContextManager, O = ns_betslipuilib_ui_bet.BetComponent, P = ns_betslipcorelib_util.StorageHelper;
    let L = class extends O {
        constructor(e, t) {
            super(), this.betslipComponentDelegate = t, this.isHidden = !1, this.hasStake = !1, this.liveAlertsActive = !1, this.liveAlertsDisplayed = !1, this.betCreditsInfoShowing = !1, this.restrictedOdds = !1, this.isSuperBoost = !1, this.model = e;
        }
        createChildren() {
            this.addStyle('bss-NormalBetItem');
            var e = new a(), t = (e.addStyle('bss-NormalBetItem_Inner'), this.appendChild(e), this.liveAlertsTick = new a(), this.liveAlertsTick.addStyle('bss-NormalBetItem_LiveAlerts'), this.liveAlertsTick.clickHandler = () => {
                    this.liveAlertsDisplayed && (this.liveAlertsActive ? (this.liveAlertsTick.removeStyle('bss-NormalBetItem_LiveAlerts-active'), this.liveAlertsActive = !1, this.liveAlertsAccessibility && this.liveAlertsAccessibility.setPressed(!1)) : (this.liveAlertsTick.addStyle('bss-NormalBetItem_LiveAlerts-active'), this.liveAlertsActive = !0, this.liveAlertsAccessibility && this.liveAlertsAccessibility.setPressed(!0)), this.liveAlertsClickHandlerDelegate(this.liveAlertsActive));
                }, e.appendChild(this.liveAlertsTick), this.keypadWrapper = new a()), e = (t.addStyle('bss-NormalBetItem_Wrapper'), e.appendChild(t), this.deleteContainer = new a(), this.deleteContainer.addStyle('bss-NormalBetItem_DeleteContainer'), t.appendChild(this.deleteContainer), this.deleteButton = new n(this), this.deleteContainer.clickHandler = () => this.deleteContainerClickHandler(), this.content = this.touchContainer = new a(), this.content.addStyle('bss-NormalBetItem_Content'), this.deleteContainer.appendChild(this.content), this.deleteContainer.appendChild(this.deleteButton), this.removeButton = new w(this), this.content.appendChild(this.removeButton), this.contentWrapper = new a(), this.contentWrapper.addStyle('bss-NormalBetItem_ContentWrapper'), this.content.appendChild(this.contentWrapper), this.detailsWrapper = new o()), s = (e.setAttribute('class', 'bss-NormalBetItem_Details'), this.contentWrapper.appendChild(e), this.topSection = new o(), this.topSection.setAttribute('class', 'bss-NormalBetItem_TopSection'), e.appendChild(this.topSection), this.titleAndMarket = new o()), s = (s.setAttribute('class', 'bss-NormalBetItem_TitleAndMarket'), this.topSection.appendChild(s), this.titleLabel = new I(), this.titleLabel.addStyle('bss-NormalBetItem_Title'), s.appendChild(this.titleLabel), this.titleContainer = new a(), this.titleContainer.addStyle('bss-NormalBetItem_TitleContainer'), this.titleContainer.appendChild(this.titleLabel), this.titleAndMarket.appendChild(this.titleContainer), this.marketContainer = new a(), this.marketContainer.addStyle('bss-NormalBetItem_MarketContainer'), s.appendChild(this.marketContainer), this.marketLabel = new p()), s = (s.addStyle('bss-NormalBetItem_Market'), this.marketContainer.appendChild(s), this.oddsContainer = new a(), this.oddsContainer.addStyle('bss-NormalBetItem_OddsContainer'), this.oddsLabel = new l(this.model, 'span'), this.oddsContainer.appendChild(this.oddsLabel), this.titleContainer.appendChild(this.oddsContainer), this.oddsContainer.clickHandler = () => {
                    this.receiptMode || this.oddsLabel.showOddsSelection();
                }, new o()), i = (s.setAttribute('class', 'bss-NormalBetItem_BottomSection'), e.appendChild(s), this.fixtureOfferContainer = new a()), s = (i.addStyle('bss-NormalBetItem_FixtureOfferDescription'), s.appendChild(i), this.fixtureLabel = new p());
            s.addStyle('bss-NormalBetItem_FixtureDescription'), i.appendChild(s), this.offerBadgesMiniLabel = new p('p'), this.offerBadgesMiniLabel.addStyle('bss-NormalBetItem_OfferBadges-mini'), this.marketContainer.appendChild(this.offerBadgesMiniLabel), this.maxStakeMessageContainer = new a(), this.maxStakeMessageContainer.addStyle('bss-NormalBetItem_Referred'), t.appendChild(this.maxStakeMessageContainer), this.maxStakeMessageBody = new p(), this.maxStakeMessageBody.addStyle('bss-NormalBetItem_Referred-text'), this.maxStakeMessageContainer.appendChild(this.maxStakeMessageBody), this.maxStakeMessageContainer.suspendElementFromDom(), this.referralMessageContainer = new a(), this.referralMessageContainer.addStyle('bss-NormalBetItem_Referred'), t.appendChild(this.referralMessageContainer), this.referralMessageContainer.suspendElementFromDom(), this.stakeBox = this.createStakeBox(), this.contentWrapper.appendChild(this.stakeBox), this.checkboxContainer = new o(), this.checkboxContainer.setAttribute('class', 'bss-NormalBetItem_CheckboxContainer'), e.appendChild(this.checkboxContainer), this.additionalComponentsContainer = new a(), this.additionalComponentsContainer.addStyle('bss-NormalBetItem_AdditionalComponents'), this.content.appendChild(this.additionalComponentsContainer), B.Initialise(() => {
                0 < this.model.getRewardsCount() && this.appendReactOffersContainer();
            }), this.swipeDelete = new r(this);
        }
        appendReactOffersContainer() {
            (B.BypassNoOffersCheck() || !b.IsExcludedFromPromotion('2') && !b.IsExcludedFromOffers('2')) && this.model.getRewardsCount() && B.Initialise(() => {
                this.stakeContextManager || (this.stakeContextManager = new D(), this.stakeContextManager.setContextValue({
                    unitStake: this.model.getStake(),
                    totalStake: this.model.getTotalStake()
                })), this.oddsContextManager || (this.oddsContextManager = new R(), this.oddsContextManager.setContextValue({
                    oddsFractional: this.model.getOddsFractional(),
                    oddsDecimal: this.model.getOddsDecimal()
                })), this.returnsContextManager || (this.returnsContextManager = new H(), this.returnsContextManager.setContextValue({ boostAmount: 0 })), this.mountedReactComponent || ((e = new a()).addStyle('bss-NormalBetItem_ReactContainer'), this.content.appendChild(e), this.mountedReactComponent = A.AppendOffersContainer(e));
                var e = this.model.getOfferModelsProps(), t = ((e.boosts.length || e.tokens.length) && this.addStyle('bss-NormalBetItem-hasoffers'), P.GetCondensedSlipState());
                t && this.addStyle('bss-NormalBetItem-hasoffers-condensedbetslip'), this.mountedReactComponent.render({
                    offerContainerProps: {
                        bet: this.model.getBetModelProps(),
                        offers: e,
                        isCondensedBetslip: t
                    },
                    betslipBetStakeContextManager: this.stakeContextManager,
                    oddsContextManager: this.oddsContextManager,
                    betslipBetReturnsContextManager: this.returnsContextManager
                });
            });
        }
        removeReactOffersContainer() {
            this.mountedReactComponent && (this.mountedReactComponent.dispose(), this.mountedReactComponent = null);
        }
        removeButtonClickHandler() {
            this.deleteBet();
        }
        createStakeBox() {
            return localeLib('BetslipStandardUILib').createBetItemStakeBox(this, 'bss-StakeBox') || new t(this, 'bss-StakeBox');
        }
        hideStakeBox() {
            this.stakeBox && this.stakeBox.addStyle('bss-NormalBetItem_HideStakeBox');
        }
        showStakeBox() {
            this.stakeBox && this.stakeBox.removeStyle('bss-NormalBetItem_HideStakeBox');
        }
        deleteContainerClickHandler() {
            this.swipeDelete.singleClick(!0);
        }
        betBoostAvailable(e) {
            this.addStyle('bss-NormalBetItem_BetBoosted'), e !== C.SuperBoost && e !== C.HandicapSuperBoost && e !== C.InPlaySuperBoostSingle && e !== C.InPlaySuperBoostSingleHomepage || (this.isSuperBoost = !0), e === C.SuperBoost && this.addStyle('bss-NormalBetItem_BetBoosted-super'), e === C.HandicapSuperBoost && this.addStyle('bss-NormalBetItem_BetBoosted-superhandicap'), this.betBoostText || this.model.getBetBoostType() === C.AccaBoost || this.model.getBetBoostType() === C.UnboostedBet || (this.betBoostText = new p(), this.betBoostText.addStyle('bss-NormalBetItem_BoostText'), this.marketContainer.appendChildAt(this.betBoostText, 0), this.setupBetBoostText());
        }
        setupBetBoostText() {
            let e = languageDefinition('BetslipStandardUILib').getValue('betBoost');
            var t;
            this.isSuperBoost && (t = h.getSuperBoostText(), e = t || languageDefinition('BetslipStandardUILib').getValue('superBoost')), this.betBoostText.setText(e);
        }
        setupBetBoostedOdds(e, t, s, i) {
            this.oddsLabel.setBoostedOdds(e, t, s), i && (this.boostedOddsChanged(), this.betslipComponentDelegate.normalBetItemOddsChanged(), this.addStyle('bss-NormalBetItem_ToggleRemove'));
        }
        boostedOddsChanged() {
            this.oddsLabel.setOddsChanged();
        }
        setupBetBoostedHandicap(e, t, s) {
            var i;
            this.addStyle('bss-NormalBetItem_BetBoosted-handicap'), this.originalBetBoostLine || (this.originalBetBoostLine = new p(), this.originalBetBoostLine.addStyle('bss-NormalBetItem_OriginalLine'), this.titleLabel.appendChild(this.originalBetBoostLine), (i = new a()).addStyle('bss-NormalBetItem_LineChevron'), this.titleLabel.appendChild(i)), this.originalBetBoostLine.setText(t), this.handicapChanged(e, !1);
        }
        oddsChanged(e, t, s, i, a) {
            i ? (this.oddsLabel.enableDropdown(), this.oddsLabel.setSPOdds(e, s, a)) : (this.oddsLabel.disableDropdown(), this.oddsLabel.setOdds(e, a)), t && (this.oddsLabel.setOddsChanged(), this.betslipComponentDelegate.normalBetItemOddsChanged(), this.addStyle('bss-NormalBetItem_ToggleRemove'));
        }
        suspend() {
            this.betslipComponentDelegate.normalBetItemSuspended(), this.addStyle('bss-NormalBetItem_Suspended');
        }
        unsuspend() {
            this.betslipComponentDelegate.normalBetItemUnSuspended(), this.removeStyle('bss-NormalBetItem_Suspended');
        }
        fixtureDescriptionChanged(e) {
            this.fixtureLabel.setText(e);
        }
        displayMiniOfferBadges() {
            this.offerBadgesMiniLabel.setText(''), !B.BypassNoOffersCheck() && (b.IsExcludedFromPromotion('2') || b.IsExcludedFromOffers('2')) || B.Initialise(() => {
                var e, t;
                this.arrow && (this.topSection.removeChild(this.arrow), this.arrow = null), this.subOnPlayOnOfferIcon && (this.offerBadgesMiniLabel.removeChild(this.subOnPlayOnOfferIcon), this.subOnPlayOnOfferIcon = null);
                let s = !1, i = !1;
                for (e of B.GetLocaleOffersForBetslip(this.model.getOfferBadges()))
                    e.ot !== _.ACCUMULATOR_OFFER && ('EP' === e.oc ? s = !0 : B.IsSubOn(e.oc) ? i = !0 : (t = B.GetBadgeTranslation(e.oc, !0)) && this.offerBadgesMiniLabel.setText(this.offerBadgesMiniLabel.getText() + ' ' + t));
                s && (this.arrow = new a(), this.arrow.addStyle('bss-NormalBetItem_ArrowUp'), this.addStyle('bss-NormalBetItem-enhancedoffers'), this.topSection.appendChild(this.arrow)), i && (this.subOnPlayOnOfferIcon = new a(), this.subOnPlayOnOfferIcon.addStyle('bss-NormalBetItem_SubOnPlayOnOfferIcon'), this.offerBadgesMiniLabel.appendChild(this.subOnPlayOnOfferIcon), this.titleLabel.appendChild(this.offerBadgesMiniLabel)), this.offerBadgesMiniLabel.getText() || this.subOnPlayOnOfferIcon ? this.offerBadgesMiniLabel.unsuspendElementFromDom() : this.offerBadgesMiniLabel.suspendElementFromDom();
            });
        }
        marketDescriptionChanged(e) {
            this.marketLabel.setText(e);
        }
        betSlipDisplayChanged(e) {
            !B.BypassNoOffersCheck() && (b.IsExcludedFromPromotion('2') || b.IsExcludedFromOffers('2')) || B.Initialise(() => {
                this.appendOfferBadges();
            }), this.titleLabel.setText(e);
        }
        handicapChanged(e, t) {
            -1 < (e = e || '').indexOf('[ml') && (e = h.GetTranslation(e)), this.handicapLabel || (this.handicapLabel = new p(), this.handicapLabel.addStyle('bss-NormalBetItem_Handicap'), this.titleLabel.addStyle('bss-NormalBetItem_Title-handicapshown'), this.titleLabel.appendChildAt(this.handicapLabel, 0)), this.handicapLabel.setText(e), t && (this.handicapLabel.addStyle('bss-NormalBetItem_HandicapChanged'), this.betslipComponentDelegate.normalBetItemHandicapChanged(), this.addStyle('bss-NormalBetItem_ToggleRemove'));
        }
        changesAccepted() {
            this.oddsLabel && this.oddsLabel.acceptOddsChange(), this.handicapLabel && this.handicapLabel.removeStyle('bss-NormalBetItem_HandicapChanged'), this.removeStyle('bss-NormalBetItem_ToggleRemove');
        }
        changeMinimumStakeAccepted() {
            this.stakeBox.invalidStake(!1);
        }
        returnValueChanged(e) {
            this.stakeBox.setReturnValue(e);
        }
        boostValueChanged(e, t) {
            this.returnsContextManager && this.returnsContextManager.setContextValue({ boostAmount: t || e }), this.stakeBox.setWinningBoostValue(e, t);
        }
        totalStakeChanged(e) {
            this.restrictedOdds || this.stakeBox.setTotalStakeValue(e);
        }
        disableStakeBox() {
            this.stakeBox.disable();
        }
        enableStakeBox() {
            this.stakeBox.enable(0 === this.model.getStake());
        }
        showMiniText() {
            this.offerBadgesMiniLabel && this.offerBadgesMiniLabel.unsuspendElementFromDom();
        }
        hideMiniText() {
            this.offerBadgesMiniLabel && this.offerBadgesMiniLabel.suspendElementFromDom();
        }
        slipResultChanged(e) {
            switch (e) {
            case c.stakeAboveMaximum:
            case c.stakeBelowMinimum:
            case c.userDailyStakeLimitExceeded:
            case c.lineItemsBelowMinimumShortOddsStake:
            case c.LineItemsAboveMaxStakesShortfall:
            case c.LineItemsAboveMaxStakesShortfallDeposit:
                this.stakeBox.invalidStake(!0);
                break;
            case c.oddsBelowMinimum:
                this.restrictedOdds = !0, this.stakeBox.addStyle('bss-NormalBetItem_HideStakeBox'), this.multiplesRestrictionChanged(!0);
                break;
            case c.stakeAboveMinimum:
                this.stakeBox.invalidStake(!1);
                break;
            case c.success:
                this.restrictedOdds = !1;
            }
            this.setReferralMaxStakeMessage(e);
        }
        setReferralMaxStakeMessage(e) {
            if (e !== c.stakeAboveMinimum)
                if (e === c.success)
                    this.contentWrapper.removeStyle('bss-NormalBetItem_ContentWrapper-maxstake'), this.maxStakeMessageContainer.suspendElementFromDom(), this.referralMessageContainer.suspendElementFromDom();
                else if (0 < this.model.getReferralAmount() && 0 === this.model.getMaxStake()) {
                    this.referralMessageContainer.removeAllChildren(), this.contentWrapper.addStyle('bss-NormalBetItem_ContentWrapper-maxstake');
                    var t = h.GetTranslation('MaxBetFullReferral'), s = new p('span');
                    s.addStyle('bss-NormalBetItem_Referred-text'), s.setText(t), this.referralMessageContainer.appendChild(s), this.addStyle('bss-NormalBetItem-referral'), this.referralMessageContainer.unsuspendElementFromDom(), this.maxStakeMessageContainer.suspendElementFromDom();
                } else if (0 < this.model.getReferralAmount()) {
                    this.referralMessageContainer.removeAllChildren();
                    var i = g.RoundDown(this.model.getStake() - this.model.getReferralPlaceAmount());
                    if (+i <= 0)
                        this.referralMessageContainer.suspendElementFromDom();
                    else {
                        this.contentWrapper.addStyle('bss-NormalBetItem_ContentWrapper-maxstake');
                        var a, l, n, r, d = h.GetTranslation('referralPlaceNow').split('|'), o = h.GetTranslation('MaxBetReferralApprovalItemBody').split('|');
                        for (let e = 0; e < d.length; e++)
                            0 <= d[e].indexOf('{0}') ? (l = u.ApplyCurrencySymbol(u.ApplyDelimiterAndGroupSeparator(this.model.getReferralPlaceAmount() + '')), (a = new p('span')).addStyle('bss-NormalBetItem_Referred-value'), a.setText(l), this.referralMessageContainer.appendChild(a)) : ((l = new p('span')).addStyle('bss-NormalBetItem_Referred-text'), l.setText(d[e]), this.referralMessageContainer.appendChild(l));
                        for (let e = 0; e < o.length; e++)
                            0 <= o[e].indexOf('{0}') ? (r = u.ApplyCurrencySymbol(u.ApplyDelimiterAndGroupSeparator(i + '')), (n = new p('span')).addStyle('bss-NormalBetItem_Referred-value'), n.setText(r), this.referralMessageContainer.appendChild(n)) : ((r = new p('span')).addStyle('bss-NormalBetItem_Referred-text'), r.setText(o[e]), this.referralMessageContainer.appendChild(r));
                        this.addStyle('bss-NormalBetItem-referral'), this.referralMessageContainer.unsuspendElementFromDom(), this.maxStakeMessageContainer.suspendElementFromDom();
                    }
                } else
                    e == c.stakeAboveMaximum || e == c.LineItemsAboveMaxStakesShortfall || e == c.LineItemsAboveMaxStakesShortfallDeposit ? (this.referralMessageContainer.removeAllChildren(), this.contentWrapper.addStyle('bss-NormalBetItem_ContentWrapper-maxstake'), t = h.GetTranslation('MaxBetItemBody'), this.maxStakeMessageBody.setText(t.replace('{0}', u.ApplyCurrencySymbol(u.ApplyDelimiterAndGroupSeparator(this.getMaxStake() + '')))), this.maxStakeMessageContainer.unsuspendElementFromDom()) : (this.contentWrapper.removeStyle('bss-NormalBetItem_ContentWrapper-maxstake'), this.maxStakeMessageContainer.suspendElementFromDom(), this.referralMessageContainer.suspendElementFromDom());
        }
        multiplesRestrictionChanged(e) {
            e ? this.addStyle('bss-NormalBetItem_Restricted') : this.removeStyle('bss-NormalBetItem_Restricted');
        }
        singlesRestrictionChanged(e) {
            e ? this.addStyle('bss-NormalBetItem_RestrictedPlacement') : this.removeStyle('bss-NormalBetItem_RestrictedPlacement');
        }
        key() {
            return this.model.key();
        }
        getParentFixtureId() {
            return this.model.getParentFixtureId();
        }
        showLiveAlertsTick() {
            this.liveAlertsDisplayed = !0, this.liveAlertsActive && this.receiptMode && (this.addStyle('bss-NormalBetItem-livealerts'), this.liveAlertsTick.addStyle('bss-NormalBetItem_LiveAlerts-active'), this.liveAlertsAccessibility) && this.liveAlertsAccessibility.setPressed(!0);
        }
        addLiveAlert() {
            this.liveAlertsActive = !0, this.liveAlertsDisplayed && this.receiptMode && (this.addStyle('bss-NormalBetItem-livealerts'), this.liveAlertsTick.addStyle('bss-NormalBetItem_LiveAlerts-active'), this.liveAlertsAccessibility) && this.liveAlertsAccessibility.setPressed(!0);
        }
        removeLiveAlert() {
            this.liveAlertsActive = !1, this.liveAlertsTick.removeStyle('bss-NormalBetItem_LiveAlerts-active'), this.liveAlertsAccessibility && this.liveAlertsAccessibility.setPressed(!1);
        }
        setupLiveAlertsChangedDelegate(e) {
            this.liveAlertsClickHandlerDelegate = e;
        }
        betRemoved() {
            this.stakeBox.dispose(), this.betslipComponentDelegate.normalBetItemBetRemoved(this), this.mountedReactComponent && (this.mountedReactComponent.dispose(), this.mountedReactComponent = null);
        }
        betReferenceChanged(e) {
            h.RequiresReferenceOnBetItem() && e && (this.betReference || (this.betReference = new p(), this.betReference.addStyle('bss-NormalBetItem_BetRef')), e = h.GetTranslation('ref') + ': ' + e, this.betReference.setText(e), this.detailsWrapper.appendChild(this.betReference));
        }
        setStateForReceipt(e, t = !1) {
            this.liveAlertsActive && (this.liveAlertsActive = !1), this.betCreditsInfo && this.betCreditsInfo.setMessageForReceipt(), this.receiptMode = !0, this.swipeDelete.disable(), !this.model.shouldExcludeFromReceipt() && (this.hasStake || e) || (d.HideElementTransition(this), this.isHidden = !0), this.stakeBox && this.stakeBox.setStakeBoxForReceipt(), this.oddsLabel && this.oddsLabel.setStateForReceipt(), t || this.setReferralMaxStakeMessage(0), null != (e = this.redundantSelection) && e.setVisible(!1);
        }
        revertReceiptState() {
            var e;
            this.receiptMode = !1, this.removeStyle('bss-NormalBetItem_FullyDeclined'), this.liveAlertsDisplayed = !1, this.removeStyle('bss-NormalBetItem-livealerts'), this.removeLiveAlert(), this.swipeDelete.enable(), this.betReference && (this.detailsWrapper.removeChild(this.betReference), this.betReference = null), this.stakeBox && (this.model.isSinglesRestricted() || this.stakeBox.enable(), this.stakeBox.revertReceiptStakeBox()), this.oddsLabel && this.oddsLabel.revertReceiptState(), null != (e = this.redundantSelection) && e.setVisible(this.isRedundant), this.isHidden && (d.ShowElementTransition(this), this.isHidden = !1);
        }
        forceHide() {
            d.HideElementTransition(this), this.isHidden = !0;
        }
        referralAmountChanged(e, t) {
            h.RequiresReferralOnBet();
        }
        referralApproved() {
            this.referralInfo && this.detailsWrapper.removeChild(this.referralInfo);
            var e = +g.RoundDown(this.model.getTotalStake() - this.model.getReferralPlaceAmount());
            this.referralInfo = new i('accepted', e, null), this.referralInfo.defaultStyle = 'bss-ReferralInfo', this.detailsWrapper.appendChild(this.referralInfo), this.referralMessageContainer.suspendElementFromDom();
        }
        setReferralInfo(e, t) {
            this.referralInfo = new i(e, t, null), this.referralInfo.defaultStyle = 'bss-ReferralInfo';
        }
        referralDeclined(e, t) {
            this.referralInfo && this.detailsWrapper.removeChild(this.referralInfo);
            t = e == t ? 'fulldecline' : 'partialdecline';
            'fulldecline' == t && this.addStyle('bss-NormalBetItem_FullyDeclined'), this.setReferralInfo(t, e), this.detailsWrapper.appendChild(this.referralInfo), this.referralMessageContainer.suspendElementFromDom();
        }
        referralAIApproved(e, t) {
            this.referralInfo && this.detailsWrapper.removeChild(this.referralInfo), this.referralInfo = new i('aiapproved', e, t), this.referralInfo.defaultStyle = 'bss-ReferralInfo', this.detailsWrapper.appendChild(this.referralInfo), this.referralMessageContainer.suspendElementFromDom();
        }
        resetUI() {
            this.swipeDelete.reset();
        }
        getMinStake() {
            return this.model.getMinStake();
        }
        getMaxStake() {
            return this.model.getMaxStake();
        }
        stakeBoxStakeEntered(e) {
            this.restrictedOdds || (this.validateMinStakes(e), this.clearInvalidState(), this.unsuspend(), this.model.stakeEntered(e));
        }
        stakeChanged(e) {
            var t, s, i, a, l;
            this.restrictedOdds || (0 < +e && this.validateMinStakes(e), this.referralInfo && (this.detailsWrapper.removeChild(this.referralInfo), this.referralInfo = null), t = +g.RoundDown(m.StringToNumber(e) * this.model.getBetCount()), 0 < this.model.getReferralAmount() && 0 < t && 0 == this.model.getReferralPlaceAmount() ? (this.referralMessageContainer.removeAllChildren(), this.contentWrapper.addStyle('bss-NormalBetItem_ContentWrapper-maxstake'), s = h.GetTranslation('MaxBetFullReferral'), (l = new p('span')).addStyle('bss-NormalBetItem_Referred-text'), l.setText(s), this.referralMessageContainer.appendChild(l), this.addStyle('bss-NormalBetItem-referral'), this.referralMessageContainer.unsuspendElementFromDom()) : 0 < this.model.getReferralAmount() && t > this.model.getReferralPlaceAmount() ? (s = g.RoundDown(t - this.model.getReferralPlaceAmount()), this.referralMessageContainer.removeAllChildren(), this.contentWrapper.addStyle('bss-NormalBetItem_ContentWrapper-maxstake'), l = h.GetTranslation('referralPlaceNow').replace('{0}|', '{0} '), i = h.GetTranslation('MaxBetReferralApprovalItemBody').replace('{0}|', '{0} '), (a = new p('span')).addStyle('bss-NormalBetItem_Referred-text'), a.setText(l.replace('{0}', u.ApplyCurrencySymbol(u.ApplyDelimiterAndGroupSeparator(this.model.getReferralPlaceAmount() + '')))), this.referralMessageContainer.appendChild(a), (l = new p('span')).addStyle('bss-NormalBetItem_Referred-text'), l.setText(i.replace('{0}', u.ApplyCurrencySymbol(u.ApplyDelimiterAndGroupSeparator(s + '')))), this.referralMessageContainer.appendChild(l), this.addStyle('bss-NormalBetItem-referral'), this.referralMessageContainer.unsuspendElementFromDom()) : (this.removeStyle('bss-NormalBetItem-referral'), this.referralMessageContainer.suspendElementFromDom()), m.StringToNumber(e) < this.model.getMaxStake() && 0 == this.model.getReferralAmount() && (this.contentWrapper.removeStyle('bss-NormalBetItem_ContentWrapper-maxstake'), this.stakeBox.invalidStake(!1), this.maxStakeMessageContainer.suspendElementFromDom()), '' !== e ? ('0' != e ? (this.addStyle('bss-NormalBetItem_HasStake'), this.hasStake = !0) : (this.removeStyle('bss-NormalBetItem_HasStake'), this.hasStake = !1), this.stakeBox.updateStake(e)) : (this.removeStyle('bss-NormalBetItem_HasStake'), this.hasStake = !1, this.stakeBox.setEmpty()), this.stakeContextManager && this.stakeContextManager.setContextValue({
                unitStake: +e,
                totalStake: t
            }));
        }
        showKeypad() {
            s.ShowKeypad(this.keypadWrapper, this, this.model.key(), 'bss-Keypad'), this.addStyle('bss-NormalBetItem-keypadopen'), this.deleteButton.keypadOpened(), this.swipeDelete.setExcludeState(!0), this.swipeDelete.setExcludeElement(this.stakeBox.getElementContainer());
        }
        stakeBoxShowKeypad() {
            this.showKeypad();
        }
        createKeyPad() {
            return localeLib('BetslipStandardUILib').createBetItemKeypad(this, 'bss-Keypad');
        }
        restoreKeypad() {
            this.showKeypad();
        }
        restoreSwipeDelete() {
            this.swipeDelete.restore();
        }
        setInprogressState(e) {
        }
        excludedBetStateUpdated() {
            this.model.getExcludedState() ? this.addStyle('bss-NormalBetItem_Excluded') : this.removeStyle('bss-NormalBetItem_Excluded'), this.betslipComponentDelegate.excludedBetStateUpdated(this);
        }
        validateMinStakes(e) {
            var t = S.GetMinimumUnitStake(), e = m.StringToNumber(e);
            0 != e && e < t ? (this.model.updateMinStakeInput(), this.stakeBox.invalidStake(!0)) : (this.model.setAboveMinStake(e), this.stakeBox.invalidStake(!1));
        }
        deleteButtonDeleteBet() {
            this.deleteBet();
        }
        deleteBet(t = !0) {
            let s = this.getElement();
            var e = this.getElement().getBoundingClientRect(), e = (s.style.height = e.height + 'px', 0 === e.height);
            this.addStyle('bss-NormalBetItem_Removing'), t && !e || (this.model.removeBet(), this.swipeDelete.dispose()), this.betslipComponentDelegate.normalBetItemSwipeDelete(), Locator.validationManager.callNewContext(() => {
                if (s.style.height = '0', null != TRANSITION_END) {
                    let e = () => {
                        this.addStyle('bss-NormalBetItem_Removed'), s.removeEventListener(TRANSITION_END, e), t && (this.model.removeBet(), this.swipeDelete.dispose());
                    };
                    s.addEventListener(TRANSITION_END, e);
                }
            });
        }
        itemClicked(e) {
            this.swipeDelete.reset(), this.stakeBox.itemClicked(e);
        }
        doneClicked() {
            this.swipeDelete.reset(), this.stakeBox.doneClicked();
        }
        deleteClicked() {
            this.swipeDelete.reset(), this.stakeBox.deleteClicked();
        }
        keypadRemoved() {
            this.swipeDelete.reset(), this.stakeBox.keypadRemoved(), this.removeStyle('bss-NormalBetItem-keypadopen'), this.deleteButton.keypadRemoved(), this.swipeDelete.setExcludeState(!1);
        }
        betCreditsStakeChanged(e, t, s, i) {
            e ? (this.betCreditsInfo || (this.betCreditsInfo = new f(), this.betCreditsInfo.addStyle('bss-NormalBetItem_BetCredits'), this.betCreditsInfo.suspendElementFromDom(), this.additionalComponentsContainer.appendChildAt(this.betCreditsInfo, 0)), this.betCreditsInfo.setBetCreditsStake(e, t, k.USING, s, i), this.betCreditsInfoShowing || (Locator.validationManager.callLater(() => {
                d.ShowElementTransition(this.betCreditsInfo, null, 0.2);
            }), this.stakeBox.showNetReturn()), this.betCreditsInfoShowing = !0) : this.betCreditsInfo && (d.HideElementTransition(this.betCreditsInfo, !1, 0.2), this.freeBetTokenSelected || this.stakeBox.showToReturn(), this.betCreditsInfoShowing = !1);
        }
        appendtoBet(e, t) {
        }
        getStake() {
            return this.model.getStake();
        }
        freeBetSelected() {
            this.freeBetTokenSelected = !0, this.stakeBox.showNetReturn(), s.HideKeypad();
        }
        freeBetDeselected() {
            this.freeBetTokenSelected = !1, this.stakeBox.showToReturn(), s.HideKeypad();
        }
        redundantSelectionSentence(e) {
            (this.isRedundant = e) ? (this.redundantSelection || (this.redundantSelection = new E()), this.additionalComponentsContainer.appendChild(this.redundantSelection)) : this.redundantSelection && this.additionalComponentsContainer.removeChild(this.redundantSelection);
        }
        getBetModel() {
            return this.model;
        }
        hideReferralMessage() {
            this.setReferralMaxStakeMessage(0), this.referralInfo && (this.detailsWrapper.removeChild(this.referralInfo), this.referralInfo = null), this.model.setBetResult(c.success);
        }
        appendOfferBadges() {
            this.offerBadgesContainer && (this.marketContainer.removeStyle('bss-NormalBetItem_MarketWrapper-hasOffers'), this.marketContainer.removeChild(this.offerBadgesContainer), this.titleLabel.removeChild(this.offerBadgesContainer), this.additionalComponentsContainer.removeChild(this.offerBadgesContainer), this.removeStyle('bss-NormalBetItem-offers'), this.offerBadgesContainer = null);
            var e, t = this.model.getOfferBadges(), s = [];
            if (t.length && 0 !== t.length) {
                for (var i of t)
                    B.IsAccumulator(i.oc) || s.push(i);
                if (this.model.getEnhancedPrices()) {
                    let e = !1;
                    for (var a of s)
                        if ('ENHANCEDPRICES' === a.oc || 'EP' === a.oc)
                            return void (e = !0);
                    e || (t = {
                        oc: 'ENHANCEDPRICES',
                        ot: _.NONE
                    }, s.unshift(t));
                }
            }
            var l = [], n = [], r = [], d = [], o = [];
            let h = !1;
            var p, c, u = languageDefinition('BetslipStandardUILib');
            for (p of s)
                'EP' === p.oc ? l.push({
                    offerCode: 'EP',
                    offerText: B.GetTranslation('enhancedPrices'),
                    offerTextMini: '',
                    offerCodesTermsList: [''],
                    offerType: _.NONE
                }) : B.IsBoreDraw(p.oc) ? r.push(p) : p.ot == _.SUB_ON_OFFER ? (h = !0, d.push(p)) : p.ot == _.EARLY_PAYOUT_OFFER ? n.push(p) : p.oc == y.INCLUDED_EXTRA_TIME_OFFER || p.oc == y.NINETY_PLUS_STOPPAGE_TIME_OFFER ? o.push(p) : l.push({
                    offerCode: p.oc,
                    offerText: B.GetBadgeTranslation(p.oc),
                    offerTextMini: '',
                    offerCodesTermsList: this.getCodeTermsList(s, p),
                    offerType: p.ot
                });
            if (r.length) {
                var b = {
                    offerCode: r[0].oc,
                    offerText: B.GetBadgeTranslation(r[0].oc),
                    offerTextMini: '',
                    offerCodesTermsList: [r[0].oc],
                    offerType: +r[0].oc
                };
                for (let e = 1, t = r.length; e < t; e++) {
                    var m = r[e].oc;
                    b.offerCodesTermsList.indexOf(m) < 0 && b.offerCodesTermsList.push(m);
                }
                l.push(b);
            }
            if (n.length) {
                var g = {
                    offerCode: n[0].oc,
                    offerText: B.GetBadgeTranslation(n[0].oc),
                    offerTextMini: '',
                    offerCodesTermsList: [n[0].oc],
                    offerType: +n[0].oc
                };
                for (let e = 1, t = n.length; e < t; e++) {
                    var C = n[e].oc;
                    g.offerCodesTermsList.indexOf(C) < 0 && g.offerCodesTermsList.push(C);
                }
                l.push(g);
            }
            if (d.length) {
                var S = {
                    offerCode: d[0].oc,
                    offerText: B.GetBadgeTranslation(d[0].oc),
                    offerTextMini: '',
                    offerCodesTermsList: [d[0].oc],
                    offerType: +d[0].ot
                };
                for (let e = 1, t = d.length; e < t; e++) {
                    var f = d[e].oc;
                    S.offerCodesTermsList.indexOf(f) < 0 && S.offerCodesTermsList.push(f);
                }
                l.push(S);
            }
            for (c of o)
                c.oc == y.INCLUDED_EXTRA_TIME_OFFER ? l.push({
                    offerCode: c.oc,
                    offerText: u.getValue('120M'),
                    offerTextMini: u.getValue('120Mini'),
                    offerCodesTermsList: [c.oc],
                    offerType: c.ot
                }) : c.oc == y.NINETY_PLUS_STOPPAGE_TIME_OFFER && l.push({
                    offerCode: c.oc,
                    offerText: u.getValue('90M'),
                    offerTextMini: '',
                    offerCodesTermsList: [c.oc],
                    offerType: c.ot
                });
            t = this.removeDuplicateOfferCodes(l);
            0 < t.length && (this.offerBadgesContainer && (this.additionalComponentsContainer.removeChild(this.offerBadgesContainer), null != (e = this.offerBadgesContainer.parent)) && e.removeChild(this.offerBadgesContainer), this.offerBadgesContainer = new x(t), this.offerBadgesContainer.addStyle('bss-NormalBetItem_OfferBadges'), 1 === t.length ? (h ? (this.titleLabel.appendChild(this.offerBadgesContainer), this.titleLabel) : (this.marketContainer.appendChild(this.offerBadgesContainer), this.marketContainer)).addStyle('bss-NormalBetItem_MarketWrapper-hasOffers') : (this.additionalComponentsContainer.appendChild(this.offerBadgesContainer), this.addStyle('bss-NormalBetItem-offers')));
        }
        getCodeTermsList(e, t) {
            var s, i = [];
            for (s of e)
                s.ot === t.ot && i.indexOf(s.oc) < 0 && i.push(s.oc);
            return i;
        }
        removeDuplicateOfferCodes(e) {
            var t, s = {};
            for (t of e)
                s[t.offerCode] = t;
            var i, a = [];
            for (i in s)
                a.push(s[i]);
            return a;
        }
        static MakeAccessible(e) {
            var t = e.liveAlertsAccessibility = new M(e.liveAlertsTick, v.GetTranslation('GetLiveAlerts'));
            t.makeAccessible(), e.liveAlertsActive && t.setPressed(!0), e.swipeDeleteAccessibilityDelegate = new T(e.deleteButton, e.touchContainer, e), e.swipeDeleteAccessibilityDelegate.makeAccessible();
        }
        setInvalidState() {
        }
        clearInvalidState() {
        }
        dispose() {
            this.mountedReactComponent && (this.mountedReactComponent.dispose(), this.mountedReactComponent = null), this.swipeDeleteAccessibilityDelegate && (this.swipeDeleteAccessibilityDelegate.dispose(), this.swipeDeleteAccessibilityDelegate = null), this.removeButton && (this.removeButton = null);
        }
        getStakeTaxUser() {
            return this.model.getStakeTaxUser();
        }
        getStakeTaxCovered() {
            return this.model.getStakeTaxCovered();
        }
    };
    L = __decorate([AccessibilityDelegate(L)], L), e.NormalBetItem = L;
})(ns_betslipstandarduilib_ui_bet_standard = ns_betslipstandarduilib_ui_bet_standard || {}), (e => {
    var t = ns_betslipuilib_ui_bet.BetComponent;
    class s extends t {
        getStakeBox(e, t) {
            return localeLib('BetslipStandardUILib').createBetItemEWStakeBox(e, t);
        }
    }
    e.CastBetItem = s;
})(ns_betslipstandarduilib_ui_bet_standard = ns_betslipstandarduilib_ui_bet_standard || {}), (e => {
    class t extends e.NormalBetItem {
        createChildren() {
            this.addStyle('bss-ScorecastBetItem'), super.createChildren();
        }
        betSlipDisplayChanged(e) {
            let t = e;
            -1 < e.indexOf('-') && (t = e.replace(/-/gm, '\u2011')), super.betSlipDisplayChanged(t);
        }
    }
    e.ScorecastBetItem = t;
})(ns_betslipstandarduilib_ui_bet_standard = ns_betslipstandarduilib_ui_bet_standard || {}), (e => {
    var t = e.NormalBetItem, s = ns_betslipstandarduilib_ui_bet_controls_common.EachWayCheckbox, i = ns_betslipuilib_ui_bet.EachWayStakeBox, a = ns_betslipstandarduilib_ui_util.StandardLocaleHelper;
    class l extends t {
        constructor() {
            super(...arguments), this.hiddenCheckbox = !1;
        }
        createChildren() {
            this.addStyle('bss-EachwayBetItem'), super.createChildren(), this.touchContainer.addStyle('bss-EachwayBetItem_Content'), this.checkboxContainer.setAttribute('class', 'bss-EachwayBetItem_CheckboxContainer');
        }
        createStakeBox() {
            return localeLib('BetslipStandardUILib').createBetItemEWStakeBox(this, 'bss-StakeBox') || new i(this, 'bss-StakeBox');
        }
        ewAvailableChanged(e, t) {
            e ? (this.eachWayCheckbox || (this.eachWayCheckbox = new s(this), this.checkboxContainer.appendChild(this.eachWayCheckbox)), t ? (this.eachWayCheckbox.setChecked(), this.stakeBox.eachwayChecked()) : (this.eachWayCheckbox.setUnchecked(), this.stakeBox.eachwayUnchecked())) : this.eachWayCheckbox && this.additionalComponentsContainer.suspendElementFromDom();
        }
        forceEachWay() {
            this.eachWayCheckbox && this.eachWayCheckbox.disableCheckbox();
        }
        eachWayTermsChanged(e) {
            this.eachWayCheckbox && this.eachWayCheckbox.setTerms(e);
        }
        eachwayCheckboxChecked() {
            this.stakeBox.eachwayChecked(), this.model.eachwayChecked();
        }
        eachwayCheckboxUnchecked() {
            this.stakeBox.eachwayUnchecked(), this.model.eachwayUnchecked();
        }
        setStateForReceipt(e, t = !1) {
            super.setStateForReceipt(e, t), this.eachWayCheckbox && this.eachWayCheckbox.disableCheckbox();
        }
        revertReceiptState() {
            super.revertReceiptState(), this.hiddenCheckbox && (this.eachWayCheckbox.show(), this.hiddenCheckbox = !1), this.eachWayCheckbox && this.eachWayCheckbox.enableCheckbox();
        }
        setAdditionalReceiptProperties() {
            !this.eachWayCheckbox || (this.hasStake || a.RetainEachWayNoStake) && this.eachWayCheckbox.getChecked() || (this.eachWayCheckbox.hide(), this.hiddenCheckbox = !0);
        }
    }
    e.EachwayBetItem = l;
})(ns_betslipstandarduilib_ui_bet_standard = ns_betslipstandarduilib_ui_bet_standard || {}), (e => {
    var s = ns_betslipstandarduilib_ui_bet_controls_common.EachWayCheckbox, i = ns_betslipstandarduilib_ui_bet_controls_common.NoReservesCheckbox, t = ns_betslipuilib_ui_bet.EachWayStakeBox, a = ns_betslipuilib_util.TransitionHelper, l = ns_betslipstandarduilib_ui_util.StandardLocaleHelper;
    class n extends e.NormalBetItem {
        constructor() {
            super(...arguments), this.hiddenCheckbox = !1;
        }
        createChildren() {
            this.addStyle('bss-NoReservesBetItem'), super.createChildren(), this.touchContainer.addStyle('bss-NoReservesBetItem_Content');
        }
        createStakeBox() {
            return localeLib('BetslipStandardUILib').createBetItemEWStakeBox(this, 'bss-StakeBox') || new t(this, 'bss-StakeBox');
        }
        noReservesAvailableChanged(e, t) {
            e && !this.noReservesCheckbox && (this.noReservesCheckbox = new i(this), this.checkboxContainer.appendChild(this.noReservesCheckbox), t ? this.noReservesCheckbox.setChecked() : this.noReservesCheckbox.setUnchecked());
        }
        noReservesCheckboxChecked() {
            this.model.noReservesChecked();
        }
        noReservesCheckboxUnchecked() {
            this.model.noReservesUnchecked();
        }
        ewAvailableChanged(e, t) {
            e && !this.eachWayCheckbox && (this.eachWayCheckbox = new s(this), this.checkboxContainer.appendChild(this.eachWayCheckbox), t ? (this.eachWayCheckbox.setChecked(), this.stakeBox.eachwayChecked()) : (this.eachWayCheckbox.setUnchecked(), this.stakeBox.eachwayUnchecked()));
        }
        eachWayTermsChanged(e) {
            this.eachWayCheckbox && this.eachWayCheckbox.setTerms(e);
        }
        eachwayCheckboxChecked() {
            this.stakeBox.eachwayChecked(), this.model.eachwayChecked();
        }
        eachwayCheckboxUnchecked() {
            this.stakeBox.eachwayUnchecked(), this.model.eachwayUnchecked();
        }
        setStateForReceipt(e) {
            super.setStateForReceipt(e), this.eachWayCheckbox && this.eachWayCheckbox.disableCheckbox(), this.noReservesCheckbox && this.noReservesCheckbox.disableCheckbox();
        }
        revertReceiptState() {
            super.revertReceiptState(), this.hiddenCheckbox && (a.ShowElementTransition(this.eachWayCheckbox), this.hiddenCheckbox = !1), this.eachWayCheckbox && this.eachWayCheckbox.enableCheckbox(), this.noReservesCheckbox && this.noReservesCheckbox.enableCheckbox();
        }
        setAdditionalReceiptProperties() {
            !this.eachWayCheckbox || (this.hasStake || l.RetainEachWayNoStake) && this.eachWayCheckbox.getChecked() || (a.HideElementTransition(this.eachWayCheckbox), this.hiddenCheckbox = !0);
        }
    }
    e.NoReservesBetItem = n;
})(ns_betslipstandarduilib_ui_bet_standard = ns_betslipstandarduilib_ui_bet_standard || {}), (e => {
    var s = ns_betslipstandarduilib_ui_bet_controls_common.EachWayCheckbox, i = ns_betslipstandarduilib_ui_bet_controls_common.AutoVoidCheckbox, t = ns_betslipuilib_ui_bet.EachWayStakeBox, a = ns_betslipstandarduilib_ui_util.StandardLocaleHelper;
    class l extends e.NormalBetItem {
        constructor() {
            super(...arguments), this.hiddenCheckbox = !1, this.disableVoidCheckbox = !1;
        }
        createChildren() {
            this.addStyle('bss-AutoVoidBetItem'), super.createChildren(), this.touchContainer.addStyle('bss-AutoVoidBetItem_Content'), this.checkboxContainer.setAttribute('class', 'bss-AutoVoidBetItem_CheckboxContainer');
        }
        createStakeBox() {
            return new t(this, 'bss-StakeBox');
        }
        autoVoidAvailableChanged(e, t, s) {
            e && !this.autoVoidCheckbox && (this.autoVoidCheckbox = new i(this), this.checkboxContainer.appendChild(this.autoVoidCheckbox), t || s ? (this.autoVoidCheckbox.setChecked(), s && (this.disableVoidCheckbox = !0, this.autoVoidCheckbox.disableCheckbox())) : this.autoVoidCheckbox.setUnchecked());
        }
        autoVoidCheckboxChecked() {
            this.model.autoVoidChecked();
        }
        autoVoidCheckboxUnchecked() {
            this.model.autoVoidUnchecked();
        }
        ewAvailableChanged(e, t) {
            e && !this.eachWayCheckbox && (this.eachWayCheckbox = new s(this), this.checkboxContainer.appendChild(this.eachWayCheckbox), t ? (this.eachWayCheckbox.setChecked(), this.stakeBox.eachwayChecked()) : (this.eachWayCheckbox.setUnchecked(), this.stakeBox.eachwayUnchecked()));
        }
        eachWayTermsChanged(e) {
            this.eachWayCheckbox && this.eachWayCheckbox.setTerms(e);
        }
        eachwayCheckboxChecked() {
            this.stakeBox.eachwayChecked(), this.model.eachwayChecked();
        }
        eachwayCheckboxUnchecked() {
            this.stakeBox.eachwayUnchecked(), this.model.eachwayUnchecked();
        }
        setStateForReceipt(e) {
            super.setStateForReceipt(e), this.autoVoidCheckbox && this.autoVoidCheckbox.disableCheckbox(), this.eachWayCheckbox && this.eachWayCheckbox.disableCheckbox();
        }
        revertReceiptState() {
            super.revertReceiptState(), this.hiddenCheckbox && (this.eachWayCheckbox.show(), this.hiddenCheckbox = !1), this.autoVoidCheckbox && (this.disableVoidCheckbox ? this.autoVoidCheckbox.disableCheckbox() : this.autoVoidCheckbox.enableCheckbox()), this.eachWayCheckbox && this.eachWayCheckbox.enableCheckbox();
        }
        setAdditionalReceiptProperties() {
            !this.eachWayCheckbox || (this.hasStake || a.RetainEachWayNoStake) && this.eachWayCheckbox.getChecked() || (this.eachWayCheckbox.hide(), this.hiddenCheckbox = !0);
        }
    }
    e.AutoVoidBetItem = l;
})(ns_betslipstandarduilib_ui_bet_standard = ns_betslipstandarduilib_ui_bet_standard || {}), (e => {
    var t = e.NormalBetItem, s = ns_betslipstandarduilib_ui_bet_controls_common.EwexCheckbox, l = ns_betslipstandardlib_model_ewex.EwexOptionType, i = ns_betslipuilib_ui_bet.EachWayStakeBox, a = ns_betslipuilib_util.TransitionHelper, n = ns_betslipstandarduilib_ui_util.StandardLocaleHelper;
    class r extends t {
        constructor(e, t) {
            super(e, t), this.betslipComponentDelegate = t, this.hiddenCheckbox = !1;
        }
        createChildren() {
            this.addStyle('bss-EwexBetItem'), super.createChildren(), this.touchContainer.addStyle('bss-EwexBetItem_Content'), this.checkboxContainer.setAttribute('class', 'bss-EwexBetItem_CheckboxContainer'), this.oddsContainer.addStyle('bss-EwexBetItem_OddsContainer'), this.oddsLabel && this.oddsLabel.addStyle('bss-EwexBetItem_Odds');
        }
        createStakeBox() {
            return localeLib('BetslipStandardUILib').createBetItemEWStakeBox(this, 'bss-StakeBox') || new i(this, 'bss-StakeBox');
        }
        ewAvailableChanged(e, t) {
            e && !this.ewexCheckbox && (this.ewexCheckbox = new s(this.model, this), this.checkboxContainer.appendChild(this.ewexCheckbox), t ? (this.ewexCheckbox.setChecked(), this.stakeBox.eachwayChecked()) : (this.ewexCheckbox.setUnchecked(), this.stakeBox.eachwayUnchecked()));
        }
        ewexSelectionChanged(e, t, s, i) {
            switch (this.ewexCheckbox.setPlaceCount(e), this.betslipComponentDelegate.ewexBetItemEwexSelectionChanged(i, this.model.key()), s) {
            case l.MainMarket:
                this.marketLabel.setText(n.GetTranslation('WinEachWay')), this.ewexCheckbox.setCheckboxEnabled();
                break;
            case l.EnhancedPlace:
                this.marketLabel.setText(n.GetTranslation('EnhancedPlace')), this.ewexCheckbox.setCheckboxDisabled();
                break;
            case l.Ewex:
                this.marketLabel.setText(n.GetTranslation('Ewex')), this.ewexCheckbox.setCheckboxDisabled();
            }
            this.oddsLabel.setOdds(t), this.addStyle('bss-EwexBetItem-oddschangedfade');
            let a = () => {
                this.removeStyle('bss-EwexBetItem-oddschangedfade'), this.oddsContainer.getElement().removeEventListener(ANIMATION_END, a);
            };
            this.oddsContainer.getElement().addEventListener(ANIMATION_END, a);
        }
        forceEachWay() {
            this.ewexCheckbox && this.ewexCheckbox.setCheckboxDisabled();
        }
        eachWayTermsChanged(e) {
            this.ewexCheckbox && this.ewexCheckbox.setTerms(e);
        }
        ewexCheckboxChecked() {
            this.stakeBox.eachwayChecked(), this.model.eachwayChecked();
        }
        ewexCheckboxUnchecked() {
            this.stakeBox.eachwayUnchecked(), this.model.eachwayUnchecked();
        }
        ewexCheckboxDisableSlip() {
            this.betslipComponentDelegate.ewexBetItemDisableSlip();
        }
        ewexCheckboxEnableSlip() {
            this.betslipComponentDelegate.ewexBetItemEnableSlip();
        }
        revertReceiptState() {
            super.revertReceiptState(), this.hiddenCheckbox && (a.ShowElementTransition(this.ewexCheckbox), this.hiddenCheckbox = !1);
        }
        setAdditionalReceiptProperties() {
            !this.ewexCheckbox || (this.hasStake || n.RetainEachWayNoStake) && this.ewexCheckbox.getChecked() || (a.HideElementTransition(this.ewexCheckbox), this.hiddenCheckbox = !0);
        }
        dispose() {
            super.dispose(), this.ewexCheckbox && this.ewexCheckbox.dispose();
        }
    }
    e.EwexBetItem = r;
})(ns_betslipstandarduilib_ui_bet_standard = ns_betslipstandarduilib_ui_bet_standard || {}), (e => {
    var t = e.NormalBetItem, i = ns_betslipstandarduilib_ui_bet_controls_standard.PitcherDetails, s = ns_gen5_ui.Component;
    class a extends t {
        createChildren() {
            this.addStyle('bss-PitcherBetItem'), super.createChildren(), this.touchContainer.addStyle('bss-PitcherBetItem_Content');
            var e = new s();
            e.addStyle('bss-PitcherBetItem_FixtureWrapper'), this.titleAndMarket.appendChild(e), this.titleAndMarket.appendChildAt(this.fixtureOfferContainer, 1);
        }
        setStateForReceipt(e) {
            super.setStateForReceipt(e), this.pitcherDetails && this.pitcherDetails.hide();
        }
        revertReceiptState() {
            super.revertReceiptState(), this.pitcherDetails && this.pitcherDetails.show();
        }
        pitcherChanged(t, s) {
            if (this.pitcherDetails)
                t = t || StandardLocaleHelper.GetTranslation('listedPitchers'), this.pitcherDetails.updatePitcher(t);
            else {
                let e = !0;
                t || (t = StandardLocaleHelper.GetTranslation('listedPitchers'), e = !1), this.pitcherDetails = new i(this.model, this, t, s, e), this.additionalComponentsContainer.appendChild(this.pitcherDetails);
            }
        }
        pitcherDetailsPitcherSelectionChanged(e, t) {
            this.model.setPitcherSelection(e, t);
        }
    }
    e.PitcherBetItem = a;
})(ns_betslipstandarduilib_ui_bet_standard = ns_betslipstandarduilib_ui_bet_standard || {}), (e => {
    var t = ns_gen5_ui.Component, s = e.NormalBetItem, i = ns_betslipuilib_ui_bet.PositionPayoutOdds, a = ns_betslipuilib_enum.PositionPayoutDisplayFormat, l = ns_positionpayoutlib_util.PayoutDelegateWrapper, n = ns_webconsolelib_util.WebConsoleGlobals;
    class r extends s {
        constructor() {
            super(...arguments), this.showInfoButton = !1, this.showMaxReturnText = !1, this.hasFormatChanged = !1, this.dropdownItemUpdated = e => {
                this.updateReturnsFormat(e), this.positionPayoutoddsLabel && this.positionPayoutoddsLabel.setMultipliersFormat(e), this.betslipComponentDelegate.positionPayoutBetItemFormatChanged(e), this.model.setMultiplierFormat(e);
            };
        }
        createChildren() {
            this.addStyle('bss-PositionPayoutBetItem'), super.createChildren(), this.locale = localeLib('BetslipStandardUILib'), this.oddsContainer && (this.oddsContainer.removeChild(this.oddsLabel), this.removeChild(this.oddsContainer)), this.oddsContainer = new t(), this.oddsContainer.addStyle('bss-PositionPayoutBetItem_OddsContainer'), this.oddsContentContainer = new t(), this.oddsContentContainer.addStyle('bss-PositionPayoutBetItem_OddsRightContainer'), this.oddsContentContainer.appendChildAt(this.oddsContainer, 1), this.oddsContentContainer.appendChild(this.stakeBox), this.stakeBox.addStyle('bss-PositionPayoutBetItem_StakeBox'), this.contentWrapper.appendChild(this.oddsContentContainer), this.contentWrapper.addStyle('bss-PositionPayoutBetItem_ContentWrapper'), this.detailsWrapper.setAttribute('class', 'bss-PositionPayoutBetItem_Details'), this.showInfoButton = !0, this.showMaxReturnText = !0, l.AddDelegate(this), n.App && n.App.watch('PositionPayoutModulePreferences', this.dropdownItemUpdated);
        }
        updateReturnsFormat(e) {
            this.formatType = e, this.formatType === a.CurrencyFormat ? this.addStyle('bss-PositionPayoutBetItem-currency') : this.removeStyle('bss-PositionPayoutBetItem-currency');
        }
        getBetItemFormat() {
            return this.formatType;
        }
        placeMultipliersUpdated(e) {
            e && (e = this.model.getPlaceMultipliers(), this.positionPayoutoddsLabel) && this.positionPayoutoddsLabel.setPositionPayoutOdds(e);
        }
        oddsChanged(e, t, s, i, a) {
            super.oddsChanged(e, t, s, i, a), t && this.positionPayoutoddsLabel && this.positionPayoutoddsLabel.setOddsChanged();
        }
        changesAccepted() {
            super.changesAccepted(), this.positionPayoutoddsLabel && this.positionPayoutoddsLabel.acceptOddsChange();
        }
        betSlipDisplayChanged(e) {
            super.betSlipDisplayChanged(e);
            var t, e = this.model.getPlaceMultipliers();
            this.placeMultipliersFormat = this.model.getMultiplierFormat(), this.placeMultipliersFormat && e && (t = this.locale.createPositionPayoutOdds(this.showInfoButton, this.showMaxReturnText, e, this.placeMultipliersFormat), this.positionPayoutoddsLabel = t || new i(this.showInfoButton, this.showMaxReturnText, e, this.placeMultipliersFormat), this.oddsContainer.appendChild(this.positionPayoutoddsLabel), this.stakeBox.showMaxReturn(), this.updateReturnsFormat(this.placeMultipliersFormat));
        }
        stakeChanged(e) {
            this.positionPayoutoddsLabel && this.positionPayoutoddsLabel.setCurrentStake(+e), super.stakeChanged(e);
        }
        betCreditsStakeChanged(e, t, s, i) {
            super.betCreditsStakeChanged(e, t, s, i), this.positionPayoutoddsLabel && this.positionPayoutoddsLabel.setBetCredits(+e);
        }
        totalStakeChanged(e) {
            super.totalStakeChanged(e), this.betslipComponentDelegate.positionPayoutBetItemFormatChanged(this.formatType);
        }
        setStateForReceipt(e, t = !1) {
            super.setStateForReceipt(e, t), this.placeMultipliersFormat !== a.CurrencyFormat || this.model.getStake() || (this.hasFormatChanged = !0, this.positionPayoutoddsLabel.setMultipliersFormat(a.Multiplierformat)), this.stakeBox.suspendElementFromDom();
        }
        revertReceiptState() {
            super.revertReceiptState(), this.hasFormatChanged && (this.hasFormatChanged = !1, this.positionPayoutoddsLabel.setMultipliersFormat(this.placeMultipliersFormat)), this.stakeBox.unsuspendElementFromDom();
        }
        dispose() {
            super.dispose(), l.RemoveDelegate(this);
        }
    }
    e.PositionPayoutBetItem = r;
})(ns_betslipstandarduilib_ui_bet_standard = ns_betslipstandarduilib_ui_bet_standard || {}), (e => {
    var n = ns_gen5_ui.Application, t = ns_betslipuilib_util.PopupHelper, r = ns_gen5_events.ApplicationEvent;
    class s extends t {
        handleHover() {
        }
        applicationWidthChangedHandler() {
            this.setPosition();
        }
        applicationHeightChangedHandler() {
            this.setPosition();
        }
        setPosition(e = 0) {
            n.currentApplication.hasEventListenerWithDelegate(r.WIDTH_STATE_CHANGED, this._delegate_applicationWidthChangedHandler) || n.currentApplication.addEventListener(r.WIDTH_STATE_CHANGED, this._delegate_applicationWidthChangedHandler), n.currentApplication.hasEventListenerWithDelegate(r.WIDTH_CHANGED, this._delegate_applicationWidthChangedHandler) || n.currentApplication.addEventListener(r.WIDTH_CHANGED, this._delegate_applicationWidthChangedHandler), n.currentApplication.hasEventListenerWithDelegate(r.HEIGHT_CHANGED, this._delegate_applicationHeightChangedHandler) || n.currentApplication.addEventListener(r.HEIGHT_CHANGED, this._delegate_applicationHeightChangedHandler);
            var t = this.getElement(), s = this.target.getElement(), i = t.offsetHeight, a = t.offsetWidth, s = s.getBoundingClientRect(), l = n.currentApplication.width < 950 ? 0 : 40;
            n.currentApplication.height + e - l - s.bottom - 15 < i || this.forceTop ? t.style.top = s.top - e - t.offsetHeight + l + 'px' : (t.style.top = s.bottom + e - 4 + l + 'px', this.nib.addStyle('bss-VoidPopupHelper_Nib-above'), this.addStyle('bss-VoidPopupHelper-above')), this.nib.getInlineStyle().left = 0.5 * a + (s.left - 0.5 * n.currentApplication.width) - 2.5 + 'px', this.dropDownRects = this.popup.getElement().getBoundingClientRect();
        }
    }
    e.VoidPopupHelper = s;
})(ns_betslipstandarduilib_ui_bet = ns_betslipstandarduilib_ui_bet || {}), (e => {
    class t extends ns_gen5_events.Event365 {
        constructor(e, t) {
            super(e), this.selection = t;
        }
    }
    t.PLAYER_VOID_CHANGED = 'BET_BUILDER_PLAYER_VOID_CHANGED', e.PlayerVoidEvent = t;
})(ns_betslipstandarduilib_events = ns_betslipstandarduilib_events || {}), (e => {
    var s = ns_gen5_ui.Label, i = ns_gen5_ui.Component, t = ns_betslipstandarduilib_events.PlayerVoidEvent, a = e.VoidPopupHelper, l = ns_betslipuilib_ml.Language, n = ns_accessibilityuilib_ui_popup.PopupAccessibilityDelegate, r = ns_accessibilityuilib_ui.LinkAccessibilityDelegate;
    let d = class extends i {
        constructor(e, t) {
            super(), this.parentElem = e, this.firstSelectionSelected = t, this.popupHelper = new a(this, this.parentElem.chevron, this, !0);
        }
        createChildren() {
            this.addStyle('bss-PlayerVoidModal');
            var e = new i(), t = (e.addStyle('bss-PlayerVoidModal_Wrapper'), this.appendChild(e), new s()), t = (t.setText(l.GetTranslation('playerDoesntStart')), t.addStyle('bss-PlayerVoidModal_TitleText'), e.appendChild(t), this.firstSelection = new i(), this.firstSelection.clickHandler = () => this.playerVoidSelectedClickHandler(!0), this.firstSelection.addStyle('bss-PlayerVoidModal_FirstSelection'), new i()), t = (t.addStyle('bss-PlayerVoidModal_FirstSelection-icon1'), this.firstSelection.appendChild(t), new s()), t = (t.addStyle('bss-PlayerVoidModal_SelectionText'), t.setText(l.GetTranslation('selectionVoidRecalculated')), this.firstSelection.appendChild(t), this.secondSelection = new i(), this.secondSelection.clickHandler = () => this.playerVoidSelectedClickHandler(!1), this.secondSelection.addStyle('bss-PlayerVoidModal_SecondSelection'), new i()), t = (t.addStyle('bss-PlayerVoidModal_FirstSelection-icon2'), this.secondSelection.appendChild(t), new s());
            t.addStyle('bss-PlayerVoidModal_SelectionText'), t.setText(l.GetTranslation('selectionVoidWholeBetVoid')), this.secondSelection.appendChild(t), this.setAutoVoid(this.firstSelectionSelected), e.appendChild(this.firstSelection), e.appendChild(this.secondSelection), this.popupHelper.clickOutsideHandler = e => {
                this.parentElem.closeModal(e);
            };
        }
        showPopup() {
            this.popupHelper.showPopup();
        }
        popupHelperHideMessage() {
        }
        hidePopup() {
            this.popupHelper.hidePopup();
        }
        clickOutsideHandler(e) {
        }
        dispose() {
            this.accessibility && this.accessibility.dispose();
        }
        setAutoVoid(e) {
            e ? (this.firstSelection.addStyle('bss-PlayerVoidModal_IconSelected'), this.secondSelection.removeStyle('bss-PlayerVoidModal_IconSelected'), this.parentElem.voidSelectionSelected()) : (this.firstSelection.removeStyle('bss-PlayerVoidModal_IconSelected'), this.secondSelection.addStyle('bss-PlayerVoidModal_IconSelected'), this.parentElem.voidEntireBetSelected());
        }
        static MakeAccessible(e) {
            var t = { triggerButton: e.parentElem }, t = new n(e, t);
            (e.accessibility = t).makeAccessible(), r.MakeAccessible(e.firstSelection), r.MakeAccessible(e.secondSelection);
        }
        playerVoidSelectedClickHandler(e) {
            this.setAutoVoid(e), this.parentElem.bubbleEvent(new t(t.PLAYER_VOID_CHANGED, e)), this.parentElem.closeModal();
        }
    };
    d = __decorate([AccessibilityDelegate(d)], d), e.PlayerVoidModal = d;
})(ns_betslipstandarduilib_ui_bet = ns_betslipstandarduilib_ui_bet || {}), (e => {
    var t = ns_accessibilityuilib_ui.ButtonAccessibilityDelegate, s = ns_betslipuilib_ml.Language, i = ns_webconsolelib_util.Browser, a = ns_gen5_ui.Component;
    let l = class extends a {
        constructor(e) {
            super(), this.delegate = e;
        }
        createChildren() {
            this.addStyle('bss-MultipleHeaderRemoveButton'), i.addMouseModeDelegate(this);
        }
        clickHandler() {
            this.delegate.multipleHeaderRemoveButtonClicked();
        }
        mouseModeEnabled() {
            this.mouseMode = !0, this.accessibility && this.accessibility.setHidden(!1);
        }
        mouseModeDisabled() {
            this.mouseMode = !1, this.accessibility && this.accessibility.setHidden(!0);
        }
        dispose() {
            i.removeMouseModeDelegate(this);
        }
        static MakeAccessible(e) {
            e.accessibility = new t(e, s.GetTranslation('delete')), e.accessibility.makeAccessible(), e.mouseMode || e.accessibility.setHidden(!0);
        }
    };
    l = __decorate([AccessibilityDelegate(l)], l), e.MultipleHeaderRemoveButton = l;
})(ns_betslipstandarduilib_ui_bet_standard = ns_betslipstandarduilib_ui_bet_standard || {}), (l => {
    var a, p = ns_betslipstandarduilib_ui_util.StandardLocaleHelper, c = ns_gen5_ui.Component, u = ns_gen5_ui.Label, s = ns_betslipuilib_ui_bet.EachWayStakeBox, e = ns_betslipuilib_ui_bet_keypad.Controller, n = ns_betslipuilib_ui_bet.OddsLabel, r = ns_betslipuilib_ui_bet.PositionPayoutOdds, i = ns_betslipstandarduilib_ui_bet_controls_common.EachWayCheckbox, d = ns_gen5_ui.DomElement, o = ns_betslipuilib_ui_bet.ReferralInfo, h = ns_betslipuilib_util.TransitionHelper, b = ns_betslipcorelib_constants.BetSlipResult, m = ns_betslipuilib_ui_bet_betbreakdown.BetBreakdown, g = ns_webconsolelib_util.ModalManager, C = ns_gen5_util.CurrencyFormatter, S = ns_betslipuilib_ui_bet_controls_standard.ShowMoreMultiplesButton, f = ns_postbootlib_util.OfferBadgesUtil, B = ns_gen5_util.PromotionalFilter, _ = ns_gen5_util.MathUtil, y = ns_betcalculationslib_rounding.RoundingHelper, x = ns_betslipuilib_ui_bet.SwipeDelete, k = ns_betslipuilib_ui_bet.DeleteButton, M = ns_betslipstandarduilib_ui_bet_controls_standard.OtherMultiplesButton, v = ns_gen5_util.StringUtil, t = ns_betslipstandarduilib_ui_offerbadges.MultipleHeaderOfferBadgesContainer, w = ns_betcalculationslib_util.MinimumStakes, T = ns_betslipuilib_ui_bet.BetCreditsInfo, I = ns_betslipuilib_util.BetCreditsMessageKey, E = l.MultipleHeaderRemoveButton, A = ns_betslipuilib_accessibility.SwipeDeleteButtonAccessibilityDelegate, D = ns_betslipcorelib_util.OddsFormatter, R = ns_gen5_util.OddsType;
    let H = a = class extends c {
        constructor(e, t) {
            super(), this.delegate = t, this.isPositionPayout = !1, this.stakeBoxType = s, this.checkboxHidden = !1, this.isHidden = !1, this.hasStake = !1, this.isCast = !1, this.multiplesExpanded = !1, this.isExpandedState = !1, this.isStateChanged = !1, this.autoVoidEnabled = !1, this.betCreditsInfoShowing = !1, this.model = e;
        }
        createChildren() {
            var e = Locator.user.languageId || '1', t = (this.restrictedSelections = ns_sitepreferenceslib_util.UserPreferences.AdditionalPreferences(ns_betslipcorelib_util.BetslipPreferences).containsRestrictedSelections, this.addStyle('bss-MultipleHeader'), this.wrapper = new c()), s = (t.addStyle('bss-MultipleHeader_Outer-wrapper'), this.appendChild(t), new c()), i = (s.addStyle('bss-MultipleHeader_DeleteContainer'), t.appendChild(s), this.innerWrapper = new c(), this.innerWrapper.addStyle('bss-MultipleHeader_Wrapper'), this.appendChild(this.innerWrapper), this.deleteButton = new k(this, !0), s.appendChild(this.deleteButton), s.clickHandler = () => this.deleteContainerClickHandler(), s.appendChild(this.innerWrapper), this.touchContainer = new c(), this.touchContainer.addStyle('bss-MultipleHeader_Content'), this.innerWrapper.appendChild(this.touchContainer), this.touchContainer.appendChildAt(new E(this), 0), this.touchContainer.clickHandler = () => {
                    this.isExpandedState || this.restrictedSelections || this.delegate.multipleHeaderOtherMultiplesButtonClicked();
                }, this.multipleDetails = this.detailsWrapper = new d(), this.multipleDetails.setAttribute('class', 'bss-MultipleHeader_Details'), this.touchContainer.appendChild(this.multipleDetails), this.topSection = new d(), this.topSection.setAttribute('class', 'bss-MultipleHeader_TopSection'), this.multipleDetails.appendChild(this.topSection), this.condensedWrapper = new c(), this.condensedWrapper.addStyle('bss-MultipleHeader_CondensedWrapper'), this.topSection.appendChild(this.condensedWrapper), this.titleAndOddsContainer = new c(), this.titleAndOddsContainer.addStyle('bss-MultipleHeader_TitleAndOddsContainer'), this.condensedWrapper.appendChild(this.titleAndOddsContainer), this.titleLabel = new u()), i = (i.addStyle('bss-MultipleHeader_Title'), this.titleAndOddsContainer.appendChild(i), new d()), e = (i.setAttribute('class', 'bss-MultipleHeader_BetBuilderPlusWrapper'), this.titleAndOddsContainer.appendChild(i), this.betBuilderPlusLogo = new d('img'), this.betBuilderPlusLogo.setAttribute('src', `/sports-assets/${ SITE_ROOT_PATH }/BetslipStandardUILib/assets/betbuilderplus/bs-BetBuilderPlusLogo-${ e }.svg`), this.betBuilderPlusLogo.setAttribute('class', 'bss-MultipleHeader_BetBuilderPlusLogo'), i.appendChild(this.betBuilderPlusLogo), this.bonusText = new u(), this.bonusText.addStyle('bss-MultipleHeader_BonusText'), this.titleAndOddsContainer.appendChild(this.bonusText), this.oddsContainer = new c(), this.oddsContainer.addStyle('bss-MultipleHeader_OddsContainer'), this.titleAndOddsContainer.appendChild(this.oddsContainer), this.oddsContainerExpanded = new c(), this.oddsContainerExpanded.addStyle('bss-MultipleHeader_OddsContainerExpanded'), this.titleAndOddsContainer.appendChild(this.oddsContainerExpanded), this.delegate.multipleHeaderGetPositionPayoutFormat());
            null !== e ? (this.isPositionPayout = !0, this.oddsLabel = new r(!1, !1, {}, e), this.oddsLabel.addStyle('bss-MultipleHeader_OddsLabel'), this.oddsContainer.appendChild(this.oddsLabel), this.oddsLabelExpanded = new r(!1, !1, {}, e)) : (this.oddsLabel = new n(), this.oddsLabel.showSPText = !1, this.oddsLabel.addStyle('bss-MultipleHeader_OddsLabel'), this.oddsContainer.appendChild(this.oddsLabel), this.oddsLabelExpanded = new n(), this.oddsLabelExpanded.showSPText = !1), this.oddsLabelExpanded.defaultStyle = 'bsc-OddsLabel', this.oddsContainerExpanded.appendChild(this.oddsLabelExpanded), this.bottomSection = new d(), this.bottomSection.setAttribute('class', 'bss-MultipleHeader_BottomSection'), this.multipleDetails.appendChild(this.bottomSection), this.underWrapper = new c(), this.underWrapper.addStyle('bss-MultipleHeader_UnderWrapper'), this.toggleWrapper = new c(), this.toggleWrapper.addStyle('bss-MultipleHeader_ToggleWrapper');
            let a = () => {
                0 == this.delegate.multipleHeaderGetMultiplesCount() || this.disabled || (this.expandMultiplesChanged = !0, this.invalidateProperties());
            };
            this.toggleButton = new S({
                showMoreMultiplesButtonClicked() {
                    a();
                }
            }), this.toggleButton.addStyle('bss-MultipleHeader_ShowMore'), this.toggleWrapper.appendChild(this.toggleButton), this.toggleButton.setText(p.GetTranslation('moreMultiples')), t.appendChild(this.underWrapper), t.appendChild(this.toggleWrapper), this.createStakeBox(), this.touchContainer.appendChild(this.stakeBox), this.additionalComponentsContainer = new c(), this.additionalComponentsContainer.addStyle('bss-MultipleHeader_AdditionalComponents'), this.touchContainer.appendChild(this.additionalComponentsContainer), this.multiplesRestrictedUpdated();
            i = new c(), i.addStyle('bss-MultipleHeader_MessageContainer'), this.appendChild(i), e = new u();
            e.addStyle('bss-MultipleHeader_MessageBody'), i.appendChild(e), i.suspendElementFromDom(), this.referralMessageContainer = new c(), this.referralMessageContainer.addStyle('bss-MultipleHeader_Referred'), this.underWrapper.appendChild(this.referralMessageContainer), this.referralMessageContainer.suspendElementFromDom(), this.restrictedSelections || ((t = new M()).clickHandler = () => {
                this.isExpandedState || this.restrictedSelections || this.delegate.multipleHeaderOtherMultiplesButtonClicked();
            }, t.addStyle('bss-MultipleHeader_OtherMultiples'), s.appendChildAt(t, 0)), this.miniBetContainer = new l.MiniBetContainer('bss-MultipleHeader'), this.bottomSection.appendChildAt(this.miniBetContainer, 0), this.selectionInfo = new u(), this.selectionInfo.addStyle('bss-MultipleHeader_SelectionInfo'), this.bottomSection.appendChildAt(this.selectionInfo, 1), this.multipleDetails.appendChild(this.bottomSection), this.swipeDelete = new x(this);
        }
        multiplesRestrictedUpdated() {
            this.delegate.multipleHeaderHasRstrictedMultiples() && this.model.supportsBetBreakdown() ? this.enableBetBreakdown() : this.disableBetBreakdown();
        }
        commitProperties() {
            this.isStateChanged && (this.isStateChanged = !1, this.setAutoVoidMessage(this.isExpandedState)), this.changeMultipleHeader();
        }
        multipleHeaderRemoveButtonClicked() {
            this.delegate.multipleHeaderRemoveButtonClicked();
        }
        restoreMultiplesState(e) {
            Locator.validationManager.callNewContext(() => {
                this.toggleButton.restoreExpandedState(e);
            });
        }
        setBetBuilderPlusHeaders(e, t, s, i) {
            var a = Locator.user.languageId;
            2 <= e ? ('30' !== a && '32' !== a || e === i && this.betBuilderPlusLogo.setAttribute('src', p.GetBetBuilderPlusRacingLogoPath()), this.titleLabel.setText(p.GetTranslation('BetBuilderPlus')), this.addStyle('bss-MultipleHeader-betbuilderplus'), this.selections ? (this.selections.setText('' + e), this.selections.validateNow()) : (this.oddsContainer.addStyle('bss-MultipleHeader_BetBuilderPlusOddsLabel'), this.selections = new u(), this.selections.addStyle('bss-MultipleHeader_Selections'), this.selections.setText('' + e)), this.condensedWrapper.appendChildAt(this.selections, 0), this.selectionInfo.setText(v.Format(p.GetTranslation('BetBuilderPlusInfo'), t + '', e + '')), this.selectionInfo.addStyle('bss-MultipleHeader_SelectionInfo-show')) : (this.titleLabel.setText(this.model.bet.get('bd')), this.oddsContainer.removeStyle('bss-MultipleHeader_BetBuilderPlusOddsLabel'), this.selectionInfo.removeStyle('bss-MultipleHeader_SelectionInfo-show'), this.removeStyle('bss-MultipleHeader-betbuilderplus'), this.selections && this.condensedWrapper.removeChild(this.selections));
        }
        changeMultipleHeader() {
            this.expandMultiplesChanged && (this.expandMultiplesChanged = !1, this.multiplesExpanded ? this.delegate.multipleHeaderCollapseMultiples() : this.delegate.multipleHeaderExpandMultiples(), this.multiplesExpanded = !this.multiplesExpanded);
        }
        slipResultChanged(e) {
            switch (e) {
            case b.stakeAboveMaximum:
            case b.stakeBelowMinimum:
            case b.userDailyStakeLimitExceeded:
            case b.lineItemsBelowMinimumShortOddsStake:
                0 < this.model.getStake() && this.stakeBox.invalidStake(!0);
                break;
            case b.success:
                this.oddsLabel && this.oddsLabel.acceptOddsChange(), this.oddsLabelExpanded && this.oddsLabelExpanded.acceptOddsChange();
                break;
            case b.stakeAboveMinimum:
                this.stakeBox.invalidStake(!1);
            }
        }
        itemResultChanged(e) {
            this.slipResultChanged(e), this.setReferralMaxStakeMessage(e), this.itemResult = e;
        }
        createStakeBox() {
            var e = localeLib('BetslipStandardUILib').createBetItemEWStakeBox(this, 'bss-StakeBox');
            this.stakeBox = e || new s(this, 'bss-StakeBox');
        }
        setReferralMaxStakeMessage(e) {
            if (e !== b.stakeAboveMinimum)
                if (e === b.success)
                    this.clearReferralMaxStakeMessage();
                else if (e === b.referralRequired && 0 < this.model.getReferralAmount() && 0 === this.model.getMaxStake()) {
                    this.referralMessageContainer.removeAllChildren(), this.wrapper.addStyle('bss-MultipleHeader_ContentWrapper-maxstake');
                    var t = new c(), s = (t.addStyle('bss-MultipleHeader_Referred-wrapper'), this.referralMessageContainer.appendChild(t), p.GetTranslation('MaxBetFullReferral')), i = new u('span');
                    i.addStyle('bss-MultipleHeader_Referred-text'), i.setText(s), t.appendChild(i), this.addStyle('bss-MultipleHeader-referral'), this.referralMessageContainer.unsuspendElementFromDom();
                } else if (e === b.referralRequired && 0 < this.model.getReferralAmount()) {
                    this.referralMessageContainer.removeAllChildren(), this.wrapper.addStyle('bss-MultipleHeader_ContentWrapper-maxstake');
                    var a, l, n, r, d = new c(), o = (d.addStyle('bss-MultipleHeader_Referred-wrapper'), this.referralMessageContainer.appendChild(d), p.GetTranslation('referralPlaceNow').split('|')), h = p.GetTranslation('MaxBetReferralApprovalItemBody').split('|');
                    for (let e = 0; e < o.length; e++)
                        0 <= o[e].indexOf('{0}') ? (l = C.ApplyCurrencySymbol(C.ApplyDelimiterAndGroupSeparator(this.model.getReferralPlaceAmount() + '')), (a = new u('span')).addStyle('bss-MultipleHeader_Referred-value'), a.setText(l), d.appendChild(a)) : ((l = new u('span')).addStyle('bss-MultipleHeader_Referred-text'), l.setText(o[e]), d.appendChild(l));
                    for (let e = 0; e < h.length; e++)
                        0 <= h[e].indexOf('{0}') ? (r = C.ApplyCurrencySymbol(C.ApplyDelimiterAndGroupSeparator(this.model.getReferralAmount() + '')), (n = new u('span')).addStyle('bss-MultipleHeader_Referred-value'), n.setText(r), d.appendChild(n)) : ((r = new u('span')).addStyle('bss-MultipleHeader_Referred-text'), r.setText(h[e]), d.appendChild(r));
                    this.addStyle('bss-MultipleHeader-referral'), this.referralMessageContainer.unsuspendElementFromDom();
                } else
                    e == b.stakeAboveMaximum ? (this.referralMessageContainer.removeAllChildren(), this.wrapper.addStyle('bss-MultipleHeader_ContentWrapper-maxstake'), (s = new c()).addStyle('bss-MultipleHeader_Referred-wrapper'), this.referralMessageContainer.appendChild(s), (t = new u('span')).addStyle('bss-MultipleHeader_Referred-text'), i = p.GetTranslation('MaxBetItemBody'), t.setText(i.replace('{0}', C.ApplyCurrencySymbol(C.ApplyDelimiterAndGroupSeparator(this.model.getMaxStake() + '')))), s.appendChild(t), this.referralMessageContainer.unsuspendElementFromDom()) : this.clearReferralMaxStakeMessage();
        }
        changesAccepted() {
            this.oddsLabel && this.oddsLabel.acceptOddsChange(), this.oddsLabelExpanded && this.oddsLabelExpanded.acceptOddsChange(), this.removeStyle('bsc-MultipleHeader_OddsChanged'), this.removeStyle('bsc-MultipleHeader_HandicapChanged'), this.removeStyle('bsc-MultipleHeader_Suspended');
        }
        changeMinimumStakeAccepted() {
            this.stakeBox.invalidStake(!1);
        }
        showMoreMultiplesButton() {
            this.toggleWrapper.unsuspendElementFromDom();
        }
        hideMoreMultiplesButton() {
            this.toggleWrapper.suspendElementFromDom();
        }
        disable() {
            this.disabled = !0, this.addStyle('bss-MultipleHeader_Disabled'), this.hideMoreMultiplesButton(), this.stakeBox.disable();
        }
        enable(e) {
            this.disabled = !1, this.removeStyle('bss-MultipleHeader_Disabled'), this.showMoreMultiplesButton(), this.stakeBox.enable(e);
        }
        betTypeChanged(e) {
            e > this.betTypeId && this.delegate.multipleHeaderAnimate(), this.betTypeId ? this.betTypeId != e && (this.stakeChanged(''), this.betTypeId = e) : this.betTypeId = e;
        }
        titleUpdated(e) {
            var t = this.titleLabel.getText();
            this.titleLabel.setText(e), t && t !== e && this.delegate.multipleHeaderTitleUpdated();
        }
        oddsUpdated(e, t, s) {
            if ('' == (e = '0/1' == e ? '' : e) ? (this.addStyle('bss-MultipleHeader_NoOdds'), this.oddsAvailable = !1) : (this.removeStyle('bss-MultipleHeader_NoOdds'), this.oddsAvailable = !0), this.isPositionPayout) {
                let e = this.model.getOdds();
                return e ? (i = D.FormatOdds(e, '', R.DECIMAL), i = parseFloat(i) + '', this.oddsLabel.setOdds(i + a.MULTIPLIER_SUFFIX), this.oddsLabelExpanded.setOdds(i + a.MULTIPLIER_SUFFIX), void this.stakeBox.showMaxReturn()) : void 0;
            }
            var i = this.delegate.multipleHeaderGetOddsTypeOverride();
            this.oddsLabel.setOdds(e, i), this.oddsLabelExpanded.setOdds(e, i), this.delegate.multipleHeaderUpdateHeaderOdds(e, i), s && this.restrictedSelections && this.oddsLabel.setBoostedOdds(e, s), t && this.oddsAvailable && (this.oddsLabel.setOddsChanged(), this.oddsLabelExpanded.setOddsChanged());
        }
        accumulatorPercentageChanged(e, t) {
            B.IsExcludedFromPromotion('2') || B.IsExcludedFromOffers('2') || 0 === e || !e ? (this.bonusText.setText(''), this.stakeBox.setBonusValue('')) : (this.bonusText.setText('+ ' + e + '% ' + f.GetTranslation('bonus')), this.stakeBox.setBonusValue(t), this.delegate.multipleHeaderAccumulatorPercentageChanged(t), this.addStyle('bss-MultipleHeader_HasBonus'));
        }
        betCountUpdated(e) {
            1 == e && this.model.isCastMultiple() ? this.stakeBox.overrideBetCount(e + 'x') : this.stakeBox.setBetCount(e);
        }
        multipleRemoved() {
            this.delegate.multipleHeaderMultipleRemoved(this), this.stakeBox.dispose();
        }
        betReferenceChanged(e) {
            p.RequiresReferenceOnBetItem() && e && (this.betReference || (this.betReference = new u(), this.betReference.addStyle('bss-MultipleHeader_BetRef')), e = p.GetTranslation('ref') + ': ' + e, this.betReference.setText(e), this.bottomSection.appendChild(this.betReference), this.addStyle('bss-MultipleHeader_HasBetRef'));
        }
        setStateForReceipt(e = !1) {
            this.swipeDelete.disable(), this.hasStake || this.isHidden || (h.HideElementTransition(this), this.isHidden = !0), this.betCreditsInfo && this.betCreditsInfo.setMessageForReceipt(), this.eachWayCheckbox && !this.eachWayCheckbox.getChecked() && (h.HideElementTransition(this.eachWayCheckbox), this.checkboxHidden = !0), this.eachWayCheckbox && this.eachWayCheckbox.disableCheckbox(), this.stakeBox && this.stakeBox.setStakeBoxForReceipt(), e || this.setReferralMaxStakeMessage(0), this.addStyle('bss-MultipleHeader-reciept');
        }
        revertReceiptState() {
            this.removeStyle('bss-MultipleHeader_FullyDeclined'), this.removeStyle('bss-MultipleHeader_Referred'), this.swipeDelete.enable(), this.betReference && (this.bottomSection.removeChild(this.betReference), this.betReference = null, this.removeStyle('bss-MultipleHeader_HasBetRef')), this.checkboxHidden && this.eachWayCheckbox && (h.ShowElementTransition(this.eachWayCheckbox), this.checkboxHidden = !1), this.eachWayCheckbox && this.eachWayCheckbox.enableCheckbox(), this.stakeBox && this.stakeBox.revertReceiptStakeBox(), this.referralInfoContainer && (this.referralInfoContainer.removeAllChildren(), this.wrapper.removeChild(this.referralInfoContainer), this.referralInfoContainer.suspendElementFromDom()), this.removeStyle('bss-MultipleHeader-reciept'), this.isHidden && (h.ShowElementTransition(this), this.isHidden = !1);
        }
        stakeChanged(e) {
            0 < +e && this.validateMinStakes(e), this.swipeDelete.reset(), this.referralInfoContainer && (this.wrapper.removeChild(this.referralInfoContainer), this.referralInfoContainer = null);
            var t, s, i, a, l = +y.RoundDown(_.StringToInteger(e) * this.model.getEachwayBetCount());
            0 < this.model.getReferralAmount() && 0 < l && 0 == this.model.getReferralPlaceAmount() ? (this.referralMessageContainer.removeAllChildren(), this.wrapper.addStyle('bss-MultipleHeader_ContentWrapper-maxstake'), (s = new c()).addStyle('bss-MultipleHeader_Referred-wrapper'), this.referralMessageContainer.appendChild(s), t = p.GetTranslation('MaxBetFullReferral'), (a = new u('span')).addStyle('bss-MultipleHeader_Referred-text'), a.setText(t), s.appendChild(a), this.addStyle('bss-MultipleHeader-referral'), this.referralMessageContainer.unsuspendElementFromDom()) : 0 < this.model.getReferralAmount() && l > this.model.getReferralPlaceAmount() ? (t = y.Round(l - this.model.getReferralPlaceAmount()), this.referralMessageContainer.removeAllChildren(), this.wrapper.addStyle('bss-MultipleHeader_ContentWrapper-maxstake'), (s = new c()).addStyle('bss-MultipleHeader_Referred-wrapper'), this.referralMessageContainer.appendChild(s), a = p.GetTranslation('referralPlaceNow').replace('{0}|', '{0} '), l = p.GetTranslation('MaxBetReferralApprovalItemBody').replace('{0}|', '{0} '), (i = new u('span')).addStyle('bss-MultipleHeader_Referred-text'), i.setText(a.replace('{0}', C.ApplyCurrencySymbol(C.ApplyDelimiterAndGroupSeparator(this.model.getReferralPlaceAmount() + '')))), s.appendChild(i), (a = new u('span')).addStyle('bss-MultipleHeader_Referred-text'), a.setText(l.replace('{0}', C.ApplyCurrencySymbol(C.ApplyDelimiterAndGroupSeparator(t + '')))), s.appendChild(a), this.addStyle('bss-MultipleHeader-referral'), this.referralMessageContainer.unsuspendElementFromDom()) : (this.removeStyle('bss-MultipleHeader-referral'), this.referralMessageContainer.suspendElementFromDom()), _.StringToNumber(e) < this.model.getMaxStake() && 0 == this.model.getReferralAmount() && (this.wrapper.removeStyle('bss-MultipleHeader_ContentWrapper-maxstake'), this.stakeBox.invalidStake(!1), this.referralMessageContainer.suspendElementFromDom()), '' !== e ? ('0' != e ? (this.addStyle('bss-MultipleHeader_HasStake'), this.hasStake = !0) : (this.removeStyle('bss-MultipleHeader_HasStake'), this.hasStake = !1), this.stakeBox.updateStake(e)) : (this.removeStyle('bss-MultipleHeader_HasStake'), this.hasStake = !1, this.stakeBox.setEmpty());
        }
        betCreditsStakeChanged(e, t) {
            e ? (this.betCreditsInfo || (this.betCreditsInfo = new T(), this.betCreditsInfo.suspendElementFromDom(), this.bottomSection.appendChild(this.betCreditsInfo)), this.betCreditsInfo.setBetCreditsStake(e, t, I.USING), this.betCreditsInfoShowing || (Locator.validationManager.callLater(() => {
                h.ShowElementTransition(this.betCreditsInfo, null, 0.2);
            }), this.stakeBox.showNetReturn()), this.betCreditsInfoShowing = !0) : this.betCreditsInfo && (h.HideElementTransition(this.betCreditsInfo, !1, 0.2), this.stakeBox.showToReturn(), this.betCreditsInfoShowing = !1);
        }
        ewAvailableChanged(e, t) {
            e && !this.eachWayCheckbox ? (this.addStyle('bss-MultipleHeader_EachWay'), this.eachWayCheckbox = new i(this), this.eachWayCheckbox.addStyle('bss-MultipleHeader_EwCheckbox'), this.bottomSection.insertAfter(this.eachWayCheckbox, this.miniBetContainer), t && (this.eachWayCheckbox.setChecked(), this.stakeBox.eachwayChecked())) : !e && this.eachWayCheckbox ? (this.bottomSection.removeChild(this.eachWayCheckbox), this.eachWayCheckbox = null, this.removeStyle('bss-MultipleHeader_EachWay')) : e && (t ? (this.eachWayCheckbox.setChecked(), this.stakeBox.eachwayChecked()) : (this.eachWayCheckbox.setUnchecked(), this.stakeBox.eachwayUnchecked()));
        }
        returnValueChanged(e) {
            this.stakeBox && this.stakeBox.setReturnValue(e);
        }
        referralAmountChanged(e, t) {
            p.RequiresReferralOnBet();
        }
        referralApproved() {
            this.clearReferralMaxStakeMessage();
            let e = this.model.getReferralAmount();
            (e = 0 == e ? this.model.getTotalStake() - this.model.getReferralPlaceAmount() : e) == this.model.getTotalStake() && (e = 0), e = +y.RoundDown(e), this.showReferralInfo('accepted', e, null);
        }
        referralAIApproved(e, t) {
            this.clearReferralMaxStakeMessage(), this.showReferralInfo('aiapproved', e, t);
        }
        clearReferralMaxStakeMessage() {
            this.wrapper.removeStyle('bss-MultipleHeader_ContentWrapper-maxstake'), this.referralMessageContainer.suspendElementFromDom();
        }
        referralDeclined(e, t) {
            0 != e && (this.clearReferralMaxStakeMessage(), this.addStyle('bss-MultipleHeader_Referred'), 'fulldecline' == (t = e == t ? 'fulldecline' : 'partialdecline') && this.addStyle('bss-MultipleHeader_FullyDeclined'), this.showReferralInfo(t, e, null));
        }
        totalStakeChanged(e) {
            this.stakeBox.setTotalStakeValue(e);
        }
        setAutoVoidState(e) {
            this.autoVoidEnabled = e, this.isStateChanged = !0, this.invalidateProperties();
        }
        setAutoVoidMessage(e) {
            var t;
            e && !this.autoVoidMessage && (this.autoVoidMessage = new d(), this.autoVoidMessage.setAttribute('class', 'bss-MultipleHeader_VoidMessageWrapper'), (t = new u()).addStyle('bss-MultipleHeader_VoidMessageText'), t.setText(p.GetTranslation('voidAffectsMultiples')), this.appendChildAt(this.autoVoidMessage, 0), this.autoVoidMessage.appendChild(t)), this.autoVoidMessage && (e && this.autoVoidEnabled ? h.ShowElementTransition(this.autoVoidMessage) : h.HideElementTransition(this.autoVoidMessage));
        }
        stakeBoxStakeEntered(e) {
            this.validateMinStakes(e), this.model.stakeEntered(e);
        }
        validateMinStakes(e) {
            var t = w.GetMinimumUnitStake(), e = _.StringToNumber(e);
            0 != e && e < t ? (this.model.updateMinStakeInput(), this.stakeBox.invalidStake(!0)) : (this.model.setAboveMinStake(e), this.stakeBox.invalidStake(!1));
        }
        stakeBoxShowKeypad() {
            e.ShowKeypad(this.underWrapper, this.stakeBox, '' + this.model.key(), 'bss-Keypad');
        }
        restoreKeypad() {
            e.ShowKeypad(this.underWrapper, this.stakeBox, '' + this.model.key(), 'bss-Keypad');
        }
        eachwayCheckboxChecked() {
            this.stakeBox.eachwayChecked(), this.model.eachwayChecked();
        }
        eachwayCheckboxUnchecked() {
            this.stakeBox.eachwayUnchecked(), this.model.eachwayUnchecked();
        }
        showReferralInfo(e, t, s) {
            this.referralInfoContainer ? this.referralInfoContainer.removeAllChildren() : (this.referralInfoContainer = new d(), this.referralInfoContainer.setAttribute('class', 'bss-MultipleHeader_ReferralInfo'), this.wrapper.appendChild(this.referralInfoContainer)), this.referralInfoContainer.appendChild(this.getReferralInfo(e, t, s));
        }
        getReferralInfo(e, t, s) {
            e = new o(e, t, s);
            return e.defaultStyle = 'bss-ReferralInfo', e;
        }
        enableBetBreakdown() {
            this.titleLabel.addStyle('bss-MultipleHeader_Title-bet-breakdown'), this.titleLabel.clickHandler = () => {
                this.delegate.multipleHeaderDisableSlip(), this.model.getBetBreakdown((e, t, s, i) => {
                    null != i && (e = localeLib('BetslipStandardUILib').createBetBrakdown(e, t, s, i, this, p.RequiresTaxMessage(), () => this.delegate.multipleHeaderEnableSlip()) || new m(e, t, s, i, this, p.RequiresTaxMessage(), () => this.delegate.multipleHeaderEnableSlip()), g.AddModal(e));
                });
            };
        }
        hideReferralMessage() {
            this.setReferralMaxStakeMessage(0), this.referralInfoContainer && (this.referralInfoContainer.removeAllChildren(), this.wrapper.removeChild(this.referralInfoContainer), this.referralInfoContainer.suspendElementFromDom()), this.model.setBetResult(b.success);
        }
        disableBetBreakdown() {
            this.titleLabel.removeStyle('bss-MultipleHeader_Title-bet-breakdown'), this.titleLabel.clickHandler = null;
        }
        switchToCondensedView() {
            this.swipeDelete.enable(), this.offerBadgesContainer && this.offerBadgesContainer.showOfferBadge(), this.isExpandedState = !1, this.touchContainer.removeStyle('bss-MultipleHeader_Content-expanded'), this.referralMessageContainer && this.referralMessageContainer.addStyle('bss-MultipleHeader_Referred-hide'), this.isStateChanged = !0, this.invalidateProperties();
        }
        switchToExpandedView() {
            this.swipeDelete.reset(), this.swipeDelete.disable(), this.offerBadgesContainer && this.offerBadgesContainer.hideOfferBadge(), this.isExpandedState = !0, this.touchContainer.addStyle('bss-MultipleHeader_Content-expanded'), this.referralMessageContainer && this.referralMessageContainer.removeStyle('bss-MultipleHeader_Referred-hide'), this.isStateChanged = !0, this.invalidateProperties();
        }
        createFreeBetBadges(e) {
            e && (this.bonusBetContainer && this.bonusBetContainer.removeAllChildren(), this.bonusBetContainer || (this.bonusBetContainer = new c(), this.bonusBetContainer.addStyle('bsc-MultipleHeader_BonusBetContainer'), this.additionalComponentsContainer.appendChild(this.bonusBetContainer)));
        }
        createMiniBets(e) {
            for (var t of e)
                this.insertMiniBet(t);
        }
        insertMiniBet(e) {
            this.miniBetContainer.miniBetItemAdd(e);
        }
        betBreakdownGetTranslation(e) {
            return p.GetTranslation(e);
        }
        deleteContainerClickHandler() {
            this.swipeDelete.singleClick(!0);
        }
        deleteButtonDeleteBet() {
            this.delegate.multipleHeaderRemoveButtonClicked();
        }
        deleteBet() {
            this.delegate.multipleHeaderRemoveButtonClicked();
        }
        key() {
            return '';
        }
        otherMultiplesButtonClicked() {
            this.delegate.multipleHeaderOtherMultiplesButtonClicked();
        }
        betItemOddsChanged() {
            this.oddsAvailable && (this.addStyle('bsc-MultipleHeader_OddsChanged'), this.oddsLabel.setOddsChanged());
        }
        betItemHandicapChanged() {
            this.oddsAvailable && (this.addStyle('bsc-MultipleHeader_HandicapChanged'), this.oddsLabel.setOddsChanged());
        }
        betItemSuspended() {
            this.addStyle('bsc-MultipleHeader_Suspended'), this.oddsAvailable && this.addStyle('bsc-MultipleHeader_OddsChanged');
        }
        betItemUnSuspended() {
            this.removeStyle('bsc-MultipleHeader_Suspended'), this.oddsAvailable && this.removeStyle('bsc-MultipleHeader_OddsChanged');
        }
        appendOfferBadges(e) {
            this.offerBadgesContainer && (this.additionalComponentsContainer.removeChild(this.offerBadgesContainer), this.offerBadgesContainer = null), 0 < e.length ? (this.addStyle('bss-MultipleHeader_HasOfferBadges'), this.offerBadgesContainer && this.additionalComponentsContainer.removeChild(this.offerBadgesContainer), this.offerBadgesContainer = new t(e), this.isExpandedState ? this.offerBadgesContainer.hideOfferBadge() : this.offerBadgesContainer.showOfferBadge(), this.additionalComponentsContainer.appendChild(this.offerBadgesContainer)) : this.removeStyle('bss-MultipleHeader_HasOfferBadges');
        }
        getStakeTaxUser() {
            return this.model.getStakeTaxUser();
        }
        getStakeTaxCovered() {
            return this.model.getStakeTaxCovered();
        }
        getBetModel() {
            return this.model;
        }
        dispose() {
            this.miniBetContainer.dispose(), this.swipeDeleteAccessibilityDelegate && (this.swipeDeleteAccessibilityDelegate.dispose(), this.swipeDeleteAccessibilityDelegate = null);
        }
        static MakeAccessible(e) {
            e.swipeDeleteAccessibilityDelegate = new A(e.deleteButton, e.touchContainer, e), e.swipeDeleteAccessibilityDelegate.makeAccessible();
        }
    };
    H.MULTIPLIER_SUFFIX = 'x', H = a = __decorate([AccessibilityDelegate(H)], H), l.MultipleHeader = H;
})(ns_betslipstandarduilib_ui_bet_standard = ns_betslipstandarduilib_ui_bet_standard || {}), (e => {
    var t = ns_gen5_ui.Label;
    class s extends t {
        constructor(e, t) {
            super(), this.model = e, this.delegate = t, this.description = '', this.handicap = '', this.excluded = !1;
        }
        createChildren() {
            super.createChildren(), this.addStyle('bsc-MiniBetItem'), this.model.addMiniBetDelegate(this);
        }
        betSlipDisplayChanged(e) {
            this.description = e, this._text = this.formatDescription(), this._textChanged = !0, this.invalidateProperties();
        }
        miniBetHandicapChanged(e) {
            this.handicap = e = e && '' !== e ? ' ' + e : e, this._text = this.formatDescription(), this._textChanged = !0, this.invalidateProperties();
        }
        updateExcludedState(e) {
            (this.excluded = e) ? this.suspendElementFromDom() : this.unsuspendElementFromDom();
        }
        getExcludedState() {
            return this.excluded;
        }
        suspend() {
            this.addStyle('bsc-MiniBetItem-suspend');
        }
        unsuspend() {
            this.removeStyle('bsc-MiniBetItem-suspend');
        }
        slipResultChanged(e) {
        }
        removeBet() {
            this.delegate.miniBetItemRemove(this), this.model.removeMiniBetDelegate(this), this.parent.removeChild(this);
        }
        dispose() {
            this.model.removeMiniBetDelegate(this), this.delegate = null;
        }
        formatDescription() {
            return this.handicap && -1 === this.description.indexOf(this.handicap) ? '' + this.description + this.handicap : this.description;
        }
        addLast() {
            this.addStyle('bsc-MiniBetItem_Last');
        }
        hasLast() {
            return this.hasStyle('bsc-MiniBetItem_Last');
        }
        removeLast() {
            this.removeStyle('bsc-MiniBetItem_Last');
        }
    }
    e.MiniBetItem = s;
})(ns_betslipstandarduilib_ui_bet_standard = ns_betslipstandarduilib_ui_bet_standard || {}), (e => {
    var t = ns_gen5_ui.Label, s = ns_gen5_ui.Component, d = ns_postbootlib_util.OfferBadgesUtil, o = ns_betslipstandarduilib_ui_offerbadges.OfferBadgesBetBuilderContainer, i = ns_gen5_util.PromotionalFilter, a = ns_betslipstandarduilib_ui_bet_standard.RemoveButton;
    class l extends s {
        constructor(e) {
            super(), this.model = e;
        }
        createChildren() {
            this.addStyle('bss-BetBuilderParticipant'), this.sentenceLabel = new t(), this.sentenceLabel.addStyle('bss-BetBuilderParticipant_Sentence'), this.appendChild(this.sentenceLabel);
            var e = new a(this), e = (e.addStyle('bss-BetBuilderParticipant_Remove'), this.sentenceLabel.appendChild(e), new s());
            e.addStyle('bss-BetBuilderParticipant_Dot'), this.sentenceLabel.appendChild(e), this.marketLabel = new t(), this.marketLabel.addStyle('bss-BetBuilderParticipant_Market'), this.appendChild(this.marketLabel);
        }
        removeButtonClickHandler() {
            this.deleteParticipant();
        }
        deleteParticipant() {
            this.model.removeParticipant();
        }
        betslipDisplayChanged(e) {
            this.sentenceLabel.setText(e), this.model.betslipDisplayChanged(e);
        }
        betslipOfferBadgesChanged(e) {
            !d.BypassNoOffersCheck() && (i.IsExcludedFromPromotion(l.NEW_CUSTOMER_ID) || i.IsExcludedFromOffers(l.NEW_CUSTOMER_ID)) || d.Initialise(() => {
                this.appendOfferBadges(e);
            });
        }
        appendOfferBadges(e) {
            var t, s = [];
            if (0 !== (e = d.GetLocaleOffersForBetslip(e)).length)
                for (var i of e)
                    !(d.IsEarlyPayout(i.oc) || d.IsSubOn(i.oc) || d.IsBoreDraw(i.oc) || d.IsExtraChance(i.oc)) || d.IsAccumulator(i.oc) || s.push(i);
            var a, l = [];
            for (a of s)
                l.push({
                    offerCode: a.oc,
                    offerText: d.GetBadgeTranslation(a.oc),
                    offerTextMini: '',
                    offerCodesTermsList: this.getCodeTermsList(e, a),
                    offerType: a.ot
                });
            var n = this.filterOfferCodes(l);
            if (0 < n.length) {
                this.offerBadgesBetBuilderContainer && (this.marketLabel.removeChild(this.offerBadgesBetBuilderContainer), this.offerBadgesBetBuilderContainer) && null != (t = this.offerBadgesBetBuilderContainer.parent) && t.removeChild(this.offerBadgesBetBuilderContainer), this.offerBadgesBetBuilderContainer = new o(n);
                for (var r of n) {
                    r = r.offerCode;
                    (d.IsSubOn(r) ? this.sentenceLabel : this.marketLabel).appendChild(this.offerBadgesBetBuilderContainer);
                }
            }
        }
        getCodeTermsList(e, t) {
            var s, i = [];
            for (s of e)
                s.ot === t.ot && i.indexOf(s.oc) < 0 && i.push(s.oc);
            return i;
        }
        filterOfferCodes(e) {
            var t, s = {};
            for (t of e)
                s[t.offerCode] = t;
            var i, a = [];
            for (i in s)
                a.push(s[i]);
            return a;
        }
        marketDescriptionChanged(e) {
            this.marketLabel.setText(e);
        }
        betslipDisplayHandicapChanged(e, t) {
            t ? (this.sentenceLabel.setText(e), this.sentenceLabel.addStyle('bss-BetBuilderParticipant_Sentence-HandicapChanged')) : this.sentenceLabel.removeStyle('bss-BetBuilderParticipant_Sentence-HandicapChanged');
        }
    }
    l.NEW_CUSTOMER_ID = '2', e.BetBuilderParticipant = l;
})(ns_betslipstandarduilib_ui_participant = ns_betslipstandarduilib_ui_participant || {}), (e => {
    var i = ns_gen5_ui.Component, l = ns_betslipstandarduilib_ui_util.StandardLocaleHelper, n = ns_gen5_ui.Label, t = ns_betslipuilib_ui_bet_keypad.Controller, s = ns_betslipuilib_ui_bet.StakeBox, a = ns_betslipuilib_ui_bet.DeleteButton, r = ns_betslipuilib_ui_bet.OddsLabel, d = ns_betslipuilib_ui_bet.SwipeDelete, o = ns_betslipstandarduilib_ui_participant.BetBuilderParticipant, h = ns_betslipuilib_util.TransitionHelper, p = ns_betslipcorelib_constants.BetSlipResult, c = ns_betslipstandarduilib_ui_bet_controls_common.BetBuilderLogo, u = ns_betslipuilib_ui_bet.ReferralInfo, b = ns_gen5_util.CurrencyFormatter, m = ns_postbootlib_util.OfferBadgesUtil, g = ns_gen5_util.MathUtil, C = ns_betslipstandarduilib_ui_bet.PlayerVoidSentence, S = ns_gen5_util.Delegate, f = ns_betslipstandarduilib_events.PlayerVoidEvent, B = ns_betslipstandardlib_enum.BetBoostType, _ = ns_betslipuilib_ui_bet.BetCreditsInfo, y = ns_betslipuilib_util.BetCreditsMessageKey, x = ns_betslipuilib_accessibility.SwipeDeleteButtonAccessibilityDelegate, k = ns_accessibilityuilib_ui.ButtonAccessibilityDelegate, M = e.RemoveButton, v = ns_betcalculationslib_rounding.RoundingHelper, w = ns_gen5_ui.TextNode, T = ns_betslipofferslib.BetslipOffersLib, I = ns_betslipreactlib_context.BetslipBetStakeContextManager, E = ns_betslipreactlib_context.OddsContextManager, A = ns_betslipreactlib_context.BetslipBetReturnsContextManager, D = ns_gen5_util.PromotionalFilter, R = ns_betslipuilib_ui_bet.BetComponent, O = ns_betslipcorelib_util.StorageHelper, H = ns_betslipofferslib.BetslipOffersContextManager;
    let L = class extends R {
        constructor(e, t) {
            super(), this.betslipComponentDelegate = t, this.playerVoidSentence = null, this.hasStake = !1, this.isHidden = !1, this.betCreditsInfoShowing = !1, this.isSuperBoost = !1, this.model = e;
        }
        createChildren() {
            this.autoVoidChangedDelegate = new S(this, this.setAutoVoidSelected), this.addEventListener(f.PLAYER_VOID_CHANGED, this.autoVoidChangedDelegate), (this.deleteContainer = this).deleteButton = new a(this), this.content = this.touchContainer = new i(), this.content.addStyle('bss-BetBuilderBetItem_Content'), this.appendChild(this.content), this.deleteContainer.appendChild(this.deleteButton), this.addStyle('bss-BetBuilderBetItem'), this.topSection = new i(), this.topSection.addStyle('bss-BetBuilderBetItem_TopSection'), this.content.appendChild(this.topSection), this.titleWrapper = new i(), this.titleWrapper.addStyle('bss-BetBuilderBetItem_Titlewrapper'), this.topSection.appendChild(this.titleWrapper);
            var e = new n(), e = (e.addStyle('bss-BetBuilderBetItem_LogoWrapper'), this.titleWrapper.appendChildAt(e, 0), this.bbLogo = new c(!1), e.appendChild(this.bbLogo), this.oddsContainerCondensed = new i(), this.oddsContainerCondensed.addStyle('bss-BetBuilderBetItem_OddsContainerCondensed'), e.appendChild(this.oddsContainerCondensed), this.oddsLabelCondensed = new r(), this.oddsLabelCondensed.showSPText = !1, this.oddsLabelCondensed.addStyle('bss-BetBuilderBetItem_OddsLabel'), this.oddsContainerCondensed.appendChild(this.oddsLabelCondensed), this.betWrapper = new i(), this.betWrapper.addStyle('bss-BetBuilderBetItem_Betwrapper'), this.topSection.appendChild(this.betWrapper), new i()), t = (e.addStyle('bss-BetBuilderBetItem_FixtureWrapper'), this.betWrapper.appendChild(e), this.fixtureLabel = new n()), t = (t.addStyle('bss-BetBuilderBetItem_FixtureDescription'), e.appendChild(t), new i()), t = (t.addStyle('bss-BetBuilderBetItem_OddsContainer'), e.appendChild(t), this.oddsLabel = new r(), this.oddsLabel.addStyle('bss-BetBuilderBetItem_Odds'), t.appendChild(this.oddsLabel), this.stakeBox = this.createStakeBox(), e.appendChild(this.stakeBox), this.miniBetContainer = new i(), this.miniBetContainer.addStyle('bss-BetBuilderBetItem_MiniBetContainer'), this.betWrapper.appendChildAt(this.miniBetContainer, 0), this.removeButton = new M(this), this.removeButton.addStyle('bss-BetBuilderBetItem_Remove'), this.content.appendChild(this.removeButton), this.topSectionWrapper = new i(), this.topSectionWrapper.addStyle('bss-BetBuilderBetItem_TopSectionWrapper'), this.topSectionWrapper.appendChild(this.topSection), this.touchContainer.appendChildAt(this.topSectionWrapper, 2), this.showOptionsButton = new i());
            t.addStyle('bss-BetBuilderBetItem_ShowOption'), this.topSectionWrapper.appendChild(t), this.maxStakeMessageContainer = new i(), this.maxStakeMessageContainer.addStyle('bss-BetBuilderBetItem_MessageContainer'), this.appendChild(this.maxStakeMessageContainer), this.maxStakeMessageBody = new n(), this.maxStakeMessageBody.addStyle('bss-BetBuilderBetItem_MessageBody'), this.maxStakeMessageContainer.appendChild(this.maxStakeMessageBody), this.maxStakeMessageContainer.suspendElementFromDom(), this.referralMessageContainer = new i(), this.referralMessageContainer.addStyle('bss-BetBuilderBetItem_Referred'), this.appendChild(this.referralMessageContainer), this.referralMessageContainer.suspendElementFromDom(), this.additionalComponentsContainer = new i(), this.additionalComponentsContainer.addStyle('bss-BetBuilderBetItem_AdditionalComponents'), this.content.appendChild(this.additionalComponentsContainer), this.participantContainer = new i(), this.participantContainer.addStyle('bss-BetBuilderBetItem_ParticipantContainer'), this.content.appendChild(this.participantContainer), this.participantWrapper = new i(), this.participantWrapper.addStyle('bss-BetBuilderBetItem_ParticipantContainerWrapper'), this.participantContainer.appendChild(this.participantWrapper), m.Initialise(() => {
                0 < this.model.getRewardsCount() && this.appendReactOffersContainer();
            }), this.swipeDelete = new d(this);
        }
        createStakeBox() {
            return localeLib('BetslipStandardUILib').createBetItemStakeBox(this, 'bss-StakeBox') || new s(this, 'bss-StakeBox');
        }
        createMiniBet(e) {
            var t;
            this.miniBet || (this.miniBet = new n(), this.miniBetContainer.appendChild(this.miniBet), this.miniBet.addStyle('bss-BetBuilderBetItem_MiniBet'), t = new n(), this.miniBetContainer.appendChild(t), t.addStyle('bss-BetBuilderBetItem_MiniBetMoreSelections'), this.moreTextnode = new w('+' + (this.model.participants.length - 1)), t.appendChild(this.moreTextnode)), this.miniBet.setText(e.get('bd'));
        }
        clickHandler() {
            !1 === H.getIsMultipleOffersContainerExpanded() ? this.isSuspended || this.betslipComponentDelegate.betBuilderBetItemShowOptions() : H.setIsMultipleOffersContainerExpanded(!1);
        }
        removeButtonClickHandler() {
            var e = this.getElement(), t = this.getElement().getBoundingClientRect();
            e.style.height = t.height + 'px', Locator.validationManager.callNewContext(() => {
                this.addStyle('bss-BetBuilderBetItem_Removing'), this.model.removeBet(), BetSlipLocator.betSlipManager.removingBetsFromCloseButton();
            });
        }
        appendPlayerVoidsSentence(e) {
            this.playerVoidSentence || (this.playerVoidSentence = new C(!1, e), this.content.appendChild(this.playerVoidSentence), this.addStyle('bss-BetBuilderBetItem_HasPlayerVoid'));
        }
        updatePlayerVoidsSentence() {
            this.playerVoidSentence && this.playerVoidSentence.updateState(this.model.getAutoVoidAvailable());
        }
        updatePlayerBuilderState() {
        }
        placeMultipliersUpdated() {
        }
        classificationChanged() {
            var e = this.model.getClassificationId();
            2 === e || 73 === e || 4 === e ? (this.horseNonRunnerSentence || (this.horseNonRunnerSentence = new n('div'), this.horseNonRunnerSentence.addStyle('bss-BetBuilderBetItem_NonRunnerLabel'), this.horseNonRunnerSentence.setText(l.GetTranslation('NonRunnerText')), this.appendChild(this.horseNonRunnerSentence)), this.bbLogo.setRacingLogo()) : this.bbLogo.resetLogoState(this.model.getPlayerBuilder());
        }
        disableSwipe() {
            this.swipeDelete.disable(), this.swipeDelete.reset();
        }
        enableSwipe() {
            this.swipeDelete.enable();
        }
        betBoostAvailable(e) {
            this.addStyle('bss-BetBuilderBetItem_BetBoosted'), e !== B.BetBuilderSuperBoost && e !== B.BetBuilderPopularSuperBoost && e !== B.InPlaySuperBoostBetBuilder && e !== B.InPlaySuperBoostBetBuilderHomepage || (this.isSuperBoost = !0, this.addStyle('bss-BetBuilderBetItem_BetBoosted-super'));
        }
        setupBetBoostedOdds(e, t, s, i) {
            this.oddsLabel.setBoostedOdds(e, t, s, this.isSuperBoost), this.oddsLabelCondensed.setBoostedOdds(e, t, s, this.isSuperBoost), i && (this.boostedOddsChanged(), this.betslipComponentDelegate.normalBetItemOddsChanged());
        }
        participantInserted(e) {
            var t = new o(e);
            this.participantModel = e, this.participantModel.setUIDelegate(t), this.participantModel.setPlayerVoidDelegate(this), this.participantWrapper.appendChild(t), this.createMiniBet(this.participantModel);
        }
        requestingBetBuilderPrice() {
        }
        refershSlip() {
            this.betslipComponentDelegate.betBuilderBetItemRefreshSlip();
        }
        oddsChanged(e, t) {
            this.oddsLabel.setOdds(e), this.oddsLabelCondensed.setOdds(e), t && this.boostedOddsChanged();
        }
        boostedOddsChanged() {
            this.oddsLabel.setOddsChanged(), this.oddsLabelCondensed.setOddsChanged();
        }
        suspend() {
            this.isSuspended = !0, this.addStyle('bss-BetBuilderBetItem_Suspended');
        }
        unsuspend() {
            this.isSuspended = !1, this.removeStyle('bss-BetBuilderBetItem_Suspended');
        }
        fixtureDescriptionChanged(e) {
            this.fixtureLabel.setText(e);
        }
        changesAccepted() {
            this.oddsLabel && this.oddsLabel.acceptOddsChange(), this.oddsLabelCondensed && this.oddsLabelCondensed.acceptOddsChange();
        }
        changeMinimumStakeAccepted() {
            this.stakeBox.invalidStake(!1);
        }
        returnValueChanged(e) {
            this.stakeBox.setReturnValue(e);
        }
        boostValueChanged(e, t) {
            this.returnsContextManager && this.returnsContextManager.setContextValue({ boostAmount: t || e }), this.stakeBox.setWinningBoostValue(e, t);
        }
        totalStakeChanged(e) {
            this.stakeBox.setTotalStakeValue(e);
        }
        deleteButtonDeleteBet() {
            this.deleteBet();
        }
        deleteBet(t = !0) {
            let s = this.getElement();
            var e = this.getElement().getBoundingClientRect(), e = (s.style.height = e.height + 'px', 0 === e.height);
            this.addStyle('bss-BetBuilderBetItem_Removing'), t && !e || (this.model.removeBet(), this.swipeDelete.dispose()), Locator.validationManager.callNewContext(() => {
                if (s.style.height = '0', null != TRANSITION_END) {
                    let e = () => {
                        this.addStyle('bss-BetBuilderBetItem_Removed'), s.removeEventListener(TRANSITION_END, e), t && (this.model.removeBet(), this.swipeDelete.dispose());
                    };
                    s.addEventListener(TRANSITION_END, e);
                }
            });
        }
        disableStakeBox() {
            this.stakeBox.disable();
        }
        enableStakeBox() {
            this.stakeBox.enable(0 === this.model.getStake());
        }
        slipResultChanged(e) {
            switch (e) {
            case p.stakeAboveMaximum:
            case p.stakeBelowMinimum:
            case p.userDailyStakeLimitExceeded:
                this.stakeBox.invalidStake(!0);
                break;
            case p.oddsBelowMinimum:
                this.stakeBox.addStyle('bss-BetBuilderBetItem_HideStakeBox');
                break;
            default:
                this.stakeBox.invalidStake(!1);
            }
            this.setReferralMaxStakeMessage(e);
        }
        setReferralMaxStakeMessage(e) {
            if (e === p.success)
                this.touchContainer.removeStyle('bss-BetBuilderBetItem_ContentWrapper-maxstake'), this.maxStakeMessageContainer.suspendElementFromDom(), this.referralMessageContainer.suspendElementFromDom();
            else if (0 < this.model.getReferralAmount() && 0 === this.model.getMaxStake()) {
                this.referralMessageContainer.removeAllChildren(), this.touchContainer.addStyle('bss-BetBuilderBetItem_ContentWrapper-maxstake');
                var t = l.GetTranslation('MaxBetFullReferral'), s = new n('span');
                s.addStyle('bss-BetBuilderBetItem_Referred-text'), s.setText(t), this.referralMessageContainer.appendChild(s), this.referralMessageContainer.unsuspendElementFromDom(), this.maxStakeMessageContainer.suspendElementFromDom();
            } else if (0 < this.model.getReferralAmount()) {
                this.referralMessageContainer.removeAllChildren(), this.touchContainer.addStyle('bss-BetBuilderBetItem_ContentWrapper-maxstake');
                var t = l.GetTranslation('referralPlaceNow').replace('{0}|', '{0} '), s = l.GetTranslation('MaxBetReferralApprovalItemBody').replace('{0}|', '{0} '), i = new n('span'), t = (i.addStyle('bss-BetBuilderBetItem_Referred-text'), i.setText(t.replace('{0}', b.ApplyCurrencySymbol(b.ApplyDelimiterAndGroupSeparator(this.model.getMaxStake() + '')))), this.referralMessageContainer.appendChild(i), new n('span'));
                t.addStyle('bss-BetBuilderBetItem_Referred-text'), t.setText(s.replace('{0}', b.ApplyCurrencySymbol(b.ApplyDelimiterAndGroupSeparator(this.model.getReferralAmount() + '')))), this.referralMessageContainer.appendChild(t), this.addStyle('bss-BetBuilderBetItem-referral'), this.referralMessageContainer.unsuspendElementFromDom(), this.maxStakeMessageContainer.suspendElementFromDom();
            } else if (e == p.stakeAboveMaximum) {
                this.touchContainer.addStyle('bss-BetBuilderBetItem_ContentWrapper-maxstake');
                i = l.GetTranslation('MaxBetItemBody');
                let e = this.getMaxStake();
                isNaN(e) && (e = 0), this.maxStakeMessageBody.setText(i.replace('{0}', b.ApplyCurrencySymbol(b.ApplyDelimiterAndGroupSeparator(e + '')))), this.maxStakeMessageContainer.unsuspendElementFromDom();
            } else
                this.touchContainer.removeStyle('bss-BetBuilderBetItem_ContentWrapper-maxstake'), this.maxStakeMessageContainer.suspendElementFromDom(), this.referralMessageContainer.suspendElementFromDom();
        }
        resetUI() {
            this.swipeDelete.reset();
        }
        key() {
            return this.model.key();
        }
        betRemoved() {
            this.stakeBox.dispose(), this.betslipComponentDelegate.betBuilderBetItemBetRemoved(this), this.mountedReactComponent && (this.mountedReactComponent.dispose(), this.mountedReactComponent = null);
        }
        setStateForReceipt(e, t = !1) {
            this.swipeDelete.disable(), !this.model.shouldExcludeFromReceipt() && (this.hasStake || e) || (h.HideElementTransition(this), this.isHidden = !0), this.betCreditsInfo && this.betCreditsInfo.setMessageForReceipt(), this.stakeBox && this.stakeBox.setStakeBoxForReceipt(), t || this.setReferralMaxStakeMessage(0);
        }
        revertReceiptState() {
            this.swipeDelete.enable(), this.betReference && (this.additionalComponentsContainer.removeChild(this.betReference), this.betReference = null), this.stakeBox && (this.model.isSinglesRestricted() || this.stakeBox.enable(), this.stakeBox.revertReceiptStakeBox()), this.isHidden && (h.ShowElementTransition(this), this.isHidden = !1);
        }
        referralAmountChanged(e, t) {
            l.RequiresReferralOnBet();
        }
        referralApproved() {
            var e = +v.RoundDown(this.model.getStake() - this.model.getReferralPlaceAmount());
            this.showReferralInfo('accepted', e, null);
        }
        referralDeclined(e, t) {
            this.referralInfo && (this.additionalComponentsContainer.removeChild(this.referralInfo), this.removeChild(this.referralInfo)), this.referralInfo = new u(e == t ? 'fulldecline' : 'partialdecline', e, null), this.referralInfo.defaultStyle = 'bss-ReferralInfo', this.additionalComponentsContainer.appendChild(this.referralInfo);
        }
        referralAIApproved(e, t) {
            this.showReferralInfo('aiapproved', e, t);
        }
        showReferralInfo(e, t, s) {
            this.referralInfo && (this.additionalComponentsContainer.removeChild(this.referralInfo), this.removeChild(this.referralInfo)), this.maxStakeMessageContainer.suspendElementFromDom(), this.referralMessageContainer.suspendElementFromDom(), this.referralInfo = this.getReferralInfo(e, t, s), this.appendChild(this.referralInfo);
        }
        getReferralInfo(e, t, s) {
            e = new u(e, t, s);
            return e.defaultStyle = 'bss-ReferralInfo', e;
        }
        betReferenceChanged(e) {
            l.RequiresReferenceOnBetItem() && e && (this.betReference || (this.betReference = new n(), this.betReference.addStyle('bss-BetBuilderBetItem_BetRef')), e = l.GetTranslation('ref') + ': ' + e, this.betReference.setText(e), this.additionalComponentsContainer.appendChild(this.betReference));
        }
        getMinStake() {
            return this.model.getMinStake();
        }
        getMaxStake() {
            return this.model.getMaxStake();
        }
        stakeBoxStakeEntered(e) {
            this.model.stakeEntered(e);
        }
        stakeChanged(e) {
            var t, s, i, a;
            this.referralInfo && (this.additionalComponentsContainer.removeChild(this.referralInfo), this.removeChild(this.referralInfo), this.referralInfo = null), 0 < this.model.getReferralAmount() && 0 < g.StringToInteger(e) && 0 == this.model.getMaxStake() ? (this.referralMessageContainer.removeAllChildren(), this.touchContainer.addStyle('bss-BetBuilderBetItem_ContentWrapper-maxstake'), t = l.GetTranslation('MaxBetFullReferral'), (a = new n('span')).addStyle('bss-BetBuilderBetItem_Referred-text'), a.setText(t), this.referralMessageContainer.appendChild(a), this.addStyle('bss-BetBuilderBetItem-referral'), this.referralMessageContainer.unsuspendElementFromDom()) : 0 < this.model.getReferralAmount() && g.StringToInteger(e) > this.model.getMaxStake() ? (t = (g.StringToInteger(e) - this.model.getMaxStake()).toFixed(2), this.referralMessageContainer.removeAllChildren(), this.touchContainer.addStyle('bss-BetBuilderBetItem_ContentWrapper-maxstake'), a = l.GetTranslation('referralPlaceNow').replace('{0}|', '{0} '), s = l.GetTranslation('MaxBetReferralApprovalItemBody').replace('{0}|', '{0} '), (i = new n('span')).addStyle('bss-BetBuilderBetItem_Referred-text'), i.setText(a.replace('{0}', b.ApplyCurrencySymbol(b.ApplyDelimiterAndGroupSeparator(this.model.getMaxStake() + '')))), this.referralMessageContainer.appendChild(i), (a = new n('span')).addStyle('bss-BetBuilderBetItem_Referred-text'), a.setText(s.replace('{0}', b.ApplyCurrencySymbol(b.ApplyDelimiterAndGroupSeparator(t + '')))), this.referralMessageContainer.appendChild(a), this.addStyle('bss-BetBuilderBetItem-referral'), this.referralMessageContainer.unsuspendElementFromDom()) : (this.removeStyle('bss-BetBuilderBetItem-referral'), this.referralMessageContainer.suspendElementFromDom()), (g.StringToNumber(e) < this.model.getMaxStake() || 0 < this.model.getReferralAmount()) && (this.touchContainer.removeStyle('bss-BetBuilderBetItem_ContentWrapper-maxstake'), this.stakeBox.invalidStake(!1), this.maxStakeMessageContainer.suspendElementFromDom()), '' !== e ? (this.stakeBox.updateStake(e), '0' != e ? (this.addStyle('bss-BetBuilderBetItem_HasStake'), this.hasStake = !0) : (this.removeStyle('bss-BetBuilderBetItem_HasStake'), this.hasStake = !1)) : this.stakeBox.setEmpty(), this.stakeContextManager && this.stakeContextManager.setContextValue({
                unitStake: +e,
                totalStake: +e
            });
        }
        stakeBoxShowKeypad() {
            this.showKeypad();
        }
        showKeypad() {
            this.addStyle('bss-BetBuilderBetItem_Keypad'), t.ShowKeypad(this.topSectionWrapper, this, this.model.key(), 'bss-Keypad'), this.swipeDelete.setExcludeState(!0), this.swipeDelete.setExcludeElement(this.stakeBox.getElementContainer());
        }
        createKeyPad() {
            return localeLib('BetslipStandardUILib').createBetItemKeypad(this, 'bss-Keypad');
        }
        restoreKeypad() {
            this.showKeypad();
        }
        restoreSwipeDelete() {
            this.swipeDelete.restore();
        }
        setInprogressState(e) {
        }
        excludedBetStateUpdated() {
        }
        hideKeypad() {
            t.HideKeypad(), this.swipeDelete.setExcludeState(!1);
        }
        itemClicked(e) {
            this.swipeDelete.reset(), this.stakeBox.itemClicked(e);
        }
        doneClicked() {
            this.addStyle('bss-BetBuilderBetItem_RemovingKeypad'), this.swipeDelete.reset(), this.stakeBox.doneClicked();
        }
        deleteClicked() {
            this.swipeDelete.reset(), this.stakeBox.deleteClicked();
        }
        keypadRemoved() {
            this.swipeDelete.reset(), this.stakeBox.keypadRemoved(), this.removeStyle('bss-BetBuilderBetItem_Keypad'), this.removeStyle('bss-BetBuilderBetItem_RemovingKeypad');
        }
        betCreditsStakeChanged(e, t, s, i) {
            e ? (this.betCreditsInfo || (this.betCreditsInfo = new _(), this.betCreditsInfo.suspendElementFromDom(), this.betCreditsInfo.addStyle('bss-BetBuilderBetItem_BetCredits'), this.additionalComponentsContainer.appendChildAt(this.betCreditsInfo, 0)), this.betCreditsInfo.setBetCreditsStake(e, t, y.USING, s, i), this.betCreditsInfoShowing || (Locator.validationManager.callLater(() => {
                h.ShowElementTransition(this.betCreditsInfo, null, 0.2);
            }), this.stakeBox.showNetReturn()), this.betCreditsInfoShowing = !0) : this.betCreditsInfo && (h.HideElementTransition(this.betCreditsInfo, !1, 0.2), this.freeBetTokenSelected || this.stakeBox.showToReturn(), this.betCreditsInfoShowing = !1);
        }
        freeBetSelected() {
            this.freeBetTokenSelected = !0, this.stakeBox.showNetReturn(), t.HideKeypad();
        }
        freeBetDeselected() {
            this.freeBetTokenSelected = !1, this.stakeBox.showToReturn(), t.HideKeypad();
        }
        multiplesRestrictionChanged(e) {
            e ? this.addStyle('bss-BetBuilderBetItem_Restricted') : this.removeStyle('bss-BetBuilderBetItem_Restricted');
        }
        singlesRestrictionChanged(e) {
            e ? (this.addStyle('bss-BetBuilderBetItem_RestrictedPlacement'), this.stakeBox.disable()) : (this.removeStyle('bss-BetBuilderBetItem_RestrictedPlacement'), this.stakeBox.enable(0 === this.model.getStake()));
        }
        appendReactOffersContainer() {
            (m.BypassNoOffersCheck() || !D.IsExcludedFromPromotion('2') && !D.IsExcludedFromOffers('2')) && this.model.getRewardsCount() && m.Initialise(() => {
                this.stakeContextManager || (this.stakeContextManager = new I(), this.stakeContextManager.setContextValue({
                    unitStake: this.model.getStake(),
                    totalStake: this.model.getTotalStake()
                })), this.oddsContextManager || (this.oddsContextManager = new E(), this.oddsContextManager.setContextValue({
                    oddsFractional: this.model.getOddsFractional(),
                    oddsDecimal: this.model.getOddsDecimal()
                })), this.returnsContextManager || (this.returnsContextManager = new A(), this.returnsContextManager.setContextValue({ boostAmount: 0 })), this.mountedReactComponent || ((e = new i()).addStyle('bss-BetBuilderBetItem_ReactContainer'), this.content.appendChild(e), this.mountedReactComponent = T.AppendOffersContainer(e));
                var e = this.model.getBetModelProps(), t = this.model.getOfferModelsProps(), s = ((t.boosts.length || t.tokens.length) && this.addStyle('bss-BetBuilderBetItem-hasoffers'), O.GetCondensedSlipState());
                s && this.addStyle('bss-BetBuilderBetItem-hasoffers-condensedbetslip'), e.descriptionText = l.GetTranslation('BetBuilder'), this.mountedReactComponent.render({
                    offerContainerProps: {
                        bet: e,
                        offers: t,
                        isCondensedBetslip: s
                    },
                    betslipBetStakeContextManager: this.stakeContextManager,
                    oddsContextManager: this.oddsContextManager,
                    betslipBetReturnsContextManager: this.returnsContextManager
                });
            });
        }
        removeReactOffersContainer() {
            this.mountedReactComponent && (this.mountedReactComponent.dispose(), this.mountedReactComponent = null);
        }
        setAutoVoidSelected(e) {
            e.stopPropagation = !0, this.participantModel.setAutoVoid(e.selection);
        }
        getBetModel() {
            return this.model;
        }
        marketDescriptionChanged(e) {
        }
        betSlipDisplayChanged(e) {
            this.miniBet && this.miniBet.setText(e), this.moreTextnode.setText('+' + (this.model.participants.length - 1));
        }
        handicapChanged(e) {
        }
        forceHide() {
        }
        ewAvailableChanged() {
        }
        pitcherChanged(e, t, s) {
        }
        eachWayTermsChanged() {
        }
        forceEachWay() {
        }
        setInvalidState() {
        }
        clearInvalidState() {
        }
        dispose() {
            this.swipeDeleteAccessibilityDelegate && (this.swipeDeleteAccessibilityDelegate.dispose(), this.swipeDeleteAccessibilityDelegate = null), this.removeButton && (this.removeButton = null), this.playerVoidSentence && (this.playerVoidSentence.dispose(), this.playerVoidSentence = null), this.mountedReactComponent && (this.mountedReactComponent.dispose(), this.mountedReactComponent = null);
        }
        displayMiniOfferBadges() {
        }
        setupBetBoostedHandicap(e, t, s) {
        }
        getStakeTaxUser() {
            return this.model.getStakeTaxUser();
        }
        getStakeTaxCovered() {
            return this.model.getStakeTaxCovered();
        }
        static MakeAccessible(e) {
            e.swipeDeleteAccessibilityDelegate = new x(e.deleteButton, e.touchContainer, e), e.swipeDeleteAccessibilityDelegate.makeAccessible(), k.MakeAccessible(e.showOptionsButton);
        }
    };
    L = __decorate([AccessibilityDelegate(L)], L), e.BetBuilderBetItem = L;
})(ns_betslipstandarduilib_ui_bet_standard = ns_betslipstandarduilib_ui_bet_standard || {}), (e => {
    var a, l = ns_gen5_ui.Component, n = ns_gen5_ui.Label, s = ns_betslipuilib_ui_bet.EachWayStakeBox, t = ns_betslipuilib_ui_bet_keypad.Controller, i = ns_betslipstandarduilib_ui_bet_controls_common.EachWayCheckbox, r = ns_betslipuilib_ui_bet.OddsLabel, d = ns_betslipuilib_ui_bet_betbreakdown.BetBreakdown, o = ns_betslipuilib_ui_bet.ReferralInfo, h = ns_betslipuilib_util.TransitionHelper, p = ns_webconsolelib_util.ModalManager, c = ns_betslipstandarduilib_ui_util.StandardLocaleHelper, u = ns_gen5_ui.DomElement, b = ns_gen5_util.CurrencyFormatter, m = ns_betslipcorelib_constants.BetSlipResult, g = ns_betcalculationslib_rounding.RoundingHelper, C = ns_gen5_util.MathUtil, S = ns_betcalculationslib_util.MinimumStakes, f = ns_betslipuilib_ui_bet.BetCreditsInfo, B = ns_betslipuilib_util.BetCreditsMessageKey, _ = ns_accessibilityuilib_ui_popup.PopupButtonAccessibilityDelegate;
    let y = a = class extends l {
        constructor(e, t) {
            super(), this.delegate = t, this.stakeBoxType = s, this.checkboxHidden = !1, this.isHidden = !1, this.hasStake = !1, this.isCast = !1, this.betCreditsInfoShowing = !1, this.model = e;
        }
        createChildren() {
            this.addStyle('bss-MultipleItem'), this.wrapper = new l(), this.wrapper.addStyle('bss-MultipleItem_Wrapper'), this.appendChild(this.wrapper);
            var e = new u(), t = (e.setAttribute('class', 'bss-MultipleItem_Content'), this.wrapper.appendChild(e), this.detailsContainer = new u(), this.detailsContainer.setAttribute('class', 'bss-MultipleItem_Details'), e.appendChild(this.detailsContainer), new u()), s = (t.setAttribute('class', 'bss-MultipleItem_TopSection'), this.detailsContainer.appendChild(t), new u()), i = (s.setAttribute('class', 'bss-MultipleItem_Title'), t.appendChild(s), this.titleContainer = new u()), s = (s.appendChild(i), this.titleLabel = new n()), i = (s.addStyle('bss-MultipleItem_TitleText'), i.appendChild(s), new l());
            i.addStyle('bss-MultipleItem_OddsContainer'), t.appendChild(i), this.oddsLabel = new r(), i.appendChild(this.oddsLabel), this.oddsLabel.suspendElementFromDom(), this.createStakeBox(), e.appendChild(this.stakeBox), this.additionalComponentsContainer = new l(), this.additionalComponentsContainer.addStyle('bss-MultipleItem_AdditionalComponents'), this.wrapper.appendChild(this.additionalComponentsContainer), this.maxStakeMessageContainer = new l(), this.maxStakeMessageContainer.addStyle('bss-MultipleItem_Referred'), this.appendChild(this.maxStakeMessageContainer), this.maxStakeMessageBody = new n(), this.maxStakeMessageBody.addStyle('bss-MultipleItem_Referred-text'), this.maxStakeMessageContainer.appendChild(this.maxStakeMessageBody), this.maxStakeMessageContainer.suspendElementFromDom(), this.referralMessageContainer = new l(), this.referralMessageContainer.addStyle('bss-MultipleItem_Referred'), this.appendChild(this.referralMessageContainer), this.referralMessageContainer.suspendElementFromDom(), a.ShowPermedReturnsOnSlip && this.addStyle('bss-MultipleItem_ShowReturns');
        }
        createStakeBox() {
            var e = localeLib('BetslipStandardUILib').createBetItemEWStakeBox(this, 'bss-StakeBox');
            this.stakeBox = e || new this.stakeBoxType(this, 'bss-StakeBox');
        }
        slipResultChanged(e) {
            switch (e) {
            case m.stakeAboveMaximum:
            case m.stakeBelowMinimum:
            case m.userDailyStakeLimitExceeded:
                this.stakeBox.invalidStake(!0);
                break;
            case m.stakeAboveMinimum:
                this.stakeBox.invalidStake(!1);
            }
        }
        itemResultChanged(e) {
            this.slipResultChanged(e), this.setReferralMaxStakeMessage(e);
        }
        setReferralMaxStakeMessage(e) {
            var t, s, i;
            e !== m.stakeAboveMinimum && (e === m.success ? (this.wrapper.removeStyle('bss-MultipleItem_ContentWrapper-maxstake'), this.maxStakeMessageContainer.suspendElementFromDom(), this.referralMessageContainer.suspendElementFromDom()) : 0 < this.model.getReferralAmountApproved() || 0 < this.model.getReferralAmountApproved() ? (this.referralMessageContainer.suspendElementFromDom(), this.maxStakeMessageContainer.suspendElementFromDom(), this.wrapper.removeStyle('bss-MultipleItem_ContentWrapper-maxstake')) : 0 < this.model.getReferralAmount() && 0 === this.model.getReferralPlaceAmount() ? (this.referralMessageContainer.removeAllChildren(), this.wrapper.addStyle('bss-MultipleItem_ContentWrapper-maxstake'), s = c.GetTranslation('MaxBetFullReferral'), (t = new n('span')).addStyle('bss-MultipleItem_Referred-text'), t.setText(s), this.referralMessageContainer.appendChild(t), this.addStyle('bss-MultipleItem-referral'), this.referralMessageContainer.unsuspendElementFromDom()) : 0 < this.model.getReferralAmount() ? (this.referralMessageContainer.removeAllChildren(), this.wrapper.addStyle('bss-MultipleItem_ContentWrapper-maxstake'), s = c.GetTranslation('referralPlaceNow').replace('{0}|', '{0} '), t = c.GetTranslation('MaxBetReferralApprovalItemBody').replace('{0}|', '{0} '), (i = new n('span')).addStyle('bss-MultipleItem_Referred-text'), i.setText(s.replace('{0}', b.ApplyCurrencySymbol(b.ApplyDelimiterAndGroupSeparator(this.model.getReferralPlaceAmount() + '')))), this.referralMessageContainer.appendChild(i), (s = new n('span')).addStyle('bss-MultipleItem_Referred-text'), s.setText(t.replace('{0}', b.ApplyCurrencySymbol(b.ApplyDelimiterAndGroupSeparator(this.model.getReferralAmount() + '')))), this.referralMessageContainer.appendChild(s), this.addStyle('bss-MultipleItem-referral'), this.referralMessageContainer.unsuspendElementFromDom()) : e == m.stakeAboveMaximum && (this.referralMessageContainer.removeAllChildren(), this.wrapper.addStyle('bss-MultipleItem_ContentWrapper-maxstake'), i = c.GetTranslation('MaxBetItemBody'), this.maxStakeMessageBody.setText(i.replace('{0}', b.ApplyCurrencySymbol(b.ApplyDelimiterAndGroupSeparator(this.model.getMaxStake() + '')))), this.maxStakeMessageContainer.unsuspendElementFromDom()));
        }
        changesAccepted() {
            this.oddsLabel && this.oddsLabel.acceptOddsChange();
        }
        changeMinimumStakeAccepted() {
            this.stakeBox.invalidStake(!1);
        }
        betTypeChanged(e) {
        }
        titleUpdated(e) {
            var t;
            this.model.supportsBetBreakdown() ? (this.titleContainer.setAttribute('class', 'bss-MultipleItem_TitleContainer-bet-breakdown'), (t = this.multipleHitBox = new l()).addStyle('bss-MultipleItem_TitleHitbox'), this.titleContainer.appendChildAt(t, 0), this.titleLabel.clickHandler = () => {
                this.delegate.multipleItemDisableSlip(), this.model.getBetBreakdown((e, t, s, i) => {
                    null != i && (e = localeLib('BetslipStandardUILib').createBetBrakdown(e, t, s, i, this, c.RequiresTaxMessage(), () => this.delegate.multipleItemEnableSlip()) || new d(e, t, s, i, this, c.RequiresTaxMessage(), () => this.delegate.multipleItemEnableSlip()), p.AddModal(e));
                });
            }) : this.model.key() == a.SINGLES_MULTIPLE_ITEM_ID && (e = c.GetTranslation('1Fold'), this.addStyle('bss-MultipleItem-singles')), this.titleLabel.setText(e);
        }
        oddsUpdated(e) {
            this.oddsLabel.setOdds(e), '' == e ? this.addStyle('bss-MultipleItem_NoOdds') : this.removeStyle('bss-MultipleItem_NoOdds');
        }
        multipleRemoved() {
            this.delegate.multipleItemRemoved(this), this.stakeBox.dispose();
        }
        betReferenceChanged(e) {
            c.RequiresReferenceOnBetItem() && e && (this.bottomSection || (this.bottomSection = new u(), this.bottomSection.setAttribute('class', 'bss-MultipleItem_BottomSection'), this.detailsContainer.appendChild(this.bottomSection)), this.betReference || (this.betReference = new n(), this.betReference.addStyle('bss-MultipleItem_BetRef')), e = c.GetTranslation('ref') + ': ' + e, this.betReference.setText(e), this.bottomSection.appendChild(this.betReference));
        }
        setStateForReceipt() {
            this.isCast && this.addStyle('bss-MultipleItem_CastReceipt'), this.hasStake || (this.delegate.multiplesExpanded ? h.HideElementTransition(this) : this.suspendElementFromDom(), this.isHidden = !0), this.betCreditsInfo && this.betCreditsInfo.setMessageForReceipt(), this.eachWayCheckbox && !this.eachWayCheckbox.getChecked() && (h.HideElementTransition(this.eachWayCheckbox), this.checkboxHidden = !0), this.stakeBox && this.stakeBox.setStakeBoxForReceipt(), this.setReferralMaxStakeMessage(0);
        }
        revertReceiptState() {
            this.removeStyle('bss-MultipleItem_FullyDeclined'), this.removeStyle('bss-MultipleItem_CastReceipt'), this.betReference && (this.bottomSection.removeChild(this.betReference), this.betReference = null), this.isHidden && (this.delegate.multiplesExpanded ? h.ShowElementTransition(this) : this.unsuspendElementFromDom(), this.isHidden = !1), this.checkboxHidden && this.eachWayCheckbox && (h.ShowElementTransition(this.eachWayCheckbox), this.checkboxHidden = !1), this.stakeBox && this.stakeBox.revertReceiptStakeBox();
        }
        betCountUpdated(e) {
            1 == e && this.model.isCastMultiple() ? this.stakeBox.overrideBetCount('' + e) : this.stakeBox.setBetCount(e);
        }
        stakeChanged(e) {
            0 < +e && this.validateMinStakes(e), this.referralInfoContainer && (this.wrapper.removeChild(this.referralInfoContainer), this.referralInfoContainer = null), this.removeStyle('bss-MultipleItem_Referred');
            var t, s, i, a = +g.RoundDown(C.StringToNumber(e) * this.model.getBetCount());
            0 < this.model.getReferralAmount() && 0 < a && 0 == this.model.getReferralPlaceAmount() ? (this.referralMessageContainer.removeAllChildren(), this.wrapper.addStyle('bss-MultipleItem_ContentWrapper-maxstake'), t = c.GetTranslation('MaxBetFullReferral'), (i = new n('span')).addStyle('bss-MultipleItem_Referred-text'), i.setText(t), this.referralMessageContainer.appendChild(i), this.addStyle('bss-MultipleItem-referral'), this.referralMessageContainer.unsuspendElementFromDom()) : 0 < this.model.getReferralAmount() && a > this.model.getReferralPlaceAmount() ? (t = g.RoundDown(a - this.model.getReferralPlaceAmount()), this.referralMessageContainer.removeAllChildren(), this.wrapper.addStyle('bss-MultipleItem_ContentWrapper-maxstake'), i = c.GetTranslation('referralPlaceNow').replace('{0}|', '{0} '), a = c.GetTranslation('MaxBetReferralApprovalItemBody').replace('{0}|', '{0} '), (s = new n('span')).addStyle('bss-MultipleItem_Referred-text'), s.setText(i.replace('{0}', b.ApplyCurrencySymbol(b.ApplyDelimiterAndGroupSeparator(this.model.getReferralPlaceAmount() + '')))), this.referralMessageContainer.appendChild(s), (i = new n('span')).addStyle('bss-MultipleItem_Referred-text'), i.setText(a.replace('{0}', b.ApplyCurrencySymbol(b.ApplyDelimiterAndGroupSeparator(t + '')))), this.referralMessageContainer.appendChild(i), this.addStyle('bss-MultipleItem-referral'), this.referralMessageContainer.unsuspendElementFromDom()) : (this.removeStyle('bss-MultipleItem-referral'), this.referralMessageContainer.suspendElementFromDom()), C.StringToNumber(e) < this.model.getMaxStake() && 0 == this.model.getReferralAmount() && (this.wrapper.removeStyle('bss-MultipleItem_ContentWrapper-maxstake'), this.stakeBox.invalidStake(!1), this.maxStakeMessageContainer.suspendElementFromDom()), '' !== e ? ('0' != e ? (this.addStyle('bss-MultipleItem_HasStake'), this.hasStake = !0) : (this.removeStyle('bss-MultipleItem_HasStake'), this.hasStake = !1), this.stakeBox.updateStake(e)) : (this.removeStyle('bss-MultipleItem_HasStake'), this.hasStake = !1, this.stakeBox.setEmpty());
        }
        betCreditsStakeChanged(e, t) {
            e ? (this.betCreditsInfo || (this.betCreditsInfo = new f(), this.betCreditsInfo.suspendElementFromDom(), this.betCreditsInfo.addStyle('bss-MultipleItem_BetCredits'), this.detailsContainer.appendChild(this.betCreditsInfo)), this.betCreditsInfo.setBetCreditsStake(e, t, B.USING), this.betCreditsInfoShowing || (Locator.validationManager.callLater(() => {
                h.ShowElementTransition(this.betCreditsInfo, null, 0.2);
            }), this.stakeBox.showNetReturn()), this.betCreditsInfoShowing = !0) : this.betCreditsInfo && (h.HideElementTransition(this.betCreditsInfo, !1, 0.2), this.freeBetTokenSelected || this.stakeBox.showToReturn(), this.betCreditsInfoShowing = !1);
        }
        totalStakeChanged(e) {
            this.stakeBox.setTotalStakeValue(e);
        }
        ewAvailableChanged(e, t) {
            e && !this.eachWayCheckbox ? (this.addStyle('bss-MultipleItem_EachWay'), this.eachWayCheckbox = new i(this), this.bottomSection = new u(), this.bottomSection.setAttribute('class', 'bss-MultipleItem_BottomSection'), this.detailsContainer.appendChild(this.bottomSection), this.bottomSection.appendChild(this.eachWayCheckbox), t ? (this.eachWayCheckbox.setChecked(), this.stakeBox.eachwayChecked()) : (this.eachWayCheckbox.setUnchecked(), this.stakeBox.eachwayUnchecked())) : !e && this.eachWayCheckbox ? (this.detailsContainer.removeChild(this.bottomSection), this.eachWayCheckbox = null) : e && (t ? (this.eachWayCheckbox.setChecked(), this.stakeBox.eachwayChecked()) : (this.eachWayCheckbox.setUnchecked(), this.stakeBox.eachwayUnchecked()));
        }
        returnValueChanged(e) {
            this.stakeBox.setReturnValue(e);
        }
        accumulatorPercentageChanged(e, t) {
        }
        referralAmountChanged(e, t) {
            c.RequiresReferralOnBet();
        }
        referralApproved() {
            let e = this.model.getReferralAmount();
            (e = 0 == e ? this.model.getTotalStake() - this.model.getReferralPlaceAmount() : e) == this.model.getTotalStake() && (e = 0), e = +g.RoundDown(e), this.setReferredStyle(), this.showReferralInfo('accepted', e, null);
        }
        referralAIApproved(e, t) {
            this.setReferredStyle(), this.showReferralInfo('aiapproved', e, t);
        }
        setReferredStyle() {
            this.addStyle('bss-MultipleItem_Referred');
        }
        referralDeclined(e, t) {
            0 == e ? (this.referralMessageContainer.suspendElementFromDom(), this.removeStyle('bss-MultipleItem_Referred')) : (this.setReferredStyle(), 'fulldecline' == (t = e == t ? 'fulldecline' : 'partialdecline') && this.addStyle('bss-MultipleItem_FullyDeclined'), this.showReferralInfo(t, e, null));
        }
        stakeBoxStakeEntered(e) {
            this.validateMinStakes(e), this.model.stakeEntered(e);
        }
        validateMinStakes(e) {
            var t = S.GetMinimumUnitStake(), e = C.StringToNumber(e);
            0 != e && e < t ? (this.model.updateMinStakeInput(), this.stakeBox.invalidStake(!0)) : (this.model.setAboveMinStake(e), this.stakeBox.invalidStake(!1));
        }
        stakeBoxShowKeypad() {
            t.ShowKeypad(this.wrapper, this.stakeBox, '' + this.model.key(), 'bss-Keypad');
        }
        stakeBoxShowKeypadInternal() {
            t.ShowKeypad(this.wrapper, this.stakeBox, '' + this.model.key(), 'bss-Keypad');
        }
        restoreKeypad() {
            this.stakeBoxShowKeypadInternal();
        }
        eachwayCheckboxChecked() {
            this.stakeBox.eachwayChecked(), this.model.eachwayChecked();
        }
        eachwayCheckboxUnchecked() {
            this.stakeBox.eachwayUnchecked(), this.model.eachwayUnchecked();
        }
        hideReferralMessage() {
            this.setReferralMaxStakeMessage(0), this.referralInfoContainer && (this.referralInfoContainer.removeAllChildren(), this.wrapper.removeChild(this.referralInfoContainer), this.referralInfoContainer.suspendElementFromDom()), this.model.setBetResult(m.success);
        }
        betBreakdownGetTranslation(e) {
            return c.GetTranslation(e);
        }
        showReferralInfo(e, t, s) {
            this.maxStakeMessageContainer.suspendElementFromDom(), this.referralMessageContainer.suspendElementFromDom(), this.referralInfoContainer ? this.referralInfoContainer.removeAllChildren() : (this.referralInfoContainer = new u(), this.referralInfoContainer.setAttribute('class', 'bss-MultipleItem_ReferralInfo'), this.wrapper.appendChild(this.referralInfoContainer)), this.referralInfoContainer.appendChild(this.getReferralInfo(e, t, s));
        }
        getReferralInfo(e, t, s) {
            e = new o(e, t, s);
            return e.defaultStyle = 'bss-ReferralInfo', e;
        }
        getStakeTaxUser() {
            return this.model.getStakeTaxUser();
        }
        getStakeTaxCovered() {
            return this.model.getStakeTaxCovered();
        }
        getBetModel() {
            return this.model;
        }
        static MakeAccessible(e) {
            e.titleLabel && e.multipleHitBox && _.MakeAccessible(e.titleContainer);
        }
    };
    y.ShowPermedReturnsOnSlip = !1, y.SINGLES_MULTIPLE_ITEM_ID = -1, y = a = __decorate([AccessibilityDelegate(y)], y), e.MultipleItem = y;
})(ns_betslipstandarduilib_ui_bet_standard = ns_betslipstandarduilib_ui_bet_standard || {}), (t => {
    var e = ns_gen5_ui.Component, s = ns_gen5_ui.Label, i = ns_gen5_ui.TextNode;
    class a extends e {
        constructor(e) {
            super(), this.defaultStyle = e, this.miniBetsList = [], this.lastVisibleItemIndex = -1, this.defaultStyle = this.defaultStyle || 'bss-MiniBetContainer', this.addStyle(this.defaultStyle + '_MiniBetContainer');
        }
        createChildren() {
            this.moreSelections = new s(), this.appendChild(this.moreSelections), this.moreSelections.getElement().style.opacity = '0', this.moreSelections.getElement().style.display = 'none', this.moreSelections.addStyle(this.defaultStyle + '_MiniBetMoreSelections'), this.moreTextnode = new i('+0'), this.moreSelections.appendChild(this.moreTextnode), this.miniBetItemObserver = new MutationObserver((e, t) => {
                for (var s of e) {
                    var i = 'childList' == s.type && (0 < s.addedNodes.length || 0 < s.removedNodes.length), a = 'attributes' == s.type && null !== s.target.nextSibling;
                    0 < this.miniBetsList.length && (i || a) && this.calculateState(s);
                }
            }), this.miniBetItemObserver.observe(this.getElement(), {
                childList: !0,
                subtree: !0,
                attributes: !0
            });
        }
        calculateState(e) {
            if (0 < e.addedNodes.length || 'attributes' == e.type) {
                this.moreSelections.getElement().style.display = 'flex';
                let t = this.getHiddenItemsCount();
                if (this.getElement().scrollHeight > this.getElement().clientHeight) {
                    let e = this.miniBetsList.length - 1;
                    for (; 0 < e;) {
                        if (!this.miniBetsList[e].hidden) {
                            this.miniBetsList[e].item.getElement().style.display = 'none', this.miniBetsList[e].hidden = !0, t++;
                            break;
                        }
                        e--;
                    }
                    this.moreTextnode.setText('+' + this.getHiddenItemsCount()), this.moreSelections.getElement().style.opacity = '1', this.moreSelections.getElement().style.display = 'flex';
                } else
                    0 < e.addedNodes.length && 0 < t && (this.miniBetsList[this.miniBetsList.length - 1].item.getElement().style.display = 'none', this.miniBetsList[this.miniBetsList.length - 1].hidden = !0, t++), this.moreTextnode.setText('+' + t), 0 == t && (this.moreSelections.getElement().style.opacity = '0', this.moreSelections.getElement().style.display = 'none');
            }
            var t;
            if (0 < e.removedNodes.length && '1' == this.moreSelections.getElement().style.opacity) {
                let e = this.getHiddenItemsCount();
                if (this.getElement().scrollHeight <= this.getElement().clientHeight)
                    if (0 < e) {
                        for (var s of this.miniBetsList)
                            if (s.hidden && !s.item.getExcludedState()) {
                                s.item.getElement().style.removeProperty('display'), s.hidden = !1, 0 < --e ? (this.moreTextnode.setText('+' + e), this.moreSelections.getElement().style.opacity = '1', this.moreSelections.getElement().style.display = 'flex') : this.moreSelections.getElement().style.opacity = '0';
                                break;
                            }
                    } else
                        this.moreSelections.getElement().style.opacity = '0', this.moreSelections.getElement().style.display = 'none';
                else
                    this.moreTextnode.setText('+' + e), 0 == e && (this.moreSelections.getElement().style.opacity = '0', this.moreSelections.getElement().style.display = 'none');
            }
            let i, a;
            for (t of this.miniBetsList)
                t.hidden || t.item.getExcludedState() || (i = t.item), t.item.hasLast() && (a = t.item);
            i && !i.hasLast() && i.addLast(), a && a != i && a.removeLast();
        }
        miniBetItemAdd(e) {
            e = new t.MiniBetItem(e, this);
            this.miniBetsList.push({
                item: e,
                hidden: !1
            }), this.insertBefore(e, this.moreSelections);
        }
        miniBetItemRemove(e) {
            for (var t of this.miniBetsList)
                if (t.item == e) {
                    0 < this.getHiddenItemsCount() && -1 < this.lastVisibleItemIndex && this.miniBetsList[this.lastVisibleItemIndex] && (this.miniBetsList[this.lastVisibleItemIndex].item.removeLast(), this.lastVisibleItemIndex--);
                    t = this.miniBetsList.indexOf(t);
                    this.miniBetsList.splice(t, 1);
                    break;
                }
            this.lastVisibleItemIndex = 0 == this.miniBetsList.length ? -1 : this.lastVisibleItemIndex;
        }
        getHiddenItemsCount() {
            let e = 0;
            for (var t of this.miniBetsList)
                t.hidden && !t.item.getExcludedState() && e++;
            return e;
        }
        isFullHeightOccupied() {
            return this.getElement().getBoundingClientRect().height == a.CONTAINER_MAX_HEIGHT;
        }
        dispose() {
            this.miniBetItemObserver && this.miniBetItemObserver.disconnect();
        }
    }
    a.CONTAINER_MAX_HEIGHT = 36, t.MiniBetContainer = a;
})(ns_betslipstandarduilib_ui_bet_standard = ns_betslipstandarduilib_ui_bet_standard || {}), (e => {
    var t = ns_gen5_ui.Component, s = ns_gen5_ui.Label, i = ns_accessibilityuilib_ui.LinkAccessibilityDelegate;
    let a = class extends t {
        createChildren() {
            super.createChildren(), this.addStyle('bss-ExcludedSnglesHeader');
            var e = new s();
            e.addStyle('bss-ExcludedSnglesHeader_Label'), e.setText(StandardLocaleHelper.GetTranslation('1Fold')), this.appendChild(e);
        }
        static MakeAccessible(e) {
            e && i.MakeAccessible(e);
        }
    };
    a = __decorate([AccessibilityDelegate(a)], a), e.ExcludedSnglesHeader = a;
})(ns_betslipstandarduilib_ui_slip_controls_standard = ns_betslipstandarduilib_ui_slip_controls_standard || {}), (e => {
    var t, s = ns_gen5_ui.Component, i = ns_gen5_ui.Label, a = ns_gen5_util.CurrencyFormatter, l = ns_gen5_util.BalanceModel, n = ns_gen5_events.BalanceModelEvent, r = ns_gen5_util.Delegate, d = ns_gen5_util.Singleton, o = ns_accessibilityuilib_ui.CheckboxAccessibilityDelegate, h = ns_betslipuilib_ui_slip_message.MessageType;
    let p = t = class extends s {
        constructor(e, t) {
            super(), this.preselected = e, this.delegate = t, this.selected = !1, this.suspended = !1, this.disableBetCredit = !0, this.isSelected = !1, this.isDisabled = !1, this.messageType = h.BetCreditsHeader;
        }
        isMessageMatched(e) {
            return this.messageType == e.messageType && !this.disposeInProgress;
        }
        clone() {
            return new t(this.preselected, this.delegate);
        }
        updateMessage(e) {
        }
        processMessage(e, t) {
        }
        showMessage(e) {
            this.canShow ? (this.removeStyle('bsc-BetCreditsHeader_Hide'), this.addStyle('bsc-BetCreditsHeader_Shown')) : (this.addStyle('bsc-BetCreditsHeader_Hide'), this.removeStyle('bsc-BetCreditsHeader_Shown'));
        }
        createChildren() {
            this.addStyle('bsc-BetCreditsHeader'), this.canShow = Locator.pushedConfig.getIsFreeBetsAllowed(Locator.user.countryId);
            var e = new s(), t = (e.addStyle('bsc-BetCreditsHeader_Contents'), this.appendChild(e), this.checkBox = new s(), this.checkBox.addStyle('bsc-BetCreditsHeader_CheckBox'), e.appendChild(this.checkBox), new s());
            t.addStyle('bsc-BetCreditsHeader_Tick'), this.checkBox.appendChild(t), this.betCreditLabel = new i(), this.betCreditLabel.addStyle('bsc-BetCreditsHeader_Text'), e.appendChild(this.betCreditLabel), this.betCreditValueLabel = new i(), this.betCreditValueLabel.addStyle('bsc-BetCreditsHeader_ValueText'), e.appendChild(this.betCreditValueLabel), this.betCreditText = StandardLocaleHelper.GetTranslation('FreeBet'), this.balanceUpdateDelegate = new r(this, this.balanceUpdateHandler), d.getInstance(l).addEventListener(n.BALANCEMODEL_UPDATE_EVENT, this.balanceUpdateDelegate), this.preselected && Locator.validationManager.callPostValidation(() => {
                this.updateStatus(!this.selected);
            });
        }
        clickHandler() {
            this.updateStatus(!this.selected);
        }
        updateStatus(e) {
            !this.suspended && this.checkBox && (this.isSelected = e, this.canShow && 0 < +Locator.user.getBalance().bonusBalance && e ? this.delegate.betCreditsHeaderChecked() : this.delegate.betCreditsHeaderUnchecked(), this.accessibility) && this.accessibility.setChecked();
        }
        checked() {
            this.selected = !0, this.checkBox.addStyle('bsc-BetCreditsHeader_CheckBox-selected'), this.accessibility && this.accessibility.setChecked();
        }
        unChecked() {
            this.selected = !1, this.checkBox.removeStyle('bsc-BetCreditsHeader_CheckBox-selected'), this.accessibility && this.accessibility.setChecked();
        }
        balanceUpdateHandler() {
            this.canShow = Locator.pushedConfig.getIsFreeBetsAllowed(Locator.user.countryId), this.invalidateProperties();
        }
        commitProperties() {
            this.canShow && 0 < +Locator.user.getBalance().bonusBalance && this.disableBetCredit ? (this.updateButtonText(), this.removeStyle('bsc-BetCreditsHeader_Hide'), this.accessibility && this.accessibility.setHidden()) : this.hideBetCreditsHeader();
        }
        updateBetCreditState(e) {
            this.disableBetCredit = e, this.invalidateProperties();
        }
        canShowBetMessage() {
            return this.canShow && 0 < +Locator.user.getBalance().bonusBalance && this.selected;
        }
        updateButtonText() {
            var e, t = a.ApplyDelimiterAndGroupSeparator(Locator.user.getBalance().bonusBalance), t = this.betCreditText.replace('{0}', t), s = /\(([^)]+)\)/.exec(t);
            s ? (e = t.split(s[0]), this.betCreditLabel.setText(e[0]), this.betCreditValueLabel.setText(s[0])) : this.betCreditLabel.setText(t);
        }
        suspend() {
            this.suspended = !0;
        }
        unsuspend() {
            this.suspended = !1;
        }
        hideBetCreditsHeader() {
            this.canShow = !1, this.selected && this.checkBox.removeStyle('bsc-BetCreditsHeader_CheckBox-selected'), this.addStyle('bsc-BetCreditsHeader_Hide'), this.accessibility && this.accessibility.setHidden();
        }
        reset() {
            this.selected && this.updateStatus(!this.selected), this.balanceUpdateHandler();
        }
        disable() {
            this.selected && (this.selected = !1, this.checkBox.removeStyle('bsc-BetCreditsHeader_CheckBox-selected')), this.isDisabled = !0, this.addStyle('bsc-BetCreditsHeader-disabled'), this.accessibility && this.accessibility.setDisabled();
        }
        enable() {
            this.removeStyle('bsc-BetCreditsHeader-disabled'), this.isDisabled = !1, this.accessibility && this.accessibility.setDisabled();
        }
        dispose() {
            d.getInstance(l).hasEventListenerWithDelegate(n.BALANCEMODEL_UPDATE_EVENT, this.balanceUpdateDelegate) && d.getInstance(l).removeEventListener(n.BALANCEMODEL_UPDATE_EVENT, this.balanceUpdateDelegate);
        }
        static MakeAccessible(e) {
            e.accessibility = new o(e, {
                isDisabled: () => e.suspended || e.isDisabled,
                isPressed: () => e.isSelected,
                isHidden: () => !e.canShow
            }), e.accessibility.makeAccessible();
        }
    };
    p = t = __decorate([AccessibilityDelegate(p)], p), e.BetCreditsHeader = p;
})(ns_betslipstandarduilib_ui_slip_controls_common = ns_betslipstandarduilib_ui_slip_controls_common || {}), (e => {
    var t = ns_gen5_ui.Component, s = ns_gen5_ui.Label, n = ns_gen5_util.CurrencyFormatter, r = ns_betslipuilib_util.BetCreditsMessageKey;
    class i extends t {
        constructor(e) {
            super(), this.slipuidelegate = e, this.showing = !1;
        }
        createChildren() {
            this.defaultStyle = this.defaultStyle || 'bss-BetCreditsMessage', this.addStyle(this.defaultStyle);
            var e = new t();
            e.addStyle(this.defaultStyle + '_Contents'), this.appendChild(e), this.betCreditTotalDetails = new s(), this.betCreditTotalDetails.addStyle(this.defaultStyle + '_TotalDetails'), e.appendChild(this.betCreditTotalDetails), this.betCreditReturns = new s(), this.betCreditReturns.addStyle(this.defaultStyle + '_Returns'), e.appendChild(this.betCreditReturns);
        }
        setCreditMessageText(e, t, s, i = !1) {
            this.values = [], this.values.push(e, t, s);
            let a = '', l = '';
            return e && s ? (l = t ? r.TOTAL_BET_CREDITS_FREEBET_PLUS_STAKE : r.TOTAL_BET_CREDITS_FREEBET, a = r.NET_RETURNS_BET_CREDITS_FREE_BET) : e ? (l = t ? r.TOTAL_BET_CREDITS_PLUS_STAKE : i ? r.USED_BET_CREDITS : r.USING_BET_CREDITS, a = r.NET_RETURNS_BET_CREDITS) : s && (l = t ? r.TOTAL_FREEBET_PLUS_STAKE : i ? r.USED_FREEBET : r.USING_FREEBET, a = r.NET_RETURNS_FREE_BET), this.setMessage(l, a, e, t, s);
        }
        setMessage(e, t, s, i, a) {
            let l = StandardLocaleHelper.GetTranslation(e);
            return l ? (s && a && i ? l = (l = (l = l.replace('{0}', n.ApplyDelimiterAndGroupSeparator(s))).replace('{1}', n.ApplyCurrencySymbol(n.ApplyDelimiterAndGroupSeparator(i)))).replace('{2}', n.ApplyCurrencySymbol(n.ApplyDelimiterAndGroupSeparator(a))) : s && a ? l = (l = l.replace('{0}', n.ApplyDelimiterAndGroupSeparator(s))).replace('{1}', n.ApplyCurrencySymbol(n.ApplyDelimiterAndGroupSeparator(a))) : s ? (l = l.replace('{0}', n.ApplyDelimiterAndGroupSeparator(s)), i && (l = l.replace('{1}', n.ApplyCurrencySymbol(n.ApplyDelimiterAndGroupSeparator(i))))) : a ? (l = l.replace('{0}', n.ApplyDelimiterAndGroupSeparator(a)), i && (l = l.replace('{1}', n.ApplyCurrencySymbol(n.ApplyDelimiterAndGroupSeparator(i))))) : l = '', this.betCreditTotalDetails.commitText(l), this.betCreditReturns.commitText(StandardLocaleHelper.GetTranslation(t)), this.showing || (this.slipuidelegate.betCreditsMessageShowOnSlipWithResize(this), this.showing = !0)) : (this.slipuidelegate.betCreditsMessageHideFromSlipWithResize(this), this.showing = !1), this.showing;
        }
        setReceiptCreditMessageText() {
            this.values && this.setCreditMessageText(this.values[0], this.values[1], this.values[2], !0);
        }
    }
    e.BetCreditsMessage = i;
})(ns_betslipstandarduilib_ui_slip_controls_standard = ns_betslipstandarduilib_ui_slip_controls_standard || {}), (e => {
    var t = ns_gen5_ui.Component, s = ns_betslipcorelib_constants.BetSlipResult, i = ns_gen5_ui.Label, a = e.BetCreditsMessage, l = ns_gen5_ui.DomElement, n = ns_sitepreferenceslib_util.UserPreferences, r = ns_betslipcorelib_util.BetslipPreferences, d = ns_betslipuilib_ui_footer.StakeBox, o = ns_betslipuilib_ui_footer_keypad.Controller, h = ns_betslipuilib_enum.DisplayState, p = ns_betslipuilib_ui_footer.BetButtonsWrapper, c = ns_betslipuilib_util.TransitionHelper, u = ns_betslipcorelib_util.JackpotController;
    class b extends ns_betslipuilib_ui_footer.Footer {
        constructor(e, t) {
            super(), this.betslipModel = e, this.slipUiDelegate = t, this.defaultStyle = 'bss-Footer', this.emptyStakeCount = 0, this.showingRestricedMessage = !1, this.rememberedStake = '0', this.currentStake = '0', this.locale = localeLib('BetslipStandardUILib');
        }
        createChildren() {
            this.addStyle(this.defaultStyle), this.messageContainer = new t(), this.messageContainer.addStyle(this.defaultStyle + '_MessageContainer'), this.appendChild(this.messageContainer), this.messageBody = new i(), this.messageBody.addStyle(this.defaultStyle + '_MessageBody'), this.messageContainer.appendChild(this.messageBody), this.messageContainer.suspendElementFromDom(), this.betCreditsMessage = new a(this), this.appendChild(this.betCreditsMessage), n.AdditionalPreferences(r).hasToteBet && this.betCreditsMessage.suspendElementFromDom(), this.detailsContainer = new t(), this.detailsContainer.addStyle(this.defaultStyle + '_DetailsContainer'), this.appendChild(this.detailsContainer), this.messageContainer = new t(), this.messageContainer.addStyle(this.defaultStyle + '_MessageContainer'), this.appendChild(this.messageContainer), this.stakeBox = this.createStakeBox(), this.detailsContainer.appendChild(this.stakeBox), n.AdditionalPreferences(r).rememberQuickBetStake && (this.rememberedStake = n.AdditionalPreferences(r).rememberedQuickBetStake, this.rememberedStake) && (this.currentStake = this.rememberedStake, Locator.validationManager.callLater(() => {
                this.setModelStake(this.rememberedStake);
            })), this.requiresConfirmation = StandardLocaleHelper.RequiresBetConfirmation(), this.betWrapper = this.createButtonWrapper(), this.detailsContainer.appendChild(this.betWrapper), this.betCreditsMessage.suspendElementFromDom(), this.jackpotWrapper = new l(), this.appendChild(this.jackpotWrapper);
            var e = new l();
            this.appendChildAt(e, 0), u.setBannerContainer(e.getElement()), u.setReceiptContainer(this.jackpotWrapper.getElement());
        }
        createButtonWrapper() {
            return this.locale.createButtonWrapper(this, 'bsf-BetButtonsWrapper') || new p(this, 'bsf-BetButtonsWrapper');
        }
        betButtonsWrapperPlaceBet() {
            this.betslipModel.placeBetButtonValidateAndPlaceBet();
        }
        betButtonsWrapperPlaceBetDisabled() {
            return this.betslipModel.getPlaceBetDisabled();
        }
        betButtonsWrapperConfirmAndPlaceBet() {
        }
        betButtonsWrapperConfirmBet() {
        }
        betButtonsWrapperAcceptAndPlaceBet() {
            this.betslipModel && (this.betslipModel.acceptChanges(), this.betslipModel.validateAndPlaceBet());
        }
        betButtonsWrapperAcceptBet() {
            this.betslipModel && this.betslipModel.acceptChanges();
        }
        betButtonsWrapperAcceptBetAndDeposit() {
            this.betslipModel && this.betslipModel.acceptChanges();
        }
        betButtonsWrapperDepositAndPlaceBet() {
            this.betslipModel && this.betslipModel.depositAndPlaceBet();
        }
        betButtonsWrapperAcceptMinimumStake() {
            this.betslipModel && this.betslipModel.acceptMinimumStakeChanges();
        }
        betButtonsWrapperReferBet() {
            this.betslipModel.referBet();
        }
        betButtonsWrapperGetSlipSuspended() {
            let e = 0;
            for (var t of this.betslipModel.bets)
                t.isSuspended && t.isSuspended() && e++;
            return e != this.betslipModel.bets.length;
        }
        betButtonsWrapperGetTotalStak() {
            return this.betslipModel.getTotalStake();
        }
        betButtonsWrapperHasBetResults(e) {
            for (var t of this.betslipModel.bets)
                if (t.getBetResults() == e)
                    return !0;
            if (this.betslipModel.defaultMultiple && this.betslipModel.defaultMultiple.getSlipResult() == e)
                return !0;
            for (var s of this.betslipModel.multiples)
                if (s.getSlipResult() == e)
                    return !0;
            for (var i of this.betslipModel.castBets)
                if (i.getBetResults() == e)
                    return !0;
            return !1;
        }
        betButtonsWrapperBetResultsCount(e) {
            let t = 0;
            for (var s of this.betslipModel.bets)
                s.getBetResults() == e && t++;
            this.betslipModel.defaultMultiple && this.betslipModel.defaultMultiple.getSlipResult() == e && t++;
            for (var i of this.betslipModel.multiples)
                i.getSlipResult() == e && t++;
            for (var a of this.betslipModel.castBets)
                a.getBetResults() == e && t++;
            return t;
        }
        betButtonsWrapperGetMinimumStake() {
            if (this.slipUiDelegate.footerBetslipState() != h.BetslipStateExpanded)
                return this.betModel ? this.betModel.getMinStake() : 0;
            for (var e of this.betslipModel.bets) {
                e = e.getMinStake();
                if (0 < e)
                    return e;
            }
            if (this.betslipModel.defaultMultiple) {
                var t = this.betslipModel.defaultMultiple.getMinStake();
                if (0 < t)
                    return t;
            }
            for (var s of this.betslipModel.multiples) {
                s = s.getMinStake();
                if (0 < s)
                    return s;
            }
            for (var i of this.betslipModel.castBets) {
                i = i.getMinStake();
                if (0 < i)
                    return i;
            }
            return 0;
        }
        betButtonsWrapperGetMaximiumStake() {
            if (this.slipUiDelegate.footerBetslipState() != h.BetslipStateExpanded)
                return this.betModel ? this.betModel.getMaxStake() : 0;
            for (var e of this.betslipModel.bets) {
                e = e.getMaxStake();
                if (0 < e)
                    return e;
            }
            if (this.betslipModel.defaultMultiple) {
                var t = this.betslipModel.defaultMultiple.getMaxStake();
                if (0 < t)
                    return t;
            }
            for (var s of this.betslipModel.multiples) {
                s = s.getMaxStake();
                if (0 < s)
                    return s;
            }
            for (var i of this.betslipModel.castBets) {
                i = i.getMaxStake();
                if (0 < i)
                    return i;
            }
            return 0;
        }
        getModelData() {
            return {
                eachwayChecked: !!this.betModel && this.betModel.isEachwayChecked(),
                eachwayBetCount: this.betModel ? this.betModel.getEachwayBetCount() : 1,
                betslipState: this.slipUiDelegate.footerBetslipState(),
                minStake: this.betModel ? this.betModel.getMinStake() : 0,
                maxStake: this.betModel ? this.betModel.getMaxStake() : 0
            };
        }
        betButtonsWrapperShakeStakeOnClick() {
            this.slipUiDelegate.footerShakeStakeBox();
        }
        updateReturnValue(e) {
            this.betWrapper.updateReturnValue(e, this.betslipModel.getReferralTotalReturns());
        }
        updateWinningsBoostValue(e, t) {
            this.betWrapper.updateWinningsBoostValue(e, t);
        }
        updateBonusValue(e) {
            this.betWrapper.updateBonusValue(e);
        }
        toggleBonusValue(e) {
            this.betWrapper.toggleBonusValue(e);
        }
        getTotalStakedBets() {
            let e = 0;
            for (var t of this.betslipModel.bets)
                0 < t.getStake() && e++;
            this.betslipModel.defaultMultiple && 0 < this.betslipModel.defaultMultiple.getStake() && e++;
            for (var s of this.betslipModel.multiples)
                0 < s.getStake() && e++;
            for (var i of this.betslipModel.castBets)
                0 < i.getStake() && e++;
            return e;
        }
        updateTotalStake(e) {
            var t = this.betslipModel.getReferralTotalUserStake(), s = this.betModel ? this.betModel.getStake() : 0;
            this.betWrapper.updateTotalStake(e, s, t, this.betslipModel.getReferralPlaceAmount(), this.betslipModel.getCurrentState(), this.getTotalStakedBets()), t <= 0 && this.stakeBox.updateTotalStake(e);
        }
        resolveStakeTax() {
            this.betWrapper.resolveStakeTax(), this.stakeBox.resolveStakeTax();
        }
        static RegisterStateDelegate(e) {
            b.PlaceResultStateDelegates.push(e);
        }
        placeBetResultChanged(t, e) {
            this.messageContainer.removeStyle(this.defaultStyle + '_MessageContainer-rejected'), this.messageContainer.removeStyle(this.defaultStyle + '_MessageContainer-accepted');
            for (let e = 0; e < b.PlaceResultStateDelegates.length; e++)
                b.PlaceResultStateDelegates[e](t);
            switch (this.betWrapper.placeBetResultChanged(t, e), e) {
            case -10:
            case 11:
                return void o.HideKeypad();
            case 7:
                return void this.betslipModel.updateTotalStake();
            case 3:
                return this.stakeBox.setStateForReceipt(), void this.betCreditsMessage.setReceiptCreditMessageText();
            }
            switch (t) {
            case s.stakeBelowMinimum:
                this.stakeBox.invalidStake(!0);
                break;
            case s.stakeAboveMinimum:
                this.stakeBox.invalidStake(!1);
                break;
            default:
                this.stakeBox.enable();
            }
        }
        toggleNetReturn(e, t) {
            this.betWrapper.toggleNetReturn(e, t);
        }
        setPlaceButtonDisable() {
            this.betWrapper.setPlaceButtonDisable();
        }
        revertReceipt() {
            this.betWrapper.revertReceipt(), this.messageContainer.removeStyle(this.defaultStyle + '_MessageContainer-accepted'), this.messageContainer.suspendElementFromDom();
        }
        setSlipState() {
            this.placeBetResultChanged(s.success, 1);
        }
        betCreditsMessageShowOnSlipWithResize(e, t, s) {
            this.slipUiDelegate.footerShowOnSlipWithResize(e, t, s);
        }
        betCreditsMessageHideFromSlipWithResize(e, t) {
            this.slipUiDelegate.footerHideFromSlipWithResize(e, t);
        }
        disable() {
            this.addStyle(this.defaultStyle + '-disabled'), this.betWrapper.setPlaceButtonDisable();
        }
        enable() {
            this.removeStyle(this.defaultStyle + '-disabled'), (this.currentStake && '0' !== this.currentStake || 0 !== this.betslipModel.getTotalStake()) && this.betWrapper.setPlaceButtonEnable();
        }
        validateAndReset() {
            this.betButtonsWrapperGetMaximiumStake() > +this.currentStake && (this.betWrapper.validateAndReset(), this.betslipModel.closeInvalidFundsDepositMessage());
        }
        createStakeBox() {
            return this.locale.createFooterStakeBox(this, 'bsf-StakeBox') || new d(this, 'bsf-StakeBox');
        }
        eachwayChecked(e) {
            this.addStyle('bss-Footer_EWChecked'), this.stakeBox.eachwayChecked(e);
        }
        eachwayUnchecked() {
            this.removeStyle('bss-Footer_EWChecked'), this.stakeBox.eachwayUnchecked();
        }
        dispose() {
        }
        stakeBoxStakeEntered(e) {
            this.setModelStake(e), this.betWrapper.setPlaceButtonEnable(), n.AdditionalPreferences(r).rememberQuickBetStake && (this.rememberedStake = n.AdditionalPreferences(r).rememberedQuickBetStake);
        }
        stakeBoxShowKeypad() {
            o.ShowKeypad(this, this, 'bsf'), this.slipUiDelegate.footerSetKeypadState(!0);
        }
        createKeyPad() {
            return this.locale.createFooterKeypad(this, 'bsf');
        }
        stakeBoxHideKeypad() {
            this.slipUiDelegate.footerSetKeypadState(!1);
        }
        stakeBoxStakeCleared() {
            this.stakeBox.setEmpty(), this.stakeBox.invalidStake(!1);
        }
        stakeBoxAddToStandardBetslip() {
        }
        stakeBoxToggleFocusOrStaked(e, t) {
            t && this.addStyle('bss-Footer_Expand'), this.betWrapper && this.betWrapper.toggleStakeBoxFocused(e);
        }
        getStakeTaxUser() {
            var e;
            return null == (e = this.betModel) ? void 0 : e.getStakeTaxUser();
        }
        getTotalStakeTaxUser() {
            return this.betslipModel.getTotalStakeTaxUser();
        }
        itemClicked(e) {
            this.stakeBox.itemClicked(e);
        }
        doneClicked() {
            this.stakeBox.doneClicked(), this.slipUiDelegate.footerSetKeypadState(!1);
        }
        deleteClicked() {
            this.stakeBox.deleteClicked();
        }
        keypadRemoved() {
            this.stakeBox.keypadRemoved(), this.slipUiDelegate.footerSetKeypadState(!1);
        }
        addToStandardBetslip() {
        }
        key() {
            return '';
        }
        setBetModel(t) {
            Locator.validationManager.callLater(() => {
                var e = t.getStake() || this.currentStake;
                this.betModel = t, e && this.setModelStake(e + ''), this.betslipModel.serialise();
            });
        }
        setModelStake(e) {
            this.slipUiDelegate.footerBetslipState() != h.BetslipStateSingleCondensed && this.slipUiDelegate.footerBetslipState() != h.BetslipStateMultipleCondensed && this.slipUiDelegate.footerBetslipState() != h.BetslipStateBetBuilderCondensed || this.betModel && this.betModel.stakeEntered(e);
        }
        resetFooterStake() {
            this.discardFooterModel(), n.AdditionalPreferences(r).rememberQuickBetStake && (n.AdditionalPreferences(r).rememberedQuickBetStake = this.currentStake), this.betModel = null, this.currentStake = '', this.stakeBox.updateStake(''), this.eachwayUnchecked();
        }
        stakeChanged(e) {
            n.AdditionalPreferences(r).rememberQuickBetStake && (n.AdditionalPreferences(r).rememberedQuickBetStake = e), this.currentStake = e, this.stakeBox.updateStake(e);
        }
        hideKeypad() {
            o.HideKeypad(), this.slipUiDelegate.footerSetKeypadState(!1);
        }
        swipeDeleteBet() {
            c.HideElementTransition(this, !1, 0.25, () => {
                Locator.validationManager.callLater(() => {
                    this.unsuspendElementFromDom();
                });
            }), this.hideKeypad();
        }
        discardFooterModel() {
            this.slipUiDelegate.footerBetslipState() != h.BetslipStateNone && this.slipUiDelegate.footerBetslipState() != h.BetslipStateSingleCondensed && this.slipUiDelegate.footerBetslipState() != h.BetslipStateBetBuilderCondensed && this.slipUiDelegate.footerBetslipState() != h.BetslipStateMultipleCondensed || (this.rememberedStake = n.AdditionalPreferences(r).rememberQuickBetStake ? n.AdditionalPreferences(r).rememberedQuickBetStake : '', this.currentStake = ((this.betModel ? this.betModel.getStake() : +this.rememberedStake) || this.currentStake) + '', this.betModel && (this.betModel.footerResetState(), this.betModel = null, this.betslipModel.serialise()));
        }
        switchToCondensedView() {
            this.betWrapper.switchToCondensedView(), u.setHasFooterStake(!0);
        }
        switchToExpandedView() {
            this.betWrapper.switchToExpandedView(), u.setHasFooterStake(!1);
        }
        selectionsChanged(e) {
            this.betWrapper.selectionsChanged(e);
        }
        removeErrorMessage() {
            this.messageContainer.suspendElementFromDom();
        }
        disableStakeBox() {
            this.stakeBox.disable();
        }
        enableStakeBox() {
            this.stakeBox.enable();
        }
        updateFooterReturnLabel(e, t) {
            this.betWrapper.updatePlaceBetReturnLabel(e, t);
        }
    }
    b.PlaceResultStateDelegates = [], e.Footer = b;
})(ns_betslipstandarduilib_ui_slip_controls_standard = ns_betslipstandarduilib_ui_slip_controls_standard || {}), (e => {
    var t = ns_gen5_ui.Component, s = ns_betslipuilib_ui_slip_header.DefaultContent, i = ns_betslipcorelib_util.StorageHelper, a = ns_betslipstandarduilib_ui_bet_standard.MiniBetContainer;
    class l extends t {
        constructor(e) {
            super(), this.app = e;
        }
        createChildren() {
            this.addStyle('bss-StandardHeader'), this.appendChild(this.standardContent = this.getDefaultContent()), this.standardContent.clickHandler = () => {
                this.slipdelegate.slipHeaderClicked();
            }, this.miniBetContainer = new a('bss-StandardHeader'), this.standardContent.appendMiniBetContainer(this.miniBetContainer);
        }
        getDefaultContent() {
            return new s({
                defaultContentToggleEditMode: () => {
                    this.slipdelegate.slipHeaderToggleEditMode();
                },
                defaultContentCloseClicked: () => {
                    this.slipdelegate.slipHeaderCloseClicked();
                },
                defaultContentLoginClicked: () => {
                    this.slipdelegate.slipHeaderLoginClicked();
                }
            }, 'bss-DefaultContent');
        }
        setBetCount(e) {
            this.standardContent.setBetCount();
            var t = i.GetCastCount();
            0 == e || 0 < t ? this.addStyle('bss-StandardHeader_HideHeaderOdds') : 1 != e && 0 != t || this.removeStyle('bss-StandardHeader_HideHeaderOdds'), Locator.validationManager.callNewContext(() => {
                this.miniBetContainer.isFullHeightOccupied() ? this.addStyle('bss-StandardHeader_MiniBets') : this.removeStyle('bss-StandardHeader_MiniBets');
            });
        }
        setOdds(e, t) {
            this.standardContent.setOdds(e || '', t);
        }
        setBonus(e) {
            this.standardContent.setBonus(e);
        }
        dispose() {
            this.standardContent && (this.standardContent.dispose(), this.miniBetContainer.dispose());
        }
        restore() {
            this.standardContent && this.standardContent.restore();
        }
        setHeaderDelegate(e) {
            this.slipdelegate = e;
        }
        insertMiniBet(e) {
            this.miniBetContainer.miniBetItemAdd(e);
        }
    }
    e.StandardHeader = l;
})(ns_betslipstandarduilib_ui_slip_header = ns_betslipstandarduilib_ui_slip_header || {}), (e => {
    var s, i = ns_gen5_ui.Component, a = ns_gen5_ui.Label, c = ns_mybetslib_util.MyBetsUtil, r = ns_postbootlib_util.OfferBadgesUtil;
    let t = s = class extends i {
        constructor(e, t, s) {
            super(), this.slip = e, this.betTrackModule = t, this.isBetBuilder = s, this.betIds = [], this.setTracked = e => {
                this.isTracked = e, this.betTrackButtonText.setVisible(!this.isTracked), this.checkMark.setVisible(this.isTracked), this.showTrackMessage(this.isTracked);
            };
        }
        createChildren() {
            this.addStyle('bss-BetTrackBannerReact'), super.createChildren();
            var e = new i(), t = (e.addStyle('bss-BetTrackBannerReact_NewBadge'), new a()), t = (t.setText(StandardLocaleHelper.GetTranslation('new')), e.appendChild(t), this.appendChild(e), new i()), e = (t.addStyle('bss-BetTrackBannerReact_MessageContainer'), new a()), e = (e.setText(StandardLocaleHelper.GetTranslation('trackOnHome')), t.appendChild(e), this.appendChild(t), new i());
            e.addStyle('bss-BetTrackBannerReact_Button'), this.betTrackButtonText = new a(), this.betTrackButtonText.setText(StandardLocaleHelper.GetTranslation('track')), e.appendChild(this.betTrackButtonText), this.checkMark = new i(), this.checkMark.setVisible(!1), this.checkMark.addStyle('bss-BetTrackBannerReact_Checkmark'), e.appendChild(this.checkMark), this.tooltipContainer = new i(), this.tooltipContainer.addStyle('bss-BetTrackBannerReact_TooltipContainer'), this.tooltipContainer.setVisible(!1), this.tooltipMessage = new a(), this.tooltipMessage.addStyle('bss-BetTrackBannerReact_TooltipText'), this.tooltipContainer.appendChild(this.tooltipMessage), e.appendChild(this.tooltipContainer), e.clickHandler = () => {
                var e;
                for (e of this.slip.getPlacedBets()) {
                    var t = e.tk + '';
                    this.betIds.push(t), this.betTrackAction(t, e, null);
                }
                var s, i = this.slip.getPlacedMultiples();
                this.slip.getDefaultMultiple() && 0 < this.slip.getDefaultMultiple().re && i.push(this.slip.getDefaultMultiple());
                for (s of i) {
                    var a = s.tk + '';
                    this.betIds.push(a), this.betTrackAction(a, null, s);
                }
            }, this.appendChild(e);
        }
        betTrackAction(t, e, s) {
            this.betIds.push(t);
            var e = this.betslipBetsDataConverter(e, s);
            -1 === this.betTrackModule.getTrackedBetIds().indexOf(t) ? this.betTrackModule.startTrackBet(e, this.setTracked, e => {
                this.setTracked(-1 < e.indexOf(t));
            }) : (this.betTrackModule.stopTrackBet(t, null == (e = null == (s = null == e ? void 0 : e.selections[0]) ? void 0 : s.classification) ? void 0 : e.toString(), !1), this.setTracked(!1));
        }
        showTrackMessage(e) {
            e = null != e ? e : this.isTracked;
            let t = 'bss-BetTrackBannerReact_TextTracking';
            this.tooltipMessage.removeStyle('bss-BetTrackBannerReact_TextTracking'), this.tooltipMessage.removeStyle('bss-BetTrackBannerReact_NotTracking'), e ? this.tooltipMessage.setText(StandardLocaleHelper.GetTranslation('tooltip')) : (t = 'bss-BetTrackBannerReact_NotTracking', this.tooltipMessage.setText(StandardLocaleHelper.GetTranslation('notrack'))), this.tooltipMessage.addStyle(t), this.tooltipContainer.setVisible(!0), window.setTimeout(() => {
                this.tooltipMessage.removeStyle(t), this.tooltipContainer.setVisible(!1);
            }, s.TOOLTIP_DISPLAY_MS);
        }
        betslipBetsDataConverter(t, s) {
            var i;
            if (t || s) {
                let e = [];
                s ? e = this.slip.getBets().filter(e => !e.be) : e.push(t);
                var a, t = e[0], l = {
                        betId: '',
                        selections: [],
                        betTypeText: s ? s.bd : '',
                        isFromBetslip: !0,
                        boostType: +(t.bx || 0),
                        odds: (s || t).od,
                        oddsTypeOverride: t.oo,
                        stake: (s || t).st,
                        topicId: null != (i = t.tp) ? i : '',
                        toReturn: (s || t).re,
                        isClosable: !0,
                        getTeamLogosEnabled: c.getTeamLogosEnabled,
                        badges: []
                    };
                for (a of e) {
                    var n = a.bb || !1, r = a.nf, d = [], o = a.pt, h = o[0];
                    if (n)
                        for (var p of o)
                            d.push({
                                participantId: p.pi,
                                playerId: p.pr,
                                marketDescription: p.bd,
                                PLBTID: p.pl,
                                handicapTarget: p.ha || '',
                                trackingDirection: p.bd || '',
                                handicap: p.hd,
                                market: p.md
                            });
                    r = {
                        fixtureDescription: a.fd,
                        fixtureStartTime: a.fx || '',
                        parentFixtureId: r,
                        leagueCode: a.lk,
                        betBuilderData: d,
                        classification: a.cl || 0,
                        singlesClassification: !s && a.cl || 0,
                        isBetBuilder: n,
                        handicap: h.hd,
                        fixtureBetName: h.bd,
                        marketDescription: this.isBetBuilder || 1 != o.length ? '' : h.md,
                        participantId: s ? +h.pi : +a.pi,
                        playerId: h.pr,
                        PLBTID: a.pl,
                        trackingDirection: h.bd || '',
                        handicapTarget: h.ha || ''
                    };
                    l.selections.push(r), l.betId = (s || a).tk;
                }
                return this.getOfferBadges(l, e), l;
            }
        }
        getOfferBadges(e, t) {
            var s, i, a, l = [];
            for (i of t) {
                let e = null != (s = i.ob) ? s : [];
                if (0 === e.length)
                    for (var n of null != (s = i.pt) ? s : [])
                        e = e.concat(null != (n = n.ob) ? n : []);
                for (let t of e)
                    t.oc && !l.some(e => e.code === t.oc) && (r.IsAccumulator(t.oc) ? (a = !(a = this.slip.getDefaultMultiple()) || null == (a = a.ap) ? void 0 : a.toString(), l.push({
                        code: t.oc,
                        bonus: a ? '+' + a + '%' : void 0
                    })) : l.push({ code: t.oc }));
            }
            e.badges = l;
        }
        static MakeAccessible(e) {
        }
    };
    t.TOOLTIP_DISPLAY_MS = 5000, t = s = __decorate([AccessibilityDelegate(t)], t), e.BetTrackBannerReact = t;
})(ns_betslipstandarduilib_ui_slip_controls_standard = ns_betslipstandarduilib_ui_slip_controls_standard || {}), (r => {
    var d, l = ns_gen5_ui.Component, i = ns_betslipcorelib_util.JackpotController, O = ns_betslipstandardlib_model_slip.StandardSlip, P = ns_betslipstandarduilib_ui_slip_header.StandardHeader, a = ns_betslipstandarduilib_ui_bet_standard.NormalBetItem, W = ns_betslipstandarduilib_ui_bet_standard.NoReservesBetItem, F = ns_betslipstandarduilib_ui_bet_standard.AutoVoidBetItem, N = ns_betslipstandarduilib_ui_bet_standard.EachwayBetItem, V = ns_betslipstandarduilib_ui_bet_standard.EwexBetItem, U = ns_betslipstandarduilib_ui_bet_standard.PitcherBetItem, t = ns_betslipstandarduilib_ui_bet_standard.PositionPayoutBetItem, h = ns_betslipstandarduilib_ui_bet_standard.BetBuilderBetItem, G = ns_betslipstandarduilib_ui_bet_standard.ScorecastBetItem, K = ns_betslipstandarduilib_ui_bet_controls_common.BetBuilderLogo, o = ns_betslipstandardlib_model_bet.BetBuilder, q = ns_betslipstandarduilib_ui_bet_standard.MultipleHeader, s = ns_betslipstandarduilib_ui_bet_standard.MultipleItem, z = ns_betslipuilib_ui_slip.ControlBar, n = ns_betslipuilib_ui_bet_keypad.Keypad, Y = ns_betslipstandarduilib_ui_slip_controls_standard.Footer, p = ns_betslipcorelib_constants.BetSlipResult, c = ns_gen5_ui.Label, u = ns_betslipcorelib_data.SlipType, $ = ns_betslipstandarduilib_ui_slip_controls_common.BetCreditsHeader, b = ns_webconsolelib_util.Browser, X = ns_betslipuilib_ui_slip.PlaceBetErrorMessage, Q = ns_betslipuilib_ui_slip.GeneralErrorMessage, m = ns_betslipuilib_ui_bet_keypad.Controller, j = ns_betslipuilib_ui_slip_livealerts.LiveAlertsHeader, g = ns_betslipcorelib_util.StorageHelper, C = ns_betslipuilib_util.TransitionHelper, S = ns_gen5_ui.DomElement, J = ns_gen5_util.Delegate, f = ns_betslipcorelib_constants.BetTypeLookupKey, E = ns_postbootlib_util.OfferBadgesUtil, Z = ns_betslipstandarduilib_ui_offerbadges.OfferBadgesDesktopContainer, A = ns_betslipcorelib_data.OfferTypeEnum, D = ns_betslipcorelib_data.SoccerExtraTimeEnum, ee = ns_betslipuilib_util.BetslipDepositManager, B = ns_gen5_util.PromotionalFilter, _ = ns_sitepreferenceslib_util.UserPreferences, y = ns_betslipcorelib_util.BetslipPreferences, te = ns_webconsolelib_modulecontainer.SingletonLoginModule, se = ns_webconsolelib_enum.LoginType, ie = ns_gen5_ui.Module, ae = ns_betslipcorelib_constants.OddsTypeOverride, le = ns_gen5_util.CurrencyFormatter, ne = ns_postbootlib_enum.MembersLinks, re = ns_navlib_util.WebsiteNavigationManager, de = ns_betslipuilib_util.AnimationHelper, x = ns_betslipuilib_enum.DisplayState, oe = ns_betslipuilib_ui_slip_header.ReceiptContent, k = ns_betslipcorelib_data.SelectionChangedBitmask, he = ns_betslipuilib_ui_slip_message.OpportunityChangeErrorMessage, pe = ns_betslipuilib_ui_slip_message.MessageManager, M = ns_betslipuilib_ui_slip_message.MessageContainerType, ce = ns_betslipuilib_ui_slip_message.MultiplesRestrictionsMessage, v = ns_betslipuilib_ui_slip_message.MessageProcessType, ue = ns_betslipuilib_ui_slip_message.TooltipMessage, w = ns_betslipuilib_ui_slip_message.BetslipReferralsMessage, be = ns_betslipuilib_ui_slip_message.BetreceiptReferralsMessage, me = ns_betslipuilib_ui_slip_message.BetCreditsFreeBetsMessage, T = ns_betslipuilib_ui_slip_message.GeneralMessage, e = ns_betslipuilib_ui_slip_message.RGLimitsMessage, I = ns_betslipuilib_ui_slip_message.DefaultMessage, ge = ns_betslipuilib_ui_slip_message.StakeTaxCoveredMessage, Ce = ns_betslipuilib_ui.TaxMessage, R = ns_betslipuilib_ui_slip_message.MessageType, Se = ns_accessibilityuilib_ui.LinkAccessibilityDelegate, fe = ns_betslipstandarduilib_ui_slip_controls_standard.ExcludedSnglesHeader, Be = ns_betslipstandarduilib_ui_slip_controls_standard.BetTrackBannerReact, _e = ns_betslipuilib_util.BetShareHelper, ye = ns_betslipreactlib.BetslipSlipStateContextManager, xe = ns_betslipcorelib_calcs_enum.BetslipPreferenceTypes, H = ns_betslipuilib_ui_slip.BetslipAutoReview, ke = ns_betslipuilib_ui_slip.BetreceiptAutoReviewTooltip, Me = ns_sitepreferenceslib_util.LocalStorage, ve = ns_gen5_config.PushedConfigPropertyChangeEvent, we = ns_bettrackloaderlib.BetTrackLoaderLib;
    let L = d = class extends l {
        constructor(e, t = null) {
            super(), this.delegate = e, this.defaultStyle = 'bss-StandardBetslip', this.bets = [], this.castBets = [], this.multiples = [], this.multiplesExpanded = !1, this.multiplesSuspended = !1, this.disposed = !1, this.castMultiples = 0, this.removeAllClicked = !1, this.invalidStakeResultCount = 0, this.betslipState = x.BetslipStateNone, this.slipTypeChanged = !1, this.model = t || this.createStandardSlip();
        }
        multiplesInvalidated() {
            this.validateMinimumOdds();
        }
        showAutoAcceptToggle() {
            var e = this.delegate.isAutoAcceptSupported(), t = +(Me.Get('acceptOddsChanges') || 0);
            return e && t === xe.ReviewAll && this.model.isPlaceBetRequestCompleted();
        }
        appendAutoAcceptToggle() {
            this.autoReviewPreference || (this.autoReviewPreference = new H(), this.footer.appendChildAt(this.autoReviewPreference, 1), this.autoReviewPreference.show());
        }
        isAutoAcceptSupported() {
            return this.delegate.isAutoAcceptSupported();
        }
        createStandardSlip() {
            return new O();
        }
        createFooter() {
            return new Y(this.model, this);
        }
        createHeader(e) {
            this.header = this.delegate.standardBetslipGetSlipHeader(), this.header || this.appendChild(this.header = new P(this.app)), this.header.setHeaderDelegate(e);
        }
        static InstallNormalBetItemType(e, t) {
            d.NormalBetItemTypes[e] || (d.NormalBetItemTypes[e] = t);
        }
        static InstallCastBetType(e, t) {
            d.CastBetItemTypes[e] || (d.CastBetItemTypes[e] = t);
        }
        restoreEditMode(e) {
            e ? (this.removeStyle('bss-StandardBetslip_EditModeNotActive'), this.addStyle('bss-StandardBetslip_EditMode'), this.controlBar && this.controlBar.setEditMode(), this.editModeActive = !0, this.setPluginBetItemsToEditMode()) : (this.addStyle('bss-StandardBetslip_EditModeNotActive'), this.removeStyle('bss-StandardBetslip_EditMode'), this.controlBar && this.controlBar.removeEditMode(), this.removePluginBetItemsFromEditMode(), this.editModeActive = !1);
        }
        restoreKeypad(e) {
            if (e) {
                for (var t of this.bets)
                    if (t.key() == e)
                        return void t.restoreKeypad();
                if (this.defaultMultiple && '' + this.defaultMultiple.model.key() == e)
                    this.defaultMultiple.restoreKeypad();
                else
                    for (var s of this.multiples)
                        if ('' + s.model.key() == e)
                            return void s.restoreKeypad();
            }
        }
        restoreSwipeDelete(e) {
            if (e.length)
                for (var t of e)
                    for (var s of this.bets)
                        t == s.key() && s.restoreSwipeDelete();
        }
        restoreBetCreditState(e) {
            this.betCreditsModeActive = e, this.betCreditsModeChanged = !0;
        }
        createChildren() {
            this.module = ie.getRoot(this), this.addStyle('bss-StandardBetslip'), this.animationHelper = new de(), b.addMouseModeDelegate(this), this.addStyle('bss-StandardBetslip-loading'), Locator.validationManager.callNewContext(() => {
                this.removeStyle('bss-StandardBetslip-loading'), this.validateNow();
            });
            var e = {
                    slipHeaderToggleEditMode: () => {
                        var e = this.editModeActive ? 'hide_options' : 'show_options';
                        window.bet365.messageBus.postMessageRequest('firebase.logEvent', {
                            name: e,
                            parameters: {
                                slip_type: g.GetBetslipType(),
                                site_section: 'Betslip'
                            }
                        }), this.editModeChanged = !0, this.invalidateProperties();
                    },
                    slipHeaderClicked: () => {
                        this.betslipState == x.BetslipStateCollapsed && (this.delegate.standardBetslipShowOverlay(0 < g.GetBetCount(), !1), this.multipleHeader && this.multipleHeader.switchToExpandedView(), this.footer && this.footer.switchToExpandedView(), this.animationHelper.collapsedToExpandedView(), this.messageManager.updateDisplayState(x.BetslipStateExpanded), this.setSlipDisplayState(x.BetslipStateExpanded), this.initialResize());
                    },
                    slipHeaderCloseClicked: () => {
                        var e = this.betslipState == x.BetslipStateExpanded ? 'collapse_betslip' : 'expand_betslip';
                        window.bet365.messageBus.postMessageRequest('firebase.logEvent', {
                            name: e,
                            parameters: {
                                slip_type: g.GetBetslipType(),
                                site_section: 'Betslip'
                            }
                        }), this.editModeActive && (this.removeStyle('bss-StandardBetslip_EditMode'), this.addStyle('bss-StandardBetslip_EditModeNotActive'), this.controlBar && this.controlBar.removeEditMode(), this.editModeActive = !1), this.betslipState == x.BetslipStateExpanded ? this.delegate.standardBetslipMinimise() : (this.delegate.standardBetslipShowOverlay(0 < g.GetBetCount(), !1), this.multipleHeader && this.multipleHeader.switchToExpandedView(), this.footer && this.footer.switchToExpandedView(), this.animationHelper.collapsedToExpandedView(), this.messageManager.updateDisplayState(x.BetslipStateExpanded), this.setSlipDisplayState(x.BetslipStateExpanded), this.initialResize());
                    },
                    slipHeaderDoneClicked: () => {
                        this.delegate.standardBetslipCollapse(), this.clearCouponHighlighting(), this.removeAllClicked = !0, this.model.removeAllItems(), this.removeRemainingStakeLimitContainer(), this.dispose();
                    },
                    slipHeaderLoginClicked: () => {
                        this.delegate.standardBetslipMinimise();
                    }
                }, e = (g.GetBetslipType() == u.BetBuilderBetslip && this.addStyle('bss-StandardBetslip_BetBuilder'), this.createHeader(e), {
                    controlBarRemoveAllClicked: () => {
                        window.bet365.messageBus.postMessageRequest('firebase.logEvent', {
                            name: 'remove_all_selections',
                            parameters: {
                                slip_type: g.GetBetslipType(),
                                site_section: 'Betslip'
                            }
                        }), this.removeAllClicked = !0, this.removeErrorMessage(), this.model.removeAllItems(), this.delegate.standardBetslipHideOverlay(), this.editModeChanged = !0, this.invalidateProperties();
                    },
                    controlBarUpdateBetslipType: e => {
                        e !== g.GetBetslipType() && (this.model.updateBetslipType(e), Locator.validationManager.callNewContext(() => {
                            this.delegate.standardBetslipSlipTypeChanged();
                        }));
                    },
                    controlBarCanSwitchSlipType: (e, t, s) => {
                        let i = 0;
                        for (var a of this.model.bets)
                            a instanceof o ? i += a.participants.length : a.getExcludedState() || (i += 1);
                        this.delegate.standardBetslipCanSwitchSlipType(e, i, t, s);
                    },
                    controlBarReuseSelections: () => {
                        this.betCreditsHeader && this.betCreditsHeader.reset(), this.delegate.standardBetslipReuseSelections && this.delegate.standardBetslipReuseSelections(), this.delegate.standardBetslipSetState(1), this.betslipState !== x.BetslipStateExpanded && this.delegate.standardBetslipHideOverlay();
                        let e = _.AdditionalPreferences(y).rememberQuickBetStake && g.GetCondensedSlipState();
                        this.model.reuseSelections(e, () => {
                            e || this.model.resetStakes();
                        }), this.toSlipFromReceipt(), this.liveAlertsHeader && (this.controlBar.removeChild(this.liveAlertsHeader), this.liveAlertsHeader.dispose(), this.liveAlertsHeader = null), this.removeRemainingStakeLimitContainer(), this.taxMessage && this.appendChildAt(this.taxMessage, 2);
                    }
                }), e = (this.appendChild(this.controlBar = new z(e, 'bss-ControlBar')), this.controlBar.betslipTypesOptionsUpdateCallBack(g.GetBetslipType()), this.animationHelper.registerControlbar(this.controlBar, this.betslipState), this.remainingLimitContainer = new l(), this.remainingLimitContainer.addStyle('bss-StandardBetslip_RemainingLimit-container'), this.appendChild(this.remainingLimitContainer), this.remainingLimitContainer.suspendElementFromDom(), this.contentWrapper = new l()), t = (e.addStyle('bss-StandardBetslip_ContentWrapper'), this.appendChild(e), this.contentArea = new l()), s = (t.addStyle('bss-StandardBetslip_Content'), e.appendChild(t), {
                    betCreditsHeaderChecked: () => {
                        this.betCreditsModeActive = !0, this.betCreditsModeChanged = !0, this.footer.toggleBonusValue('0'), this.betCreditsHeader.checked(), this.invalidateProperties(), this.model.normalBetInvalidateStakes();
                    },
                    betCreditsHeaderUnchecked: () => {
                        this.betCreditsModeActive = !1, this.betCreditsModeChanged = !0, this.betCreditsHeader.unChecked(), this.invalidateProperties(), this.model.normalBetInvalidateStakes();
                    }
                }), s = (this.expandedHeaderWrapper = new l(), this.expandedHeaderWrapper.addStyle('bss-StandardBetslip_ContentHeader'), this.betCreditsModeActive = g.GetUseBetCredits(), this.betCreditsHeader = new $(this.betCreditsModeActive, s), t.appendChild(this.expandedHeaderWrapper), this.offerBadgesWrapper = new l(), this.offerBadgesWrapper.addStyle('bss-StandardBetslip_OfferBadgesContainer'), t.appendChild(this.offerBadgesWrapper), n.ScrollWrapper = e, this.setHasSingles(!0), n.ContentWrapper = this.contentArea, this.selectionContainerTop = new l(), this.selectionContainerTop.addStyle('bss-StandardBetslip_SelectionTop'), t.appendChild(this.selectionContainerTop), new l());
            s.addStyle('bss-StandardBetslip_TopContainer'), t.appendChild(s), this.betBuilderLogoWrapper = new S(), this.betBuilderLogoWrapper.setAttribute('class', 'bss-StandardBetslip_BetBuilderLogoWrapper'), s.appendChild(this.betBuilderLogoWrapper), this.betBuilderLogo = new K(!1), this.betBuilderLogoWrapper.appendChild(this.betBuilderLogo), this.betBuilderDivider = new S(), t.appendChild(this.betBuilderDivider), this.betBuilderDivider.suspendElementFromDom(), this.singleDivider = new S(), t.appendChild(this.singleDivider), this.singleDivider.suspendElementFromDom(), this.castDivider = new S(), t.appendChild(this.castDivider), this.castDivider.suspendElementFromDom(), this.multiplesDivider = new S(), t.appendChild(this.multiplesDivider), this.multiplesDivider.suspendElementFromDom(), this.selectionContainerBottom = new l(), this.selectionContainerBottom.addStyle('bss-StandardBetslip_SelectionBottom'), t.appendChild(this.selectionContainerBottom), this.exSelectionContainerTop = new l(), this.exSelectionContainerTop.addStyle('bss-StandardBetslip_ExSelectionTop'), t.appendChild(this.exSelectionContainerTop), this.exSelectionContainerTop.setVisible(!1), this.excludedSngleDivider = new S(), this.excludedSngleDivider.setAttribute('class', 'test'), t.appendChild(this.excludedSngleDivider), this.excludedSngleDivider.suspendElementFromDom(), this.exSelectionContainerBottom = new l(), this.exSelectionContainerBottom.addStyle('bss-StandardBetslip_EXSelectionBottom'), t.appendChild(this.exSelectionContainerBottom), this.exSelectionContainerBottom.setVisible(!1), this.footer = this.createFooter(), this.appendChild(this.footer), this.header.getElement().addEventListener('touchmove', e => {
                e.preventDefault(), e.stopPropagation();
            }), this.footer.getElement().addEventListener('touchmove', e => {
                e.preventDefault(), e.stopPropagation();
            }), (this.model.getBetCount() || g.GetBetCount()) && this.editModeActive && (this.editModeActive = !1, this.removeStyle('bss-StandardBetslip_EditMode'), this.addStyle('bss-StandardBetslip_EditModeNotActive'), this.controlBar && this.controlBar.removeEditMode(), this.editModeActive = !1), this.invalidateHeight = !0, this.setModelDelegate(), this.documentResizeHandler = new J(this, () => {
                Locator.validationManager.callNewContext(() => {
                    this.calculateResize(), this.triggerResize();
                });
            }), ns_gen5_ui.Application.currentApplication.addEventListener(ns_gen5_events.ApplicationEvent.WIDTH_CHANGED, this.documentResizeHandler), this.headerWrapper = new l(), this.headerWrapper.addStyle('bss-StandardBetslip_HeaderWrapper'), this.appendChildAt(this.headerWrapper, 0), this.headerWrapper.appendChild(this.header), this.animationHelper.initialise(this, this.header, this.footer, this.contentWrapper), this.animationHelper.setSkipAnimations('1' === Locator.pushedConfig.getAttributeValue('BNA')), this.slipReload = 0 < g.GetBetCount(), this.animationHelper.registerMiscItem(this.offerBadgesWrapper, this.betslipState), this.animationHelper.registerMiscItem(this.expandedHeaderWrapper, this.betslipState), this.animationHelper.registerMiscItem(this.selectionContainerTop, this.betslipState), this.animationHelper.registerMiscItem(s, this.betslipState), this.animationHelper.registerMiscItem(this.selectionContainerBottom, this.betslipState), this.animationHelper.registerMiscItem(this.exSelectionContainerTop, this.betslipState), this.animationHelper.registerMiscItem(this.exSelectionContainerBottom, this.betslipState), this.condensedMessageContainer = new l(), this.expandedMessageContainer = new l(), this.collapsedMessageContainer = new l(), this.condensedAndExpandedMessageContainer = new l(), this.footer.appendChildAt(this.expandedMessageContainer, 1), this.footer.appendChildAt(this.condensedAndExpandedMessageContainer, 2), this.contentArea.appendChildAt(this.condensedMessageContainer, 0), this.appendChildAt(this.collapsedMessageContainer, 0), this.messageManager = new pe(), this.messageManager.registerMessageContainer(this.condensedMessageContainer, M.MessageContainerTypeCondensed), this.messageManager.registerMessageContainer(this.expandedMessageContainer, M.MessageContainerTypeExpanded), this.messageManager.registerMessageContainer(this.collapsedMessageContainer, M.MessageContainerTypeCollapsed), this.messageManager.registerMessageContainer(this.condensedAndExpandedMessageContainer, M.MessageContainerTypeCondensedAndExpanded), this.animationHelper.registerMessages(this.messageManager, this.expandedMessageContainer, this.condensedMessageContainer, this.collapsedMessageContainer), this.setVisible(this.betslipState != x.BetslipStateNone), StandardLocaleHelper.ShowTaxMessage(e => {
                this.receiptMode || this.receiptWrapper || (this.updateTaxMessage(e), this.model.normalBetInvalidateStakes());
            }), Locator.config.domain.hostname.match(/\.br$/) && (this.geoStorePermissionsFailedDelegate = new J(this, () => {
                this.model.setMessageKey('geo_services_blocked');
            }), ns_gen5_ui.Application.currentApplication.addEventListener('geoStorePermissionsFailed', this.geoStorePermissionsFailedDelegate));
        }
        addBetTrack() {
            var e = -1 < navigator.userAgent.indexOf('iPhone') || -1 < navigator.userAgent.indexOf('iPad');
            if (this.app && e && '1' === Locator.pushedConfig.getAttributeValue('BTBE')) {
                this.betTrackBanner && (this.receiptWrapper.removeChild(this.betTrackBanner), this.betTrackBanner = null);
                e = this.model.getBets();
                if (e && 0 !== e.length && this.checkValidBetTrackID()) {
                    var t, s = [], i = [];
                    for (t of e) {
                        var a = Number(t.cl), l = t.lk;
                        s.push(a), i.push(a + '~' + l);
                    }
                    if (r.StandardBetslip.app) {
                        let t = e.some(e => !!e.bb);
                        var e = e.some(e => 0 < (null != (e = e.re) ? e : 0)), n = this.model.getPlacedMultiples().length;
                        we.isBetTrackEnabled(s, i, t, e => {
                            e && (this.betTrackBanner = new Be(this.model, e, t), this.controlBar ? this.receiptWrapper.insertAfter(this.betTrackBanner, this.receiptContent) : this.receiptWrapper.appendChild(this.betTrackBanner));
                        }, e, n && 0 < n);
                    }
                }
            }
        }
        checkValidBetTrackID() {
            let s = this.model.getPlacedBets();
            if (0 != s.filter(e => {
                    var t;
                    return null != e.tk || (t = s.filter(e => null != e.tk).length, ErrorReporter.Trace('Bet Track Logging', 'Missing BetTrackId for single bet', `betType: ${ e.bm }, classification: ${ e.cl }, totalSingles: ${ s.length }, validSingles: ${ t }, odds: ${ e.od }, fixtureStartTime: ${ e.fx }, marketDescription: ${ e.md }, fixtureDescription: ${ e.fd }, fixtureId: ${ e.fi }, betBuilder: ${ e.bb }, slipState: ${ this.currentState }, slipResult: ` + this.currentSlipResult), !1);
                }).length)
                return !0;
            let i = this.model.getPlacedMultiples(), a = this.model.getDefaultMultiple();
            return 0 < (null == a ? void 0 : a.re) && i.push(a), 0 != i.filter(e => {
                var t;
                return null != e.tk || (t = i.filter(e => null != e.tk).length, ErrorReporter.Trace('Bet Track Logging', 'Missing BetTrackId for multiple bet', `betTypeId: ${ e.bt }, isDefault: ${ e === a }, totalMultiples: ${ i.length }, validMultiples: ${ t }, odds: ${ e.od }, betCount: ${ e.bc }, betRef: ${ e.br }, eachWay: ${ e.ew }, castBet: ${ e.cb }, slipState: ${ this.currentState }, slipResult: ` + this.currentSlipResult), !1);
            }).length;
        }
        showRemainingLimit(e) {
            this.remainingLimitContainer.removeAllChildren();
            var t = new l(), s = (t.addStyle('bss-StandardBetslip_RemainingLimit-column'), new c()), s = (s.addStyle('bss-StandardBetslip_RemainingLimit-title'), s.setText(StandardLocaleHelper.GetTranslation('monthlyStakeLimit')), t.appendChild(s), new l()), i = (s.addStyle('bss-StandardBetslip_RemainingLimit-amountcontainer'), new c()), a = new c(), e = le.ApplyDelimiterAndGroupSeparator(e.toString()), e = le.ApplyCurrencySymbol(e), e = (i.setText(e), StandardLocaleHelper.GetTranslation('amountRemaining')), e = (i.addStyle('bss-StandardBetslip_RemainingLimit-amount'), a.addStyle('bss-StandardBetslip_RemainingLimit-remaining'), a.setText(e.replace('{0}', '')), '{' == e.charAt(0) ? (s.appendChild(i), s.appendChild(a)) : (s.appendChild(a), s.appendChild(i)), t.appendChild(s), this.remainingLimitContainer.appendChild(t), new l());
            e.addStyle('bss-StandardBetslip_RemainingLimit-column2'), this.link = new c(), this.link.addStyle('bss-StandardBetslip_RemainingLimit-link'), this.link.setText(StandardLocaleHelper.GetTranslation('moreInformation')), this.link.clickHandler = () => re.NavigateTo(ne.RESPONSIBLE_GAMBLING, { data: { needsCard: !1 } }), e.appendChild(this.link), this.remainingLimitContainer.appendChild(e), this.remainingLimitContainer.unsuspendElementFromDom();
        }
        setVisible(e) {
            return e != this._visible && ((this._visible = e) ? this.removeStyle('bss-StandardBetslip-hidden') : this.addStyle('bss-StandardBetslip-hidden')), this;
        }
        mouseModeEnabled() {
            this.mouseMode = !0;
        }
        mouseModeDisabled() {
            this.mouseMode = !1;
        }
        setModelDelegate() {
            this.model.setDelegate(this);
        }
        commitProperties() {
            this.editModeChanged ? (this.editModeChanged = !1, this.editModeActive ? (this.removeStyle('bss-StandardBetslip_EditMode'), this.addStyle('bss-StandardBetslip_EditModeNotActive'), this.controlBar && this.controlBar.removeEditMode(), this.removePluginBetItemsFromEditMode(), this.editModeActive = !1) : (this.addStyle('bss-StandardBetslip_EditMode'), this.removeStyle('bss-StandardBetslip_EditModeNotActive'), this.controlBar && this.controlBar.setEditMode(), this.editModeActive = !0, this.setPluginBetItemsToEditMode())) : (this.betCreditsModeChanged && (this.betCreditsModeChanged = !1, this.model.setBetCreditMode(this.betCreditsModeActive), !E.BypassNoOffersCheck() && (B.IsExcludedFromPromotion('2') || B.IsExcludedFromOffers('2')) || this.appendOfferBadges(), this.betCreditsModeActive ? this.taxMessage && this.taxMessageBody.setText(StandardLocaleHelper.GetTranslation('NetReturnTax')) : this.taxMessage && this.taxMessageBody.setText(StandardLocaleHelper.GetTranslation('toReturnIncTaxLong'))), this.invalidateHeight && (this.invalidateHeight = !1, Locator.validationManager.callNewContext(() => {
                this.contentWrapper.setAttribute('style', 'max-height: ' + this.calculateResize() + 'px;');
            })), this.multiplesExpanded && this.multipleHeader.restoreMultiplesState(this.multiplesExpanded), Locator.validationManager.callNewContext(() => {
                for (var e of this.bets)
                    e.invalidateProperties();
            }));
        }
        setSlipDisplayState(e) {
            (this.betslipState = e) !== x.BetslipStateNone && i.setHasFooterStake(e !== x.BetslipStateExpanded), this.delegate.standardBetslipDisplayStateChanged(e), e == x.BetslipStateSingleCondensed || e == x.BetslipStateMultipleCondensed || e == x.BetslipStateBetBuilderCondensed || e == x.BetslipStateCondensedKeypad ? g.SetCondensedSlipStateActive() : g.SetCondensedSlipStateInactive(), this.setVisible(this.betslipState != x.BetslipStateNone);
            for (var t of this.bets)
                t.appendReactOffersContainer();
        }
        enableMouseMode() {
            for (var e of this.bets)
                e.invalidateProperties();
        }
        disableMouseMode() {
            this.controlBar && this.controlBar.removeEditMode();
            for (var e of this.bets)
                e.invalidateProperties();
        }
        initialResize() {
            this.toggleControlBar(), Locator.validationManager.callPostValidation(() => {
                this.calculateResize(), this.triggerResize();
            });
        }
        syncCouponWithSlip() {
            var e = g.GetKeys();
            if (ns_betslipcorelib_util.BetslipEvents.DispatchBetAddedEvents(e), g.GetBetslipType() == u.BetBuilderBetslip)
                for (var t of this.bets)
                    if (t instanceof h)
                        for (var s of t.getBetModel().participants) {
                            s = s.key().split('-');
                            BetSlipLocator.betSlipManager.addBetslipBetBuilderItem(s[0], s[1]), this.model.sendBetBuilderBetAddedEvent(s[0], s[1]);
                        }
        }
        calculateResize() {
            this.app = appLib('BetslipStandardUILibApp'), d.app = this.app;
            let e = window.innerHeight;
            this.app && (e = this.app.isFullViewportStandardSlip());
            var t = ns_gen5_ui.Application.currentApplication.height - e, s = this.footer.getElement().getBoundingClientRect().height || 50, i = this.header.getElement().getBoundingClientRect().height || 65, a = !this.app && ns_gen5_ui.Application.currentApplication.width < 950 ? 60 : 0;
            return this.allowableHeight = ns_gen5_ui.Application.currentApplication.height - i - s - 45 - t - a, this.taxMessage && (this.allowableHeight -= this.taxMessage.getElement().getBoundingClientRect().height), this.mouseMode && (this.allowableHeight -= 30), 1 < g.GetBetCount() && (this.allowableHeight -= 45), this.app && (this.receiptMode ? this.allowableHeight -= this.app.getMaxReceiptHeightOffset() : this.allowableHeight -= this.app.getMaxHeightOffset()), this.allowableHeight;
        }
        triggerResize() {
            this.contentWrapper.getInlineStyle().maxHeight = Math.floor(this.allowableHeight) + 'px';
        }
        wasRemoveAllClicked() {
            return this.removeAllClicked;
        }
        appendTaxMessage() {
            var e = new Ce(StandardLocaleHelper.GetTranslation('toReturnIncTaxLong'));
            this.condensedAndCollapsedTaxContainer = new l(), this.condensedAndCollapsedTaxContainer.addStyle('bss-StandardBetslip_BottomTaxMessageContainer'), this.expandedTaxContainer = new l(), this.expandedTaxContainer.addStyle('bss-StandardBetslip_TopTaxMessageContainer'), this.insertBefore(this.condensedAndCollapsedTaxContainer, this.footer), this.expandedHeaderWrapper.appendChild(this.expandedTaxContainer), this.condensedAndCollapsedTaxContainer.appendChild(e), this.expandedTaxContainer.appendChild(e.clone());
        }
        removeTaxMessage() {
            this.expandedTaxContainer && (this.removeChild(this.expandedTaxContainer), this.expandedHeaderWrapper.removeChild(this.expandedTaxContainer), this.expandedTaxContainer = null), this.condensedAndCollapsedTaxContainer && (this.removeChild(this.condensedAndCollapsedTaxContainer), this.condensedAndCollapsedTaxContainer = null);
        }
        updateTaxMessage(e) {
            e ? this.appendTaxMessage() : this.removeTaxMessage();
        }
        loadPlugin(e, t) {
            this.delegate.standardBetslipLoadPlugin(e, () => {
                t();
            });
        }
        maximumBetsAdded(e) {
            this.messageManager.add(new ue(e, ['20']), [
                M.MessageContainerTypeCondensed,
                M.MessageContainerTypeCollapsed
            ]);
        }
        duplicateBetAdded() {
            this.delegate.standardBetslipShowDuplicateBetMessage();
        }
        createNormalBetInstance(e) {
            return this.multipleHeader && this.multipleHeader.insertMiniBet(e), this.header.insertMiniBet(e), d.NormalBetItemTypes[e.betTypeLookupKey] ? new d.NormalBetItemTypes[e.betTypeLookupKey](e, this) : e instanceof o && new h(e, this);
        }
        createCastBetInstance(e) {
            return this.multipleHeader && this.multipleHeader.insertMiniBet(e), this.header.insertMiniBet(e), !!d.CastBetItemTypes[e.betTypeLookupKey] && new d.CastBetItemTypes[e.betTypeLookupKey](e, this);
        }
        insertNormalBet(e) {
            var t = this.bets.push(e);
            if (this.updateBetCount(t), e instanceof h ? (this.contentArea.insertBefore(e, this.betBuilderDivider), this.setHasBetBuildersState(!0)) : (this.contentArea.insertBefore(e, this.singleDivider), this.setHasSingles(!0)), 1 < t)
                for (let e of this.bets)
                    e.showMiniText && e.showMiniText();
            else
                1 == t && this.bets[0].hideMiniText && this.bets[0].hideMiniText();
            e instanceof h ? this.animationHelper.registerBetBuilderBetItem(e, this.betslipState) : this.animationHelper.registerNormalBetItem(e, this.betslipState), this.validateMinimumOdds();
        }
        setHasBetBuildersState(e) {
            e ? this.contentArea.addStyle('bss-StandardBetslip_HasBetBuilders') : this.contentArea.removeStyle('bss-StandardBetslip_HasBetBuilders');
        }
        setHasSingles(e) {
            e ? this.contentArea.removeStyle('bss-StandardBetslip_NoSingles') : this.contentArea.addStyle('bss-StandardBetslip_NoSingles');
        }
        insertCastBet(e) {
            this.castBets.push(e);
            var t = this.bets.push(e);
            this.updateBetCount(t), this.contentArea.insertBefore(e, this.castDivider), this.contentWrapper.unsuspendElementFromDom(), this.validateMinimumOdds(), this.slipReload || this.validateState(), this.delegate.standardBetslipOnNewSlipLoaded(), this.animationHelper.registerCastBetItem(e, this.betslipState);
        }
        getDefaultMultipleInstance(e) {
            return this.multipleHeaderUsed = !0, this.multipleHeader || new q(e, this);
        }
        insertDefaultMultiple(e) {
            this.multipleHeaderUsed = !0, this.multipleHeader = e, this.contentArea.insertBefore(this.multipleHeader, this.multiplesDivider), this.appendMultipleWrapper(), this.defaultMultiple = e, this.multiplesSuspended && this.multipleHeader.setVisible(!1), 0 === this.multiples.length && this.multipleHeader.hideMoreMultiplesButton(), this.multipleHeader.createMiniBets(this.model.bets), this.multipleHeader.createMiniBets(this.model.castBets), this.animationHelper.registerMultipleHeader(this.multipleHeader, this.betslipState), this.betslipState != x.BetslipStateExpanded || e.isCast ? e.isCast && this.bets.length === this.castBets.length && (this.multipleHeader.switchToCondensedView(), this.footer.switchToCondensedView()) : (this.multipleHeader.switchToExpandedView(), this.footer.switchToExpandedView());
        }
        createMultipleInstance(e) {
            return new s(e, this);
        }
        insertMultiple(e) {
            var t;
            this.multiples.push(e), this.appendMultipleWrapper(), e.isCast ? (this.castMultiples++, t = this.multipleWrapper.getElementChildren().length, this.multipleWrapper.appendChildAt(e, t)) : this.multipleWrapper.appendChild(e), this.multipleHeader && this.multipleHeader.showMoreMultiplesButton(), this.betslipState == x.BetslipStateMultipleCondensed && this.isCompatibleForCondensedView() && this.updateSkipUpdateAnimationSetting(!0), this.betslipState != x.BetslipStateSingleCondensed && this.betslipState != x.BetslipStateMultipleCondensed || (this.multipleHeader && this.multipleHeader.switchToCondensedView(), this.footer.switchToCondensedView());
        }
        appendMultipleWrapper() {
            this.multipleWrapper || (this.multipleWrapper = new l(), this.multipleWrapper.addStyle('bss-StandardBetslip_MultipleWrapper'), this.contentArea.insertBefore(this.multipleWrapper, this.multiplesDivider), this.addStyle('bss-StandardBetslip_Multiple'), this.multiplesSuspended && (this.multipleWrapper.suspendElementFromDom(), this.removeStyle('bss-StandardBetslip_Multiple')), this.animationHelper.registerMultipleWrapper(this.multipleWrapper, this.betslipState));
        }
        handleReferral(e, t) {
            this.messageManager.add(new w('MaxBetPartHeader', {
                placeNowAmount: e,
                referredAmount: t,
                tokenValues: null
            }), [
                M.MessageContainerTypeCondensed,
                M.MessageContainerTypeExpanded
            ]);
        }
        multiplesRestrictionChanged(e, t) {
            e ? this.messageManager.add(new ce('multiplesRestriction'), [M.MessageContainerTypeExpanded]) : this.messageManager.processMessage({ type: v.CloseMultiplesRestrictionsMessage }), this.multipleHeader && this.multipleHeader.multiplesRestrictedUpdated(), e ? this.addStyle('bss-StandardBetslip_MultiplesRestricted') : this.removeStyle('bss-StandardBetslip_MultiplesRestricted');
        }
        slipResultChanged(e, t) {
            ye.SetContextValue(t);
            var s, i = this.currentState;
            if (this.currentState = t, this.currentSlipResult = e, this.controlBar.unsetProcessing(), this.footer.enable(), e !== p.noStakeProvided && (this.invalidStakeResultCount = 0, this.removeStyle('bss-StandardBetslip_NoStake')), e === p.betCreationFailed)
                Locator.validationManager.callNewContext(() => {
                    this.delegate.standardBetslipExpand(), this.delegate.standardBetslipSetState(-10), this.showErrorMessage(p.generalError);
                }), this.offerBadgesContainer && this.offerBadgesWrapper && (this.offerBadgesWrapper.removeChild(this.offerBadgesContainer), this.offerBadgesContainer = null);
            else {
                if (e === p.noStakeProvided)
                    this.hasStyle('bss-StandardBetslip_NoStake') && this.removeStyle('bss-StandardBetslip_NoStake'), this.invalidStakeResultCount++, 3 <= this.invalidStakeResultCount && Locator.validationManager.callNewContext(() => {
                        this.addStyle('bss-StandardBetslip_NoStake');
                    });
                else if (e === p.notLoggedIn) {
                    if (te.LaunchLogin(se.BETSLIP), 0 == t)
                        return this.header.setBetCount(0), void this.delegate.standardBetslipCollapse();
                } else if (e === p.referralDeclined) {
                    this.removeStyle('bss-StandardBetslip_InProgress');
                    for (var a of this.bets)
                        a.slipResultChanged(p.referralDeclined);
                    this.checkFullReferralApproveDecline(e), 3 != t && this.toBetslipFromReferral();
                } else {
                    if (e === p.failed || e === p.generalError)
                        return this.removeStyle('bss-StandardBetslip_InProgress'), this.toBetslipFromReferral(), this.offerBadgesContainer && this.offerBadgesWrapper && (this.offerBadgesWrapper.removeChild(this.offerBadgesContainer), this.offerBadgesContainer = null), void (2 == t ? (this.showErrorMessage(e), this.controlBar.suspendElementFromDom(), this.expandedHeaderWrapper.suspendElementFromDom(), this.model.removeAllItems(), this.delegate.standardBetslipSetState(2)) : (this.delegate.standardBetslipSetState(t), this.footer.placeBetResultChanged(e, t), this.multipleHeader && this.multipleHeader.slipResultChanged(e)));
                    if (e == p.sessionLocked && -10 == i)
                        this.contentWrapper.unsuspendElementFromDom(), this.toBetslipFromReferral();
                    else if (e == p.invalidSelectionCount)
                        this.updateBetCount(this.model.getBetCount());
                    else {
                        if (e == p.duplicateSelection)
                            return this.removeStyle('bss-StandardBetslip_InProgress'), this.addStyle('bss-StandardBetslip_Error'), this.header.unsuspendElementFromDom(), this.messageManager.processMessage({ type: v.CloseBetslipReferralsMessage }), void this.showErrorMessage(p.failed);
                        if (e == p.stakeAboveMinimum || e == p.stakeAboveMaximum)
                            for (var l of this.bets)
                                l instanceof h && l.slipResultChanged(e);
                        else if (e == p.LineItemsAboveMaxStakesShortfall || e == p.LineItemsAboveMaxStakesShortfallDeposit)
                            for (var n of this.bets)
                                n.slipResultChanged(e);
                        else {
                            if (e == p.oddsBelowMinimum && !this.defaultMultiple)
                                return this.removeStyle('bss-StandardBetslip_InProgress'), this.model.getMultiplesRestricted() || this.validateMinimumOdds(), void this.footer.placeBetResultChanged(e, t);
                            if (e == p.multipleOddsBelowMinimum)
                                return this.removeStyle('bss-StandardBetslip_InProgress'), void (this.model.getMultiplesRestricted() || this.footer.disable());
                            if (2 == t && (e === p.challengeRequired || e == p.geoComplyFailed))
                                return this.removeStyle('bss-StandardBetslip-Error'), this.removeStyle('bss-StandardBetslip_InProgress'), this.delegate.standardBetslipSetState(t), this.footer.placeBetResultChanged(e, t), s = new ns_gen5_ui.ModuleContainerAs(), this.app && ErrorReporter.Trace(this, 'Issuing a challenge for the App incorrectly', `UserName: ${ Locator.user.username }, BetCount: ` + this.bets.length), s.load(ns_webconsolelib_util.ModuleName.AUTHENTICATOR_MODULE), void s.invoke(e => {
                                    e.delegate = {
                                        authenticatorModuleComplete: () => {
                                            this.model.validateAndPlaceBet();
                                        },
                                        authenticatorModuleExit: () => {
                                            this.delegate.standardBetslipHideOverlay();
                                        }
                                    };
                                });
                        }
                    }
                }
                if (-10 == t || 11 == t) {
                    this.delegate.standardBetslipShowOverlay(!1, !1), this.messageManager.processMessage({ type: v.CloseHandicapContingencyMessage }), this.messageManager.processMessage({ type: v.CloseRGLimitsMessage }), this.messageManager.processMessage({ type: v.CloseInvalidFundsMessage }), this.messageManager.processMessage({ type: v.CloseDefaultMessage }), this.addStyle('bss-StandardBetslip_InProgress'), this.controlBar.setProcessing(), this.editModeActive && (this.removeStyle('bss-StandardBetslip_EditMode'), this.addStyle('bss-StandardBetslip_EditModeNotActive'), this.controlBar && this.controlBar.removeEditMode(), this.removePluginBetItemsFromEditMode(), this.editModeActive = !1);
                    for (var r of this.bets)
                        r.resetUI();
                    m.HideKeypad();
                } else if (3 == t && e != p.referralDeclined) {
                    m.HideKeypad(), this.invalidStakeResultCount = 0;
                    let n = !1, r = !1, d = !1;
                    !E.BypassNoOffersCheck() && (B.IsExcludedFromPromotion('2') || B.IsExcludedFromOffers('2')) || this.appendOfferBadges(), this.toSlipReceipt(), Locator.validationManager.callNewContext(() => {
                        let t = !1;
                        if (this.multipleHeader) {
                            if (!this.multiplesSuspended) {
                                n = !this.multipleHeader.isCast && this.multipleHeader.hasStake, r = this.multipleHeader.isCast && this.multipleHeader.hasStake, this.multipleHeader.setStateForReceipt();
                                for (var s of this.multiples)
                                    n = n || !s.isCast && s.hasStake, r = r || s.isCast && s.hasStake, d = d || s.hasStake, s.setStateForReceipt();
                                n ? this.addStyle('bss-StandardBetslip_HasMultipleStake') : this.addStyle('bss-StandardBetslip_NoMultipleStake'), (n && !r || !n && r) && this.multipleHeader.addStyle('bss-StandardBetslip_Item-noborder');
                                let e = !1;
                                t = n;
                                for (var i of this.bets)
                                    i.showBetBreakDown ? (e = e || i.castBetObject().hasStake, i.setStateForReceipt(r)) : (i instanceof h && (t = t || i.model && 0 < i.model.getStake()), i.setStateForReceipt(n));
                            }
                        } else if (!this.multipleHeader) {
                            let e = !1;
                            for (var a of this.multiples)
                                if (a.hasStake) {
                                    e = !0;
                                    break;
                                }
                            for (var l of this.bets)
                                l.setStateForReceipt(e);
                        }
                        this.setReceiptBetBuilderHeader(n);
                    });
                    for (var o of this.bets)
                        o.setAdditionalReceiptProperties && o.setAdditionalReceiptProperties();
                    this.toBetslipFromReferral(), this.controlBar.setReceiptMode(), this.addStyle('bss-StandardBetslip-receipt'), this.removeStyle('bss-StandardBetslip_InProgress'), this.taxMessage && this.contentArea.appendChild(this.taxMessage), this.contentWrapper.getElement().scrollTop = 0, this.checkFullReferralApproveDecline(e);
                } else
                    4 != t && (7 == t ? e == p.success ? this.toBetslipFromReferral() : this.removeStyle('bss-StandardBetslip_InProgress') : (this.removeStyle('bss-StandardBetslip_InProgress'), this.removeStyle('bss-StandardBetslip-Error'), this.messageManager.processMessage({ type: v.CloseHandicapContingencyMessage }), this.messageManager.processMessage({ type: v.CloseRGLimitsMessage }), this.messageManager.processMessage({ type: v.CloseDefaultMessage }), this.messageManager.processMessage({ type: v.CloseInvalidFundsMessage }), e !== p.LineItemsAboveMaxStakesShortfall && e !== p.stakeAboveMaximum && e !== p.userDailyStakeLimitExceeded && this.clearReferralsMessages(), e == p.failed || 7 != i && 11 != i || this.toBetslipFromReferral()));
                this.delegate.standardBetslipSetState(t), this.footer.placeBetResultChanged(e, t), this.multipleHeader && this.multipleHeader.slipResultChanged(e), e === ns_betslipcorelib_constants.BetSlipResult.success && this.messageManager.processMessage({ type: v.AcceptChanges }), 3 == t && this.messageManager.processMessage({ type: v.ReceiptBetCreditsFreeBetsMessage });
            }
        }
        validateAndReset() {
            this.footer.validateAndReset();
        }
        setReceiptBetBuilderHeader(e) {
            let t = e;
            if (!t)
                for (var s of this.bets)
                    if (s instanceof h && s.model && !s.model.getPlayerBuilder() && 0 < s.model.getStake()) {
                        t = !0;
                        break;
                    }
            t && this.addStyle('bss-StandardBetslip_HasBetBuilders-withstake');
        }
        clearReferralsMessages() {
            this.messageManager.processMessage({ type: v.CloseBetslipReferralsMessage });
            for (var e of this.bets)
                e.hideReferralMessage && e.hideReferralMessage();
            this.defaultMultiple && this.defaultMultiple.hideReferralMessage && this.defaultMultiple.hideReferralMessage();
            for (var t of this.multiples)
                t.hideReferralMessage && t.hideReferralMessage();
            for (var s of this.castBets)
                s.hideReferralMessage && s.hideReferralMessage();
        }
        selectionsChanged(e) {
            let t = '';
            e & k.Plural && (t += 'Multiple'), e & k.LinesChanged && (t += 'Line'), e & k.OddsChanged && (t += 'Odds'), e & k.AvailabilityChanged && (t += 'Availability'), e & k.OfferOddsChanged && (t += 'FreeBetOfferOdds'), t += 'Changed', this.footer.selectionsChanged(t), this.messageManager.add(new he(t), [
                M.MessageContainerTypeCondensed,
                M.MessageContainerTypeExpanded
            ]);
        }
        geoComplyFailedRemoveOverlay() {
            this.removeStyle('bss-StandardBetslip_InProgress'), this.delegate.standardBetslipHideOverlay();
        }
        removeStandardBetslipInProgressState() {
            this.removeStyle('bss-StandardBetslip_InProgress');
        }
        messageChanged(t, s) {
            if ('selections_changed' !== t && '' !== t)
                if (t === w.REFERRAL_DECLINED_MESSAGE_KEY)
                    this.messageManager.add(new w(t, {
                        placeNowAmount: 0,
                        referredAmount: 0,
                        tokenValues: s.split('|')
                    }), [
                        M.MessageContainerTypeCondensed,
                        M.MessageContainerTypeExpanded
                    ]), this.footer.setPlaceButtonDisable();
                else if (w.MaxStakesMessagesLookup[t] || w.MaxStakesMessagesLookup['MaxBet_' + t] || w.MaxLiabilityMessagesLookup[t])
                    this.messageManager.add(new w(t, {
                        placeNowAmount: 0,
                        referredAmount: 0,
                        tokenValues: s.split('|')
                    }), [
                        M.MessageContainerTypeCondensed,
                        M.MessageContainerTypeExpanded
                    ]);
                else if (t == T.INVALID_HANDICAP_CONTINGENCY)
                    this.messageManager.add(new T(t, R.HandicapContingencyMessage, s), [
                        M.MessageContainerTypeCondensed,
                        M.MessageContainerTypeExpanded
                    ]);
                else if (t === e.BET_EXCEEDS_MONTHLY_STAKE_LIMIT || t === e.BET_EXCEEDS_MONTHLY_LOSS_LIMIT || t === e.BET_EXCEEDS_WEEKLY_STAKE_LIMIT || t === e.BET_EXCEEDS_WEEKLY_LOSS_LIMIT || t === e.BET_EXCEEDS_DAILY_STAKE_LIMIT || t === e.BET_EXCEEDS_DAILY_LOSS_LIMIT)
                    this.messageManager.add(new e(t), [
                        M.MessageContainerTypeCondensed,
                        M.MessageContainerTypeExpanded
                    ]);
                else if (t === T.MINIMUM_ODDS_RESTRICTION)
                    this.messageManager.add(new T(t, R.RestrictedOddsMessage, s), [
                        M.MessageContainerTypeCondensed,
                        M.MessageContainerTypeExpanded
                    ]);
                else if (t === T.INVALID_FUNDS)
                    this.messageManager.add(new T(T.INVALID_FUNDS, R.InvalidFunds), [
                        M.MessageContainerTypeCondensed,
                        M.MessageContainerTypeExpanded
                    ]);
                else if (t === T.Line_Items_Above_Max_Stakes_Shortfall)
                    this.messageManager.add(new T(T.INVALID_FUNDS, R.InvalidFundsDeposit), [
                        M.MessageContainerTypeCondensed,
                        M.MessageContainerTypeExpanded
                    ]);
                else if (t === T.INVALID_BETCREDIT_DEPSOSIT_FUNDS)
                    this.messageManager.add(new T(t, R.InvalidFunds), [
                        M.MessageContainerTypeCondensed,
                        M.MessageContainerTypeExpanded
                    ]);
                else if (t === T.SELF_EXCLUDED_REGULATOR) {
                    let e = s;
                    if (s) {
                        var i = s.split(','), i = Array.from(new Set(i));
                        let t = {
                            1: StandardLocaleHelper.GetTranslation('sportsBetting'),
                            2: StandardLocaleHelper.GetTranslation('horseRacing'),
                            3: StandardLocaleHelper.GetTranslation('horseRacing'),
                            10: StandardLocaleHelper.GetTranslation('virtualSports')
                        };
                        i = i.map(e => {
                            e = e.trim();
                            return t[e] || e;
                        }), i = Array.from(new Set(i));
                        e = i.join(',');
                    }
                    this.messageManager.add(new T(t, R.SelfExcluded, e), [
                        M.MessageContainerTypeCondensed,
                        M.MessageContainerTypeExpanded
                    ]), this.footer.disable();
                } else
                    t && -1 < t.indexOf('geo_complyfailed') ? this.messageManager.add(new I(t, ns_betslipuilib_ui_slip_message.HelpLink), [
                        M.MessageContainerTypeCondensed,
                        M.MessageContainerTypeExpanded
                    ]) : t && -1 < t.indexOf('geo_services_blocked') ? (ns_betslipuilib_ui_slip_message.HelpLink.GeoLocationHelpLink = 'puw|' + Locator.config.domain.helpHost + '/technical-support/faqs?lng={LiD}|Members|Height=600,Width=800,statusbar=no,scrollbars=yes', this.messageManager.add(new I(t, ns_betslipuilib_ui_slip_message.HelpLink), [
                        M.MessageContainerTypeCondensed,
                        M.MessageContainerTypeExpanded
                    ])) : t && -1 == d.MessageKeysToSkip.indexOf(t) && this.messageManager.add(new I(t, null, null, s), [
                        M.MessageContainerTypeCondensed,
                        M.MessageContainerTypeExpanded
                    ]);
        }
        closeInvalidFundsDepositMessage() {
            this.messageManager.processMessage({ type: v.InvalidFundsDeposit });
        }
        betslipTypesChanged(e, t) {
            this.controlBar.setBetslipTypes(e, t);
        }
        updateTotalStake(e) {
            0 < e && this.removeStyle('bss-StandardBetslip_NoStake'), this.footer.updateTotalStake(e);
            let t = 0, s = 0;
            for (var i of this.bets) {
                var i = i.getBetModel(), a = i.getTotalStake ? i.getTotalStake() : i.getStake(), i = i.getReferralPlaceAmount ? i.getReferralPlaceAmount() : 0, l = 0 < i ? a - i : 0;
                0 < l && (s += l), t += a < i ? a : i;
            }
            var n, r, d;
            this.defaultMultiple && (n = (r = this.defaultMultiple.getBetModel()).getTotalStake ? r.getTotalStake() : r.getStake(), 0 < (d = 0 < (r = r.getReferralPlaceAmount ? r.getReferralPlaceAmount() : 0) ? n - r : 0) && (s += d), n < r ? t += n : isNaN(r) || (t += r)), t >= e || 3 === this.currentState ? this.messageManager.processMessage({ type: v.CloseBetslipReferralsMessage }) : 0 < this.model.getReferralAmount() && 3 !== this.currentState && this.messageManager.add(new w('MaxBetPartHeader', {
                placeNowAmount: t,
                referredAmount: s,
                tokenValues: null
            }), [M.MessageContainerTypeCondensed]);
        }
        updateBetCreditsStake(e, t, s, i) {
            !E.BypassNoOffersCheck() && (B.IsExcludedFromPromotion('2') || B.IsExcludedFromOffers('2')) || this.appendOfferBadges(), this.footer.toggleNetReturn(e, s), 'NaN' == e ? (this.messageManager.add(new T('SplitError', R.BetCreditsSplitErrorMessage, null, 'bss-BetCreditsSplitErrorMessage'), [M.MessageContainerTypeExpanded]), this.footer.setPlaceButtonDisable()) : (this.messageManager.processMessage({ type: v.CloseBetCreditsSplitErrorMessage }), 0 < +e || 0 < +s || this.betCreditsModeActive || this.betCreditsHeader.canShowBetMessage() ? this.messageManager.add(new me(e, t, s, !1, 'bss-BetCreditsFreeBetsMessage', i), [M.MessageContainerTypeCondensedAndExpanded]) : this.messageManager.processMessage({ type: v.CloseBetCreditsFreeBetsMessage }));
        }
        enableBetCredits() {
        }
        disableBetCredits() {
        }
        returnAmountUpdated(e) {
            0 < e ? this.addStyle('bss-StandardBetslip_HasReturns') : this.removeStyle('bss-StandardBetslip_HasReturns'), this.footer.updateReturnValue(e);
        }
        winningsBoostUpdated(e, t) {
            this.footer.updateWinningsBoostValue(e, t);
        }
        returnBonusValue(e) {
            B.IsExcludedFromPromotion('2') || B.IsExcludedFromOffers('2') || this.footer.updateBonusValue(e);
        }
        updateBetCount(e) {
            this.header.setBetCount(e);
        }
        checkBetBuilderPlusStatus(e) {
            let t = 0, s = 0, i = 0, a = 0;
            for (var l of this.bets)
                l instanceof h && !l.model.getPlayerBuilder() && (t++, i += l.model.participants.length, this.model.getIsRacingClassification(l.getBetModel().getClassificationId())) && a++, l.getBetModel().getExcludedState && l.getBetModel().getExcludedState() && s++;
            t + s === e ? this.multipleHeader.setBetBuilderPlusHeaders(t, i, 0, a) : this.multipleHeader.setBetBuilderPlusHeaders(0, 0, 0, 0);
        }
        setSlipState(e) {
            this.slipResultChanged(e, this.model.getCurrentState()), this.footer.placeBetResultChanged(e, this.model.getCurrentState());
        }
        updateHeaderOdds(e, t) {
            this.header.setOdds(e, t);
        }
        multipleHeaderUpdateHeaderOdds(e, t) {
            this.header.setOdds(e, t);
        }
        updateHeaderBonus(e) {
            B.IsExcludedFromPromotion('2') || B.IsExcludedFromOffers('2') || E.Initialise(() => {
                this.header.setBonus(e);
            });
        }
        currentStateChanged(e) {
            3 === e && this.addStyle('bss-StandardBetslip-receipt');
        }
        setBetReference(e) {
            StandardLocaleHelper.RequiresReferenceOnBetItem() || this.receiptContent.setBetReference(e);
        }
        showQuickDeposit(e, t) {
            ee.InitiateDeposit(e, t, () => {
                this.delegate.standardBetslipHideQuickDeposit(), this.model.validateAndPlaceBet();
            }, () => {
                this.delegate.standardBetslipHideQuickDeposit(), this.model.clearQuickDesposit(), this.betslipState !== x.BetslipStateExpanded && this.delegate.standardBetslipHideOverlay(), this.displaySlip();
            }, ns_webconsolelib_enum.QuickDepositOrigin.BetSlip, () => this.hideSlip(), () => this.displaySlip());
        }
        displaySlip() {
            this.betslipState == x.BetslipStateExpanded && this.delegate.standardBetslipShowOverlay(!1, !1), this.delegate.standardBetslipSetState(1), this.animationHelper.slideSlipUp(), this.autoReviewPreference && this.autoReviewPreference.refresh();
        }
        hideSlip() {
            this.animationHelper.slideSlipDown();
        }
        showErrorMessage(e) {
            e == p.failed ? this.placeBetErrorMessage || (this.placeBetErrorMessage = new X(this), this.appendErrorComponent(this.placeBetErrorMessage)) : this.generalErrorMessage || (e = this.generalErrorMessage = new Q(this), this.appendErrorComponent(e));
        }
        appendErrorComponent(e) {
            this.appendChildAt(e, 1), this.addStyle('bss-StandardBetslip_Error'), this.removeStyle('bss-StandardBetslip-reciept'), this.expandedHeaderWrapper.suspendElementFromDom(), this.controlBar.suspendElementFromDom(), this.contentWrapper.suspendElementFromDom(), this.contentArea.suspendElementFromDom(), this.headerWrapper.suspendElementFromDom(), this.footer.suspendElementFromDom(), this.suspendBetslipComponents(), this.messageManager.dispose(), g.Clear(), Locator.validationManager.callLater(() => {
                this.delegate && this.delegate.standardBetslipExpand();
            });
        }
        removeErrorMessage() {
            this.placeBetErrorMessage && (this.removeChild(this.placeBetErrorMessage), this.placeBetErrorMessage = null), this.generalErrorMessage && (this.removeChild(this.generalErrorMessage), this.generalErrorMessage = null), this.removeStyle('bss-StandardBetslip_Error'), this.expandedHeaderWrapper.unsuspendElementFromDom(), this.controlBar.unsuspendElementFromDom(), this.contentWrapper.unsuspendElementFromDom(), this.contentArea.unsuspendElementFromDom(), this.headerWrapper.unsuspendElementFromDom(), this.footer.unsuspendElementFromDom(), this.unsuspendBetslipComponents();
        }
        placeBetErrorMessageGotoMybetsClicked() {
            this.delegate.standardBetslipCollapse(() => {
                this.removeErrorMessage(), this.postErrorCleanup();
            }), this.clearCouponHighlighting();
        }
        generalErrorMessageRemoveClicked() {
            this.delegate.standardBetslipCollapse(() => {
                this.postErrorCleanup();
            }), this.clearCouponHighlighting();
        }
        postErrorCleanup() {
            this.removeAllClicked = !0, this.model.removeAllItems(), this.setHasSingles(!0), this.setHasBetBuildersState(!1), this.removeRemainingStakeLimitContainer(), this.animationHelper.closeView(() => {
                this.removeErrorMessage(), this.dispose();
            });
        }
        liveAlertsReceived(e) {
            if (b.notification()) {
                this.liveAlertsHeader && (this.controlBar.removeChild(this.liveAlertsHeader), this.liveAlertsHeader.dispose(), this.liveAlertsHeader = null);
                for (var t of e)
                    for (var s of this.bets)
                        s.getBetModel().getParentFixtureId && s.getBetModel().getParentFixtureId() === t.fixtureId + '' && t.betDelegate.push(s);
                this.liveAlertsHeader = new j(e, () => {
                    this.expandToShowMultiples();
                }), this.controlBar.appendChildAt(this.liveAlertsHeader, 0);
            }
        }
        multipleHeaderHasRstrictedMultiples() {
            return this.model.getMultiplesRestricted();
        }
        multipleHeaderGetOddsTypeOverride() {
            return Locator.user.oddsTypeId == ns_gen5_util.OddsType.AMERICANFRACTIONAL || Locator.user.oddsTypeId == ns_gen5_util.OddsType.FRACTIONAL ? this.model.getOddsTypeOverride() : ae.NONE;
        }
        multipleHeaderGetMultiplesCount() {
            return this.multipleWrapper ? this.multipleWrapper.getElementChildren().length : 0;
        }
        expandMultiples() {
            window.bet365.messageBus.postMessageRequest('firebase.logEvent', {
                name: 'expand_more_multiples',
                parameters: {
                    slip_type: g.GetBetslipType(),
                    site_section: 'Betslip'
                }
            }), this.animationHelper.expandMoreMultiples();
        }
        multipleHeaderExpandMultiples() {
            this.expandMultiples();
        }
        collapseMultiples() {
            window.bet365.messageBus.postMessageRequest('firebase.logEvent', {
                name: 'collapse_more_multiples',
                parameters: {
                    slip_type: g.GetBetslipType(),
                    site_section: 'Betslip'
                }
            }), this.animationHelper.collapseMoreMultiples();
        }
        multipleHeaderCollapseMultiples() {
            this.collapseMultiples();
        }
        restoreMultipleHeaderState(e) {
            this.multipleHeader && Locator.validationManager.callPostValidation(() => {
                e ? this.expandMultiples() : this.collapseMultiples();
            });
        }
        multipleRemoved(s) {
            if (s == this.defaultMultiple)
                if (this.betslipState == x.BetslipStateExpanded || this.removeAllClicked || this.multiplesSuspended || 0 == this.model.bets.length || this.betslipState == x.BetslipStateCollapsed) {
                    this.defaultMultiple = null, this.multipleHeader = null, this.animationHelper.unRegisterMultipleHeader(), 3 !== this.currentState && g.GetBetslipType() !== u.BetBuilderBetslip && (this.contentWrapper.getInlineStyle().overflow = 'hidden');
                    var i = this.animationHelper.getSkipAnimations() ? 0 : 0.25;
                    C.HideElementTransition(s, !0, i, () => {
                        this.contentWrapper.getInlineStyle().removeProperty('overflow');
                    }, !0);
                } else {
                    let t = this.getModelCountInfo();
                    var i = 1 == t.nonexcludedCount && 0 == t.betbuilderCount || 1 == t.betbuilderCount && 0 == t.nonexcludedCount;
                    this.updateSkipUpdateAnimationSetting(i), this.multipleHeaderUsed = !1;
                    let e = this.multipleHeader;
                    this.animationHelper.addToQueue(() => {
                        (0 < this.model.bets.length || 0 < this.model.castBets.length) && this.animationHelper.multipleToSingleCondensedVew(e, () => {
                            var e;
                            this.contentArea.removeChild(s), !this.multipleHeaderUsed && this.multipleHeader && (this.multipleHeader.dispose(), this.multipleHeader = null, this.animationHelper.unRegisterMultipleHeader(), this.updateFooterModel(), this.footer.toggleBonusValue('0')), this.betslipState === x.BetslipStateMultipleCondensed && (e = 1 == t.nonexcludedCount && 0 == t.betbuilderCount ? x.BetslipStateSingleCondensed : x.BetslipStateBetBuilderCondensed, this.messageManager.updateDisplayState(e), this.setSlipDisplayState(e));
                        }), 0 == this.model.bets.length && 0 == this.model.castBets.length && this.multipleHeader && (this.contentArea.removeChild(this.multipleHeader), this.multipleHeader.dispose(), this.multipleHeader = null, this.animationHelper.unRegisterMultipleHeader(), this.updateFooterModel(), this.footer.toggleBonusValue('0'));
                    });
                }
            else
                -1 < this.multiples.indexOf(s) && this.multipleWrapper && (i = this.multiples.indexOf(s), this.multiples.splice(i, 1), this.multipleWrapper.removeChild(s));
            !this.multiples.length && this.multipleWrapper && (this.contentArea.removeChild(this.multipleWrapper), this.removeStyle('bss-StandardBetslip_Multiple'), this.animationHelper.unRegisterMultipleWrapper(), this.multipleWrapper = null, this.multipleHeader) && this.multipleHeader.hideMoreMultiplesButton(), this.footer.toggleBonusValue('0');
        }
        multipleItemRemoved(e) {
            this.multipleRemoved(e);
        }
        multipleHeaderMultipleRemoved(e) {
            this.multipleRemoved(e);
        }
        normalBetItemBetRemoved(e) {
            this.unRegisterBetItem(e), 0 == this.model.bets.length && 0 == this.model.castBets.length ? this.animationHelper.closeView(() => {
                this.messageManager.processMessage({ type: v.CloseBetslipReferralsMessage }), this.removeBetItem(e), e.parent && e.parent.removeChild(e), this.messageManager.updateDisplayState(x.BetslipStateNone), this.setSlipDisplayState(x.BetslipStateNone), this.exSelectionContainerTop.setVisible(!1), this.exSelectionContainerBottom.setVisible(!1), this.excludedSnglesHeader && (this.contentArea.removeChild(this.excludedSnglesHeader), this.excludedSnglesHeader = null), this.excludedSngleWrapper && (this.contentArea.removeChild(this.excludedSngleWrapper), this.excludedSngleWrapper = null), this.removeStyle('bss-StandardBetslip_ExcludedBets'), this.footer.resetFooterStake(), this.suspendBetslipComponents(), this.messageManager.dispose();
            }) : (this.removeBetItem(e), 1 == this.bets.length && (this.bets[0].hideMiniText && this.bets[0].hideMiniText(), this.updateSkipUpdateAnimationSetting(!0), this.animateSlipState()), this.betslipState == x.BetslipStateExpanded && this.updateSkipUpdateAnimationSetting(!0), e.getBetModel().getExcludedState() && this.checkAndRemoveExcludedSngleContainers()), 0 === this.getBetCountInfo().betbuilderCount && this.messageManager.processMessage({ type: v.CloseVoidBetWarningMessage });
        }
        unRegisterBetItem(t) {
            if (t instanceof h) {
                this.animationHelper.unRegisterBetBuilderBetItem(t);
                let e = !1;
                for (var s of this.bets)
                    if (s instanceof h && s != t && !s.getBetModel().getPlayerBuilder()) {
                        e = !0;
                        break;
                    }
                e || this.setHasBetBuildersState(!1);
            } else
                this.animationHelper.unRegisterNormalBetItem(t);
        }
        normalBetItemSwipeDelete() {
            1 != this.model.bets.length || this.mouseMode || this.footer.swipeDeleteBet();
        }
        excludedBetStateUpdated(e) {
            var t = e.getBetModel(), s = t.getExcludedState();
            s && this.appendExcludedSngleWrapper(), t && s ? (this.excludedSngleWrapper.appendChild(e), this.animationHelper.unRegisterNormalBetItem(e), this.animationHelper.registerExcludedNormalBetItems(e, this.betslipState), this.animationHelper.bringToView(e)) : (this.contentArea.insertBefore(e, this.singleDivider), this.animationHelper.unRegisterExcludedNormalBetItems(e), t = 1 === this.bets.length && this.bets[0] instanceof a && 0 === this.castBets.length ? x.BetslipStateExpanded : this.betslipState, this.model.highlightBet(e.key()), this.animationHelper.registerNormalBetItem(e, t), this.betslipState == x.BetslipStateExpanded && this.animationHelper.bringToView(e), Locator.validationManager.callPostValidation(() => {
                this.checkAndRemoveExcludedSngleContainers();
            }));
        }
        checkAndRemoveExcludedSngleContainers() {
            let e = !1;
            for (var t of this.bets)
                if (t instanceof a && t.getBetModel().getExcludedState()) {
                    e = !0;
                    break;
                }
            !e && this.excludedSngleWrapper && (this.animationHelper.unRegisterSinglesHeader(), this.animationHelper.unRegisterSinglesWrapper(), this.contentArea.removeChild(this.excludedSnglesHeader), this.contentArea.removeChild(this.excludedSngleWrapper), this.excludedSnglesHeader = null, this.excludedSngleWrapper = null, this.exSelectionContainerTop.setVisible(!1), this.exSelectionContainerBottom.setVisible(!1), this.removeStyle('bss-StandardBetslip_ExcludedBets'));
        }
        appendExcludedSngleWrapper() {
            this.excludedSngleWrapper || (this.excludedSnglesHeader = new fe(), this.contentArea.insertBefore(this.excludedSnglesHeader, this.excludedSngleDivider), this.excludedSnglesHeader.clickHandler = () => {
                this.excludedSngleWrapper.hasStyle('bs-AnimationHelper_SinglesOpen') && this.animationHelper.collapseExcludedSingles(), this.excludedSngleWrapper.hasStyle('bs-AnimationHelper_SinglesOpen') || this.animationHelper.expandExcludedSingles();
            }, this.animationHelper.registerSinglesHeader(this.excludedSnglesHeader, this.betslipState), this.excludedSngleWrapper = new l(), this.excludedSngleWrapper.addStyle('bss-StandardBetslip_SinglesWrapper'), this.contentArea.insertBefore(this.excludedSngleWrapper, this.excludedSngleDivider), this.animationHelper.registerSinglesWrapper(this.excludedSngleWrapper, this.betslipState), this.addStyle('bss-StandardBetslip_ExcludedBets'), this.exSelectionContainerTop.setVisible(!0), this.exSelectionContainerBottom.setVisible(!0));
        }
        castBetItemRemoved(e) {
            this.removeCastBetItem(e), this.animationHelper.unRegisterCastBetItem(e);
            e = this.castBets.indexOf(e);
            -1 < e && this.castBets.splice(e, 1), 0 == this.model.bets.length && 0 == this.model.castBets.length ? this.animationHelper.closeView(() => {
                this.messageManager.processMessage({ type: v.CloseBetslipReferralsMessage }), this.messageManager.updateDisplayState(x.BetslipStateNone), this.setSlipDisplayState(x.BetslipStateNone), this.footer.resetFooterStake(), this.suspendBetslipComponents(), this.messageManager.dispose();
            }) : this.betslipState == x.BetslipStateExpanded && this.updateSkipUpdateAnimationSetting(!0);
        }
        castBetItemDisableSlip() {
            this.disableSlip();
        }
        castBetItemEnableSlip() {
            this.enableSlip();
        }
        betBuilderBetItemBetRemoved(e) {
            this.normalBetItemBetRemoved(e);
        }
        betBuilderBetItemShowUnqualifiedForWinningBoost() {
            this.messageManager.add(new T(T.WINNING_BOOSTS_UNQUALIFIED, R.WinningsBoostUnqualifiedMessage), [
                M.MessageContainerTypeCondensed,
                M.MessageContainerTypeExpanded
            ]);
        }
        betBuilderBetItemHideUnqualifiedForWinningBoost() {
            this.messageManager.processMessage({ type: v.CloseWinningsBoostUnqualifiedMessage }, [
                M.MessageContainerTypeCondensed,
                M.MessageContainerTypeExpanded
            ]);
        }
        betBuilderBetItemParticipantInserted() {
            this.betslipState == x.BetslipStateBetBuilderCondensed && this.animationHelper.condensedMultipleBumpView();
        }
        betBuilderBetItemParticipantRemoved() {
        }
        betBuilderBetItemRefreshSlip() {
            this.refresh(!0);
        }
        setBetBuilderLogo(e) {
            e ? this.betBuilderLogo.setRacingLogo() : this.betBuilderLogo.resetLogoState(!1);
        }
        disableSlip() {
            this.delegate.standardBetslipDisableSlip();
        }
        ewexBetItemDisableSlip() {
            this.disableSlip();
        }
        multipleItemDisableSlip() {
            this.disableSlip();
        }
        multipleHeaderDisableSlip() {
            this.disableSlip();
        }
        enableSlip() {
            this.delegate.standardBetslipEnableSlip();
        }
        ewexBetItemEnableSlip() {
            this.enableSlip();
        }
        multipleItemEnableSlip() {
            this.enableSlip();
        }
        multipleHeaderEnableSlip() {
            this.enableSlip();
        }
        refresh(e = !1) {
            this.restore(), this.model.refresh(), this.updateSkipUpdateAnimationSetting(e);
        }
        addBet(e) {
            this.slipReload = !e.isBoostCompataibleWithOtherSelections, this.restore(), this.removeStyle('bss-StandardBetslip_NoTransition'), this.removeAllClicked = !1, this.model.addItem(e);
        }
        betAddedSuccessfully() {
            this.footer.discardFooterModel();
        }
        betRemovedSuccessfully() {
            this.footer.discardFooterModel();
        }
        removeBet(e) {
            0 < this.model.getBetCount() ? this.model.removeItem(e) : (this.model.removeItem(e), 0 == this.model.getPendingCount() && this.delegate.standardBetslipCollapse(() => {
                this.removeErrorMessage(), this.removeRemainingStakeLimitContainer();
            }));
        }
        getBetModels() {
            return this.bets;
        }
        checkBetKeySelectionState(e) {
            return this.model.checkBetKeySelectionState(e);
        }
        footerShowOnSlipWithResize(e, t, s) {
            this.showOnSlipWithResize(e, t, s);
        }
        footerHideFromSlipWithResize(e, t, s) {
            this.hideFromSlipWithResize(e, t, s);
        }
        footerBetslipState() {
            return this.betslipState;
        }
        footerSetKeypadState(e) {
            e ? this.delegate.standardBetslipShowOverlay(!1, e) : this.delegate.standardBetslipHideOverlay();
        }
        showOnSlipWithResize(i, e, a, l) {
            e ? (e.appendChild(i), i.suspendElementFromDom(), Locator.validationManager.callLater(() => {
                this.showOnSlipWithResize(i, null, a);
            })) : Locator.validationManager.callPostValidation(() => {
                C.ClearTransitionHandler(i), i.unsuspendElementFromDom();
                let s = i.getElement().getBoundingClientRect().height;
                if (!(s <= 0) && (this.calculateResize(), this.delegate))
                    if (this.delegate.standardBetslipIsMinimised())
                        this.triggerResize();
                    else {
                        let e = i.getInlineStyle(), t = (e.maxHeight = '0px', 0.0001);
                        _.AdditionalPreferences(y).animationsEnabled && (t = a && 0 < a ? a : 0.2), l = l || (() => {
                            C.UnregisterTransitionHandler(i), e.maxHeight = '', e[C.Transition] = '';
                        }), Locator.validationManager.callNewContext(() => {
                            C.RegisterTransitionHandler(i, l), e[C.Transition] = `max-height ${ t }s`, this.triggerResize(), e.maxHeight = s + 'px';
                        });
                    }
            });
        }
        hideFromSlipWithResize(a, l, e) {
            Locator.validationManager.callPostValidation(() => {
                C.ClearTransitionHandler(a);
                var t = a.getElement().getBoundingClientRect().height;
                let s = a.getElement().style, i = 0.0001;
                if (_.AdditionalPreferences(y).animationsEnabled && (i = e && 0 < e ? e : 0.2), t <= 0)
                    a.suspendElementFromDom();
                else if (s.maxHeight = '0px', this.calculateResize(), this.delegate && this.delegate.standardBetslipIsMinimised())
                    l ? a.parent.removeChild(a) : (a.suspendElementFromDom(), s[C.Transition] = '', s.maxHeight = ''), this.triggerResize();
                else {
                    s.maxHeight = t + 'px';
                    let e = () => {
                        C.UnregisterTransitionHandler(a), l ? a.parent.removeChild(a) : (a.suspendElementFromDom(), s[C.Transition] = '', s.maxHeight = '');
                    };
                    Locator.validationManager.callNewContext(() => {
                        C.RegisterTransitionHandler(a, e), s[C.Transition] = `max-height ${ i }s`, this.triggerResize(), s.maxHeight = '0px';
                    });
                }
            });
        }
        ewexBetItemEwexSelectionChanged(e, t) {
            this.model.ewexSelectionChanged(e, t);
        }
        suspendMultiples() {
            this.multiplesSuspended = !0, this.addStyle('bss-StandardBetslip_SuspendMultiples'), this.multipleHeader && C.HideElementTransition(this.multipleHeader), this.multipleWrapper && C.HideElementTransition(this.multipleWrapper), this.animationHelper.unRegisterMultipleHeader(), this.animationHelper.unRegisterMultipleWrapper(), this.betslipState === x.BetslipStateMultipleCondensed && this.animationHelper.condensedToCollapsedView();
        }
        unsuspendMultiples() {
            this.multiplesSuspended = !1, this.removeStyle('bss-StandardBetslip_SuspendMultiples'), this.multipleHeader && this.multipleWrapper && (this.animationHelper.registerMultipleHeader(this.multipleHeader, this.betslipState), this.animationHelper.registerMultipleWrapper(this.multipleWrapper, this.betslipState), this.multipleHeader && C.ShowElementTransition(this.multipleHeader), this.multipleWrapper) && C.ShowElementTransition(this.multipleWrapper);
        }
        setAutoVoidState(e) {
            this.multipleHeader && this.multipleHeader.setAutoVoidState(e);
        }
        getBetslipModel() {
            return this.model;
        }
        minimiseHandler() {
            m.HideKeypad(() => {
                var e = this.getBetCountInfo();
                1 < e.allCount && 1 < e.nonexcludedCount + e.betbuilderCount && this.isCompatibleForCondensedView() && this.betslipState == x.BetslipStateExpanded ? (this.animationHelper.expandedToCondensedView(() => {
                    Locator.validationManager.callNewContext(() => {
                        this.messageManager.updateDisplayState(x.BetslipStateSingleCondensed);
                    });
                }), this.multipleHeader.switchToCondensedView(), this.footer.switchToCondensedView(), this.setSlipDisplayState(x.BetslipStateMultipleCondensed)) : 1 == this.model.bets.length && 0 == this.model.castBets.length || 1 < this.model.bets.length && e.nonexcludedCount + e.betbuilderCount == 1 && 0 == e.castCount ? (1 == e.betbuilderCount ? this.animationHelper.collapsedSingleBetbuilderView() : this.animationHelper.condensedSingleView(!0), this.messageManager.updateDisplayState(x.BetslipStateSingleCondensed), this.updateFooterModel(), Locator.validationManager.callLater(() => {
                    this.footer && this.footer.switchToCondensedView();
                }), this.setSlipDisplayState(1 == e.betbuilderCount ? x.BetslipStateBetBuilderCondensed : x.BetslipStateSingleCondensed)) : 1 < e.allCount && (this.animationHelper.expandedToCollapsedView(() => {
                    this.messageManager.updateDisplayState(x.BetslipStateCollapsed);
                }), this.setSlipDisplayState(x.BetslipStateCollapsed)), this.delegate.standardBetslipHideOverlay();
            });
        }
        clearCouponHighlighting() {
            this.model.clearCouponHighlighting();
        }
        resolveStakeTax() {
            this.resolveStakeTaxCoveredMessage(), this.footer.resolveStakeTax();
        }
        resolveStakeTaxCoveredMessage() {
            var e = this.model.getTotalStakeTaxCovered();
            e && this.betslipState !== x.BetslipStateCollapsed ? this.messageManager.add(new ge('{0}staketaxcoveredbybet365', e + ''), [M.MessageContainerTypeCondensedAndExpanded]) : this.messageManager.processMessage({ type: v.CloseStakeTaxCoveredMessage });
        }
        removePushedConfigListener() {
            this.pushedConfigInitialiseHandlerDelegate && (Locator.pushedConfig.removeEventListener(ve.PROPERTIES_INITIALISED, this.pushedConfigInitialiseHandlerDelegate), this.pushedConfigInitialiseHandlerDelegate = null);
        }
        dispose() {
            this.disposed || (this.disposed = !0, this.multiplesSuspended = !1, this.animationHelper.closeView(), this.betCreditsHeader && this.betCreditsHeader.reset(), this.receiptContent && (this.receiptContent.dispose(), this.receiptContent = null), this.removeErrorMessage(), this.liveAlertsHeader && (this.liveAlertsHeader.parent.removeChild(this.liveAlertsHeader), this.liveAlertsHeader.dispose(), this.liveAlertsHeader = null), this.betTrackBanner && (this.receiptWrapper.removeChild(this.betTrackBanner), this.betTrackBanner = null), this.header && this.header.dispose(), this.controlBar && this.controlBar.dispose(), this.autoReviewPreference && (this.footer.removeChild(this.autoReviewPreference), this.autoReviewPreference = null), this.suspendBetslipComponents(), this.offerBadgesContainer && this.offerBadgesWrapper && (this.offerBadgesWrapper.removeChild(this.offerBadgesContainer), this.offerBadgesContainer = null), this.model.dispose(), this.toSlipFromReceipt(), this.footer.resetFooterStake(), this.exSelectionContainerTop.setVisible(!1), this.exSelectionContainerBottom.setVisible(!1), this.updateSkipUpdateAnimationSetting(!1), this.messageManager.updateDisplayState(x.BetslipStateNone), this.messageManager.dispose(), this.setSlipDisplayState(x.BetslipStateNone), this.currentState = 0, b.removeMouseModeDelegate(this), ns_gen5_ui.Application.currentApplication.hasEventListenerWithDelegate(ns_gen5_events.ApplicationEvent.WIDTH_CHANGED, this.documentResizeHandler) && ns_gen5_ui.Application.currentApplication.removeEventListener(ns_gen5_events.ApplicationEvent.WIDTH_CHANGED, this.documentResizeHandler), ns_gen5_ui.Application.currentApplication.hasEventListenerWithDelegate('geoStorePermissionsFailed', this.geoStorePermissionsFailedDelegate) && ns_gen5_ui.Application.currentApplication.addEventListener('geoStorePermissionsFailed', this.geoStorePermissionsFailedDelegate), this.removePushedConfigListener());
        }
        restore() {
            this.disposed && (this.disposed = !1, b.addMouseModeDelegate(this), ns_gen5_ui.Application.currentApplication.addEventListener(ns_gen5_events.ApplicationEvent.WIDTH_CHANGED, this.documentResizeHandler), this.controlBar && this.controlBar.restore(), this.header) && this.header.restore();
        }
        setPluginBetItemsToEditMode() {
            for (var e of this.bets)
                e.setEditMode && e.setEditMode();
        }
        removePluginBetItemsFromEditMode() {
            for (var e of this.bets)
                e.unsetEditMode && e.unsetEditMode();
        }
        toBetslipFromReferral() {
            this.controlBar.unsuspendElementFromDom(), this.expandedHeaderWrapper.unsuspendElementFromDom(), this.contentWrapper.unsuspendElementFromDom(), this.header.unsuspendElementFromDom();
        }
        toSlipFromReceipt() {
            var e;
            if (this.receiptMode = !1, this.receiptWrapper && (this.animationHelper.unregisterReceiptHeader(this.betslipState, () => {
                    this.insertBefore(this.controlBar, this.remainingLimitContainer), this.controlBar.revertReceiptMode(), this.receiptContent = null, this.receiptWrapper.removeAllChildren(), this.headerWrapper.removeChild(this.receiptWrapper), this.receiptWrapper = null, Locator.validationManager.callLater(() => {
                        this.controlBar && this.controlBar.unsuspendElementFromDom();
                    });
                }, this.hasMoreMultiplebets()), this.messageManager.processMessage({ type: v.CloseBetreceiptReferralsMessage })), this.taxMessage && this.appendChildAt(this.taxMessage, 2), this.footer.revertReceipt(), this.removeStyle('bss-StandardBetslip-receipt'), this.removeStyle('bss-StandardBetslip_NoMultipleStake'), this.removeStyle('bss-StandardBetslip_HasMultipleStake'), this.removeStyle('bss-StandardBetslip_MultipleWrapper-onreceipt'), this.removeStyle('bss-StandardBetslip_HasBetBuilders-withstake'), this.multipleHeader && this.multipleHeader.removeStyle('bss-StandardBetslip_Item-noborder'), this.multipleWrapper && this.multipleWrapper.unsuspendElementFromDom(), !this.multiplesSuspended) {
                this.multipleHeader && this.multipleHeader.revertReceiptState();
                for (var t of this.multiples)
                    t.revertReceiptState();
            }
            for (e of this.bets)
                e.revertReceiptState();
        }
        removeBetItem(e) {
            this.bets.splice(this.bets.indexOf(e), 1), this.model.removeModel(e.getBetModel());
            var t, s = this.getBetCountInfo(), s = (this.disposed ? e.parent && e.parent.removeChild(e) : (t = this.animationHelper.getSkipAnimations() ? 0 : 0.2, e.parent && (this.removeAllClicked || this.delegate.standardBetslipIsMinimised() ? e.parent.removeChild(e) : this.betslipState == x.BetslipStateBetBuilderCondensed && e instanceof h ? (0 == s.betbuilderCount && 0 < s.allCount && this.animationHelper.betBuilderToSingleCondensedVew(e, () => {
                    e.parent && e.parent.removeChild(e), this.footer.switchToCondensedView(), this.animationHelper.unRegisterBetBuilderBetItem(e), this.betslipState === x.BetslipStateBetBuilderCondensed && (this.messageManager.updateDisplayState(x.BetslipStateSingleCondensed), this.setSlipDisplayState(x.BetslipStateSingleCondensed));
                }), 1 == s.betbuilderCount && (e.parent.removeChild(e), this.updateSkipUpdateAnimationSetting(!s.nonexcludedCount), this.animationHelper.condensedBetBuilderBumpView())) : (this.skipAfterdocumentUpdatedAnimation ? (e.parent.removeChild(e), this.updateSkipUpdateAnimationSetting(!1)) : C.HideElementTransition(e, !0, t, () => {
                    this.betslipState == x.BetslipStateExpanded && this.bets.length + this.castBets.length == 1 && this.animationHelper.showBetSlip();
                }, !0), 0 < s.allCount && this.betslipState !== x.BetslipStateCollapsed && this.updateSkipUpdateAnimationSetting(!0))), this.bets.length || this.castBets.length || (e.parent && (e.parent.removeChild(e), this.dispose()), this.delegate.standardBetslipCollapse(() => {
                    this.removeStyle('bss-StandardBetslip_AnimateOut'), this.removeStyle('bss-StandardBetslip_NewBetBounce'), this.model.clearKeys(), this.removeAllClicked = !1, this.multiplesSuspended = !1, this.removeStyle('bss-StandardBetslip_SuspendMultiples'), this.removeRemainingStakeLimitContainer(), this.autoReviewPreference && (this.footer.removeChild(this.autoReviewPreference), this.autoReviewPreference = null);
                })), this.updateBetCount(this.bets.length)), null == (t = e.getBetModel()) ? void 0 : t.getExcludedState());
            s ? this.animationHelper.unRegisterExcludedNormalBetItems(e) : this.animationHelper.unRegisterNormalBetItem(e), this.validateMinimumOdds();
        }
        removeCastBetItem(e) {
            this.bets.splice(this.bets.indexOf(e), 1), this.castBets.splice(this.bets.indexOf(e), 1), this.disposed ? e.parent && e.parent.removeChild(e) : (e.parent && (this.removeAllClicked || this.delegate.standardBetslipIsMinimised() ? e.parent.removeChild(e) : C.HideElementTransition(e, !0, 0.2)), this.castBets.length || this.bets.length || this.delegate.standardBetslipCollapse(() => {
                this.removeStyle('bss-StandardBetslip_AnimateOut'), this.removeStyle('bss-StandardBetslip_NewBetBounce'), this.model.clearKeys(), this.removeAllClicked = !1, this.multiplesSuspended = !1, this.removeStyle('bss-StandardBetslip_SuspendMultiples'), this.removeRemainingStakeLimitContainer();
            }), this.updateBetCount(this.bets.length));
        }
        validateMinimumOdds() {
            Locator.validationManager.callNewContext(() => {
                let e = !0, t = 0;
                if (e = this.defaultMultiple && 1 < this.bets.length && this.defaultMultiple ? this.defaultMultiple.model.getSlipResult() == p.oddsBelowMinimum : e)
                    for (var s of this.bets)
                        if (!s.getBetModel().getOddsBelowMinimum()) {
                            e = !1;
                            break;
                        }
                for (var i of this.bets)
                    i.getBetModel().getOddsBelowMinimum() && t++;
                0 == t && this.messageManager.processMessage({ type: v.CloseRestrictedOddsMessage }), e || this.hasSelfExcludedSelections() ? this.footer.disable() : this.footer.enable();
            });
        }
        validateState() {
            var e = g.GetBetCount(), t = g.GetCastString();
            let s = t && -1 < t.indexOf('tmn=');
            1 == e && Locator.validationManager.callLater(() => {
                this.controlBar && this.castBets && (this.controlBar.removeEditMode(), s ? this.minimiseHandler() : 1 === this.castBets.length ? this.animationHelper && this.messageManager && (this.slipReload = !1, this.animationHelper.showBetSlip(), this.messageManager.updateDisplayState(x.BetslipStateExpanded), this.setSlipDisplayState(x.BetslipStateExpanded), i.setHasFooterStake(!1)) : this.showBetslip());
            });
        }
        appendOfferBadges(i = !1) {
            this.offerBadgesContainer && this.offerBadgesWrapper && (this.offerBadgesWrapper.removeChild(this.offerBadgesContainer), this.offerBadgesContainer = null);
            var a, l = this.model.getBets();
            if (l) {
                var n = [], r = this.betCreditsModeActive ? +Locator.user.getBalance().bonusBalance : -1;
                let e = !i;
                var d, i = this.model.defaultMultiple;
                (e = i && i.getStake() <= r ? !1 : e) || this.footer.updateBonusValue('0');
                let t = !0, s = !0;
                for (d of l) {
                    if (d.bb) {
                        var o = d.pt;
                        if (o) {
                            t = t && o.every(e => {
                                var e = E.GetLocaleOffersForBetslip(null != (e = e.ob) ? e : []);
                                return null != (e = null == e ? void 0 : e.some(e => e.oc === D.INCLUDED_EXTRA_TIME_OFFER)) && e;
                            }), s = s && o.every(e => {
                                var e = E.GetLocaleOffersForBetslip(null != (e = e.ob) ? e : []);
                                return null != (e = null == e ? void 0 : e.some(e => e.oc === D.NINETY_PLUS_STOPPAGE_TIME_OFFER)) && e;
                            });
                            for (var h of o) {
                                h = E.GetLocaleOffersForBetslip(null != (h = h.ob) ? h : []);
                                if (h)
                                    for (var p of h)
                                        E.IsAccumulator(p.oc) && !e || n.push(p);
                            }
                        }
                    } else {
                        var c = E.GetLocaleOffersForBetslip(null != (o = d.ob) ? o : []);
                        t = t && null != (a = null == c ? void 0 : c.some(e => e.oc === D.INCLUDED_EXTRA_TIME_OFFER)) && a, s = s && null != (a = null == c ? void 0 : c.some(e => e.oc === D.NINETY_PLUS_STOPPAGE_TIME_OFFER)) && a;
                    }
                    if (d.ob) {
                        var u = E.GetLocaleOffersForBetslip(null != (c = d.ob) ? c : []);
                        if (0 !== u.length) {
                            for (var b of u)
                                E.IsAccumulator(b.oc) && !e || n.push(b);
                            if (d.ep) {
                                let e = !1;
                                for (var m of n)
                                    if ('ENHANCEDPRICES' === m.oc)
                                        return void (e = !0);
                                e || (u = {
                                    oc: 'ENHANCEDPRICES',
                                    ot: A.NONE
                                }, n.unshift(u));
                            }
                        }
                    }
                }
                var g, C, S, f = [], B = [], _ = [], y = [], x = [];
                for (g of n)
                    'EP' === g.oc ? f.push({
                        offerCode: 'EP',
                        offerText: E.GetTranslation('enhancedPrices'),
                        offerTextMini: '',
                        offerCodesTermsList: [''],
                        offerType: A.NONE
                    }) : E.IsBoreDraw(g.oc) ? _.push(g) : E.IsSubOn(g.oc) ? y.push(g) : g.ot == A.EARLY_PAYOUT_OFFER ? B.push(g) : g.oc == D.INCLUDED_EXTRA_TIME_OFFER || g.oc == D.NINETY_PLUS_STOPPAGE_TIME_OFFER ? x.push(g) : (C = 'EXTEXC' != g.oc && 2 <= this.bets.length, f.push({
                        offerCode: g.oc,
                        offerText: E.GetBadgeTranslation(g.oc),
                        offerTextMini: C && E.GetBadgeTranslation(g.oc, !0) || '',
                        offerCodesTermsList: this.getCodeTermsList(n, g),
                        offerType: g.ot,
                        offerValue: this.model.defaultMultiple && this.model.defaultMultiple.bet.get('ap')
                    }));
                if (_.length) {
                    var i = 'EXTEXC' != _[0].oc && 2 <= this.bets.length, k = {
                            offerCode: _[0].oc,
                            offerText: E.GetBadgeTranslation(_[0].oc),
                            offerTextMini: i && E.GetBadgeTranslation(_[0].oc, !0) || '',
                            offerCodesTermsList: [_[0].oc],
                            offerType: +_[0].oc
                        };
                    for (let e = 1, t = _.length; e < t; e++) {
                        var M = _[e].oc;
                        k.offerCodesTermsList.indexOf(M) < 0 && k.offerCodesTermsList.push(M);
                    }
                    f.push(k);
                }
                if (B.length) {
                    var v = {
                        offerCode: B[0].oc,
                        offerText: E.GetBadgeTranslation(B[0].oc),
                        offerTextMini: !(this.bets.length < 2) && E.GetBadgeTranslation(B[0].oc, !0) || '',
                        offerCodesTermsList: [B[0].oc],
                        offerType: +B[0].oc
                    };
                    for (let e = 1, t = B.length; e < t; e++) {
                        var w = B[e].oc;
                        v.offerCodesTermsList.indexOf(w) < 0 && v.offerCodesTermsList.push(w);
                    }
                    f.push(v);
                }
                if (y.length) {
                    var T = {
                        offerCode: y[0].oc,
                        offerText: E.GetBadgeTranslation(y[0].oc),
                        offerTextMini: !(this.bets.length < 2) && E.GetBadgeTranslation(y[0].oc, !0) || '',
                        offerCodesTermsList: [y[0].oc],
                        offerType: +y[0].ot
                    };
                    for (let e = 1, t = y.length; e < t; e++) {
                        var I = y[e].oc;
                        T.offerCodesTermsList.indexOf(I) < 0 && T.offerCodesTermsList.push(I);
                    }
                    f.push(T);
                }
                for (S of x)
                    S.oc == D.INCLUDED_EXTRA_TIME_OFFER && t ? f.push({
                        offerCode: S.oc,
                        offerText: languageDefinition('BetslipStandardUILib').getValue('120M'),
                        offerTextMini: languageDefinition('BetslipStandardUILib').getValue('120Mini'),
                        offerCodesTermsList: [S.oc],
                        offerType: S.ot
                    }) : S.oc == D.NINETY_PLUS_STOPPAGE_TIME_OFFER && s && f.push({
                        offerCode: S.oc,
                        offerText: languageDefinition('BetslipStandardUILib').getValue('90M'),
                        offerTextMini: '',
                        offerCodesTermsList: [S.oc],
                        offerType: S.ot
                    });
                r = this.removeDuplicateOfferCodes(f);
                this.multipleHeader && this.multipleHeader.appendOfferBadges(r), this.multipleHeader && this.multipleHeader.createFreeBetBadges(l), 0 < r.length && (this.offerBadgesContainer && this.offerBadgesWrapper.removeChild(this.offerBadgesContainer), this.offerBadgesContainer = new Z(r), this.offerBadgesWrapper.appendChild(this.offerBadgesContainer));
            }
        }
        removeDuplicateOfferCodes(e) {
            var t, s = {};
            for (t of e)
                s[t.offerCode] = t;
            var i, a = [];
            for (i in s)
                a.push(s[i]);
            return a;
        }
        getCodeTermsList(e, t) {
            var s, i = [];
            for (s of e)
                s.ot === t.ot && i.indexOf(s.oc) < 0 && i.push(s.oc);
            return i;
        }
        displayOfferBadges() {
            !E.BypassNoOffersCheck() && (B.IsExcludedFromPromotion('2') || B.IsExcludedFromOffers('2')) || E.Initialise(() => {
                this.appendOfferBadges();
            });
        }
        hideAccaBonus() {
            !E.BypassNoOffersCheck() && (B.IsExcludedFromPromotion('2') || B.IsExcludedFromOffers('2')) || E.Initialise(() => {
                this.appendOfferBadges(!0);
            });
        }
        toggleControlBar() {
            this.module.isMinimised() || this.module.isCollapsed() ? this.controlBar.hide() : this.controlBar.show();
        }
        checkFullReferralApproveDecline(e) {
            if (e == p.success || e == p.referralDeclined) {
                var t = this.model.getReferralPlaceAmount(), s = this.model.getReferralAmount();
                if (0 === t && (e == p.referralDeclined || 0 < s)) {
                    for (var i of this.bets)
                        i.hideReferralMessage && i.hideReferralMessage();
                    this.defaultMultiple && this.defaultMultiple.hideReferralMessage && this.defaultMultiple.hideReferralMessage();
                    for (var a of this.multiples)
                        a.hideReferralMessage && a.hideReferralMessage();
                    for (var l of this.castBets)
                        l.hideReferralMessage && l.hideReferralMessage();
                }
            }
        }
        removeRemainingStakeLimitContainer() {
            this.remainingLimitContainer && (this.remainingLimitContainer.removeAllChildren(), this.remainingLimitContainer.suspendElementFromDom());
        }
        multipleHeaderOtherMultiplesButtonClicked() {
            window.bet365.messageBus.postMessageRequest('firebase.logEvent', {
                name: 'expand_betslip',
                parameters: {
                    slip_type: g.GetBetslipType(),
                    site_section: 'Betslip'
                }
            }), this.expandToShowMultiples();
        }
        expandToShowMultiples() {
            this.betslipState !== x.BetslipStateExpanded && (this.footer.hideKeypad(), this.delegate.standardBetslipShowOverlay(g.GetBetCount() < 0, !1), this.multipleHeader && this.multipleHeader.switchToExpandedView(), this.messageManager.updateDisplayState(x.BetslipStateExpanded), this.animationHelper.condensedToExpandedView(() => {
                this.footer.switchToExpandedView();
            }), this.setSlipDisplayState(x.BetslipStateExpanded), this.editModeActive) && this.controlBar.show();
        }
        betBuilderBetItemShowOptions() {
            this.betslipState != x.BetslipStateExpanded && (this.footer.hideKeypad(), this.delegate.standardBetslipShowOverlay(0 < g.GetBetCount() && 3 != this.currentState, !1), this.updateSkipUpdateAnimationSetting(!0), this.animationHelper.expandedSingleBetbuilderView(), this.messageManager.updateDisplayState(x.BetslipStateExpanded), this.setSlipDisplayState(x.BetslipStateExpanded));
        }
        multipleHeaderRemoveButtonClicked() {
            this.removeAllClicked = !0, this.model.removeAllItems();
        }
        multipleHeaderTitleUpdated() {
            this.multipleHeader && this.checkBetBuilderPlusStatus(this.bets.length), this.updateFooterModel();
        }
        multipleHeaderAnimate() {
            this.betslipState == x.BetslipStateMultipleCondensed && this.animationHelper.condensedMultipleBumpView();
        }
        multipleHeaderAccumulatorPercentageChanged(e) {
            this.footer.toggleBonusValue(e);
        }
        afterDocumentUpdated(e) {
            this.updateFooterModel(), this.unsuspendBetslipComponents(), this.skipAfterdocumentUpdatedAnimation || this.animateSlipState(), this.updateSkipUpdateAnimationSetting(!1), this.slipTypeChanged && (this.slipTypeChanged = !1, Locator.validationManager.callNewContext(() => {
                this.delegate.standardBetslipOnNewSlipLoaded();
            })), this.multipleHeader && Locator.validationManager.callNewContext(() => {
                this.multipleHeader && this.checkBetBuilderPlusStatus(this.bets.length);
            });
        }
        updateFooterModel() {
            let e = null;
            var t = this.multipleHeaderGetPositionPayoutFormat();
            if (this.footer.updateFooterReturnLabel(t, this.bets.length), this.isCompatibleForCondensedView() && !(e = this.multipleHeader && this.defaultMultiple ? this.defaultMultiple.model : e) && 1 < this.bets.length)
                for (var s of this.bets)
                    if (s instanceof h) {
                        e = s.getBetModel();
                        break;
                    }
            (e = e || 1 != this.bets.length || 0 != this.castBets.length ? e : this.bets[0].getBetModel()) && (this.footer.setBetModel(e), Locator.validationManager.callNewContext(() => {
                e.setFooterUIDelegate(this.footer);
            }));
        }
        suspendBetslipComponents() {
            this.betCreditsHeader && this.betCreditsHeader.suspendElementFromDom(), this.messageManager.updateDisplayState(x.BetslipStateNone);
        }
        unsuspendBetslipComponents() {
            this.messageManager.add(this.betCreditsHeader, [M.MessageContainerTypeCondensedAndExpanded]), this.betCreditsHeader && (this.betCreditsHeader.unsuspendElementFromDom(), this.betCreditsHeader.reset()), this.messageManager.updateDisplayState(this.betslipState);
        }
        showBetslip() {
            this.slipReload = !1, this.delegate.standardBetslipShowOverlay(!1, !1), this.animationHelper.showBetSlip(), this.messageManager.updateDisplayState(x.BetslipStateExpanded), this.setSlipDisplayState(x.BetslipStateExpanded), this.updateSkipUpdateAnimationSetting(!0), this.slipTypeChanged = !0;
        }
        hideForSiteActivity() {
            this.animationHelper.hideForSiteActivity(), this.suspendBetslipComponents();
        }
        showAfterSiteActivity() {
            this.animationHelper.showAfterSiteActivity(), 0 < g.GetBetCount() ? this.unsuspendBetslipComponents() : this.suspendBetslipComponents();
        }
        animateSlipState() {
            if (3 != this.currentState) {
                var e = this.getBetCountInfo();
                if (this.slipReload)
                    this.setSlipDisplayState(this.animationHelper.restoreView(this.isCompatibleForCondensedView(), u.Standard)), this.multipleHeader && this.betslipState == x.BetslipStateMultipleCondensed && this.multipleHeader.switchToCondensedView(), this.messageManager.updateDisplayState(this.betslipState), this.slipReload = !1;
                else if (0 === this.model.bets.length && 1 === this.model.castBets.length && this.model.castBets[0].betTypeLookupKey != f.AusMultiLegBet)
                    this.animationHelper.condensedToExpandedView(), this.footer.switchToCondensedView(), this.messageManager.updateDisplayState(x.BetslipStateExpanded), this.setSlipDisplayState(x.BetslipStateExpanded), i.setHasFooterStake(!1);
                else if (e.normalsCount + e.betbuilderCount == 1 && 0 === e.castCount)
                    this.betslipState == x.BetslipStateCollapsed ? (this.animationHelper.collapsedToCondensedView(() => {
                        this.footer.switchToCondensedView(), this.messageManager.updateDisplayState(x.BetslipStateSingleCondensed);
                    }), this.setSlipDisplayState(x.BetslipStateSingleCondensed)) : this.betslipState !== x.BetslipStateExpanded && this.betslipState !== x.BetslipStateSingleCondensed && this.betslipState !== x.BetslipStateBetBuilderCondensed && this.betslipState != x.BetslipStateMultipleCondensed ? (this.animationHelper.condensedSingleView(), this.footer.switchToCondensedView(), this.messageManager.updateDisplayState(x.BetslipStateSingleCondensed), this.setSlipDisplayState(x.BetslipStateSingleCondensed)) : this.betslipState == x.BetslipStateSingleCondensed && this.model.bets[0].betTypeLookupKey == f.BetBuilder ? (this.animationHelper.condensedToExpandedView(), this.footer.switchToCondensedView(), this.messageManager.updateDisplayState(x.BetslipStateExpanded), this.setSlipDisplayState(x.BetslipStateExpanded)) : this.betslipState === x.BetslipStateSingleCondensed && (this.animationHelper.condensedSingleView(), this.footer.switchToCondensedView(), this.messageManager.updateDisplayState(x.BetslipStateSingleCondensed), this.setSlipDisplayState(x.BetslipStateSingleCondensed));
                else if (1 < this.model.bets.length && this.isCompatibleForCondensedView())
                    if (this.betslipState !== x.BetslipStateExpanded || 1 < this.model.castBets.length) {
                        if (this.betslipState == x.BetslipStateSingleCondensed || this.betslipState == x.BetslipStateNone) {
                            if (!this.multipleHeader && 1 === e.betbuilderCount)
                                return this.animationHelper.condensedSingleToBetBuilderView(), this.setSlipDisplayState(x.BetslipStateBetBuilderCondensed), void this.messageManager.updateDisplayState(x.BetslipStateBetBuilderCondensed);
                            this.animationHelper.condensedSingleToMultipleView(), this.messageManager.updateDisplayState(x.BetslipStateMultipleCondensed);
                        } else if (this.betslipState !== x.BetslipStateMultipleCondensed) {
                            if (1 === e.betbuilderCount && 0 == e.nonexcludedCount)
                                return this.animationHelper.collapsedToCondensedView(() => {
                                    this.messageManager.updateDisplayState(x.BetslipStateSingleCondensed);
                                }), void this.setSlipDisplayState(x.BetslipStateBetBuilderCondensed);
                            this.multipleHeader.switchToCondensedView(), this.footer.switchToCondensedView(), this.animationHelper.collapsedToCondensedView(() => {
                                this.messageManager.updateDisplayState(x.BetslipStateSingleCondensed);
                            });
                        }
                        this.setSlipDisplayState(x.BetslipStateMultipleCondensed);
                    } else
                        (this.betslipState == x.BetslipStateExpanded || 1 < this.model.castBets.length) && this.multipleHeader && (this.animationHelper.expandedToCondensedView(() => {
                            this.messageManager.updateDisplayState(x.BetslipStateMultipleCondensed);
                        }), this.multipleHeader.switchToCondensedView(), this.setSlipDisplayState(x.BetslipStateMultipleCondensed));
                else
                    1 < this.model.castBets.length && this.betslipState !== x.BetslipStateCollapsed ? this.betslipState !== x.BetslipStateExpanded && this.isCompatibleForCondensedView() ? (this.multipleHeader.switchToCondensedView(), this.footer.switchToCondensedView(), this.animationHelper.collapsedToCondensedView(() => {
                        this.messageManager.updateDisplayState(x.BetslipStateSingleCondensed);
                    }), this.setSlipDisplayState(x.BetslipStateMultipleCondensed)) : this.betslipState === x.BetslipStateExpanded || this.isCompatibleForCondensedView() ? 1 < this.model.castBets.length && this.isCompatibleForCondensedView() ? Locator.validationManager.callNewContext(() => {
                        this.multipleHeader && (this.animationHelper.expandedToCondensedView(() => {
                            this.messageManager.updateDisplayState(x.BetslipStateMultipleCondensed);
                        }), this.multipleHeader && this.multipleHeader.switchToCondensedView(), this.setSlipDisplayState(x.BetslipStateMultipleCondensed));
                    }) : Locator.validationManager.callNewContext(() => {
                        this.animationHelper.expandedToCollapsedView(() => {
                            this.messageManager.updateDisplayState(x.BetslipStateCollapsed);
                        }), this.setSlipDisplayState(x.BetslipStateCollapsed);
                    }) : Locator.validationManager.callNewContext(() => {
                        this.animationHelper.condensedToCollapsedView(), this.setSlipDisplayState(x.BetslipStateCollapsed);
                    }) : 1 < e.allCount && (0 == this.model.multiples.length || !this.isCompatibleForCondensedView()) && this.betslipState !== x.BetslipStateCollapsed && (this.messageManager.updateDisplayState(x.BetslipStateCollapsed), this.animationHelper.condensedToCollapsedView(), this.setSlipDisplayState(x.BetslipStateCollapsed));
            }
        }
        updateSkipUpdateAnimationSetting(e) {
            e && g.HasCookieOverride ? (3 == this.currentState && (this.toSlipFromReceipt(), this.currentState = 1, this.delegate.standardBetslipHideOverlay()), g.HasCookieOverride = !1, this.skipAfterdocumentUpdatedAnimation = !1) : this.skipAfterdocumentUpdatedAnimation = e;
        }
        isCompatibleForCondensedView() {
            if (this.multiplesSuspended)
                return !1;
            if (0 == this.multiples.length) {
                var e = this.getBetCountInfo();
                if (1 == e.betbuilderCount && 1 < e.excludedCount && 0 == e.nonexcludedCount && 0 == e.castCount && !this.hasExcludededStakedBets())
                    return !0;
            }
            for (var t of this.bets)
                if (0 < t.getBetModel().getStake())
                    return !1;
            for (var s of this.multiples)
                if (0 < s.getBetModel().getStake())
                    return !1;
            return this.model.defaultMultiple && !this.model.getMultiplesRestricted() && this.model.defaultMultiple.getBetCount() == this.getSupportedBetcount();
        }
        getBetCountInfo() {
            let e = 0, t = 0, s = 0, i = 0;
            var a, l, n = this.castBets.length, r = this.bets.length + n;
            for (l of this.bets)
                l instanceof h && t++, d.NormalBetItemTypes[l.getBetModel().betTypeLookupKey] && (e++, l.getBetModel().getExcludedState() ? s++ : i++);
            return a = t + i + n, {
                normalsCount: e,
                betbuilderCount: t,
                excludedCount: s,
                nonexcludedCount: i,
                allCount: r,
                allnonexcludedCount: a,
                castCount: n
            };
        }
        getModelCountInfo() {
            let e = 0, t = 0, s = 0, i = 0;
            var a, l, n = this.model.castBets.length, r = this.model.bets.length + n;
            for (l of this.model.bets)
                l instanceof o && t++, d.NormalBetItemTypes[l.betTypeLookupKey] && (e++, l.getExcludedState && l.getExcludedState() ? s++ : i++);
            return a = t + i + n, {
                normalsCount: e,
                betbuilderCount: t,
                excludedCount: s,
                nonexcludedCount: i,
                allCount: r,
                allnonexcludedCount: a,
                castCount: n
            };
        }
        getSupportedBetcount() {
            return 1;
        }
        toSlipReceipt(e) {
            if (!this.receiptContent) {
                if (this.receiptMode = !0, this.calculateResize(), this.triggerResize(), this.messageManager.processMessage({ type: v.CloseRestrictedOddsMessage }), ns_betslipuilib_ui_bet_keypad.Controller.HideKeypad(), this.addStyle('bss-StandardBetslip-receipt'), this.receiptWrapper = new l(), this.receiptWrapper.addStyle('bss-StandardBetslip_ReceiptWrapper'), this.headerWrapper.appendChildAt(this.receiptWrapper, 0), this.receiptContent = this.createReceiptContent(), this.receiptWrapper.appendChild(this.receiptContent), this.addBetTrack(), this.receiptWrapper.appendChild(this.controlBar), this.receiptWrapper.unsuspendElementFromDom(), this.animationHelper.registerReceiptHeader(this.receiptWrapper, this.betslipState, this.hasMoreMultiplebets(), this.hasExcludededStakedBets(), e), 3 == this.currentState && (this.currentSlipResult == p.success || this.currentSlipResult == p.stakeAboveMinimum)) {
                    var t, s, i, a = new ns_betslipuilib_ui_bet_keypad.IncrementLookup();
                    this.multipleHeader && 0 < this.multipleHeader.model.getTotalStake() && a.updateInrementPreferences(this.multipleHeader.model.getTotalStake());
                    for (t of this.multiples)
                        0 < t.model.getTotalStake() && a.updateInrementPreferences(t.model.getTotalStake());
                    for (s of this.model.bets)
                        0 < s.getTotalStake() && a.updateInrementPreferences(s.getTotalStake());
                    for (i of this.model.castBets)
                        0 < i.getTotalStake() && a.updateInrementPreferences(i.getTotalStake());
                    Locator.validationManager.callNewContext(() => {
                        this.messageManager.processMessage({ type: v.CloseBetslipReferralsMessage });
                    }), 0 < this.model.getReferralAmount() && 0 == this.model.getReferralPlaceAmount() && this.messageManager.add(new be(be.REFERRAL_ACCEPTED_MESSAGE_KEY, null), [M.MessageContainerTypeCondensedAndExpanded]), this.messageManager.processMessage({ type: v.CloseWinningsBoostUnqualifiedMessage });
                }
                if (H.isAutoAcceptAllSelected) {
                    H.isAutoAcceptAllSelected = !1;
                    let e = new ke(() => {
                        this.parent.parent.removeChild(e), this.enableSlip();
                    });
                    this.parent.parent.appendChildAt(e, 0), e.validateNow(), this.disableSlip(), this.autoReviewPreference && this.autoReviewPreference.hide(() => {
                        this.footer.removeChild(this.autoReviewPreference), this.autoReviewPreference = null;
                    });
                }
                window.bet365.messageBus.postMessageRequest('app.haptic', { type: 'Success' });
            }
        }
        hasMoreMultiplebets() {
            for (var e of this.multiples)
                if (e.model.key() !== s.SINGLES_MULTIPLE_ITEM_ID && e.hasStake)
                    return !0;
            return !1;
        }
        hasExcludededStakedBets() {
            let e = !1;
            for (var t of this.bets) {
                var s = t.getBetModel();
                s.getExcludedState() && (t.hasStake ? e = e || !0 : s.excludedOnReceipt());
            }
            return e;
        }
        createReceiptContent() {
            return new oe({
                receiptContentDoneClicked: () => {
                    this.animationHelper.closeView(() => {
                        this.delegate.standardBetslipCollapse(), this.delegate.standardBetslipHideOverlay(), this.removeAllClicked = !0, this.model.removeAllItems(), this.currentState = 0, this.dispose();
                    });
                },
                shareBetClicked: () => {
                    new _e(this.model, this).shareBet();
                }
            }, 'bss-ReceiptContent');
        }
        normalBetItemOddsChanged() {
            this.multipleHeader && this.multipleHeader.betItemOddsChanged();
        }
        normalBetItemHandicapChanged() {
            this.multipleHeader && this.multipleHeader.betItemHandicapChanged();
        }
        normalBetItemSuspended() {
            this.multipleHeader && this.multipleHeader.betItemSuspended();
        }
        normalBetItemUnSuspended() {
            this.multipleHeader && this.multipleHeader.betItemUnSuspended();
        }
        ausRacingBetItemEnableSlip() {
            this.enableSlip();
        }
        ausRacingBetItemEnableStakeEntry() {
            this.footer.enableStakeBox();
        }
        ausRacingBetItemDisableStakeEntry() {
            this.footer.disableStakeBox();
        }
        updateBetCreditsState(e) {
            this.betCreditsHeader && this.betCreditsHeader.updateBetCreditState(e);
        }
        multipleHeaderGetPositionPayoutFormat() {
            for (var e of this.bets)
                if (e instanceof t)
                    return e.getBetItemFormat();
            return null;
        }
        positionPayoutBetItemFormatChanged(e) {
            this.footer.updateFooterReturnLabel(e, this.bets.length);
        }
        hasSelfExcludedSelections() {
            return this.model.getBetslipResult() == p.SelfExcluded;
        }
        setScrollTo(e) {
            this.contentWrapper.getElement().scrollTop = e;
        }
        footerShakeStakeBox() {
            this.slipResultChanged(p.noStakeProvided, this.currentState);
        }
        static MakeAccessible(e) {
            e && e.link && Se.MakeAccessible(e.link), e && e.excludedSnglesHeader && Se.MakeAccessible(e.excludedSnglesHeader);
        }
    };
    L.NormalBetItemTypes = {
        [f.NormalBet]: a,
        [f.EachwayBet]: N,
        [f.EwexBet]: V,
        [f.NoReservesBet]: W,
        [f.PitcherBet]: U,
        [f.ScorecastBet]: G,
        [f.AutoVoidBet]: F,
        [f.PositionPayoutBet]: t
    }, L.MessageKeysToSkip = [
        'unspecified',
        'invalid_min_stake',
        'selections_changed_mobile',
        'void_bet_builder_warning',
        'cf-bm-290'
    ], L.CastBetItemTypes = {}, L = d = __decorate([AccessibilityDelegate(L)], L), r.StandardBetslip = L;
})(ns_betslipstandarduilib_ui_slip = ns_betslipstandarduilib_ui_slip || {});