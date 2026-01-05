'use client';

import React, { useRef, useEffect, useCallback } from 'react';

export interface TechnologyCategory {
  category: string;
  technologies: string[];
}

// EXAMPLE
// export const TECHNOLOGIES: TechnologyCategory[] = [
//   {
//       category: 'Frontend',
//       technologies: ['React', 'Next.js', 'TypeScript', 'Node.js', 'SCSS'],
//   },
//   {
//       category: 'Backend',
//       technologies: ['TypeScript', 'Python', 'FastAPI', 'SQLAlchemy', 'PostgreSQL'],
//   },
//   ...
// ];

interface TechnologiesSliderProps {
  technologies: TechnologyCategory[];
}

const CARD_WIDTH = 280;
const GAP = 16;
const CARD_WITH_GAP = CARD_WIDTH + GAP;
const AUTO_SCROLL_INTERVAL = 3000;
const AUTO_SCROLL_DELAY_AFTER_TOUCH = 2000;
const SLIDE_DURATION = 500;

export function TechnologiesSlider({ technologies }: TechnologiesSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Состояние перетаскивания
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  
  // Флаг, чтобы отличать тач от мыши (для гибридных устройств)
  const isTouchRef = useRef(false);

  const visualIndexRef = useRef(0);
  const autoScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const itemsCount = technologies.length;

  // --- ВЫЧИСЛЕНИЯ ПОЗИЦИЙ ---

  const getCenterOffset = useCallback(() => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.offsetWidth;
    return (containerWidth - CARD_WIDTH) / 2;
  }, []);

  const getPositionForIndex = useCallback((index: number) => {
    const centerOffset = getCenterOffset();
    return centerOffset - index * CARD_WITH_GAP;
  }, [getCenterOffset]);

  const setSliderPosition = useCallback((position: number, animate: boolean = false) => {
    if (!sliderRef.current) return;

    sliderRef.current.style.transition = animate 
      ? `transform ${SLIDE_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)` 
      : 'none';
    sliderRef.current.style.transform = `translateX(${position}px)`;
    currentXRef.current = position;

    // Очистка стиля transition после завершения анимации
    if (animate) {
      setTimeout(() => {
        if (sliderRef.current) {
          sliderRef.current.style.transition = 'none';
        }
      }, SLIDE_DURATION);
    }
  }, []);

  // --- ЛОГИКА БЕСКОНЕЧНОСТИ ---

  const checkAndAdjustPosition = useCallback(() => {
    if (!sliderRef.current || isDraggingRef.current) return;

    const currentVisualIndex = visualIndexRef.current;
    
    // Если вышли за пределы среднего набора, телепортируемся
    if (currentVisualIndex < itemsCount || currentVisualIndex >= itemsCount * 2) {
      const normalizedIndex = ((currentVisualIndex % itemsCount) + itemsCount) % itemsCount;
      const newVisualIndex = itemsCount + normalizedIndex;
      
      visualIndexRef.current = newVisualIndex;
      const newPosition = getPositionForIndex(newVisualIndex);
      setSliderPosition(newPosition, false);
    }
  }, [itemsCount, getPositionForIndex, setSliderPosition]);

  const goToVisualIndex = useCallback((visualIndex: number, animate: boolean = true) => {
    visualIndexRef.current = visualIndex;
    const position = getPositionForIndex(visualIndex);
    setSliderPosition(position, animate);

    if (animate) {
      setTimeout(() => {
        checkAndAdjustPosition();
      }, SLIDE_DURATION + 50);
    }
  }, [getPositionForIndex, setSliderPosition, checkAndAdjustPosition]);

  // --- АВТОСКРОЛЛ ---

  const startAutoScroll = useCallback(() => {
    if (autoScrollTimeoutRef.current) clearTimeout(autoScrollTimeoutRef.current);

    autoScrollTimeoutRef.current = setTimeout(() => {
      goToVisualIndex(visualIndexRef.current + 1, true);
      startAutoScroll();
    }, AUTO_SCROLL_INTERVAL);
  }, [goToVisualIndex]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
      autoScrollTimeoutRef.current = null;
    }
  }, []);

  const resumeAutoScroll = useCallback(() => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);

    resumeTimeoutRef.current = setTimeout(() => {
      startAutoScroll();
    }, AUTO_SCROLL_DELAY_AFTER_TOUCH);
  }, [startAutoScroll]);

  // --- УНИВЕРСАЛЬНАЯ ЛОГИКА DRAG & DROP (Touch + Mouse) ---

  const handleDragStart = useCallback((clientX: number) => {
    isDraggingRef.current = true;
    startXRef.current = clientX;
    stopAutoScroll();

    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, [stopAutoScroll]);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDraggingRef.current) return;

    const diff = clientX - startXRef.current;
    const basePosition = getPositionForIndex(visualIndexRef.current);
    
    setSliderPosition(basePosition + diff, false);
  }, [getPositionForIndex, setSliderPosition]);

  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;

    const currentPos = currentXRef.current;
    const centerOffset = getCenterOffset();
    // Находим ближайшую карточку
    const nearestVisualIndex = Math.round((centerOffset - currentPos) / CARD_WITH_GAP);
    
    goToVisualIndex(nearestVisualIndex, true);
    resumeAutoScroll();
  }, [getCenterOffset, goToVisualIndex, resumeAutoScroll]);

  // --- ОБРАБОТЧИКИ СОБЫТИЙ ---

  // Touch
  const onTouchStart = (e: React.TouchEvent) => {
    isTouchRef.current = true;
    handleDragStart(e.touches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };
  const onTouchEnd = () => handleDragEnd();

  // Mouse
  const onMouseDown = (e: React.MouseEvent) => {
    // Если устройство поддерживает тач, игнорируем мышь, чтобы не было двойных срабатываний
    if (isTouchRef.current) return;
    e.preventDefault(); // Предотвращаем выделение текста
    handleDragStart(e.clientX);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (isTouchRef.current) return;
    handleDragMove(e.clientX);
  };
  const onMouseUp = () => {
    if (isTouchRef.current) {
        isTouchRef.current = false;
        return;
    }
    handleDragEnd();
  };
  const onMouseLeave = () => {
     // Если курсор улетел за пределы компонента во время драга
     if (isDraggingRef.current) {
         onMouseUp();
     }
  };

  // --- ЭФФЕКТЫ ---

  // 1. Инициализация и автоскролл
  useEffect(() => {
    visualIndexRef.current = itemsCount;
    goToVisualIndex(itemsCount, false);
    startAutoScroll();

    return () => {
      stopAutoScroll();
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, [itemsCount, goToVisualIndex, startAutoScroll, stopAutoScroll]);

  // 2. Обработка изменения размера окна (Resize)
  useEffect(() => {
    const handleResize = () => {
        // При ресайзе пересчитываем позицию без анимации, чтобы центр сохранился
        const newPos = getPositionForIndex(visualIndexRef.current);
        setSliderPosition(newPos, false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getPositionForIndex, setSliderPosition]);

  // Тройной массив для бесшовности
  const duplicatedTechnologies = [
    ...technologies,
    ...technologies,
    ...technologies,
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'pan-y' }}
    >
      <div
        ref={sliderRef}
        className="flex gap-4"
        style={{
          width: 'max-content',
          willChange: 'transform',
        }}
        // Touch events
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        // Mouse events
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        {duplicatedTechnologies.map(({ category, technologies: techs }, index) => (
          <div
            key={`${category}-${index}`}
            className="bg-white rounded-2xl border border-[#cccccc] p-6 flex-shrink-0 select-none"
            style={{ width: `${CARD_WIDTH}px` }}
          >
            <h4 className="text-lg font-semibold mb-4 text-brand-black">
              {category}
            </h4>
            <div className="flex flex-wrap gap-2">
              {techs.map((tech, techIndex) => (
                <span
                  key={techIndex}
                  className="px-3 py-1.5 bg-brand-light rounded-lg text-sm font-medium text-brand-gray-700"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
