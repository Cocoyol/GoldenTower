/**
 * Sistema de partículas para efectos visuales
 */
class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    /**
     * Crea partículas desde una posición
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {string} color - Color de las partículas
     * @param {Array} vertices - Vértices de la forma (para polígonos)
     * @param {number} radius - Radio (para círculos)
     * @param {string} shape - Tipo de forma
     */
    emit(x, y, color, vertices = null, radius = null, shape = 'circle') {
        const particleCount = Utils.randomInt(3, 6);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Utils.random(1, 3);
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                vertices: vertices,
                radius: radius,
                shape: shape,
                life: 1.0, // 0 a 1
                decay: Utils.random(0.02, 0.04),
                size: Utils.random(0.3, 0.6), // Escala de tamaño
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: Utils.random(-0.2, 0.2)
            });
        }
    }

    /**
     * Actualiza todas las partículas
     */
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Actualizar posición
            p.x += p.vx;
            p.y += p.vy;
            
            // Actualizar rotación
            p.rotation += p.rotationSpeed;
            
            // Reducir vida
            p.life -= p.decay;
            
            // Eliminar partículas muertas
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Dibuja todas las partículas
     */
    render(ctx) {
        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            
            const size = p.size * p.life; // Reducir tamaño con la vida
            
            if (p.shape === 'circle' && p.radius) {
                const r = p.radius * size;
                Utils.drawCircleWithGlow(ctx, 0, 0, r, p.color, p.life);
            } else if (p.vertices) {
                // Escalar vértices
                const scaledVertices = p.vertices.map(v => ({
                    x: v.x * size,
                    y: v.y * size
                }));
                Utils.drawPolygonWithGlow(ctx, scaledVertices, p.color, p.life);
            }
            
            ctx.restore();
        }
    }

    /**
     * Limpia todas las partículas
     */
    clear() {
        this.particles = [];
    }
}
