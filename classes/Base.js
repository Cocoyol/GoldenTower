/**
 * Clase que representa la base de lanzamiento (torre dorada)
 */
class Base {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.rings = 5; // Número de círculos concéntricos
        this.maxRadius = 25;
        this.colors = ['#FFD700', '#FFA500', '#FF8C00'];
    }

    /**
     * Dibuja la base (círculos concéntricos)
     */
    render(ctx) {
        ctx.save();
        
        // Dibujar anillos de fuera hacia adentro
        for (let i = this.rings; i > 0; i--) {
            const radius = (this.maxRadius / this.rings) * i;
            const colorIndex = i % this.colors.length;
            
            // Efecto glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.colors[colorIndex];
            
            ctx.fillStyle = this.colors[colorIndex];
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Borde
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        // Centro brillante
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#FFD700';
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Obtiene la posición de la base
     */
    getPosition() {
        return { x: this.x, y: this.y };
    }
}
