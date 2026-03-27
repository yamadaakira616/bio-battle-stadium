// src/components/StickerBookPage.jsx
import { useRef, useState } from 'react';
import { STICKERS } from '../data/stickers.js';

const MAX_STICKERS_PER_PAGE = 20;

// ページ背景カラー（5種）
const PAGE_BACKGROUNDS = [
  'linear-gradient(135deg, #fff0f5, #fce7f3)',
  'linear-gradient(135deg, #f0fdf4, #dcfce7)',
  'linear-gradient(135deg, #eff6ff, #dbeafe)',
  'linear-gradient(135deg, #fefce8, #fef9c3)',
  'linear-gradient(135deg, #f5f3ff, #ede9fe)',
];

export default function StickerBookPage({ pageIndex, placed, collection, onUpdate }) {
  const pageRef = useRef(null);
  const placedRef = useRef(placed);
  placedRef.current = placed;
  // dragging: { stickerId, fromTray, placedIndex, currentX, currentY }
  const [dragging, setDragging] = useState(null);
  const [selected, setSelected] = useState(null); // placed index
  const longPressTimer = useRef(null);

  const stickerMap = Object.fromEntries(STICKERS.map(s => [s.id, s]));
  const background = PAGE_BACKGROUNDS[pageIndex % PAGE_BACKGROUNDS.length];

  // ページ上の座標を 0-1 の割合に変換
  function toRelative(clientX, clientY) {
    const rect = pageRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0.5, y: 0.5 };
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
  }

  // トレイからのドラッグ開始
  function handleTrayPointerDown(e, stickerId) {
    e.preventDefault();
    const { clientX, clientY } = e;
    setDragging({ stickerId, fromTray: true, placedIndex: -1, currentX: clientX, currentY: clientY });
  }

  // 配置済みシールのドラッグ開始
  function handlePlacedPointerDown(e, placedIndex) {
    e.preventDefault();
    e.stopPropagation();
    const { clientX, clientY } = e;

    // 長押しで削除
    longPressTimer.current = setTimeout(() => {
      const newPlaced = placedRef.current.filter((_, i) => i !== placedIndex);
      onUpdate(newPlaced);
      setDragging(null);
      setSelected(null);
    }, 600);

    setSelected(placedIndex);
    setDragging({
      stickerId: placed[placedIndex].stickerId,
      fromTray: false,
      placedIndex,
      currentX: clientX,
      currentY: clientY,
    });
  }

  function handlePointerMove(e) {
    if (!dragging) return;
    clearTimeout(longPressTimer.current);
    setDragging(d => ({ ...d, currentX: e.clientX, currentY: e.clientY }));
  }

  function handlePointerUp(e) {
    clearTimeout(longPressTimer.current);
    if (!dragging) return;

    const { x, y } = toRelative(e.clientX, e.clientY);
    const rect = pageRef.current?.getBoundingClientRect();

    // ページ外にドロップした場合はキャンセル
    if (!rect || e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      setDragging(null);
      return;
    }

    if (dragging.fromTray) {
      // トレイ → ページへ新規配置
      if (placed.length < MAX_STICKERS_PER_PAGE) {
        onUpdate([...placed, { stickerId: dragging.stickerId, x, y, scale: 1.0 }]);
      }
    } else {
      // 既存シールを移動
      const newPlaced = placed.map((item, i) =>
        i === dragging.placedIndex ? { ...item, x, y } : item
      );
      onUpdate(newPlaced);
    }

    setDragging(null);
    setSelected(null);
  }

  // ピンチ（2本指でスケール変更）
  const touchStartRef = useRef(null);
  function handleTouchStart(e, placedIndex) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartRef.current = { placedIndex, dist: Math.hypot(dx, dy), scale: placed[placedIndex]?.scale ?? 1 };
    }
  }
  function handleTouchMove(e) {
    if (e.touches.length !== 2 || !touchStartRef.current) return;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    const scaleRatio = dist / touchStartRef.current.dist;
    const newScale = Math.max(0.3, Math.min(3.0, touchStartRef.current.scale * scaleRatio));
    const idx = touchStartRef.current.placedIndex;
    const newPlaced = placed.map((item, i) => i === idx ? { ...item, scale: newScale } : item);
    onUpdate(newPlaced);
  }
  function handleTouchEnd() {
    touchStartRef.current = null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* キャンバス */}
      <div
        ref={pageRef}
        style={{
          flex: 1,
          position: 'relative',
          background,
          borderRadius: 16,
          overflow: 'hidden',
          touchAction: 'none',
          userSelect: 'none',
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 配置済みシール */}
        {placed.map((item, i) => {
          const sticker = stickerMap[item.stickerId];
          if (!sticker) return null;
          const size = 64 * item.scale;
          return (
            <div
              key={`${item.stickerId}-${i}`}
              style={{
                position: 'absolute',
                left: `calc(${item.x * 100}% - ${size / 2}px)`,
                top: `calc(${item.y * 100}% - ${size / 2}px)`,
                width: size,
                height: size,
                cursor: 'grab',
                outline: selected === i ? '2px dashed #ec4899' : 'none',
                borderRadius: 8,
                zIndex: selected === i ? 10 : 1,
              }}
              onPointerDown={e => handlePlacedPointerDown(e, i)}
              onTouchStart={e => handleTouchStart(e, i)}
            >
              <img
                src={sticker.imagePath}
                alt={sticker.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                draggable={false}
              />
            </div>
          );
        })}

        {/* ドラッグ中のゴースト */}
        {dragging && (() => {
          const sticker = stickerMap[dragging.stickerId];
          if (!sticker) return null;
          return (
            <img
              src={sticker.imagePath}
              alt={sticker.name}
              style={{
                position: 'fixed',
                left: dragging.currentX - 40,
                top: dragging.currentY - 40,
                width: 80,
                height: 80,
                objectFit: 'contain',
                pointerEvents: 'none',
                opacity: 0.85,
                zIndex: 100,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
              }}
              draggable={false}
            />
          );
        })()}

        {placed.length === 0 && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#d1d5db', fontSize: '0.9rem', fontWeight: 'bold', pointerEvents: 'none',
          }}>
            下のシールをドラッグしてはろう！
          </div>
        )}
      </div>

      {/* シールトレイ */}
      <div style={{
        height: 88,
        overflowX: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        background: 'white',
        borderTop: '2px solid #fbcfe8',
        touchAction: 'pan-x',
      }}>
        {collection.length === 0 ? (
          <div style={{ color: '#9ca3af', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
            ガチャでシールを集めよう！
          </div>
        ) : (
          collection.map(id => {
            const sticker = stickerMap[id];
            if (!sticker) return null;
            return (
              <div
                key={id}
                style={{
                  flexShrink: 0,
                  width: 64,
                  height: 64,
                  cursor: 'grab',
                  touchAction: 'none',
                }}
                onPointerDown={e => handleTrayPointerDown(e, id)}
              >
                <img
                  src={sticker.imagePath}
                  alt={sticker.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  draggable={false}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
