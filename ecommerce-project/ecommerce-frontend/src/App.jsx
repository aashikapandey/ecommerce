import { useState, useEffect, useContext, createContext, useCallback } from "react";

const API_BASE = "http://localhost:8080/api";

// Auth context
const AuthContext = createContext(null);

const useAuth = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("ecom_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("ecom_token") || null);

  const login = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem("ecom_user", JSON.stringify(userData));
    localStorage.setItem("ecom_token", jwt);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("ecom_user");
    localStorage.removeItem("ecom_token");
  };

  return { user, token, login, logout };
};

const api = (token) => ({
  get: (path) =>
    fetch(`${API_BASE}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((r) => r.json()),
  post: (path, body) =>
    fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  put: (path, body) =>
    fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  delete: (path) =>
    fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
});

// ────────── MOCK DATA (for demo without backend) ──────────
const MOCK_PRODUCTS = [
  { id: 1, name: "Wireless Headphones Pro", description: "High-fidelity audio, 40hr battery, ANC", price: 2999, stockQuantity: 45, categoryName: "Electronics", imageUrl: null, active: true },
  { id: 2, name: "Running Shoes X500", description: "Lightweight performance running shoes", price: 1499, stockQuantity: 23, categoryName: "Sports", imageUrl: null, active: true },
  { id: 3, name: "Java Spring Boot Guide", description: "Complete guide to Spring Boot development", price: 499, stockQuantity: 100, categoryName: "Books", imageUrl: null, active: true },
  { id: 4, name: "Smart Coffee Maker", description: "WiFi-enabled programmable coffee maker", price: 3999, stockQuantity: 12, categoryName: "Home & Kitchen", imageUrl: null, active: true },
  { id: 5, name: "Cotton T-Shirt Classic", description: "100% organic cotton, multiple colors", price: 399, stockQuantity: 200, categoryName: "Clothing", imageUrl: null, active: true },
  { id: 6, name: "Mechanical Keyboard RGB", description: "Tactile switches, RGB backlight, compact TKL", price: 4500, stockQuantity: 8, categoryName: "Electronics", imageUrl: null, active: true },
];

const MOCK_ORDERS = [
  { id: 1001, status: "DELIVERED", totalAmount: 4498, createdAt: "2026-05-15T10:30:00", items: [{ productName: "Wireless Headphones Pro", quantity: 1, priceAtTime: 2999 }, { productName: "Cotton T-Shirt Classic", quantity: 2, priceAtTime: 399 }] },
  { id: 1002, status: "PROCESSING", totalAmount: 3999, createdAt: "2026-06-01T14:20:00", items: [{ productName: "Smart Coffee Maker", quantity: 1, priceAtTime: 3999 }] },
];

// ────────── COMPONENTS ──────────

const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: { bg: "#E6F1FB", text: "#185FA5" },
    green: { bg: "#EAF3DE", text: "#3B6D11" },
    amber: { bg: "#FAEEDA", text: "#854F0B" },
    red: { bg: "#FCEBEB", text: "#A32D2D" },
    teal: { bg: "#E1F5EE", text: "#0F6E56" },
    gray: { bg: "#F1EFE8", text: "#5F5E5A" },
    purple: { bg: "#EEEDFE", text: "#534AB7" },
    coral: { bg: "#FAECE7", text: "#993C1D" },
  };
  const c = colors[color] || colors.blue;
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: 99, display: "inline-block" }}>
      {children}
    </span>
  );
};

const statusColor = (s) => ({ DELIVERED: "teal", PROCESSING: "blue", PENDING: "amber", SHIPPED: "purple", CANCELLED: "red" }[s] || "gray");

const categoryEmoji = (c) => ({ Electronics: "💻", Books: "📚", Clothing: "👕", "Home & Kitchen": "🏠", Sports: "⚽" }[c] || "📦");

const formatPrice = (p) => `₹${Number(p).toLocaleString("en-IN")}`;

// Stat card
const Stat = ({ label, value, sub, color = "#185FA5" }) => (
  <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "1rem", flex: 1, minWidth: 120 }}>
    <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 4px" }}>{label}</p>
    <p style={{ fontSize: 22, fontWeight: 500, margin: 0, color }}>{value}</p>
    {sub && <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: "4px 0 0" }}>{sub}</p>}
  </div>
);

// Product card
const ProductCard = ({ product, onAddToCart, isAdmin, onEdit, onDelete }) => (
  <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem", display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ fontSize: 36, textAlign: "center", background: "var(--color-background-secondary)", borderRadius: 8, padding: "1rem" }}>{categoryEmoji(product.categoryName)}</div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <p style={{ fontWeight: 500, fontSize: 14, margin: 0, lineHeight: 1.4 }}>{product.name}</p>
      {product.categoryName && <Badge color="blue">{product.categoryName}</Badge>}
    </div>
    <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>{product.description}</p>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 18, fontWeight: 500, color: "#185FA5" }}>{formatPrice(product.price)}</span>
      <span style={{ fontSize: 11, color: product.stockQuantity < 10 ? "#A32D2D" : "var(--color-text-secondary)" }}>
        {product.stockQuantity < 10 ? `⚠ Only ${product.stockQuantity} left` : `In stock: ${product.stockQuantity}`}
      </span>
    </div>
    <div style={{ display: "flex", gap: 6 }}>
      <button onClick={() => onAddToCart(product)} style={{ flex: 1, padding: "7px 0", fontSize: 13, background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}>
        Add to Cart
      </button>
      {isAdmin && (
        <>
          <button onClick={() => onEdit(product)} style={{ padding: "7px 10px", fontSize: 12, borderRadius: 8, cursor: "pointer", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-secondary)", color: "var(--color-text-primary)" }}>Edit</button>
          <button onClick={() => onDelete(product.id)} style={{ padding: "7px 10px", fontSize: 12, borderRadius: 8, cursor: "pointer", background: "#FCEBEB", border: "0.5px solid #F09595", color: "#A32D2D" }}>Del</button>
        </>
      )}
    </div>
  </div>
);

// ────────── PAGES ──────────

const LoginPage = ({ onAuth }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      // Demo mode - no backend needed
      if (form.email === "admin@ecommerce.com" && form.password === "admin123") {
        login({ email: form.email, firstName: "Admin", lastName: "User", role: "ADMIN" }, "demo-admin-token");
        onAuth();
        return;
      }
      if (form.email && form.password.length >= 6) {
        login({ email: form.email, firstName: form.firstName || "Demo", lastName: form.lastName || "User", role: "USER" }, "demo-user-token");
        onAuth();
        return;
      }
      setError("Password must be at least 6 characters");
    } catch {
      setError("Something went wrong. Try admin@ecommerce.com / admin123");
    } finally {
      setLoading(false);
    }
  };

  const inp = (placeholder, key, type = "text") => (
    <input
      type={type}
      placeholder={placeholder}
      value={form[key]}
      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box" }}
    />
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-background-tertiary)", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🛒</div>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 6px" }}>ShopForge</h1>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>E-Commerce Backend System</p>
        </div>
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 14, padding: "1.5rem", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 0, border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, overflow: "hidden" }}>
            {["login", "register"].map((m) => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "8px", fontSize: 13, fontWeight: mode === m ? 500 : 400, background: mode === m ? "var(--color-background-secondary)" : "transparent", border: "none", cursor: "pointer", color: "var(--color-text-primary)" }}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>
          {mode === "register" && (
            <>
              {inp("First name", "firstName")}
              {inp("Last name", "lastName")}
            </>
          )}
          {inp("Email address", "email", "email")}
          {inp("Password", "password", "password")}
          {error && <p style={{ fontSize: 12, color: "#A32D2D", margin: 0 }}>{error}</p>}
          <button onClick={handleSubmit} disabled={loading} style={{ padding: "10px", background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", textAlign: "center", margin: 0 }}>
            Demo: <code>admin@ecommerce.com</code> / <code>admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
};

const ProductsPage = ({ cart, setCart, isAdmin }) => {
  const [products] = useState(MOCK_PRODUCTS);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [notification, setNotification] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);

  const categories = ["All", ...new Set(MOCK_PRODUCTS.map((p) => p.categoryName))];
  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.categoryName === category;
    return matchSearch && matchCat;
  });

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...product, qty: 1 }];
    });
    setNotification(`${product.name} added to cart`);
    setTimeout(() => setNotification(""), 2000);
  };

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1100, margin: "0 auto" }}>
      {notification && (
        <div style={{ position: "fixed", top: 72, right: 20, background: "#EAF3DE", color: "#3B6D11", padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 100, border: "0.5px solid #C0DD97" }}>
          ✓ {notification}
        </div>
      )}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 1rem" }}>Products</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 8, fontSize: 13, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)" }} />
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} style={{ padding: "9px 14px", borderRadius: 8, fontSize: 13, border: "0.5px solid var(--color-border-secondary)", background: category === c ? "#185FA5" : "var(--color-background-primary)", color: category === c ? "#fff" : "var(--color-text-primary)", cursor: "pointer" }}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} onAddToCart={addToCart} isAdmin={isAdmin} onEdit={setEditingProduct} onDelete={(id) => alert(`Delete product ${id} (demo)`)} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-secondary)" }}>
          <div style={{ fontSize: 40 }}>🔍</div>
          <p>No products found</p>
        </div>
      )}
    </div>
  );
};

const CartPage = ({ cart, setCart, onCheckout }) => {
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const update = (id, delta) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)).filter((i) => i.qty > 0)
    );
  };

  if (cart.length === 0)
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
        <div style={{ fontSize: 48 }}>🛒</div>
        <p style={{ fontSize: 16 }}>Your cart is empty</p>
      </div>
    );

  return (
    <div style={{ padding: "1.5rem", maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 1.5rem" }}>Shopping Cart</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {cart.map((item) => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "0.75rem 1rem" }}>
            <span style={{ fontSize: 28 }}>{categoryEmoji(item.categoryName)}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 500, fontSize: 14, margin: 0 }}>{item.name}</p>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "2px 0 0" }}>{formatPrice(item.price)} each</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => update(item.id, -1)} style={{ width: 28, height: 28, borderRadius: 6, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", cursor: "pointer", fontSize: 16, color: "var(--color-text-primary)" }}>-</button>
              <span style={{ minWidth: 20, textAlign: "center", fontSize: 14, fontWeight: 500 }}>{item.qty}</span>
              <button onClick={() => update(item.id, 1)} style={{ width: 28, height: 28, borderRadius: 6, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", cursor: "pointer", fontSize: 16, color: "var(--color-text-primary)" }}>+</button>
            </div>
            <span style={{ fontWeight: 500, fontSize: 14, minWidth: 80, textAlign: "right" }}>{formatPrice(item.price * item.qty)}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "1.5rem", padding: "1rem", background: "var(--color-background-secondary)", borderRadius: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 500 }}>
          <span>Total</span>
          <span style={{ color: "#185FA5" }}>{formatPrice(total)}</span>
        </div>
        <button onClick={onCheckout} style={{ width: "100%", marginTop: "1rem", padding: "12px", background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: "pointer" }}>
          Place Order
        </button>
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const [orders] = useState(MOCK_ORDERS);
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ padding: "1.5rem", maxWidth: 800, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 1.5rem" }}>My Orders</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {orders.map((order) => (
          <div key={order.id} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: 14, margin: 0 }}>Order #{order.id}</p>
                <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "3px 0 0" }}>{new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Badge color={statusColor(order.status)}>{order.status}</Badge>
                <span style={{ fontWeight: 500, fontSize: 15 }}>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
              {order.items.map((item, i) => (
                <span key={i}>{item.productName} ×{item.quantity}{i < order.items.length - 1 ? ", " : ""}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminPage = () => {
  const stats = [
    { label: "Total Products", value: "2,458", sub: "↑ 45 this week", color: "#185FA5" },
    { label: "Total Orders", value: "5,892", sub: "↑ 234 today", color: "#0F6E56" },
    { label: "Revenue", value: "₹8.5M", sub: "all time", color: "#534AB7" },
    { label: "Users", value: "1,245", sub: "registered", color: "#993C1D" },
  ];

  const recentOrders = [
    { id: 1053, user: "Priya Sharma", amount: 6998, status: "PENDING" },
    { id: 1052, user: "Rahul Verma", amount: 2999, status: "PROCESSING" },
    { id: 1051, user: "Anita Singh", amount: 1998, status: "SHIPPED" },
    { id: 1050, user: "Mohit Kumar", amount: 4500, status: "DELIVERED" },
  ];

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 1.5rem" }}>Admin Dashboard</h2>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {stats.map((s) => <Stat key={s.label} {...s} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem" }}>
          <p style={{ fontWeight: 500, fontSize: 14, margin: "0 0 1rem" }}>Recent Orders</p>
          {recentOrders.map((o) => (
            <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>#{o.id} — {o.user}</p>
                <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "2px 0 0" }}>{formatPrice(o.amount)}</p>
              </div>
              <Badge color={statusColor(o.status)}>{o.status}</Badge>
            </div>
          ))}
        </div>
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem" }}>
          <p style={{ fontWeight: 500, fontSize: 14, margin: "0 0 1rem" }}>Spring Features Active</p>
          {["Spring Boot Auto-configuration", "Spring Data JPA with PostgreSQL", "Spring MVC REST Controllers", "Spring Security with JWT", "Spring Validation", "Spring Transaction Management", "Spring Actuator for monitoring", "Spring AOP for logging"].map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13 }}>
              <span style={{ color: "#3B6D11", fontSize: 15 }}>✓</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem" }}>
          <p style={{ fontWeight: 500, fontSize: 14, margin: "0 0 1rem" }}>API Endpoints</p>
          {[
            ["GET", "/api/products", "teal"],
            ["POST", "/api/products", "blue"],
            ["POST", "/api/auth/login", "blue"],
            ["POST", "/api/auth/register", "blue"],
            ["GET", "/api/cart", "teal"],
            ["POST", "/api/cart/add", "blue"],
            ["POST", "/api/orders", "blue"],
            ["GET", "/api/orders", "teal"],
          ].map(([method, path, color]) => (
            <div key={path + method} style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 0", fontSize: 12 }}>
              <Badge color={color}>{method}</Badge>
              <code style={{ color: "var(--color-text-secondary)" }}>{path}</code>
            </div>
          ))}
        </div>
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem" }}>
          <p style={{ fontWeight: 500, fontSize: 14, margin: "0 0 1rem" }}>Low Stock Alert</p>
          {MOCK_PRODUCTS.filter((p) => p.stockQuantity < 15).map((p) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 13 }}>
              <span>{p.name}</span>
              <Badge color="red">{p.stockQuantity} left</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ────────── LAYOUT ──────────
export default function App() {
  const auth = useAuth();
  const [page, setPage] = useState("products");
  const [cart, setCart] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const isAdmin = auth.user?.role === "ADMIN";

  if (!auth.user) return (
    <AuthContext.Provider value={auth}>
      <LoginPage onAuth={() => {}} />
    </AuthContext.Provider>
  );

  const handleCheckout = () => {
    setCart([]);
    setOrderPlaced(true);
    setPage("orders");
    setTimeout(() => setOrderPlaced(false), 3000);
  };

  const navItems = [
    { key: "products", label: "Products", icon: "📦" },
    { key: "cart", label: `Cart${cart.length > 0 ? ` (${cart.length})` : ""}`, icon: "🛒" },
    { key: "orders", label: "Orders", icon: "📋" },
    ...(isAdmin ? [{ key: "admin", label: "Admin", icon: "⚡" }] : []),
  ];

  return (
    <AuthContext.Provider value={auth}>
      <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)" }}>
        {/* Header */}
        <header style={{ background: "var(--color-background-primary)", borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "0 1.5rem", position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>🛒</span>
            <span style={{ fontSize: 16, fontWeight: 500 }}>ShopForge</span>
            <Badge color="blue">Spring Boot</Badge>
          </div>
          <nav style={{ display: "flex", gap: 4 }}>
            {navItems.map((n) => (
              <button key={n.key} onClick={() => setPage(n.key)} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: page === n.key ? 500 : 400, background: page === n.key ? "var(--color-background-secondary)" : "transparent", border: "none", cursor: "pointer", color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 14 }}>{n.icon}</span>
                <span>{n.label}</span>
              </button>
            ))}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
              {auth.user.firstName} {isAdmin && <Badge color="purple">admin</Badge>}
            </span>
            <button onClick={auth.logout} style={{ padding: "5px 12px", fontSize: 12, borderRadius: 8, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-secondary)", cursor: "pointer", color: "var(--color-text-primary)" }}>
              Sign out
            </button>
          </div>
        </header>

        {/* Notification */}
        {orderPlaced && (
          <div style={{ position: "fixed", top: 66, right: 20, background: "#EAF3DE", color: "#3B6D11", padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 100, border: "0.5px solid #C0DD97" }}>
            ✓ Order placed successfully!
          </div>
        )}

        {/* Content */}
        <main>
          {page === "products" && <ProductsPage cart={cart} setCart={setCart} isAdmin={isAdmin} />}
          {page === "cart" && <CartPage cart={cart} setCart={setCart} onCheckout={handleCheckout} />}
          {page === "orders" && <OrdersPage />}
          {page === "admin" && isAdmin && <AdminPage />}
        </main>
      </div>
    </AuthContext.Provider>
  );
}
