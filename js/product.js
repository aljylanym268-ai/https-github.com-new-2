// =============================================================
// product.js – صفحة تفاصيل المنتج بتصميم احترافي (Amazon-style)
// =============================================================

// ========== فتح تفاصيل المنتج بالتصميم الجديد ==========
async function openProductDetail(product) {
    if (!product) return;
    appState.currentProduct = product;

    // جلب المراجعات
    const reviews = await loadProductReviews(product.id);
    const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 0;

    // تجهيز قائمة الصور (carousel)
    let allImages = [];
    if (product.animated_image) allImages.push(product.animated_image);
    if (product.image_url && !allImages.includes(product.image_url)) allImages.push(product.image_url);
    if (product.images && Array.isArray(product.images)) {
        product.images.forEach(img => {
            if (!allImages.includes(img)) allImages.push(img);
        });
    }
    if (allImages.length === 0) allImages.push(''); // صورة افتراضية

    // تخزين الصور في حالة عامة للاستخدام في carousel
    window._productImages = allImages;
    window._currentSlide = 0;

    const container = document.getElementById('productDetailContent');
    if (!container) return;

    // ===== بناء هيكل الصفحة الجديد =====
    container.innerHTML = `
        <div class="product-detail-wrapper-v2" id="productDetailWrapper">

            <!-- 1. اسم المنتج -->
            <h1 class="product-detail-name-v2">${escapeHTML(product.name)}</h1>

            <!-- 2. التقييم بالنجوم مع عدد التقييمات -->
            <div class="product-rating-summary-v2">
                <span class="stars-v2">${generateStarRating(avgRating)}</span>
                <span class="rating-value-v2">${avgRating.toFixed(1)}</span>
                <span class="rating-count-v2">(${reviews.length} تقييم)</span>
                ${product.seller_name ? `<span class="seller-badge-v2 verified">✓ ${escapeHTML(product.seller_name)}</span>` : ''}
            </div>

            <!-- 3. وصف المنتج بالكامل -->
            <div class="product-description-full-v2">
                <p>${escapeHTML(product.description || 'لا يوجد وصف متاح لهذا المنتج.')}</p>
            </div>

            <!-- 4. معرض الصور المتحرك (Carousel) -->
            <div class="product-carousel-wrapper-v2" id="productCarousel">
                <div class="carousel-container-v2" id="carouselContainer">
                    ${allImages.map((img, idx) => `
                        <div class="carousel-slide-v2 ${idx === 0 ? 'active' : ''}" data-index="${idx}">
                            ${img ? (img.match(/\.(mp4|webm|mov|avi)$/i) ? `
                                <video controls autoplay loop muted playsinline style="width:100%; height:100%; object-fit:contain;">
                                    <source src="${img}" type="video/mp4">
                                    <source src="${img}" type="video/webm">
                                    متصفحك لا يدعم الفيديو.
                                </video>
                            ` : `
                                <img src="${img}" alt="${escapeHTML(product.name)}" loading="lazy"
                                     onclick="openImageZoom('${img}')"
                                     onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\"no-image\">📦</div>';">
                            `) : '<div class="no-image">📦</div>'}
                        </div>
                    `).join('')}
                </div>

                <!-- أزرار التنقل (تظهر فقط في حالة وجود أكثر من صورة) -->
                ${allImages.length > 1 ? `
                    <button class="carousel-btn-v2 prev" onclick="prevSlide()"><i class="fas fa-chevron-right"></i></button>
                    <button class="carousel-btn-v2 next" onclick="nextSlide()"><i class="fas fa-chevron-left"></i></button>
                ` : ''}

                <!-- نقاط المؤشر (dots) -->
                ${allImages.length > 1 ? `
                    <div class="carousel-dots-v2" id="carouselDots">
                        ${allImages.map((_, idx) => `
                            <span class="dot-v2 ${idx === 0 ? 'active' : ''}" data-index="${idx}" onclick="goToSlide(${idx})"></span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>

            <!-- 5. السعر والكمية والأزرار (أسفل المعرض) -->
            <div class="product-actions-v2">
                <div class="product-price-v2">
                    <span class="price-current-v2">${(product.price * 1).toLocaleString()} ج.م</span>
                    ${product.discount ? `
                        <span class="price-original-v2">${(product.price / (1 - product.discount/100)).toFixed(0)} ج.م</span>
                        <span class="discount-badge-v2">خصم ${product.discount}%</span>
                    ` : ''}
                </div>
                <div class="product-stock-v2 ${(product.stock > 0) ? 'in-stock' : 'out-of-stock'}">
                    ${(product.stock > 0) ? '✅ متوفر' : '❌ غير متوفر'}
                </div>
                <div class="product-quantity-v2">
                    <label>الكمية:</label>
                    <div class="quantity-selector-v2">
                        <button class="qty-btn-v2" onclick="changeQuantityV2(-1)">−</button>
                        <span id="detailQuantityV2">1</span>
                        <button class="qty-btn-v2" onclick="changeQuantityV2(1)">+</button>
                    </div>
                    <span id="totalPriceDisplayV2" class="total-price-v2">
                        الإجمالي: ${product.price.toLocaleString()} ج.م
                    </span>
                </div>
                <div class="product-buttons-v2">
                    <button class="buy-now-btn-v2" onclick="openDirectCheckout()">
                        <i class="fas fa-bolt"></i> شراء الآن
                    </button>
                    <button class="add-to-cart-btn-v2" onclick="addToCartFromDetail()">
                        <i class="fas fa-cart-plus"></i> إضافة إلى السلة
                    </button>
                    <button class="share-btn-v2" onclick="shareProduct()" title="مشاركة">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>

            <!-- 7. تقييمات العملاء -->
            <div class="product-reviews-v2" id="productReviewsV2">
                <h3 class="reviews-title-v2">
                    <i class="fas fa-star" style="color:#f5a623;"></i> 
                    تقييمات العملاء 
                    <span class="reviews-avg-v2">(${avgRating.toFixed(1)} من 5)</span>
                </h3>
                <div class="reviews-list-v2" id="reviewsListV2">
                    ${reviews.length ? reviews.map(r => `
                        <div class="review-item-v2">
                            <div class="review-avatar-v2">
                                ${r.user_image ? `<img src="${r.user_image}" alt="${escapeHTML(r.user_name)}">` : `<i class="fas fa-user"></i>`}
                            </div>
                            <div class="review-content-v2">
                                <div class="review-header-v2">
                                    <span class="review-name-v2">${escapeHTML(r.user_name || 'مستخدم')}</span>
                                    <span class="review-stars-v2">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                                </div>
                                <p class="review-text-v2">${escapeHTML(r.comment)}</p>
                                <span class="review-date-v2">${new Date(r.created_at).toLocaleDateString('ar-EG')}</span>
                            </div>
                        </div>
                    `).join('') : '<div class="no-reviews-v2">لا توجد تقييمات لهذا المنتج بعد. كن أول من يقيم!</div>'}
                </div>
            </div>

            <!-- 8. منتجات مشابهة (بطاقات أفقية قابلة للتمرير) -->
            <div class="similar-products-v2" id="similarProductsV2">
                <h3 class="similar-title-v2">منتجات مشابهة</h3>
                <div class="similar-scroll-v2" id="similarScrollV2">
                    <!-- سيتم ملؤها بواسطة JavaScript -->
                </div>
            </div>

        </div>
    `;

    // تهيئة الـ Carousel (السحب باللمس والأسهم)
    initCarousel();

    // تحميل المنتجات المشابهة
    loadSimilarProductsV2(product.category, product.id);

    // عرض الشاشة
    showScreen('productDetailScreen');

    // إضافة الأزرار المثبتة للجوال (ستظهر تلقائياً)
    setTimeout(() => addStickyActionsV2(), 100);
}

// ========== دوال الـ Carousel ==========

function initCarousel() {
    const container = document.getElementById('carouselContainer');
    if (!container) return;

    // السحب باللمس
    let startX = 0;
    let isDragging = false;

    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });

    container.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const diff = startX - e.touches[0].clientX;
        if (Math.abs(diff) > 50) {
            isDragging = false;
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    });

    container.addEventListener('touchend', () => {
        isDragging = false;
    });

    // دعم السحب بالفأرة (للحاسوب)
    let mouseDown = false;
    let mouseStartX = 0;

    container.addEventListener('mousedown', (e) => {
        mouseDown = true;
        mouseStartX = e.clientX;
    });

    container.addEventListener('mouseup', (e) => {
        if (!mouseDown) return;
        mouseDown = false;
        const diff = mouseStartX - e.clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    });

    container.addEventListener('mouseleave', () => {
        mouseDown = false;
    });
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide-v2');
    const dots = document.querySelectorAll('.dot-v2');
    if (!slides.length) return;

    // تحديث الشرائح
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });

    // تحديث النقاط
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

    window._currentSlide = index;
}

function nextSlide() {
    const total = window._productImages ? window._productImages.length : 0;
    if (total <= 1) return;
    let newIndex = (window._currentSlide + 1) % total;
    goToSlide(newIndex);
}

function prevSlide() {
    const total = window._productImages ? window._productImages.length : 0;
    if (total <= 1) return;
    let newIndex = (window._currentSlide - 1 + total) % total;
    goToSlide(newIndex);
}

// ========== تكبير الصورة ==========
function openImageZoom(imageUrl) {
    if (!imageUrl) return;
    // نفتح الصورة في مودال
    const modal = document.getElementById('imageZoomModal');
    if (!modal) {
        // إنشاء المودال إذا لم يكن موجوداً
        const newModal = document.createElement('div');
        newModal.id = 'imageZoomModal';
        newModal.className = 'image-zoom-modal';
        newModal.onclick = function(e) {
            if (e.target === this) this.classList.remove('active');
        };
        newModal.innerHTML = `
            <div class="image-zoom-content">
                <img src="${imageUrl}" alt="صورة مكبرة" id="zoomImage">
                <button class="close-zoom-btn" onclick="document.getElementById('imageZoomModal').classList.remove('active')">×</button>
            </div>
        `;
        document.body.appendChild(newModal);
    }
    const img = document.getElementById('zoomImage');
    if (img) img.src = imageUrl;
    modal.classList.add('active');
}

// ========== دوال الكمية ==========
function changeQuantityV2(delta) {
    const qtySpan = document.getElementById('detailQuantityV2');
    const totalSpan = document.getElementById('totalPriceDisplayV2');
    if (!qtySpan || !appState.currentProduct) return;
    let qty = parseInt(qtySpan.textContent) + delta;
    if (qty < 1) qty = 1;
    if (appState.currentProduct.stock && qty > appState.currentProduct.stock) {
        showToast('الكمية المطلوبة تتجاوز المخزون المتاح', 'warning');
        return;
    }
    qtySpan.textContent = qty;
    window._detailQuantity = qty;
    const price = appState.currentProduct.price;
    totalSpan.textContent = `الإجمالي: ${(price * qty).toLocaleString()} ج.م`;
}

// ========== دوال مساعدة ==========
function generateStarRating(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '★' : '') + '☆'.repeat(empty);
}

// ========== تحميل المنتجات المشابهة (بطاقات أفقية) ==========
function loadSimilarProductsV2(category, currentProductId, limit = 10) {
    const container = document.getElementById('similarScrollV2');
    if (!container) return;

    let similar = appState.products.filter(p => p.category === category && p.id !== currentProductId);
    // ترتيب عشوائي
    similar = similar.sort(() => Math.random() - 0.5).slice(0, limit);

    if (similar.length === 0) {
        container.innerHTML = '<p style="color:#999; text-align:center; padding:20px;">لا توجد منتجات مشابهة</p>';
        return;
    }

    container.innerHTML = similar.map(p => {
        const imgUrl = p.images && p.images.length ? p.images[0] : (p.image_url || '');
        const imgHtml = imgUrl ? `<img src="${imgUrl}" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<div>📦</div>';">` : '<div>📦</div>';
        return `
            <div class="similar-card-v2" onclick="openProductDetail(appState.products.find(pr => pr.id === '${p.id}'))">
                <div class="similar-card-image-v2">${imgHtml}</div>
                <div class="similar-card-info-v2">
                    <div class="similar-card-name-v2">${escapeHTML(p.name)}</div>
                    <div class="similar-card-price-v2">${p.price} ج.م</div>
                </div>
            </div>
        `;
    }).join('');
}

// ========== الأزرار المثبتة للجوال ==========
function addStickyActionsV2() {
    const existing = document.querySelector('.sticky-actions-v2');
    if (existing) existing.remove();

    // نأخذ الأزرار من القسم الرئيسي
    const wrapper = document.querySelector('.product-buttons-v2');
    if (!wrapper) return;

    const sticky = document.createElement('div');
    sticky.className = 'sticky-actions-v2';
    sticky.innerHTML = wrapper.innerHTML;
    // إعادة ربط الأحداث
    const buyBtn = sticky.querySelector('.buy-now-btn-v2');
    if (buyBtn) buyBtn.onclick = openDirectCheckout;
    const addBtn = sticky.querySelector('.add-to-cart-btn-v2');
    if (addBtn) addBtn.onclick = addToCartFromDetail;
    const shareBtn = sticky.querySelector('.share-btn-v2');
    if (shareBtn) shareBtn.onclick = shareProduct;

    document.querySelector('.product-detail-wrapper-v2').appendChild(sticky);
}

// ========== إعادة تعريف الدوال القديمة للتوافق ==========
// (نحتفظ بالدوال القديمة للاستخدام في أماكن أخرى)

window.openProductDetail = openProductDetail;
window.goToSlide = goToSlide;
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.openImageZoom = openImageZoom;
window.changeQuantityV2 = changeQuantityV2;
window.loadSimilarProductsV2 = loadSimilarProductsV2;
window.addStickyActionsV2 = addStickyActionsV2;
window.generateStarRating = generateStarRating;

// ========== دوال الشراء المباشر وإضافة للسلة (نفس السابق) ==========
// (تم تضمينها من قبل، لكن نكررها هنا للاكتمال)

function openDirectCheckout() {
    if (!appState.user) {
        showToast('يجب تسجيل الدخول أولاً', 'warning');
        return;
    }
    if (!appState.currentProduct) {
        showToast('حدث خطأ، الرجاء المحاولة مرة أخرى', 'error');
        return;
    }
    const userData = appState.userData || {};
    document.getElementById('directName').value = userData.name || '';
    document.getElementById('directPhone').value = userData.phone || '';
    document.getElementById('directAddress').value = userData.address || '';
    document.getElementById('directGovernorate').value = userData.governorate || 'قنا';
    document.getElementById('directCity').value = userData.center || '';
    document.getElementById('directNotes').value = '';
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
        const deliveryFee = 20;
        await createOrder(
            product.id,
            quantity,
            totalPrice + deliveryFee,
            product.user_id,
            name,
            phone,
            address,
            city,
            deliveryFee
        );
        document.getElementById('directCheckoutModal').classList.remove('active');
        showToast('تم تقديم الطلب بنجاح!', 'success');
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

function addToCartFromDetail() {
    if (!appState.currentProduct) return;
    const qty = window._detailQuantity || 1;
    addToCartWithQuantity(appState.currentProduct.id, qty);
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

// ========== تحميل المراجعات (نفس السابق) ==========
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

// تصدير الدوال العامة
window.openDirectCheckout = openDirectCheckout;
window.confirmDirectOrder = confirmDirectOrder;
window.closeDirectCheckout = closeDirectCheckout;
window.addToCartFromDetail = addToCartFromDetail;
window.addToCartWithQuantity = addToCartWithQuantity;
window.shareProduct = shareProduct;
window.loadProductReviews = loadProductReviews;