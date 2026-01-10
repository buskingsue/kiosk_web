// =========================================
// 1. 데이터 설정
// =========================================
const menuData = [
    { id: 1, kor: "🥪 크로와상 샌드위치", eng: "Croissant Sandwich", price: 6200, imgKey: "sandwich" },
    { id: 2, kor: "🍗 치킨 샐러드", eng: "Chicken Salad", price: 5400, imgKey: "salad" },
    { id: 3, kor: "🥪 햄 샌드위치", eng: "Ham Sandwich", price: 5500, imgKey: "ham" },
    { id: 4, kor: "☕ 아이스 아메리카노", eng: "Iced Americano", price: 3500, imgKey: "coffee" },
    { id: 5, kor: "🍫 초코 블렌디드", eng: "Choco Blended", price: 5200, imgKey: "choco" },
    { id: 6, kor: "🍓 딸기 라떼", eng: "Strawberry Latte", price: 6800, imgKey: "strawberry" },
    { id: 7, kor: "🥤 딸기 스무디", eng: "Berry Smoothie", price: 6500, imgKey: "smoothie" },
    { id: 8, kor: "🍊 라임 에이드", eng: "Lime Ade", price: 4800, imgKey: "lime" },
    { id: 9, kor: "🍊 자몽 에이드", eng: "Grapefruit Ade", price: 4900, imgKey: "grapefruit" },
    { id: 10, kor: "🥝 키위 주스", eng: "Kiwi Juice", price: 5000, imgKey: "kiwi" }
];

// 각 메뉴의 수량을 관리하는 상태 객체
let cartState = menuData.map(item => ({ ...item, count: 0 }));

// =========================================
// 2. DOM 요소 가져오기
// =========================================
const menuGrid = document.getElementById('menu-grid');
const cartItemsContainer = document.getElementById('cart-items');
const emptyCartMsg = document.getElementById('empty-cart-msg');
const totalPriceEl = document.getElementById('total-price');
const orderBtn = document.getElementById('btn-order');

const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalMsg = document.getElementById('modal-msg');
const modalActions = document.getElementById('modal-actions');

// =========================================
// 3. 주요 함수
// =========================================

// 메뉴 리스트 렌더링 (초기 1회 실행)
function initMenu() {
    menuGrid.innerHTML = '';
    cartState.forEach((item, index) => {
        // 이미지 주소 생성 (placeholder 사용)
        const imgSrc = `https://placehold.co/200x200/F97316/FFFFFF?text=${item.eng.split(' ')[0]}`;

        const card = document.createElement('div');
        card.className = 'menu-card';
        card.innerHTML = `
            <img src="${imgSrc}" alt="${item.kor}" class="menu-img">
            <div class="menu-info">
                <h3>${item.kor}</h3>
                <p>${item.eng}</p>
                <span class="menu-price">${item.price.toLocaleString()}원</span>
            </div>
            <div class="qty-control">
                <button class="btn-qty" onclick="updateCount(${index}, -1)" ${item.count === 0 ? 'disabled' : ''} id="btn-minus-${index}">-</button>
                <span class="qty-val" id="qty-${index}">${item.count}</span>
                <button class="btn-qty" onclick="updateCount(${index}, 1)">+</button>
            </div>
        `;
        menuGrid.appendChild(card);
    });
}

// 수량 업데이트 함수
window.updateCount = function(index, change) {
    const item = cartState[index];
    
    // 수량 변경 (0 미만 방지)
    if (item.count + change >= 0) {
        item.count += change;
    }

    // DOM 업데이트 (전체 리렌더링 방지)
    document.getElementById(`qty-${index}`).textContent = item.count;
    document.getElementById(`btn-minus-${index}`).disabled = (item.count === 0);

    // 장바구니 및 총액 업데이트
    renderCart();
}

// 장바구니 렌더링
function renderCart() {
    cartItemsContainer.innerHTML = ''; // 초기화
    let total = 0;
    let hasItems = false;

    cartState.forEach(item => {
        if (item.count > 0) {
            hasItems = true;
            const priceSum = item.price * item.count;
            total += priceSum;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div>
                    <div class="c-name">${item.kor}</div>
                    <div class="c-detail">${item.price.toLocaleString()}원 × ${item.count}개</div>
                </div>
                <div class="c-total">${priceSum.toLocaleString()}원</div>
            `;
            cartItemsContainer.appendChild(cartItem);
        }
    });

    // 장바구니 비었을 때 처리
    if (!hasItems) {
        cartItemsContainer.appendChild(emptyCartMsg);
        emptyCartMsg.style.display = 'block';
    } else {
        emptyCartMsg.style.display = 'none'; // 이미 JS로 지워지긴 하지만 안전장치
    }

    totalPriceEl.textContent = `${total.toLocaleString()}원`;
}

// =========================================
// 4. 모달 관련 함수
// =========================================
function showModal(title, msg, type, callback) {
    modalTitle.textContent = title;
    modalMsg.innerHTML = msg.replace(/\n/g, '<br>');
    modalActions.innerHTML = '';

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn-modal btn-confirm';
    confirmBtn.textContent = '확인';
    
    if (type === 'confirm') {
        confirmBtn.textContent = '예';
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-modal btn-cancel';
        cancelBtn.textContent = '아니오';
        cancelBtn.onclick = closeModal;
        modalActions.appendChild(cancelBtn);
    }

    confirmBtn.onclick = () => {
        closeModal();
        if (callback) callback();
    };
    modalActions.appendChild(confirmBtn);

    modalOverlay.classList.remove('hidden');
}

function closeModal() {
    modalOverlay.classList.add('hidden');
}

// =========================================
// 5. 주문 로직
// =========================================
orderBtn.addEventListener('click', () => {
    const totalCount = cartState.reduce((sum, item) => sum + item.count, 0);
    const totalPrice = cartState.reduce((sum, item) => sum + (item.price * item.count), 0);

    if (totalCount === 0) {
        showModal('알림 🐯', '장바구니가 비어있습니다.<br>메뉴를 선택해주세요.', 'alert');
        return;
    }

    showModal(
        '주문 확인', 
        `총 ${totalCount}개 메뉴<br><b style="color:#F97316">${totalPrice.toLocaleString()}원</b> 결제하시겠습니까?`, 
        'confirm', 
        () => {
            // 주문 완료 처리
            showModal('주문 완료', '주문이 성공적으로 접수되었습니다!<br>호랑이 기운 받아가세요 🐯', 'alert', () => {
                // 초기화
                cartState.forEach((item, idx) => {
                    item.count = 0;
                    document.getElementById(`qty-${idx}`).textContent = 0;
                    document.getElementById(`btn-minus-${idx}`).disabled = true;
                });
                renderCart();
            });
        }
    );
});

// =========================================
// 6. 실행
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    renderCart(); // 초기 상태 렌더링
});
