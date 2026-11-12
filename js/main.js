//===============================================================
// メニュー制御用の関数とイベント設定（※バージョン2026-4｜オーバーレイ対応版）
//===============================================================
$(function(){
  //-------------------------------------------------
  // 変数の宣言
  //-------------------------------------------------
  const $menubar = $('#menubar');
  const $menubarHdr = $('#menubar_hdr');
  const $overlay = $('#menubar-overlay');
  const breakPoint = 900;	// ここがブレイクポイント指定箇所です

  // ▼ここを切り替えるだけで 2パターンを使い分け！
  //   false → “従来どおり”
  //   true  → “ハンバーガーが非表示の間は #menubar も非表示”
  const HIDE_MENUBAR_IF_HDR_HIDDEN = false;

  // タッチデバイスかどうかの判定
  const isTouchDevice = ('ontouchstart' in window) ||
                       (navigator.maxTouchPoints > 0) ||
                       (navigator.msMaxTouchPoints > 0);

  //-------------------------------------------------
  // debounce(処理の呼び出し頻度を抑制) 関数
  //-------------------------------------------------
  function debounce(fn, wait) {
    let timerId;
    return function(...args) {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        fn.apply(this, args);
      }, wait);
    };
  }

  //-------------------------------------------------
  // メニューを閉じる共通関数
  // ※ハンバーガー解除・メニュー非表示・オーバーレイ非表示・
  //   noscroll解除・ドロップダウン閉じ を一括で行う
  //-------------------------------------------------
  function closeMenu() {
    $menubarHdr.removeClass('ham');
    $menubar.hide();
    $overlay.hide();
    $menubar.find('.ddmenu_parent ul').hide();
    $('body').removeClass('noscroll');
  }

  //-------------------------------------------------
  // メニューを開く共通関数
  //-------------------------------------------------
  function openMenu() {
    $menubarHdr.addClass('ham');
    $menubar.show();
    $overlay.show();
    $menubar.find('.ddmenu_parent ul').hide();
    if ($(window).width() < breakPoint) {
      $('body').addClass('noscroll');
    }
  }

  //-------------------------------------------------
  // ドロップダウン用の初期化関数
  //-------------------------------------------------
  function initDropdown($menu, isTouch) {
    // ドロップダウンメニューが存在するliにクラス追加
    $menu.find('ul li').each(function() {
      if ($(this).find('ul').length) {
        $(this).addClass('ddmenu_parent');
        $(this).children('a').addClass('ddmenu');
      }
    });

    // 子メニューは初期状態で閉じる（ちらつき防止）
    $menu.find('.ddmenu_parent ul').hide();

    // 万一の再初期化に備えてイベントを解除（多重バインド防止）
    $menu.find('.ddmenu').off('click.ddmenu');
    $menu.find('.ddmenu_parent').off('mouseenter.ddmenu mouseleave.ddmenu');

    //---------------------------------------------
    // ▼ブレイクポイント未満（開閉メニュー時）は
    //   PCでも「クリックで開閉」に統一（hover無効）
    //---------------------------------------------
    $menu.find('.ddmenu').on('click.ddmenu', function(e) {
      if (!isTouch && $(window).width() >= breakPoint) return; // PC大画面はhover運用

      e.preventDefault();
      e.stopPropagation();

      const $dropdownMenu = $(this).siblings('ul');
      if ($dropdownMenu.is(':visible')) {
        $dropdownMenu.hide();
      } else {
        $menu.find('.ddmenu_parent ul').hide(); // 他を閉じる
        $dropdownMenu.show();
      }
    });

    //---------------------------------------------
    // ▼PC大画面（breakPoint以上）のみ hover で開閉
    //---------------------------------------------
    $menu.find('.ddmenu_parent').on('mouseenter.ddmenu', function() {
      if (isTouch) return;
      if ($(window).width() < breakPoint) return; // 開閉メニュー時はhover無効
      $(this).children('ul').show();
    }).on('mouseleave.ddmenu', function() {
      if (isTouch) return;
      if ($(window).width() < breakPoint) return; // 開閉メニュー時はhover無効
      $(this).children('ul').hide();
    });
  }

  //-------------------------------------------------
  // ハンバーガーメニューでの開閉制御関数
  //-------------------------------------------------
  function initHamburger($hamburger) {
    let isAnimating = false;	// 連打防止用フラグ
    $hamburger.on('click', function() {
      if (isAnimating) return;	// アニメーション中は何もしない
      isAnimating = true;

      if ($(this).hasClass('ham')) {
        // 開いている → 閉じる
        closeMenu();
      } else {
        // 閉じている → 開く
        openMenu();
      }

      // メニューのCSSアニメーション(0.2s)完了後にロック解除
      setTimeout(function() { isAnimating = false; }, 300);
    });
  }

  //-------------------------------------------------
  // オーバーレイクリックでメニューを閉じる
  //-------------------------------------------------
  $overlay.on('click', function() {
    closeMenu();
  });

  //-------------------------------------------------
  // レスポンシブ時の表示制御 (リサイズ時)
  //-------------------------------------------------
  const handleResize = debounce(function() {
    const windowWidth = $(window).width();

    // bodyクラスの制御 (small-screen / large-screen)
    if (windowWidth < breakPoint) {
      $('body').removeClass('large-screen').addClass('small-screen');
    } else {
      $('body').removeClass('small-screen').addClass('large-screen');
      // PC表示になったら、ハンバーガー解除 + メニュー・オーバーレイを閉じる
      $menubarHdr.removeClass('ham');
      $menubar.find('.ddmenu_parent ul').hide();
      $overlay.hide();
      $('body').removeClass('noscroll');

      // ▼ #menubar を表示するか/しないかの切り替え
      if (HIDE_MENUBAR_IF_HDR_HIDDEN) {
        $menubarHdr.hide();
        $menubar.hide();
      } else {
        $menubarHdr.hide();
        $menubar.show();
      }
    }

    // スマホ(ブレイクポイント未満)のとき
    if (windowWidth < breakPoint) {
      $menubarHdr.show();
      if (!$menubarHdr.hasClass('ham')) {
        $menubar.hide();
        $overlay.hide();
        $('body').removeClass('noscroll');
      }
    }
  }, 200);

  //-------------------------------------------------
  // 初期化
  //-------------------------------------------------
  // 1) ドロップダウン初期化 (#menubar)
  initDropdown($menubar, isTouchDevice);

  // 2) ハンバーガーメニュー初期化 (#menubar_hdr)
  initHamburger($menubarHdr);

  // 3) レスポンシブ表示の初期処理 & リサイズイベント
  handleResize();
  $(window).on('resize', handleResize);

  //-------------------------------------------------
  // アンカーリンク(#)のクリックイベント
  //-------------------------------------------------
  $menubar.find('a[href*="#"]').on('click', function() {
    // ドロップダウンメニューの親(a.ddmenu)のリンクはメニューを閉じない
    if ($(this).hasClass('ddmenu')) return;

    // スマホ表示＆ハンバーガーが開いている状態なら閉じる
    if ($menubarHdr.is(':visible') && $menubarHdr.hasClass('ham')) {
      closeMenu();
    }
  });

  //-------------------------------------------------
  // 「header nav」など別メニューにドロップダウンだけ適用したい場合
  //-------------------------------------------------
  // 例：header nav へドロップダウンだけ適用（ハンバーガー連動なし）
  //initDropdown($('header nav'), isTouchDevice);
});


//===============================================================
// スムーススクロール（※バージョン2026-08-02）
// 通常タイプ / fixedヘッダー対応 切り替え版
//===============================================================
$(function() {

    //===========================================================
    // 設定
    //===========================================================
    // 'normal' ＝ 通常タイプ（固定ヘッダーなし）
    // 'fixed' ＝ fixedヘッダー対応
    var scrollType = 'normal';

    // fixedヘッダー時に位置計算に使う要素（※fixed版を使う際は必ずチェック。画面上部に貼り付くブロックを指定する。）
    // 例：'header' / '#header' / '.site-header'
    var fixedHeaderSelector = '#menubar';

    // ページ上部へ戻るボタンのセレクター
    var topButton = $('.pagetop');

    // ページトップボタン表示用のクラス名
    var scrollShow = 'pagetop-show';


    //===========================================================
    // fixedヘッダーぶんの補正値を取得
    //===========================================================
    function getHeaderOffset() {

        // 通常タイプなら補正なし
        if(scrollType !== 'fixed') {
            return 0;
        }

        // 指定要素を取得
        var $header = $(fixedHeaderSelector);

        // 要素がなければ補正なし
        if(!$header.length) {
            return 0;
        }

        // 画面上でのヘッダー下端位置を取得
        // 高さ + 上部の余白(topやmarginで見た目上ずれている分)も含めて見られる
        var rect = $header.get(0).getBoundingClientRect();

        // 念のためマイナスは0にする
        return Math.max(0, rect.bottom);
    }


    //===========================================================
    // スムーススクロール本体
    //===========================================================
    function smoothScroll(target) {

        var scrollTo = 0;

        // '#' の場合はページ最上部へ
        if(target === '#') {
            scrollTo = 0;

        } else {

            // スクロール先の要素を取得
            var $target = $(target);

            // 対象が存在しない場合は何もしない
            if(!$target.length) {
                return;
            }

            // 通常位置から、fixedヘッダー分を引く
            scrollTo = $target.offset().top - getHeaderOffset();

            // 0未満にならないように補正
            if(scrollTo < 0) {
                scrollTo = 0;
            }
        }

        // アニメーションでスムーススクロール
        $('html, body').animate({scrollTop: scrollTo}, 500);
    }

	//===========================================================
	// ページ内リンク / ページトップボタン
	//===========================================================
	$('a[href*="#"], .pagetop').click(function(e) {

		// ページトップボタン → 最上部へ
		if($(this).hasClass('pagetop')) {
			e.preventDefault();
			smoothScroll('#');
			return;
		}

		// このリンクのハッシュ（例 "#contact"）。<a>要素がURLを自動解決してくれる。
		var hash = this.hash;

		// href="#"（その場に止める）／ハッシュ無しの通常リンクは触らない
		if(!hash || hash === '#') {
			if(($(this).attr('href') || '') === '#') e.preventDefault();
			return;
		}

		// リンク先が「今いるページ」のときだけスムーススクロール。
		//   "#id" でも "service.html#id" でも、現在ページ＋ハッシュなら同一ページ扱い。
		//   別ページ・外部サイト宛てはそのまま遷移させ、読み込み後に下の「ハッシュ付きURLで開いた時」がスクロールする。
		if(this.host !== location.host || this.pathname !== location.pathname || this.search !== location.search) return;

		if($(hash).length) {
			e.preventDefault();
			smoothScroll(hash);
		}
	});

    //===========================================================
    // ページトップボタンの表示切り替え
    //===========================================================
    $(topButton).hide();

    $(window).scroll(function() {
        if($(this).scrollTop() >= 300) {
            $(topButton).fadeIn().addClass(scrollShow);
        } else {
            $(topButton).fadeOut().removeClass(scrollShow);
        }
    });


    //===========================================================
    // ハッシュ付きURLで開いた時
    //===========================================================
    if(window.location.hash) {
        $('html, body').scrollTop(0);

        setTimeout(function() {
            smoothScroll(window.location.hash);
        }, 500);
    }

});


//===============================================================
// シャボン玉（メイン画像）
//===============================================================
// ■写真
// ・images/bubble/ に bubble1.jpg, bubble2.jpg… の連番で入れると、自動で読み込みます（HTMLに書く必要はありません）。
// ・番号が途切れたところで読み込みを終わります（例：bubble1〜8があれば8枚）。
// ・写真は大きい玉から順に入ります（同じ大きさの玉の中ではランダム）。おすすめは6〜12枚です。
// ・フォルダやファイル名は、index.html の .bubbles の data-dir / data-name / data-ext で変更できます。
// ■イラスト（使う場合だけ）
// ・.bubbles に data-deco="deco" を書くと、deco1.png, deco2.png… の連番を、単色の玉の代わりに表示します（玉の色は付けず、イラストだけが浮かびます）。
// ■配置の切り替え（.mainimg に付けるclass）
// ・なし：キャッチのまわりに散らす／side：右に寄せる／ring：キャッチのまわりを回る／rise：下から昇る
// ■形の切り替え（.mainimg に付けるclass）
// ・なし：丸／square：角丸の四角／blob：ぷにぷに変形
// ■配置を固定する
// ・URLの末尾に ?fixed を付けると、毎回同じ配置になります。
(function () {
	const area = document.querySelector('.mainimg .bubbles');
	if (!area) return;
	const mainimg = area.closest('.mainimg');
	const text = mainimg.querySelector('.text');

	const dir = area.dataset.dir || 'images/bubble/';
	const photoName = area.dataset.name || 'bubble';
	const photoExt = area.dataset.ext || 'jpg';
	const decoName = area.dataset.deco || '';
	const decoExt = area.dataset.decoExt || 'png';
	const max = parseInt(area.dataset.max, 10) || 30;
	const colorCount = 6;

	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	let layoutType = 'scatter';
	['side', 'ring', 'rise'].forEach((name) => {
		if (mainimg.classList.contains(name)) layoutType = name;
	});
	if (layoutType === 'rise' && reduce) layoutType = 'scatter';

	//?fixed のときは毎回同じ乱数にする
	const fixed = /[?&]fixed(=|&|$)/.test(location.search);
	let seed = 20261104;
	const random = fixed ? function () {
		seed = (seed + 0x6D2B79F5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	} : Math.random;
	const rand = (min, max) => random() * (max - min) + min;
	const shuffle = (list) => {
		for (let i = list.length - 1; i > 0; i--) {
			const j = Math.floor(random() * (i + 1));
			[list[i], list[j]] = [list[j], list[i]];
		}
		return list;
	};

	/*配置のリスト
	x・yは中心の位置（%）、sは大きさ、最後の数字は写真の入る順番（1→2→3。0は写真なし）
	wideは横長の画面用、tallは縦長の画面用（同じ数・同じ順番で書く）*/
	const slots = {
		scatter: {
			wide: [
				[11, 28, 21, 1], [88, 31, 19, 1], [19, 78, 18, 1], [80, 75, 23, 1],
				[46, 11, 12, 2], [62, 89, 14, 2], [3, 54, 11, 2], [97, 50, 12, 2],
				[33, 89, 10, 3], [74, 21, 9, 3], [29, 17, 8.5, 3], [92, 91, 9, 3],
				[26, 50, 6, 0], [74, 46, 6.5, 0], [55, 76, 5, 0], [41, 78, 4.5, 0],
				[60, 27, 4.5, 0], [14, 52, 4, 0], [86, 47, 5, 0], [6, 92, 6, 0]
			],
			tall: [
				[18, 17, 30, 1], [82, 13, 26, 1], [22, 86, 30, 1], [80, 85, 32, 1],
				[52, 23, 14, 2], [50, 95, 15, 2], [93, 29, 12, 2], [7, 72, 12, 2],
				[38, 74, 9, 3], [64, 74, 9, 3], [6, 30, 9, 3], [94, 72, 10, 3],
				[36, 27, 6, 0], [70, 28, 7, 0], [50, 80, 5, 0], [22, 64, 5, 0],
				[80, 62, 5, 0], [50, 2, 6, 0], [4, 98, 6, 0], [96, 98, 6, 0]
			]
		},
		side: {
			wide: [
				[68, 30, 20, 1], [88, 64, 19, 1], [62, 74, 15, 1], [90, 20, 13, 1],
				[77, 50, 9, 2], [54, 44, 9, 2], [74, 92, 10, 2], [97, 40, 8, 3],
				[56, 14, 5, 0], [82, 8, 5, 0], [96, 88, 6, 0], [52, 90, 4, 0],
				[66, 56, 4, 0], [84, 38, 4, 0], [46, 94, 4, 0], [60, 60, 3, 0]
			],
			tall: [
				[26, 22, 40, 1], [76, 34, 32, 1], [84, 10, 20, 1], [14, 44, 16, 1],
				[50, 44, 12, 2], [94, 47, 10, 2], [52, 8, 10, 2], [44, 3, 8, 3],
				[44, 30, 5, 0], [62, 20, 5, 0], [96, 24, 5, 0], [34, 46, 4, 0],
				[88, 58, 4, 0], [10, 30, 4, 0], [60, 2, 4, 0], [30, 4, 5, 0]
			]
		},
		rise: {
			wide: [
				[8, 0, 20, 1], [52, 0, 22, 1], [90, 0, 19, 1], [30, 0, 15, 2],
				[72, 0, 17, 2], [63, 0, 11, 2], [20, 0, 10, 3], [42, 0, 9, 3],
				[82, 0, 10, 3], [96, 0, 8, 0], [3, 0, 7, 0], [36, 0, 6, 0],
				[58, 0, 6, 0], [77, 0, 5, 0], [14, 0, 5, 0], [48, 0, 4, 0],
				[88, 0, 5, 0], [68, 0, 7, 0]
			]
		}
	};
	slots.rise.tall = slots.rise.wide;

	//回る配置（ring）は、内側12個・外側8個。数字は写真の入る順番
	const ringInner = [1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2];
	const ringOuter = 8;

	const list = layoutType === 'ring'
		? ringInner.map((t) => [0, 0, 0, t]).concat(Array.from({ length: ringOuter }, () => [0, 0, 0, 0]))
		: slots[layoutType].wide;

	//玉を作る
	const bubbles = list.map((slot, i) => {
		const el = document.createElement('div');
		el.className = 'bubble color' + (Math.floor(random() * colorCount) + 1);
		el.innerHTML = '<div class="bubble-move"><div class="bubble-push"><div class="bubble-float"></div></div></div>';
		const float = el.querySelector('.bubble-float');
		float.style.setProperty('--dur', rand(7, 13).toFixed(1) + 's');
		float.style.setProperty('--delay', '-' + rand(0, 10).toFixed(1) + 's');
		float.style.setProperty('--dx', rand(-18, 18).toFixed(0) + 'px');
		float.style.setProperty('--dy', rand(-22, 22).toFixed(0) + 'px');
		area.appendChild(el);
		setTimeout(() => el.classList.add('is-show'), 150 + i * 70);
		return {
			el: el,
			move: el.querySelector('.bubble-move'),
			push: el.querySelector('.bubble-push'),
			float: float,
			tier: slot[3],
			phase: (i + rand(0, 0.6)) / list.length,
			x: 0, y: 0, r: 0
		};
	});

	//キャッチの位置（.bubbles の中での位置）
	function textBox(margin) {
		if (!text) return null;
		const a = area.getBoundingClientRect();
		const t = text.getBoundingClientRect();
		return { left: t.left - a.left - margin, right: t.right - a.left + margin, top: t.top - a.top - margin, bottom: t.bottom - a.top + margin };
	}
	function hitText(b, box) {
		if (!box) return false;
		const nx = Math.max(box.left, Math.min(b.x, box.right));
		const ny = Math.max(box.top, Math.min(b.y, box.bottom));
		return (b.x - nx) ** 2 + (b.y - ny) ** 2 < b.r ** 2;
	}

	//回る配置の大きさ
	let ring = null;

	//画面の縦横に合わせて位置と大きさを決める
	function layout() {
		const w = area.clientWidth;
		const h = area.clientHeight;
		const tall = w / h < 1;

		if (layoutType === 'ring') {
			const box = textBox(0);
			const big = Math.min(w, h) * (tall ? 0.24 : 0.2);
			const cx = box ? (box.left + box.right) / 2 : w / 2;
			const cy = box ? (box.top + box.bottom) / 2 : h / 2;
			const tw = box ? (box.right - box.left) / 2 : w * 0.25;
			const th = box ? (box.bottom - box.top) / 2 : h * 0.2;
			const rx = Math.min(tw + big * 0.75, w / 2 - big * 0.25);
			const ry = Math.min(th + big * 0.75, h / 2 - big * 0.2);
			ring = { cx: cx, cy: cy, rx: rx, ry: ry };
			bubbles.forEach((b, i) => {
				const size = i < ringInner.length ? big * (b.tier === 1 ? 1 : b.tier === 2 ? 0.72 : 0.34) : big * rand(0.22, 0.36);
				b.r = size / 2;
				b.el.style.width = size + 'px';
				b.el.style.height = size + 'px';
			});
			placeRing(0);
			return;
		}

		const set = tall ? slots[layoutType].tall : slots[layoutType].wide;
		const unit = tall ? w / 100 * (layoutType === 'rise' ? 1.4 : 1) : Math.min(w, h * 1.7) / 100;
		const box = layoutType === 'rise' ? null : textBox(14);
		bubbles.forEach((b, i) => {
			const size = set[i][2] * unit;
			b.r = size / 2;
			b.x = set[i][0] / 100 * w;
			b.y = layoutType === 'rise' ? h + b.r : set[i][1] / 100 * h;
			b.el.style.left = b.x + 'px';
			b.el.style.top = b.y + 'px';
			b.el.style.width = size + 'px';
			b.el.style.height = size + 'px';
			if (layoutType === 'rise') {
				const dur = 14 + set[i][2] * 0.9;
				b.move.style.setProperty('--rise-to', -(h + size * 1.2) + 'px');
				b.move.style.setProperty('--rise-dur', dur.toFixed(1) + 's');
				b.move.style.setProperty('--rise-delay', '-' + (dur * b.phase).toFixed(1) + 's');
			}
			b.el.classList.toggle('is-hidden', hitText(b, box));
		});
	}

	//縦長の画面では玉を隠さず、キャッチの文字に縁取りを付けて読めるようにする（CSSの「配置：回る」）
	function placeRing(time) {
		const box = area.clientWidth / area.clientHeight < 1 ? null : textBox(10);
		bubbles.forEach((b, i) => {
			const inner = i < ringInner.length;
			const n = inner ? ringInner.length : ringOuter;
			const k = inner ? i : i - ringInner.length;
			const speed = reduce ? 0 : (inner ? 1 : -0.6) * time / 90000;
			const angle = (k / n + (inner ? 0 : 0.5 / n) + speed) * Math.PI * 2;
			const scale = inner ? 1 : 1.38;
			b.x = ring.cx + Math.cos(angle) * ring.rx * scale;
			b.y = ring.cy + Math.sin(angle) * ring.ry * scale;
			b.el.style.left = b.x + 'px';
			b.el.style.top = b.y + 'px';
			b.el.classList.toggle('is-hidden', hitText(b, box));
		});
	}
	if (layoutType === 'ring' && !reduce) {
		const start = performance.now();
		const loop = (now) => {
			if (ring) placeRing(now - start);
			requestAnimationFrame(loop);
		};
		requestAnimationFrame(loop);
	}

	layout();
	if (document.fonts) document.fonts.ready.then(layout);
	let resizeTimer;
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(layout, 150);
	});

	//写真の入る順番：1の玉→2の玉→3の玉（同じ番号の中ではランダム）
	const photoQueue = [1, 2, 3].flatMap((t) => shuffle(bubbles.filter((b) => b.tier === t)));
	const used = new Set();

	//写真やイラストを入れるのは、直径がこれ以上の玉だけ（小さすぎると顔が分からないため）
	const minSize = 60;
	const minSizeDeco = 28;	//イラストはCSSで2倍に拡大するので、28px以上の玉に入れる

	function takeSlot(queue, min) {
		const ok = (b) => !used.has(b) && b.r * 2 >= min;
		let index = queue.findIndex((b) => ok(b) && !b.el.classList.contains('is-hidden'));
		if (index < 0) index = queue.findIndex(ok);
		if (index < 0) return null;
		const b = queue[index];
		used.add(b);
		return b;
	}

	function loadImages(name, ext, queue, className, n, done) {
		if (n > max) return done();
		const img = new Image();
		img.alt = '';
		img.onload = () => {
			const b = takeSlot(queue, className === 'is-deco' ? minSizeDeco : minSize);
			if (!b) return done();
			b.el.classList.add(className);
			b.float.appendChild(img);
			requestAnimationFrame(() => img.classList.add('is-loaded'));
			loadImages(name, ext, queue, className, n + 1, done);
		};
		img.onerror = done;
		img.src = dir + name + n + '.' + ext;
	}

	loadImages(photoName, photoExt, photoQueue, 'is-photo', 1, () => {
		if (!decoName) return;
		const decoQueue = shuffle(bubbles.filter((b) => b.tier === 0)).concat(photoQueue);
		loadImages(decoName, decoExt, decoQueue, 'is-deco', 1, () => {});
	});

	//カーソルが近づくと、玉が少しよける（マウスのある端末だけ）
	if (window.matchMedia('(hover: hover)').matches && !reduce) {
		let mouse = null;
		let ticking = false;
		const update = () => {
			ticking = false;
			bubbles.forEach((b) => {
				if (!mouse) {
					b.push.style.transform = '';
					return;
				}
				const rect = b.move.getBoundingClientRect();
				const dx = rect.left + rect.width / 2 - mouse.x;
				const dy = rect.top + rect.height / 2 - mouse.y;
				const dist = Math.sqrt(dx * dx + dy * dy) || 1;
				const range = rect.width / 2 + 140;
				if (dist < range) {
					const power = (1 - dist / range) * 36;
					b.push.style.transform = 'translate(' + (dx / dist * power).toFixed(1) + 'px,' + (dy / dist * power).toFixed(1) + 'px)';
				} else {
					b.push.style.transform = '';
				}
			});
		};
		const request = () => {
			if (!ticking) {
				ticking = true;
				requestAnimationFrame(update);
			}
		};
		mainimg.addEventListener('mousemove', (e) => {
			mouse = { x: e.clientX, y: e.clientY };
			request();
		});
		mainimg.addEventListener('mouseleave', () => {
			mouse = null;
			request();
		});
	}
})();

//===============================================================
// loadingをセッション中は一度だけ表示
//===============================================================
$(function() {
  // すでに訪問済み（同一セッション中）であれば、ローディングを表示しない
  if (sessionStorage.getItem('visited')) {
    $('#loading').hide(); // 直接非表示にする
  } else {
    // 初回訪問時は、ローディング表示後に"visited"フラグを立てる
    // CSSアニメーション時間を考慮し、3秒後にvisitedをセット
    setTimeout(function(){
      sessionStorage.setItem('visited', 'true');
    }, 3000);
  }
});
