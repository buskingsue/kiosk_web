// 메뉴 아이템 10개를 생성합니다
const items = Array.from({ length: 12 }, (_, i) => {
    // 한글 이름 배열
    const korNames = [
        "🥪크로와상 샌드위치", "🍗치킨 🥗샐러드", "🥪햄 샌드위치",
        "아이스 ☕아메리카노", "🍫아이스 초코 블랜드", "🍓딸기 밀크티 라떼",
        "🍓🍓딸기 스무디", "🍊오렌지 라임 에이드", "🍊자몽 에이드", "🥝키위 쥬스", "초코 아이스크림", "베이글"
    ];
    // 영어 이름 배열
    const engNames = [
        "croissant sandwich", "chicken salad", "ham sandwich",
        "iced americano", "iced choco blended", "strawberry milk tea latte",
        "strawberry smoothie", "orange lime ade", "grapefruit ade",
        "kiwi juice", "choco icecream", "bagle"
    ];
    // 가격 배열
    const prices = [6200, 5400, 5500, 3500, 5200, 6800, 6500, 4800, 4900, 5000, 3400, 2500];
    // 이미지 경로를 001 ~ 010 형태로 포맷팅
    const img_url = `menu/${(i + 1).toString().padStart(3, '0')}.png`;
    // 가격 문자열로 포맷팅 (쉼표 포함)
    const price_str = prices[i].toLocaleString();
    // 위치 계산 (열, 행, 좌표값)
    const col = i % 3, row = Math.floor(i / 3);
    const x = 40 + col * 230;
    const y = 40 + row * 310;
    const rect = [x, y, x + 190, y + 280];
    // 객체 리턴
    return {
        kor: korNames[i],
        eng: engNames[i],
        price: prices[i],
        price_str,
        count: 0,
        img_url,
        rect
    };
});

// DOM 요소 가져오기
const menuItemsContainer = document.getElementById('menu-items-container');
const orderSummaryContainer = document.getElementById('order-summary-container');
const totalDisplay = document.getElementById('total-display');
const orderButton = document.getElementById('order-button');
const emptyCartMessage = document.getElementById('empty-cart-message');

// 커스텀 모달 관련 요소 가져오기
const modalOverlay = document.getElementById('custom-modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalButtons = document.getElementById('modal-buttons');

// 모달을 보여주는 함수
function showModal(title, message, type, onConfirm = null) {
    modalTitle.textContent = title; // 제목 설정
    modalMessage.textContent = message; // 메시지 설정
    modalButtons.innerHTML = ''; // 버튼 초기화

    if (type === 'alert') {
        const okButton = document.createElement('button');
        okButton.textContent = '✅️확인';
        okButton.className = 'modal-btn confirm';
        okButton.onclick = () => hideModal();
        modalButtons.appendChild(okButton);
    } else if (type === 'confirm') {
        const confirmButton = document.createElement('button');
        confirmButton.textContent = '✅️예';
        confirmButton.className = 'modal-btn confirm';
        confirmButton.onclick = () => {
            hideModal();
            if (onConfirm) onConfirm(true);
        };
        modalButtons.appendChild(confirmButton);

        const cancelButton = document.createElement('button');
        cancelButton.textContent = '❌아니오';
        cancelButton.className = 'modal-btn cancel';
        cancelButton.onclick = () => {
            hideModal();
            if (onConfirm) onConfirm(false);
        };
        modalButtons.appendChild(cancelButton);
    }

    modalOverlay.classList.add('show'); // 모달 표시
}

// 모달 숨김
function hideModal() {
    modalOverlay.classList.remove('show');
}

// 메뉴 아이템을 화면에 렌더링
function renderMenuItems() {
    menuItemsContainer.innerHTML = ''; // 초기화

    items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'menu-item';

        // 이미지 생성 및 오류 처리
        const img = document.createElement('img');
        img.src = item.img_url;
        img.alt = item.kor;
        img.onerror = () => {
            img.onerror = null;
            img.src = 'https://placehold.co/150x150/CCCCCC/333333?text=Image+Not+Found';
        };

        // 이름, 가격, 수량 컨트롤 생성
        itemDiv.appendChild(img);

        itemDiv.innerHTML += `
            <p class="item-name-kor">${item.kor}</p>
            <p class="item-name-eng">${item.eng}</p>
            <p class="item-price">${item.price.toLocaleString()}원</p>
            <div class="quantity-controls">
                <button class="quantity-btn" data-action="decrease" data-index="${index}" aria-label="수량 감소" ${item.count === 0 ? 'disabled' : ''}>-</button>
                <span class="quantity-display" id="count-${index}">${item.count}</span>
                <button class="quantity-btn" data-action="increase" data-index="${index}" aria-label="수량 증가">+</button>
            </div>
        `;

        menuItemsContainer.appendChild(itemDiv);
    });
}

// 주문 요약 렌더링
function renderOrderSummary() {
    orderSummaryContainer.innerHTML = '';
    let totalCount = 0;
    let totalPrice = 0;
    let hasItemsInCart = false;

    items.forEach(item => {
        if (item.count > 0) {
            hasItemsInCart = true;
            const orderItemDiv = document.createElement('div');
            orderItemDiv.className = 'order-item';
            orderItemDiv.innerHTML = `
                <p class="order-item-name">✔ ${item.kor} × ${item.count}개</p>
                <p class="order-item-price">= ${(item.price * item.count).toLocaleString()}원</p>
            `;
            orderSummaryContainer.appendChild(orderItemDiv);
            totalCount += item.count;
            totalPrice += item.price * item.count;
        }
    });

    if (!hasItemsInCart) {
        emptyCartMessage.style.display = 'block';
        orderSummaryContainer.appendChild(emptyCartMessage);
    } else {
        emptyCartMessage.style.display = 'none';
    }

    totalDisplay.textContent = `총 ${totalCount}개 주문 : ${totalPrice.toLocaleString()}원`;
}

// 수량 증가 함수
function increaseCount(index) {
    items[index].count++;
    updateQuantityDisplay(index);
    renderOrderSummary();
}

// 수량 감소 함수
function decreaseCount(index) {
    if (items[index].count > 0) {
        items[index].count--;
        updateQuantityDisplay(index);
        renderOrderSummary();
    }
}

// 수량 표시 및 버튼 상태 업데이트
function updateQuantityDisplay(index) {
    const countSpan = document.getElementById(`count-${index}`);
    if (countSpan) {
        const count = items[index].count;
        countSpan.textContent = count;

        const minusButton = countSpan.previousElementSibling;
        if (minusButton?.dataset.action === 'decrease') {
            minusButton.disabled = count === 0;
        }

        const plusButton = countSpan.nextElementSibling;
        if (plusButton?.dataset.action === 'increase') {
            plusButton.disabled = false; // 필요시 최대 수량 제한 가능
        }
    }
}

// 주문 확인 함수
function confirmOrder() {
    const totalCount = items.reduce((sum, item) => sum + item.count, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.count, 0);

    if (totalCount === 0) {
        showModal("호랑이 알림", "선택한 메뉴가 없습니다!", 'alert');
        return;
    }

    showModal("주문 확인 🐯", `총 ${totalCount}개, ${totalPrice.toLocaleString()}원 주문하시겠습니까?`, 'confirm', (result) => {
        if (result) {
            items.forEach(item => item.count = 0); // 주문 후 수량 초기화
            renderMenuItems();
            renderOrderSummary();
            showModal("주문 완료", "호랑이처럼 빠르게 주문이 완료되었습니다!\n감사합니다 🐯", 'alert');
        }
    });
}

// 이벤트 위임 방식으로 버튼 클릭 처리
menuItemsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('quantity-btn')) {
        const index = parseInt(event.target.dataset.index);
        const action = event.target.dataset.action;
        if (action === 'increase') increaseCount(index);
        else if (action === 'decrease') decreaseCount(index);
    }
});

// 페이지 로딩 완료 시 초기 렌더링
document.addEventListener('DOMContentLoaded', () => {
    renderMenuItems();
    renderOrderSummary();
    orderButton.addEventListener('click', confirmOrder);
});



















