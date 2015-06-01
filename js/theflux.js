/* ========================================================================
 * Bootstrap: transition.js v3.3.4
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);


/* ========================================================================
 * Bootstrap: scrollspy.js v3.3.4
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    this.$body          = $(document.body)
    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0

    this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '3.3.4'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }

  ScrollSpy.prototype.refresh = function () {
    var that          = this
    var offsetMethod  = 'offset'
    var offsetBase    = 0

    this.offsets      = []
    this.targets      = []
    this.scrollHeight = this.getScrollHeight()

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        that.offsets.push(this[0])
        that.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }

    if (activeTarget && scrollTop < offsets[0]) {
      this.activeTarget = null
      return this.clear()
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1])
        && this.activate(targets[i])
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    this.clear()

    var selector = this.selector +
      '[data-target="' + target + '"],' +
      this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }

  ScrollSpy.prototype.clear = function () {
    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

}(jQuery);


/* ========================================================================
 * Bootstrap: tab.js v3.3.4
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.VERSION = '3.3.4'

  Tab.TRANSITION_DURATION = 150

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var $previous = $ul.find('.active:last a')
    var hideEvent = $.Event('hide.bs.tab', {
      relatedTarget: $this[0]
    })
    var showEvent = $.Event('show.bs.tab', {
      relatedTarget: $previous[0]
    })

    $previous.trigger(hideEvent)
    $this.trigger(showEvent)

    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.closest('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $previous.trigger({
        type: 'hidden.bs.tab',
        relatedTarget: $this[0]
      })
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: $previous[0]
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
          .removeClass('active')
        .end()
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', false)

      element
        .addClass('active')
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', true)

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu').length) {
        element
          .closest('li.dropdown')
            .addClass('active')
          .end()
          .find('[data-toggle="tab"]')
            .attr('aria-expanded', true)
      }

      callback && callback()
    }

    $active.length && transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tab

  $.fn.tab             = Plugin
  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  var clickHandler = function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  }

  $(document)
    .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
    .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)

}(jQuery);


/* ========================================================================
 * Bootstrap: tooltip.js v3.3.4
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       = null
    this.options    = null
    this.enabled    = null
    this.timeout    = null
    this.hoverState = null
    this.$element   = null

    this.init('tooltip', element, options)
  }

  Tooltip.VERSION  = '3.3.4'

  Tooltip.TRANSITION_DURATION = 150

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))

    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
    }

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (self && self.$tip && self.$tip.is(':visible')) {
      self.hoverState = 'in'
      return
    }

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
      this.$element.trigger('inserted.bs.' + this.type)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var viewportDim = this.getPosition(this.$viewport)

        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top'    :
                    placement == 'top'    && pos.top    - actualHeight < viewportDim.top    ? 'bottom' :
                    placement == 'right'  && pos.right  + actualWidth  > viewportDim.width  ? 'left'   :
                    placement == 'left'   && pos.left   - actualWidth  < viewportDim.left   ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        var prevHoverState = that.hoverState
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null

        if (prevHoverState == 'out') that.leave(that)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  += marginTop
    offset.left += marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var isVertical          = /top|bottom/.test(placement)
    var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
    this.arrow()
      .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
      .css(isVertical ? 'top' : 'left', '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function (callback) {
    var that = this
    var $tip = $(this.$tip)
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element
        .removeAttr('aria-describedby')
        .trigger('hidden.bs.' + that.type)
      callback && callback()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && $tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element

    var el     = $element[0]
    var isBody = el.tagName == 'BODY'

    var elRect    = el.getBoundingClientRect()
    if (elRect.width == null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
    }
    var elOffset  = isBody ? { top: 0, left: 0 } : $element.offset()
    var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null

    return $.extend({}, elRect, scroll, outerDims, elOffset)
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    if (!this.$tip) {
      this.$tip = $(this.options.template)
      if (this.$tip.length != 1) {
        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
      }
    }
    return this.$tip
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }

  Tooltip.prototype.destroy = function () {
    var that = this
    clearTimeout(this.timeout)
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type)
      if (that.$tip) {
        that.$tip.detach()
      }
      that.$tip = null
      that.$arrow = null
      that.$viewport = null
    })
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tooltip

  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);


/* ========================================================================
 * Bootstrap: popover.js v3.3.4
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.VERSION  = '3.3.4'

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content').children().detach().end()[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.popover

  $.fn.popover             = Plugin
  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);


/* ========================================================================
 * Bootstrap: carousel.js v3.3.4
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      = null
    this.sliding     = null
    this.interval    = null
    this.$active     = null
    this.$items      = null

    this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this))

    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
  }

  Carousel.VERSION  = '3.3.4'

  Carousel.TRANSITION_DURATION = 600

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true,
    keyboard: true
  }

  Carousel.prototype.keydown = function (e) {
    if (/input|textarea/i.test(e.target.tagName)) return
    switch (e.which) {
      case 37: this.prev(); break
      case 39: this.next(); break
      default: return
    }

    e.preventDefault()
  }

  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item')
    return this.$items.index(item || this.$active)
  }

  Carousel.prototype.getItemForDirection = function (direction, active) {
    var activeIndex = this.getItemIndex(active)
    var willWrap = (direction == 'prev' && activeIndex === 0)
                || (direction == 'next' && activeIndex == (this.$items.length - 1))
    if (willWrap && !this.options.wrap) return active
    var delta = direction == 'prev' ? -1 : 1
    var itemIndex = (activeIndex + delta) % this.$items.length
    return this.$items.eq(itemIndex)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || this.getItemForDirection(type, $active)
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var that      = this

    if ($next.hasClass('active')) return (this.sliding = false)

    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }

    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  var old = $.fn.carousel

  $.fn.carousel             = Plugin
  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  var clickHandler = function (e) {
    var href
    var $this   = $(this)
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
    if (!$target.hasClass('carousel')) return
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    Plugin.call($target, options)

    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  }

  $(document)
    .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
    .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler)

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })

}(jQuery);


/* ========================================================================
 * Bootstrap: collapse.js v3.3.4
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
                           '[data-toggle="collapse"][data-target="#' + element.id + '"]')
    this.transitioning = null

    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.3.4'

  Collapse.TRANSITION_DURATION = 350

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  Collapse.prototype.getParent = function () {
    return $(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()

    Plugin.call($target, option)
  })

}(jQuery);


/* ========================================================================
 * Bootstrap: modal.js v3.3.4
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options             = options
    this.$body               = $(document.body)
    this.$element            = $(element)
    this.$dialog             = this.$element.find('.modal-dialog')
    this.$backdrop           = null
    this.isShown             = null
    this.originalBodyPad     = null
    this.scrollbarWidth      = 0
    this.ignoreBackdropClick = false

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.3.4'

  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.setScrollbar()
    this.$body.addClass('modal-open')

    this.escape()
    this.resize()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
      })
    })

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      that.adjustDialog()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element.addClass('in')

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$dialog // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()
    this.resize()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .off('click.dismiss.bs.modal')
      .off('mouseup.dismiss.bs.modal')

    this.$dialog.off('mousedown.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
    } else {
      $(window).off('resize.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetAdjustments()
      that.resetScrollbar()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $(document.createElement('div'))
        .addClass('modal-backdrop ' + animate)
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false
          return
        }
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus()
          : this.hide()
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog()
  }

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

    this.$element.css({
      paddingLeft:  !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    })
  }

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    })
  }

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect()
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    this.originalBodyPad = document.body.style.paddingRight || ''
    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad)
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);


/* ========================================================================
 * Bootstrap: dropdown.js v3.3.4
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.3.4'

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }

      if (!$parent.hasClass('open')) return

      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.attr('aria-expanded', 'false')
      $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget)
    })
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $(document.createElement('div'))
          .addClass('dropdown-backdrop')
          .insertAfter($(this))
          .on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')

      $parent
        .toggleClass('open')
        .trigger('shown.bs.dropdown', relatedTarget)
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive && e.which != 27 || isActive && e.which == 27) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.disabled):visible a'
    var $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc)

    if (!$items.length) return

    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--         // up
    if (e.which == 40 && index < $items.length - 1) index++         // down
    if (!~index)                                    index = 0

    $items.eq(index).trigger('focus')
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)

}(jQuery);


/* ========================================================================
 * Bootstrap: affix.js v3.3.4
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)

    this.$target = $(this.options.target)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      = null
    this.unpin        = null
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.VERSION  = '3.3.4'

  Affix.RESET    = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }

  Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
    var scrollTop    = this.$target.scrollTop()
    var position     = this.$element.offset()
    var targetHeight = this.$target.height()

    if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false

    if (this.affixed == 'bottom') {
      if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
      return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom'
    }

    var initializing   = this.affixed == null
    var colliderTop    = initializing ? scrollTop : position.top
    var colliderHeight = initializing ? targetHeight : height

    if (offsetTop != null && scrollTop <= offsetTop) return 'top'
    if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'

    return false
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var height       = this.$element.height()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom
    var scrollHeight = $(document.body).height()

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)

    if (this.affixed != affix) {
      if (this.unpin != null) this.$element.css('top', '')

      var affixType = 'affix' + (affix ? '-' + affix : '')
      var e         = $.Event(affixType + '.bs.affix')

      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return

      this.affixed = affix
      this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

      this.$element
        .removeClass(Affix.RESET)
        .addClass(affixType)
        .trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
    }

    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - height - offsetBottom
      })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.affix

  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
      if (data.offsetTop    != null) data.offset.top    = data.offsetTop

      Plugin.call($spy, data)
    })
  })

}(jQuery);


/*!
 * Smooth Scroll - v1.4.13 - 2013-11-02
 * https://github.com/kswedberg/jquery-smooth-scroll
 * Copyright (c) 2013 Karl Swedberg
 * Licensed MIT (https://github.com/kswedberg/jquery-smooth-scroll/blob/master/LICENSE-MIT)
 */

(function($) {
var version = '1.4.13',
    optionOverrides = {},
    defaults = {
      exclude: [],
      excludeWithin:[],
      offset: 0,

      // one of 'top' or 'left'
      direction: 'top',

      // jQuery set of elements you wish to scroll (for $.smoothScroll).
      //  if null (default), $('html, body').firstScrollable() is used.
      scrollElement: null,

      // only use if you want to override default behavior
      scrollTarget: null,

      // fn(opts) function to be called before scrolling occurs.
      // `this` is the element(s) being scrolled
      beforeScroll: function() {},

      // fn(opts) function to be called after scrolling occurs.
      // `this` is the triggering element
      afterScroll: function() {},
      easing: 'swing',
      speed: 400,

      // coefficient for "auto" speed
      autoCoefficent: 2,

      // $.fn.smoothScroll only: whether to prevent the default click action
      preventDefault: true
    },

    getScrollable = function(opts) {
      var scrollable = [],
          scrolled = false,
          dir = opts.dir && opts.dir == 'left' ? 'scrollLeft' : 'scrollTop';

      this.each(function() {

        if (this == document || this == window) { return; }
        var el = $(this);
        if ( el[dir]() > 0 ) {
          scrollable.push(this);
        } else {
          // if scroll(Top|Left) === 0, nudge the element 1px and see if it moves
          el[dir](1);
          scrolled = el[dir]() > 0;
          if ( scrolled ) {
            scrollable.push(this);
          }
          // then put it back, of course
          el[dir](0);
        }
      });

      // If no scrollable elements, fall back to <body>,
      // if it's in the jQuery collection
      // (doing this because Safari sets scrollTop async,
      // so can't set it to 1 and immediately get the value.)
      if (!scrollable.length) {
        this.each(function(index) {
          if (this.nodeName === 'BODY') {
            scrollable = [this];
          }
        });
      }

      // Use the first scrollable element if we're calling firstScrollable()
      if ( opts.el === 'first' && scrollable.length > 1 ) {
        scrollable = [ scrollable[0] ];
      }

      return scrollable;
    },
    isTouch = 'ontouchend' in document;

$.fn.extend({
  scrollable: function(dir) {
    var scrl = getScrollable.call(this, {dir: dir});
    return this.pushStack(scrl);
  },
  firstScrollable: function(dir) {
    var scrl = getScrollable.call(this, {el: 'first', dir: dir});
    return this.pushStack(scrl);
  },

  smoothScroll: function(options, extra) {
    options = options || {};

    if ( options === 'options' ) {
      if ( !extra ) {
        return this.first().data('ssOpts');
      }
      return this.each(function() {
        var $this = $(this),
            opts = $.extend($this.data('ssOpts') || {}, extra);

        $(this).data('ssOpts', opts);
      });
    }

    var opts = $.extend({}, $.fn.smoothScroll.defaults, options),
        locationPath = $.smoothScroll.filterPath(location.pathname);

    this
    .unbind('click.smoothscroll')
    .bind('click.smoothscroll', function(event) {
      var link = this,
          $link = $(this),
          thisOpts = $.extend({}, opts, $link.data('ssOpts') || {}),
          exclude = opts.exclude,
          excludeWithin = thisOpts.excludeWithin,
          elCounter = 0, ewlCounter = 0,
          include = true,
          clickOpts = {},
          hostMatch = ((location.hostname === link.hostname) || !link.hostname),
          pathMatch = thisOpts.scrollTarget || ( $.smoothScroll.filterPath(link.pathname) || locationPath ) === locationPath,
          thisHash = escapeSelector(link.hash);

      if ( !thisOpts.scrollTarget && (!hostMatch || !pathMatch || !thisHash) ) {
        include = false;
      } else {
        while (include && elCounter < exclude.length) {
          if ($link.is(escapeSelector(exclude[elCounter++]))) {
            include = false;
          }
        }
        while ( include && ewlCounter < excludeWithin.length ) {
          if ($link.closest(excludeWithin[ewlCounter++]).length) {
            include = false;
          }
        }
      }

      if ( include ) {

        if ( thisOpts.preventDefault ) {
          event.preventDefault();
        }

        $.extend( clickOpts, thisOpts, {
          scrollTarget: thisOpts.scrollTarget || thisHash,
          link: link
        });
        $.smoothScroll( clickOpts );
      }
    });

    return this;
  }
});

$.smoothScroll = function(options, px) {
  if ( options === 'options' && typeof px === 'object' ) {
    return $.extend(optionOverrides, px);
  }
  var opts, $scroller, scrollTargetOffset, speed,
      scrollerOffset = 0,
      offPos = 'offset',
      scrollDir = 'scrollTop',
      aniProps = {},
      aniOpts = {},
      scrollprops = [];

  if (typeof options === 'number') {
    opts = $.extend({link: null}, $.fn.smoothScroll.defaults, optionOverrides);
    scrollTargetOffset = options;
  } else {
    opts = $.extend({link: null}, $.fn.smoothScroll.defaults, options || {}, optionOverrides);
    if (opts.scrollElement) {
      offPos = 'position';
      if (opts.scrollElement.css('position') == 'static') {
        opts.scrollElement.css('position', 'relative');
      }
    }
  }

  scrollDir = opts.direction == 'left' ? 'scrollLeft' : scrollDir;

  if ( opts.scrollElement ) {
    $scroller = opts.scrollElement;
    if ( !(/^(?:HTML|BODY)$/).test($scroller[0].nodeName) ) {
      scrollerOffset = $scroller[scrollDir]();
    }
  } else {
    $scroller = $('html, body').firstScrollable(opts.direction);
  }

  // beforeScroll callback function must fire before calculating offset
  opts.beforeScroll.call($scroller, opts);

  scrollTargetOffset = (typeof options === 'number') ? options :
                        px ||
                        ( $(opts.scrollTarget)[offPos]() &&
                        $(opts.scrollTarget)[offPos]()[opts.direction] ) ||
                        0;

  aniProps[scrollDir] = scrollTargetOffset + scrollerOffset + opts.offset;
  speed = opts.speed;

  // automatically calculate the speed of the scroll based on distance / coefficient
  if (speed === 'auto') {

    // if aniProps[scrollDir] == 0 then we'll use scrollTop() value instead
    speed = aniProps[scrollDir] || $scroller.scrollTop();

    // divide the speed by the coefficient
    speed = speed / opts.autoCoefficent;
  }

  aniOpts = {
    duration: speed,
    easing: opts.easing,
    complete: function() {
      opts.afterScroll.call(opts.link, opts);
    }
  };

  if (opts.step) {
    aniOpts.step = opts.step;
  }

  if ($scroller.length) {
    $scroller.stop().animate(aniProps, aniOpts);
  } else {
    opts.afterScroll.call(opts.link, opts);
  }
};

$.smoothScroll.version = version;
$.smoothScroll.filterPath = function(string) {
  return string
    .replace(/^\//,'')
    .replace(/(?:index|default).[a-zA-Z]{3,4}$/,'')
    .replace(/\/$/,'');
};

// default options
$.fn.smoothScroll.defaults = defaults;

function escapeSelector (str) {
  return str.replace(/(:|\.)/g,'\\$1');
}

})(jQuery);


/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
	def: 'easeOutQuad',
	swing: function (x, t, b, c, d) {
		//alert(jQuery.easing.default);
		return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
	},
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */

/*!
Waypoints - 3.1.1
Copyright © 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blog/master/licenses.txt
*/
(function() {
  'use strict'

  var keyCounter = 0
  var allWaypoints = {}

  /* http://imakewebthings.com/waypoints/api/waypoint */
  function Waypoint(options) {
    if (!options) {
      throw new Error('No options passed to Waypoint constructor')
    }
    if (!options.element) {
      throw new Error('No element option passed to Waypoint constructor')
    }
    if (!options.handler) {
      throw new Error('No handler option passed to Waypoint constructor')
    }

    this.key = 'waypoint-' + keyCounter
    this.options = Waypoint.Adapter.extend({}, Waypoint.defaults, options)
    this.element = this.options.element
    this.adapter = new Waypoint.Adapter(this.element)
    this.callback = options.handler
    this.axis = this.options.horizontal ? 'horizontal' : 'vertical'
    this.enabled = this.options.enabled
    this.triggerPoint = null
    this.group = Waypoint.Group.findOrCreate({
      name: this.options.group,
      axis: this.axis
    })
    this.context = Waypoint.Context.findOrCreateByElement(this.options.context)

    if (Waypoint.offsetAliases[this.options.offset]) {
      this.options.offset = Waypoint.offsetAliases[this.options.offset]
    }
    this.group.add(this)
    this.context.add(this)
    allWaypoints[this.key] = this
    keyCounter += 1
  }

  /* Private */
  Waypoint.prototype.queueTrigger = function(direction) {
    this.group.queueTrigger(this, direction)
  }

  /* Private */
  Waypoint.prototype.trigger = function(args) {
    if (!this.enabled) {
      return
    }
    if (this.callback) {
      this.callback.apply(this, args)
    }
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/destroy */
  Waypoint.prototype.destroy = function() {
    this.context.remove(this)
    this.group.remove(this)
    delete allWaypoints[this.key]
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/disable */
  Waypoint.prototype.disable = function() {
    this.enabled = false
    return this
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/enable */
  Waypoint.prototype.enable = function() {
    this.context.refresh()
    this.enabled = true
    return this
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/next */
  Waypoint.prototype.next = function() {
    return this.group.next(this)
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/previous */
  Waypoint.prototype.previous = function() {
    return this.group.previous(this)
  }

  /* Private */
  Waypoint.invokeAll = function(method) {
    var allWaypointsArray = []
    for (var waypointKey in allWaypoints) {
      allWaypointsArray.push(allWaypoints[waypointKey])
    }
    for (var i = 0, end = allWaypointsArray.length; i < end; i++) {
      allWaypointsArray[i][method]()
    }
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/destroy-all */
  Waypoint.destroyAll = function() {
    Waypoint.invokeAll('destroy')
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/disable-all */
  Waypoint.disableAll = function() {
    Waypoint.invokeAll('disable')
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/enable-all */
  Waypoint.enableAll = function() {
    Waypoint.invokeAll('enable')
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/refresh-all */
  Waypoint.refreshAll = function() {
    Waypoint.Context.refreshAll()
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/viewport-height */
  Waypoint.viewportHeight = function() {
    return window.innerHeight || document.documentElement.clientHeight
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/viewport-width */
  Waypoint.viewportWidth = function() {
    return document.documentElement.clientWidth
  }

  Waypoint.adapters = []

  Waypoint.defaults = {
    context: window,
    continuous: true,
    enabled: true,
    group: 'default',
    horizontal: false,
    offset: 0
  }

  Waypoint.offsetAliases = {
    'bottom-in-view': function() {
      return this.context.innerHeight() - this.adapter.outerHeight()
    },
    'right-in-view': function() {
      return this.context.innerWidth() - this.adapter.outerWidth()
    }
  }

  window.Waypoint = Waypoint
}())
;(function() {
  'use strict'

  function requestAnimationFrameShim(callback) {
    window.setTimeout(callback, 1000 / 60)
  }

  var keyCounter = 0
  var contexts = {}
  var Waypoint = window.Waypoint
  var oldWindowLoad = window.onload

  /* http://imakewebthings.com/waypoints/api/context */
  function Context(element) {
    this.element = element
    this.Adapter = Waypoint.Adapter
    this.adapter = new this.Adapter(element)
    this.key = 'waypoint-context-' + keyCounter
    this.didScroll = false
    this.didResize = false
    this.oldScroll = {
      x: this.adapter.scrollLeft(),
      y: this.adapter.scrollTop()
    }
    this.waypoints = {
      vertical: {},
      horizontal: {}
    }

    element.waypointContextKey = this.key
    contexts[element.waypointContextKey] = this
    keyCounter += 1

    this.createThrottledScrollHandler()
    this.createThrottledResizeHandler()
  }

  /* Private */
  Context.prototype.add = function(waypoint) {
    var axis = waypoint.options.horizontal ? 'horizontal' : 'vertical'
    this.waypoints[axis][waypoint.key] = waypoint
    this.refresh()
  }

  /* Private */
  Context.prototype.checkEmpty = function() {
    var horizontalEmpty = this.Adapter.isEmptyObject(this.waypoints.horizontal)
    var verticalEmpty = this.Adapter.isEmptyObject(this.waypoints.vertical)
    if (horizontalEmpty && verticalEmpty) {
      this.adapter.off('.waypoints')
      delete contexts[this.key]
    }
  }

  /* Private */
  Context.prototype.createThrottledResizeHandler = function() {
    var self = this

    function resizeHandler() {
      self.handleResize()
      self.didResize = false
    }

    this.adapter.on('resize.waypoints', function() {
      if (!self.didResize) {
        self.didResize = true
        Waypoint.requestAnimationFrame(resizeHandler)
      }
    })
  }

  /* Private */
  Context.prototype.createThrottledScrollHandler = function() {
    var self = this
    function scrollHandler() {
      self.handleScroll()
      self.didScroll = false
    }

    this.adapter.on('scroll.waypoints', function() {
      if (!self.didScroll || Waypoint.isTouch) {
        self.didScroll = true
        Waypoint.requestAnimationFrame(scrollHandler)
      }
    })
  }

  /* Private */
  Context.prototype.handleResize = function() {
    Waypoint.Context.refreshAll()
  }

  /* Private */
  Context.prototype.handleScroll = function() {
    var triggeredGroups = {}
    var axes = {
      horizontal: {
        newScroll: this.adapter.scrollLeft(),
        oldScroll: this.oldScroll.x,
        forward: 'right',
        backward: 'left'
      },
      vertical: {
        newScroll: this.adapter.scrollTop(),
        oldScroll: this.oldScroll.y,
        forward: 'down',
        backward: 'up'
      }
    }

    for (var axisKey in axes) {
      var axis = axes[axisKey]
      var isForward = axis.newScroll > axis.oldScroll
      var direction = isForward ? axis.forward : axis.backward

      for (var waypointKey in this.waypoints[axisKey]) {
        var waypoint = this.waypoints[axisKey][waypointKey]
        var wasBeforeTriggerPoint = axis.oldScroll < waypoint.triggerPoint
        var nowAfterTriggerPoint = axis.newScroll >= waypoint.triggerPoint
        var crossedForward = wasBeforeTriggerPoint && nowAfterTriggerPoint
        var crossedBackward = !wasBeforeTriggerPoint && !nowAfterTriggerPoint
        if (crossedForward || crossedBackward) {
          waypoint.queueTrigger(direction)
          triggeredGroups[waypoint.group.id] = waypoint.group
        }
      }
    }

    for (var groupKey in triggeredGroups) {
      triggeredGroups[groupKey].flushTriggers()
    }

    this.oldScroll = {
      x: axes.horizontal.newScroll,
      y: axes.vertical.newScroll
    }
  }

  /* Private */
  Context.prototype.innerHeight = function() {
    /*eslint-disable eqeqeq */
    if (this.element == this.element.window) {
      return Waypoint.viewportHeight()
    }
    /*eslint-enable eqeqeq */
    return this.adapter.innerHeight()
  }

  /* Private */
  Context.prototype.remove = function(waypoint) {
    delete this.waypoints[waypoint.axis][waypoint.key]
    this.checkEmpty()
  }

  /* Private */
  Context.prototype.innerWidth = function() {
    /*eslint-disable eqeqeq */
    if (this.element == this.element.window) {
      return Waypoint.viewportWidth()
    }
    /*eslint-enable eqeqeq */
    return this.adapter.innerWidth()
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/context-destroy */
  Context.prototype.destroy = function() {
    var allWaypoints = []
    for (var axis in this.waypoints) {
      for (var waypointKey in this.waypoints[axis]) {
        allWaypoints.push(this.waypoints[axis][waypointKey])
      }
    }
    for (var i = 0, end = allWaypoints.length; i < end; i++) {
      allWaypoints[i].destroy()
    }
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/context-refresh */
  Context.prototype.refresh = function() {
    /*eslint-disable eqeqeq */
    var isWindow = this.element == this.element.window
    /*eslint-enable eqeqeq */
    var contextOffset = this.adapter.offset()
    var triggeredGroups = {}
    var axes

    this.handleScroll()
    axes = {
      horizontal: {
        contextOffset: isWindow ? 0 : contextOffset.left,
        contextScroll: isWindow ? 0 : this.oldScroll.x,
        contextDimension: this.innerWidth(),
        oldScroll: this.oldScroll.x,
        forward: 'right',
        backward: 'left',
        offsetProp: 'left'
      },
      vertical: {
        contextOffset: isWindow ? 0 : contextOffset.top,
        contextScroll: isWindow ? 0 : this.oldScroll.y,
        contextDimension: this.innerHeight(),
        oldScroll: this.oldScroll.y,
        forward: 'down',
        backward: 'up',
        offsetProp: 'top'
      }
    }

    for (var axisKey in axes) {
      var axis = axes[axisKey]
      for (var waypointKey in this.waypoints[axisKey]) {
        var waypoint = this.waypoints[axisKey][waypointKey]
        var adjustment = waypoint.options.offset
        var oldTriggerPoint = waypoint.triggerPoint
        var elementOffset = 0
        var freshWaypoint = oldTriggerPoint == null
        var contextModifier, wasBeforeScroll, nowAfterScroll
        var triggeredBackward, triggeredForward

        if (waypoint.element !== waypoint.element.window) {
          elementOffset = waypoint.adapter.offset()[axis.offsetProp]
        }

        if (typeof adjustment === 'function') {
          adjustment = adjustment.apply(waypoint)
        }
        else if (typeof adjustment === 'string') {
          adjustment = parseFloat(adjustment)
          if (waypoint.options.offset.indexOf('%') > - 1) {
            adjustment = Math.ceil(axis.contextDimension * adjustment / 100)
          }
        }

        contextModifier = axis.contextScroll - axis.contextOffset
        waypoint.triggerPoint = elementOffset + contextModifier - adjustment
        wasBeforeScroll = oldTriggerPoint < axis.oldScroll
        nowAfterScroll = waypoint.triggerPoint >= axis.oldScroll
        triggeredBackward = wasBeforeScroll && nowAfterScroll
        triggeredForward = !wasBeforeScroll && !nowAfterScroll

        if (!freshWaypoint && triggeredBackward) {
          waypoint.queueTrigger(axis.backward)
          triggeredGroups[waypoint.group.id] = waypoint.group
        }
        else if (!freshWaypoint && triggeredForward) {
          waypoint.queueTrigger(axis.forward)
          triggeredGroups[waypoint.group.id] = waypoint.group
        }
        else if (freshWaypoint && axis.oldScroll >= waypoint.triggerPoint) {
          waypoint.queueTrigger(axis.forward)
          triggeredGroups[waypoint.group.id] = waypoint.group
        }
      }
    }

    for (var groupKey in triggeredGroups) {
      triggeredGroups[groupKey].flushTriggers()
    }

    return this
  }

  /* Private */
  Context.findOrCreateByElement = function(element) {
    return Context.findByElement(element) || new Context(element)
  }

  /* Private */
  Context.refreshAll = function() {
    for (var contextId in contexts) {
      contexts[contextId].refresh()
    }
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/context-find-by-element */
  Context.findByElement = function(element) {
    return contexts[element.waypointContextKey]
  }

  window.onload = function() {
    if (oldWindowLoad) {
      oldWindowLoad()
    }
    Context.refreshAll()
  }

  Waypoint.requestAnimationFrame = function(callback) {
    var requestFn = window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      requestAnimationFrameShim
    requestFn.call(window, callback)
  }
  Waypoint.Context = Context
}())
;(function() {
  'use strict'

  function byTriggerPoint(a, b) {
    return a.triggerPoint - b.triggerPoint
  }

  function byReverseTriggerPoint(a, b) {
    return b.triggerPoint - a.triggerPoint
  }

  var groups = {
    vertical: {},
    horizontal: {}
  }
  var Waypoint = window.Waypoint

  /* http://imakewebthings.com/waypoints/api/group */
  function Group(options) {
    this.name = options.name
    this.axis = options.axis
    this.id = this.name + '-' + this.axis
    this.waypoints = []
    this.clearTriggerQueues()
    groups[this.axis][this.name] = this
  }

  /* Private */
  Group.prototype.add = function(waypoint) {
    this.waypoints.push(waypoint)
  }

  /* Private */
  Group.prototype.clearTriggerQueues = function() {
    this.triggerQueues = {
      up: [],
      down: [],
      left: [],
      right: []
    }
  }

  /* Private */
  Group.prototype.flushTriggers = function() {
    for (var direction in this.triggerQueues) {
      var waypoints = this.triggerQueues[direction]
      var reverse = direction === 'up' || direction === 'left'
      waypoints.sort(reverse ? byReverseTriggerPoint : byTriggerPoint)
      for (var i = 0, end = waypoints.length; i < end; i += 1) {
        var waypoint = waypoints[i]
        if (waypoint.options.continuous || i === waypoints.length - 1) {
          waypoint.trigger([direction])
        }
      }
    }
    this.clearTriggerQueues()
  }

  /* Private */
  Group.prototype.next = function(waypoint) {
    this.waypoints.sort(byTriggerPoint)
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints)
    var isLast = index === this.waypoints.length - 1
    return isLast ? null : this.waypoints[index + 1]
  }

  /* Private */
  Group.prototype.previous = function(waypoint) {
    this.waypoints.sort(byTriggerPoint)
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints)
    return index ? this.waypoints[index - 1] : null
  }

  /* Private */
  Group.prototype.queueTrigger = function(waypoint, direction) {
    this.triggerQueues[direction].push(waypoint)
  }

  /* Private */
  Group.prototype.remove = function(waypoint) {
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints)
    if (index > -1) {
      this.waypoints.splice(index, 1)
    }
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/first */
  Group.prototype.first = function() {
    return this.waypoints[0]
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/last */
  Group.prototype.last = function() {
    return this.waypoints[this.waypoints.length - 1]
  }

  /* Private */
  Group.findOrCreate = function(options) {
    return groups[options.axis][options.name] || new Group(options)
  }

  Waypoint.Group = Group
}())
;(function() {
  'use strict'

  var $ = window.jQuery
  var Waypoint = window.Waypoint

  function JQueryAdapter(element) {
    this.$element = $(element)
  }

  $.each([
    'innerHeight',
    'innerWidth',
    'off',
    'offset',
    'on',
    'outerHeight',
    'outerWidth',
    'scrollLeft',
    'scrollTop'
  ], function(i, method) {
    JQueryAdapter.prototype[method] = function() {
      var args = Array.prototype.slice.call(arguments)
      return this.$element[method].apply(this.$element, args)
    }
  })

  $.each([
    'extend',
    'inArray',
    'isEmptyObject'
  ], function(i, method) {
    JQueryAdapter[method] = $[method]
  })

  Waypoint.adapters.push({
    name: 'jquery',
    Adapter: JQueryAdapter
  })
  Waypoint.Adapter = JQueryAdapter
}())
;(function() {
  'use strict'

  var Waypoint = window.Waypoint

  function createExtension(framework) {
    return function() {
      var waypoints = []
      var overrides = arguments[0]

      if (framework.isFunction(arguments[0])) {
        overrides = framework.extend({}, arguments[1])
        overrides.handler = arguments[0]
      }

      this.each(function() {
        var options = framework.extend({}, overrides, {
          element: this
        })
        if (typeof options.context === 'string') {
          options.context = framework(this).closest(options.context)[0]
        }
        waypoints.push(new Waypoint(options))
      })

      return waypoints
    }
  }

  if (window.jQuery) {
    window.jQuery.fn.waypoint = createExtension(window.jQuery)
  }
  if (window.Zepto) {
    window.Zepto.fn.waypoint = createExtension(window.Zepto)
  }
}())
;

// Fluidbox
// Description: Replicating the seamless lightbox transition effect seen on Medium.com, with some improvements
// Version: 1.4.3
// Author: Terry Mun
// Author URI: http://terrymun.com

// -------------------------------------------------------- //
//  Dependency: Paul Irish's jQuery debounced resize event  //
// -------------------------------------------------------- //
(function($,sr){

	// debouncing function from John Hann
	// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
	var debounce = function (func, threshold, execAsap) {
		var timeout;

		return function debounced () {
			var obj = this, args = arguments;
			function delayed () {
				if (!execAsap)
				func.apply(obj, args);
				timeout = null;
			};

			if (timeout)
				clearTimeout(timeout);
			else if (execAsap)
				func.apply(obj, args);

			timeout = setTimeout(delayed, threshold || 100);
		};
	}
	// smartresize
	jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

})(jQuery,'smartresize');


// ---------------------------------------------------------------------------------------------------------------------- //
//  Dependency: David Walsh (http://davidwalsh.name/css-animation-callback)                                               //
//              and                                                                                                       //
//              Jonathan Suh (https://jonsuh.com/blog/detect-the-end-of-css-animations-and-transitions-with-javascript/)  //
// ---------------------------------------------------------------------------------------------------------------------- //
function whichTransitionEvent() {
	var t,
		el = document.createElement("fakeelement");

	var transitions = {
		"transition"      : "transitionend",
		"OTransition"     : "oTransitionEnd",
		"MozTransition"   : "transitionend",
		"WebkitTransition": "webkitTransitionEnd"
	}

	for (t in transitions){
		if (el.style[t] !== undefined){
			return transitions[t];
		}
	}
}
var customTransitionEnd = whichTransitionEvent();

// -----------------------------
//  Fluidbox plugin starts here
// -----------------------------
(function ($) {

	var fbCount = 0;

	$.fn.fluidbox = function (opts) {

		// Default settings
		var settings = $.extend(true, {
			viewportFill: 0.95,
			debounceResize: true,
			stackIndex: 1000,
			stackIndexDelta: 10,
			closeTrigger: [
				{
					selector: '.fluidbox-overlay',
					event: 'click'
				},
				{
					selector: 'document',
					event: 'keyup',
					keyCode: 27
				}
			],
			immediateOpen: false,
			loadingEle: true
		}, opts);

		// Keyboard events
		var keyboardEvents = [
			'keyup',
			'keydown',
			'keypress'
		];

		// Ensure that the stackIndex does not become negative
		if(settings.stackIndex < settings.stackIndexDelta) settings.stackIndexDelta = settings.stackIndex;

		// Dynamically create overlay
		$fbOverlay = $('<div />', {
			'class': 'fluidbox-overlay',
			css: {
				'z-index': settings.stackIndex
			}
		});

		// Declare variables
		var $fb = this,
			$w = $(window),		// Shorthand for $(window)
			vpRatio,

			// Function:
			// 1. funcCloseFb()		- used for closing instances of opened Fluidbox
			// 2. funcPositionFb()	- used for dynamic positioning of any instance of opened Fluidbox
			// 3. funcCalcAll()		- used to run funcCalc() for every instance of targered Fluidbox thumbnail
			// 5. fbClickhandler()	- universal click handler for all Fluidbox items
			funcCloseFb = function (selector) {
				$(selector + '.fluidbox-opened').trigger('click');
			},
			funcPositionFb = function ($activeFb, customEvents) {
				// Get shorthand for more objects
				var $img    = $activeFb.find('img').first(),
					$ghost  = $activeFb.find('.fluidbox-ghost'),
					$loader = $activeFb.find('.fluidbox-loader'),
					$wrap	= $activeFb.find('.fluidbox-wrap'),
					$data	= $activeFb.data(),
					fHeight = 0,
					fWidth	= 0,
					_window = {
						height: window.innerHeight,
						width: window.innerWidth
					};

				// Calculate aspect ratio				
				$img.data().imgRatio = $data.natWidth/$data.natHeight;

				// Check natural dimensions
				if(vpRatio > $img.data().imgRatio) {

					// Check if linked image is smaller or larger than intended fill
					if($data.natHeight < $w.height()*settings.viewportFill) {
						// If shorter, preserve smaller height
						fHeight = $data.natHeight;
					} else {
						fHeight = _window.height*settings.viewportFill;
					}

					// Calculate how much to scale along the y-axis
					$data.imgScale = fHeight/$img.height();
					$data.imgScaleY = $data.imgScale;

					// Calcualte how much to scale along the x-axis
					$data.imgScaleX = $data.natWidth*(($img.height()*$data.imgScaleY)/$data.natHeight)/$img.width();

				} else {
					// Check if linked image is smaller or larger than intended fill
					if($data.natWidth < $w.width()*settings.viewportFill) {
						// If narrower, preserve smaller width
						fWidth = $data.natWidth;
					} else {
						fWidth = $w.width()*settings.viewportFill;
					}

					// Calculate how much to scale along the x-axis
					$data.imgScale = fWidth/$img.width();                                      
					$data.imgScaleX = $data.imgScale;

					// Calculate how much to scale along the y-axis
					$data.imgScaleY = $data.natHeight*(($img.width()*$data.imgScaleX)/$data.natWidth)/$img.height();
				}	

				// Magic happens right here... okay, not really. Just really fizzy calculations
				var offsetY = $w.scrollTop()-$img.offset().top + 0.5*($img.data('imgHeight')*($img.data('imgScale')-1))+0.5*(_window.height-$img.data('imgHeight')*$img.data('imgScale')),
					offsetX = 0.5*($img.data('imgWidth')*($img.data('imgScale')-1))+0.5*($w.width()-$img.data('imgWidth')*$img.data('imgScale'))-$img.offset().left,
					scale = parseInt($data.imgScaleX * 1000) / 1000 + ',' + parseInt($data.imgScaleY * 1000) / 1000;
					

				// Apply CSS transforms to ghost element
				// For offsetX and Y:	round to one decimal place
				// For scale: 			round to three decimal places
					
				$ghost
				.add($loader)
				.css({
					'transform': 'translate(' + parseInt(offsetX*10)/10 + 'px,' + parseInt(offsetY*10)/10 + 'px) scale(' + scale + ')',
					top: $img.offset().top - $wrap.offset().top,
					left: $img.offset().left - $wrap.offset().left
				});
				$ghost.one(customTransitionEnd, function() {
					$.each(customEvents, function(i,customEvent) {
						$activeFb.trigger(customEvent);
					});
				});
			},
			funcCalc = function ($fbItem) {
				// Get viewport ratio
				vpRatio = $w.width() / window.innerHeight;

				// Get image dimensions and aspect ratio
				if($fbItem.hasClass('fluidbox')) {
					var $img	= $fbItem.find('img').first(),
						$ghost	= $fbItem.find('.fluidbox-ghost'),
						$loader = $fbItem.find('.fluidbox-loader'),
						$wrap	= $fbItem.find('.fluidbox-wrap'),
						data	= $img.data();

					function imageProp() {
						// Store image dimensions in jQuery object
						data.imgWidth	= $img.width();
						data.imgHeight	= $img.height();
						data.imgRatio	= $img.width()/$img.height();

						// Resize and position ghost element
						$ghost
						.add($loader)
						.css({
							width: $img.width(),
							height: $img.height(),
							top: $img.offset().top - $wrap.offset().top + parseInt($img.css('borderTopWidth')) + parseInt($img.css('paddingTop')),
							left: $img.offset().left - $wrap.offset().left + parseInt($img.css('borderLeftWidth')) + parseInt($img.css('paddingLeft'))
						});

						// Calculate scale based on orientation
						if(vpRatio > data.imgRatio) {
							data.imgScale = window.innerHeight*settings.viewportFill/$img.height();
						} else {
							data.imgScale = $w.width()*settings.viewportFill/$img.width();
						}						
					}

					imageProp();					

					// Rerun everything on imageload, to overcome issue in Firefox
					$img.load(imageProp);
				}
			},
			fbClickHandler = function(e) {

				// Check if the fluidbox element does have .fluidbox assigned to it
				if($(this).hasClass('fluidbox')) {

					// Variables
					var $activeFb	= $(this),
						$img		= $(this).find('img').first(),
						$ghost		= $(this).find('.fluidbox-ghost'),
						$loader		= $(this).find('.fluidbox-loader'),
						$wrap   	= $(this).find('.fluidbox-wrap'),
						linkedImg   = encodeURI($activeFb.attr('href')),
						timer   	= {};

					// Functions
					// 1. fbOpen(): called when Fluidbox receives a click event and is ready to open
					// 2. fbClose(): called when Fluidbox receives a click event and is ready to close
					var fbOpen = function() {
							// Fire custom event: openstart
							$activeFb.trigger('openstart');

							// What are we doing here:
							// 1. Append overlay in fluidbox
							// 2. Toggle fluidbox state with data attribute
							// 3. Store original z-index with data attribute (so users can change z-index when they see fit in CSS file)
							// 4. Class toggle
							$activeFb
							.append($fbOverlay)
							.data('fluidbox-state', 1)
							.removeClass('fluidbox-closed')
							.addClass('fluidbox-opened');

							// Force timer to completion
							if(timer['close']) window.clearTimeout(timer['close']);

							// Set timer for opening
							timer['open'] = window.setTimeout(function() {
								// Show overlay
								$('.fluidbox-overlay').css({ opacity: 1 });
							}, 10);

							// Change wrapper z-index, so it is above everything else
							// Decrease all siblings z-index by 1 just in case
							$('.fluidbox-wrap').css({ zIndex: settings.stackIndex - settings.stackIndexDelta - 1 });
							$wrap.css({ 'z-index': settings.stackIndex + settings.stackIndexDelta });
						},
						fbClose = function() {
							// Fire custom event: closestart
							$activeFb.trigger('closestart');

							// Switch state
							$activeFb
							.data('fluidbox-state', 0)
							.removeClass('fluidbox-opened fluidbox-loaded fluidbox-loading')
							.addClass('fluidbox-closed');

							// Set timer for closing
							if(timer['open']) window.clearTimeout(timer['open']);
							timer['close'] = window.setTimeout(function() {
								$('.fluidbox-overlay').remove();
								$wrap.css({ 'z-index': settings.stackIndex - settings.stackIndexDelta });
							}, 10);

							// Hide overlay
							$('.fluidbox-overlay').css({ opacity: 0 });

							// Reverse animation on wrapped elements, and restore stacking order
							// You might want to change this value if your transition timing is longer
							$ghost
							.add($loader)
							.css({
								'transform': 'translate(0,0) scale(1,1)',
								opacity: 0,
								top: $img.offset().top - $wrap.offset().top + parseInt($img.css('borderTopWidth')) + parseInt($img.css('paddingTop')),
								left: $img.offset().left - $wrap.offset().left + parseInt($img.css('borderLeftWidth')) + parseInt($img.css('paddingLeft'))
							});
							$ghost.one(customTransitionEnd, function() {
								$activeFb.trigger('closeend');
							});
							$img.css({ opacity: 1 });
						};

					if($(this).data('fluidbox-state') === 0 || !$(this).data('fluidbox-state')) {
						// State: Closed
						// Action: Open fluidbox

						// Add class to indicate larger image is being loaded
						$activeFb.addClass('fluidbox-loading');

						// Set thumbnail image source as background image first, preload later
						$img.css({ opacity: 0 });
						$ghost.css({
							'background-image': 'url('+$img.attr('src')+')',
							opacity: 1
						});

						// Check if item should be opened immediately
						if(settings.immediateOpen) {
							
							// Store natural width and height of thumbnail
							// We use this to scale preliminarily
							$activeFb
							.data('natWidth', $img[0].naturalWidth)
							.data('natHeight', $img[0].naturalHeight);

							// Open immediately
							fbOpen();

							// Preliminary positioning of Fluidbox based on available image ratio
							funcPositionFb($activeFb, ['openend']);

							// Preload target image
							$('<img />', {
								src: linkedImg
							}).load(function() {
								// When loading is successful
								// 1. Trigger custom event: imageloaddone
								// 2. Remove loading class
								// 3. Add loaded class
								// 4. Store natural width and height
								$activeFb
								.trigger('imageloaddone').trigger('delayedloaddone')
								.removeClass('fluidbox-loading')
								.addClass('fluidbox-loaded')
								.data('natWidth', $(this)[0].naturalWidth)
								.data('natHeight', $(this)[0].naturalHeight);

								// Show linked image
								$ghost.css({
									'background-image': 'url('+linkedImg+')'});

								// Reposition Fluidbox
								funcPositionFb($activeFb, ['delayedreposdone']);

							}).error(function() {
								// If image fails to load, close Fluidbox
								// Trigger custom event: imageloadfail
								$activeFb.trigger('imageloadfail');
								fbClose();
							});
						} else {
							// If wait for ghost image to preload
							// Preload ghost image
							$('<img />', {
								src: linkedImg
							}).load(function() {
								// When loading is successful
								// 1. Trigger custom event: imageloaddone
								// 2. Remove loading class
								// 3. Add loaded class
								// 4. Store natural width and height
								$activeFb
								.trigger('imageloaddone')
								.removeClass('fluidbox-loading')
								.addClass('fluidbox-loaded')
								.data('natWidth', $(this)[0].naturalWidth)
								.data('natHeight', $(this)[0].naturalHeight);

								// Show linked image
								$ghost.css({ 'background-image': 'url('+linkedImg+')' });

								// Open Fluidbox
								fbOpen();

								// Position Fluidbox
								funcPositionFb($activeFb, ['openend']);

							}).error(function() {
								// If image fails to load, close Fluidbox
								// Trigger custom event: imageloadfail
								$activeFb.trigger('imageloadfail');
								fbClose();
							});
						}

					} else {
						// State: Open
						// Action: Close fluidbox
						fbClose();
					}

					e.preventDefault();
				}
			};
			var funcResize = function (selectorChoice) {
				// Recalculate dimensions
				if(!selectorChoice) {
					// Recalcualte ALL Fluidbox instances (fired upon window resize)
					$fb.each(function () {
						funcCalc($(this));
					});
				} else {
					// Recalcualte selected Fluidbox instances
					funcCalc(selectorChoice);
				}

				// Reposition Fluidbox, but only if one is found to be open
				var $activeFb = $('a.fluidbox.fluidbox-opened');
				if($activeFb.length > 0) funcPositionFb($activeFb, ['resizeend']);
			};

		if(settings.debounceResize) {
			$(window).smartresize(function() { funcResize(); });
		} else {
			$(window).resize(function() { funcResize(); });
		}

		// Go through each individual object
		$fb.each(function (i) {
			// Check if Fluidbox:
			// 1. Is an anchor element ,<a>
			// 2. Contains one and ONLY one child
			// 3. The only child is an image element, <img>
			// 4. If the element is hidden
			if($(this).is('a') && $(this).children().length === 1 && $(this).children().is('img') && $(this).css('display') !== 'none' && $(this).parents().css('display') !== 'none') {

				// Define wrap
				var $fbInnerWrap = $('<div />', {
					'class': 'fluidbox-wrap',
					css: {
						'z-index': settings.stackIndex - settings.stackIndexDelta
					}
				});

				// Define loader
				var $fbLoader = $('<div />', {
					'class': 'fluidbox-loader'
				});

				// Update count for global Fluidbox instances
				fbCount+=1;

				// Add class
				var $fbItem = $(this);
				$fbItem
				.addClass('fluidbox fluidbox-closed')
				.attr('id', 'fluidbox-'+fbCount)
				.wrapInner($fbInnerWrap)
				.find('img')
					.first()
					.css({ opacity: 1 })
					.after('<div class="fluidbox-ghost" />')
					.each(function(){
						var $img = $(this);
						
						if ($img.width() > 0 && $img.height() > 0) {
							// If image is already loaded (from cache)
							funcCalc($fbItem);
							$fbItem.click(fbClickHandler);
						} else {
							// Wait for image to load
							$img.load(function(){
								funcCalc($fbItem);
								$fbItem.click(fbClickHandler);

								// Trigger custom event: thumbloaddone
								$fbItem.trigger('thumbloaddone');
							}).error(function() {
								// Trigger custom event: thumbloadfail
								$fbItem.trigger('thumbloadfail');
							});
						}
				});

				// Check of loader is enabled
				if(settings.loadingEle) {
					$fbItem.find('.fluidbox-ghost').after($fbLoader);
				}

				// Custom trigger
				$(this).on('recompute', function() {
					funcResize($(this));
					$(this).trigger('recomputeend');
				});

				// When should we close Fluidbox?
				var selector = '#fluidbox-'+fbCount;
				if(settings.closeTrigger) {
					// Go through array
					$.each(settings.closeTrigger, function (i) {
						var trigger = settings.closeTrigger[i];

						// Attach events
						if(trigger.selector != 'window') {
							// If it is not 'window', we append click handler to $(document) object, allow it to bubble up
							// However, if thes selector is 'document', we use a different .on() syntax
							if(trigger.selector == 'document') {
								if(trigger.keyCode && keyboardEvents.indexOf(trigger.event) > -1 ) {
									$(document).on(trigger.event, function (e) {
										if(e.keyCode == trigger.keyCode) funcCloseFb(selector);
									});
								} else {
									$(document).on(trigger.event, selector, function() {
										funcCloseFb(selector);
									});
								}
							}
						} else {
							// If it is 'window', append click handler to $(window) object
							$w.on(trigger.event, function() {
								funcCloseFb(selector);
							});
						}
					});
				}
			}
		});

		// Return to allow chaining
		return $fb;
	};

})(jQuery);

/** 
 * @preserve LaziestLoader - v0.5.0 - 2014-06-19
 * A responsive lazy loader for jQuery.
 * http://sjwilliams.github.io/laziestloader/
 * Copyright (c) 2014 Josh Williams; Licensed MIT
 */

(function(factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else {
    factory(jQuery);
  }
}(function($) {

  var laziestLoader = function(options, callback) {

    var $w = $(window),
      $elements = this,
      $loaded = $(), // elements with the correct source set
      retina = window.devicePixelRatio > 1,
      didScroll = false;

    options = $.extend(true, {
      threshold: 0,
      sizePattern: /{{SIZE}}/ig,
      getSource: getSource,
      scrollThrottle: 250, // time in ms to throttle scroll. Increase for better performance.
      sizeOffsetPercent: 0, // prefer smaller images
      setSourceMode: true // plugin sets source attribute of the element. Set to false if you would like to, instead, use the callback to completely manage the element on trigger.
    }, options);

    /**
     * Generate source path of image to load. Take into account
     * type of data supplied and whether or not a retina
     * image is available.
     *
     * Basic option: data attributes specifing a single image to load,
     * regardless of viewport.
     * Eg:
     *
     * <img data-src="yourimage.jpg">
     * <img data-src="yourimage.jpg" data-src-retina="yourretinaimage.jpg">
     *
     * Range of sizes: specify a string path with a {{size}} that
     * will be replaced by an integer from a list of available sizes.
     * Eg:
     *
     * <img data-pattern="path/toyourimage-{{size}}.jpg" data-size="[320, 640, 970]">
     * <img data-pattern="path/toyourimage-{{size}}.jpg" data-pattern-retina="path/toyourimage-{{size}}@2x.jpg" data-size="[320, 640, 970]">
     * <img data-pattern="path/toyourimage/{{size}}/slug.jpg" data-pattern-retina="path/toyourimage/{{size}}/slug@2x.jpg" data-size="[320, 640, 970]">
     *
     * Range of sizes, with slugs: specify a string path with a {{size}} that
     * will be replaced by a slug representing an image size.
     * Eg:
     *
     * <img data-pattern="path/toyourimage-{{size}}.jpg" data-size="[{width: 320, slug: 'small'},{width:900, slug: 'large'}]">
     *
     * @param  {jQuery object} $el
     * @return {String}
     */

    function getSource($el) {
      var source, slug;
      var data = $el.data();
      if (data.pattern && data.widths && $.isArray(data.widths)) {
        source = retina ? data.patternRetina : data.pattern;
        source = source || data.pattern;

        // width or slug version?
        if (typeof data.widths[0] === 'object') {
          slug = (function() {
            var widths = $.map(data.widths, function(val) {
              return val.size;
            });

            var bestFitWidth = bestFit($el.width(), widths);

            // match best width back to its corresponding slug
            for (var i = data.widths.length - 1; i >= 0; i--) {
              if (data.widths[i].size === bestFitWidth) {
                return data.widths[i].slug;
              }
            }
          })();

          source = source.replace(options.sizePattern, slug);
        } else {
          source = source.replace(options.sizePattern, bestFit($el.width(), data.widths));
        }
      } else {
        source = retina ? data.srcRetina : data.src;
        source = source || data.src;
      }

      return source;
    }

    /**
     * Attach event handler that sets correct
     * media source for the elements' width, or
     * allows callback to manipulate element
     * exclusively.
     */

    function bindLoader() {
      $elements.one('laziestloader', function() {
        var $el = $(this);
        var source;

        // set height?
        if ($el.data().ratio) {
          setHeight.call(this);
        }

        // set content. default: set element source
        if (options.setSourceMode) {
          source = options.getSource($el);
          if (source && this.getAttribute('src') !== source) {
            this.setAttribute('src', source);
            if (typeof callback === 'function') callback.call(this);
          }
        } else {
          if (typeof callback === 'function') callback.call(this);
        }

        // reflect current state in classes
        $el.addClass('ll-loaded').removeClass('ll-notloaded');
      });
    }

    /**
     * Remove even handler from elements
     */

    function unbindLoader() {
      $elements.off('laziestloader');
    }

    /**
     * Find the best sized image, opting for larger over smaller
     *
     * @param  {Number} targetWidth   element width
     * @param  {Array} widths         array of numbers
     * @return {Number}
     */

    var bestFit = laziestLoader.bestFit = function(targetWidth, widths) {
      var selectedWidth = widths[widths.length - 1],
        i = widths.length,
        offset = targetWidth * (options.sizeOffsetPercent / 100);

      // sort smallest to largest
      widths.sort(function(a, b) {
        return a - b;
      });

      while (i--) {
        if ((targetWidth - offset) <= widths[i]) {
          selectedWidth = widths[i];
        }
      }

      return selectedWidth;
    };

    /**
     * Cycle through elements that haven't had their
     * source set and, if they're in the viewport within
     * the threshold, load their media
     */

    function laziestloader() {
      var $inview = $elements.not($loaded).filter(function() {
        var $el = $(this),
          threshold = options.threshold;

        if ($el.is(':hidden')) return;

        var wt = $w.scrollTop(),
          wb = wt + $w.height(),
          et = $el.offset().top,
          eb = et + $el.height();

        return eb >= wt - threshold && et <= wb + threshold;
      });

      $inview.trigger('laziestloader');
      $loaded.add($inview);
    }


    function setHeight() {
      var $el = $(this),
        data = $el.data();

      data.ratio = data.ratio || data.heightMultiplier; // backwards compatible for old data-height-multiplier code.

      if (data.ratio) {
        $el.css({
          height: Math.round($el.width() * data.ratio)
        });
      }
    }

    // add inital state classes, ahd check if 
    // element dimensions need to be set.
    $elements.addClass('ll-init ll-notloaded').each(setHeight);

    bindLoader();


    // throttled scroll events
    $w.scroll(function() {
      didScroll = true;
    });

    setInterval(function() {
      if (didScroll) {
        didScroll = false;
        laziestloader();
      }
    }, options.scrollThrottle);

    // reset state on resize
    $w.resize(function() {
      $loaded = $();
      unbindLoader();
      bindLoader();
      laziestloader();
    });

    laziestloader();

    return this;
  };

  $.fn.laziestloader = laziestLoader;

}));


/*!
 * SVG Morpheus v0.1.8
 * https://github.com/alexk111/SVG-Morpheus
 *
 * Copyright (c) 2014 Alex Kaul
 * License: MIT
 *
 * Generated at Tuesday, December 2nd, 2014, 11:12:16 AM
 */
var SVGMorpheus=(function() {
'use strict';

/*
 * Easing functions
 */

var easings={};
easings['circ-in']=function (t) {
  return -1 * (Math.sqrt(1 - t*t) - 1);
};
easings['circ-out']=function (t) {
  return Math.sqrt(1 - (t=t-1)*t);
};
easings['circ-in-out']=function (t) {
  if ((t/=1/2) < 1) return -1/2 * (Math.sqrt(1 - t*t) - 1);
  return 1/2 * (Math.sqrt(1 - (t-=2)*t) + 1);
};
easings['cubic-in']=function (t) { return t*t*t };
easings['cubic-out']=function (t) { return (--t)*t*t+1 };
easings['cubic-in-out']=function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 };
easings['elastic-in']=function (t) {
  var s=1.70158;var p=0;var a=1;
  if (t==0) return 0;  if (t==1) return 1;  if (!p) p=.3;
  if (a < Math.abs(1)) { a=1; var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin (1/a);
  return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t-s)*(2*Math.PI)/p ));
};
easings['elastic-out']=function (t) {
  var s=1.70158;var p=0;var a=1;
  if (t==0) return 0;  if (t==1) return 1;  if (!p) p=.3;
  if (a < Math.abs(1)) { a=1; var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin (1/a);
  return a*Math.pow(2,-10*t) * Math.sin( (t-s)*(2*Math.PI)/p ) + 1;
};
easings['elastic-in-out']=function (t) {
  var s=1.70158;var p=0;var a=1;
  if (t==0) return 0;  if ((t/=1/2)==2) return 1;  if (!p) p=1*(.3*1.5);
  if (a < Math.abs(1)) { a=1; var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin (1/a);
  if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t-s)*(2*Math.PI)/p ));
  return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t-s)*(2*Math.PI)/p )*.5 + 1;
};
easings['expo-in']=function (t) {
  return (t==0) ? 0 : Math.pow(2, 10 * (t - 1));
};
easings['expo-out']=function (t) {
  return (t==1) ? 1 : 1-Math.pow(2, -10 * t);
};
easings['expo-in-out']=function (t) {
  if (t==0) return 0;
  if (t==1) return 1;
  if ((t/=1/2) < 1) return 1/2 * Math.pow(2, 10 * (t - 1));
  return 1/2 * (-Math.pow(2, -10 * --t) + 2);
};
easings['linear']=function (t) { return t };
easings['quad-in']=function (t) { return t*t };
easings['quad-out']=function (t) { return t*(2-t) };
easings['quad-in-out']=function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t };
easings['quart-in']=function (t) { return t*t*t*t };
easings['quart-out']=function (t) { return 1-(--t)*t*t*t };
easings['quart-in-out']=function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t };
easings['quint-in']=function (t) { return t*t*t*t*t };
easings['quint-out']=function (t) { return 1+(--t)*t*t*t*t };
easings['quint-in-out']=function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t };
easings['sine-in']=function (t) {
  return 1-Math.cos(t * (Math.PI/2));
};
easings['sine-out']=function (t) {
  return Math.sin(t * (Math.PI/2));
};
easings['sine-in-out']=function (t) {
  return 1/2 * (1-Math.cos(Math.PI*t));
};


/*
 * Helper functions
 */

var _reqAnimFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;
var _cancelAnimFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.oCancelAnimationFrame;

// Calculate style
function styleNormCalc(styleNormFrom, styleNormTo, progress) {
  var i, len, styleNorm={};
  for(i in styleNormFrom) {
    switch (i) {
      case 'fill':
      case 'stroke':
        styleNorm[i]=clone(styleNormFrom[i]);
        styleNorm[i].r=styleNormFrom[i].r+(styleNormTo[i].r-styleNormFrom[i].r)*progress;
        styleNorm[i].g=styleNormFrom[i].g+(styleNormTo[i].g-styleNormFrom[i].g)*progress;
        styleNorm[i].b=styleNormFrom[i].b+(styleNormTo[i].b-styleNormFrom[i].b)*progress;
        styleNorm[i].opacity=styleNormFrom[i].opacity+(styleNormTo[i].opacity-styleNormFrom[i].opacity)*progress;
        break;
      case 'opacity':
      case 'fill-opacity':
      case 'stroke-opacity':
      case 'stroke-width':
        styleNorm[i]=styleNormFrom[i]+(styleNormTo[i]-styleNormFrom[i])*progress;
        break;
    }
  }
  return styleNorm;
}

function styleNormToString(styleNorm) {
  var i;
  var style={};
  for(i in styleNorm) {
    switch (i) {
      case 'fill':
      case 'stroke':
        style[i]=rgbToString(styleNorm[i]);
        break;
      case 'opacity':
      case 'fill-opacity':
      case 'stroke-opacity':
      case 'stroke-width':
        style[i]=styleNorm[i];
        break;
    }
  }
  return style;
}

function styleToNorm(styleFrom, styleTo) {
  var styleNorm=[{},{}];
  var i;
  for(i in styleFrom) {
    switch(i) {
      case 'fill':
      case 'stroke':
        styleNorm[0][i]=getRGB(styleFrom[i]);
        if(styleTo[i]===undefined) {
          styleNorm[1][i]=getRGB(styleFrom[i]);
          styleNorm[1][i].opacity=0;
        }
        break;
      case 'opacity':
      case 'fill-opacity':
      case 'stroke-opacity':
      case 'stroke-width':
        styleNorm[0][i]=styleFrom[i];
        if(styleTo[i]===undefined) {
          styleNorm[1][i]=1;
        }
        break;
    }
  }
  for(i in styleTo) {
    switch(i) {
      case 'fill':
      case 'stroke':
        styleNorm[1][i]=getRGB(styleTo[i]);
        if(styleFrom[i]===undefined) {
          styleNorm[0][i]=getRGB(styleTo[i]);
          styleNorm[0][i].opacity=0;
        }
        break;
      case 'opacity':
      case 'fill-opacity':
      case 'stroke-opacity':
      case 'stroke-width':
        styleNorm[1][i]=styleTo[i];
        if(styleFrom[i]===undefined) {
          styleNorm[0][i]=1;
        }
        break;
    }
  }
  return styleNorm;
}

// Calculate transform progress
function transCalc(transFrom, transTo, progress) {
  var res={};
  for(var i in transFrom) {
    switch(i) {
      case 'rotate':
        res[i]=[0,0,0];
        for(var j=0;j<3;j++) {
          res[i][j]=transFrom[i][j]+(transTo[i][j]-transFrom[i][j])*progress;
        }
        break;
    }
  }
  return res;
}

function trans2string(trans) {
  var res='';
  if(!!trans.rotate) {
    res+='rotate('+trans.rotate.join(' ')+')';
  }
  return res;
}

// Calculate curve progress
function curveCalc(curveFrom, curveTo, progress) {
  var curve=[];
  for(var i=0,len1=curveFrom.length;i<len1;i++) {
    curve.push([curveFrom[i][0]]);
    for(var j=1,len2=curveFrom[i].length;j<len2;j++) {
      curve[i].push(curveFrom[i][j]+(curveTo[i][j]-curveFrom[i][j])*progress);
    }
  }
  return curve;
}

function clone(obj) {
  var copy;

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = clone(obj[attr]);
      }
    }
    return copy;
  }

  return obj;
}



/*
 * Useful things from Adobe's Snap.svg adopted to the library needs
 */

/*
 * Paths
 */

var spaces = "\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029";
var pathCommand = new RegExp("([a-z])[" + spaces + ",]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[" + spaces + "]*,?[" + spaces + "]*)+)", "ig");
var pathValues = new RegExp("(-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?)[" + spaces + "]*,?[" + spaces + "]*", "ig");

// Parses given path string into an array of arrays of path segments
var parsePathString = function (pathString) {
  if (!pathString) {
    return null;
  }

  if(typeof pathString === typeof []) {
    return pathString;
  } else {
    var paramCounts = {a: 7, c: 6, o: 2, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, u: 3, z: 0},
        data = [];

    String(pathString).replace(pathCommand, function (a, b, c) {
      var params = [],
          name = b.toLowerCase();
      c.replace(pathValues, function (a, b) {
        b && params.push(+b);
      });
      if (name == "m" && params.length > 2) {
        data.push([b].concat(params.splice(0, 2)));
        name = "l";
        b = b == "m" ? "l" : "L";
      }
      if (name == "o" && params.length == 1) {
        data.push([b, params[0]]);
      }
      if (name == "r") {
        data.push([b].concat(params));
      } else while (params.length >= paramCounts[name]) {
        data.push([b].concat(params.splice(0, paramCounts[name])));
        if (!paramCounts[name]) {
          break;
        }
      }
    });

    return data;
  }
};

// http://schepers.cc/getting-to-the-point
var catmullRom2bezier=function(crp, z) {
  var d = [];
  for (var i = 0, iLen = crp.length; iLen - 2 * !z > i; i += 2) {
    var p = [
              {x: +crp[i - 2], y: +crp[i - 1]},
              {x: +crp[i],     y: +crp[i + 1]},
              {x: +crp[i + 2], y: +crp[i + 3]},
              {x: +crp[i + 4], y: +crp[i + 5]}
            ];
    if (z) {
      if (!i) {
        p[0] = {x: +crp[iLen - 2], y: +crp[iLen - 1]};
      } else if (iLen - 4 == i) {
        p[3] = {x: +crp[0], y: +crp[1]};
      } else if (iLen - 2 == i) {
        p[2] = {x: +crp[0], y: +crp[1]};
        p[3] = {x: +crp[2], y: +crp[3]};
      }
    } else {
      if (iLen - 4 == i) {
        p[3] = p[2];
      } else if (!i) {
        p[0] = {x: +crp[i], y: +crp[i + 1]};
      }
    }
    d.push(["C",
          (-p[0].x + 6 * p[1].x + p[2].x) / 6,
          (-p[0].y + 6 * p[1].y + p[2].y) / 6,
          (p[1].x + 6 * p[2].x - p[3].x) / 6,
          (p[1].y + 6*p[2].y - p[3].y) / 6,
          p[2].x,
          p[2].y
    ]);
  }

  return d;

};

var ellipsePath=function(x, y, rx, ry, a) {
  if (a == null && ry == null) {
    ry = rx;
  }
  x = +x;
  y = +y;
  rx = +rx;
  ry = +ry;
  if (a != null) {
    var rad = Math.PI / 180,
        x1 = x + rx * Math.cos(-ry * rad),
        x2 = x + rx * Math.cos(-a * rad),
        y1 = y + rx * Math.sin(-ry * rad),
        y2 = y + rx * Math.sin(-a * rad),
        res = [["M", x1, y1], ["A", rx, rx, 0, +(a - ry > 180), 0, x2, y2]];
  } else {
    res = [
        ["M", x, y],
        ["m", 0, -ry],
        ["a", rx, ry, 0, 1, 1, 0, 2 * ry],
        ["a", rx, ry, 0, 1, 1, 0, -2 * ry],
        ["z"]
    ];
  }
  return res;
};

var pathToAbsolute=function(pathArray) {
  pathArray = parsePathString(pathArray);

  if (!pathArray || !pathArray.length) {
    return [["M", 0, 0]];
  }
  var res = [],
      x = 0,
      y = 0,
      mx = 0,
      my = 0,
      start = 0,
      pa0;
  if (pathArray[0][0] == "M") {
    x = +pathArray[0][1];
    y = +pathArray[0][2];
    mx = x;
    my = y;
    start++;
    res[0] = ["M", x, y];
  }
  var crz = pathArray.length == 3 &&
      pathArray[0][0] == "M" &&
      pathArray[1][0].toUpperCase() == "R" &&
      pathArray[2][0].toUpperCase() == "Z";
  for (var r, pa, i = start, ii = pathArray.length; i < ii; i++) {
    res.push(r = []);
    pa = pathArray[i];
    pa0 = pa[0];
    if (pa0 != pa0.toUpperCase()) {
      r[0] = pa0.toUpperCase();
      switch (r[0]) {
        case "A":
          r[1] = pa[1];
          r[2] = pa[2];
          r[3] = pa[3];
          r[4] = pa[4];
          r[5] = pa[5];
          r[6] = +pa[6] + x;
          r[7] = +pa[7] + y;
          break;
        case "V":
          r[1] = +pa[1] + y;
          break;
        case "H":
          r[1] = +pa[1] + x;
          break;
        case "R":
          var dots = [x, y].concat(pa.slice(1));
          for (var j = 2, jj = dots.length; j < jj; j++) {
            dots[j] = +dots[j] + x;
            dots[++j] = +dots[j] + y;
          }
          res.pop();
          res = res.concat(catmullRom2bezier(dots, crz));
          break;
        case "O":
          res.pop();
          dots = ellipsePath(x, y, pa[1], pa[2]);
          dots.push(dots[0]);
          res = res.concat(dots);
          break;
        case "U":
          res.pop();
          res = res.concat(ellipsePath(x, y, pa[1], pa[2], pa[3]));
          r = ["U"].concat(res[res.length - 1].slice(-2));
          break;
        case "M":
          mx = +pa[1] + x;
          my = +pa[2] + y;
        default:
          for (j = 1, jj = pa.length; j < jj; j++) {
            r[j] = +pa[j] + ((j % 2) ? x : y);
          }
      }
    } else if (pa0 == "R") {
      dots = [x, y].concat(pa.slice(1));
      res.pop();
      res = res.concat(catmullRom2bezier(dots, crz));
      r = ["R"].concat(pa.slice(-2));
    } else if (pa0 == "O") {
      res.pop();
      dots = ellipsePath(x, y, pa[1], pa[2]);
      dots.push(dots[0]);
      res = res.concat(dots);
    } else if (pa0 == "U") {
      res.pop();
      res = res.concat(ellipsePath(x, y, pa[1], pa[2], pa[3]));
      r = ["U"].concat(res[res.length - 1].slice(-2));
    } else {
      for (var k = 0, kk = pa.length; k < kk; k++) {
        r[k] = pa[k];
      }
    }
    pa0 = pa0.toUpperCase();
    if (pa0 != "O") {
      switch (r[0]) {
        case "Z":
          x = +mx;
          y = +my;
          break;
        case "H":
          x = r[1];
          break;
        case "V":
          y = r[1];
          break;
        case "M":
          mx = r[r.length - 2];
          my = r[r.length - 1];
        default:
          x = r[r.length - 2];
          y = r[r.length - 1];
      }
    }
  }

  return res;
};

var l2c = function(x1, y1, x2, y2) {
  return [x1, y1, x2, y2, x2, y2];
};
var q2c = function(x1, y1, ax, ay, x2, y2) {
  var _13 = 1 / 3,
      _23 = 2 / 3;
  return [
          _13 * x1 + _23 * ax,
          _13 * y1 + _23 * ay,
          _13 * x2 + _23 * ax,
          _13 * y2 + _23 * ay,
          x2,
          y2
      ];
};
var a2c = function(x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
  // for more information of where this math came from visit:
  // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
  var _120 = Math.PI * 120 / 180,
      rad = Math.PI / 180 * (+angle || 0),
      res = [],
      xy,
      rotate = function (x, y, rad) {
          var X = x * Math.cos(rad) - y * Math.sin(rad),
              Y = x * Math.sin(rad) + y * Math.cos(rad);
          return {x: X, y: Y};
      };
  if (!recursive) {
    xy = rotate(x1, y1, -rad);
    x1 = xy.x;
    y1 = xy.y;
    xy = rotate(x2, y2, -rad);
    x2 = xy.x;
    y2 = xy.y;
    var cos = Math.cos(Math.PI / 180 * angle),
        sin = Math.sin(Math.PI / 180 * angle),
        x = (x1 - x2) / 2,
        y = (y1 - y2) / 2;
    var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
    if (h > 1) {
      h = Math.sqrt(h);
      rx = h * rx;
      ry = h * ry;
    }
    var rx2 = rx * rx,
        ry2 = ry * ry,
        k = (large_arc_flag == sweep_flag ? -1 : 1) *
            Math.sqrt(Math.abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
        cx = k * rx * y / ry + (x1 + x2) / 2,
        cy = k * -ry * x / rx + (y1 + y2) / 2,
        f1 = Math.asin(((y1 - cy) / ry).toFixed(9)),
        f2 = Math.asin(((y2 - cy) / ry).toFixed(9));

    f1 = x1 < cx ? Math.PI - f1 : f1;
    f2 = x2 < cx ? Math.PI - f2 : f2;
    f1 < 0 && (f1 = Math.PI * 2 + f1);
    f2 < 0 && (f2 = Math.PI * 2 + f2);
    if (sweep_flag && f1 > f2) {
      f1 = f1 - Math.PI * 2;
    }
    if (!sweep_flag && f2 > f1) {
      f2 = f2 - Math.PI * 2;
    }
  } else {
    f1 = recursive[0];
    f2 = recursive[1];
    cx = recursive[2];
    cy = recursive[3];
  }
  var df = f2 - f1;
  if (Math.abs(df) > _120) {
    var f2old = f2,
        x2old = x2,
        y2old = y2;
    f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
    x2 = cx + rx * Math.cos(f2);
    y2 = cy + ry * Math.sin(f2);
    res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
  }
  df = f2 - f1;
  var c1 = Math.cos(f1),
      s1 = Math.sin(f1),
      c2 = Math.cos(f2),
      s2 = Math.sin(f2),
      t = Math.tan(df / 4),
      hx = 4 / 3 * rx * t,
      hy = 4 / 3 * ry * t,
      m1 = [x1, y1],
      m2 = [x1 + hx * s1, y1 - hy * c1],
      m3 = [x2 + hx * s2, y2 - hy * c2],
      m4 = [x2, y2];
  m2[0] = 2 * m1[0] - m2[0];
  m2[1] = 2 * m1[1] - m2[1];
  if (recursive) {
    return [m2, m3, m4].concat(res);
  } else {
    res = [m2, m3, m4].concat(res).join().split(",");
    var newres = [];
    for (var i = 0, ii = res.length; i < ii; i++) {
      newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
    }
    return newres;
  }
};

var path2curve=function(path, path2) {
  var p = pathToAbsolute(path),
      p2 = path2 && pathToAbsolute(path2),
      attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
      attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
      processPath = function (path, d, pcom) {
        var nx, ny;
        if (!path) {
          return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
        }
        !(path[0] in {T: 1, Q: 1}) && (d.qx = d.qy = null);
        switch (path[0]) {
          case "M":
            d.X = path[1];
            d.Y = path[2];
            break;
          case "A":
            path = ["C"].concat(a2c.apply(0, [d.x, d.y].concat(path.slice(1))));
            break;
          case "S":
            if (pcom == "C" || pcom == "S") { // In "S" case we have to take into account, if the previous command is C/S.
              nx = d.x * 2 - d.bx;          // And reflect the previous
              ny = d.y * 2 - d.by;          // command's control point relative to the current point.
            }
            else {                            // or some else or nothing
              nx = d.x;
              ny = d.y;
            }
            path = ["C", nx, ny].concat(path.slice(1));
            break;
          case "T":
            if (pcom == "Q" || pcom == "T") { // In "T" case we have to take into account, if the previous command is Q/T.
              d.qx = d.x * 2 - d.qx;        // And make a reflection similar
              d.qy = d.y * 2 - d.qy;        // to case "S".
            }
            else {                            // or something else or nothing
              d.qx = d.x;
              d.qy = d.y;
            }
            path = ["C"].concat(q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
            break;
          case "Q":
            d.qx = path[1];
            d.qy = path[2];
            path = ["C"].concat(q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
            break;
          case "L":
            path = ["C"].concat(l2c(d.x, d.y, path[1], path[2]));
            break;
          case "H":
            path = ["C"].concat(l2c(d.x, d.y, path[1], d.y));
            break;
          case "V":
            path = ["C"].concat(l2c(d.x, d.y, d.x, path[1]));
            break;
          case "Z":
            path = ["C"].concat(l2c(d.x, d.y, d.X, d.Y));
            break;
        }
        return path;
      },
      fixArc = function (pp, i) {
        if (pp[i].length > 7) {
          pp[i].shift();
          var pi = pp[i];
          while (pi.length) {
            pcoms1[i] = "A"; // if created multiple C:s, their original seg is saved
            p2 && (pcoms2[i] = "A"); // the same as above
            pp.splice(i++, 0, ["C"].concat(pi.splice(0, 6)));
          }
          pp.splice(i, 1);
          ii = Math.max(p.length, p2 && p2.length || 0);
        }
      },
      fixM = function (path1, path2, a1, a2, i) {
        if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
          path2.splice(i, 0, ["M", a2.x, a2.y]);
          a1.bx = 0;
          a1.by = 0;
          a1.x = path1[i][1];
          a1.y = path1[i][2];
          ii = Math.max(p.length, p2 && p2.length || 0);
        }
      },
      pcoms1 = [], // path commands of original path p
      pcoms2 = [], // path commands of original path p2
      pfirst = "", // temporary holder for original path command
      pcom = ""; // holder for previous path command of original path
  for (var i = 0, ii = Math.max(p.length, p2 && p2.length || 0); i < ii; i++) {
    p[i] && (pfirst = p[i][0]); // save current path command

    if (pfirst != "C") { // C is not saved yet, because it may be result of conversion
      pcoms1[i] = pfirst; // Save current path command
      i && ( pcom = pcoms1[i - 1]); // Get previous path command pcom
    }
    p[i] = processPath(p[i], attrs, pcom); // Previous path command is inputted to processPath

    if (pcoms1[i] != "A" && pfirst == "C") pcoms1[i] = "C"; // A is the only command
    // which may produce multiple C:s
    // so we have to make sure that C is also C in original path

    fixArc(p, i); // fixArc adds also the right amount of A:s to pcoms1

    if (p2) { // the same procedures is done to p2
      p2[i] && (pfirst = p2[i][0]);
      if (pfirst != "C") {
        pcoms2[i] = pfirst;
        i && (pcom = pcoms2[i - 1]);
      }
      p2[i] = processPath(p2[i], attrs2, pcom);

      if (pcoms2[i] != "A" && pfirst == "C") {
        pcoms2[i] = "C";
      }

      fixArc(p2, i);
    }
    fixM(p, p2, attrs, attrs2, i);
    fixM(p2, p, attrs2, attrs, i);
    var seg = p[i],
        seg2 = p2 && p2[i],
        seglen = seg.length,
        seg2len = p2 && seg2.length;
    attrs.x = seg[seglen - 2];
    attrs.y = seg[seglen - 1];
    attrs.bx = parseFloat(seg[seglen - 4]) || attrs.x;
    attrs.by = parseFloat(seg[seglen - 3]) || attrs.y;
    attrs2.bx = p2 && (parseFloat(seg2[seg2len - 4]) || attrs2.x);
    attrs2.by = p2 && (parseFloat(seg2[seg2len - 3]) || attrs2.y);
    attrs2.x = p2 && seg2[seg2len - 2];
    attrs2.y = p2 && seg2[seg2len - 1];
  }

  return p2 ? [p, p2] : p;
};

var box=function(x, y, width, height) {
  if (x == null) {
    x = y = width = height = 0;
  }
  if (y == null) {
    y = x.y;
    width = x.width;
    height = x.height;
    x = x.x;
  }
  return {
    x: x,
    y: y,
    w: width,
    h: height,
    cx: x + width / 2,
    cy: y + height / 2
  };
};

// Returns bounding box of cubic bezier curve.
// Source: http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
// Original version: NISHIO Hirokazu
// Modifications: https://github.com/timo22345
var curveDim=function(x0, y0, x1, y1, x2, y2, x3, y3) {
  var tvalues = [],
      bounds = [[], []],
      a, b, c, t, t1, t2, b2ac, sqrtb2ac;
  for (var i = 0; i < 2; ++i) {
    if (i == 0) {
      b = 6 * x0 - 12 * x1 + 6 * x2;
      a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
      c = 3 * x1 - 3 * x0;
    } else {
      b = 6 * y0 - 12 * y1 + 6 * y2;
      a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
      c = 3 * y1 - 3 * y0;
    }
    if (Math.abs(a) < 1e-12) {
      if (Math.abs(b) < 1e-12) {
        continue;
      }
      t = -c / b;
      if (0 < t && t < 1) {
        tvalues.push(t);
      }
      continue;
    }
    b2ac = b * b - 4 * c * a;
    sqrtb2ac = Math.sqrt(b2ac);
    if (b2ac < 0) {
      continue;
    }
    t1 = (-b + sqrtb2ac) / (2 * a);
    if (0 < t1 && t1 < 1) {
      tvalues.push(t1);
    }
    t2 = (-b - sqrtb2ac) / (2 * a);
    if (0 < t2 && t2 < 1) {
      tvalues.push(t2);
    }
  }

  var x, y, j = tvalues.length,
      jlen = j,
      mt;
  while (j--) {
    t = tvalues[j];
    mt = 1 - t;
    bounds[0][j] = (mt * mt * mt * x0) + (3 * mt * mt * t * x1) + (3 * mt * t * t * x2) + (t * t * t * x3);
    bounds[1][j] = (mt * mt * mt * y0) + (3 * mt * mt * t * y1) + (3 * mt * t * t * y2) + (t * t * t * y3);
  }

  bounds[0][jlen] = x0;
  bounds[1][jlen] = y0;
  bounds[0][jlen + 1] = x3;
  bounds[1][jlen + 1] = y3;
  bounds[0].length = bounds[1].length = jlen + 2;

  return {
    min: {x: Math.min.apply(0, bounds[0]), y: Math.min.apply(0, bounds[1])},
    max: {x: Math.max.apply(0, bounds[0]), y: Math.max.apply(0, bounds[1])}
  };
};

var curvePathBBox=function(path) {
  var x = 0,
      y = 0,
      X = [],
      Y = [],
      p;
  for (var i = 0, ii = path.length; i < ii; i++) {
    p = path[i];
    if (p[0] == "M") {
      x = p[1];
      y = p[2];
      X.push(x);
      Y.push(y);
    } else {
      var dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
      X = X.concat(dim.min.x, dim.max.x);
      Y = Y.concat(dim.min.y, dim.max.y);
      x = p[5];
      y = p[6];
    }
  }
  var xmin = Math.min.apply(0, X),
      ymin = Math.min.apply(0, Y),
      xmax = Math.max.apply(0, X),
      ymax = Math.max.apply(0, Y),
      bb = box(xmin, ymin, xmax - xmin, ymax - ymin);

  return bb;
};

var p2s=/,?([a-z]),?/gi;
var path2string=function(path) {
  return path.join(',').replace(p2s, "$1");
};

/*
 * Styles
 */

var hsrg = {hs: 1, rg: 1},
    has = "hasOwnProperty",
    colourRegExp = /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?%?)\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?%?)\s*\))\s*$/i,
    commaSpaces = new RegExp("[" + spaces + "]*,[" + spaces + "]*");

// Converts RGB values to a hex representation of the color
// var rgb = function (r, g, b, o) {
//   if (isFinite(o)) {
//     var round = math.round;
//     return "rgba(" + [round(r), round(g), round(b), +o.toFixed(2)] + ")";
//   }
//   return "#" + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1);
// };
var rgbToString = function (rgb) {
  var round = Math.round;
  return "rgba(" + [round(rgb.r), round(rgb.g), round(rgb.b), +rgb.opacity.toFixed(2)] + ")";
};
var toHex = function (color) {
  var i = window.document.getElementsByTagName("head")[0] || window.document.getElementsByTagName("svg")[0],
      red = "rgb(255, 0, 0)";
  toHex = function (color) {
    if (color.toLowerCase() == "red") {
      return red;
    }
    i.style.color = red;
    i.style.color = color;
    var out = window.document.defaultView.getComputedStyle(i, "").getPropertyValue("color");
    return out == red ? null : out;
  };
  return toHex(color);
};

var packageRGB = function (r, g, b, o) {
  r = Math.round(r * 255);
  g = Math.round(g * 255);
  b = Math.round(b * 255);
  var rgb = {
      r: r,
      g: g,
      b: b,
      opacity: isFinite(o) ? o : 1
  };
  return rgb;
};

// Converts HSB values to an RGB object
var hsb2rgb = function (h, s, v, o) {
  if (typeof h === typeof {} && "h" in h && "s" in h && "b" in h) {
      v = h.b;
      s = h.s;
      h = h.h;
      o = h.o;
  }
  h *= 360;
  var R, G, B, X, C;
  h = (h % 360) / 60;
  C = v * s;
  X = C * (1 - Math.abs(h % 2 - 1));
  R = G = B = v - C;

  h = ~~h;
  R += [C, X, 0, 0, X, C][h];
  G += [X, C, C, X, 0, 0][h];
  B += [0, 0, X, C, C, X][h];
  return packageRGB(R, G, B, o);
};

// Converts HSL values to an RGB object
var hsl2rgb = function (h, s, l, o) {
  if (typeof h === typeof {} && "h" in h && "s" in h && "l" in h) {
    l = h.l;
    s = h.s;
    h = h.h;
  }
  if (h > 1 || s > 1 || l > 1) {
    h /= 360;
    s /= 100;
    l /= 100;
  }
  h *= 360;
  var R, G, B, X, C;
  h = (h % 360) / 60;
  C = 2 * s * (l < .5 ? l : 1 - l);
  X = C * (1 - Math.abs(h % 2 - 1));
  R = G = B = l - C / 2;

  h = ~~h;
  R += [C, X, 0, 0, X, C][h];
  G += [X, C, C, X, 0, 0][h];
  B += [0, 0, X, C, C, X][h];
  return packageRGB(R, G, B, o);
};

// Parses color string as RGB object
var getRGB = function (colour) {
  if (!colour || !!((colour = String(colour)).indexOf("-") + 1)) {
    return {r: -1, g: -1, b: -1, opacity: -1, error: 1};
  }
  if (colour == "none") {
    return {r: -1, g: -1, b: -1, opacity: -1};
  }
  !(hsrg[has](colour.toLowerCase().substring(0, 2)) || colour.charAt() == "#") && (colour = toHex(colour));
  if (!colour) {
    return {r: -1, g: -1, b: -1, opacity: -1, error: 1};
  }
  var res,
      red,
      green,
      blue,
      opacity,
      t,
      values,
      rgb = colour.match(colourRegExp);
  if (rgb) {
    if (rgb[2]) {
      blue = parseInt(rgb[2].substring(5), 16);
      green = parseInt(rgb[2].substring(3, 5), 16);
      red = parseInt(rgb[2].substring(1, 3), 16);
    }
    if (rgb[3]) {
      blue = parseInt((t = rgb[3].charAt(3)) + t, 16);
      green = parseInt((t = rgb[3].charAt(2)) + t, 16);
      red = parseInt((t = rgb[3].charAt(1)) + t, 16);
    }
    if (rgb[4]) {
      values = rgb[4].split(commaSpaces);
      red = parseFloat(values[0]);
      values[0].slice(-1) == "%" && (red *= 2.55);
      green = parseFloat(values[1]);
      values[1].slice(-1) == "%" && (green *= 2.55);
      blue = parseFloat(values[2]);
      values[2].slice(-1) == "%" && (blue *= 2.55);
      rgb[1].toLowerCase().slice(0, 4) == "rgba" && (opacity = parseFloat(values[3]));
      values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
    }
    if (rgb[5]) {
      values = rgb[5].split(commaSpaces);
      red = parseFloat(values[0]);
      values[0].slice(-1) == "%" && (red /= 100);
      green = parseFloat(values[1]);
      values[1].slice(-1) == "%" && (green /= 100);
      blue = parseFloat(values[2]);
      values[2].slice(-1) == "%" && (blue /= 100);
      (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
      rgb[1].toLowerCase().slice(0, 4) == "hsba" && (opacity = parseFloat(values[3]));
      values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
      return hsb2rgb(red, green, blue, opacity);
    }
    if (rgb[6]) {
      values = rgb[6].split(commaSpaces);
      red = parseFloat(values[0]);
      values[0].slice(-1) == "%" && (red /= 100);
      green = parseFloat(values[1]);
      values[1].slice(-1) == "%" && (green /= 100);
      blue = parseFloat(values[2]);
      values[2].slice(-1) == "%" && (blue /= 100);
      (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
      rgb[1].toLowerCase().slice(0, 4) == "hsla" && (opacity = parseFloat(values[3]));
      values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
      return hsl2rgb(red, green, blue, opacity);
    }
    red = Math.min(Math.round(red), 255);
    green = Math.min(Math.round(green), 255);
    blue = Math.min(Math.round(blue), 255);
    opacity = Math.min(Math.max(opacity, 0), 1);
    rgb = {r: red, g: green, b: blue};
    rgb.opacity = isFinite(opacity) ? opacity : 1;
    return rgb;
  }
  return {r: -1, g: -1, b: -1, opacity: -1, error: 1};
};

function SVGMorpheus(element, options, callback) {
  if (!element) {
    throw new Error('SVGMorpheus > "element" is required');
  }

  if(typeof element === typeof '') {
    element=document.querySelector(element);
    if (!element) {
      throw new Error('SVGMorpheus > "element" query is not related to an existing DOM node');
    }
  }

  if (!!options && typeof options !== typeof {}) {
    throw new Error('SVGMorpheus > "options" parameter must be an object');
  }
  options = options || {};

  if (!!callback && typeof callback !== typeof (function(){})) {
    throw new Error('SVGMorpheus > "callback" parameter must be a function');
  }

  var that=this;

  this._icons={};
  this._curIconId=options.iconId || '';
  this._toIconId='';
  this._curIconItems=[];
  this._fromIconItems=[];
  this._toIconItems=[];
  this._morphNodes=[];
  this._morphG;
  this._startTime;
  this._defDuration=options.duration || 750;
  this._defEasing=options.easing || 'quad-in-out';
  this._defRotation=options.rotation || 'clock';
  this._defCallback = callback || function () {};
  this._duration=this._defDuration;
  this._easing=this._defEasing;
  this._rotation=this._defRotation;
  this._callback=this._defCallback;
  this._rafid;

  this._fnTick=function(timePassed) {
    if(!that._startTime) {
      that._startTime=timePassed;
    }
    var progress=Math.min((timePassed-that._startTime)/that._duration,1);
    that._updateAnimationProgress(progress);
    if(progress<1) {
      that._rafid=_reqAnimFrame(that._fnTick);
    } else {
      that._animationEnd();
    }
  };

  if(element.nodeName.toUpperCase()==='SVG') {
    this._svgDoc=element;
  } else {
    this._svgDoc = element.getSVGDocument();
  }
  if(!this._svgDoc) {
    element.addEventListener("load",function(){
      that._svgDoc = element.getSVGDocument();
      that._init();
    },false);
  } else {
    that._init();
  }
}

SVGMorpheus.prototype._init=function(){
  if(this._svgDoc.nodeName.toUpperCase()!=='SVG') {
    this._svgDoc=this._svgDoc.getElementsByTagName('svg')[0];
  }

  if(!!this._svgDoc) {
    var lastIconId='',
        i, len, id, items, item, j, len2, icon;

    // Read Icons Data
    // Icons = 1st tier G nodes having ID
    for(i=this._svgDoc.childNodes.length-1;i>=0;i--) {
      var nodeIcon=this._svgDoc.childNodes[i];
      if(nodeIcon.nodeName.toUpperCase()==='G') {
        id=nodeIcon.getAttribute('id');
        if(!!id) {
          items=[];
          for(j=0, len2=nodeIcon.childNodes.length;j<len2;j++) {
            var nodeItem=nodeIcon.childNodes[j];
            item={
              path: '',
              attrs: {},
              style: {}
            };

            // Get Item Path (Convert all shapes into Path Data)
            switch(nodeItem.nodeName.toUpperCase()) {
              case 'PATH':
                item.path=nodeItem.getAttribute('d');
                break;
              case 'CIRCLE':
                var cx=nodeItem.getAttribute('cx')*1,
                    cy=nodeItem.getAttribute('cy')*1,
                    r=nodeItem.getAttribute('r')*1;
                item.path='M'+(cx-r)+','+cy+'a'+r+','+r+' 0 1,0 '+(r*2)+',0a'+r+','+r+' 0 1,0 -'+(r*2)+',0z';
                break;
              case 'ELLIPSE':
                var cx=nodeItem.getAttribute('cx')*1,
                    cy=nodeItem.getAttribute('cy')*1,
                    rx=nodeItem.getAttribute('rx')*1,
                    ry=nodeItem.getAttribute('ry')*1;
                item.path='M'+(cx-rx)+','+cy+'a'+rx+','+ry+' 0 1,0 '+(rx*2)+',0a'+rx+','+ry+' 0 1,0 -'+(rx*2)+',0z';
                break;
              case 'RECT':
                var x=nodeItem.getAttribute('x')*1,
                    y=nodeItem.getAttribute('y')*1,
                    w=nodeItem.getAttribute('width')*1,
                    h=nodeItem.getAttribute('height')*1,
                    rx=nodeItem.getAttribute('rx')*1,
                    ry=nodeItem.getAttribute('ry')*1;
                if(!rx && !ry) {
                  item.path='M'+x+','+y+'l'+w+',0l0,'+h+'l-'+w+',0z';
                } else {
                  item.path='M'+(x+rx)+','+y+
                            'l'+(w-rx*2)+',0'+
                            'a'+rx+','+ry+' 0 0,1 '+rx+','+ry+
                            'l0,'+(h-ry*2)+
                            'a'+rx+','+ry+' 0 0,1 -'+rx+','+ry+
                            'l'+(rx*2-w)+',0'+
                            'a'+rx+','+ry+' 0 0,1 -'+rx+',-'+ry+
                            'l0,'+(ry*2-h)+
                            'a'+rx+','+ry+' 0 0,1 '+rx+',-'+ry+
                            'z';
                }
                break;
              case 'POLYGON':
                var points=nodeItem.getAttribute('points');
                var p = points.split(/\s+/);
                var path = "";
                for( var k = 0, len = p.length; k < len; k++ ){
                    path += (k && "L" || "M") + p[k]
                }
                item.path=path+'z';
                break;
              case 'LINE':
                var x1=nodeItem.getAttribute('x1')*1,
                    y1=nodeItem.getAttribute('y1')*1,
                    x2=nodeItem.getAttribute('x2')*1,
                    y2=nodeItem.getAttribute('y2')*1;
                item.path='M'+x1+','+y1+'L'+x2+','+y2+'z';
                break;
            }
            if(item.path!='') {
              // Traverse all attributes and get style values
              for (var k = 0, len3=nodeItem.attributes.length; k < len3; k++) {
                var attrib = nodeItem.attributes[k];
                if (attrib.specified) {
                  var name=attrib.name.toLowerCase();
                  switch (name) {
                    case 'fill':
                    case 'fill-opacity':
                    case 'opacity':
                    case 'stroke':
                    case 'stroke-opacity':
                    case 'stroke-width':
                      item.attrs[name]=attrib.value;
                  }
                }
              }

              // Traverse all inline styles and get supported values
              for (var l = 0, len4=nodeItem.style.length; l < len4; l++) {
                var styleName = nodeItem.style[l];
                switch (styleName) {
                  case 'fill':
                  case 'fill-opacity':
                  case 'opacity':
                  case 'stroke':
                  case 'stroke-opacity':
                  case 'stroke-width':
                    item.style[styleName]=nodeItem.style[styleName];
                }
              }

              items.push(item);
            }
          }

          // Add Icon
          if(items.length>0) {
            icon={
              id: id,
              items: items
            };
            this._icons[id]=icon;
          }

          // Init Node for Icons Items and remove Icon Nodes
          if(!this._morphG) {
            lastIconId=id;
            this._morphG=document.createElementNS('http://www.w3.org/2000/svg', 'g');
            this._svgDoc.replaceChild(this._morphG,nodeIcon);
          } else {
            this._svgDoc.removeChild(nodeIcon);
          }
        }
      }
    }
    // To Default Icon
    if(lastIconId!=='') {
      this._setupAnimation(lastIconId);
      this._updateAnimationProgress(1);
      this._animationEnd();
    }
  }

};

SVGMorpheus.prototype._setupAnimation=function(toIconId) {
  if(!!toIconId && !!this._icons[toIconId]) {
    this._toIconId=toIconId;
    this._startTime=undefined;
    var i, len, j, len2;
    this._fromIconItems=clone(this._curIconItems);
    this._toIconItems=clone(this._icons[toIconId].items);

    for(i=0, len=this._morphNodes.length;i<len;i++) {
      var morphNode=this._morphNodes[i];
      morphNode.fromIconItemIdx=i;
      morphNode.toIconItemIdx=i;
    }

    var maxNum=Math.max(this._fromIconItems.length, this._toIconItems.length);
    var toBB;
    for(i=0;i<maxNum;i++) {
      // Add items to fromIcon/toIcon if needed
      if(!this._fromIconItems[i]) {
        if(!!this._toIconItems[i]) {
          toBB=curvePathBBox(path2curve(this._toIconItems[i].path));
          this._fromIconItems.push({
            path: 'M'+toBB.cx+','+toBB.cy+'l0,0',
            attrs: {},
            style: {},
            trans: {
              'rotate': [0,toBB.cx,toBB.cy]
            }
          });
        } else {
          this._fromIconItems.push({
            path: 'M0,0l0,0',
            attrs: {},
            style: {},
            trans: {
              'rotate': [0,0,0]
            }
          });
        }
      }
      if(!this._toIconItems[i]) {
        if(!!this._fromIconItems[i]) {
          toBB=curvePathBBox(path2curve(this._fromIconItems[i].path));
          this._toIconItems.push({
            path: 'M'+toBB.cx+','+toBB.cy+'l0,0',
            attrs: {},
            style: {},
            trans: {
              'rotate': [0,toBB.cx,toBB.cy]
            }
          });
        } else {
          this._toIconItems.push({
            path: 'M0,0l0,0',
            attrs: {},
            style: {},
            trans: {
              'rotate': [0,0,0]
            }
          });
        }
      }

      // Add Node to DOM if needed
      if(!this._morphNodes[i]) {
        var node=document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this._morphG.appendChild(node);
        this._morphNodes.push({
          node: node,
          fromIconItemIdx: i,
          toIconItemIdx: i
        });
      }
    }

    for(i=0;i<maxNum;i++) {
      var fromIconItem=this._fromIconItems[i];
      var toIconItem=this._toIconItems[i];

      // Calculate from/to curve data and set to fromIcon/toIcon
      var curves=path2curve(this._fromIconItems[i].path,this._toIconItems[i].path);
      fromIconItem.curve=curves[0];
      toIconItem.curve=curves[1];

      // Normalize from/to attrs
      var attrsNorm=styleToNorm(this._fromIconItems[i].attrs,this._toIconItems[i].attrs);
      fromIconItem.attrsNorm=attrsNorm[0];
      toIconItem.attrsNorm=attrsNorm[1];
      fromIconItem.attrs=styleNormToString(fromIconItem.attrsNorm);
      toIconItem.attrs=styleNormToString(toIconItem.attrsNorm);

      // Normalize from/to style
      var styleNorm=styleToNorm(this._fromIconItems[i].style,this._toIconItems[i].style);
      fromIconItem.styleNorm=styleNorm[0];
      toIconItem.styleNorm=styleNorm[1];
      fromIconItem.style=styleNormToString(fromIconItem.styleNorm);
      toIconItem.style=styleNormToString(toIconItem.styleNorm);

      // Calculate from/to transform
      toBB=curvePathBBox(toIconItem.curve);
      toIconItem.trans={
        'rotate': [0,toBB.cx,toBB.cy]
      };
      var rotation=this._rotation, degAdd;
      if(rotation==='random') {
        rotation=Math.random()<0.5?'counterclock':'clock';
      }
      switch(rotation) {
        case 'none':
          if(!!fromIconItem.trans.rotate) {
            toIconItem.trans.rotate[0]=fromIconItem.trans.rotate[0];
          }
          break;
        case 'counterclock':
          if(!!fromIconItem.trans.rotate) {
            toIconItem.trans.rotate[0]=fromIconItem.trans.rotate[0]-360;
            degAdd=-fromIconItem.trans.rotate[0]%360;
            toIconItem.trans.rotate[0]+=(degAdd<180?degAdd:degAdd-360);
          } else {
            toIconItem.trans.rotate[0]=-360;
          }
          break;
        default: // Clockwise
          if(!!fromIconItem.trans.rotate) {
            toIconItem.trans.rotate[0]=fromIconItem.trans.rotate[0]+360;
            degAdd=fromIconItem.trans.rotate[0]%360;
            toIconItem.trans.rotate[0]+=(degAdd<180?-degAdd:360-degAdd);
          } else {
            toIconItem.trans.rotate[0]=360;
          }
          break;
      }
    }

    this._curIconItems=clone(this._fromIconItems);
  }
};

SVGMorpheus.prototype._updateAnimationProgress=function(progress) {
  progress=easings[this._easing](progress);

  var i, j, k, len;
  // Update path/attrs/transform
  for(i=0, len=this._curIconItems.length;i<len;i++) {
    this._curIconItems[i].curve=curveCalc(this._fromIconItems[i].curve, this._toIconItems[i].curve, progress);
    this._curIconItems[i].path=path2string(this._curIconItems[i].curve);

    this._curIconItems[i].attrsNorm=styleNormCalc(this._fromIconItems[i].attrsNorm, this._toIconItems[i].attrsNorm, progress);
    this._curIconItems[i].attrs=styleNormToString(this._curIconItems[i].attrsNorm);

    this._curIconItems[i].styleNorm=styleNormCalc(this._fromIconItems[i].styleNorm, this._toIconItems[i].styleNorm, progress);
    this._curIconItems[i].style=styleNormToString(this._curIconItems[i].styleNorm);

    this._curIconItems[i].trans=transCalc(this._fromIconItems[i].trans, this._toIconItems[i].trans, progress);
    this._curIconItems[i].transStr=trans2string(this._curIconItems[i].trans);
  }

  // Update DOM
  for(i=0, len=this._morphNodes.length;i<len;i++) {
    var morphNode=this._morphNodes[i];
    morphNode.node.setAttribute("d",this._curIconItems[i].path);
    var attrs=this._curIconItems[i].attrs;
    for(j in attrs) {
      morphNode.node.setAttribute(j,attrs[j]);
    }
    var style=this._curIconItems[i].style;
    for(k in style) {
      morphNode.node.style[k]=style[k];
    }
    morphNode.node.setAttribute("transform",this._curIconItems[i].transStr);
  }
};

SVGMorpheus.prototype._animationEnd=function() {
  for(var i=this._morphNodes.length-1;i>=0;i--) {
    var morphNode=this._morphNodes[i];
    if(!!this._icons[this._toIconId].items[i]) {
      morphNode.node.setAttribute("d",this._icons[this._toIconId].items[i].path);
    } else {
      morphNode.node.parentNode.removeChild(morphNode.node);
      this._morphNodes.splice(i,1);
    }
  }

  this._curIconId=this._toIconId;
  this._toIconId='';

  this._callback();
};

/*
 * Public methods
 */

// Morph To Icon
SVGMorpheus.prototype.to=function(iconId, options, callback) {
  if(iconId!==this._toIconId) {
    if (!!options && typeof options !== typeof {}) {
      throw new Error('SVGMorpheus.to() > "options" parameter must be an object');
    }
    options = options || {};

    if (!!callback && typeof callback !== typeof (function(){})) {
      throw new Error('SVGMorpheus.to() > "callback" parameter must be a function');
    }

    _cancelAnimFrame(this._rafid);

    this._duration=options.duration || this._defDuration;
    this._easing=options.easing || this._defEasing;
    this._rotation=options.rotation || this._defRotation;
    this._callback=callback || this._defCallback;

    this._setupAnimation(iconId);
    this._rafid=_reqAnimFrame(this._fnTick);
  }
};

return SVGMorpheus;
}());

/**
	Bootstrap Project Template
	Designed and built by Zach Wise at VéritéCo
*/  

/*	Required Files
	CodeKit Import
	http://incident57.com/codekit/
================================================== */


// BOOTSTRAP
	// @codekit-prepend "Library/bootstrap/transition.js";
	// @codekit-prepend "Library/bootstrap/scrollspy.js";
	// @codekit-prepend "Library/bootstrap/tab.js";
	// @codekit-prepend "Library/bootstrap/tooltip.js";
	// @codekit-prepend "Library/bootstrap/popover.js";
	// @codekit-prepend "Library/bootstrap/carousel.js";
	// @codekit-prepend "Library/bootstrap/collapse.js";
	// @codekit-prepend "Library/bootstrap/modal.js";
	// @codekit-prepend "Library/bootstrap/dropdown.js";
	// @codekit-prepend "Library/bootstrap/affix.js";

// JQUERY PLUGINS
	// @codekit-prepend "Library/jquery.smooth-scroll.js";
	// @codekit-prepend "Library/jquery.easing.1.3.js";
	// @codekit-prepend "Library/jquery.waypoints.js";
	// @codekit-prepend "Library/jquery.fluidbox.js"; 
	// @codekit-prepend "Library/jquery.laziestloader.js";
	
// OTHER LIBRARIES
	// @codekit-prepend "Library/svg-morpheus.js";




$(document).ready(function(){
	
	var _speed = 500,
		_story_nav_active = false,
		_has_story_cover = false,
		_story_cover_height = 100,
		_path = "",
		_is_index = false,
		profile_array = [],
		logo_timer = {};
		
		
	if (typeof path != "undefined") {
		_path = path;
	}
	if (typeof is_index != "undefined") {
		_is_index = is_index;
	}

	// TITLE
	var the_title = $("h1").html();
	$( "#navbar-title" ).html( the_title );
	
	/*	Smooth Scroll
	================================================== */
	$('a').smoothScroll({
		offset: -290
	});
	
	/*	LAZY LOAD AND ZOOMABLE IMAGES
	================================================== */
	// Find Images and make them zoomable
	function makeImagesZoomable() {
		
		/*	Laziest Loader
		================================================== */
		$("img").laziestloader();
	 
		$('img').load(function() {
			this.style.opacity = 1;
		});
		
		$( "figure" ).each(function(figure) {
			
			if ($(this).find( "a img" ).length ) {
				
			} else {
				var img_url,
					el_link = createEl("a", "enlarge"),
					el_img = $(this).find("img");
					
					
				img_url = $(this).find("img").attr("data-src");

				if (img_url == undefined) {
					img_url = $(this).find("img").attr("src");
				}
				
				$( el_img ).detach();
				
				$(el_link).attr("href", img_url);
				$(el_link).append(el_img);
				$(this).prepend(el_link);
				

			}
		});
		
		$('.enlarge').fluidbox({
		 	viewportFill:0.8,
			stackIndex: 1040
		})
		.on('openstart', fluidboxOpen)
		.on('closestart', fluidboxClose);

		
	}
	
	/*	Video Laziest Loader
	================================================== */
	$('.lazy-video').laziestloader();
	
	/*	Fluidbox Events
	================================================== */
	function fluidboxOpen() {
		trace("open");
		navbarToggle(false);
		profileNavToggle(false);
	};
	
	function fluidboxClose() {
		trace("close");
		navbarToggle(true);
		profileNavToggle(true);
	};
	
	/*	NavBar Toggle
	================================================== */
	function navbarToggle(show) {
		var animate_props = {
			
		}
		if (show) {
			animate_props.opacity = "1";
			animate_props.marginTop = "0";
		} else {
			animate_props.opacity = "1";
			animate_props.marginTop = "-150px";
		}
		
		$("#navbar").animate(animate_props, _speed/2, "easeInOutCubic", function() {
			
		});
	};
	
	/*	STORY COVER
	================================================== */
	if ($('#story-cover').length ) {
		_has_story_cover = true;
		
		_story_cover_height = window.innerHeight;
		
		$('#story-cover').height(_story_cover_height);
		
		$( window ).resize(function() {
			_story_cover_height = window.innerHeight;
			$('#story-cover').height(_story_cover_height);
		});

		
		$('article').waypoint({
			handler: function(direction) {
			
				if (direction === "up") {
					$('.story-cover-content').css("opacity", "1");
					navbarChange(false);
				}
				if (direction === "down") {
					$('.story-cover-content').css("opacity", "0");
					navbarChange(true);
				}
			 
			},
			offset:200
		});
		
		$('.story-cover-arrow').click(function() {
			$.smoothScroll({
				scrollElement: $('body'),
				scrollTarget: 'article'
			});
		});
		
	} else {
		
		$('#navbar-product').addClass('no-cover');
		
		$('article').waypoint({
			handler: function(direction) {
			
				if (direction == "down") {
					$('#navbar').addClass('in-article');
				} else if (direction == "up") {
					$('#navbar').removeClass('in-article');
				}
			 
			},
			offset:-2
		});
		
	}
	
	
	function navbarChange(in_article) {
		var animate_props = {
			
		}
		if (in_article) {
			animate_props.opacity = "0";
			animate_props.marginTop = "0";
		} else {
			animate_props.opacity = "1";
			animate_props.marginTop = "-56px";
		}
		
		/*
		$("#navbar").animate(animate_props, _speed/2, "easeInOutCubic", function() {
			
			if (in_article) {
				$('#product-navbar-collapse').css('opacity', '1');
				//$('.knightlab-logo img').attr('src', '../css/knightlab-logo-diamond-190.png');
				$('#navbar').addClass('in-article');
				$('#navbar').css('marginTop', '-56px');
				$("#navbar").animate({
					marginTop:"0px",
					opacity:"1"
				}, _speed, "easeInOutCubic");
			} else {
				if (_is_index) {
					$('#product-navbar-collapse').css('opacity', '0');
				} else {
					$('#product-navbar-collapse').css('opacity', '1');
				}
				//$('img.knightlab-logo').attr('src', '../css/kngihtlab-logo-NOtagline.png');
				//$('.knightlab-logo img').attr('src', '../css/knightlab-logo-diamond-190.png');
				$('#navbar').removeClass('in-article');
				$('#navbar').css('opacity', '0');
				$('#navbar').css('marginTop', '0');
				$("#navbar").animate({
					opacity:"1"
				}, _speed*2, "easeInOutCubic");
			}
			

  
		});
		*/
		$("#navbar-product").animate(animate_props, _speed/2, "easeInOutCubic", function() {
			
			if (in_article) {
				$('#product-navbar-collapse').css('opacity', '1');
				
				$('.navbar-brand img').css('width', '32px');
				$('.navbar-brand img').css('height', '32px');
				
				$('#navbar-product').addClass('in-article');
				$('#navbar-product').css('marginTop', '-56px');
				$("#navbar-product").animate({
					marginTop:"0px",
					opacity:"1"
				}, _speed, "easeInOutCubic");
			} else {
				if (_is_index) {
					$('#product-navbar-collapse').css('opacity', '0');
				} else {
					$('#product-navbar-collapse').css('opacity', '1');
				}
				//$('img.knightlab-logo').attr('src', '../css/kngihtlab-logo-NOtagline.png');
				//$('.knightlab-logo img').attr('src', '../css/knightlab-logo-diamond-190.png');
				
				$('.navbar-brand img').css('width', '');
				$('.navbar-brand img').css('height', '');
				
				$('#navbar-product').removeClass('in-article');
				$('#navbar-product').css('opacity', '0');
				$('#navbar-product').css('marginTop', '0');
				$("#navbar-product").animate({
					opacity:"1"
				}, _speed*2, "easeInOutCubic");
			}
			

  
		});
		
	}
	
	/*	STORY NAV BAR
	================================================== */
	function loadStoryBarStories(json_url, storybar_id) {
		//$( "#navbar-story" ).html( the_title );
		$.getJSON( json_url, function(d) {
			var number_of_stories = d.stories.length,
				column_width,
				story_container = $( storybar_id + " .row" ).first(),
				story_container_height,
				many_stories = false,
				stories = {
					small: [],
					large: [],
				}
				
			column_width = 12/number_of_stories;
			
			if (column_width < 2) {
				many_stories = true;
				column_width = 2;
			} else {
				column_width = Math.floor(column_width);
			}
			
			
			// Create elements
			if (many_stories) {
				var small_stories_element,
					storybar_small_height,
					storybar_large_height;
				
				
				for (var i = 0; i < d.stories.length; i++) {
					var story 		= d.stories[i];
				
					if (story.large == "true") {
						stories.large.push(story);
					} else {
						stories.small.push(story);
					}
				};
				
				if (stories.small.length > 4) {
					small_stories_element = createEl("div", "col-sm-4 small-column");
				} else {
					small_stories_element = createEl("div", "col-sm-4 small-column");
				}
				
				$(story_container).append(small_stories_element);
				
				column_width = 8 / (stories.large.length);
				
				if (column_width < 2) {
					column_width = 2;
				} else {
					column_width = Math.floor(column_width);
				}
				
				// LARGE
				var large_rows = 1;
				var large_column_count = 0;
				for (var j = 0; j < stories.large.length; j++) {
					var story 		= stories.large[j],
						story_el;
						
					if (large_column_count < 4) {
						large_column_count ++;
					} else {
						large_column_count = 0;
						large_rows ++;
					}
						
					story_el = createStoryNavElement(story, column_width, true);
					$(story_container).append(story_el);
					
				}

				// SMALL
				var small_rows = 1;
				var small_column_count = 0;
				
				for (var k = 0; k < stories.small.length; k++) {
					var story 		= stories.small[k],
						story_el;
					
					if (small_column_count < 2) {
						small_column_count ++;
					} else {
						small_column_count = 0;
						small_rows ++;
					}
					
					story_el = createStoryNavElement(story, 6, false);
					$(small_stories_element).append(story_el);
				}
				
				// SIZE
				story_container_height = $(story_container).height();
				
				if (story_container_height < 250) {
					story_container_height = 250;
				}
				
				storybar_small_height = story_container_height / small_rows;
				$( small_stories_element).find( ".story-item" ).height(storybar_small_height);
				$( small_stories_element).find( ".story-item-container" ).height(storybar_small_height);
				$( small_stories_element).find( ".story-item-background" ).height(storybar_small_height);
				
				story_container_height = $(story_container).height();
				
				if (story_container_height < 250) {
					story_container_height = 250;
				}
				
				storybar_large_height = story_container_height / large_rows;
				$( story_container).find( ".story-item.tall" ).height(storybar_large_height);
				$( story_container).find( ".story-item.tall .story-item-container" ).height(storybar_large_height);
				$( story_container).find( ".story-item.tall .story-item-background" ).height(storybar_large_height);
				
				
				
				
			} else {
				for (var i = 0; i < d.stories.length; i++) {
					var story 		= d.stories[i],
						story_el;
				
					story_el = createStoryNavElement(story, column_width, true);
					$(story_container).append(story_el);
				
				};
				storybar_large_height = 250;
				$( story_container).find( ".story-item.tall" ).height(storybar_large_height);
				$( story_container).find( ".story-item.tall .story-item-container" ).height(storybar_large_height);
				$( story_container).find( ".story-item.tall .story-item-background" ).height(storybar_large_height);
				
			}
			
			if (!_story_nav_active) {
				showNavbarStories(false, _speed*2);
			}
		});
	}
	
	function createStoryNavElement(story, column_width, tall) {
		var story_el	= "";
		
		story_el 		+=  "<div class='col-sm-" + column_width + " col-xs-" + column_width + "'>";
		story_el 		+=		"<div class='row'>";
		story_el 		+= 			"<div class='col-sm-12'>";
		if (tall) {
			story_el 	+= 				"<a class='story-item tall' href='" + _path + story.url + "'>";
		} else {
			story_el 	+= 				"<a class='story-item' href='" + _path + story.url + "'>";
		}
		story_el 		+= 					"<div class='story-item-background' style='background-image:url(" + _path + story.background.url + ")'></div>";
		story_el 		+= 					"<div class='story-item-container'>";
		story_el 		+= 						"<div class='story-item-content'>";
		story_el 		+= 							"<h3>" + story.headline + "</h3>";
		story_el 		+= 							"<p>" + story.deck + "</p>";
		story_el 		+= 							"<p class='byline'>" + story.byline + "</p>";
		
		story_el 		+= 						"</div>";
		story_el 		+= 					"</div>";
		story_el 		+= 				"</a>";
		story_el 		+= 			"</div>";
		story_el 		+= 		"</div>";
		story_el 		+= "</div>";
		
		return story_el;
		
	}
	
	function showNavbarStories(show, speed) {
		var nav_speed = _speed;
		if (speed) {
			nav_speed = speed;
		}
		if (show) {
			
			$("#navbar-story").animate({
			  marginTop:"0px"
			}, nav_speed, "easeInOutCubic");
			_story_nav_active = true;
		} else {
			$("#navbar-story").animate({
			  marginTop:-$("#navbar-story").height()-4//"-254px"
			}, nav_speed, "easeInOutCubic");
			_story_nav_active = false;
		}
	}
	
	/*	NAVIGATION NAVBAR STORIES
	================================================== */
	$('#stories-btn').click(function() {
		event.preventDefault();
		if (_story_nav_active) {
			showNavbarStories();
			$(this).removeClass("open");
		} else {
			showNavbarStories(true);
			$(this).addClass("open");
		}
		
	});
	
	/*	PROFILE NAVIGATION
	================================================== */
	$('.profile-nav').waypoint({
		handler: function(direction) {
		
			if (direction == "down") {
				$('.profile-nav').addClass('profile-nav-sticky');
			} else if (direction == "up") {
				$('.profile-nav').removeClass('profile-nav-sticky');
			}
		 
		},
		offset:120
	});
	
	function profileNavToggle(show) {
		var animate_props = {
			
		}
		if (show) {
			animate_props.opacity = "1";
			animate_props.marginTop = "0";
		} else {
			animate_props.opacity = "1";
			animate_props.marginTop = "-300px";
		}
		
		$(".profile-nav-sticky").animate(animate_props, _speed/2, "easeInOutCubic", function() {
			
		});
	}
	
	/*	Profile Nav Layout
 	================================================== */
	
	function profileNavLayout() {
		profile_array = $( ".profile-nav .profile-item" ).toArray();
		var profile_width = 100/profile_array.length;
		
		
		for (var i = 0; i < profile_array.length; i++) {
			var profile = profile_array[i];
			profile.style.width = profile_width + "%";
			
		};
		
		$( ".profile-nav .profile-item a.profile-button" ).each(function() {
			var waypoint_id = $(this).attr("href");
			var this_button = $(this);
			$(waypoint_id).waypoint({
				handler: function(direction) {
					trace(waypoint_id);
					resetActiveProfiles();
					$(this_button).addClass("profile-button-active");
				},
				offset:400
			});
				
		});
	}
	
	function resetActiveProfiles() {
		$( ".profile-nav .profile-item a.profile-button" ).removeClass("profile-button-active");
	}
	
	$('a.profile-button').smoothScroll({
		offset: -180
	});
	
	/*	LOGO SVG MORPH
 	================================================== */
	var logo_second = true;
	var minTime = 500;
	var maxTime = 1500;
	var logoF = {},
		logoL = {},
		logoU = {},
		logoX = {},
		logoTimerF = {},
		logoTimerL = {},
		logoTimerU = {},
		logoTimerX = {};
	
	function initLogo() {
		logoF = new SVGMorpheus('#fluxLogoF');
		logoL = new SVGMorpheus('#fluxLogoL');
		logoU = new SVGMorpheus('#fluxLogoU');
		logoX = new SVGMorpheus('#fluxLogoX');
		logoTimerF = setTimeout(morphLogoF, 1000);
		logoTimerL = setTimeout(morphLogoL, 1000);
		logoTimerU = setTimeout(morphLogoU, 1000);
		logoTimerX = setTimeout(morphLogoX, 1000);
	}
	
	function morphLogoF() {
		var logo_id = "1";
		var randomTimeout = randomBetween(minTime, maxTime);
		if (logo_second) {
			logo_second = false;
			logo_id = "2";
		} else {
			logo_second = true;
		}
		
		logoF.to("f"+logo_id, {duration: 1750, easing: "quad-in-out", rotation:"none"}, function(){
			clearTimeout(logoTimerF);
			logoTimerF = setTimeout(morphLogoF, randomTimeout);
		});
	}
	
	function morphLogoL() {
		var logo_id = "1";
		var randomTimeout = randomBetween(minTime, maxTime);
		if (logo_second) {
			logo_second = false;
			logo_id = "2";
		} else {
			logo_second = true;
		}
		
		logoL.to("l"+logo_id, {duration: 1750, easing: "quad-in-out", rotation:"none"}, function(){
			clearTimeout(logoTimerL);
			logoTimerL = setTimeout(morphLogoL, randomTimeout);
		});
	}
	
	function morphLogoU() {
		var logo_id = "1";
		var randomTimeout = randomBetween(minTime, maxTime);
		if (logo_second) {
			logo_second = false;
			logo_id = "2";
		} else {
			logo_second = true;
		}
		
		logoU.to("u"+logo_id, {duration: 1750, easing: "quad-in-out", rotation:"none"}, function(){
			clearTimeout(logoTimerU);
			logoTimerU = setTimeout(morphLogoU, randomTimeout);
		});
	}
	
	function morphLogoX() {
		var logo_id = "1";
		var randomTimeout = randomBetween(minTime, maxTime);
		if (logo_second) {
			logo_second = false;
			logo_id = "2";
		} else {
			logo_second = true;
		}
		
		logoX.to("x"+logo_id, {duration: 1750, easing: "quad-in-out", rotation:"none"}, function(){
			clearTimeout(logoTimerX);
			logoTimerX = setTimeout(morphLogoX, randomTimeout);
		});
	}
	
	
	/*	Init
 	================================================== */
	loadStoryBarStories(_path + "stories.json", "#navbar-story");
	loadStoryBarStories(_path + "stories.json", "#footer-storybar");
	makeImagesZoomable();
	profileNavLayout();

	if (typeof show_logo != "undefined" && show_logo) {
		initLogo();
	}
	
	
});

/* Trace (console.log)
================================================== */
trace = function( msg ) {
	if (window.console) {
		console.log(msg);
	} else if ( typeof( jsTrace ) != 'undefined' ) {
		jsTrace.send( msg );
	} else {
		//alert(msg);
	}
};

/* Create Element
================================================== */
createEl = function(tagName, className) {
	var el = document.createElement(tagName);
	el.className = className;
	return el;
} ;

/* Random Number between 
================================================== */
randomBetween = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
};

/* Google Analytics
================================================== */
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','http://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-537357-22', 'auto');
ga('send', 'pageview');

