// ========== فتح تفاصيل المنتج (ترتيب عمودي: اسم + تقييم + وصف فوق الصورة) ==========
async function openProductDetail(product) {
    if (!product) return;
    appState.currentProduct = product;

    // جلب المراجعات
    const reviews = await loadProductReviews(product.id);
    const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 0;

    // بناء نجوم التقييم
    const fullStars = Math.floor(avgRating);
    const hasHalfStar = avgRating % 1 >= 0.5;
    let ratingStars = '★'.repeat(fullStars);
    if (hasHalfStar) ratingStars += '★';
    ratingStars += '☆'.repeat(5 - Math.ceil(avgRating));
    while (ratingStars.length < 5) ratingStars += '☆';

    // تجهيز الصور
    const images = (product.images && Array.isArray(product.images) && product.images.length)
        ? product.images
        : (product.image_url ? [product.image_url] : []);
    const mainImage = images.length ? images[0] : '';

    // حالة المخزون
    const inStock = (product.stock !== undefined && product.stock > 0);
    const stockText = inStock ? '✅ متوفر' : '❌ غير متوفر';
    const stockColor = inStock ? '#4caf50' : '#e53935';

    // الكمية الافتراضية
    window._detailQuantity = 1;

    const container = document.getElementById('productDetailContent');
    if (!container) return;

    container.innerHTML = `
        <div class="product-detail-wrapper" id="productDetailWrapper">

            <!-- ===== القسم العلوي (فوق الصورة) ===== -->
            <div class="product-detail-top-section">
                <h1 class="product-detail-name">${escapeHTML(product.name)}</h1>
                <div class="product-detail-meta" onclick="toggleReviews()" style="cursor:pointer;">
                    <div class="product-rating-row">
                        <span class="stars">${ratingStars}</span>
                        <span class="rating-value">${avgRating.toFixed(1)}</span>
                        <span class="rating-count">(${reviews.length} تقييم)</span>
                        <i class="fas fa-chevron-down" id="reviewsToggleIcon" style="font-size:0.8rem; margin-right:6px; transition: transform 0.3s;"></i>
                    </div>
                    ${product.seller_name ? `<span class="seller-badge verified">✓ ${escapeHTML(product.seller_name)}</span>` : ''}
                </div>
                <div class="product-detail-description">
                    <p>${escapeHTML(product.description || 'لا يوجد وصف متاح لهذا المنتج.')}</p>
                </div>
            </div>

            <!-- ===== القسم الأوسط (الصورة) ===== -->
            <div class="product-detail-image-section">
                <div class="product-main-image-container" id="mainImageContainer">
                    <img src="${mainImage}" id="detailMainImage" alt="${escapeHTML(product.name)}"
                         onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\"no-image\">📦</div>';">
                    ${images.length > 0 ? `<button class="zoom-btn" onclick="toggleZoom()"><i class="fas fa-search-plus"></i></button>` : ''}
                </div>
                ${images.length > 1 ? `
                <div class="product-gallery-wrapper">
                    <button class="gallery-nav prev" onclick="slideGallery(-1)"><i class="fas fa-chevron-right"></i></button>
                    <div class="product-gallery-thumbs" id="galleryThumbs">
                        ${images.map((img, idx) => `
                            <img src="${img}" class="gallery-thumb ${idx === 0 ? 'active-thumb' : ''}"
                                 data-index="${idx}" onclick="changeMainImageByIndex(${idx})" loading="lazy">
                        `).join('')}
                    </div>
                    <button class="gallery-nav next" onclick="slideGallery(1)"><i class="fas fa-chevron-left"></i></button>
                </div>
                <div class="image-counter">${images.length} صورة</div>
                ` : ''}
            </div>

            <!-- ===== القسم السفلي (تحت الصورة) ===== -->
            <div class="product-detail-bottom-section">
                <div class="product-detail-price">
                    <span class="price-main" id="detailPrice">${(product.price * 1).toLocaleString()} ج.م</span>
                    ${product.discount ? `
                        <span class="price-original">${(product.price / (1 - product.discount/100)).toFixed(0)} ج.م</span>
                        <span class="discount-badge">خصم ${product.discount}%</span>
                    ` : ''}
                </div>
                <div class="product-stock" style="color:${stockColor}; font-weight:700; font-size:0.95rem;">
                    ${stockText}
                </div>
                <div class="product-quantity-section">
                    <label>الكمية:</label>
                    <div class="quantity-selector">
                        <button class="qty-btn" onclick="changeQuantity(-1)">−</button>
                        <span id="detailQuantity">1</span>
                        <button class="qty-btn" onclick="changeQuantity(1)">+</button>
                    </div>
                    <span id="totalPriceDisplay" style="font-weight:700; color:#1a237e; margin-right:10px;">
                        الإجمالي: ${product.price.toLocaleString()} ج.م
                    </span>
                </div>
                <div class="product-detail-actions desktop-actions">
                    <button class="buy-now-btn" onclick="openDirectCheckout()">
                        <i class="fas fa-bolt"></i> شراء الآن
                    </button>
                    <button class="add-to-cart-btn" onclick="addToCartFromDetail()">
                        <i class="fas fa-cart-plus"></i> إضافة إلى السلة
                    </button>
                    <button class="share-btn-icon" onclick="shareProduct()" title="مشاركة المنتج">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
                <div class="product-specifications">
                    <h3>مواصفات المنتج</h3>
                    <div class="spec-grid">
                        <div class="spec-item"><span class="spec-label">التصنيف</span><span class="spec-value">${product.category || 'عام'}</span></div>
                        <div class="spec-item"><span class="spec-label">المخزون</span><span class="spec-value">${product.stock || 'غير محدد'}</span></div>
                        <div class="spec-item"><span class="spec-label">الحالة</span><span class="spec-value">جديد</span></div>
                        ${product.brand ? `<div class="spec-item"><span class="spec-label">الماركة</span><span class="spec-value">${escapeHTML(product.brand)}</span></div>` : ''}
                    </div>
                </div>
                <div class="product-reviews" id="productReviewsSection" style="display: none;">
                    <h3>تقييمات العملاء</h3>
                    <div class="reviews-list" id="reviewsList">
                        ${reviews.length ? reviews.map(r => `
                            <div class="review-item">
                                <div class="review-avatar"><i class="fas fa-user"></i></div>
                                <div class="review-content">
                                    <div class="review-name">${escapeHTML(r.user_name || 'مستخدم')}</div>
                                    <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                                    <p class="review-text">${escapeHTML(r.comment)}</p>
                                    <div class="review-date">${new Date(r.created_at).toLocaleDateString('ar-EG')}</div>
                                </div>
                            </div>
                        `).join('') : '<div class="no-reviews">لا توجد تقييمات لهذا المنتج بعد.</div>'}
                    </div>
                </div>
            </div>
        </div>

        <!-- منتجات مشابهة -->
        <div id="similarProductsSectionDetail" class="similar-products-section"></div>
    `;

    // تحميل المنتجات المشابهة
    loadSimilarProductsInDetail(product.category, product.id);
    showScreen('productDetailScreen');
    setTimeout(() => addStickyActions(), 100);
}

// ========== دوال مساعدة للكمية ==========
function changeQuantity(delta) {
    const qtySpan = document.getElementById('detailQuantity');
    const priceSpan = document.getElementById('detailPrice');
    const totalSpan = document.getElementById('totalPriceDisplay');
    if (!qtySpan || !priceSpan || !appState.currentProduct) return;
    let qty = parseInt(qtySpan.textContent) + delta;
    if (qty < 1) qty = 1;
    if (appState.currentProduct.stock && qty > appState.currentProduct.stock) {
        showToast('الكمية المطلوبة تتجاوز المخزون المتاح', 'warning');
        return;
    }
    qtySpan.textContent = qty;
    window._detailQuantity = qty;
    const price = appState.currentProduct.price;
    priceSpan.textContent = (price * qty).toLocaleString() + ' ج.م';
    totalSpan.textContent = `الإجمالي: ${(price * qty).toLocaleString()} ج.م`;
}

// ========== تغيير الصورة الرئيسية ==========
let currentImageIndex = 0;
function changeMainImageByIndex(index) {
    const images = getProductImages();
    if (!images || index < 0 || index >= images.length) return;
    currentImageIndex = index;
    const mainImg = document.getElementById('detailMainImage');
    if (mainImg) mainImg.src = images[index];
    document.querySelectorAll('.gallery-thumb').forEach((thumb, i) => {
        thumb.classList.toggle('active-thumb', i === index);
    });
    const thumbContainer = document.getElementById('galleryThumbs');
    if (thumbContainer) {
        const activeThumb = thumbContainer.querySelector('.active-thumb');
        if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}

function getProductImages() {
    const product = appState.currentProduct;
    if (!product) return [];
    return (product.images && Array.isArray(product.images) && product.images.length)
        ? product.images
        : (product.image_url ? [product.image_url] : []);
}

function slideGallery(direction) {
    const images = getProductImages();
    if (!images.length) return;
    let newIndex = currentImageIndex + direction;
    if (newIndex < 0) newIndex = images.length - 1;
    if (newIndex >= images.length) newIndex = 0;
    changeMainImageByIndex(newIndex);
}

// ========== تكبير الصورة ==========
let zoomActive = false;
function toggleZoom() {
    const container = document.getElementById('mainImageContainer');
    if (!container) return;
    zoomActive = !zoomActive;
    container.classList.toggle('zoomed', zoomActive);
}

// ========== مشاركة المنتج ==========
function shareProduct() {
    if (!appState.currentProduct) return;
    const url = `${window.location.origin}${window.location.pathname}?id=${appState.currentProduct.id}`;
    const text = `اطلع على منتج ${appState.currentProduct.name} على Misar Systems`;
    if (navigator.share) {
        navigator.share({ title: appState.currentProduct.name, text, url }).catch(() => {});
    } else {
        navigator.clipboard.writeText(url).then(() => {
            showToast('تم نسخ رابط المنتج', 'success');
        }).catch(() => {
            showToast('فشل النسخ، حاول يدوياً', 'error');
        });
    }
}

// ========== جلب المراجعات من قاعدة البيانات ==========
async function loadProductReviews(productId) {
    try {
        const { data, error } = await supabaseClient
            .from('reviews')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.warn('فشل جلب المراجعات:', e);
        return [];
    }
}

// ========== تبديل إظهار المراجعات ==========
function toggleReviews() {
    const section = document.getElementById('productReviewsSection');
    const icon = document.getElementById('reviewsToggleIcon');
    if (!section) return;
    const isHidden = section.style.display === 'none';
    section.style.display = isHidden ? 'block' : 'none';
    if (icon) icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
}

// ========== إضافة الأزرار المثبتة ==========
function addStickyActions() {
    const existing = document.querySelector('.sticky-actions-mobile');
    if (existing) existing.remove();
    const desktopActions = document.querySelector('.product-detail-actions.desktop-actions');
    if (!desktopActions) return;
    const stickyDiv = document.createElement('div');
    stickyDiv.className = 'sticky-actions-mobile';
    // زر شراء الآن
    const buyBtn = desktopActions.querySelector('.buy-now-btn');
    if (buyBtn) {
        const cloneBuy = buyBtn.cloneNode(true);
        cloneBuy.onclick = openDirectCheckout;
        stickyDiv.appendChild(cloneBuy);
    }
    // زر إضافة إلى السلة
    const addBtn = desktopActions.querySelector('.add-to-cart-btn');
    if (addBtn) {
        const cloneAdd = addBtn.cloneNode(true);
        cloneAdd.onclick = addToCartFromDetail;
        stickyDiv.appendChild(cloneAdd);
    }
    const wrapper = document.querySelector('.product-detail-wrapper');
    if (wrapper) wrapper.appendChild(stickyDiv);
}

// ========== دوال الشراء المباشر ==========
function openDirectCheckout() {
    if (!appState.user) {
        showToast('يجب تسجيل الدخول أولاً', 'warning');
        return;
    }
    if (!appState.currentProduct) {
        showToast('حدث خطأ، الرجاء المحاولة مرة أخرى', 'error');
        return;
    }

    // تعبئة الحقول تلقائياً من بيانات المستخدم
    const userData = appState.userData || {};
    document.getElementById('directName').value = userData.name || '';
    document.getElementById('directPhone').value = userData.phone || '';
    document.getElementById('directAddress').value = userData.address || '';
    document.getElementById('directGovernorate').value = userData.governorate || 'قنا';
    document.getElementById('directCity').value = userData.center || '';
    document.getElementById('directNotes').value = '';

    // عرض المودال
    document.getElementById('directCheckoutModal').classList.add('active');
}

async function confirmDirectOrder() {
    const name = document.getElementById('directName').value.trim();
    const phone = document.getElementById('directPhone').value.trim();
    const address = document.getElementById('directAddress').value.trim();
    const governorate = document.getElementById('directGovernorate').value;
    const city = document.getElementById('directCity').value.trim();
    const notes = document.getElementById('directNotes').value.trim();

    if (!name || !phone || !address || !city) {
        showToast('يرجى ملء جميع الحقول المطلوبة', 'warning');
        return;
    }

    showLoading(true);
    try {
        const product = appState.currentProduct;
        const quantity = window._detailQuantity || 1;
        const totalPrice = product.price * quantity;
        const deliveryFee = 20; // يمكن جعلها ديناميكية حسب المدينة

        // إنشاء الطلب مباشرة
        await createOrder(
            product.id,
            quantity,
            totalPrice + deliveryFee,
            product.user_id,
            name,
            phone,
            address,
            city, // center
            deliveryFee
        );

        // إغلاق المودال
        document.getElementById('directCheckoutModal').classList.remove('active');

        showToast('تم تقديم الطلب بنجاح!', 'success');
        // توجيه المستخدم إلى صفحة الطلبات
        showScreen('ordersScreen');
        if (typeof loadBuyerOrdersWithTimeline === 'function') {
            loadBuyerOrdersWithTimeline();
        }
    } catch (err) {
        showToast(err.message, 'error');
        console.error(err);
    } finally {
        showLoading(false);
    }
}

function closeDirectCheckout() {
    document.getElementById('directCheckoutModal').classList.remove('active');
}

// ========== إضافة إلى السلة من التفاصيل ==========
function addToCartFromDetail() {
    if (!appState.currentProduct) return;
    const qty = window._detailQuantity || 1;
    addToCartWithQuantity(appState.currentProduct.id, qty);
}

function buyNowFromDetail() {
    openDirectCheckout();
}

async function addToCartWithQuantity(productId, quantity) {
    if (!appState.user) {
        showToast('يجب تسجيل الدخول أولاً', 'warning');
        return;
    }
    showLoading(true);
    try {
        const { data: existing } = await supabaseClient
            .from('cart_items')
            .select('id, quantity')
            .eq('user_id', appState.user.id)
            .eq('product_id', productId)
            .maybeSingle();
        if (existing) {
            await supabaseClient
                .from('cart_items')
                .update({ quantity: existing.quantity + quantity })
                .eq('id', existing.id);
        } else {
            await supabaseClient
                .from('cart_items')
                .insert({
                    user_id: appState.user.id,
                    product_id: productId,
                    quantity: quantity,
                    created_at: new Date()
                });
        }
        const product = appState.products.find(p => p.id === productId);
        showToast(`تم إضافة ${product?.name || 'المنتج'} إلى السلة (${quantity})`, 'success');
        await updateCartBadgeFromDB();
        await loadCart();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ========== تحميل منتجات مشابهة ==========
function loadSimilarProductsInDetail(category, currentProductId, limit = 6) {
    const container = document.getElementById('similarProductsSectionDetail');
    if (!container) return;
    let similar = appState.products.filter(p => p.category === category && p.id !== currentProductId);
    similar = similar.slice(0, limit);
    const hasMore = appState.products.filter(p => p.category === category && p.id !== currentProductId).length > limit;
    let html = '';
    if (similar.length === 0) {
        html = `<div class="similar-products-header"><h3>منتجات مشابهة</h3><p style="color:#999;">لا توجد منتجات مشابهة</p></div>`;
    } else {
        html = `
            <div class="similar-products-header">
                <h3>منتجات مشابهة</h3>
                ${hasMore ? `<button class="explore-more-btn" onclick="exploreMore('${category}')"><i class="fas fa-compass"></i> استكشاف المزيد</button>` : ''}
            </div>
            <div class="similar-products-grid">
                ${similar.map(p => {
                    const imgUrl = p.images && p.images.length ? p.images[0] : (p.image_url || '');
                    const imgHtml = imgUrl ? `<img src="${imgUrl}" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<div>📦</div>';">` : '<div>📦</div>';
                    return `
                        <div class="similar-product-card" onclick="openProductDetail(appState.products.find(pr => pr.id === '${p.id}'))">
                            <div class="similar-product-image">${imgHtml}</div>
                            <div class="similar-product-info">
                                <div class="similar-product-name">${escapeHTML(p.name)}</div>
                                <div class="similar-product-price">${p.price} ج.م</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    container.innerHTML = html;
}

function exploreMore(category) {
    showScreen('marketScreen');
    const searchInput = document.getElementById('marketSearchInput');
    if (searchInput) {
        searchInput.value = category;
        filterMarketProducts(category);
    }
    showToast(`عرض منتجات من فئة: ${category}`, 'info');
}

// ========== تصدير الدوال ==========
window.openProductDetail = openProductDetail;
window.changeQuantity = changeQuantity;
window.changeMainImageByIndex = changeMainImageByIndex;
window.slideGallery = slideGallery;
window.toggleZoom = toggleZoom;
window.shareProduct = shareProduct;
window.loadProductReviews = loadProductReviews;
window.toggleReviews = toggleReviews;
window.addStickyActions = addStickyActions;
window.addToCartFromDetail = addToCartFromDetail;
window.buyNowFromDetail = buyNowFromDetail;
window.addToCartWithQuantity = addToCartWithQuantity;
window.loadSimilarProductsInDetail = loadSimilarProductsInDetail;
window.exploreMore = exploreMore;
window.openDirectCheckout = openDirectCheckout;
window.confirmDirectOrder = confirmDirectOrder;
window.closeDirectCheckout = closeDirectCheckout;