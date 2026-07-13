// ========== فتح تفاصيل المنتج ==========
function openProductDetail(product) {
    appState.currentProduct = product;
    const container = document.getElementById('productDetailContent');
    if (!container) return;

    // تجهيز الصور
    const images = (product.images && Array.isArray(product.images) && product.images.length) 
        ? product.images 
        : (product.image_url ? [product.image_url] : []);
    const mainImage = images.length ? images[0] : '';

    // بناء معرض الصور المصغرة
    let galleryHtml = '';
    if (images.length > 1) {
        galleryHtml = `<div class="product-gallery-thumbs">`;
        images.forEach((img, idx) => {
            galleryHtml += `<img src="${img}" class="gallery-thumb" data-img="${img}" 
                            onclick="changeMainImage(this)" 
                            style="border-color: ${idx === 0 ? '#D4AF37' : 'transparent'};">
                            `;
        });
        galleryHtml += `</div>`;
    }

    // تقييم وهمي
    const rating = 4.5;
    const ratingStars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    const reviewCount = 127;

    const sellerName = product.seller_name || 'بائع معتمد';

    container.innerHTML = `
        <div class="product-detail-wrapper">
            <!-- قسم الصورة -->
            <div class="product-detail-image-section">
                <div class="product-main-image-container">
                    <img src="${mainImage}" id="detailMainImage" alt="${escapeHTML(product.name)}" 
                         onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\"no-image\">📦</div>';">
                </div>
                ${galleryHtml}
            </div>

            <!-- قسم المعلومات -->
            <div class="product-detail-info-section">
                <h1 class="product-detail-name">${escapeHTML(product.name)}</h1>
                
                <div class="product-detail-meta">
                    <div class="product-rating-row">
                        <span class="stars">${ratingStars}</span>
                        <span class="rating-count">(${reviewCount} تقييم)</span>
                    </div>
                    <span class="seller-badge verified">✓ بائع معتمد</span>
                </div>

                <div class="product-detail-price">
                    <span class="price-main">${product.price.toLocaleString()} ج.م</span>
                    ${product.discount ? `<span class="price-original">${(product.price / (1 - product.discount/100)).toFixed(0)} ج.م</span>
                                         <span class="discount-badge">خصم ${product.discount}%</span>` : ''}
                </div>

                <div class="product-detail-description">
                    <p>${escapeHTML(product.description || 'لا يوجد وصف متاح لهذا المنتج.')}</p>
                </div>

                <!-- أزرار الإجراءات -->
                <div class="product-detail-actions desktop-actions">
                    <button class="add-to-cart-btn" onclick="addToCartFromDetail()">
                        <i class="fas fa-cart-plus"></i> إضافة إلى السلة
                    </button>
                    <button class="buy-now-btn" onclick="buyNowFromDetail()">
                        <i class="fas fa-bolt"></i> شراء الآن
                    </button>
                </div>

                <!-- مواصفات المنتج -->
                <div class="product-specifications">
                    <h3>مواصفات المنتج</h3>
                    <div class="spec-grid">
                        <div class="spec-item"><span class="spec-label">التصنيف</span><span class="spec-value">${product.category || 'عام'}</span></div>
                        <div class="spec-item"><span class="spec-label">المخزون</span><span class="spec-value">${product.stock || 'متوفر'}</span></div>
                        <div class="spec-item"><span class="spec-label">الحالة</span><span class="spec-value">جديد</span></div>
                    </div>
                </div>

                <!-- تقييمات العملاء -->
                <div class="product-reviews">
                    <h3>تقييمات العملاء</h3>
                    <div class="reviews-list">
                        <div class="review-item">
                            <div class="review-avatar"><i class="fas fa-user"></i></div>
                            <div class="review-content">
                                <div class="review-name">أحمد محمد</div>
                                <div class="review-stars">★★★★★</div>
                                <p class="review-text">منتج رائع جداً، أنصح به بشدة.</p>
                                <div class="review-date">منذ 3 أيام</div>
                            </div>
                        </div>
                        <div class="review-item">
                            <div class="review-avatar"><i class="fas fa-user"></i></div>
                            <div class="review-content">
                                <div class="review-name">سارة علي</div>
                                <div class="review-stars">★★★★☆</div>
                                <p class="review-text">جودة جيدة، لكن السعر مرتفع قليلاً.</p>
                                <div class="review-date">منذ أسبوع</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- منتجات مشابهة -->
        <div id="similarProductsSectionDetail" class="similar-products-section"></div>
    `;

    // تحميل المنتجات المشابهة
    loadSimilarProductsInDetail(product.category, product.id);

    // إظهار الشاشة
    showScreen('productDetailScreen');

    // بعد ظهور الشاشة، نضبط الأزرار المثبتة في الأسفل (للهواتف)
    setTimeout(() => {
        addStickyActions();
    }, 100);
}

// ========== تغيير الصورة الرئيسية ==========
function changeMainImage(el) {
    const mainImg = document.getElementById('detailMainImage');
    if (!mainImg) return;
    mainImg.src = el.dataset.img;
    document.querySelectorAll('.gallery-thumb').forEach(t => t.style.borderColor = 'transparent');
    el.style.borderColor = '#D4AF37';
}

// ========== إضافة الأزرار المثبتة في الأسفل (للهواتف) ==========
function addStickyActions() {
    const existing = document.querySelector('.sticky-actions-mobile');
    if (existing) existing.remove();

    const desktopActions = document.querySelector('.product-detail-actions.desktop-actions');
    if (!desktopActions) return;

    // ننسخ محتوى الأزرار
    const buttonsHTML = desktopActions.innerHTML;

    const stickyDiv = document.createElement('div');
    stickyDiv.className = 'sticky-actions-mobile';
    stickyDiv.innerHTML = buttonsHTML;

    const wrapper = document.querySelector('.product-detail-wrapper');
    if (wrapper) wrapper.appendChild(stickyDiv);

    // نربط الأحداث
    const addBtn = stickyDiv.querySelector('.add-to-cart-btn');
    const buyBtn = stickyDiv.querySelector('.buy-now-btn');
    if (addBtn) addBtn.onclick = addToCartFromDetail;
    if (buyBtn) buyBtn.onclick = buyNowFromDetail;
}

// ========== تحميل منتجات مشابهة ==========
function loadSimilarProductsInDetail(category, currentProductId, limit = 6) {
    const container = document.getElementById('similarProductsSectionDetail');
    if (!container) return;

    let similar = appState.products.filter(p => p.category === category && p.id !== currentProductId);
    similar = similar.slice(0, limit);

    if (similar.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div class="similar-products-header">
            <h3>منتجات مشابهة</h3>
        </div>
        <div class="similar-products-grid" id="similarProductsGridDetail">
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

// ========== دوال الإضافة والشراء ==========
function addToCartFromDetail() {
    if (appState.currentProduct) {
        addToCart(appState.currentProduct.id);
        showToast('تمت الإضافة إلى السلة', 'success');
    }
}

function buyNowFromDetail() {
    if (appState.currentProduct) {
        addToCart(appState.currentProduct.id);
        showScreen('cartScreen');
    }
}

// تصدير الدوال
window.openProductDetail = openProductDetail;
window.changeMainImage = changeMainImage;
window.loadSimilarProductsInDetail = loadSimilarProductsInDetail;
window.addToCartFromDetail = addToCartFromDetail;
window.buyNowFromDetail = buyNowFromDetail;
window.addStickyActions = addStickyActions;