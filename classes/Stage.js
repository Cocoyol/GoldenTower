/**
 * Clase que describe el escenario de juego y sus límites.
 */
const STAGE_MARGIN_BUFFER = 50;

class Stage {
    constructor(viewWidth, viewHeight, options = {}) {
        this.viewWidth = viewWidth;
        this.viewHeight = viewHeight;

        this.margin = this.normalizeMargin(options.margin ?? STAGE_MARGIN_BUFFER);

        const defaultBorder = {
            enabled: false,
            color: 'rgba(0, 196, 255, 0.50)',
            lineWidth: 2,
            dash: [10, 6],
            area: 'stage',
            inset: 0
        };

        this.border = { ...defaultBorder, ...(options.border || {}) };

        this.recalculateBounds();
    }

    /**
     * Normaliza la configuración de margen.
     */
    normalizeMargin(margin) {
        if (typeof margin === 'number') {
            return {
                top: margin,
                right: margin,
                bottom: margin,
                left: margin
            };
        }

        return {
            top: margin?.top ?? STAGE_MARGIN_BUFFER,
            right: margin?.right ?? STAGE_MARGIN_BUFFER,
            bottom: margin?.bottom ?? STAGE_MARGIN_BUFFER,
            left: margin?.left ?? STAGE_MARGIN_BUFFER
        };
    }

    /**
     * Recalcula los límites del escenario y la vista.
     */
    recalculateBounds() {
        const { top, right, bottom, left } = this.margin;

        this.stageBounds = {
            left: -left,
            right: this.viewWidth + right,
            top: -top,
            bottom: this.viewHeight + bottom
        };

        this.viewBounds = {
            left: 0,
            right: this.viewWidth,
            top: 0,
            bottom: this.viewHeight
        };

        this.stageWidth = this.stageBounds.right - this.stageBounds.left;
        this.stageHeight = this.stageBounds.bottom - this.stageBounds.top;

        this.stageCenter = {
            x: this.stageBounds.left + this.stageWidth / 2,
            y: this.stageBounds.top + this.stageHeight / 2
        };

        this.viewCenter = {
            x: this.viewBounds.left + this.viewWidth / 2,
            y: this.viewBounds.top + this.viewHeight / 2
        };
    }

    /**
     * Actualiza el tamaño visible del escenario.
     */
    updateViewSize(width, height) {
        this.viewWidth = width;
        this.viewHeight = height;
        this.recalculateBounds();
    }

    /**
     * Configura un nuevo margen para el escenario.
     */
    setMargin(margin) {
        this.margin = this.normalizeMargin(margin);
        this.recalculateBounds();
    }

    /**
     * Retorna los límites completos del escenario.
     */
    getStageBounds() {
        return { ...this.stageBounds };
    }

    /**
     * Retorna los límites visibles de la vista.
     */
    getViewBounds() {
        return { ...this.viewBounds };
    }

    /**
     * Retorna el ancho visible del escenario.
     */
    getViewWidth() {
        return this.viewWidth;
    }

    /**
     * Retorna la altura visible del escenario.
     */
    getViewHeight() {
        return this.viewHeight;
    }

    /**
     * Retorna el ancho total del escenario.
     */
    getStageWidth() {
        return this.stageWidth;
    }

    /**
     * Retorna la altura total del escenario.
     */
    getStageHeight() {
        return this.stageHeight;
    }

    /**
     * Retorna el centro de la vista.
     */
    getViewCenter() {
        return { ...this.viewCenter };
    }

    /**
     * Retorna el centro del escenario completo.
     */
    getStageCenter() {
        return { ...this.stageCenter };
    }

    /**
     * Retorna el margen aplicado en el escenario.
     */
    getMargin() {
        return { ...this.margin };
    }

    /**
     * Verifica si un punto está fuera de los límites del escenario.
     */
    isOutsideStage(x, y, extraBuffer = 0) {
        const buffer = extraBuffer ?? 0;
        const bounds = this.stageBounds;
        return x < bounds.left - buffer ||
            x > bounds.right + buffer ||
            y < bounds.top - buffer ||
            y > bounds.bottom + buffer;
    }

    /**
     * Limita una posición a los márgenes del escenario.
     */
    clampToStage(x, y, inset = 0) {
        const bounds = this.stageBounds;
        return {
            x: Utils.clamp(x, bounds.left + inset, bounds.right - inset),
            y: Utils.clamp(y, bounds.top + inset, bounds.bottom - inset)
        };
    }

    /**
     * Activa o desactiva el renderizado del borde del escenario.
     */
    setBorderEnabled(enabled) {
        this.border.enabled = enabled;
    }

    /**
     * Ajusta la configuración del borde del escenario.
     */
    setBorderOptions(options = {}) {
        this.border = { ...this.border, ...options };
    }

    /**
     * Dibuja el borde del escenario o la vista según configuración.
     */
    renderBorder(ctx, overrides = {}) {
        const config = { ...this.border, ...overrides };
        if (!config.enabled) {
            return;
        }

        const area = config.area === 'view' ? this.viewBounds : this.stageBounds;
        const inset = config.inset ?? 0;
        const width = area.right - area.left - inset * 2;
        const height = area.bottom - area.top - inset * 2;

        if (width <= 0 || height <= 0) {
            return;
        }

        ctx.save();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = config.lineWidth;

        if (config.dash && config.dash.length) {
            ctx.setLineDash(config.dash);
        } else {
            ctx.setLineDash([]);
        }

        ctx.strokeRect(area.left + inset, area.top + inset, width, height);
        ctx.restore();
    }
}
