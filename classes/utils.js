/**
 * Utilidades y funciones auxiliares
 */

class Utils {
    /**
     * Genera un color aleatorio en formato hexadecimal
     */
    static randomColor() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
            '#F8B500', '#FF1493', '#00CED1', '#FF6347'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Genera un número aleatorio entre min y max
     */
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Genera un entero aleatorio entre min y max (inclusivo)
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Calcula la distancia entre dos puntos
     */
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calcula el ángulo entre dos puntos
     */
    static angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    /**
     * Limita un valor entre min y max
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Mapea un valor de un rango a otro
     */
    static map(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    /**
     * Genera vértices para un polígono regular
     */
    static generatePolygonVertices(sides, radius, centerX = 0, centerY = 0) {
        const vertices = [];
        const angleStep = (Math.PI * 2) / sides;
        
        for (let i = 0; i < sides; i++) {
            const angle = angleStep * i - Math.PI / 2; // Empezar desde arriba
            vertices.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            });
        }
        
        return vertices;
    }

    /**
     * Genera vértices para un polígono irregular
     */
    static generateIrregularPolygon(sides, minRadius, maxRadius, centerX = 0, centerY = 0) {
        const vertices = [];
        const angleStep = (Math.PI * 2) / sides;
        
        for (let i = 0; i < sides; i++) {
            const angle = angleStep * i + Utils.random(-angleStep * 0.2, angleStep * 0.2);
            const radius = Utils.random(minRadius, maxRadius);
            vertices.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            });
        }
        
        return vertices;
    }

    /**
     * Verifica si un punto está dentro de un círculo
     */
    static pointInCircle(px, py, cx, cy, radius) {
        return Utils.distance(px, py, cx, cy) <= radius;
    }

    /**
     * Dibuja un polígono con efecto glow
     */
    static drawPolygonWithGlow(ctx, vertices, color, glowIntensity = 1) {
        ctx.save();
        
        // Glow effect
        if (glowIntensity > 0) {
            ctx.shadowBlur = 20 * glowIntensity;
            ctx.shadowColor = color;
        }
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++) {
            ctx.lineTo(vertices[i].x, vertices[i].y);
        }
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Dibuja un círculo con efecto glow
     */
    static drawCircleWithGlow(ctx, x, y, radius, color, glowIntensity = 1) {
        ctx.save();
        
        // Glow effect
        if (glowIntensity > 0) {
            ctx.shadowBlur = 20 * glowIntensity;
            ctx.shadowColor = color;
        }
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
