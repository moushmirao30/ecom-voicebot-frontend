'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useRoomContext } from '@livekit/components-react';
import {
  ChatCircleIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PlusIcon,
  ReceiptIcon,
  ShoppingBagIcon,
  SparkleIcon,
  TrashIcon,
  XIcon,
} from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/shadcn/utils';

const PRODUCTS_TOPIC = 'shopmax.products';
const ORDER_TOPIC = 'shopmax.order';
const CART_TOPIC = 'shopmax.cart'; // frontend -> agent: current cart state
const CHAT_TOPIC = 'lk.chat'; // agent listens here for text input

interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price_inr: number;
  price_spoken: string;
  stock: number;
  in_stock: boolean;
  colors: string[];
  sizes: string[];
  image_url?: string | null;
}

interface OrderItem {
  product_id: string;
  name: string;
  qty: number;
  color: string;
  size: string;
}

interface Order {
  order_id: string;
  customer_name: string;
  status: string;
  items: OrderItem[];
  total: number;
  placed_on: string;
  shipping_city: string;
  delivered_on?: string;
  estimated_delivery?: string;
  tracking_number?: string;
  cancelled_on?: string;
  cancel_reason?: string;
  return_reason?: string;
}

type Cart = Record<string, { product: Product; qty: number }>;

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function fmtDate(s?: string): string {
  if (!s) return '';
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : dateFmt.format(d);
}

const COLOR_MAP: Record<string, string> = {
  'navy blue': '#1e3a8a',
  'dark blue': '#1e40af',
  'light wash': '#93c5fd',
  'royal blue': '#2563eb',
  'midnight blue': '#0f172a',
  'matte black': '#1c1c1c',
  'olive green': '#556b2f',
  'emerald green': '#10b981',
  'sage green': '#9caf88',
  'coral pink': '#ff7f7f',
  'rose gold': '#b76e79',
  'titanium grey': '#7d7d7d',
  'warm vanilla': '#f3e5ab',
  'ocean breeze': '#7fd4d4',
  terracotta: '#e2725b',
  mustard: '#e1ad01',
  ivory: '#fffff0',
  beige: '#f5f5dc',
  tan: '#d2b48c',
  burgundy: '#800020',
  indigo: '#4b0082',
  rust: '#b7410e',
  lavender: '#b57edc',
};

function swatch(color: string): string {
  const c = color.toLowerCase().trim();
  if (COLOR_MAP[c]) return COLOR_MAP[c];
  return c.split('/')[0].split(' ')[0]; // e.g. "grey/orange" -> "grey"
}

const CATEGORY_GRADIENT: Record<string, string> = {
  fashion: 'from-bot to-cart',
  electronics: 'from-bot to-live',
  home: 'from-live to-voice',
};

const GENERIC_SIZES = new Set(['one size', 'free size']);

function ProductCard({
  product,
  qty,
  onAdd,
  onDec,
  onAsk,
}: {
  product: Product;
  qty: number;
  onAdd: () => void;
  onDec: () => void;
  onAsk: () => void;
}) {
  const [imgOk, setImgOk] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const gradient = CATEGORY_GRADIENT[product.category] ?? 'from-bot to-live';
  const sizes = product.sizes.filter((s) => !GENERIC_SIZES.has(s.toLowerCase()));

  return (
    <div className="group border-border/60 bg-card/60 flex h-full flex-col overflow-hidden rounded-xl border backdrop-blur-sm">
      {/* Image — click to ask Max about it */}
      <button
        type="button"
        onClick={onAsk}
        aria-label={`Ask about ${product.name}`}
        className="group/img bg-secondary relative aspect-square overflow-hidden"
      >
        {product.image_url && imgOk ? (
          <>
            {!imgLoaded && <span className="bg-secondary absolute inset-0 animate-pulse" />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgOk(false)}
              className={cn(
                'size-full object-cover transition-all duration-500 group-hover:scale-105',
                imgLoaded ? 'opacity-100' : 'opacity-0'
              )}
            />
          </>
        ) : (
          <div className={cn('grid size-full place-content-center bg-gradient-to-br', gradient)}>
            <span className="font-serif text-4xl text-white/90 italic">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
        <span
          className={cn(
            'absolute top-2 left-2 rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold tracking-wide uppercase backdrop-blur-md',
            product.in_stock
              ? 'bg-live/20 text-live ring-live/30 ring-1'
              : 'bg-background/70 text-muted-foreground ring-1 ring-white/10'
          )}
        >
          {product.in_stock ? `${product.stock} in stock` : 'Sold out'}
        </span>
        {/* Ask overlay */}
        <span className="bg-background/40 absolute inset-0 grid place-content-center opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover/img:opacity-100">
          <span className="bg-bot flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg">
            <ChatCircleIcon weight="fill" className="size-3.5" />
            Ask Max
          </span>
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <span className="text-muted-foreground/70 font-mono text-[9px] tracking-[0.14em] uppercase">
          {product.id} · {product.subcategory}
        </span>
        <h3 className="line-clamp-2 text-sm leading-tight font-semibold">{product.name}</h3>

        <div className="flex flex-wrap items-center gap-1">
          {product.colors.slice(0, 4).map((c) => (
            <span
              key={c}
              title={c}
              className="size-3 rounded-full ring-1 ring-white/25"
              style={{ background: swatch(c) }}
            />
          ))}
          {sizes.length > 0 && (
            <span className="text-muted-foreground/70 ml-1 font-mono text-[9px] tracking-wide">
              {sizes.slice(0, 4).join(' · ')}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-base font-bold tracking-tight">
            {inr.format(product.price_inr)}
          </span>
          {qty > 0 ? (
            <div className="border-cart/40 bg-cart/10 flex items-center gap-2 rounded-full border px-1.5 py-1">
              <button
                type="button"
                aria-label="Remove one"
                onClick={onDec}
                className="text-cart hover:bg-cart/20 grid size-5 place-content-center rounded-full transition-colors"
              >
                <MinusIcon weight="bold" className="size-3" />
              </button>
              <span className="min-w-4 text-center font-mono text-xs font-semibold">{qty}</span>
              <button
                type="button"
                aria-label="Add one"
                onClick={onAdd}
                className="text-cart hover:bg-cart/20 grid size-5 place-content-center rounded-full transition-colors"
              >
                <PlusIcon weight="bold" className="size-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              disabled={!product.in_stock}
              className="bg-cart shadow-cart/30 hover:shadow-cart/50 grid size-8 place-content-center rounded-full text-white shadow-sm transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              <PlusIcon weight="bold" className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const STATUS_META: Record<string, { label: string; className: string; step: number }> = {
  processing: { label: 'Processing', className: 'bg-voice/20 text-voice ring-voice/30', step: 1 },
  shipped: { label: 'Shipped', className: 'bg-bot/20 text-bot ring-bot/30', step: 2 },
  delivered: { label: 'Delivered', className: 'bg-live/20 text-live ring-live/30', step: 3 },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-secondary text-muted-foreground ring-white/10',
    step: -1,
  },
  return_requested: {
    label: 'Return requested',
    className: 'bg-cart/20 text-cart ring-cart/30',
    step: 3,
  },
};

const ORDER_STEPS = ['Placed', 'Processing', 'Shipped', 'Delivered'];

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground/70 font-mono text-[10px] tracking-wide uppercase">
        {label}
      </span>
      <span className={cn('truncate text-right font-medium', mono && 'font-mono text-[11px]')}>
        {value}
      </span>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const meta = STATUS_META[order.status] ?? STATUS_META.processing;
  const cancelled = order.status === 'cancelled';

  return (
    <div className="border-border/60 bg-card/60 rounded-xl border p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-muted-foreground/70 font-mono text-[10px] tracking-[0.14em] uppercase">
            Order
          </span>
          <span className="font-mono text-sm font-bold tracking-tight">{order.order_id}</span>
        </div>
        <span
          className={cn(
            'rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wide uppercase ring-1',
            meta.className
          )}
        >
          {meta.label}
        </span>
      </div>

      {cancelled ? (
        <div className="bg-secondary/60 mt-4 rounded-lg p-3 text-center">
          <span className="text-muted-foreground text-xs">
            Cancelled on {fmtDate(order.cancelled_on)}
          </span>
          {order.cancel_reason && (
            <p className="text-muted-foreground/70 mt-1 text-[11px]">{order.cancel_reason}</p>
          )}
        </div>
      ) : (
        <div className="mt-5 flex items-center">
          {ORDER_STEPS.map((label, i) => (
            <Fragment key={label}>
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    'grid size-5 place-content-center rounded-full font-mono text-[9px] font-bold',
                    i <= meta.step ? 'bg-bot text-white' : 'bg-secondary text-muted-foreground'
                  )}
                >
                  {i < meta.step ? <CheckIcon weight="bold" className="size-2.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    'font-mono text-[8px] tracking-wide uppercase',
                    i <= meta.step ? 'text-foreground' : 'text-muted-foreground/60'
                  )}
                >
                  {label}
                </span>
              </div>
              {i < ORDER_STEPS.length - 1 && (
                <span
                  className={cn(
                    'mx-1 mb-4 h-0.5 flex-1 rounded',
                    i < meta.step ? 'bg-bot' : 'bg-secondary'
                  )}
                />
              )}
            </Fragment>
          ))}
        </div>
      )}

      <div className="mt-5 space-y-2">
        {order.items.map((it, idx) => (
          <div key={idx} className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="bg-secondary grid size-6 shrink-0 place-content-center rounded-md font-mono text-[10px] font-semibold">
                {it.qty}×
              </span>
              <span className="truncate text-xs">{it.name}</span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {it.color && (
                <span
                  title={it.color}
                  className="size-2.5 rounded-full ring-1 ring-white/25"
                  style={{ background: swatch(it.color) }}
                />
              )}
              {it.size && !GENERIC_SIZES.has(it.size.toLowerCase()) && (
                <span className="text-muted-foreground/70 font-mono text-[9px]">{it.size}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-border/60 mt-4 space-y-1.5 border-t pt-3 text-[11px]">
        <MetaRow label="Total" value={inr.format(order.total)} />
        <MetaRow label="Ship to" value={order.shipping_city} />
        {order.status === 'shipped' && order.estimated_delivery && (
          <MetaRow label="Est. delivery" value={fmtDate(order.estimated_delivery)} />
        )}
        {order.status === 'shipped' && order.tracking_number && (
          <MetaRow label="Tracking" value={order.tracking_number} mono />
        )}
        {order.status === 'processing' && order.estimated_delivery && (
          <MetaRow label="Est. delivery" value={fmtDate(order.estimated_delivery)} />
        )}
        {order.status === 'delivered' && order.delivered_on && (
          <MetaRow label="Delivered" value={fmtDate(order.delivered_on)} />
        )}
        {order.status === 'return_requested' && order.return_reason && (
          <MetaRow label="Return" value={order.return_reason} />
        )}
        <MetaRow label="Placed" value={fmtDate(order.placed_on)} />
      </div>
    </div>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex h-full flex-col items-center justify-center gap-4 px-6 py-16 text-center"
    >
      <div className="relative grid size-14 place-content-center">
        <span className="bg-bot/15 absolute inset-0 rounded-full blur-lg" />
        <span className="border-border/60 bg-secondary/60 relative grid size-14 place-content-center rounded-full border">
          <MagnifyingGlassIcon weight="bold" className="text-muted-foreground size-6" />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold">No matches found</h3>
        <p className="text-muted-foreground/80 max-w-56 text-xs leading-relaxed">
          {query ? (
            <>
              Max couldn&apos;t find anything for{' '}
              <span className="text-foreground font-medium">“{query}”</span>.
            </>
          ) : (
            "Max couldn't find anything for that search."
          )}
        </p>
      </div>
      <span className="text-muted-foreground/70 border-border/60 bg-popover/40 flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-wide">
        <SparkleIcon weight="fill" className="text-voice size-3" />
        Try different keywords or ask Max to browse a category
      </span>
    </motion.div>
  );
}

export function ProductPanel() {
  const room = useRoomContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [view, setView] = useState<'products' | 'order'>('products');
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<Cart>({});

  useEffect(() => {
    if (!room) return;
    const onProducts = async (reader: { readAll: () => Promise<string> }) => {
      try {
        const data = JSON.parse(await reader.readAll());
        if (Array.isArray(data.products)) {
          setProducts(data.products);
          setQuery(typeof data.query === 'string' ? data.query : '');
          setHasSearched(true);
          setView('products');
          setOpen(true);
        }
      } catch {
        /* ignore malformed payloads */
      }
    };
    const onOrder = async (reader: { readAll: () => Promise<string> }) => {
      try {
        const data = JSON.parse(await reader.readAll());
        if (data && data.order_id) {
          setOrder(data);
          setView('order');
          setOpen(true);
        }
      } catch {
        /* ignore malformed payloads */
      }
    };
    try {
      room.registerTextStreamHandler(PRODUCTS_TOPIC, onProducts);
      room.registerTextStreamHandler(ORDER_TOPIC, onOrder);
    } catch {
      /* already registered (StrictMode remount) */
    }
    return () => {
      try {
        room.unregisterTextStreamHandler(PRODUCTS_TOPIC);
        room.unregisterTextStreamHandler(ORDER_TOPIC);
      } catch {
        /* noop */
      }
    };
  }, [room]);

  const ask = useCallback(
    (text: string) => {
      try {
        room?.localParticipant.sendText(text, { topic: CHAT_TOPIC });
      } catch {
        /* not connected */
      }
    },
    [room]
  );

  const add = (p: Product) =>
    setCart((c) => ({ ...c, [p.id]: { product: p, qty: (c[p.id]?.qty ?? 0) + 1 } }));
  const dec = (id: string) =>
    setCart((c) => {
      const next = { ...c };
      const qty = (next[id]?.qty ?? 0) - 1;
      if (qty <= 0) delete next[id];
      else next[id] = { ...next[id], qty };
      return next;
    });

  const { count, total } = useMemo(() => {
    const items = Object.values(cart);
    return {
      count: items.reduce((n, i) => n + i.qty, 0),
      total: items.reduce((s, i) => s + i.product.price_inr * i.qty, 0),
    };
  }, [cart]);

  // Push cart state to the agent so Max can reference it by voice (view_cart).
  useEffect(() => {
    if (!room) return;
    const items = Object.values(cart).map(({ product, qty }) => ({
      id: product.id,
      name: product.name,
      qty,
      price_inr: product.price_inr,
    }));
    try {
      room.localParticipant.sendText(JSON.stringify({ count, total, items }), {
        topic: CART_TOPIC,
      });
    } catch {
      /* not connected */
    }
  }, [cart, count, total, room]);

  const hasProducts = products.length > 0;
  const hasContent = hasSearched || order !== null;
  const showTabs = hasSearched && order !== null;

  return (
    <>
      {/* Reopen tab — appears when the panel is closed but results exist */}
      <AnimatePresence>
        {hasContent && !open && (
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            className="border-border/60 bg-popover/70 hover:border-bot/50 fixed top-1/2 right-0 z-[60] flex -translate-y-1/2 items-center gap-2 rounded-l-2xl border border-r-0 py-4 pr-3 pl-4 backdrop-blur-md"
          >
            {order && !hasProducts ? (
              <ReceiptIcon weight="fill" className="text-bot size-5" />
            ) : (
              <ShoppingBagIcon weight="fill" className="text-bot size-5" />
            )}
            {hasProducts && (
              <span className="bg-cart absolute -top-1.5 -left-1.5 grid size-5 place-content-center rounded-full font-mono text-[10px] font-bold text-white">
                {products.length}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="bg-background/60 fixed inset-0 z-[60] backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.aside
            key="product-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="border-border/60 bg-background/80 fixed inset-y-0 right-0 z-[61] flex w-full flex-col border-l backdrop-blur-xl sm:w-[400px]"
          >
            {/* Header */}
            <div className="border-border/60 flex items-center justify-between border-b px-4 py-3.5">
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight">
                  {view === 'order' ? 'Order' : 'Products'}
                </span>
                <span className="text-muted-foreground/70 font-mono text-[10px] tracking-wide">
                  {view === 'order'
                    ? (order?.order_id ?? '')
                    : `${products.length} result${products.length === 1 ? '' : 's'}${query ? ` · “${query}”` : ''}`}
                </span>
              </div>
              <button
                type="button"
                aria-label="Close panel"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-secondary grid size-8 place-content-center rounded-full transition-colors"
              >
                <XIcon weight="bold" className="size-4" />
              </button>
            </div>

            {/* Segmented switch (only when both a grid and an order exist) */}
            {showTabs && (
              <div className="border-border/60 flex gap-1 border-b p-2">
                {(['products', 'order'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    className={cn(
                      'flex-1 rounded-lg py-1.5 font-mono text-[10px] font-semibold tracking-[0.12em] uppercase transition-colors',
                      view === v
                        ? 'bg-secondary text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {v === 'products' ? `Products (${products.length})` : 'Order'}
                  </button>
                ))}
              </div>
            )}

            {/* Body */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {view === 'order' && order ? (
                <OrderCard order={order} />
              ) : !hasProducts ? (
                <NoResults query={query} />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {products.map((p, i) => (
                    <motion.div
                      key={p.id}
                      className="h-full"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: Math.min(i, 8) * 0.05,
                        duration: 0.3,
                        ease: 'easeOut',
                      }}
                    >
                      <ProductCard
                        product={p}
                        qty={cart[p.id]?.qty ?? 0}
                        onAdd={() => add(p)}
                        onDec={() => dec(p.id)}
                        onAsk={() => ask(`Tell me more about the ${p.name}.`)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart total — always visible */}
            <div className="border-border/60 bg-background/60 border-t p-4">
              <AnimatePresence mode="wait">
                {count > 0 ? (
                  <motion.div
                    key="cart"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex flex-col">
                      <span className="text-muted-foreground/70 font-mono text-[10px] tracking-[0.14em] uppercase">
                        {count} item{count === 1 ? '' : 's'} in cart
                      </span>
                      <span className="text-lg font-bold tracking-tight">{inr.format(total)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCart({})}
                        aria-label="Clear cart"
                        className="text-muted-foreground hover:text-foreground hover:bg-secondary grid size-9 place-content-center rounded-full transition-colors"
                      >
                        <TrashIcon weight="bold" className="size-4" />
                      </button>
                      <div className="from-cart shadow-cart/30 flex items-center gap-2 rounded-full bg-gradient-to-r to-[#ff3d97] px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
                        <ShoppingBagIcon weight="fill" className="size-4" />
                        Cart
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-muted-foreground/70 flex items-center justify-center gap-2 py-1 text-center font-mono text-[11px] tracking-wide"
                  >
                    <SparkleIcon weight="fill" className="text-voice size-3.5" />
                    Tap a photo to ask Max, or add to cart
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
