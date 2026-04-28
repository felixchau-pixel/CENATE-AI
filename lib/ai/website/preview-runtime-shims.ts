/**
 * Inline runtime shims used by the Cenate generated-website preview.
 *
 * The in-app preview iframe and the standalone CLI renderer both need to
 * resolve `clsx`, `class-variance-authority`, and the Radix UI packages that
 * the scaffold-injected primitives import. There is no real bundler in either
 * environment, so these shims are injected directly into the iframe's
 * <script> block and registered as module builtins before any generated code
 * is evaluated.
 *
 * Contract: when the returned JS executes, the following identifiers exist as
 * module objects that can be placed into a builtins map:
 *   __ClsxModule, __CvaModule, __RadixSlotModule, __RadixAccordionModule,
 *   __RadixTabsModule, __RadixDialogModule, __RadixVisuallyHiddenModule,
 *   __RadixNavMenuModule
 * It also expects `window.React` and `window.ReactDOM` to be loaded.
 *
 * Consumers:
 *   - components/chat/project-runtime-preview.tsx (in-app preview iframe)
 *   - scripts/render-generated-preview.ts (CLI/CI preview HTML renderer)
 */

export const PREVIEW_RUNTIME_SHIMS_JS = `
        // ── clsx: class name utility (inline implementation) ──
        var __ClsxModule = (function () {
          function clsx() {
            var classes = [];
            for (var i = 0; i < arguments.length; i++) {
              var arg = arguments[i];
              if (!arg) continue;
              if (typeof arg === 'string' || typeof arg === 'number') {
                classes.push(arg);
              } else if (Array.isArray(arg)) {
                var inner = clsx.apply(null, arg);
                if (inner) classes.push(inner);
              } else if (typeof arg === 'object') {
                for (var key in arg) {
                  if (Object.prototype.hasOwnProperty.call(arg, key) && arg[key]) {
                    classes.push(key);
                  }
                }
              }
            }
            return classes.join(' ');
          }
          return { __esModule: true, default: clsx, clsx: clsx };
        })();

        // ── class-variance-authority: variant-based class generation ──
        var __CvaModule = (function () {
          function cva(base, config) {
            var fn = function (props) {
              props = props || {};
              if (!config) return base || '';
              var variants = config.variants || {};
              var defaultVariants = config.defaultVariants || {};
              var compoundVariants = config.compoundVariants || [];
              var resolved = Object.assign({}, defaultVariants);
              for (var k in props) {
                if (k !== 'className' && k !== 'class' && props[k] != null) {
                  resolved[k] = props[k];
                }
              }
              var classes = [base];
              for (var vKey in variants) {
                var value = resolved[vKey];
                if (value != null && variants[vKey] && variants[vKey][value] != null) {
                  classes.push(variants[vKey][value]);
                }
              }
              for (var ci = 0; ci < compoundVariants.length; ci++) {
                var cv = compoundVariants[ci];
                var match = true;
                for (var ck in cv) {
                  if (ck === 'class' || ck === 'className') continue;
                  if (resolved[ck] !== cv[ck]) { match = false; break; }
                }
                if (match) classes.push(cv['class'] || cv.className);
              }
              return classes.filter(Boolean).join(' ');
            };
            return fn;
          }
          return { __esModule: true, default: cva, cva: cva };
        })();

        // ── @radix-ui/react-slot: polymorphic Slot component ──
        var __RadixSlotModule = (function () {
          var R = window.React;
          function composeHandlers(a, b) {
            return function () { b.apply(this, arguments); a.apply(this, arguments); };
          }
          function mergeProps(slotProps, childProps) {
            var result = {};
            var key;
            for (key in slotProps) { result[key] = slotProps[key]; }
            for (key in childProps) {
              var sv = slotProps[key];
              var cv = childProps[key];
              if (/^on[A-Z]/.test(key) && typeof sv === 'function' && typeof cv === 'function') {
                result[key] = composeHandlers(sv, cv);
              } else if (key === 'style') {
                result[key] = Object.assign({}, sv || {}, cv || {});
              } else if (key === 'className') {
                result[key] = [sv, cv].filter(Boolean).join(' ');
              } else {
                result[key] = cv !== undefined ? cv : sv;
              }
            }
            return result;
          }
          var Slot = R.forwardRef(function (props, ref) {
            var children = props.children;
            var slotProps = {};
            for (var key in props) { if (key !== 'children') slotProps[key] = props[key]; }
            if (R.isValidElement(children)) {
              var merged = mergeProps(slotProps, children.props);
              merged.ref = ref;
              return R.cloneElement(children, merged);
            }
            if (R.Children.count(children) > 1) {
              throw new Error('Slot: expected a single child element');
            }
            return null;
          });
          Slot.displayName = 'Slot';
          return { __esModule: true, default: Slot, Slot: Slot };
        })();

        // ── @radix-ui/react-accordion: collapsible content sections ──
        var __RadixAccordionModule = (function () {
          var R = window.React;
          var AccCtx = R.createContext({ value: '', onToggle: function(){}, type: 'single', isOpen: function(){ return false; } });
          var ItemCtx = R.createContext({ value: '', disabled: false, open: false });

          function Root(props) {
            var type = props.type || 'single';
            var children = props.children;
            var className = props.className;
            var stateHook = R.useState(function() {
              if (type === 'multiple') return props.defaultValue || [];
              return props.defaultValue || '';
            });
            var val = props.value !== undefined ? props.value : stateHook[0];
            var setVal = stateHook[1];
            function onToggle(itemValue) {
              if (type === 'multiple') {
                var arr = Array.isArray(val) ? val : [];
                var next = arr.indexOf(itemValue) > -1
                  ? arr.filter(function(v) { return v !== itemValue; })
                  : arr.concat([itemValue]);
                setVal(next);
                if (props.onValueChange) props.onValueChange(next);
              } else {
                var next2 = val === itemValue ? '' : itemValue;
                setVal(next2);
                if (props.onValueChange) props.onValueChange(next2);
              }
            }
            var isOpen = function(v) {
              if (type === 'multiple') return Array.isArray(val) && val.indexOf(v) > -1;
              return val === v;
            };
            return R.createElement(AccCtx.Provider, {
              value: { value: val, onToggle: onToggle, type: type, isOpen: isOpen }
            }, R.createElement('div', { className: className, 'data-orientation': 'vertical' }, children));
          }

          var Item = R.forwardRef(function(props, ref) {
            var ctx = R.useContext(AccCtx);
            var open = ctx.isOpen(props.value);
            return R.createElement(ItemCtx.Provider, {
              value: { value: props.value, disabled: props.disabled || false, open: open }
            }, R.createElement('div', {
              ref: ref, className: props.className,
              'data-state': open ? 'open' : 'closed',
              'data-disabled': props.disabled ? '' : undefined
            }, props.children));
          });
          Item.displayName = 'AccordionItem';

          var Header = R.forwardRef(function(props, ref) {
            return R.createElement('h3', { ref: ref, className: props.className }, props.children);
          });
          Header.displayName = 'AccordionHeader';

          var Trigger = R.forwardRef(function(props, ref) {
            var ctx = R.useContext(AccCtx);
            var itemCtx = R.useContext(ItemCtx);
            return R.createElement('button', {
              ref: ref, type: 'button',
              'aria-expanded': itemCtx.open,
              'data-state': itemCtx.open ? 'open' : 'closed',
              'data-disabled': itemCtx.disabled ? '' : undefined,
              disabled: itemCtx.disabled,
              className: props.className,
              onClick: function() { if (!itemCtx.disabled) ctx.onToggle(itemCtx.value); }
            }, props.children);
          });
          Trigger.displayName = 'AccordionTrigger';

          var Content = R.forwardRef(function(props, ref) {
            var itemCtx = R.useContext(ItemCtx);
            if (!itemCtx.open) return null;
            return R.createElement('div', {
              ref: ref, 'data-state': 'open', className: props.className, role: 'region'
            }, props.children);
          });
          Content.displayName = 'AccordionContent';

          return { __esModule: true, Root: Root, Item: Item, Header: Header, Trigger: Trigger, Content: Content, default: Root };
        })();

        // ── @radix-ui/react-tabs: tabbed content switcher ──
        var __RadixTabsModule = (function () {
          var R = window.React;
          var TabsCtx = R.createContext({ value: '', onValueChange: function(){} });

          function Root(props) {
            var stateHook = R.useState(props.defaultValue || '');
            var val = props.value !== undefined ? props.value : stateHook[0];
            var setVal = stateHook[1];
            function onChange(v) { setVal(v); if (props.onValueChange) props.onValueChange(v); }
            return R.createElement(TabsCtx.Provider, {
              value: { value: val, onValueChange: onChange }
            }, R.createElement('div', { className: props.className }, props.children));
          }

          var List = R.forwardRef(function(props, ref) {
            return R.createElement('div', { ref: ref, role: 'tablist', className: props.className }, props.children);
          });
          List.displayName = 'TabsList';

          var Trigger = R.forwardRef(function(props, ref) {
            var ctx = R.useContext(TabsCtx);
            var isActive = ctx.value === props.value;
            return R.createElement('button', {
              ref: ref, type: 'button', role: 'tab',
              'aria-selected': isActive,
              'data-state': isActive ? 'active' : 'inactive',
              className: props.className,
              onClick: function() { ctx.onValueChange(props.value); }
            }, props.children);
          });
          Trigger.displayName = 'TabsTrigger';

          var Content = R.forwardRef(function(props, ref) {
            var ctx = R.useContext(TabsCtx);
            if (ctx.value !== props.value) return null;
            return R.createElement('div', {
              ref: ref, role: 'tabpanel', 'data-state': 'active', className: props.className
            }, props.children);
          });
          Content.displayName = 'TabsContent';

          return { __esModule: true, Root: Root, List: List, Trigger: Trigger, Content: Content, default: Root };
        })();

        // ── @radix-ui/react-dialog: modal/sheet dialog ──
        var __RadixDialogModule = (function () {
          var R = window.React;
          var RD = window.ReactDOM;
          var DialogCtx = R.createContext({ open: false, onOpenChange: function(){} });

          function Root(props) {
            var stateHook = R.useState(props.defaultOpen || false);
            var open = props.open !== undefined ? props.open : stateHook[0];
            var setOpen = stateHook[1];
            function onOpenChange(v) {
              setOpen(v);
              if (props.onOpenChange) props.onOpenChange(v);
            }
            return R.createElement(DialogCtx.Provider, {
              value: { open: open, onOpenChange: onOpenChange }
            }, props.children);
          }

          var Trigger = R.forwardRef(function(props, ref) {
            var ctx = R.useContext(DialogCtx);
            var child = props.children;
            var asChild = props.asChild;
            if (asChild && R.isValidElement(child)) {
              return R.cloneElement(child, {
                ref: ref,
                onClick: function(e) {
                  ctx.onOpenChange(!ctx.open);
                  if (child.props && child.props.onClick) child.props.onClick(e);
                }
              });
            }
            return R.createElement('button', {
              ref: ref, type: 'button', className: props.className,
              onClick: function() { ctx.onOpenChange(!ctx.open); }
            }, child);
          });
          Trigger.displayName = 'DialogTrigger';

          var Close = R.forwardRef(function(props, ref) {
            var ctx = R.useContext(DialogCtx);
            var child = props.children;
            var asChild = props.asChild;
            if (asChild && R.isValidElement(child)) {
              return R.cloneElement(child, {
                ref: ref,
                onClick: function(e) {
                  ctx.onOpenChange(false);
                  if (child.props && child.props.onClick) child.props.onClick(e);
                }
              });
            }
            return R.createElement('button', {
              ref: ref, type: 'button', 'aria-label': 'Close', className: props.className,
              onClick: function() { ctx.onOpenChange(false); }
            }, child || 'X');
          });
          Close.displayName = 'DialogClose';

          function Portal(props) {
            var ctx = R.useContext(DialogCtx);
            if (!ctx.open) return null;
            var container = props.container || document.body;
            return RD.createPortal(
              R.createElement(DialogCtx.Provider, { value: ctx }, props.children),
              container
            );
          }

          var Overlay = R.forwardRef(function(props, ref) {
            var ctx = R.useContext(DialogCtx);
            return R.createElement('div', {
              ref: ref,
              'data-state': ctx.open ? 'open' : 'closed',
              className: props.className,
              style: Object.assign({ position: 'fixed', inset: 0, zIndex: 50 }, props.style || {}),
              onClick: function(e) {
                if (e.target === e.currentTarget) ctx.onOpenChange(false);
              }
            });
          });
          Overlay.displayName = 'DialogOverlay';

          var Content = R.forwardRef(function(props, ref) {
            var ctx = R.useContext(DialogCtx);
            if (!ctx.open) return null;
            return R.createElement('div', {
              ref: ref, role: 'dialog', 'aria-modal': true,
              'data-state': ctx.open ? 'open' : 'closed',
              className: props.className,
              style: props.style
            }, props.children);
          });
          Content.displayName = 'DialogContent';

          var Title = R.forwardRef(function(props, ref) {
            return R.createElement('h2', { ref: ref, className: props.className }, props.children);
          });
          Title.displayName = 'DialogTitle';

          var Description = R.forwardRef(function(props, ref) {
            return R.createElement('p', { ref: ref, className: props.className }, props.children);
          });
          Description.displayName = 'DialogDescription';

          return {
            __esModule: true, Root: Root, Trigger: Trigger, Close: Close,
            Portal: Portal, Overlay: Overlay, Content: Content,
            Title: Title, Description: Description, default: Root
          };
        })();

        // ── @radix-ui/react-visually-hidden ──
        var __RadixVisuallyHiddenModule = (function () {
          var R = window.React;
          var VisuallyHidden = R.forwardRef(function(props, ref) {
            return R.createElement('span', {
              ref: ref,
              style: {
                position: 'absolute', border: 0, width: 1, height: 1,
                padding: 0, margin: -1, overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', wordWrap: 'normal'
              }
            }, props.children);
          });
          VisuallyHidden.displayName = 'VisuallyHidden';
          return { __esModule: true, Root: VisuallyHidden, default: VisuallyHidden };
        })();

        // ── @radix-ui/react-navigation-menu (stub) ──
        var __RadixNavMenuModule = (function () {
          var R = window.React;
          function Root(props) { return R.createElement('nav', { className: props.className }, props.children); }
          var List = R.forwardRef(function(p, r) { return R.createElement('ul', { ref: r, className: p.className }, p.children); });
          var Item = R.forwardRef(function(p, r) { return R.createElement('li', { ref: r, className: p.className }, p.children); });
          var Link = R.forwardRef(function(p, r) {
            var child = p.children;
            if (p.asChild && R.isValidElement(child)) return R.cloneElement(child, { ref: r });
            return R.createElement('a', { ref: r, className: p.className, href: p.href }, child);
          });
          return { __esModule: true, Root: Root, List: List, Item: Item, Link: Link, default: Root };
        })();

        // ── lucide-react: icon library (Proxy that returns SVG placeholders) ──
        // Generated code uses named imports like { Menu, X, ChevronDown, ArrowRight }
        // Each icon becomes a simple inline SVG so React.createElement never receives undefined
        var __LucideModule = (function () {
          var R = window.React;
          var cache = {};
          function makeIcon(name) {
            if (cache[name]) return cache[name];
            var Icon = R.forwardRef(function(props, ref) {
              var size = props.size || 24;
              var className = props.className || '';
              return R.createElement('svg', {
                ref: ref, xmlns: 'http://www.w3.org/2000/svg', width: size, height: size,
                viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
                strokeWidth: props.strokeWidth || 2, strokeLinecap: 'round', strokeLinejoin: 'round',
                className: 'lucide ' + className, 'aria-hidden': 'true'
              }, R.createElement('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }));
            });
            Icon.displayName = name;
            cache[name] = Icon;
            return Icon;
          }
          // Return a Proxy so any named import resolves to a valid icon component
          var mod = { __esModule: true, default: makeIcon };
          return typeof Proxy !== 'undefined'
            ? new Proxy(mod, { get: function(t, p) { if (p in t) return t[p]; return makeIcon(String(p)); } })
            : mod;
        })();

        // ── sonner: toast library ──
        var __SonnerModule = (function () {
          var R = window.React;
          function Toaster() { return null; } // No-op in preview
          var toast = function() {}; toast.success = toast; toast.error = toast; toast.info = toast; toast.warning = toast; toast.promise = function(p) { return p; };
          return { __esModule: true, default: toast, toast: toast, Toaster: Toaster };
        })();

        // ── react-router-dom: routing (preview renders in single page) ──
        var __ReactRouterModule = (function () {
          var R = window.React;
          function BrowserRouter(p) { return R.createElement(R.Fragment, null, p.children); }
          function Routes(p) { return R.createElement(R.Fragment, null, p.children); }
          function Route(p) { return p.element || null; }
          var Link = R.forwardRef(function(p, r) {
            return R.createElement('a', { ref: r, href: p.to || '#', className: p.className, onClick: function(e) { e.preventDefault(); } }, p.children);
          });
          Link.displayName = 'Link';
          var NavLink = Link;
          function useNavigate() { return function() {}; }
          function useLocation() { return { pathname: '/', search: '', hash: '' }; }
          function useParams() { return {}; }
          return { __esModule: true, BrowserRouter: BrowserRouter, Routes: Routes, Route: Route, Link: Link, NavLink: NavLink, useNavigate: useNavigate, useLocation: useLocation, useParams: useParams, default: {} };
        })();

        // ── vaul: drawer component ──
        var __VaulModule = (function () {
          var R = window.React;
          function DrawerRoot(p) {
            var st = R.useState(p.open || false);
            return R.createElement(R.Fragment, null, p.children);
          }
          var Trigger = R.forwardRef(function(p, r) { return R.createElement('button', { ref: r, type: 'button', className: p.className }, p.children); });
          var Content = R.forwardRef(function(p, r) { return R.createElement('div', { ref: r, className: p.className }, p.children); });
          var Overlay = R.forwardRef(function(p, r) { return null; });
          var Close = R.forwardRef(function(p, r) { return R.createElement('button', { ref: r, type: 'button', className: p.className }, p.children); });
          var Title = R.forwardRef(function(p, r) { return R.createElement('h2', { ref: r, className: p.className }, p.children); });
          var Description = R.forwardRef(function(p, r) { return R.createElement('p', { ref: r, className: p.className }, p.children); });
          var Portal = function(p) { return p.children || null; };
          var Drawer = Object.assign(DrawerRoot, { Trigger: Trigger, Content: Content, Overlay: Overlay, Close: Close, Title: Title, Description: Description, Portal: Portal });
          return { __esModule: true, Drawer: Drawer, default: Drawer, Root: DrawerRoot, Trigger: Trigger, Content: Content, Overlay: Overlay, Close: Close, Title: Title, Description: Description, Portal: Portal };
        })();

        // ── tailwind-merge ──
        var __TailwindMergeModule = (function () {
          function twMerge() {
            var classes = [];
            for (var i = 0; i < arguments.length; i++) {
              if (arguments[i]) classes.push(arguments[i]);
            }
            return classes.join(' ');
          }
          return { __esModule: true, default: twMerge, twMerge: twMerge };
        })();

        // ── date-fns (basic stubs) ──
        var __DateFnsModule = (function () {
          function format(d, f) { try { return new Date(d).toLocaleDateString(); } catch(e) { return String(d); } }
          function formatDistance(a, b) { return ''; }
          function parseISO(s) { return new Date(s); }
          return { __esModule: true, format: format, formatDistance: formatDistance, parseISO: parseISO, default: { format: format } };
        })();

        // ── recharts (stub: renders children as-is) ──
        var __RechartsModule = (function () {
          var R = window.React;
          function ChartContainer(p) { return R.createElement('div', { className: p.className, style: { width: '100%', height: p.height || 300 } }, p.children); }
          function noop(p) { return p.children || null; }
          function nullFn() { return null; }
          return {
            __esModule: true,
            ResponsiveContainer: ChartContainer, LineChart: noop, BarChart: noop, AreaChart: noop, PieChart: noop,
            Line: nullFn, Bar: nullFn, Area: nullFn, Pie: nullFn, Cell: nullFn,
            XAxis: nullFn, YAxis: nullFn, CartesianGrid: nullFn, Tooltip: nullFn, Legend: nullFn,
            default: {}
          };
        })();

        // ── @radix-ui generic passthrough: covers all @radix-ui/* not explicitly shimmed ──
        var __RadixGenericModule = (function () {
          var R = window.React;
          function Passthrough(p) { return R.createElement('div', { className: p.className }, p.children); }
          var Fwd = R.forwardRef(function(p, r) { return R.createElement('div', { ref: r, className: p.className }, p.children); });
          return {
            __esModule: true, default: Passthrough, Root: Passthrough,
            Trigger: Fwd, Content: Fwd, Item: Fwd, Close: Fwd,
            Portal: function(p) { return p.children || null; },
            Overlay: function() { return null; },
            Title: R.forwardRef(function(p, r) { return R.createElement('h3', { ref: r, className: p.className }, p.children); }),
            Description: R.forwardRef(function(p, r) { return R.createElement('p', { ref: r, className: p.className }, p.children); }),
            Group: Fwd, Value: Fwd, Icon: Fwd, Indicator: Fwd, Header: Fwd, Footer: Fwd,
            Separator: R.forwardRef(function(p, r) { return R.createElement('hr', { ref: r, className: p.className }); }),
            Label: R.forwardRef(function(p, r) { return R.createElement('label', { ref: r, className: p.className }, p.children); }),
            Thumb: Fwd, Track: Fwd, Range: Fwd, Viewport: Fwd, Scrollbar: function(){ return null; },
          };
        })();
`;

/**
 * Module specifier → shim identifier map, emitted as a JS object literal fragment.
 * Spread into a `builtins` object alongside react / react-dom / react-dom/client.
 */
export const PREVIEW_BUILTINS_ENTRIES_JS = `
          'clsx': __ClsxModule,
          'class-variance-authority': __CvaModule,
          'tailwind-merge': __TailwindMergeModule,
          '@radix-ui/react-slot': __RadixSlotModule,
          '@radix-ui/react-accordion': __RadixAccordionModule,
          '@radix-ui/react-tabs': __RadixTabsModule,
          '@radix-ui/react-dialog': __RadixDialogModule,
          '@radix-ui/react-visually-hidden': __RadixVisuallyHiddenModule,
          '@radix-ui/react-navigation-menu': __RadixNavMenuModule,
          '@radix-ui/react-alert-dialog': __RadixDialogModule,
          '@radix-ui/react-aspect-ratio': __RadixGenericModule,
          '@radix-ui/react-avatar': __RadixGenericModule,
          '@radix-ui/react-checkbox': __RadixGenericModule,
          '@radix-ui/react-collapsible': __RadixGenericModule,
          '@radix-ui/react-context-menu': __RadixGenericModule,
          '@radix-ui/react-dropdown-menu': __RadixGenericModule,
          '@radix-ui/react-hover-card': __RadixGenericModule,
          '@radix-ui/react-label': __RadixGenericModule,
          '@radix-ui/react-menubar': __RadixGenericModule,
          '@radix-ui/react-popover': __RadixGenericModule,
          '@radix-ui/react-progress': __RadixGenericModule,
          '@radix-ui/react-radio-group': __RadixGenericModule,
          '@radix-ui/react-scroll-area': __RadixGenericModule,
          '@radix-ui/react-select': __RadixGenericModule,
          '@radix-ui/react-separator': __RadixGenericModule,
          '@radix-ui/react-slider': __RadixGenericModule,
          '@radix-ui/react-switch': __RadixGenericModule,
          '@radix-ui/react-toast': __RadixGenericModule,
          '@radix-ui/react-toggle': __RadixGenericModule,
          '@radix-ui/react-toggle-group': __RadixGenericModule,
          '@radix-ui/react-tooltip': __RadixGenericModule,
          'lucide-react': __LucideModule,
          'sonner': __SonnerModule,
          'react-router-dom': __ReactRouterModule,
          'vaul': __VaulModule,
          'date-fns': __DateFnsModule,
          'recharts': __RechartsModule,
`;
