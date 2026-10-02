import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './superbase.ts';
import { useAuth } from './authcontext.jsx';


const WILAYAS = [
    'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar',
    'Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger',
    'Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma',
    'Constantine','Médéa','Mostaganem','M\'Sila','Mascara','Ouargla','Oran','El Bayadh',
    'Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt',
    'El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma',
    'Aïn Témouchent','Ghardaïa','Relizane'
];

const DESC_MAX = 150; // roughly 3 lines

const EMPTY_ITEM_FORM = { id: null, file: null, oldImg: null, name: '', description: '', price: '', categoryId: '', newCategory: '' };
const EMPTY_ORDER     = { fullname: '', email: '', phone: '', address: '', city: '', wilaya: '', honeypot: '' };

function MenuPage({ onBack, scrollToCategory }) {

    const { isAdmin } = useAuth();

    const [ categories, setCategories ] = useState([]);
    const [ items,      setItems      ] = useState([]);
    const [ loading,    setLoading    ] = useState(true);

    // ── admin add/edit item modal ──
    const [ showItemModal, setShowItemModal ] = useState(false);
    const [ itemForm,      setItemForm      ] = useState(EMPTY_ITEM_FORM);
    const [ addingCategory, setAddingCategory ] = useState(false);

    // ── admin delete item confirm ──
    const [ deleteTarget, setDeleteTarget ] = useState(null); // item object

    // ── cart ──
    const [ cart,     setCart     ] = useState({}); // { [itemId]: quantity }
    const [ showCart, setShowCart ] = useState(false);

    // ── order form ──
    const [ orderModal, setOrderModal ] = useState({
        show: false, form: EMPTY_ORDER, sending: false, sent: false, error: ''
    });

    const hasFetched = useRef(false);

    // ==========================
    // fetch categories + items
    // ==========================
    const getCategories = useCallback(async () => {
        const { data, error } = await supabase
            .from('menu_categories')
            .select('*')
            .order('created_at', { ascending: true });
        if (error) { console.error(error); return; }
        setCategories(data || []);
    }, []);

    const getItems = useCallback(async () => {
        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .order('created_at', { ascending: true });
        if (error) { console.error(error); return; }
        setItems(data || []);
    }, []);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        (async () => {
            setLoading(true);
            await Promise.all([getCategories(), getItems()]);
            setLoading(false);
        })();
    }, [getCategories, getItems]);

    // ==========================
    // scroll to a category if asked to (e.g. came from clicking "burger" on the main page)
    // ==========================
    useEffect(() => {
        if (!scrollToCategory || loading) return;
        const cat = categories.find(c => c.name.toLowerCase() === scrollToCategory.toLowerCase());
        if (cat) {
            document.getElementById(`mn-cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [scrollToCategory, loading, categories]);

    const scrollToCat = (catId) => {
        document.getElementById(`mn-cat-${catId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // ==========================
    // admin: open add / edit item modal
    // ==========================
    const openAddItem = () => {
        setItemForm(EMPTY_ITEM_FORM);
        setAddingCategory(categories.length === 0);
        setShowItemModal(true);
        document.body.style.overflow = 'hidden';
    };

    const openEditItem = (item) => {
        setItemForm({
            id: item.id, file: null, oldImg: item.image_url,
            name: item.name, description: item.description || '',
            price: String(item.price), categoryId: String(item.category_id), newCategory: ''
        });
        setAddingCategory(false);
        setShowItemModal(true);
        document.body.style.overflow = 'hidden';
    };

    const closeItemModal = () => {
        setShowItemModal(false);
        setItemForm(EMPTY_ITEM_FORM);
        document.body.style.overflow = 'auto';
    };

    // ==========================
    // admin: confirm add / edit item
    // ==========================
    const confirmItem = async () => {
        const { id, file, oldImg, name, description, price, categoryId, newCategory } = itemForm;
        if (!name || !price) return;
        if (!id && !file) return; // new item needs an image

        // resolve category — either existing id or a brand new one
        let finalCategoryId = categoryId;
        if (addingCategory) {
            const trimmed = newCategory.trim();
            if (!trimmed) return;
            const existing = categories.find(c => c.name.toLowerCase() === trimmed.toLowerCase());
            if (existing) {
                finalCategoryId = existing.id;
            } else {
                const { data, error } = await supabase
                    .from('menu_categories')
                    .insert({ name: trimmed })
                    .select()
                    .single();
                if (error) { console.error(error); return; }
                finalCategoryId = data.id;
            }
        }
        if (!finalCategoryId) return;

        let imageUrl = oldImg;
        if (file) {
            if (oldImg) {
                const oldpath = oldImg.split('/admin-images/')[1];
                if (oldpath) await supabase.storage.from('admin-images').remove([decodeURIComponent(oldpath)]);
            }
            const uniquename = `${Date.now()}_${file.name}`;
            const filepath   = `admin/assets/menu/${uniquename}`;
            const { error: uploaderror } = await supabase.storage.from('admin-images').upload(filepath, file);
            if (uploaderror) { console.error(uploaderror); return; }
            const { data: pub } = supabase.storage.from('admin-images').getPublicUrl(filepath);
            imageUrl = pub.publicUrl;
        }

        const payload = {
            category_id : finalCategoryId,
            name,
            description,
            price       : parseFloat(price),
            image_url   : imageUrl,
        };

        if (id) {
            const { error } = await supabase.from('menu_items').update(payload).eq('id', id);
            if (error) { console.error(error); return; }
        } else {
            const { error } = await supabase.from('menu_items').insert(payload);
            if (error) { console.error(error); return; }
        }

        await Promise.all([getCategories(), getItems()]);
        closeItemModal();
    };

    // ==========================
    // admin: delete item
    // ==========================
    const confirmDeleteItem = async () => {
        if (!deleteTarget) return;
        const path = deleteTarget.image_url.split('/admin-images/')[1];
        if (path) await supabase.storage.from('admin-images').remove([decodeURIComponent(path)]);
        await supabase.from('menu_items').delete().eq('id', deleteTarget.id);
        setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
        setDeleteTarget(null);
        document.body.style.overflow = 'auto';
    };

    // ==========================
    // cart
    // ==========================
    const addToCart = (item) => {
        setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
    };

    const changeQty = (itemId, delta) => {
        setCart(prev => {
            const next = { ...prev };
            const qty = (next[itemId] || 0) + delta;
            if (qty <= 0) { delete next[itemId]; } else { next[itemId] = qty; }
            return next;
        });
    };

    const cartEntries = Object.entries(cart)
        .map(([itemId, qty]) => ({ item: items.find(i => String(i.id) === itemId), qty }))
        .filter(e => e.item);

    const cartCount = cartEntries.reduce((sum, e) => sum + e.qty, 0);
    const cartTotal  = cartEntries.reduce((sum, e) => sum + e.qty * Number(e.item.price), 0);

    const openCart = () => {
        setShowCart(true);
        document.body.style.overflow = 'hidden';
    };
    const closeCart = () => {
        setShowCart(false);
        document.body.style.overflow = 'auto';
    };

    // ==========================
    // order form
    // ==========================
    const openOrder = () => {
        setShowCart(false);
        setOrderModal({ show: true, form: EMPTY_ORDER, sending: false, sent: false, error: '' });
        document.body.style.overflow = 'hidden';
    };

    const closeOrder = () => {
        setOrderModal(o => ({ ...o, show: false }));
        document.body.style.overflow = 'auto';
    };

    const checkRateLimit = () => {
        const key = 'order_attempts';
        const now = Date.now();
        const windowMs = 15 * 60 * 1000;
        const stored = JSON.parse(localStorage.getItem(key) || '[]');
        const recent = stored.filter(t => now - t < windowMs);
        if (recent.length >= 3) return false;
        recent.push(now);
        localStorage.setItem(key, JSON.stringify(recent));
        return true;
    };

    const sendOrder = async () => {
        if (orderModal.form.honeypot) return;
        if (!checkRateLimit()) {
            setOrderModal(o => ({ ...o, error: 'too many attempts, please wait 15 minutes' }));
            return;
        }
        const { fullname, email, phone, address, city, wilaya } = orderModal.form;
        if (!fullname || !email || !phone || !address || !city || !wilaya) {
            setOrderModal(o => ({ ...o, error: 'please fill in all fields' })); return;
        }
        if (cartEntries.length === 0) {
            setOrderModal(o => ({ ...o, error: 'your cart is empty' })); return;
        }

        setOrderModal(o => ({ ...o, error: '', sending: true }));
        try {
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    fullname, email, phone, address, city, wilaya,
                    total_price : cartTotal,
                    ordered_at  : new Date().toLocaleString(),
                    is_checked  : false,
                    is_read     : false,
                })
                .select()
                .single();
            if (orderError) throw orderError;

            const rows = cartEntries.map(e => ({
                order_id   : order.id,
                item_name  : e.item.name,
                item_price : Number(e.item.price),
                quantity   : e.qty,
            }));
            const { error: itemsError } = await supabase.from('order_items').insert(rows);
            if (itemsError) throw itemsError;

            setCart({}); // clear cart state after a successful send
            setOrderModal(o => ({ ...o, sent: true, sending: false }));
        } catch (err) {
            console.error(err);
            setOrderModal(o => ({ ...o, error: 'something went wrong, please try again', sending: false }));
        }
    };

    if (loading) return <div id="mn-loading"><div id="mn-spinner"/></div>;

    return (
        <>
            <div id="mn-wrap">

                <div id="mn-topbar">
                    <button id="mn-back" onClick={onBack}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                        back
                    </button>
                    { isAdmin &&
                        <button id="mn-add-item-btn" onClick={openAddItem}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            add item
                        </button>
                    }
                </div>

                { categories.length > 0 &&
                    <div id="mn-tabs">
                        { categories.map(cat => (
                            <button key={cat.id} className="mn-tab" onClick={() => scrollToCat(cat.id)}>
                                { cat.name }
                            </button>
                        ))}
                    </div>
                }

                <div id="mn-sections">
                    { categories.length === 0 &&
                        <div id="mn-empty">
                            <p>no menu items yet</p>
                            { isAdmin && <span>tap "add item" above to start building the menu</span> }
                        </div>
                    }

                    { categories.map(cat => {
                        const catItems = items.filter(i => i.category_id === cat.id);
                        if (catItems.length === 0) return null;
                        return (
                            <div className="mn-category-section" id={`mn-cat-${cat.id}`} key={cat.id}>
                                <h2 className="mn-category-title">{ cat.name }</h2>
                                { catItems.map(item => (
                                    <div className="mn-item-row" key={item.id}>
                                        <div className="mn-item-info">
                                            <h3 className="mn-item-name">{ item.name }</h3>
                                            { item.description &&
                                                <p className="mn-item-desc">{ item.description }</p>
                                            }
                                            <p className="mn-item-price">{ Number(item.price).toFixed(2) } DZD</p>
                                        </div>
                                        <div className="mn-item-imgwrap">
                                            <img src={ item.image_url } alt={ item.name } loading="lazy" decoding="async"/>
                                            <button className="mn-item-add" onClick={() => addToCart(item)} aria-label="add to cart">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                                </svg>
                                            </button>
                                            { isAdmin &&
                                                <div className="mn-item-admin-btns">
                                                    <button onClick={() => openEditItem(item)} title="edit">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                        </svg>
                                                    </button>
                                                    <button onClick={() => { setDeleteTarget(item); document.body.style.overflow = 'hidden'; }} title="delete">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                            <polyline points="3 6 5 6 21 6"/>
                                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>

            </div>

            {/* ======= FLOATING CART BAR ======= */}
            { cartCount > 0 &&
                <button id="mn-cartbar" onClick={openCart}>
                    <span id="mn-cartbar-count">{ cartCount }</span>
                    <span id="mn-cartbar-label">Cart</span>
                    <span id="mn-cartbar-total">{ cartTotal.toFixed(2) } DZD</span>
                </button>
            }

            {/* ======= CART MODAL ======= */}
            { showCart &&
                <div className="mn-modal-bg">
                    <div className="mn-modal mn-cart-modal">
                        <h2 className="mn-modal-title">your cart</h2>
                        <div className="mn-cart-list">
                            { cartEntries.map(({ item, qty }) => (
                                <div className="mn-cart-row" key={item.id}>
                                    <img src={item.image_url} alt={item.name} loading="lazy" decoding="async"/>
                                    <div className="mn-cart-row-info">
                                        <span className="mn-cart-row-name">{ item.name }</span>
                                        <span className="mn-cart-row-price">{ Number(item.price).toFixed(2) } DZD</span>
                                    </div>
                                    <div className="mn-cart-qty">
                                        <button onClick={() => changeQty(item.id, -1)}>−</button>
                                        <span>{ qty }</span>
                                        <button onClick={() => changeQty(item.id, 1)}>+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mn-cart-total-row">
                            <span>total</span>
                            <span>{ cartTotal.toFixed(2) } DZD</span>
                        </div>
                        <div className="mn-modal-btns">
                            <button className="mn-btn-cancel" onClick={closeCart}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                                close
                            </button>
                            <button className="mn-btn-confirm" onClick={openOrder} disabled={cartEntries.length === 0}>
                                send order
                            </button>
                        </div>
                    </div>
                </div>
            }

            {/* ======= ORDER FORM MODAL ======= */}
            { orderModal.show &&
                <div className="mn-modal-bg">
                    <div className="mn-modal">
                        { orderModal.sent
                            ? <>
                                <div className="mn-success-icon">✓</div>
                                <h2 className="mn-modal-title">order received!</h2>
                                <p className="mn-modal-sub">we will contact you shortly</p>
                                <button className="mn-btn-confirm" style={{ width: '100%', marginTop: '8px' }} onClick={closeOrder}>close</button>
                            </>
                            : <>
                                <h2 className="mn-modal-title">complete your order</h2>
                                <p className="mn-modal-sub">{ cartCount } item{cartCount !== 1 ? 's' : ''} — { cartTotal.toFixed(2) } DZD</p>
                                <div className="mn-form">
                                    <input
                                        type="text" name="honeypot" style={{ display: 'none' }}
                                        value={orderModal.form.honeypot || ''}
                                        onChange={e => setOrderModal(o => ({ ...o, form: { ...o.form, honeypot: e.target.value } }))}
                                        autoComplete="off"
                                    />
                                    <input className="mn-input" type="text"  placeholder="full name"        value={orderModal.form.fullname} onChange={e => setOrderModal(o => ({ ...o, form: { ...o.form, fullname: e.target.value } }))}/>
                                    <input className="mn-input" type="email" placeholder="email"            value={orderModal.form.email}    onChange={e => setOrderModal(o => ({ ...o, form: { ...o.form, email:    e.target.value } }))}/>
                                    <input className="mn-input" type="tel"   placeholder="phone number"     value={orderModal.form.phone}    onChange={e => setOrderModal(o => ({ ...o, form: { ...o.form, phone:    e.target.value } }))}/>
                                    <input className="mn-input" type="text"  placeholder="shipping address" value={orderModal.form.address}  onChange={e => setOrderModal(o => ({ ...o, form: { ...o.form, address:  e.target.value } }))}/>
                                    <input className="mn-input" type="text"  placeholder="city"             value={orderModal.form.city}     onChange={e => setOrderModal(o => ({ ...o, form: { ...o.form, city:     e.target.value } }))}/>
                                    <select className="mn-input mn-select" value={orderModal.form.wilaya} onChange={e => setOrderModal(o => ({ ...o, form: { ...o.form, wilaya: e.target.value } }))}>
                                        <option value="">select wilaya</option>
                                        { WILAYAS.map(w => <option key={w} value={w}>{ w }</option>) }
                                    </select>
                                </div>
                                { orderModal.error && <p className="mn-error">{ orderModal.error }</p> }
                                <div className="mn-modal-btns">
                                    <button className="mn-btn-cancel" onClick={closeOrder}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                        </svg>
                                        cancel
                                    </button>
                                    <button className="mn-btn-confirm" onClick={sendOrder} disabled={orderModal.sending}>
                                        { orderModal.sending ? 'sending...' : 'place order' }
                                    </button>
                                </div>
                            </>
                        }
                    </div>
                </div>
            }

            {/* ======= ADD / EDIT ITEM MODAL (admin) ======= */}
            { showItemModal &&
                <div className="mn-modal-bg">
                    <div className="mn-modal">
                        <h2 className="mn-modal-title">{ itemForm.id ? 'edit item' : 'add new item' }</h2>

                        <div className="mn-upload-preview" onClick={() => document.getElementById('mn-file-input').click()}>
                            { itemForm.file
                                ? <img src={URL.createObjectURL(itemForm.file)} alt="preview"/>
                                : itemForm.oldImg
                                    ? <img src={itemForm.oldImg} alt="current"/>
                                    : <>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                                        </svg>
                                        <span>click to choose image</span>
                                    </>
                            }
                        </div>
                        <input id="mn-file-input" type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={e => setItemForm(f => ({ ...f, file: e.target.files[0] }))}
                        />

                        <input
                            className="mn-input" type="text" placeholder="item name"
                            value={itemForm.name}
                            onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))}
                        />

                        <div className="mn-desc-wrap">
                            <textarea
                                className="mn-textarea"
                                placeholder="short description (max 3 lines)"
                                maxLength={DESC_MAX}
                                rows={3}
                                value={itemForm.description}
                                onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))}
                            />
                            <span className="mn-char-count">{ itemForm.description.length }/{ DESC_MAX }</span>
                        </div>

                        <input
                            className="mn-input" type="number" min="0" step="0.01" placeholder="price (DZD)"
                            value={itemForm.price}
                            onChange={e => setItemForm(f => ({ ...f, price: e.target.value }))}
                        />

                        { !addingCategory
                            ? <div className="mn-cat-select-row">
                                <select
                                    className="mn-input mn-select"
                                    value={itemForm.categoryId}
                                    onChange={e => setItemForm(f => ({ ...f, categoryId: e.target.value }))}
                                >
                                    <option value="">select category</option>
                                    { categories.map(c => <option key={c.id} value={c.id}>{ c.name }</option>) }
                                </select>
                                <button className="mn-new-cat-btn" onClick={() => setAddingCategory(true)}>
                                    + new
                                </button>
                            </div>
                            : <div className="mn-cat-select-row">
                                <input
                                    className="mn-input" type="text" placeholder="new category name (e.g. pizza)"
                                    value={itemForm.newCategory}
                                    onChange={e => setItemForm(f => ({ ...f, newCategory: e.target.value }))}
                                />
                                { categories.length > 0 &&
                                    <button className="mn-new-cat-btn" onClick={() => setAddingCategory(false)}>
                                        cancel
                                    </button>
                                }
                            </div>
                        }

                        <div className="mn-modal-btns">
                            <button className="mn-btn-cancel" onClick={closeItemModal}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                                cancel
                            </button>
                            <button
                                className="mn-btn-confirm"
                                onClick={confirmItem}
                                disabled={
                                    !itemForm.name || !itemForm.price ||
                                    (!itemForm.id && !itemForm.file) ||
                                    (addingCategory ? !itemForm.newCategory.trim() : !itemForm.categoryId)
                                }
                            >
                                { itemForm.id ? 'save' : 'confirm' }
                            </button>
                        </div>
                    </div>
                </div>
            }

            {/* ======= DELETE ITEM CONFIRM ======= */}
            { deleteTarget &&
                <div className="mn-modal-bg">
                    <div className="mn-modal">
                        <h2 className="mn-modal-title">delete "{ deleteTarget.name }"?</h2>
                        <p className="mn-modal-sub">this cannot be undone</p>
                        <div className="mn-modal-btns">
                            <button className="mn-btn-cancel" onClick={() => { setDeleteTarget(null); document.body.style.overflow = 'auto'; }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                                cancel
                            </button>
                            <button className="mn-btn-danger" onClick={confirmDeleteItem}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                </svg>
                                delete
                            </button>
                        </div>
                    </div>
                </div>
            }
        </>
    );
}

export default MenuPage;